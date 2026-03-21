import React, { useState, useEffect, useRef } from 'react'
import { Form, Input, Radio, Button, Space, message } from 'antd'
import type { FormProps } from 'antd'
import { updateUserProfile } from '@/api/system/user'
import type { SysUser } from '@/types/user'

interface UserInfoProps {
  user?: SysUser
  onUpdated?: () => void
}

interface UserInfoForm {
  nickName: string
  phonenumber: string
  email: string
  sex: string
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onUpdated }) => {
  const [form] = Form.useForm()
  const prevUserRef = useRef<SysUser | undefined>(undefined)
  const isPreventedRef = useRef(false)

  const [loading, setLoading] = useState(false)

  // 回显当前登录用户信息
  useEffect(() => {
    if (user && user.userId) {
      // 防止 StrictMode 下重复执行
      if (prevUserRef.current?.userId === user.userId) {
        return
      }
      prevUserRef.current = user

      form.setFieldsValue({
        nickName: user.nickName,
        phonenumber: user.phonenumber,
        email: user.email,
        sex: user.sex
      })
    }
  }, [user])

  const validateMessages: FormProps['validateMessages'] = {
    required: '${label}不能为空',
    types: {
      email: '${label}不是有效的邮箱地址',
      number: '${label}不是有效的数字'
    },
    string: {
      len: '${label}长度应为 ${len}',
      min: '${label}长度至少为 ${min}',
      max: '${label}长度至多为 ${max}'
    }
  }

  const rules: FormProps['rules'] = {
    nickName: [{ required: true, message: '用户昵称不能为空' }],
    email: [
      { required: true, message: '邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的邮箱地址' }
    ],
    phonenumber: [
      { required: true, message: '手机号码不能为空' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
    ]
  }

  const handleSubmit = async (values: UserInfoForm) => {
    if (isPreventedRef.current) return
    isPreventedRef.current = true

    try {
      setLoading(true)
      await updateUserProfile({
        ...user,
        nickName: values.nickName,
        phonenumber: values.phonenumber,
        email: values.email,
        sex: values.sex
      })
      message.success('修改成功')
      onUpdated?.()
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
      <Form.Item name="nickName" label="用户昵称" rules={rules.nickName}>
        <Input maxLength={30} placeholder="请输入用户昵称" />
      </Form.Item>
      <Form.Item name="phonenumber" label="手机号码" rules={rules.phonenumber}>
        <Input maxLength={11} placeholder="请输入手机号码" />
      </Form.Item>
      <Form.Item name="email" label="邮箱" rules={rules.email}>
        <Input maxLength={50} placeholder="请输入邮箱地址" />
      </Form.Item>
      <Form.Item name="sex" label="性别">
        <Radio.Group>
          <Radio value="0">男</Radio>
          <Radio value="1">女</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default UserInfo
