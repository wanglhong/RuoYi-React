import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import Layout from '@/layout'

// 懒加载组件包装器
const lazyLoad = (Component: React.LazyExoticComponent<React.FC>) => {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Component />
    </Suspense>
  )
}

// 公共路由
export const constantRoutes = [
  {
    path: '/login',
    element: lazyLoad(lazy(() => import('@/views/login'))),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Navigate to="/index" replace />
      },
      {
        path: 'index',
        element: lazyLoad(lazy(() => import('@/views/index'))),
        meta: { title: '首页', icon: 'home' }
      },
      // 系统管理模块
      {
        path: 'system/user',
        element: lazyLoad(lazy(() => import('@/views/system/user'))),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'system/role',
        element: lazyLoad(lazy(() => import('@/views/system/role'))),
        meta: { title: '角色管理', icon: 'team' }
      },
      {
        path: 'system/menu',
        element: lazyLoad(lazy(() => import('@/views/system/menu'))),
        meta: { title: '菜单管理', icon: 'menu' }
      },
      {
        path: 'system/dept',
        element: lazyLoad(lazy(() => import('@/views/system/dept'))),
        meta: { title: '部门管理', icon: 'cluster' }
      },
      {
        path: 'system/post',
        element: lazyLoad(lazy(() => import('@/views/system/post'))),
        meta: { title: '岗位管理', icon: 'idcard' }
      },
      {
        path: 'system/dict',
        element: lazyLoad(lazy(() => import('@/views/system/dict'))),
        meta: { title: '字典管理', icon: 'book' }
      },
      {
        path: 'system/config',
        element: lazyLoad(lazy(() => import('@/views/system/config'))),
        meta: { title: '参数设置', icon: 'setting' }
      },
      {
        path: 'system/notice',
        element: lazyLoad(lazy(() => import('@/views/system/notice'))),
        meta: { title: '通知公告', icon: 'notification' }
      },
      // 系统监控模块
      {
        path: 'monitor/cache',
        element: lazyLoad(lazy(() => import('@/views/monitor/cache'))),
        meta: { title: '缓存监控', icon: 'database' }
      },
      {
        path: 'monitor/cache-list',
        element: lazyLoad(lazy(() => import('@/views/monitor/cache/list'))),
        meta: { title: '缓存列表', icon: 'unordered-list', hidden: true }
      },
      {
        path: 'monitor/druid',
        element: lazyLoad(lazy(() => import('@/views/monitor/druid'))),
        meta: { title: 'Druid 监控', icon: 'dashboard' }
      },
      {
        path: 'monitor/server',
        element: lazyLoad(lazy(() => import('@/views/monitor/server'))),
        meta: { title: '服务监控', icon: 'monitor' }
      },
      {
        path: 'monitor/job',
        element: lazyLoad(lazy(() => import('@/views/monitor/job'))),
        meta: { title: '定时任务', icon: 'clock-circle' }
      },
      {
        path: 'monitor/job-log/index/:jobId?',
        element: lazyLoad(lazy(() => import('@/views/monitor/job/log'))),
        meta: { title: '任务日志', icon: 'file-text', hidden: true }
      },
      {
        path: 'monitor/online',
        element: lazyLoad(lazy(() => import('@/views/monitor/online'))),
        meta: { title: '在线用户', icon: 'usergroup-add' }
      },
      // 日志管理模块
      {
        path: 'monitor/operlog',
        element: lazyLoad(lazy(() => import('@/views/monitor/operlog'))),
        meta: { title: '操作日志', icon: 'file-text' }
      },
      {
        path: 'monitor/logininfor',
        element: lazyLoad(lazy(() => import('@/views/monitor/logininfor'))),
        meta: { title: '登录日志', icon: 'login' }
      },
      // 系统工具模块
      {
        path: 'tool/build',
        element: lazyLoad(lazy(() => import('@/views/tool/build'))),
        meta: { title: '表单构建', icon: 'tool' }
      },
      {
        path: 'tool/gen',
        element: lazyLoad(lazy(() => import('@/views/tool/gen'))),
        meta: { title: '代码生成', icon: 'code' }
      },
      {
        path: 'tool/gen-edit/index/:tableId',
        element: lazyLoad(lazy(() => import('@/views/tool/gen/editTable'))),
        meta: { title: '修改生成配置', icon: 'edit', hidden: true, activeMenu: '/tool/gen' }
      },
      {
        path: 'tool/swagger',
        element: lazyLoad(lazy(() => import('@/views/tool/swagger'))),
        meta: { title: '系统接口', icon: 'api' }
      }
    ]
  }
]

// 动态路由（用于权限控制）
export const dynamicRoutes = [
  {
    path: '/system/user-auth/role/:userId',
    element: lazyLoad(lazy(() => import('@/views/system/user'))),
    meta: { title: '分配角色', hidden: true, activeMenu: '/system/user' }
  },
  {
    path: '/system/role-auth/user/:roleId',
    element: lazyLoad(lazy(() => import('@/views/system/role'))),
    meta: { title: '分配用户', hidden: true, activeMenu: '/system/role' }
  }
]

export default constantRoutes
