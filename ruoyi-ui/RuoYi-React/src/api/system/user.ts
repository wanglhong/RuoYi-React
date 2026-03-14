import request from '@/utils/request'
import type { UserQueryParams, SysUser, UserFormData, DeptTree } from '@/types/user'

// 查询用户列表
export function listUser(query: UserQueryParams) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// 查询用户详细
export function getUser(userId?: number) {
  return request({
    url: '/system/user/' + (userId || ''),
    method: 'get'
  })
}

// 新增用户
export function addUser(data: SysUser) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

// 修改用户
export function updateUser(data: SysUser) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

// 删除用户
export function delUser(userId: number | number[]) {
  const idStr = Array.isArray(userId) ? userId.join(',') : userId.toString()
  return request({
    url: '/system/user/' + idStr,
    method: 'delete'
  })
}

// 用户密码重置
export function resetUserPwd(userId: number, password: string) {
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: {
      userId,
      password
    }
  })
}

// 用户状态修改
export function changeUserStatus(userId: number, status: string) {
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: {
      userId,
      status
    }
  })
}

// 查询部门下拉树结构
export function deptTreeSelect(): Promise<{ code: number; msg: string; data: DeptTree[] }> {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  })
}

// 导出用户
export function exportUser(query: UserQueryParams) {
  return request({
    url: '/system/user/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 导入用户模板
export function importTemplate() {
  return request({
    url: '/system/user/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}
