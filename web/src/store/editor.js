import { defineStore } from "pinia";
import { Parser } from "@dbml/core";
import { throttle } from "quasar";
import { useChartStore } from "./chart";
import { encodeDbmlForUrl, decodeDbmlFromUrl } from "../utils/storageUtils";


export const useEditorStore = defineStore("editor", {
  state: () => ({
    source: {
      format: "dbml",
      text: "",
      markers: {
        selection: {
          start: {
            row: null,
            col: null
          },
          end: {
            row: null,
            col: null
          }
        }
      }
    },
    database: {
      schemas: [
        {
          tables: [],
          refs: []
        }
      ]
    },
    preferences: {
      dark: false,
      theme: "dracula",
      split: 25.0
    },
    parserError: {
      location: {
        start: { row: undefined, col: undefined },
        end: { row: undefined, col: undefined }
      },
      type: undefined,
      message: undefined
    }
  }),
  getters: {
    findField(state) {
      return ((fieldId) => {
        let field = null;
        for (const schema of state.database.schemas) {
          for (const table of schema.tables) {
            field = table.fields.find(f => f.id === fieldId);
            if (field) {
              return field;
            }
          }
        }
        return undefined;
      });
    },
    findTable(state) {
      return ((tableId) => {
        let table = null;
        for (const schema of state.database.schemas) {
          table = schema.tables.find(t => t.id === tableId);
          if (table)
            return table;
        }
        return undefined;
      });
    },
    getSourceFormat(state) {
      return state.source.format;
    },
    getSourceText(state) {
      return state.source.text;
    },
    getDatabase(state) {
      return state.database;
    },
    getPositions(state) {
      return state.positions;
    },
    getPreferences(state) {
      return state.preferences;
    },
    getDark(state) {
      return state.preferences.dark;
    },
    getTheme(state) {
      return state.preferences.theme;
    },
    getSplit(state) {
      return state.preferences.split;
    },
    save(state) {
      return {
        source: state.source,
        preferences: state.preferences
      }
    },
    getShareableUrl(state) {
      const encodedDbml = encodeDbmlForUrl(state.source.text);
      // Use route param format as expected by the router
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      return `${baseUrl}#/editor/${encodedDbml}`;
    }
  },
  actions: {
    load(state) {
      this.clearDatabase();
      this.$patch(state);
      this.clearParserError();
      this.updateDatabase();
    },
    updateSourceText(sourceText) {
      if (sourceText === this.source.text) return;
      this.$patch({
        source: {
          text: sourceText
        }
      });
    },
    updatePositions(positions) {
      this.$patch({
        positions: positions
      });
    },
    clearDatabase() {
      this.database = {
        schemas: [
          {
            tableGroups: [],
            tables: [],
            refs: []
          }
        ]
      };
      this.clearParserError();
    },
    updateDatabase() {
      console.log("updating database...");
      try {
        const database = Parser.parse(this.source.text, this.source.format);
        database.normalize();
        this.database = database;
        this.clearParserError();
        console.log("updated database");
        const chart = useChartStore();
        chart.loadDatabase(database);
      } catch (e) {
        // do nothing
        console.error(e);
        this.updateParserError(e);
      }
    },
    updatePreferences(preferences) {
      this.$patch({
        preferences: preferences
      });
    },
    updateDark(dark) {
      this.$patch({
        preferences: {
          dark: dark
        }
      });
    },
    updateTheme(theme) {
      this.$patch({
        preferences: {
          theme
        }
      });
    },
    updateSplit(split) {
      this.$patch({
        preferences: {
          split
        }
      });
    },
    updateSelectionMarker(start, end) {
      this.$patch({
        source: {
          markers: {
            selection: {
              start: start,
              end: end
            }
          }
        }
      });
    },
    updateScale(scale) {
      this.$patch({
        positions: {
          scale: scale
        }
      });
    },
    updateTranslation(translation) {
      this.$patch({
        positions: {
          translation: translation
        }
      });
    },
    clearParserError() {
      this.updateParserError(undefined);
    },
    updateParserError(err) {
      if (err) {
        this.$patch({
          parserError: {
            location: {
              start: { row: err.location.start.line - 1, col: err.location.start.column - 1 },
              end: { row: err.location.end.line - 1, col: err.location.end.column - 1 }
            },
            type: 'error',
            message: err.message
          }
        });
      } else {
        this.$patch({
          parserError: undefined
        });
      }
    },
    loadFromUrlParameter(encodedDbml) {
      if (!encodedDbml) {
        console.log('No encoded DBML parameter found');
        return;
      }
      
      console.log('=== URL Parameter Loading Debug ===');
      console.log('1. Input parameter:', encodedDbml.substring(0, 50) + '...', 'Length:', encodedDbml.length);
      console.log('2. Current source text before:', this.source.text.substring(0, 50) + '...');
      
      try {
        const dbmlText = decodeDbmlFromUrl(encodedDbml);
        console.log('3. Decode result:', dbmlText ? 'Success' : 'Empty', 'Length:', dbmlText?.length);
        
        if (dbmlText && dbmlText.trim()) {
          console.log('4. Decoded DBML preview:', dbmlText.substring(0, 100) + '...');
          console.log('5. Setting source text...');
          
          // Force update the state directly to ensure reactivity
          this.$patch({
            source: {
              ...this.source,
              text: dbmlText
            }
          });
          
          console.log('6. Source text after update:', this.source.text.substring(0, 50) + '...');
          console.log('7. Updating database...');
          this.updateDatabase();
          console.log('8. URL parameter loading complete. Database schema count:', this.database.schemas?.[0]?.tables?.length || 0);
        } else {
          console.warn('Decoded DBML is empty or whitespace only. Raw decode result:', JSON.stringify(dbmlText));
        }
      } catch (e) {
        console.error('Failed to load DBML from URL parameter:', e);
        console.error('Stack trace:', e.stack);
      }
    }
  }
});
