import request from '@/utils/request'

import type { LogininforQueryParams, SysLogininfor, AjaxResult, TableDataInfo } from '@/types/system'

// 查询登录日志列表
export function list(query: LogininforQueryParams): Promise<TableDataInfo<SysLogininfor[]>> {
  return request({
    url: '/api/monitor/logininfor/list',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLogininfor(infoId: number | number[]): Promise<AjaxResult> {
  const idStr = Array.isArray(infoId) ? infoId.join(',') : infoId.toString()
  return request({
    url: '/api/monitor/logininfor/' + idStr,
    method: 'delete'
  })
}

// 解锁用户登录状态
export function unlockLogininfor(userName: string): Promise<AjaxResult> {
  return request({
    url: '/api/monitor/logininfor/unlock/' + userName,
    method: 'get'
  })
}

// 清空登录日志
export function cleanLogininfor(): Promise<AjaxResult> {
  return request({
    url: '/api/monitor/logininfor/clean',
    method: 'delete'
  })
}
