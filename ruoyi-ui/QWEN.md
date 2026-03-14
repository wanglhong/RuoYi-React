# 我的 Web 项目开发规范

## 项目概述

这是若依管理系统的React版本实现，从Vue3迁移而来，使用React + TypeScript + Ant Design技术栈。

## 技术栈

- 前端框架：React + TypeScript
- 类型系统：TypeScript 5.3.3+
- 构建工具：Vite 5.0.8+
- UI 组件库：Ant Design of React
- 状态管理：Zustand
- 路由：React Router v6
- HTTP 客户端：Axios
- 代码规范：ESLint + Prettier

## 技术亮点

### 1. 完全遵循若依API格式
所有接口适配若依后端返回格式（字段在顶层）

### 2. 防止重复调用
使用useRef标记防止React StrictMode导致的重复请求

### 3. 权限系统完整
支持三种权限验证方式：
- Auth组件
- usePermission Hook
- 工具函数

### 4. 动态路由
完全支持后端配置路由，自动加载组件

### 5. 类型安全
完整的TypeScript类型定义

## 编码规范

- 使用 Hooks（如 useState、useEffect、自定义 Hooks）而不是 Class 组件
- 所有组件和逻辑文件必须使用 TypeScript（.tsx / .ts）
- 组件名使用 PascalCase（如 UserProfile.tsx）
- 非组件文件（如工具函数、Hooks、页面路由）使用 kebab-case（如 user-profile.ts 或 use-user-data.ts）
- 函数和变量使用 camelCase（如 fetchData、isLoading）
- 常量使用 UPPER_SNAKE_CASE（如 API_BASE_URL、MAX_RETRY_COUNT）
- 所有导出的（公共）函数、自定义 Hooks 和组件 Props 必须有 JSDoc 注释

## 开发流程

- 提交信息使用中文，格式：类型: 简短描述
- 所有 PR 必须通过 ESLint 检查
- 重要功能需要编写单元测试

## 权限使用示例

### 方式1: Auth组件
```tsx
import Auth from '@/components/Auth'

<Auth permission="system:user:add">
  <Button type="primary">新增用户</Button>
</Auth>
```

### 方式2: Hook
```tsx
import { usePermission } from '@/hooks'

const { hasPermission } = usePermission()

{hasPermission('system:user:add') && <Button>新增</Button>}
```

### 方式3: 工具函数
```tsx
import { hasPermi } from '@/utils/permission'

if (hasPermi('system:user:add')) {
  // 有权限
}
```

## 项目结构

```
RuoYi-React/
├── src/
│   ├── api/                    # API接口
│   ├── assets/                 # 静态资源
│   ├── components/             # 公共组件
│   │   ├── AuthGuard/         # 路由守卫
│   │   └── Auth/              # 权限组件
│   ├── hooks/                  # 自定义Hook
│   │   └── usePermission      # 权限Hook
│   ├── layout/                 # 布局组件
│   │   ├── index.tsx          # 主布局
│   │   └── components/        # 布局子组件
│   ├── router/                 # 路由配置
│   ├── store/                  # 状态管理
│   │   └── modules/
│   │       ├── user.ts        # 用户状态
│   │       ├── permission.ts  # 权限状态
│   │       └── settings.ts    # 设置状态
│   ├── types/                  # 类型定义
│   ├── utils/                  # 工具函数
│   │   ├── request.ts         # Axios封装
│   │   ├── auth.ts            # Token管理
│   │   ├── permission.ts      # 权限工具
│   │   └── router.tsx         # 路由工具
│   ├── views/                  # 页面组件
│   │   ├── login/             # 登录页
│   │   ├── index/             # 首页
│   │   └── error/             # 错误页
│   ├── App.tsx                # 根组件
│   └── main.tsx               # 入口文件
├── docs/                       # 文档
└── package.json
```

## 文档索引

- [动态路由和权限控制使用指南](./RuoYi-React/docs/动态路由和权限控制使用指南.md)
- [API接口格式说明](./RuoYi-React/docs/API接口格式说明.md)
- [路由和权限加载优化](./RuoYi-React/docs/路由和权限加载优化.md)
- [优化完成总结](./RuoYi-React/docs/优化完成总结.md)
- [验证码功能说明](./RuoYi-React/docs/验证码功能说明.md)

## 与Vue3版本对比

| 功能 | Vue3版本 | React版本 | 状态 |
|------|---------|----------|------|
| 基础布局 | Element Plus | Ant Design | ✅ |
| 路由守卫 | Vue Router | React Router | ✅ |
| 状态管理 | Pinia | Zustand | ✅ |
| 动态路由 | ✅ | ✅ | ✅ |
| 权限控制 | ✅ | ✅ | ✅ |
| 登录功能 | ✅ | ✅ | ✅ |
| 验证码 | ✅ | ✅ | ✅ |

## 已实现功能

### 1. 基础架构 ✅
- React 18 + TypeScript
- Vite构建工具
- Ant Design 5 UI框架
- Zustand状态管理
- React Router 6路由

### 2. 布局系统 ✅
- 主布局组件
- 顶部导航栏
- 侧边栏菜单（支持折叠）
- 内容区域
- 底部栏

### 3. 路由权限 ✅
- 路由守卫
- 白名单机制
- Token管理
- NProgress进度条
- 防重复调用

### 4. 登录功能 ✅
- 用户名密码验证码登录
- 记住密码
- Token自动管理
- 登录后跳转

### 5. 退出登录 ✅
- 确认对话框
- 退出接口调用
- 清除用户数据
- 清除权限数据
- 跳转登录页

### 6. 动态路由 ✅
- 后端路由配置
- 自动组件加载
- 路由懒加载
- 嵌套路由支持

### 7. 动态菜单 ✅
- 根据路由自动生成
- 多级菜单支持
- 图标自动映射
- 权限过滤

### 8. 权限控制 ✅
- 页面级权限
- 按钮级权限
- 角色验证
- 权限组件
- 权限Hook

### 9. 用户管理 ✅
- 用户列表查询
- 搜索筛选
- 新增用户
- 编辑用户
- 删除用户（单个/批量）
- 状态修改
- 重置密码
- 权限控制

## 特殊要求
- 优先考虑性能和用户体验
- 支持响应式设计，兼容移动端
- 所有用户输入必须进行验证
- 错误处理要友好且信息明确