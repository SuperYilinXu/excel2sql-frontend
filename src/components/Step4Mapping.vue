<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { saveMapping } from '@/api'
import { useExcel2SqlStore } from '@/stores/excel2sql'

const store = useExcel2SqlStore()

type MappingType = '' | 'SKIP' | 'EXCEL_COLUMN' | 'FIXED_VALUE' | 'FORMULA'
type FormulaType = '' | 'NOW' | 'UUID' | 'SEQUENCE' | 'SNOWFLAKE_ID'

interface MappingRow {
  fieldName: string
  fieldType: string
  isPrimaryKey: boolean
  fieldComment: string
  mappingType: MappingType
  excelColumnHeader: string
  fixedValue: string
  formulaType: FormulaType
}

const mappingRows = ref<MappingRow[]>([])
const saving = ref(false)

onMounted(() => {
  if (!store.schemaData) return
  mappingRows.value = store.schemaData.fields.map((f) => ({
    fieldName: f.fieldName,
    fieldType: f.fieldType,
    isPrimaryKey: f.isPrimaryKey,
    fieldComment: f.fieldComment,
    mappingType: f.isPrimaryKey ? 'SKIP' : '',
    excelColumnHeader: '',
    fixedValue: '',
    formulaType: '',
  }))
})

const mappingTypeOptions = [
  { value: 'SKIP', label: 'SKIP（跳过）' },
  { value: 'EXCEL_COLUMN', label: 'EXCEL_COLUMN（Excel列）' },
  { value: 'FIXED_VALUE', label: 'FIXED_VALUE（固定值）' },
  { value: 'FORMULA', label: 'FORMULA（公式）' },
]

const formulaOptions = [
  { value: 'NOW', label: 'NOW（当前时间）' },
  { value: 'UUID', label: 'UUID' },
  { value: 'SEQUENCE', label: 'SEQUENCE（序列）' },
  { value: 'SNOWFLAKE_ID', label: 'SNOWFLAKE_ID（雪花ID）' },
]

function onMappingTypeChange(row: MappingRow) {
  row.excelColumnHeader = ''
  row.fixedValue = ''
  row.formulaType = ''
}

async function handleSave() {
  // Validate all rows
  for (const row of mappingRows.value) {
    if (!row.mappingType) {
      ElMessage.error(`字段「${row.fieldName}」尚未配置映射方式`)
      return
    }
    if (row.mappingType === 'EXCEL_COLUMN' && !row.excelColumnHeader) {
      ElMessage.error(`字段「${row.fieldName}」需要选择 Excel 列`)
      return
    }
    if (row.mappingType === 'FIXED_VALUE' && !row.fixedValue.trim()) {
      ElMessage.error(`字段「${row.fieldName}」需要填写固定值`)
      return
    }
    if (row.mappingType === 'FORMULA' && !row.formulaType) {
      ElMessage.error(`字段「${row.fieldName}」需要选择公式类型`)
      return
    }
  }

  if (!store.taskData) return
  saving.value = true
  try {
    await saveMapping({
      taskKey: store.taskData.taskKey,
      mappings: mappingRows.value.map((row) => ({
        fieldName: row.fieldName,
        mappingType: row.mappingType,
        ...(row.mappingType === 'EXCEL_COLUMN' && { excelColumnHeader: row.excelColumnHeader }),
        ...(row.mappingType === 'FIXED_VALUE' && { fixedValue: row.fixedValue }),
        ...(row.mappingType === 'FORMULA' && { formulaType: row.formulaType }),
      })),
    })
    ElMessage.success('映射配置保存成功')
    store.nextStep()
  } catch {
    // interceptor handles display
  } finally {
    saving.value = false
  }
}

function rowClass({ row }: { row: MappingRow }) {
  return row.isPrimaryKey ? 'pk-row' : ''
}
</script>

<template>
  <div class="step-card">
    <div class="step-header">
      <h2 class="step-title">Step 4 — 字段映射配置</h2>
      <p class="step-desc">
        为每个数据库字段配置映射策略；主键字段（黄色高亮）已默认设为 SKIP
      </p>
    </div>

    <div class="legend-row">
      <span class="legend-item pk">
        <span class="legend-dot pk-dot"></span>
        主键字段（默认 SKIP）
      </span>
      <span class="legend-item">
        共 {{ mappingRows.length }} 个字段，已配置
        <strong>{{ mappingRows.filter((r) => r.mappingType).length }}</strong>
        个
      </span>
    </div>

    <el-table
      :data="mappingRows"
      :row-class-name="rowClass"
      class="mapping-table"
      :header-cell-style="{ background: '#f5f8ff', color: '#555', fontWeight: '600' }"
    >
      <el-table-column label="字段名" min-width="130">
        <template #default="{ row }: { row: MappingRow }">
          <span class="field-name">{{ row.fieldName }}</span>
          <el-tag v-if="row.isPrimaryKey" type="warning" size="small" style="margin-left: 6px"
            >PK</el-tag
          >
        </template>
      </el-table-column>

      <el-table-column prop="fieldType" label="类型" min-width="110" />

      <el-table-column prop="fieldComment" label="注释" min-width="110" show-overflow-tooltip />

      <el-table-column label="映射方式" min-width="195">
        <template #default="{ row }: { row: MappingRow }">
          <el-select
            v-model="row.mappingType"
            size="small"
            placeholder="请选择"
            style="width: 100%"
            @change="onMappingTypeChange(row)"
          >
            <el-option
              v-for="opt in mappingTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="映射值" min-width="200">
        <template #default="{ row }: { row: MappingRow }">
          <!-- SKIP -->
          <span v-if="row.mappingType === 'SKIP'" class="skip-dash">—</span>

          <!-- EXCEL_COLUMN -->
          <el-select
            v-else-if="row.mappingType === 'EXCEL_COLUMN'"
            v-model="row.excelColumnHeader"
            size="small"
            placeholder="选择 Excel 列"
            style="width: 100%"
          >
            <el-option
              v-for="col in store.excelData?.columnHeaders ?? []"
              :key="col"
              :label="col"
              :value="col"
            />
          </el-select>

          <!-- FIXED_VALUE -->
          <el-input
            v-else-if="row.mappingType === 'FIXED_VALUE'"
            v-model="row.fixedValue"
            size="small"
            placeholder="输入固定值"
          />

          <!-- FORMULA -->
          <el-select
            v-else-if="row.mappingType === 'FORMULA'"
            v-model="row.formulaType"
            size="small"
            placeholder="选择公式"
            style="width: 100%"
          >
            <el-option
              v-for="opt in formulaOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <!-- Not yet selected -->
          <span v-else class="unset-hint">先选择映射方式</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="step-footer">
      <el-button size="large" @click="store.currentStep--">
        <el-icon style="margin-right: 4px"><ArrowLeft /></el-icon>
        上一步
      </el-button>
      <el-button
        type="primary"
        size="large"
        class="next-btn"
        :loading="saving"
        @click="handleSave"
      >
        保存映射并生成
        <el-icon v-if="!saving" style="margin-left: 6px"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style>
/* pk-row needs to be global to apply to el-table rows */
.mapping-table .el-table__row.pk-row td {
  background-color: #fffbec !important;
}
</style>

<style scoped>
.legend-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #777;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
}

.pk-dot {
  background: #fffbec;
  border: 1px solid #f5d98a;
}

.mapping-table {
  border: 1px solid #e8eef6;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
}

.field-name {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  color: #333;
}

.skip-dash {
  color: #ccc;
  font-size: 16px;
  padding-left: 8px;
}

.unset-hint {
  font-size: 12px;
  color: #ccc;
}
</style>
