<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createTask } from '@/api'
import { useExcel2SqlStore } from '@/stores/excel2sql'

const store = useExcel2SqlStore()
const loading = ref(false)

const BATCH_SIZE = 1000

async function handleCreate() {
  if (!store.excelData || !store.schemaData) return
  loading.value = true
  try {
    const data = await createTask({
      fileKey: store.excelData.fileKey,
      schemaKey: store.schemaData.schemaKey,
      dbType: store.dbType,
      batchSize: BATCH_SIZE,
    })
    store.taskData = data
    ElMessage.success('任务创建成功')
    store.nextStep()
  } catch {
    // interceptor handles display
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="step-card">
    <div class="step-header">
      <h2 class="step-title">Step 3 — 创建任务</h2>
      <p class="step-desc">确认 Excel 与表结构信息，创建转换任务</p>
    </div>

    <!-- Summary cards -->
    <div class="summary-grid">
      <!-- Excel summary -->
      <div class="summary-card">
        <div class="summary-icon">📄</div>
        <div class="summary-body">
          <div class="summary-title">Excel 文件</div>
          <div v-if="store.excelData" class="summary-info">
            <p class="info-line">
              <span class="info-label">文件名</span>
              <span class="info-value">{{ store.excelData.originalName }}</span>
            </p>
            <p class="info-line">
              <span class="info-label">数据行数</span>
              <span class="info-value accent">{{ store.excelData.totalRows }} 行</span>
            </p>
            <p class="info-line">
              <span class="info-label">列数</span>
              <span class="info-value accent">{{ store.excelData.columnHeaders.length }} 列</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Schema summary -->
      <div class="summary-card">
        <div class="summary-icon">🗂️</div>
        <div class="summary-body">
          <div class="summary-title">表结构</div>
          <div v-if="store.schemaData" class="summary-info">
            <p class="info-line">
              <span class="info-label">表名</span>
              <span class="info-value">{{ store.schemaData.tableName }}</span>
            </p>
            <p class="info-line">
              <span class="info-label">数据库类型</span>
              <span class="info-value accent">{{ store.schemaData.dbType }}</span>
            </p>
            <p class="info-line">
              <span class="info-label">字段数</span>
              <span class="info-value accent">{{ store.schemaData.fields.length }} 个</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="step-footer">
      <el-button size="large" @click="store.currentStep--">
        <el-icon style="margin-right: 4px"><ArrowLeft /></el-icon>
        上一步
      </el-button>
      <el-button
        type="primary"
        size="large"
        class="next-btn"
        :loading="loading"
        @click="handleCreate"
      >
        创建任务并继续
        <el-icon v-if="!loading" style="margin-left: 6px"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}

.summary-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  background: #f8fbff;
  border: 1px solid #e0ecf8;
  border-radius: 10px;
}

.summary-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.summary-body {
  flex: 1;
  min-width: 0;
}

.summary-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #999;
  margin-bottom: 10px;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  color: #aaa;
  width: 58px;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-value.accent {
  color: #4a90d9;
}
</style>
