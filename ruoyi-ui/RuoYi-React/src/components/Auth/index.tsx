import React from 'react'
import { hasPermi, hasPermiOr, hasRole, hasRoleOr } from '@/utils/permission'

interface AuthProps {
  children: React.ReactNode
  // 权限标识
  permission?: string | string[]
  // 角色标识
  role?: string | string[]
  // 权限验证模式：or(任意一个) | and(所有)
  mode?: 'or' | 'and'
}

/**
 * 权限组件
 * 用于控制按钮、组件的显示隐藏
 *
 * @example
 * // 单个权限
 * <Auth permission="system:user:add">
 *   <Button>新增用户</Button>
 * </Auth>
 *
 * // 多个权限(任意一个)
 * <Auth permission={['system:user:add', 'system:user:edit']} mode="or">
 *   <Button>操作</Button>
 * </Auth>
 *
 * // 角色验证
 * <Auth role="admin">
 *   <Button>管理员操作</Button>
 * </Auth>
 */
const Auth: React.FC<AuthProps> = ({
  children,
  permission,
  role,
  mode = 'or'
}) => {
  // 权限验证
  if (permission) {
    const hasPermission = Array.isArray(permission)
      ? (mode === 'or' ? hasPermiOr(permission) : hasPermiAnd(permission))
      : hasPermi(permission)

    if (!hasPermission) {
      return null
    }
  }

  // 角色验证
  if (role) {
    const hasRoleResult = Array.isArray(role)
      ? (mode === 'or' ? hasRoleOr(role) : hasRoleAnd(role))
      : hasRole(role)

    if (!hasRoleResult) {
      return null
    }
  }

  return <>{children}</>
}

// 辅助函数：验证所有权限
const hasPermiAnd = (permissions: string[]): boolean => {
  return permissions.every(permission => hasPermi(permission))
}

// 辅助函数：验证所有角色
const hasRoleAnd = (roles: string[]): boolean => {
  return roles.every(role => hasRole(role))
}

export default Auth
