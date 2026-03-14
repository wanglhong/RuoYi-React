import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 登录参数
export interface LoginParams {
  username: string
  password: string
  code: string
  uuid: string
  rememberMe?: boolean
}

// 登录响应
export interface LoginResult {
  msg: string
  code: number
  token: string
}

// 验证码信息
export interface CaptchaInfo {
  msg: string
  img: string
  code: number
  captchaEnabled: boolean
  uuid: string
}

// 登录方法
export function login(data: LoginParams): Promise<LoginResult> {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 获取验证码
export function getCodeImg(): Promise<CaptchaInfo> {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}

// 退出登录
export function logout(): Promise<ApiResponse<void>> {
  return request({
    url: '/logout',
    method: 'post'
  })
}
