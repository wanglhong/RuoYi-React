import { BrowserRouter, Routes, Route, Navigate, useRoutes } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Suspense } from 'react'
import AuthGuard from '@/components/AuthGuard'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/layout'
import Login from '@/views/login'
import Index from '@/views/index'
import NotFound from '@/views/error/404'
import RoleAuthUser from '@/views/system/role/authUser'
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
  const { dynamicRoutes } = usePermissionStore()

  console.log('dynamicRoutes in App:', dynamicRoutes)
  console.log('dynamicRoutes paths:', dynamicRoutes.map((r: any) => r.path))

  // 将动态路由合并到主布局路由中
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
        // 静态路由 - 分配用户页面
        {
          path: 'system/role/authUser/:roleId',
          element: <RoleAuthUser />,
        },
        // 添加动态路由
        ...dynamicRoutes,
        // 404 路由
        {
          path: '*',
          element: <Navigate to="/404" replace />,
        },
      ],
    },
  ]

  console.log('allRoutes children paths:', allRoutes[1].children?.map((r: any) => r.path))

  return useRoutes(allRoutes)
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
