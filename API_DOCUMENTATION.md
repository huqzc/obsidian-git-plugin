# Obsidian Git Plugin - API Documentation

## Overview

This documentation covers all public APIs, functions, and components for the Obsidian Git Plugin, a Vue.js-based plugin that provides Git integration capabilities for Obsidian vaults.

## Table of Contents

1. [Main Plugin API](#main-plugin-api)
2. [Git Tool API](#git-tool-api)
3. [EventBus API](#eventbus-api)
4. [Vue Components](#vue-components)
   - [FsTree Component](#fstree-component)
   - [FsCheckbox Component](#fscheckbox-component)
   - [Message Component](#message-component)
   - [FsConfirm Component](#fsconfirm-component)
5. [Types and Interfaces](#types-and-interfaces)
6. [Usage Examples](#usage-examples)

---

## Main Plugin API

### GitCommitterPlugin

The main plugin class that extends Obsidian's Plugin class.

#### Properties

```typescript
class GitCommitterPlugin extends Plugin {
  settings: PluginSettings
}
```

#### Methods

##### `onload(): Promise<void>`
Initializes the plugin, loads settings, and registers the view.

**Example:**
```typescript
// Called automatically by Obsidian
await plugin.onload()
```

##### `activateView(): Promise<void>`
Opens or focuses the Git committer view in the right sidebar.

**Example:**
```typescript
await plugin.activateView()
```

##### `loadSettings(): Promise<void>`
Loads plugin settings from Obsidian's data storage.

**Example:**
```typescript
await plugin.loadSettings()
```

##### `saveSettings(): Promise<void>`
Saves current plugin settings to Obsidian's data storage.

**Example:**
```typescript
plugin.settings.remoteRepoUrl = 'https://github.com/user/repo.git'
await plugin.saveSettings()
```

### PluginSettings Interface

```typescript
interface PluginSettings {
  remoteRepoUrl: string           // Remote repository URL
  submitThirdGitRepo: string      // Whether to submit third-party git repos
  modifiedFontColor: string       // Color for modified files
  addedFontColor: string         // Color for added files
  deletedFontColor: string       // Color for deleted files
  untrackedFontColor: string     // Color for untracked files
  commitHistory: string[]        // Array of previous commit messages
}
```

**Example:**
```typescript
const settings: PluginSettings = {
  remoteRepoUrl: 'https://github.com/username/vault.git',
  submitThirdGitRepo: 'ignore',
  modifiedFontColor: '#3F93F4',
  addedFontColor: '#68AA72',
  deletedFontColor: '#AFAFAF',
  untrackedFontColor: '#DC362E',
  commitHistory: ['Initial commit', 'Add new notes']
}
```

---

## Git Tool API

### Functions

#### `init(baseDir?: string): void`
Initializes the Git tool with the specified base directory.

**Parameters:**
- `baseDir` (optional): Base directory path. If not provided, scans for Git directories.

**Example:**
```typescript
import { init } from './tool/git'

init('/path/to/vault')
```

#### `listGitFiles(): Promise<FileGroup>`
Lists all Git-tracked files with their status.

**Returns:** Promise resolving to `FileGroup` containing changed and untracked files.

**Example:**
```typescript
import { listGitFiles } from './tool/git'

const files = await listGitFiles()
console.log('Changed files:', files.changed)
console.log('Untracked files:', files.untracked)
```

#### `commit(files: string[], commitMessage: string): Promise<any>`
Commits the specified files with a commit message.

**Parameters:**
- `files`: Array of file paths to commit
- `commitMessage`: Commit message string

**Example:**
```typescript
import { commit } from './tool/git'

await commit(['README.md', 'src/main.ts'], 'Update documentation and main file')
```

#### `add(files: string[]): Promise<any>`
Stages the specified files for commit.

**Parameters:**
- `files`: Array of file paths to stage

**Example:**
```typescript
import { add } from './tool/git'

await add(['newfile.md', 'modified.md'])
```

#### `push(): Promise<any>`
Pushes committed changes to the remote repository.

**Example:**
```typescript
import { push } from './tool/git'

await push()
```

#### `pull(): Promise<any>`
Pulls changes from the remote repository.

**Example:**
```typescript
import { pull } from './tool/git'

await pull()
```

#### `revert(files: string[]): Promise<any>`
Reverts changes in the specified files.

**Parameters:**
- `files`: Array of file paths to revert

**Example:**
```typescript
import { revert } from './tool/git'

await revert(['unwanted-changes.md'])
```

---

## EventBus API

### EventBus Class

A simple event bus implementation for component communication.

#### Methods

##### `$on(event: string, callback: Function): void`
Registers an event listener.

**Parameters:**
- `event`: Event name
- `callback`: Function to call when event is emitted

**Example:**
```typescript
import { eventBus } from './tool/eventBus'

eventBus.$on('modify', () => {
  console.log('Files modified')
})
```

##### `$off(event: string, callback?: Function): void`
Removes an event listener.

**Parameters:**
- `event`: Event name
- `callback` (optional): Specific callback to remove. If not provided, removes all listeners.

**Example:**
```typescript
// Remove specific callback
eventBus.$off('modify', myCallback)

// Remove all listeners for event
eventBus.$off('modify')
```

##### `$emit(event: string, ...args: any[]): void`
Emits an event with optional arguments.

**Parameters:**
- `event`: Event name
- `...args`: Arguments to pass to listeners

**Example:**
```typescript
eventBus.$emit('modify', { file: 'example.md', type: 'update' })
```

---

## Vue Components

### FsTree Component

A file system tree component with checkbox support.

#### Props

```typescript
interface IFsTreeProps {
  data: ITreeItem[]                    // Tree data array
  keyField?: string                    // Key field name (default: 'key')
  labelField?: string                  // Label field name (default: 'label')
  childrenField?: string               // Children field name (default: 'children')
  defaultExpandKeys?: NodeKey[]        // Initially expanded nodes
  selectable?: boolean                 // Enable selection (default: true)
  multipleSelect?: boolean             // Enable multiple selection (default: false)
  defaultCheckedKeys?: NodeKey[]       // Initially checked nodes
  showCheckbox?: boolean               // Show checkboxes
}
```

#### Events

- `onSelectNodes(nodes: ITreeNode[])`: Emitted when nodes are selected
- `onCheckChange(node: ITreeItem, checked: boolean)`: Emitted when checkbox state changes

#### Exposed Methods

- `getCheckedKeys()`: Returns array of checked node keys
- `getCheckedNodes()`: Returns array of checked node objects
- `expandAll()`: Expands all nodes
- `collapseAll()`: Collapses all nodes
- `clearChecked()`: Clears all checked states

#### Example Usage

```vue
<template>
  <FsTree
    :data="treeData"
    :show-checkbox="true"
    :default-expand-keys="['root']"
    @on-check-change="handleCheckChange"
    ref="treeRef"
  />
</template>

<script setup>
import { ref } from 'vue'
import FsTree from './component/tree/FsTree.vue'

const treeRef = ref()
const treeData = ref([
  {
    key: 'root',
    name: 'Root Folder',
    children: [
      { key: 'file1', name: 'file1.md', isLeaf: true }
    ]
  }
])

function handleCheckChange(node, checked) {
  console.log(`Node ${node.name} ${checked ? 'checked' : 'unchecked'}`)
}

function getSelected() {
  const checkedNodes = treeRef.value.getCheckedNodes()
  console.log('Selected nodes:', checkedNodes)
}
</script>
```

### FsCheckbox Component

A customizable checkbox component.

#### Props

```typescript
interface IFsCheckboxProps {
  checked?: boolean        // Checked state
  indeterminate?: boolean  // Indeterminate state (half-checked)
}
```

#### Events

- `change(checked: boolean)`: Emitted when checkbox state changes

#### Example Usage

```vue
<template>
  <FsCheckbox
    :checked="isChecked"
    :indeterminate="isIndeterminate"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import FsCheckbox from './component/checkbox/FsCheckbox.vue'

const isChecked = ref(false)
const isIndeterminate = ref(false)

function handleChange(checked) {
  isChecked.value = checked
  isIndeterminate.value = false
}
</script>
```

### Message Component

A notification message component supporting different types and auto-dismiss.

#### Exposed Methods

The component exposes a `message` object with the following methods:

- `info(msg: string, duration?: number)`: Shows info message
- `success(msg: string, duration?: number)`: Shows success message
- `warning(msg: string, duration?: number)`: Shows warning message
- `error(msg: string)`: Shows error message (no auto-dismiss)

#### Example Usage

```vue
<template>
  <Message ref="messageRef" />
  <button @click="showMessages">Show Messages</button>
</template>

<script setup>
import { ref } from 'vue'
import Message from './component/message/Message.vue'

const messageRef = ref()

function showMessages() {
  messageRef.value.message.success('Operation successful!', 3000)
  messageRef.value.message.warning('Warning message', 5000)
  messageRef.value.message.error('Error message') // No auto-dismiss
  messageRef.value.message.info('Info message')
}
</script>
```

### FsConfirm Component

A confirmation dialog component.

#### Props

```typescript
interface IFsConfirmProps {
  visible: boolean      // Dialog visibility
  title: string        // Dialog title
  okText?: string      // OK button text (default: 'Yes')
  cancelText?: string  // Cancel button text (default: 'No')
  onOk: () => void     // OK button callback
  onCancel: () => void // Cancel button callback
}
```

#### Example Usage

```vue
<template>
  <FsConfirm
    :visible="showConfirm"
    title="Delete this file?"
    ok-text="Delete"
    cancel-text="Cancel"
    :on-ok="handleDelete"
    :on-cancel="hideConfirm"
  >
    <button @click="showConfirm = true">Delete File</button>
  </FsConfirm>
</template>

<script setup>
import { ref } from 'vue'
import FsConfirm from './component/confirm/FsConfirm.vue'

const showConfirm = ref(false)

function handleDelete() {
  console.log('File deleted')
  hideConfirm()
}

function hideConfirm() {
  showConfirm.value = false
}
</script>
```

---

## Types and Interfaces

### Git Types

```typescript
// Git file representation
interface GitFile {
  name: string                    // File name
  path: string                   // File path
  type: 'dir' | 'file'          // File type
  status?: GitState             // Git status
  children?: GitFile[]          // Child files (for directories)
  fileNum?: number             // Number of files in directory
  [key: string]: any           // Additional properties
}

// Git file status
type GitState = 'untracked' | 'added' | 'modified' | 'deleted'

// File grouping
interface FileGroup {
  changed: GitFile[]    // Modified/added/deleted files
  untracked: GitFile[]  // Untracked files
}
```

### Tree Types

```typescript
// Tree node key type
type NodeKey = string | number

// Tree item interface
interface ITreeItem {
  key?: NodeKey              // Unique identifier
  name?: NodeKey            // Display name
  children?: ITreeItem[]    // Child items
  isLeaf?: boolean         // Is leaf node
  isChecked: boolean       // Checked state
  isHalfChecked: boolean   // Half-checked state
  fileNum: number          // Number of files
  [key: string]: any       // Additional properties
}

// Tree node interface (internal)
interface ITreeNode extends Required<ITreeItem> {
  level: number              // Node depth level
  parentKey: NodeKey | null  // Parent node key
  children: ITreeNode[]      // Child nodes
  rawNode: ITreeItem        // Original data
}
```

### Message Types

```typescript
// Message types
type MessageType = 'success' | 'warning' | 'info' | 'error'

// Message item
interface MessageItem extends MessageOption {
  id: string        // Unique identifier
  message: string   // Message content
}

// Message options
interface MessageOption {
  type?: MessageType  // Message type
  duration?: number   // Auto-dismiss duration (0 = no dismiss)
}
```

---

## Usage Examples

### Complete Git Workflow

```typescript
import { init, listGitFiles, add, commit, push } from './tool/git'

async function completeGitWorkflow() {
  // Initialize Git
  init('/path/to/vault')
  
  // Get file status
  const files = await listGitFiles()
  
  // Stage modified files
  const modifiedPaths = files.changed
    .filter(f => f.type === 'file')
    .map(f => f.path)
  
  if (modifiedPaths.length > 0) {
    await add(modifiedPaths)
    await commit(modifiedPaths, 'Update notes')
    await push()
    console.log('Changes pushed successfully')
  }
}
```

### Vue Component Integration

```vue
<template>
  <div class="git-interface">
    <FsTree
      :data="gitFiles"
      :show-checkbox="true"
      @on-check-change="handleFileSelect"
      ref="fileTree"
    />
    
    <div class="actions">
      <button @click="stageSelected">Stage Selected</button>
      <button @click="commitFiles">Commit</button>
      <button @click="pushChanges">Push</button>
    </div>
    
    <Message ref="messages" />
    
    <FsConfirm
      :visible="showCommitConfirm"
      title="Commit selected files?"
      :on-ok="confirmCommit"
      :on-cancel="() => showCommitConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listGitFiles, add, commit, push } from './tool/git'
import { eventBus } from './tool/eventBus'
import FsTree from './component/tree/FsTree.vue'
import Message from './component/message/Message.vue'
import FsConfirm from './component/confirm/FsConfirm.vue'

const fileTree = ref()
const messages = ref()
const gitFiles = ref([])
const showCommitConfirm = ref(false)

onMounted(async () => {
  await loadGitFiles()
  
  // Listen for file changes
  eventBus.$on('modify', loadGitFiles)
})

async function loadGitFiles() {
  try {
    const files = await listGitFiles()
    gitFiles.value = [...files.changed, ...files.untracked]
  } catch (error) {
    messages.value.message.error('Failed to load Git files')
  }
}

function handleFileSelect(node, checked) {
  console.log(`File ${node.name} ${checked ? 'selected' : 'deselected'}`)
}

async function stageSelected() {
  const selectedFiles = fileTree.value.getCheckedNodes()
    .filter(node => node.type === 'file')
    .map(node => node.path)
  
  if (selectedFiles.length === 0) {
    messages.value.message.warning('No files selected')
    return
  }
  
  try {
    await add(selectedFiles)
    messages.value.message.success('Files staged successfully')
  } catch (error) {
    messages.value.message.error('Failed to stage files')
  }
}

function commitFiles() {
  showCommitConfirm.value = true
}

async function confirmCommit() {
  const selectedFiles = fileTree.value.getCheckedNodes()
    .filter(node => node.type === 'file')
    .map(node => node.path)
  
  try {
    await commit(selectedFiles, 'Update selected files')
    messages.value.message.success('Files committed successfully')
    await loadGitFiles() // Refresh file list
  } catch (error) {
    messages.value.message.error('Failed to commit files')
  }
  
  showCommitConfirm.value = false
}

async function pushChanges() {
  try {
    await push()
    messages.value.message.success('Changes pushed to remote')
  } catch (error) {
    messages.value.message.error('Failed to push changes')
  }
}
</script>
```

### Event Bus Communication

```typescript
import { eventBus } from './tool/eventBus'

// Component A - Emitting events
function notifyFileChange(filename: string) {
  eventBus.$emit('file:changed', {
    filename,
    timestamp: Date.now()
  })
}

// Component B - Listening for events
eventBus.$on('file:changed', (data) => {
  console.log(`File ${data.filename} changed at ${data.timestamp}`)
  // Refresh UI or perform other actions
})

// Cleanup when component unmounts
onUnmounted(() => {
  eventBus.$off('file:changed')
})
```

---

## Best Practices

1. **Error Handling**: Always wrap Git operations in try-catch blocks
2. **Event Cleanup**: Remove event listeners when components unmount
3. **File Validation**: Validate file paths before Git operations
4. **User Feedback**: Use the Message component for operation feedback
5. **Confirmation**: Use FsConfirm for destructive operations
6. **State Management**: Use reactive refs for component state
7. **Performance**: Use computed properties for derived data

## Migration Notes

When upgrading or integrating this plugin:

1. Ensure Vue 3.4+ compatibility
2. Update TypeScript types if extending interfaces
3. Follow Obsidian plugin API guidelines
4. Test Git operations with your specific vault structure
5. Customize colors and styling to match your theme

---

This documentation covers all public APIs and components. For implementation details, refer to the source code in the respective component directories.