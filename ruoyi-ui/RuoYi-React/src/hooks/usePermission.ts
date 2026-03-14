import { useMemo } from 'react'
import { useUserStore } from '@/store'

/**
 * 权限Hook
 * 用于在组件中检查权限
 *
 * @example
 * const { hasPermission, hasRole } = usePermission()
 *
 * if (hasPermission('system:user:add')) {
 *   // 有权限
 * }
 */
export const usePermission = () => {
  const { permissions, roles } = useUserStore()

  /**
   * 检查是否拥有某个权限
   */
  const hasPermission = (permission: string): boolean => {
    // 如果有超级权限
    if (permissions.includes('*:*:*')) {
      return true
    }
    return permissions.includes(permission)
  }

  /**
   * 检查是否拥有任意一个权限
   */
  const hasPermissionOr = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission))
  }

  /**
   * 检查是否拥有所有权限
   */
  const hasPermissionAnd = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission))
  }

  /**
   * 检查是否拥有某个角色
   */
  const hasRoleCheck = (role: string): boolean => {
    // 如果是超级管理员
    if (roles.includes('admin')) {
      return true
    }
    return roles.includes(role)
  }

  /**
   * 检查是否拥有任意一个角色
   */
  const hasRoleOr = (roleList: string[]): boolean => {
    return roleList.some(role => hasRoleCheck(role))
  }

  /**
   * 检查是否拥有所有角色
   */
  const hasRoleAnd = (roleList: string[]): boolean => {
    return roleList.every(role => hasRoleCheck(role))
  }

  /**
   * 过滤有权限的项
   */
  const filterByPermission = <T extends { permission?: string }>(
    items: T[]
  ): T[] => {
    return items.filter(item => {
      if (!item.permission) return true
      return hasPermission(item.permission)
    })
  }

  /**
   * 过滤有角色的项
   */
  const filterByRole = <T extends { role?: string }>(items: T[]): T[] => {
    return items.filter(item => {
      if (!item.role) return true
      return hasRoleCheck(item.role)
    })
  }

  return {
    permissions,
    roles,
    hasPermission,
    hasPermissionOr,
    hasPermissionAnd,
    hasRole: hasRoleCheck,
    hasRoleOr,
    hasRoleAnd,
    filterByPermission,
    filterByRole,
  }
}
