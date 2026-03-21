import request from '@/utils/request'
import type { UserInfo } from '@/types'

// 用户信息响应
export interface UserInfoResult {
  msg: string
  code: number
  permissions: string[]
  roles: string[]
  user: UserInfo
}

// 获取用户详细信息
export function getInfo(): Promise<UserInfoResult> {
  return request({
    url: '/api/getInfo',
    method: 'get'
  })
}

// 获取路由信息
export interface RouterResult {
  msg: string
  code: number
  data: any[]
}

export function getRouters(): Promise<RouterResult> {
  return request({
    url: '/api/getRouters',
    method: 'get'
  })
}
