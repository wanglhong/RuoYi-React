import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import Cookies from 'js-cookie'

const TOKEN_KEY = 'Admin-Token'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/dev-api',
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
      message.error(res.msg || 'Error')

      // 401: 未登录或token过期
      if (res.code === 401) {
        // 跳转登录页
        window.location.href = '/login'
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
