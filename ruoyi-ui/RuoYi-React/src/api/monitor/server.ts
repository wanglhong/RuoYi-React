import request from '@/utils/request'
import type { AjaxResult } from '@/types'

// 获取服务信息
export function getServer(): Promise<AjaxResult<any>> {
  return request({
    url: '/api/monitor/server',
    method: 'get'
  })
}
