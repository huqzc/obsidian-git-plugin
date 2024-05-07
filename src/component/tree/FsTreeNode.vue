<script setup lang="ts">
import { IFsTreeNodeEmitter, IFsTreeNodeProps, ITreeNode } from './types'
import collapse from './asset/chevron-right.svg'
import expand from './asset/chevron-down.svg'
import { ref, watch } from 'vue'

const props = defineProps<IFsTreeNodeProps>()
const emit = defineEmits<IFsTreeNodeEmitter>()

const handleToggleExpand = (node: ITreeNode) => {
  emit('toggleExpanded', node)
}

const handleCheckChange = (node: ITreeNode) => {
  emit('onCheck', node)
}

const input = ref()

watch(
  () => props.node.isHalfChecked,
  newValue => {
    if (input.value) {
      console.log('input.value = ', input.value)
      input.value.indeterminate = true
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div
    class="fs-node-content"
    :style="{ paddingLeft: `${(props.node.level + 1) * 16}px` }"
  >
    <span class="fs-node-icon">
      <img
        v-if="!props.node.isLeaf"
        :src="props.isExpanded ? expand : collapse"
        alt=""
        @click="handleToggleExpand(props.node)"
      />
    </span>
    <input
      v-if="props.showCheckbox"
      type="checkbox"
      ref="input"
      :checked="props.node.isChecked"
      :indeterminate="props.node.isHalfChecked"
      @change="handleCheckChange(props.node)"
    />
    <span>{{ props.node.name }}({{ props.node.level }})</span>
  </div>
</template>

<style scoped>
.fs-node-content {
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
}

.fs-node-icon {
  width: 20px;
  height: 20px;
}

.fs-node-icon > img {
  width: 16px;
  height: 16px;
}
</style>
