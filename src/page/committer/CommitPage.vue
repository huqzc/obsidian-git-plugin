<script setup lang="ts">
import FsTree from '../../component/tree/FsTree.vue'
import { computed, onMounted } from 'vue'

const props = defineProps({
  gitFiles: Object
})

const changed = computed(() => {
  if (props.gitFiles) {
    return props.gitFiles.unchanged
  }
  return []
})

const untracked = computed(() => {
  if (props.gitFiles) {
    return props.gitFiles.untracked
  }
  return []
})

</script>

<template>
  <div>
    <fs-tree
      :data="untracked"
      show-checkbox
      key-field="key"
      label-field="name"
    />
  </div>
</template>

<style scoped></style>
