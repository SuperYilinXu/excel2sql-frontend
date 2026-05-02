<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { generateSql, getGenerateResult } from '@/api'
import { useExcel2SqlStore } from '@/stores/excel2sql'

const BASE_URL = 'http://localhost:8080'

const store = useExcel2SqlStore()

type GenStatus = 'idle' | 'generating' | 'completed' | 'failed'

const status = ref<GenStatus>('idle')
const downloadUrl = ref('')
const errorMessage = ref('')

let pollTimer: ReturnType<typeof setTimeout> | null = null

function clearPoll() {
  if (pollTimer !== null) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

onUnmounted(clearPoll)

async function handleGenerate() {
  if (!store.taskData) return
  status.value = 'generating'
  downloadUrl.value = ''
  errorMessage.value = ''

  try {
    const result = await generateSql(store.taskData.taskKey)

    if (result.status === 'COMPLETED') {
      downloadUrl.value = result.downloadUrl ?? ''
      status.value = 'completed'
    } else if (result.status === 'GENERATING') {
      schedulePoll(store.taskData.taskKey)
    } else if (result.status === 'FAILED') {
      errorMessage.value = '生成失败'
      status.value = 'failed'
    }
  } catch {
    status.value = 'failed'
    errorMessage.value = '请求失败，请重试'
  }
}

function schedulePoll(taskKey: string) {
  pollTimer = setTimeout(async () => {
    try {
      const result = await getGenerateResult(taskKey)
      if (result.status === 'COMPLETED') {
        downloadUrl.value = result.downloadUrl ?? ''
        status.value = 'completed'
      } else if (result.status === 'FAILED') {
        errorMessage.value = '生成失败'
        status.value = 'failed'
      } else {
        schedulePoll(taskKey)
      }
    } catch {
      schedulePoll(taskKey)
    }
  }, 2000)
}

function downloadSql() {
  const url = downloadUrl.value.startsWith('http')
    ? downloadUrl.value
    : `${BASE_URL}${downloadUrl.value}`
  window.open(url, '_blank')
}

function restart() {
  clearPoll()
  store.reset()
}
</script>

<template>
  <div class="step-card">
    <div class="step-header">
      <h2 class="step-title">Step 5 — 生成 SQL</h2>
      <p class="step-desc">生成完成后统一提供 .sql 文件下载</p>
    </div>

    <!-- Task info summary -->
    <div v-if="store.taskData" class="task-info">
      <span class="task-tag">
        <el-icon><Key /></el-icon>
        任务 ID：{{ store.taskData.taskKey }}
      </span>
      <span class="task-tag">
        <el-icon><Document /></el-icon>
        {{ store.taskData.totalRows }} 行数据
      </span>
      <span class="task-tag">
        <el-icon><DataLine /></el-icon>
        {{ store.taskData.dbType }}
      </span>
    </div>

    <!-- Idle state: start button -->
    <div v-if="status === 'idle'" class="action-center">
      <el-button type="primary" size="large" class="generate-btn" @click="handleGenerate">
        <el-icon style="margin-right: 8px"><VideoPlay /></el-icon>
        开始生成 SQL
      </el-button>
    </div>

    <!-- Generating state -->
    <div v-else-if="status === 'generating'" class="generating-wrap">
      <div class="spinner-ring"></div>
      <p class="gen-text">生成中，请稍候…</p>
      <p class="gen-hint">大文件将自动切换为异步模式，完成后可下载</p>
    </div>

    <!-- Completed state -->
    <div v-else-if="status === 'completed'" class="download-card">
      <div class="download-icon-wrap">
        <el-icon :size="48" color="#52c41a"><CircleCheck /></el-icon>
      </div>
      <p class="download-title">SQL 文件生成成功</p>
      <p class="download-hint">点击下方按钮下载 .sql 文件到本地</p>
      <el-button type="primary" size="large" class="download-btn" @click="downloadSql">
        <el-icon style="margin-right: 8px"><Download /></el-icon>
        下载 .sql 文件
      </el-button>
    </div>

    <!-- Failed state -->
    <div v-else-if="status === 'failed'" class="error-wrap">
      <el-alert
        :title="errorMessage || '生成失败，请检查映射配置后重试'"
        type="error"
        :closable="false"
        show-icon
      />
      <el-button style="margin-top: 16px" type="primary" @click="handleGenerate">
        重新生成
      </el-button>
    </div>

    <div class="step-footer">
      <el-button v-if="status === 'idle'" size="large" @click="store.currentStep--">
        <el-icon style="margin-right: 4px"><ArrowLeft /></el-icon>
        上一步
      </el-button>
      <el-button size="large" type="danger" plain @click="restart">
        <el-icon style="margin-right: 4px"><RefreshLeft /></el-icon>
        重新开始
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.task-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 4px 12px;
  background: #eaf3fd;
  border: 1px solid #b8d6f0;
  border-radius: 20px;
  color: #4a90d9;
}

.action-center {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.generate-btn {
  min-width: 200px;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}

.generating-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 16px;
}

.spinner-ring {
  width: 52px;
  height: 52px;
  border: 4px solid #e8eef6;
  border-top-color: #4a90d9;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.gen-text {
  font-size: 15px;
  color: #4a90d9;
  font-weight: 600;
}

.gen-hint {
  font-size: 12px;
  color: #bbb;
}

.download-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 40px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 12px;
}

.download-icon-wrap {
  line-height: 1;
}

.download-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a2233;
}

.download-hint {
  font-size: 13px;
  color: #888;
}

.download-btn {
  margin-top: 8px;
  min-width: 200px;
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
}

.error-wrap {
  margin-bottom: 16px;
}
</style>
