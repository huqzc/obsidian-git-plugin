<script setup lang="ts">
import { IFsTreeNodeEmitter, IFsTreeNodeProps, ITreeNode } from './types'
import collapse from '../asset/chevron-right.svg'
import expand from '../asset/chevron-down.svg'
import { ref, watch } from 'vue'
import FsCheckbox from '../checkbox/FsCheckbox.vue'

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
      input.value.indeterminate = true
    }
  },
  {
    immediate: true
  }
)

const computedFontColor = (status: string) => {
  switch (status) {
    case 'added':
      return 'var(--color-green)'
    case 'modified':
      return 'var(--color-blue)'
    case 'deleted':
      return 'var(--color-base-40)'
    case 'untracked':
      return 'var(--color-red)'
    default:
      return 'inherit'
  }
}
</script>

<template>
  <div
    class="fs-node-content"
    :style="{ paddingLeft: `${props.node.level * 16}px` }"
  >
    <span
      class="fs-node-icon no-shrink"
      @click="handleToggleExpand(props.node)"
    >
      <img
        v-if="!props.node.isLeaf"
        :src="props.isExpanded ? expand : collapse"
        alt=""
      />
    </span>
    <fs-checkbox
      class="no-shrink"
      :checked="props.node.isChecked"
      :indeterminate="props.node.isHalfChecked"
      @change="handleCheckChange(props.node)"
    />
    <span
      class="fs-node-label ellipsis"
      :style="{
        fontWeight: props.node.level === 0 ? 'bold' : 'unset',
        color: computedFontColor(props.node.rawNode.status),
        textDecoration: props.node.rawNode.status === 'deleted' ? 'line-through' : 'unset'
      }"
    >
      {{ props.node.name }}
    </span>
    <span
      class="fs-node-label-extra ellipsis"
      v-if="props.node.fileNum"
      style="color: var(--color-base-40)"
    >
      {{ props.node.fileNum }} files</span
    >
  </div>
</template>

<style scoped>
.fs-node-content {
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.fs-node-icon {
  width: 20px;
  height: 20px;
  overflow: hidden;
}

.fs-node-icon > img {
  width: 16px;
  height: 16px;

  filter: drop-shadow(var(--icon-color) 0 50px);
  transform: translateY(-50px);
}

.fs-node-label-extra {
  color: rgba(0, 0, 0, 0.3);
  font-size: 13px;
  margin-left: 10px;
}

.ellipsis {
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 避免跟随父元素宽度自适应 */
.no-shrink {
  flex-shrink: 0
}
</style>