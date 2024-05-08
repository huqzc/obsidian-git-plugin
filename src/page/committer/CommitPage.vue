<script setup lang="ts">
import FsTree from '../../component/tree/FsTree.vue'
import { computed, onMounted, ref } from 'vue'
import reloadIcon from '../asset/refresh-ccw.svg'
import revertIcon from '../asset/undo-2.svg'
import expandAllIcon from '../asset/chevrons-up-down.svg'
import collapseAllIcon from '../asset/chevrons-down-up.svg'
import git from '../../tool/git.js'
import { GitFile } from './commit-tab'

const files = ref<{changed: GitFile[], untracked: GitFile[]}>(git.listGitFiles())

const data: GitFile[] = computed(() => {
  const { changed, untracked } = files.value
  return [
    {
      key: 'Changes',
      name: 'Changes',
      path: 'Changes',
      type: 'dir',
      children: changed
    },
    {
      key: 'Untracked',
      name: 'Untracked',
      path: 'Untracked',
      type: 'dir',
      children: untracked
    }
  ]
})

const tree = ref<InstanceType<typeof FsTree>>()

async function reload() {
  files.value = await git.listGitFiles()
  console.log('data = ', data)
}

function revert() {

}

function expandAll() {
  tree.value?.expandAll()
}

function collapseAll() {
  tree.value?.collapseAll()
}

const textarea = ref<HTMLDivElement>()
function toggleCommitPlaceholder(type: 'blur' | 'focus') {
  const commitMessage = textarea.value?.textContent?.trim()
  if (type === 'blur' && !commitMessage) {
    textarea.value!.textContent = 'Commit Message'
  }
  if (type === 'focus' && commitMessage === 'Commit Message') {
    textarea.value!.textContent = ''
  }
}

onMounted(() => {
  reload()
})
</script>

<template>
  <div class="nav">
    <div
      class="nav-icon"
      @click="reload"
    >
      <img
        :src="reloadIcon"
        alt="reload"
      />
    </div>
    <div
      class="nav-icon"
      @click="revert"
    >
      <img
        :src="revertIcon"
        alt="revert"
      />
    </div>
    <div
      class="nav-icon"
      @click="expandAll"
    >
      <img
        :src="expandAllIcon"
        alt="expandAll"
      />
    </div>
    <div
      class="nav-icon"
      @click="collapseAll"
    >
      <img
        :src="collapseAllIcon"
        alt="collapseAll"
      />
    </div>
  </div>

  <div class="file-container">
    <fs-tree
      ref="tree"
      :data="data"
      show-checkbox
      key-field="key"
      label-field="name"
    />
  </div>

  <div class="commit-box">
    <div
      ref="textarea"
      contenteditable="true"
      @blur="toggleCommitPlaceholder('blur')"
      @focus="toggleCommitPlaceholder('focus')"
    >
      Commit Message
    </div>
    <button>Commit</button>
    <button>Commit and Push</button>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  height: 25px;
}

.nav-icon {
  width: 25px;
  height: 25px;
  position: relative;
}

.nav-icon:hover {
  background-color: #e4e4e4;
  border-radius: 3px;
}

.nav-icon img {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
}

.nav-icon:first-child img {
  width: 16px;
  height: 16px;
}

.file-container {
  height: calc(100% - 25px - 30%);
  overflow: scroll;
}

.commit-box {
  height: 30%;
}

.commit-box div {
  width: 100%;
  height: calc(100% - 15px - 30px);
  border-top: 1px solid #ccc;
}

.commit-box button:last-child {
  margin-left: 10px;
}
</style>
