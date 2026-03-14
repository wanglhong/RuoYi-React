// 通用类型定义

/** API 通用响应类型 */
export interface AjaxResult<T = any> {
  /** 状态码 */
  code: number
  /** 返回内容 */
  msg: string
  /** 数据对象 */
  data?: T
}

/** API 表格响应类型 */
export interface TableDataInfo<T = any> {
  /** 状态码 */
  code: number
  /** 返回内容 */
  msg: string
  /** 总记录数 */
  total: number
  /** 列表数据 */
  rows: T[]
}

/** 分页参数类型 */
export interface PageDomain {
  /** 当前记录起始索引 */
  pageNum?: number
  /** 每页显示记录数 */
  pageSize?: number
  /** 排序列 */
  orderByColumn?: string
  /** 排序的方向 desc 或者 asc */
  isAsc?: string
  /** 分页参数合理化 */
  reasonable?: boolean
}

/** Entity 基类 */
export interface BaseEntity {
  /** 搜索值 */
  searchValue?: string
  /** 创建者 */
  createBy?: string
  /** 创建时间 */
  createTime?: string
  /** 更新者 */
  updateBy?: string
  /** 更新时间 */
  updateTime?: string
  /** 备注 */
  remark?: string
  /** 请求参数 */
  params?: Record<string, any>
}

/** Treeselect 树结构类型 */
export interface TreeSelect {
  /** 节点 ID */
  id?: number
  /** 节点名称 */
  label?: string
  /** 节点禁用 */
  disabled?: boolean
  /** 子节点 */
  children?: TreeSelect[]
}

/** 显隐列信息 */
export interface TableShowColumns {
  // 显示名称
  label: string
  // 是否显示
  visible: boolean
}

/** 文件上传响应数据 */
export interface UploadFileResult extends AjaxResult {
  /** 文件名称（包含路径） */
  fileName: string
  /** 文件名称（不含路径） */
  newFileName: string
  /** 完整 URL 地址 */
  url: string
  /** 原始文件名称 */
  originalFilename: string
}

// 导出监控模块类型
export type { SysCache } from './api/monitor/cache'
export type { JobQueryParams, SysJob } from './api/monitor/job'
export type { JobLogQueryParams, SysJobLog } from './api/monitor/jobLog'
export type { OnlineQueryParams, SysUserOnline } from './api/monitor/online'
export type { SysServer } from './api/monitor/server'

// 导出工具模块类型
export type { GenQueryParams, GenTable, GenTableColumn, GenTableInfoResult } from './api/tool/gen'
