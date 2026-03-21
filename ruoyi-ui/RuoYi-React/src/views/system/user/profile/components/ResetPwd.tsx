import React, { useState, useRef } from 'react'
import { Form, Input, Button, message } from 'antd'
import type { FormProps } from 'antd'
import { updateUserPwd } from '@/api/system/user'

interface ResetPwdForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const ResetPwd: React.FC = () => {
  const [form] = Form.useForm()
  const isPreventedRef = useRef(false)
  const [loading, setLoading] = useState(false)

  const validateMessages: FormProps['validateMessages'] = {
    required: '${label}不能为空',
    types: {
      email: '${label}不是有效的邮箱地址'
    },
    string: {
      len: '${label}长度应为 ${len}',
      min: '${label}长度至少为 ${min}',
      max: '${label}长度至多为 ${max}'
    }
  }

  // 自定义验证器：确认密码是否一致
  const validateConfirmPassword = async ({ getFieldValue }: any) => ({
    validator: async (_: any, value: string) => {
      if (!value || getFieldValue('newPassword') === value) {
        return Promise.resolve()
      }
      return Promise.reject(new Error('两次输入的密码不一致'))
    }
  })

  const rules: FormProps['rules'] = {
    oldPassword: [{ required: true, message: '旧密码不能为空' }],
    newPassword: [
      { required: true, message: '新密码不能为空' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
      { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |' }
    ],
    confirmPassword: [
      { required: true, message: '确认密码不能为空' },
      validateConfirmPassword
    ]
  }

  const handleSubmit = async (values: ResetPwdForm) => {
    if (isPreventedRef.current) return
    isPreventedRef.current = true

    try {
      setLoading(true)
      await updateUserPwd(values.oldPassword, values.newPassword)
      message.success('修改成功')
      form.resetFields()
    } catch (error: any) {
      message.error(error.message || '修改失败')
    } finally {
      setLoading(false)
      setTimeout(() => {
        isPreventedRef.current = false
      }, 500)
    }
  }

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 600 }}
      validateMessages={validateMessages}
      onFinish={handleSubmit}
    >
      <Form.Item name="oldPassword" label="旧密码" rules={rules.oldPassword}>
        <Input.Password placeholder="请输入旧密码" />
      </Form.Item>
      <Form.Item name="newPassword" label="新密码" rules={rules.newPassword}>
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>
      <Form.Item name="confirmPassword" label="确认密码" rules={rules.confirmPassword}>
        <Input.Password placeholder="请确认新密码" />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          保存
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ResetPwd
