import { BrowserRouter, Routes, Route, Navigate, useRoutes } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Suspense, lazy, useMemo } from 'react'
import AuthGuard from '@/components/AuthGuard'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/layout'
import Login from '@/views/login'
import Index from '@/views/index'
import NotFound from '@/views/error/404'
import RoleAuthUser from '@/views/system/role/authUser'
import UserAuthRole from '@/views/system/user/AuthRole'
import { usePermissionStore } from '@/store'
import './App.css'

// 静态路由配置
const staticRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/404',
    element: <NotFound />,
  },
]

// 动态路由组件 - 使用 useRoutes 来支持动态路由
const DynamicRoutes = () => {
  const { dynamicRoutes, isLoaded } = usePermissionStore()

  // 个人中心组件懒加载
  const Profile = lazy(() => import('@/views/system/user/profile'))

  // 使用 useMemo 避免每次渲染都重新创建路由对象
  const routes = useMemo(() => {
    const allRoutes = [
      ...staticRoutes,
      {
        path: '/',
        element: (
          <AuthGuard>
            <Layout />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/index" replace />,
          },
          {
            path: 'index',
            element: <Index />,
          },
          // 静态路由 - 个人中心
          {
            path: 'user/profile/:activeTab?',
            element: <Profile />,
          },
          // 静态路由 - 分配用户页面
          {
            path: 'system/role/authUser/:roleId',
            element: <RoleAuthUser />,
          },
          // 静态路由 - 分配角色页面
          {
            path: 'system/user-auth/role/:userId',
            element: <UserAuthRole />,
          },
          // 添加动态路由（确保路径是相对路径，去掉前导 /）
          ...dynamicRoutes.map(route => ({
            ...route,
            path: route.path.replace(/^\/+/, '')
          })),
          // 404 路由
          {
            path: '*',
            element: <Navigate to="/404" replace />,
          },
        ],
      },
    ]

    return allRoutes
  }, [dynamicRoutes, isLoaded])

  return useRoutes(routes)
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>}>
            <DynamicRoutes />
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App
