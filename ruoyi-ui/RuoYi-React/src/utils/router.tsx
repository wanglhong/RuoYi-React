import React, { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import Layout from '@/layout'

/**
 * 动态路由处理工具
 */

// 懒加载组件包装器
const lazyLoad = (Component: React.LazyExoticComponent<React.FC>) => {
  return React.createElement(
    React.Suspense,
    {
      fallback: React.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }
      }, '加载中...')
    },
    React.createElement(Component)
  )
}

// 错误组件
const ErrorComponent = (message: string) => {
  return React.createElement('div', {
    style: {
      padding: '20px',
      textAlign: 'center',
      color: '#ff4d4f'
    }
  }, [
    React.createElement('h3', { key: 'title' }, '组件加载失败'),
    React.createElement('p', { key: 'message' }, message)
  ])
}

// 组件映射表 - 用于将后端返回的组件路径字符串映射到实际的组件
const componentMap: Record<string, any> = {
  'Layout': Layout,
  'ParentView': React.Fragment,
}

// 动态导入 views 下的组件
const modules = import.meta.glob('../views/**/*.tsx')

/**
 * 根据组件路径加载组件
 * @param componentPath 组件路径（如：'system/user/index'）
 */
const loadComponent = (componentPath: string) => {
  // 特殊组件处理
  if (componentMap[componentPath]) {
    return componentMap[componentPath]
  }

  // 动态导入 views 下的组件
  const directPath = `../views/${componentPath}.tsx`
  if (modules[directPath]) {
    return lazy(modules[directPath] as any)
  }

  // 尝试匹配 index.tsx
  const indexPath = `../views/${componentPath}/index.tsx`
  if (modules[indexPath]) {
    return lazy(modules[indexPath] as any)
  }

  // 尝试匹配 Index.tsx (大写)
  const indexPathCapital = `../views/${componentPath}/Index.tsx`
  if (modules[indexPathCapital]) {
    return lazy(modules[indexPathCapital] as any)
  }

  // 尝试去掉 /index 后缀再匹配
  if (componentPath.endsWith('/index') || componentPath.endsWith('/Index')) {
    const basePath = componentPath.replace(/\/(index|Index)$/, '')
    const basePathKey = `../views/${basePath}/index.tsx`
    if (modules[basePathKey]) {
      return lazy(modules[basePathKey] as any)
    }
  }

  // 遍历所有模块查找匹配
  for (const key in modules) {
    const modulePath = key.replace('../views/', '').replace('.tsx', '')
    if (modulePath === componentPath ||
        modulePath === `${componentPath}/index` ||
        modulePath === `${componentPath}/Index` ||
        modulePath.replace('/index', '') === componentPath.replace('/index', '')) {
      return lazy(modules[key] as any)
    }
  }

  console.error(`组件未找到：${componentPath}`)
  return () => ErrorComponent(`未找到组件：${componentPath}`) as any
}

/**
 * 创建外部链接跳转组件
 * @param url 外部链接地址
 */
const createExternalLinkComponent = (url: string) => {
  const ExternalLinkComponent = () => {
    React.useEffect(() => {
      // 在新标签页打开外部链接
      window.open(url, '_blank')
      // 跳转到首页
      window.location.href = '/'
    }, [url])
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }
    }, '正在跳转...')
  }
  return ExternalLinkComponent
}

/**
 * 过滤异步路由 - 将后端路由数据转换为 React Router 路由格式
 * 参考 Vue 版本的 filterAsyncRouter 实现
 * @param asyncRouterMap 后端返回的路由数据
 */
export const filterAsyncRouter = (asyncRouterMap: any[]): any[] => {
  return asyncRouterMap.filter(route => {
    // 处理外部链接路由（meta.link 存在且不为 null）
    if (route.meta?.link) {
      // 创建外部链接跳转组件
      route.element = createExternalLinkComponent(route.meta.link)
      // 删除 component 字段
      delete route.component
    }
    // 处理组件
    else if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.element = React.createElement(Layout)
      } else if (route.component === 'ParentView') {
        // ParentView 用 Outlet 渲染子路由
        route.element = React.createElement(React.Fragment)
      } else {
        // 动态加载组件
        const component = loadComponent(route.component)
        if (component) {
          if (React.lazy && component.$$typeof === Symbol.for('react.lazy')) {
            route.element = lazyLoad(component)
          } else {
            route.element = React.createElement(component)
          }
        }
      }
      // 删除 component 字段，因为已经转换为 element
      delete route.component
    }

    // 递归处理子路由
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    } else {
      delete route.children
      delete route.redirect
    }

    return true
  })
}

/**
 * 提取 Layout 子路由 - 将所有 Layout 下的子路由提取出来
 * 用于注册到 App.tsx 中已有的 Layout 组件下
 * @param routes 路由数据
 */
export const extractLayoutChildren = (routes: any[]): any[] => {
  const result: any[] = []

  routes.forEach(route => {
    // 如果是 Layout 组件的路由，提取其子路由
    if (route.component === 'Layout' && route.children && route.children.length > 0) {
      route.children.forEach((child: any) => {
        // 拼接路径：父路径 + 子路径
        const childPath = route.path + '/' + child.path
        const fullPath = childPath.replace(/\/+/g, '/')

        // 处理外部链接子路由
        if (child.meta?.link) {
          const newChild: any = {
            path: fullPath,
            name: child.name,
            meta: child.meta,
            hidden: child.hidden,
            element: createExternalLinkComponent(child.meta.link)
          }
          result.push(newChild)
        }
        // 处理组件转换
        else if (child.component) {
          if (child.component === 'Layout') {
            // 子路由也是 Layout，递归处理
          } else if (child.component === 'ParentView') {
            const element = React.createElement(React.Fragment)
            const newChild: any = {
              path: fullPath,
              name: child.name,
              meta: child.meta,
              hidden: child.hidden,
              element,
            }
            // 如果子路由还有子路由，递归处理
            if (child.children && child.children.length > 0) {
              const nestedChildren = processNestedRoute(child, fullPath)
              result.push(...nestedChildren)
            } else {
              result.push(newChild)
            }
          } else {
            const component = loadComponent(child.component)
            if (component) {
              let element = null
              if (React.lazy && component.$$typeof === Symbol.for('react.lazy')) {
                element = lazyLoad(component)
              } else {
                element = React.createElement(component)
              }
              const newChild: any = {
                path: fullPath,
                name: child.name,
                meta: child.meta,
                hidden: child.hidden,
                element,
              }
              // 如果子路由还有子路由，递归处理
              if (child.children && child.children.length > 0) {
                const nestedChildren = processNestedRoute(child, fullPath)
                result.push(...nestedChildren)
              } else {
                result.push(newChild)
              }
            }
          }
        }
      })
    } else if (route.component !== 'Layout') {
      // 非 Layout 的顶级路由，保留
      result.push(route)
    }
  })

  return result
}

/**
 * 处理嵌套路由 - 将多级嵌套路由平铺
 * @param route 路由对象
 * @param parentPath 父路径
 */
const processNestedRoute = (route: any, parentPath: string): any[] => {
  const result: any[] = []

  if (route.children && route.children.length > 0) {
    route.children.forEach((child: any) => {
      const fullPath = parentPath + '/' + child.path

      // 处理外部链接子路由
      if (child.meta?.link) {
        const newChild: any = {
          path: fullPath,
          name: child.name,
          meta: child.meta,
          hidden: child.hidden,
          element: createExternalLinkComponent(child.meta.link)
        }
        result.push(newChild)
        return
      }

      // 处理组件转换
      let element = null
      if (child.component) {
        if (child.component === 'ParentView') {
          element = React.createElement(React.Fragment)
        } else if (child.component !== 'Layout') {
          const component = loadComponent(child.component)
          if (component) {
            if (React.lazy && component.$$typeof === Symbol.for('react.lazy')) {
              element = lazyLoad(component)
            } else {
              element = React.createElement(component)
            }
          }
        }
      }

      const newChild: any = {
        path: fullPath.replace(/\/+/g, '/'),
        name: child.name,
        meta: child.meta,
        hidden: child.hidden,
        element,
      }

      if (child.children && child.children.length > 0) {
        // 继续递归处理
        const nested = processNestedRoute(child, fullPath)
        result.push(...nested)
      } else {
        result.push(newChild)
      }
    })
  } else {
    // 处理外部链接
    if (route.meta?.link) {
      result.push({
        path: parentPath,
        name: route.name,
        meta: route.meta,
        hidden: route.hidden,
        element: createExternalLinkComponent(route.meta.link)
      })
      return
    }

    // 处理组件转换
    let element = null
    if (route.component) {
      if (route.component === 'ParentView') {
        element = React.createElement(React.Fragment)
      } else if (route.component !== 'Layout') {
        const component = loadComponent(route.component)
        if (component) {
          if (React.lazy && component.$$typeof === Symbol.for('react.lazy')) {
            element = lazyLoad(component)
          } else {
            element = React.createElement(component)
          }
        }
      }
    }

    result.push({
      path: parentPath,
      name: route.name,
      meta: route.meta,
      hidden: route.hidden,
      element,
    })
  }

  return result
}

/**
 * 将路由数据转换为 React Router 的 Routes 格式
 * @param routes 路由数据
 */
export const generateReactRoutes = (routes: any[]): any[] => {
  return routes.map(route => {
    const routeConfig: any = {
      path: route.path,
      element: route.element,
    }

    if (route.children && route.children.length > 0) {
      routeConfig.children = generateReactRoutes(route.children)
    }

    return routeConfig
  })
}

/**
 * 平铺路由 - 用于侧边栏菜单渲染
 * @param routes 路由数据
 * @param basePath 基础路径
 */
export const flattenRoutes = (routes: any[], basePath = ''): any[] => {
  let result: any[] = []

  routes.forEach(route => {
    const fullPath = basePath ? `${basePath}/${route.path}`.replace(/\/+/g, '/') : route.path

    const routeItem = {
      ...route,
      fullPath,
    }

    if (!route.hidden) {
      result.push(routeItem)
    }

    if (route.children && route.children.length > 0) {
      const children = flattenRoutes(route.children, fullPath)
      result = result.concat(children)
    }
  })

  return result
}

/**
 * 过滤隐藏的路由 - 用于侧边栏菜单
 * @param routes 路由数据
 */
export const filterHiddenRoutes = (routes: any[]): any[] => {
  return routes.filter(route => !route.hidden).map(route => {
    const newRoute = { ...route }
    if (newRoute.children && newRoute.children.length > 0) {
      newRoute.children = filterHiddenRoutes(newRoute.children)
    }
    return newRoute
  })
}
