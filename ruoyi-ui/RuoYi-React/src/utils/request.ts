import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import Cookies from 'js-cookie'

const TOKEN_KEY = 'Admin-Token'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_KEY)
    if (token && config.headers) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    if (res.code !== 200) {
      // 验证码接口返回 401 时不显示错误（后端可能配置了需要认证）
      const isCaptchaApi = response.config.url?.includes('captchaImage')
      if (res.code === 401 && !isCaptchaApi) {
        message.error(res.msg || '未登录或 Token 已过期')
        // 跳转登录页
        window.location.href = '/login'
        return Promise.reject(new Error(res.msg || '未登录'))
      }

      // 非 401 错误或其他接口错误才显示提示
      if (!isCaptchaApi) {
        message.error(res.msg || 'Error')
      }

      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  (error: any) => {
    message.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service
