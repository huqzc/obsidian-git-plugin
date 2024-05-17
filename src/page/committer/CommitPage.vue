<script setup lang="ts">
import FsTree from '../../component/tree/FsTree.vue'
import { computed, onMounted, ref } from 'vue'
import reloadIcon from '../asset/refresh-ccw.svg'
import revertIcon from '../asset/undo-2.svg'
import expandAllIcon from '../asset/chevrons-up-down.svg'
import collapseAllIcon from '../asset/chevrons-down-up.svg'
import * as git from '../../tool/git'
import { FileGroup, GitFile } from '../../tool/git/types'
import Message from '../../component/message/Message.vue'
import {eventBus} from '../../tool/eventBus'

const props = defineProps<{ baseDir: string }>()

const files = ref<FileGroup>()
const CHANGES: GitFile = {
  key: 'Changes',
  name: 'Changes',
  path: 'Changes',
  type: 'dir'
}
const UNTRACKED: GitFile = {
  key: 'Untracked',
  name: 'Untracked',
  path: 'Untracked',
  type: 'dir'
}

const changedData = computed<GitFile[]>(() => {
  CHANGES.children = files.value?.changed || []
  CHANGES.fileNum = CHANGES.children.reduce((pre, cur) => (pre += cur.fileNum ?? 1), 0)
  return [CHANGES]
})

const untrackedData = computed<GitFile[]>(() => {
  UNTRACKED.children = files.value?.untracked || []
  UNTRACKED.fileNum = UNTRACKED.children.reduce((pre, cur) => (pre += cur.fileNum ?? 1), 0)
  return [UNTRACKED]
})

const changedTree = ref<InstanceType<typeof FsTree>>()
const untrackedTree = ref<InstanceType<typeof FsTree>>()

async function reload() {
  git
    .listGitFiles()
    .then(v => (files.value = v))
    .catch(err => {
      console.error('err = ', err)
      message.value?.message.error('git repo not exist')
    })
}

function revert() {
  const changedFiles: string[] = changedTree
    .value!.getCheckedNodes()
    .filter(node => node.key !== 'Changes')
    .map(node => node.rawNode.path)
  if (changedFiles.length === 0) return
  // TODO confirm
  const c = confirm('rollback changes?')
  if (c) {
    git.revert(changedFiles)
      .then(() => clearChecked())
      .catch(err => {
        console.error(err)
        message.value?.message.error('Reset file failed')
      })
  }
}

function expandAll() {
  changedTree.value?.expandAll()
  untrackedTree.value?.expandAll()
}

function collapseAll() {
  changedTree.value?.collapseAll()
  untrackedTree.value?.collapseAll()
}

const textarea = ref<HTMLDivElement>()
const DEFAULT_MESSAGE = 'Commit Message'
const DEFAULT_MESSAGE_HTML = '<span style="color: #ccc"> Commit Message </span>'

function toggleCommitPlaceholder(type: 'blur' | 'focus') {
  const commitMessage = textarea.value?.textContent?.trim()
  if (type === 'blur' && !commitMessage) {
    textarea.value!.innerHTML = DEFAULT_MESSAGE_HTML
  }
  if (type === 'focus' && commitMessage === DEFAULT_MESSAGE) {
    textarea.value!.innerHTML = ''
  }
}

async function commit() {
  const commitMessage = textarea.value?.textContent?.trim()
  if (!commitMessage || commitMessage === DEFAULT_MESSAGE) {
    message.value?.message.warning('Lack commit message')
    return
  }
  const changedFiles: string[] = changedTree
    .value!.getCheckedNodes()
    .filter(node => node.key !== 'Changes')
    .map(node => node.rawNode.path)

  const untrackedFiles = untrackedTree
    .value!.getCheckedNodes()
    .filter(node => node.key !== 'Untracked')
    .map(node => node.rawNode.path)

  const paths = [...changedFiles, ...untrackedFiles]

  if (paths?.length === 0) {
    message.value?.message.info('No files selected')
    return
  }
  git
    .add(paths)
    .then(() => git.commit(paths, commitMessage))
    .then(() => {
      message.value?.message.success('commit success')
      clearChecked()
    })
    .catch(err => {
      console.error(err)
      message.value?.message.error('commit failed')
    })
}

async function commitAndPush() {
  await commit()
  git.push().catch(err => {
    console.error(err)
    message.value?.message.error('push failed')
  })
}

onMounted(() => {
  git.init(props.baseDir)
  reload()
  eventBus.$on('modify', reload)
})

const message = ref<InstanceType<typeof Message>>()

function clearChecked() {
  changedTree.value!.clearChecked()
  untrackedTree.value!.clearChecked()
  reload()
}

defineExpose({reload})
</script>

<template>
  <message ref="message" />
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
      ref="changedTree"
      :data="changedData"
      show-checkbox
      key-field="key"
      label-field="name"
    />
    <fs-tree
      ref="untrackedTree"
      :data="untrackedData"
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
      <span style="color: #ccc"> Commit Message </span>
    </div>
    <button @click="commit">Commit</button>
    <button @click="commitAndPush">Commit and Push</button>
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
