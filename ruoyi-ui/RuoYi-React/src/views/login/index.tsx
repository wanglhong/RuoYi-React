import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store'
import { getCodeImg } from '@/api/login'
import type { LoginParams } from '@/api/login'
import './index.scss'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [codeUrl, setCodeUrl] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginParams>({
    username: 'admin',
    password: 'admin123',
    rememberMe: false,
    code: '',
    uuid: ''
  })

  const { loginAction } = useUserStore()

  // 获取验证码
  const getCode = async () => {
    if (codeLoading) return // 防止重复请求
    setCodeLoading(true)
    try {
      const res = await getCodeImg()
      console.log('验证码接口返回数据:', res)

      // 检查返回数据结构 - 字段在顶层，不是嵌套在 data 中
      if (!res) {
        throw new Error('验证码接口返回数据为空')
      }

      const { captchaEnabled: enabled, img, uuid, code } = res

      // 检查返回状态码
      if (code !== 200) {
        // 如果是 401 错误，说明后端需要认证，但登录页面不应该需要
        if (code === 401) {
          console.warn('验证码接口返回 401，可能是后端配置问题')
          // 不显示错误，直接使用空验证码或禁用验证码
          setCaptchaEnabled(false)
          return
        }
        throw new Error(res.msg || '验证码获取失败')
      }

      // 设置验证码是否启用
      setCaptchaEnabled(enabled !== false)

      // 如果验证码启用且有图片数据
      if (enabled !== false && img) {
        // 直接使用后端返回的 base64 图片（不包含前缀）
        setCodeUrl('data:image/gif;base64,' + img)
        setLoginForm(prev => ({ ...prev, uuid: uuid || '' }))
        console.log('验证码获取成功，uuid:', uuid)
      } else {
        // 验证码被禁用
        console.log('验证码已禁用')
        setCaptchaEnabled(false)
      }
    } catch (error: any) {
      console.error('获取验证码失败:', error)
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })

      // 401 错误不显示提示，可能是后端配置问题
      if (error.response?.status === 401 || error.code === 401) {
        console.warn('验证码接口需要认证，已自动禁用验证码')
        setCaptchaEnabled(false)
        return
      }

      // 显示错误信息
      if (error.response) {
        // HTTP 错误
        message.error(`验证码获取失败：${error.response.status} ${error.response.statusText}`)
      } else if (error.message) {
        // 其他错误
        message.error(`验证码获取失败：${error.message}`)
      } else {
        message.error('验证码获取失败，请检查网络连接')
      }

      // 清空验证码图片
      setCodeUrl('')
    } finally {
      setCodeLoading(false)
    }
  }

  // 从 localStorage 获取记住的用户名密码
  const getCookie = () => {
    const username = localStorage.getItem('username')
    const password = localStorage.getItem('password')
    const rememberMe = localStorage.getItem('rememberMe')

    if (username && password) {
      setLoginForm({
        username,
        password,
        rememberMe: rememberMe === 'true',
        code: '',
        uuid: ''
      })
      form.setFieldsValue({
        username,
        password,
        rememberMe: rememberMe === 'true'
      })
    }
  }

  useEffect(() => {
    getCode()
    getCookie()
  }, [])

  // 登录
  const handleLogin = async (values: any) => {
    setLoading(true)
    try {
      // 记住密码
      if (values.rememberMe) {
        localStorage.setItem('username', values.username)
        localStorage.setItem('password', values.password)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('username')
        localStorage.removeItem('password')
        localStorage.removeItem('rememberMe')
      }

      await loginAction({
        ...loginForm,
        username: values.username,
        password: values.password,
        code: values.code || ''
      })

      message.success('登录成功')

      // 跳转到重定向地址或首页
      const redirect = (location.state as any)?.from || '/index'
      navigate(redirect, { replace: true })
    } catch (error: any) {
      setLoading(false)
      message.error(error.message || '登录失败')
      // 登录失败后刷新验证码
      if (captchaEnabled) {
        getCode()
      }
    }
  }

  // 验证码图片加载错误处理
  const handleCaptchaError = () => {
    console.error('验证码图片加载失败')
    message.error('验证码图片加载失败，请点击刷新')
    setCodeUrl('')
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">若依后台管理系统</h2>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          initialValues={loginForm}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          {captchaEnabled && (
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div className="captcha-wrapper">
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="验证码"
                  className="captcha-input"
                />
                {codeLoading ? (
                  <div className="captcha-loading">
                    <ReloadOutlined spin />
                  </div>
                ) : codeUrl ? (
                  <img
                    src={codeUrl}
                    alt="验证码"
                    className="captcha-img"
                    onClick={getCode}
                    onError={handleCaptchaError}
                    title="点击刷新验证码"
                  />
                ) : (
                  <div
                    className="captcha-placeholder"
                    onClick={getCode}
                    title="点击获取验证码"
                  >
                    <ReloadOutlined /> 获取验证码
                  </div>
                )}
              </div>
            </Form.Item>
          )}

          <Form.Item name="rememberMe" valuePropName="checked">
            <Checkbox>记住密码</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="login-footer">
        <span>Copyright © 2024 若依管理系统 All Rights Reserved.</span>
      </div>
    </div>
  )
}

export default Login
