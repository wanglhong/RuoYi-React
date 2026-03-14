import React, { useMemo } from 'react'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import * as Icons from '@ant-design/icons'
import { usePermissionStore } from '@/store'
import './Sidebar.scss'

const { Sider } = Layout

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

// 动态获取图标组件
const getIcon = (iconName?: string) => {
  if (!iconName) return null

  // 处理antd图标
  const iconMap: Record<string, any> = {
    'home': Icons.HomeOutlined,
    'system': Icons.SettingOutlined,
    'monitor': Icons.ToolOutlined,
    'tool': Icons.FileTextOutlined,
    'user': Icons.UserOutlined,
    'peoples': Icons.TeamOutlined,
    'menu': Icons.MenuOutlined,
    'dict': Icons.BookOutlined,
    'log': Icons.FileSearchOutlined,
    'online': Icons.UserSwitchOutlined,
    'job': Icons.ScheduleOutlined,
    'druid': Icons.DatabaseOutlined,
    'server': Icons.CloudServerOutlined,
    'cache': Icons.CloudOutlined,
    'form': Icons.FormOutlined,
    'link': Icons.LinkOutlined,
  }

  const IconComponent = iconMap[iconName] || Icons.AppstoreOutlined
  return <IconComponent />
}

// 计算完整路径
const getFullPath = (route: any, parentPath = ''): string => {
  const currentPath = route.path || ''
  
  // 如果是绝对路径，直接返回
  if (currentPath.startsWith('/')) {
    return currentPath
  }
  
  // 如果当前路径为空，返回父路径
  if (!currentPath) {
    return parentPath || '/'
  }
  
  // 拼接父路径和当前路径
  return parentPath ? `${parentPath}/${currentPath}`.replace(/\/+/g, '/') : `/${currentPath}`
}

// 递归生成菜单项
const generateMenuItems = (routes: any[], parentPath = ''): any[] => {
  return routes
    .filter(route => !route.hidden)
    .map(route => {
      // 计算完整路径
      const fullPath = getFullPath(route, parentPath)

      // 如果是外部链接（meta.link 存在）
      if (route.meta?.link) {
        // 使用 meta.link 作为 key 的唯一标识
        const menuItem: any = {
          key: `external-${route.name || route.meta.link}`,
          icon: getIcon(route.meta?.icon),
          label: route.meta?.title || route.name || '未命名',
          onClick: () => {
            window.open(route.meta.link, '_blank')
          }
        }
        return menuItem
      }

      const menuItem: any = {
        key: fullPath,
        icon: getIcon(route.meta?.icon),
        label: route.meta?.title || route.name || '未命名',
      }

      // 如果有子路由
      if (route.children && route.children.length > 0) {
        // 过滤隐藏的子路由
        const visibleChildren = route.children.filter((child: any) => !child.hidden)

        if (visibleChildren.length > 0) {
          menuItem.children = generateMenuItems(visibleChildren, fullPath)
        }
      } else {
        // 没有子路由，添加链接
        menuItem.label = <Link to={fullPath}>{menuItem.label}</Link>
      }

      return menuItem
    })
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation()
  const { sidebarRouters } = usePermissionStore()

  // 生成菜单项
  const menuItems = useMemo(() => {
    // 首页菜单项
    const homeMenuItem = {
      key: '/index',
      icon: <Icons.HomeOutlined />,
      label: <Link to="/index">首页</Link>,
    }

    // 如果有动态路由，使用动态路由
    if (sidebarRouters && sidebarRouters.length > 0) {
      console.log('sidebarRouters:', sidebarRouters)
      const items = generateMenuItems(sidebarRouters)
      console.log('生成的菜单项:', items)
      
      // 检查是否已经包含首页菜单
      const hasHome = items.some((item: any) => item.key === '/index')
      
      // 如果没有首页菜单，添加到最前面
      if (!hasHome) {
        return [homeMenuItem, ...items]
      }
      
      return items
    }

    // 否则使用默认菜单
    return [
      homeMenuItem,
      {
        key: '/system',
        icon: <Icons.SettingOutlined />,
        label: '系统管理',
        children: [
          {
            key: '/system/user',
            label: <Link to="/system/user">用户管理</Link>,
          },
          {
            key: '/system/role',
            label: <Link to="/system/role">角色管理</Link>,
          },
          {
            key: '/system/menu',
            label: <Link to="/system/menu">菜单管理</Link>,
          },
          {
            key: '/system/dept',
            label: <Link to="/system/dept">部门管理</Link>,
          },
        ],
      },
    ]
  }, [sidebarRouters])

  // 获取当前选中的菜单项
  const selectedKeys = useMemo(() => {
    const path = location.pathname
    // 如果是外部链接路径，不选中任何菜单项
    if (path.startsWith('/http://') || path.startsWith('/https://')) {
      return []
    }
    return [path]
  }, [location.pathname])

  // 获取默认展开的菜单项
  const defaultOpenKeys = useMemo(() => {
    const path = location.pathname
    const keys: string[] = []

    // 获取父级路径
    const pathArr = path.split('/').filter(Boolean)
    if (pathArr.length > 1) {
      keys.push('/' + pathArr[0])
    }

    return keys
  }, [location.pathname])

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="sidebar-container"
      width={200}
      theme="light"
    >
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems}
        className="sidebar-menu"
      />
    </Sider>
  )
}

export default Sidebar
