<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadSchema, parseSchemaString } from '@/api'
import { useExcel2SqlStore } from '@/stores/excel2sql'
import type { SchemaDetailVO } from '@/types'

const store = useExcel2SqlStore()

type InputMode = 'file' | 'text'
const inputMode = ref<InputMode>('file')

const uploading = ref(false)
const parsing = ref(false)

const fileIsDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement>()

const ddlText = ref('')
const schemaResult = ref<SchemaDetailVO | null>(null)

watch(
  () => store.schemaData,
  (v) => {
    schemaResult.value = v
  },
)

async function handleSchemaFile(file: File) {
  if (!file.name.match(/\.sql$/i)) {
    ElMessage.error('仅支持 .sql 文件')
    return
  }
  uploading.value = true
  try {
    const data = await uploadSchema(file, store.dbType)
    store.schemaData = data
    schemaResult.value = data
    ElMessage.success('表结构解析成功')
  } catch {
    // interceptor handles display
  } finally {
    uploading.value = false
  }
}

function onFileDrop(e: DragEvent) {
  fileIsDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleSchemaFile(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleSchemaFile(file)
  ;(e.target as HTMLInputElement).value = ''
}

async function parseDdl() {
  if (!ddlText.value.trim()) {
    ElMessage.warning('请输入 DDL 内容')
    return
  }
  parsing.value = true
  try {
    const data = await parseSchemaString(ddlText.value.trim(), store.dbType)
    store.schemaData = data
    schemaResult.value = data
    ElMessage.success('DDL 解析成功')
  } catch {
    // interceptor handles display
  } finally {
    parsing.value = false
  }
}

function triggerFileUpload() {
  if (!uploading.value) fileInputRef.value?.click()
}

const ddlPlaceholder = `-- 示例 DDL（粘贴你的 CREATE TABLE 语句）
CREATE TABLE \`user\` (
  \`id\`         BIGINT       NOT NULL COMMENT '主键ID',
  \`name\`       VARCHAR(50)  NOT NULL COMMENT '姓名',
  \`age\`        INT          COMMENT '年龄',
  \`created_at\` DATETIME     COMMENT '创建时间',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB COMMENT='用户表';`
</script>

<template>
  <div class="step-card">
    <div class="step-header">
      <h2 class="step-title">Step 2 — 上传表结构</h2>
      <p class="step-desc">上传 .sql 文件或直接粘贴 DDL，选择数据库类型后解析</p>
    </div>

    <!-- DB Type selector -->
    <div class="db-type-row">
      <span class="db-label">数据库类型：</span>
      <el-radio-group v-model="store.dbType" size="small">
        <el-radio-button value="MYSQL">MySQL</el-radio-button>
        <el-radio-button value="POSTGRESQL">PostgreSQL</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Input mode tabs -->
    <div class="mode-tabs">
      <button
        class="mode-tab"
        :class="{ 'is-active': inputMode === 'file' }"
        @click="inputMode = 'file'"
      >
        <el-icon><Upload /></el-icon>
        上传 .sql 文件
      </button>
      <button
        class="mode-tab"
        :class="{ 'is-active': inputMode === 'text' }"
        @click="inputMode = 'text'"
      >
        <el-icon><EditPen /></el-icon>
        粘贴 DDL 文本
      </button>
    </div>

    <!-- File upload panel -->
    <div v-show="inputMode === 'file'" class="panel">
      <div
        class="upload-zone"
        :class="{
          'is-dragover': fileIsDragOver,
          'is-done': !!schemaResult && !uploading,
          'is-disabled': inputMode !== 'file',
        }"
        @dragover.prevent="fileIsDragOver = true"
        @dragleave.prevent="fileIsDragOver = false"
        @drop.prevent="onFileDrop"
        @click="triggerFileUpload"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".sql"
          class="hidden-input"
          @change="onFileChange"
        />
        <template v-if="uploading">
          <div class="upload-icon">
            <el-icon class="rotating" :size="36" color="#4a90d9"><Loading /></el-icon>
          </div>
          <p class="upload-main">解析中，请稍候…</p>
        </template>
        <template v-else-if="!schemaResult || inputMode !== 'file'">
          <div class="upload-icon">🗂️</div>
          <p class="upload-main">拖拽 .sql 文件到此处，或 <em>点击选择</em></p>
          <p class="upload-sub">仅支持 .sql 格式</p>
        </template>
        <template v-else>
          <div class="upload-icon">✅</div>
          <p class="upload-main">已解析：{{ schemaResult.tableName }}</p>
          <p class="upload-sub">点击可重新上传</p>
        </template>
      </div>
    </div>

    <!-- DDL text panel -->
    <div v-show="inputMode === 'text'" class="panel">
      <el-input
        v-model="ddlText"
        type="textarea"
        :rows="10"
        :placeholder="ddlPlaceholder"
        :disabled="inputMode !== 'text'"
        class="ddl-input"
        resize="none"
      />
      <div style="margin-top: 12px; display: flex; justify-content: flex-end">
        <el-button
          type="primary"
          :loading="parsing"
          :disabled="inputMode !== 'text'"
          @click="parseDdl"
        >
          解析 DDL
        </el-button>
      </div>
    </div>

    <!-- Schema result table -->
    <transition name="slide-fade">
      <div v-if="schemaResult" class="schema-result">
        <div class="schema-meta">
          <span class="meta-badge">表名：{{ schemaResult.tableName }}</span>
          <span class="meta-badge">{{ schemaResult.dbType }}</span>
          <span class="meta-badge field-count">{{ schemaResult.fields.length }} 个字段</span>
        </div>
        <el-table
          :data="schemaResult.fields"
          size="small"
          stripe
          class="schema-table"
          :header-cell-style="{ background: '#f5f8ff', color: '#555', fontWeight: '600' }"
        >
          <el-table-column prop="fieldName" label="字段名" min-width="130" />
          <el-table-column prop="fieldType" label="类型" min-width="120" />
          <el-table-column label="主键" width="60" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isPrimaryKey" type="warning" size="small">PK</el-tag>
              <span v-else style="color: #ccc">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="fieldComment" label="注释" min-width="120" show-overflow-tooltip />
        </el-table>
      </div>
    </transition>

    <div class="step-footer">
      <el-button size="large" @click="store.currentStep--">
        <el-icon style="margin-right: 4px"><ArrowLeft /></el-icon>
        上一步
      </el-button>
      <el-button
        type="primary"
        size="large"
        class="next-btn"
        :disabled="!store.schemaData"
        @click="store.nextStep()"
      >
        下一步：创建任务
        <el-icon style="margin-left: 6px"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.db-type-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.db-label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.mode-tabs {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0ecf8;
  margin-bottom: 16px;
  width: fit-content;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 500;
  color: #777;
  background: #fafcff;
  border: none;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.mode-tab:hover {
  background: #f0f6ff;
  color: #4a90d9;
}

.mode-tab.is-active {
  background: #4a90d9;
  color: #fff;
}

.panel {
  margin-bottom: 20px;
}

.ddl-input :deep(textarea) {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 8px;
  background: #1e2533;
  color: #cdd3de;
  border-color: #3a4a60;
}

.ddl-input :deep(textarea::placeholder) {
  color: #4a5568;
}

.schema-result {
  margin-top: 20px;
}

.schema-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  background: #eaf3fd;
  color: #4a90d9;
  border: 1px solid #b8d6f0;
}

.field-count {
  background: #f0faf0;
  color: #4caf50;
  border-color: #a8d8a8;
}

.schema-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8eef6;
}

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
