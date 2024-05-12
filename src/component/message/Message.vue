<script setup lang="ts">
import { ref } from 'vue'
import { MessageItem, MessageOption } from './types'
import infoIcon from '../asset/info.svg'
import successIcon from '../asset/circle-check.svg'
import warningIcon from '../asset/circle-alert.svg'
import errorIcon from '../asset/circle-x.svg'

const messageList = ref<MessageItem[]>([])

const messageClearMap = new Map<string, any>()

const typeMap = {
  info: infoIcon,
  success: successIcon,
  warning: warningIcon,
  error: errorIcon
}

function addMessage(msg: string, options?: MessageOption) {
  const item: MessageItem = {
    id: Math.random().toString(),
    message: msg,
    type: options?.type || 'info',
    duration: options?.duration ?? 3000
  }
  messageList.value.push(item)
  remove(item.id, item.duration)
}

function remove(key: string, time?: number) {
  let timeout = messageClearMap.get(key)
  timeout && clearTimeout(timeout)
  if (time == null) {
    messageList.value = messageList.value.filter(item => item.id !== key)
    return
  }
  if (time === 0) return
  timeout = setTimeout(() => {
    messageList.value = messageList.value.filter(item => item.id !== key)
  }, time)
  messageClearMap.set(key, timeout)
}

function message() {
  return {
    info(msg: string, duration?: number) {
      addMessage(msg, { type: 'info', duration })
    },
    success(msg: string, duration?: number) {
      addMessage(msg, { type: 'success', duration })
    },
    warning(msg: string, duration?: number) {
      addMessage(msg, { type: 'warning', duration })
    },
    error(msg: string) {
      addMessage(msg, { type: 'error', duration: 0 })
    }
  }
}

defineExpose({ message: message() })

function onmouseenter(key: string) {
  const timeout = messageClearMap.get(key)
  timeout && clearTimeout(timeout)
}

function onmouseleave(key: string) {
  const item = messageList.value.find(item => item.id === key)
  remove(key, item?.duration)
}
</script>

<template>
  <!--<transition name="msg" @after-leave="afterLeave">-->
  <div class="msg-container">
    <div
      class="msg"
      :class="[item.type]"
      v-for="item in messageList"
      :key="item.id"
      @mouseenter="onmouseenter(item.id)"
      @mouseleave="onmouseleave(item.id)"
    >
      <div class="msg-box">
        <img
          class="msg-icon"
          :src="typeMap[item.type]"
          alt="info"
        />
        <span>{{ item.message }}</span>
      </div>
      <span
        class="msg-close"
        v-if="item.duration === 0"
        @click="remove(item.id)"
      >
        ×
      </span>
    </div>
  </div>
  <!--</transition>-->
</template>

<style scoped>
.msg-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  z-index: 99;
}

.msg {
  display: flex;
  justify-content: space-between;
  min-width: 100px;
  box-sizing: border-box;
  border-radius: 4px;
  transition:
    opacity 0.3s,
    transform 0.4s,
    top 0.4s;
  overflow: hidden;
  border: 1px solid;
  padding: 5px;
  align-items: center;
  margin-bottom: 5px;
}

.msg-box {
  display: flex;
}

.msg-box img {
  width: 16px;
  margin-right: 5px;
}

.msg-close {
  cursor: pointer;
}

.success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.warning {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.error {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

.info {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.msg-icon circle,
path {
  fill: pink;
}
</style>
