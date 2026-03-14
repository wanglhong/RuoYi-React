import React, { useEffect, useState, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useUserStore, usePermissionStore } from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

interface AuthGuardProps {
  children: React.ReactElement
}

// 白名单路由
const whiteList = ['/login', '/register']

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation()
  const token = useUserStore((state) => state.token)
  const roles = useUserStore((state) => state.roles)
  const getUserInfo = useUserStore((state) => state.getUserInfo)
  const generateRoutes = usePermissionStore((state) => state.generateRoutes)
  const isLoaded = usePermissionStore((state) => state.isLoaded)

  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // 使用 ref 防止重复调用
  const fetchingRef = useRef(false)

  // 等待 Zustand persist 水合完成
  useEffect(() => {
    const timer = setTimeout(() => {
      setHydrated(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const initAuth = async () => {
      // 如果已经初始化完成，直接返回（避免路由切换时重复请求）
      if (initialized) {
        return
      }

      // 如果已经在获取，直接返回
      if (fetchingRef.current) {
        return
      }

      NProgress.start()

      // 白名单路由直接放行
      if (whiteList.includes(location.pathname)) {
        setInitialized(true)
        NProgress.done()
        return
      }

      // 没有 token，跳转到登录页
      if (!token) {
        setInitialized(true)
        NProgress.done()
        return
      }

      // 有 token，获取用户信息和路由
      if (!fetchingRef.current) {
        fetchingRef.current = true
        setLoading(true)
        try {
          // 获取用户信息
          await getUserInfo()
          console.log('用户信息获取成功')

          // 获取路由信息
          await generateRoutes()
          console.log('路由信息获取成功')
        } catch (error) {
          console.error('初始化失败:', error)
        } finally {
          setLoading(false)
          setInitialized(true)
          fetchingRef.current = false
          NProgress.done()
        }
      }
    }

    initAuth()
  }, [hydrated, token, getUserInfo, generateRoutes])

  // 等待水合完成
  if (!hydrated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // 白名单路由直接放行
  if (whiteList.includes(location.pathname)) {
    return children
  }

  // 没有 token，跳转到登录页
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // 正在加载用户信息或路由信息
  if (loading || !initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // 已初始化，渲染子路由（包括 404 处理）
  return children
}

export default AuthGuard
