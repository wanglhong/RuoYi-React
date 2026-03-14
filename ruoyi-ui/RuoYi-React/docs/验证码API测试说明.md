# 验证码API测试说明

## 当前实现

登录页面会从后端API `GET /captchaImage` 获取验证码图片。

### API请求流程

1. **请求地址**: `GET /dev-api/captchaImage`
2. **代理配置**: Vite会将 `/dev-api` 代理到 `http://localhost:8080`
3. **实际请求**: `http://localhost:8080/captchaImage`

## 后端API要求

### 接口信息
- **URL**: `/captchaImage`
- **Method**: `GET`
- **无需认证**: 该接口不需要token

### 返回数据格式

```json
{
    "msg": "操作成功",
    "img": "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL...",
    "code": 200,
    "captchaEnabled": true,
    "uuid": "1ba604bc2326449084c22f0fce6f26e6"
}
```

**注意**: 字段在顶层，不是嵌套在`data`对象中！

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | number | 是 | 状态码，200表示成功 |
| msg | string | 否 | 提示信息 |
| captchaEnabled | boolean | 是 | 是否启用验证码 |
| uuid | string | 是 | 验证码唯一标识，登录时需要传回 |
| img | string | 是 | Base64编码的图片（不含前缀） |

### 验证码图片说明
- `img` 字段是纯Base64字符串，**不包含** `data:image/gif;base64,` 前缀
- 前端会自动添加前缀：`'data:image/gif;base64,' + img`
- 推荐图片尺寸：120x40 像素
- 支持格式：GIF、PNG、JPEG

## 测试方法

### 方法1: 浏览器直接测试

打开浏览器控制台(F12)，在Network标签页查看：

1. 访问登录页：`http://localhost:3000/login`
2. 查看 `/captchaImage` 请求
3. 检查Response数据格式是否正确

### 方法2: Postman测试

```
GET http://localhost:8080/captchaImage
```

检查返回的JSON格式是否正确。

### 方法3: 使用curl测试

```bash
curl http://localhost:8080/captchaImage
```

## 常见问题

### 1. 验证码图片不显示

**检查项**:
- [ ] 后端服务是否启动（默认端口8080）
- [ ] API接口路径是否正确
- [ ] 返回的`img`字段是否是有效的Base64字符串
- [ ] 返回的`captchaEnabled`是否为`true`
- [ ] 检查浏览器控制台是否有CORS错误

**调试步骤**:
```javascript
// 打开浏览器控制台(F12)，查看：
// 1. Network标签 - 检查API请求状态
// 2. Console标签 - 查看错误日志
// 3. 代码会输出: "验证码获取成功, uuid: xxx"
```

### 2. API返回404

**原因**: 后端接口路径不匹配

**解决方案**: 
- 检查后端路由配置
- 确认接口路径是 `/captchaImage` 还是 `/api/captchaImage`
- 如果需要修改，编辑 `vite.config.ts` 的proxy配置

### 3. CORS跨域错误

**解决方案**:
确保后端配置了CORS：
```java
// Spring Boot示例
@CrossOrigin(origins = "http://localhost:3000")
@GetMapping("/captchaImage")
public AjaxResult getCode() {
    // ...
}
```

### 4. 图片Base64格式错误

**问题**: 返回的img字段已包含前缀

**解决方案**:
如果后端返回的img已包含 `data:image/gif;base64,` 前缀，需要修改前端代码：

```typescript
// src/views/login/index.tsx 第53行
// 修改前:
setCodeUrl('data:image/gif;base64,' + img)

// 修改后:
setCodeUrl(img.startsWith('data:') ? img : 'data:image/gif;base64,' + img)
```

## 代理配置说明

当前配置（`vite.config.ts`）：

```typescript
server: {
  port: 3000,
  proxy: {
    '/dev-api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/dev-api/, '')
    }
  }
}
```

**请求转换**:
```
前端请求: /dev-api/captchaImage
↓ (Vite代理)
后端请求: http://localhost:8080/captchaImage
```

## 修改代理配置

如果后端地址不是 `localhost:8080`，修改：

```typescript
proxy: {
  '/dev-api': {
    target: 'http://your-backend-host:port',  // 修改这里
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/dev-api/, '')
  }
}
```

## 验证码禁用

如果后端不需要验证码，返回：

```json
{
  "code": 200,
  "data": {
    "captchaEnabled": false
  }
}
```

登录表单将不会显示验证码输入框。

## 后端开发建议

如果后端还未实现该接口，可以参考以下伪代码：

```java
@GetMapping("/captchaImage")
public AjaxResult getCode() {
    // 生成验证码文本
    String code = generateRandomCode(4);
    
    // 生成验证码图片并转为Base64
    String base64 = generateCaptchaImage(code);
    
    // 生成唯一标识
    String uuid = UUID.randomUUID().toString();
    
    // 存储验证码到Redis（用于后续验证）
    redisCache.setCacheObject("captcha:" + uuid, code, 5, TimeUnit.MINUTES);
    
    return AjaxResult.success()
        .put("captchaEnabled", true)
        .put("uuid", uuid)
        .put("img", base64);
}
```

## 前端调试日志

打开浏览器控制台，会看到以下日志：

- ✅ 成功: `验证码获取成功, uuid: xxx`
- ❌ 失败: `获取验证码失败: 错误信息`
- ⚠️ 加载失败: `验证码图片加载失败`

## 测试清单

- [ ] 后端服务已启动（端口8080）
- [ ] 访问 `http://localhost:8080/captchaImage` 返回正确JSON
- [ ] JSON包含 `captchaEnabled`, `uuid`, `img` 字段
- [ ] `img` 字段是有效的Base64字符串
- [ ] 前端页面能正常显示验证码图片
- [ ] 点击验证码图片可以刷新
- [ ] 登录时能正确提交验证码和uuid
