# 若依管理系统 React 版

这是若依管理系统的 React 版本,使用 React + TypeScript + Ant Design 构建。

## 项目结构

```
RuoYi-React
├── public                # 静态资源
├── src
│   ├── api              # API 接口
│   ├── assets           # 资源文件(样式、图片、图标等)
│   ├── components       # 公共组件
│   ├── directive        # 自定义指令
│   ├── layout           # 布局组件
│   ├── plugins          # 插件配置
│   ├── router           # 路由配置
│   ├── store            # 状态管理(Zustand)
│   ├── types            # TypeScript 类型定义
│   ├── utils            # 工具函数
│   ├── views            # 页面组件
│   ├── App.tsx          # 根组件
│   └── main.tsx         # 入口文件
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- React Router 6
- Zustand (状态管理)
- Axios
- Vite

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

### 构建生产

```bash
npm run build:prod
```

### 预览构建

```bash
npm run preview
```

## 功能特性

- [x] 基础布局结构
- [x] 侧边栏菜单
- [x] 顶部导航栏
- [x] 标签视图
- [x] TypeScript 类型支持
- [ ] 用户登录
- [ ] 权限控制
- [ ] 路由守卫
- [ ] 多环境配置

## 开发说明

本项目是从 RuoYi-Vue3 迁移而来,目录结构尽可能与原 Vue3 版本保持一致。

### 当前状态

- ✅ 基础环境搭建完成
- ✅ 主页已清空内容,只保留布局结构
- ⏳ 其他功能待逐步实现
