import { create } from 'zustand'
import { getRouters } from '@/api/user'
import { filterAsyncRouter, filterHiddenRoutes, extractLayoutChildren } from '@/utils/router'

interface PermissionState {
  routes: any[]
  dynamicRoutes: any[]
  sidebarRouters: any[]
  isLoaded: boolean
}

interface PermissionActions {
  generateRoutes: () => Promise<any[]>
  setSidebarRouters: (routes: any[]) => void
  getSidebarRouters: () => any[]
  resetPermission: () => void
}

const initialState: PermissionState = {
  routes: [],
  dynamicRoutes: [],
  sidebarRouters: [],
  isLoaded: false
}

export const usePermissionStore = create<PermissionState & PermissionActions>()((set, get) => ({
  ...initialState,

  generateRoutes: async () => {
    try {
      const res = await getRouters()

      // 检查状态码
      if (res.code !== 200) {
        throw new Error(res.msg || '获取路由失败')
      }

      // 获取路由数据
      const routerData = res.data || []

      // 转换路由（保留完整结构用于侧边栏）
      const accessedRoutes = filterAsyncRouter(JSON.parse(JSON.stringify(routerData)))

      // 提取 Layout 子路由（用于注册到 React Router）
      const layoutChildren = extractLayoutChildren(JSON.parse(JSON.stringify(routerData)))

      // 过滤隐藏的路由用于侧边栏
      const sidebarRoutes = filterHiddenRoutes(routerData)

      set({
        routes: accessedRoutes,
        dynamicRoutes: layoutChildren,
        sidebarRouters: sidebarRoutes,
        isLoaded: true
      })

      return layoutChildren
    } catch (error) {
      console.error('获取路由失败:', error)
      set({ isLoaded: true })
      return []
    }
  },

  setSidebarRouters: (routes) => {
    set({ sidebarRouters: routes })
  },

  getSidebarRouters: () => {
    return get().sidebarRouters
  },

  resetPermission: () => {
    set(initialState)
  }
}))
