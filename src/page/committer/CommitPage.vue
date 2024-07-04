<script setup lang="ts">
import FsTree from '../../component/tree/FsTree.vue'
import { computed, onMounted, provide, ref } from 'vue'
import reloadIcon from '../asset/refresh-ccw.svg'
import revertIcon from '../asset/undo-2.svg'
import expandAllIcon from '../asset/chevrons-up-down.svg'
import collapseAllIcon from '../asset/chevrons-down-up.svg'
import gitPullIcon from '../asset/move-down-left.svg'
import gitPushIcon from '../asset/move-up-right.svg'
import historyIcon from '../asset/clock.svg'
import * as git from '../../tool/git'
import { FileGroup, GitFile } from '../../tool/git/types'
import Message from '../../component/message/Message.vue'
import { eventBus } from '../../tool/eventBus'
import FsConfirm from '../../component/confirm/FsConfirm.vue'
import { PluginSettings } from '../../main'

const props = defineProps<{ baseDir: string; settings: PluginSettings }>()
provide('settings', props.settings)

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

function confirmRevert() {
  const changedFiles: string[] = changedTree
    .value!.getCheckedNodes()
    .filter(node => node.key !== 'Changes')
    .map(node => node.rawNode.path)
  if (changedFiles.length === 0) return
  confirmVisible.value = true
}

function revert() {
  const changedFiles: string[] = changedTree
    .value!.getCheckedNodes()
    .filter(node => node.key !== 'Changes')
    .map(node => node.rawNode.path)
  if (changedFiles.length === 0) return
  git
    .revert(changedFiles)
    .then(() => clearChecked())
    .catch(err => {
      console.error(err)
      message.value?.message.error('Reset file failed')
    })
}

function expandAll() {
  changedTree.value?.expandAll()
  untrackedTree.value?.expandAll()
}

function collapseAll() {
  changedTree.value?.collapseAll()
  untrackedTree.value?.collapseAll()
}

function gitPull() {
  git
    .pull()
    .then(res => {
      const info =
        res.files.length === 0
          ? 'Already up to date.'
          : `Pull success! ${res.files.length} files updated.`
      message.value?.message.success(info)
    })
    .catch(err => {
      console.error(err)
      message.value?.message.error('Git pull failed')
    })
}

function gitPush() {
  git
    .push()
    .then(() => message.value?.message.success('Push success'))
    .catch(err => {
      console.error(err)
      message.value?.message.error('Git push failed')
    })
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

const processing = ref<boolean>(false)

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
  try {
    await git.add(paths)
    await git.commit(paths, commitMessage)
    message.value?.message.success('Commit success')
    clearChecked()
  } catch (e) {
    console.error(e)
    message.value?.message.error('Commit failed')
  }
}

async function commitAndPush() {
  processing.value = true
  await commit()
  gitPush()
  processing.value = false
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

defineExpose({ reload })

const confirmVisible = ref<boolean>(false)

const checkedUntrackedFileNum = ref<number>(0)
const checkedChangedFileNum = ref<number>(0)
const deletedFileNum = ref<number>(0)

function getGroupFileNum() {
  checkedUntrackedFileNum.value = 0
  checkedChangedFileNum.value = 0
  deletedFileNum.value = 0

  const nodes = changedTree.value?.getCheckedNodes()
  for (const node of nodes) {
    if (node.rawNode.status === 'deleted') {
      deletedFileNum.value += 1
    } else {
      checkedChangedFileNum.value += node.rawNode.type === 'file' ? 1 : 0
    }
  }
  const nodes1 = untrackedTree.value?.getCheckedNodes()
  for (const node of nodes1) {
    checkedUntrackedFileNum.value += node.isLeaf ? 1 : 0
  }
}
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
    <fs-confirm
      :visible="confirmVisible"
      title="Confirm rollback changes?"
      :on-ok="revert"
      :on-cancel="() => (confirmVisible = false)"
    >
      <div
        class="nav-icon"
        @click="confirmRevert"
      >
        <img
          :src="revertIcon"
          alt="revert"
        />
      </div>
    </fs-confirm>
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
    <div
      class="nav-icon"
      @click="gitPush"
    >
      <img
        :src="gitPushIcon"
        alt="pull"
      />
    </div>
    <div
      class="nav-icon"
      @click="gitPull"
    >
      <img
        :src="gitPullIcon"
        alt="pull"
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
      @on-check-change="getGroupFileNum"
    />
    <fs-tree
      ref="untrackedTree"
      :data="untrackedData"
      show-checkbox
      key-field="key"
      label-field="name"
      @on-check-change="getGroupFileNum"
    />
  </div>

  <div class="commit-box">
    <div class="commit-info">
      <div class="commit-history">
        <div class="nav-icon">
          <img
            :src="historyIcon"
            alt="history"
          />
        </div>
      </div>
      <div class="select-file">
        <span
          v-if="checkedUntrackedFileNum"
          :style="{ color: 'var(--color-green)' }"
        >
          {{ checkedUntrackedFileNum }} added
        </span>
        <span
          v-if="checkedChangedFileNum"
          :style="{ color: 'var(--color-blue)' }"
        >
          {{ checkedChangedFileNum }}
          modified
        </span>
        <span
          v-if="deletedFileNum"
          :style="{ color: settings.deletedFontColor }"
        >
          {{ deletedFileNum }} deleted
        </span>
      </div>
    </div>
    <div
      class="commit-textarea"
      ref="textarea"
      contenteditable="true"
      @blur="toggleCommitPlaceholder('blur')"
      @focus="toggleCommitPlaceholder('focus')"
    >
      <span style="color: #ccc"> Commit Message </span>
    </div>
    <button
      @click="commit"
      :disabled="processing"
    >
      Commit
    </button>
    <button
      @click="commitAndPush"
      :disabled="processing"
    >
      Commit and Push
    </button>
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
  overflow: hidden;
}

.nav-icon:hover {
  background-color: var(--background-modifier-hover);
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

  filter: drop-shadow(var(--icon-color) 0 50px);
  transform: translateY(-50px);
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

.commit-info div {
  display: inline-block;
}

.select-file {
  height: 20px;
  float: right;
}

.commit-textarea {
  width: 100%;
  height: calc(100% - 30px - 30px - 16px);
  border-top: 1px solid #ccc;
}

.commit-box button:last-child {
  margin-left: 10px;
}
</style>