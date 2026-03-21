import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Table, Form, Input, Button, Space, message, Card, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined, ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import type { SysRole, UserAuthRoleResult } from '@/types/user'
import './index.scss'

const AuthRole: React.FC = () => {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<SysRole[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [form] = Form.useForm()
  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined
  })
  const [total, setTotal] = useState(0)

  // 获取授权角色信息
  const getAuthRoleData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res: UserAuthRoleResult = await getAuthRole(Number(userId))
      console.log('API 返回数据:', res)
      if (res.code === 200) {
        setRoles(res.roles || [])
        setTotal(res.roles?.length || 0)
        // 设置表单值
        form.setFieldsValue({
          nickName: res.user.nickName,
          userName: res.user.userName
        })
        // 从 user.roles 中提取已分配的角色 ID
        const assignedRoles = res.user.roles || []
        console.log('用户已分配的角色:', assignedRoles)
        const selectedIds = assignedRoles
          .map(role => role.roleId!)
          .filter(id => id !== undefined && id !== null)
        console.log('提取的角色 ID:', selectedIds)
        setSelectedRoleIds(selectedIds)
      }
    } catch (error) {
      console.error('获取授权角色失败:', error)
      message.error('获取授权角色失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载数据
  useEffect(() => {
    getAuthRoleData()
  }, [userId])

  // 检查角色是否可选（状态为 0 才可选）
  const checkSelectable = (row: SysRole): boolean => {
    return row.status === '0'
  }

  // 表格列定义
  const columns: ColumnsType<SysRole> = [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      align: 'center',
      width: 100
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      ellipsis: true
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 80,
      render: (status: string) => (
        <span style={{ color: status === '0' ? '#52c41a' : '#ff4d4f' }}>
          {status === '0' ? '正常' : '停用'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      render: (text: string) => text ? text : '-'
    }
  ]

  // 提交授权
  const handleSubmit = async () => {
    if (!userId) return
    try {
      const res = await updateAuthRole({
        userId: Number(userId),
        roleIds: selectedRoleIds.join(',')
      })
      if (res.code === 200) {
        message.success('授权成功')
        handleBack()
      }
    } catch (error) {
      console.error('授权失败:', error)
      message.error('授权失败')
    }
  }

  // 返回
  const handleBack = () => {
    navigate('/system/user')
  }

  // 返回按钮样式
  const backBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '16px'
  }

  return (
    <div className="app-container auth-role">
      {/* 页面标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={backBtnStyle}
        >
          返回用户管理
        </Button>
      </div>

      {/* 用户基本信息 */}
      <Card size="small" style={{
        marginBottom: '16px',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ padding: '8px 0' }}>
          <Form form={form} layout="inline">
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col>
                <Form.Item label="用户昵称" name="nickName">
                  <Input disabled style={{ width: 200 }} />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="登录账号" name="userName">
                  <Input disabled style={{ width: 200 }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Card>

      {/* 角色列表和搜索区域 */}
      <Card size="small" style={{
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {/* 搜索区域 */}
        <div style={{
          padding: '16px',
          backgroundColor: '#fafafa',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <Form>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="roleName" label="角色名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入角色名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={() => {}}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="roleKey" label="权限字符" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入权限字符"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={() => {}}
                  />
                </Form.Item>
              </Col>
              <Col style={{ display: 'flex', alignItems: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                  >
                    搜索
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                  >
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>

        {/* 表格 */}
        <Table
          rowKey="roleId"
          loading={loading}
          columns={columns}
          dataSource={roles}
          rowSelection={{
            selectedRowKeys: selectedRoleIds,
            onChange: (newSelectedRowKeys: React.Key[]) => {
              setSelectedRoleIds(newSelectedRowKeys as number[])
            },
            getCheckboxProps: (record) => ({
              disabled: !checkSelectable(record),
              name: record.roleName
            })
          }}
          pagination={{
            current: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, pageNum: page, pageSize })
            }
          }}
        />

        {/* 提交按钮区域 */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              size="large"
            >
              提交
            </Button>
            <Button
              onClick={handleBack}
              size="large"
            >
              返回
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default AuthRole
