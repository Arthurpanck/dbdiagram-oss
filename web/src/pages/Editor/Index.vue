<template>
  <q-page>
    <q-splitter v-model="split"
                :limits="[10,75]"
                class="editor-wrapper">
      <template #before>
        <dbml-editor ref="editorRef"
                     class="db-code-editor"
                     v-model:source="sourceText"
        />
      </template>
      <template #after>
        <dbml-graph
          class="db-graph-view"
          :schema="schema"
        />
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import DbmlEditor from 'components/DbmlEditor'
  import DbmlGraph from 'components/DbmlGraph'
  import { useEditorStore } from 'src/store/editor'
  import { debounce, throttle, useQuasar } from 'quasar'
  import { useRoute } from 'vue-router'

  const editorRef = ref(null)
  const editor = useEditorStore()
  const q = useQuasar()
  const route = useRoute()

  const sourceText = computed({
    get: () => {
      const text = editor.getSourceText;
      console.log('sourceText computed get called, current text length:', text.length);
      console.log('sourceText preview:', text.substring(0, 50) + '...');
      return text;
    },
    set: (src) => {
      console.log('sourceText computed set called with:', src.substring(0, 50) + '...');
      editor.updateSourceText(src);
    }
  })

  const preferences = computed({
    get: () => editor.getPreferences,
    set: (src) => editor.updatePreferences(src)
  })
  const split = computed({
    get: () => editor.getSplit,
    set: (src) => editor.updateSplit(src)
  })

  const schema = computed(() => editor.getDatabase?.schemas?.find(x => true))

  // Function to load DBML from URL parameters
  const loadFromUrl = () => {
    console.log('=== loadFromUrl called ===')
    console.log('Route params:', route.params)
    console.log('Route query:', route.query)
    console.log('Route path:', route.path)
    console.log('Route fullPath:', route.fullPath)
    
    // Check for route params first (primary method - existing behavior)
    let encodedDbml = route.params.encodedDbml
    
    // Fallback: If no route params, check query parameters (for compatibility)
    if (!encodedDbml) {
      encodedDbml = route.query.editor
    }
    
    console.log('Final encodedDbml:', encodedDbml ? encodedDbml.substring(0, 30) + '...' : 'null')
    
    if (encodedDbml) {
      console.log('Loading DBML from URL...', encodedDbml.substring(0, 20) + '...')
      editor.loadFromUrlParameter(encodedDbml)
      
      // Force update the editor component if it exists
      nextTick(() => {
        console.log('=== After nextTick ===')
        console.log('Store text after load:', editor.getSourceText.length, 'chars')
        console.log('Computed sourceText:', sourceText.value.length, 'chars')
        if (editorRef.value) {
          console.log('Editor component exists, trying to force update')
          // Try to force the editor to refresh
          editorRef.value.$forceUpdate?.();
        } else {
          console.log('Editor component ref not available')
        }
      })
    } else {
      console.log('No DBML parameter found in URL - this is normal for empty editor')
    }
  }

  onMounted(() => {
    console.log('=== Editor mounted ===')
    console.log('Initial route:', route.fullPath)
    
    // Multiple attempts to ensure loading works
    nextTick(() => {
      console.log('=== First attempt (nextTick) ===')
      loadFromUrl()
    })
    
    // Backup attempt after a short delay
    setTimeout(() => {
      console.log('=== Backup attempt (setTimeout 100ms) ===')
      loadFromUrl()
    }, 100)
    
    // Final attempt after longer delay
    setTimeout(() => {
      console.log('=== Final attempt (setTimeout 500ms) ===')
      loadFromUrl()
    }, 500)
  })

  // Watch for URL changes to reload parameters
  watch(() => [route.params.encodedDbml, route.query.editor], (newVal, oldVal) => {
    console.log('=== Route watcher triggered ===')
    console.log('New values:', newVal)
    console.log('Old values:', oldVal)
    loadFromUrl()
  }, { immediate: false })

  // Watch store changes to detect if the problem is in reactivity
  watch(() => editor.getSourceText, (newText, oldText) => {
    console.log('=== Store sourceText changed ===')
    console.log('Old text length:', oldText?.length || 0)
    console.log('New text length:', newText?.length || 0)
    console.log('New text preview:', newText?.substring(0, 50) + '...')
  }, { immediate: true })
</script>

<style scoped>
  .editor-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
