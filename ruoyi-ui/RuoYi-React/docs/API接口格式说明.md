# API接口返回格式说明

## 概述

若依后端接口返回的数据格式统一为JSON，字段在顶层，不是嵌套在`data`对象中。

## 统一格式

```typescript
{
  code: number,      // 状态码，200表示成功
  msg: string,       // 提示信息
  [key: string]: any // 其他业务字段
}
```

## 各接口返回格式

### 1. 登录接口

**URL**: `POST /login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123",
  "code": "验证码",
  "uuid": "验证码uuid"
}
```

**返回格式**:
```json
{
    "msg": "操作成功",
    "code": 200,
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImxvZ2luX3VzZXJfa2V5IjoiZTkwODcwMGYtMGY2NS00ZjViLTkyZjYtMjVmOTk1MjAwM2ZjIn0.xTqIHR8ppqTlwDRQnR21tSWsvQYlAKeI1DCiIq8ZmSjgZlCHjmQcu07BS_V_sWQqKbfWN5ufpdPXz88BIjST6g"
}
```

**字段说明**:
- `code`: 状态码，200表示成功
- `msg`: 提示信息
- `token`: JWT令牌，需要保存到本地存储

---

### 2. 获取验证码接口

**URL**: `GET /captchaImage`

**返回格式**:
```json
{
    "msg": "操作成功",
    "img": "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL...",
    "code": 200,
    "captchaEnabled": true,
    "uuid": "1ba604bc2326449084c22f0fce6f26e6"
}
```

**字段说明**:
- `code`: 状态码，200表示成功
- `msg`: 提示信息
- `captchaEnabled`: 是否启用验证码
- `uuid`: 验证码唯一标识，登录时需要传回
- `img`: Base64编码的图片（不包含`data:image/gif;base64,`前缀）

---

### 3. 获取用户信息接口

**URL**: `GET /getInfo`

**返回格式**:
```json
{
    "msg": "操作成功",
    "code": 200,
    "permissions": ["*:*:*"],
    "roles": ["admin"],
    "user": {
        "userId": 1,
        "userName": "admin",
        "nickName": "管理员",
        "avatar": "https://...",
        "email": "admin@example.com",
        "phonenumber": "13800138000",
        "sex": "0",
        "deptId": 103
    }
}
```

**字段说明**:
- `code`: 状态码，200表示成功
- `msg`: 提示信息
- `permissions`: 权限列表（顶层字段）
- `roles`: 角色列表（顶层字段）
- `user`: 用户信息对象（顶层字段）

**注意**: `permissions`、`roles`、`user` 都在顶层，不在 `data` 中！

---

### 4. 退出登录接口

**URL**: `POST /logout`

**返回格式**:
```json
{
    "msg": "操作成功",
    "code": 200
}
```

---

## 前端处理方式

### 在API层定义类型

```typescript
// src/api/login.ts
export interface LoginResult {
  msg: string
  code: number
  token: string
}

export function login(data: LoginParams): Promise<LoginResult> {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}
```

### 在Store中处理

```typescript
// src/store/modules/user.ts
loginAction: async (loginForm: LoginParams) => {
  const res = await login(loginForm)
  
  // 检查状态码
  if (res.code !== 200) {
    throw new Error(res.msg || '登录失败')
  }
  
  // 直接从顶层获取token
  const token = res.token
  set({ token })
  setToken(token)
}
```

---

## 错误处理

### 业务错误

当`code !== 200`时，表示业务逻辑错误：

```json
{
    "code": 500,
    "msg": "用户名或密码错误"
}
```

前端处理：
```typescript
if (res.code !== 200) {
  throw new Error(res.msg || '操作失败')
}
```

### HTTP错误

当HTTP状态码不是2xx时，会触发Axios拦截器错误：

```typescript
// src/utils/request.ts
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    if (res.code !== 200) {
      message.error(res.msg || 'Error')
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 跳转登录页
      }
      
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    
    return res
  }
)
```

---

## 常见问题

### 1. Cannot read properties of undefined (reading 'token')

**原因**: 尝试访问`res.data.token`，但token字段在顶层

**解决**: 直接访问`res.token`

### 2. 如何判断请求成功？

检查`code === 200`

### 3. 如何获取错误信息？

读取`msg`字段

---

## 对比其他系统

有些系统的返回格式会嵌套在`data`中：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "token": "xxx",
    "user": {}
  }
}
```

**若依系统的特点**: 字段直接在顶层，没有嵌套的`data`对象。

---

## 完整示例

### 登录流程

```typescript
// 1. 调用登录接口
const res = await login({
  username: 'admin',
  password: 'admin123',
  code: '1234',
  uuid: 'xxx'
})

// 2. 检查状态码
if (res.code !== 200) {
  throw new Error(res.msg)
}

// 3. 获取token
const token = res.token

// 4. 保存token
setToken(token)
```

### 获取验证码流程

```typescript
// 1. 调用接口
const res = await getCodeImg()

// 2. 检查状态码
if (res.code !== 200) {
  throw new Error(res.msg)
}

// 3. 获取验证码信息
const { img, uuid, captchaEnabled } = res

// 4. 显示验证码
setCodeUrl('data:image/gif;base64,' + img)
```
