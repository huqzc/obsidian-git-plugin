<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { IFsTreeEmitter, IFsTreeProps, ITreeItem, ITreeNode, NodeKey } from './types'
import FsTreeNode from './FsTreeNode.vue'

const props = withDefaults(defineProps<IFsTreeProps>(), {
  keyField: 'key',
  labelField: 'label',
  childrenField: 'children',
  defaultExpandKeys: () => [],
  selectable: true,
  multipleSelect: false
})

const emit = defineEmits<IFsTreeEmitter>()

const treeData = ref<ITreeNode[]>([])



const checkedSet = ref(new Set(props.defaultCheckedKeys))

watch(
  () => props.data,
  newValue => {
    console.log('newValue = ', newValue)
    treeData.value = formatTreeData(newValue, null)
  },
  {
    immediate: true
  }
)

function formatTreeData(data: ITreeItem[], parent: ITreeNode | null): ITreeNode[] {
  return data.map(item => {
    const children = item[props.childrenField] || []
    const treeNode: ITreeNode = {
      key: item[props.keyField],
      name: item[props.labelField],
      children: [],
      level: parent ? parent.level + 1 : 0,
      parentKey: parent ? parent.key : null,
      isLeaf: item.isLeaf ?? children.length === 0,
      isChecked: item.isChecked ?? checkedSet.value.has(item[props.keyField]),
      isHalfChecked: item.isHalfChecked ?? false,
      rawNode: item
    }
    if (children.length) {
      treeNode.children = formatTreeData(children, treeNode)
    }
    return treeNode
  })
}

const flattenTree = computed(() => {
  const res: ITreeNode[] = []

  function dfs(tree: ITreeNode[]) {
    for (const node of tree) {
      res.push(node)
      // 当前节点处于展开状态才遍历子节点
      if (expandedSet.value.has(node.key)) {
        dfs(node.children)
      }
    }
  }

  dfs(treeData.value)
  return res
})

const expandedSet = ref(new Set(props.defaultExpandKeys))
const computedIsExpanded = (node: ITreeNode) => expandedSet.value.has(node.key)

function handleToggleExpanded(node: ITreeNode) {
  expandedSet.value.has(node.key)
    ? expandedSet.value.delete(node.key)
    : expandedSet.value.add(node.key)
}

function handleCheckNode(node: ITreeNode) {
  node.isChecked = !node.isChecked
  checkedSet.value[node.isChecked ? 'add' : 'delete'](node.key)
  handleCheckChildren(node, node.isChecked)
  handleCheckParent(node, node.isChecked)
  emit('onCheckChange', toRaw(node.rawNode), node.isChecked)
}

function handleCheckChildren(node: ITreeNode, isCheck: boolean) {
  const children = node.children
  if (children) {
    for (const childNode of children) {
      childNode.isChecked = isCheck
      checkedSet.value[isCheck ? 'add' : 'delete'](childNode.key)
      handleCheckChildren(childNode, isCheck)
    }
  }
}

// 创建新的数据结构保证快速找到父节点
const treeMap = computed<Map<NodeKey, ITreeNode>>(() => {
  const map = new Map<NodeKey, ITreeNode>()
  dfs(treeData.value)

  function dfs(data: ITreeNode[]) {
    for (const item of data) {
      map.set(item.key, item)
      dfs(item.children)
    }
  }

  return map
})

function handleCheckParent(node: ITreeNode, isCheck: boolean) {
  let parentKey = node.parentKey
  while (parentKey) {
    const parent = treeMap.value.get(parentKey) as ITreeNode
    const children = parent.children
    let allChecked = true
    let halfChecked = false

    if (children) {
      for (const child of children) {
        if (!child.isChecked) allChecked = false
        if (child.isChecked || child.isHalfChecked) halfChecked = true
      }
    }

    if (allChecked) {
      parent.isHalfChecked = false
      // 能到这里，说明子节点全选，进而说明isCheck为true
      parent.isChecked = isCheck
      checkedSet.value[isCheck ? 'add' : 'delete'](parent.key)
    } else {
      // 子节点全不选或部分选
      parent.isChecked = false
      checkedSet.value.delete(parent.key)
      parent.isHalfChecked = halfChecked
    }
    parentKey = parent.parentKey
  }
}
</script>

<template>
    <fs-tree-node
      v-for="i in flattenTree"
      :key="i.key"
      :node="i"
      :is-expanded="computedIsExpanded(i)"
      :show-checkbox="props.showCheckbox"
      @toggle-expanded="handleToggleExpanded"
      @on-check="handleCheckNode"
    />
</template>

<style scoped></style>
