import axios from 'axios'
import { ElMessage } from 'element-plus'
import type {
  ApiResponse,
  ExcelFileConfigVO,
  SchemaDetailVO,
  TaskDetailVO,
  MappingItem,
  GenerateResultVO,
} from '@/types'

const BASE_URL = 'http://localhost:8080'

const http = axios.create({ baseURL: BASE_URL })

http.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse<unknown>
    if (body.code !== 200) {
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message))
    }
    return res
  },
  (err: unknown) => {
    const msg = err instanceof Error ? err.message : '网络错误'
    ElMessage.error(msg)
    return Promise.reject(err)
  },
)

export async function uploadExcel(file: File): Promise<ExcelFileConfigVO> {
  const form = new FormData()
  form.append('file', file)
  const res = await http.post<ApiResponse<ExcelFileConfigVO>>('/api/excel/upload', form)
  return res.data.data
}

export async function uploadSchema(file: File, dbType: string): Promise<SchemaDetailVO> {
  const form = new FormData()
  form.append('file', file)
  const res = await http.post<ApiResponse<SchemaDetailVO>>(
    `/api/schema/upload?dbType=${encodeURIComponent(dbType)}`,
    form,
  )
  return res.data.data
}

export async function parseSchemaString(ddl: string, dbType: string): Promise<SchemaDetailVO> {
  const res = await http.post<ApiResponse<SchemaDetailVO>>(
    '/api/schema/parse-string',
    { ddl, dbType },
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
  return res.data.data
}

export async function createTask(payload: {
  fileKey: string
  schemaKey: string
  dbType: string
  batchSize: number
}): Promise<TaskDetailVO> {
  const res = await http.post<ApiResponse<TaskDetailVO>>('/api/task/create', payload, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
  return res.data.data
}

export async function saveMapping(payload: {
  taskKey: string
  mappings: MappingItem[]
}): Promise<void> {
  await http.post<ApiResponse<null>>('/api/mapping/save', payload, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export async function generateSql(taskKey: string): Promise<GenerateResultVO> {
  const res = await http.post<ApiResponse<GenerateResultVO>>(
    '/api/generate/start',
    { taskKey },
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
  return res.data.data
}

export async function getGenerateResult(taskKey: string): Promise<GenerateResultVO> {
  const res = await http.get<ApiResponse<GenerateResultVO>>(`/api/generate/result/${taskKey}`)
  return res.data.data
}
