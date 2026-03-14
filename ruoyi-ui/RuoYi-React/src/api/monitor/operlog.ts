import request from '@/utils/request'

import type { OperlogQueryParams, SysOperLog, AjaxResult, TableDataInfo } from '@/types/system'

// 查询操作日志列表
export function list(query: OperlogQueryParams): Promise<TableDataInfo<SysOperLog[]>> {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query
  })
}

// 删除操作日志
export function delOperlog(operId: number | number[]): Promise<AjaxResult> {
  const idStr = Array.isArray(operId) ? operId.join(',') : operId.toString()
  return request({
    url: '/monitor/operlog/' + idStr,
    method: 'delete'
  })
}

// 清空操作日志
export function cleanOperlog(): Promise<AjaxResult> {
  return request({
    url: '/monitor/operlog/clean',
    method: 'delete'
  })
}
