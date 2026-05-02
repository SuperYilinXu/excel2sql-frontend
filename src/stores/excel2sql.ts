import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ExcelFileConfigVO, SchemaDetailVO, TaskDetailVO } from '@/types'

export const useExcel2SqlStore = defineStore('excel2sql', () => {
  const currentStep = ref(1)
  const excelData = ref<ExcelFileConfigVO | null>(null)
  const schemaData = ref<SchemaDetailVO | null>(null)
  const taskData = ref<TaskDetailVO | null>(null)
  const dbType = ref<'MYSQL' | 'POSTGRESQL'>('MYSQL')

  function reset() {
    currentStep.value = 1
    excelData.value = null
    schemaData.value = null
    taskData.value = null
    dbType.value = 'MYSQL'
  }

  function nextStep() {
    if (currentStep.value < 5) currentStep.value++
  }

  return { currentStep, excelData, schemaData, taskData, dbType, reset, nextStep }
})
