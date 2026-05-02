export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp?: number
}

export interface ExcelFileConfigVO {
  fileKey: string
  originalName: string
  totalRows: number
  columnHeaders: string[]
}

export interface FieldVO {
  fieldName: string
  fieldType: string
  isPrimaryKey: boolean
  isNullable: boolean
  fieldComment: string
  fieldOrder: number
}

export interface SchemaDetailVO {
  schemaKey: string
  tableName: string
  dbType: string
  fields: FieldVO[]
}

export interface TaskDetailVO {
  taskKey: string
  status: string
  fileKey: string
  schemaKey: string
  dbType: string
  totalRows: number
  batchSize: number
  errorMessage: string
}

export interface MappingItem {
  fieldName: string
  mappingType: string
  excelColumnHeader?: string
  fixedValue?: string
  formulaType?: string
}

export interface GenerateResultVO {
  taskKey: string
  status: string
  sqlContent: string | null
  downloadUrl: string | null
}
