<script setup lang="ts">
import infoIcon from '../asset/info.svg'
import { IFsConfirmProps } from './types'
import { watch } from 'vue'

const prop = withDefaults(defineProps<IFsConfirmProps>(), {
  okText: 'Yes',
  cancelText: 'No'
})

function handleConfirm() {
  prop.onOk()
  prop.onCancel()
}

function handleCancel() {
  prop.onCancel()
}

function handleClick(e) {
  if (!document.querySelector('.fs-confirm')?.contains(e.target)) {
    handleCancel()
  }
}

function listenClick(value) {
  const func = value ? document.addEventListener : document.removeEventListener
  func('click', handleClick)
}

watch(() => prop.visible, listenClick, { immediate: true })
</script>

<template>
  <div class="fs-confirm">
    <div
      class="confirm-box"
      v-show="prop.visible"
    >
      <div class="confirm-head">
        <img
          :src="infoIcon"
          alt="info"
        />
        <span class="confirm-title">{{ prop.title }}</span>
      </div>
      <div class="confirm-body">
        <button
          class="confirm-yes"
          @click="handleConfirm"
        >
          {{ prop.okText }}
        </button>
        <button
          class="confirm-no"
          @click="handleCancel"
        >
          {{ prop.cancelText }}
        </button>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>
.fs-confirm {
  position: relative;
}

.confirm-box {
  position: absolute;
  top: 5px;
  left: 25px;
  box-shadow: inset 0px 0px 1px 1px #ccc;
  width: 200px;
  min-height: 90px;
  background-color: white;
  z-index: 999;
  border-radius: 5px;
  padding: 10px;
}

.confirm-head {
  display: flex;
}

.confirm-title {
  overflow: hidden;
}

.confirm-body {
  height: 30px;
  float: right;
}

.confirm-yes {
  margin-right: 10px;
  color: white;
  background: rgba(108, 49, 227, 0.74);
}

.confirm-yes:hover {
  margin-right: 10px;
  color: white;
  background: rgba(108, 49, 227, 0.84);
}

.confirm-yes:active {
  background: #6c31e3;
}

.confirm-no:active {
  background: #e3e3e3;
}
</style>
