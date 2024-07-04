<script setup lang="ts">
import { IFsCheckboxEmitter, IFsCheckboxProps } from './types'
import square from '../asset/square.svg'
import checked from '../asset/square-check-big.svg'
import halfChecked from '../asset/square-minus.svg'
import { computed } from 'vue'

const props = defineProps<IFsCheckboxProps>()
const emit = defineEmits<IFsCheckboxEmitter>()

const src = computed(() => (props.checked ? checked : props.indeterminate ? halfChecked : square))

const toggleChecked = () => {
  emit('change', !props.checked)
}
</script>

<template>
  <span @click="toggleChecked">
    <img
      :src="src"
      alt=""
    />
  </span>
</template>

<style scoped>
span {
  cursor: pointer;
  width: 20px;
  height: 20px;
  overflow: hidden;
}

span img {
  width: 16px;
  height: 16px;

  filter: drop-shadow(var(--icon-color) 0 50px);
  transform: translateY(-50px);
}
</style>
