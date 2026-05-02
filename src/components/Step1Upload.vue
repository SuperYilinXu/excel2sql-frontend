<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadExcel } from '@/api'
import { useExcel2SqlStore } from '@/stores/excel2sql'

const store = useExcel2SqlStore()
const uploading = ref(false)
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement>()

async function handleFile(file: File) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    ElMessage.error('仅支持 .xlsx / .xls 格式')
    return
  }
  uploading.value = true
  try {
    store.excelData = await uploadExcel(file)
    ElMessage.success('上传成功')
  } catch {
    // error already shown by interceptor
  } finally {
    uploading.value = false
  }
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
  // reset so same file can be re-selected
  ;(e.target as HTMLInputElement).value = ''
}

function triggerUpload() {
  if (!uploading.value) fileInputRef.value?.click()
}
</script>

<template>
  <div class="step-card">
    <div class="step-header">
      <h2 class="step-title">Step 1 — 上传 Excel 文件</h2>
      <p class="step-desc">支持 .xlsx / .xls 格式，上传后自动解析列头及数据行数</p>
    </div>

    <div
      class="upload-zone"
      :class="{ 'is-dragover': isDragOver, 'is-done': !!store.excelData && !uploading }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
      @click="triggerUpload"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".xlsx,.xls"
        class="hidden-input"
        @change="onFileChange"
      />

      <template v-if="uploading">
        <div class="upload-icon">
          <el-icon class="rotating" :size="36" color="#4a90d9"><Loading /></el-icon>
        </div>
        <p class="upload-main">上传并解析中，请稍候…</p>
      </template>

      <template v-else-if="!store.excelData">
        <div class="upload-icon">📄</div>
        <p class="upload-main">
          拖拽 Excel 文件到此处，或 <em>点击选择文件</em>
        </p>
        <p class="upload-sub">仅支持 .xlsx / .xls</p>
      </template>

      <template v-else>
        <div class="upload-icon">✅</div>
        <p class="upload-main">{{ store.excelData.originalName }}</p>
        <p class="upload-sub">点击可重新上传</p>
      </template>
    </div>

    <transition name="slide-fade">
      <div v-if="store.excelData" class="result-card">
        <div class="result-meta">
          <div class="meta-item">
            <span class="meta-label">文件名</span>
            <span class="meta-value">{{ store.excelData.originalName }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">数据行数</span>
            <span class="meta-value highlight">{{ store.excelData.totalRows }} 行</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">列数</span>
            <span class="meta-value highlight">{{ store.excelData.columnHeaders.length }} 列</span>
          </div>
        </div>
        <div class="col-headers-row">
          <span class="headers-label">列头：</span>
          <div class="tags-wrap">
            <el-tag
              v-for="col in store.excelData.columnHeaders"
              :key="col"
              class="col-tag"
              size="small"
            >
              {{ col }}
            </el-tag>
          </div>
        </div>
      </div>
    </transition>

    <div class="step-footer">
      <el-button
        type="primary"
        size="large"
        class="next-btn"
        :disabled="!store.excelData"
        @click="store.nextStep()"
      >
        下一步：上传表结构
        <el-icon style="margin-left: 6px"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
