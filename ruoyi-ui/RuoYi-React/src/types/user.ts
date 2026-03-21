// 用户相关类型定义

// 用户查询参数
export interface UserQueryParams {
  pageNum?: number
  pageSize?: number
  userName?: string
  phonenumber?: string
  status?: string
  deptId?: number
  beginTime?: string
  endTime?: string
}

// 角色查询参数
export interface RoleQueryParams {
  pageNum?: number
  pageSize?: number
  roleName?: string
  roleKey?: string
  status?: string
  beginTime?: string
  endTime?: string
}

// 授权用户查询参数
export interface AuthUserQueryParams {
  pageNum?: number
  pageSize?: number
  roleId?: number
  userName?: string
  phonenumber?: string
}

// 用户和角色关联信息
export interface SysUserRole {
  userId?: number
  roleId: number
}

// 批量授权用户参数
export interface AuthUserSelectParams {
  roleId: number
  userIds: string
}

// 用户信息
export interface SysUser {
  userId?: number
  deptId?: number
  userName?: string
  nickName?: string
  userEmail?: string
  phonenumber?: string
  sex?: string
  avatar?: string
  status?: string
  delFlag?: string
  loginIp?: string
  loginDate?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
  dept?: DeptInfo
  roles?: SysRole[]
  roleIds?: number[]
  postIds?: number[]
  roleId?: number | number[]
}

// 部门信息
export interface DeptInfo {
  deptId?: number
  parentId?: number
  deptName?: string
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: string
  delFlag?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  children?: DeptInfo[]
}

// 角色信息
export interface SysRole {
  roleId?: number
  roleName?: string
  roleKey?: string
  roleSort?: number | string
  dataScope?: '1' | '2' | '3' | '4' | '5'
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  status?: '0' | '1'
  delFlag?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
  menuIds?: number[]
  deptIds?: number[]
  flag?: boolean | string
  username?: string
  password?: string
}

// 岗位信息
export interface SysPost {
  postId?: number
  postCode?: string
  postName?: string
  postSort?: number
  status?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
}

// 用户表单数据
export interface UserFormData {
  user: SysUser
  posts: SysPost[]
  roles: SysRole[]
  postIds: number[]
  roleIds: number[]
}

// 部门树结构
export interface DeptTree {
  id: number
  label: string
  disabled?: boolean
  children?: DeptTree[]
}

// 个人中心相关类型
export interface UserProfileResult {
  code: number
  msg: string
  data: SysUser
  roleGroup: string
  postGroup: string
}

export interface UserProfileAvatarResult {
  code: number
  msg: string
  imgUrl: string
}

// 用户授权角色响应
export interface UserAuthRoleResult {
  code: number
  msg: string
  user: SysUser
  roles: SysRole[]
}

// 类型别名导出
export type Post = SysPost
export type Role = SysRole
