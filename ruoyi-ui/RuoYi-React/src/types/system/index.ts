import type { BaseEntity, TreeSelect, AjaxResult, PageDomain } from '../common'

/** 菜单查询参数 */
export interface MenuQueryParams {
  /** 菜单名称 */
  menuName?: string
  /** 状态 */
  status?: string
}

/** 菜单信息 */
export interface SysMenu extends BaseEntity {
  /** 菜单编号 */
  menuId?: number
  /** 父菜单 ID */
  parentId?: number
  /** 菜单名称 */
  menuName?: string
  /** 显示顺序 */
  orderNum?: number
  /** 路由地址 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 路由参数 */
  query?: string
  /** 路由名称 */
  routeName?: string
  /** 权限字符串 */
  perms?: string
  /** 菜单图标 */
  icon?: string
  /** 是否为外链（0 是 1 否） */
  isFrame?: '0' | '1'
  /** 是否缓存（0 缓存 1 不缓存） */
  isCache?: '0' | '1'
  /** 类型（M 目录 C 菜单 F 按钮） */
  menuType?: 'M' | 'C' | 'F'
  /** 显示状态（0 显示 1 隐藏） */
  visible?: '0' | '1'
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
  /** 子菜单 */
  children?: SysMenu[]
}

export interface RoleMenuTreeselectResult extends AjaxResult {
  /** 已选中的菜单 ID 列表 */
  checkedKeys: number[]
  /** 菜单树形结构 */
  menus: TreeSelect[]
}

/** 部门查询参数 */
export interface DeptQueryParams {
  /** 部门名称 */
  deptName?: string
  /** 状态 */
  status?: string
}

/** 部门信息 */
export interface SysDept extends BaseEntity {
  /** 部门编号 */
  deptId?: number
  /** 父部门 ID */
  parentId?: number
  /** 祖级列表 */
  ancestors?: string
  /** 部门名称 */
  deptName?: string
  /** 显示顺序 */
  orderNum?: number
  /** 负责人 */
  leader?: string
  /** 联系电话 */
  phone?: string
  /** 邮箱 */
  email?: string
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
  /** 子部门 */
  children?: SysDept[]
}

/** 部门树结构（用于树形选择器） */
export interface DeptTreeSelect {
  id: number
  label: string
  disabled?: boolean
  children?: DeptTreeSelect[]
}

/** 岗位分页查询参数 */
export interface PostQueryParams extends PageDomain {
  /** 岗位编码 */
  postCode?: string
  /** 岗位名称 */
  postName?: string
  /** 状态 */
  status?: string
}

/** 岗位信息 */
export interface SysPost extends BaseEntity {
  /** 岗位编号 */
  postId?: number
  /** 岗位编码 */
  postCode?: string
  /** 岗位名称 */
  postName?: string
  /** 岗位排序 */
  postSort?: number
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
}

/** 字典类型查询参数 */
export interface DictTypeQueryParams extends PageDomain {
  /** 字典名称 */
  dictName?: string
  /** 字典类型 */
  dictType?: string
  /** 状态 */
  status?: string
  beginTime?: string
  endTime?: string
}

/** 字典类型信息 */
export interface SysDictType extends BaseEntity {
  /** 字典主键 */
  dictId?: number
  /** 字典名称 */
  dictName?: string
  /** 字典类型 */
  dictType?: string
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
}

/** 字典数据查询参数 */
export interface DictDataQueryParams extends PageDomain {
  /** 字典类型 */
  dictType?: string
  /** 字典标签 */
  dictLabel?: string
  /** 状态 */
  status?: string
}

/** 字典数据信息 */
export interface SysDictData extends BaseEntity {
  /** 字典编码 */
  dictCode?: number
  /** 字典排序 */
  dictSort?: number
  /** 字典标签 */
  dictLabel?: string
  /** 字典键值 */
  dictValue?: string
  /** 字典类型 */
  dictType?: string
  /** 样式属性 */
  cssClass?: string
  /** 列表显示 */
  listClass?: string
  /** 是否默认（Y 是 N 否） */
  isDefault?: 'Y' | 'N'
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
}

/** 参数配置查询参数 */
export interface ConfigQueryParams extends PageDomain {
  /** 参数名称 */
  configName?: string
  /** 参数键名 */
  configKey?: string
  /** 系统内置（Y 是 N 否） */
  configType?: 'Y' | 'N'
  beginTime?: string
  endTime?: string
}

/** 参数配置信息 */
export interface SysConfig extends BaseEntity {
  /** 参数主键 */
  configId?: number
  /** 参数名称 */
  configName?: string
  /** 参数键名 */
  configKey?: string
  /** 参数键值 */
  configValue?: string
  /** 系统内置（Y 是 N 否） */
  configType?: 'Y' | 'N'
}

/** 通知公告查询参数 */
export interface NoticeQueryParams extends PageDomain {
  /** 公告标题 */
  noticeTitle?: string
  /** 创建者 */
  createBy?: string
  /** 公告类型（1 通知 2 公告） */
  noticeType?: '1' | '2'
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
}

/** 通知公告信息 */
export interface SysNotice extends BaseEntity {
  /** 公告 ID */
  noticeId?: number
  /** 公告标题 */
  noticeTitle?: string
  /** 公告类型（1 通知 2 公告） */
  noticeType?: '1' | '2'
  /** 公告内容 */
  noticeContent?: string
  /** 状态（0 正常 1 停用） */
  status?: '0' | '1'
}

/** 操作日志查询参数 */
export interface OperlogQueryParams extends PageDomain {
  /** 操作地址 */
  operIp?: string
  /** 系统模块 */
  title?: string
  /** 操作人员 */
  operName?: string
  /** 业务类型 */
  businessType?: number
  /** 状态 */
  status?: number
  beginTime?: string
  endTime?: string
}

/** 操作日志信息 */
export interface SysOperLog extends BaseEntity {
  /** 日志主键 */
  operId?: number
  /** 模块标题 */
  title?: string
  /** 业务类型（0 其它 1 新增 2 修改 3 删除） */
  businessType?: number
  /** 方法名称 */
  method?: string
  /** 请求方式 */
  requestMethod?: string
  /** 操作人员 */
  operName?: string
  /** 部门名称 */
  deptName?: string
  /** 请求 URL */
  operUrl?: string
  /** 操作地址 */
  operIp?: string
  /** 操作地点 */
  operLocation?: string
  /** 请求参数 */
  operParam?: string
  /** 返回参数 */
  jsonResult?: string
  /** 操作状态（0 正常 1 异常） */
  status?: number
  /** 错误消息 */
  errorMsg?: string
  /** 消耗时间 */
  costTime?: number
  /** 操作时间 */
  operTime?: string
}

/** 登录日志查询参数 */
export interface LogininforQueryParams extends PageDomain {
  /** 登录地址 */
  ipaddr?: string
  /** 用户名称 */
  userName?: string
  /** 状态 */
  status?: number
  beginTime?: string
  endTime?: string
}

/** 登录日志信息 */
export interface SysLogininfor extends BaseEntity {
  /** 访问编号 */
  infoId?: number
  /** 用户账号 */
  userName?: string
  /** 登录状态（0 成功 1 失败） */
  status?: number
  /** 登录 IP 地址 */
  ipaddr?: string
  /** 登录地点 */
  loginLocation?: string
  /** 浏览器类型 */
  browser?: string
  /** 操作系统 */
  os?: string
  /** 提示消息 */
  msg?: string
  /** 访问时间 */
  loginTime?: string
}
