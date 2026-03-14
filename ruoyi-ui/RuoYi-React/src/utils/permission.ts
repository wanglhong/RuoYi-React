import { useUserStore } from '@/store'

/**
 * 权限工具函数
 */

/**
 * 检查是否拥有某个权限
 * @param permission 权限标识（如：'system:user:add'）
 * @returns boolean
 */
export const hasPermi = (permission: string): boolean => {
  const { permissions } = useUserStore.getState()

  // 如果有超级权限
  if (permissions.includes('*:*:*')) {
    return true
  }

  return permissions.includes(permission)
}

/**
 * 检查是否拥有任意一个权限
 * @param permissions 权限标识数组
 * @returns boolean
 */
export const hasPermiOr = (permissions: string[]): boolean => {
  return permissions.some(permission => hasPermi(permission))
}

/**
 * 检查是否拥有所有权限
 * @param permissions 权限标识数组
 * @returns boolean
 */
export const hasPermiAnd = (permissions: string[]): boolean => {
  return permissions.every(permission => hasPermi(permission))
}

/**
 * 检查是否拥有某个角色
 * @param role 角色标识（如：'admin'）
 * @returns boolean
 */
export const hasRole = (role: string): boolean => {
  const { roles } = useUserStore.getState()

  // 如果是超级管理员
  if (roles.includes('admin')) {
    return true
  }

  return roles.includes(role)
}

/**
 * 检查是否拥有任意一个角色
 * @param roles 角色标识数组
 * @returns boolean
 */
export const hasRoleOr = (roles: string[]): boolean => {
  return roles.some(role => hasRole(role))
}

/**
 * 检查是否拥有所有角色
 * @param roles 角色标识数组
 * @returns boolean
 */
export const hasRoleAnd = (roles: string[]): boolean => {
  return roles.every(role => hasRole(role))
}
