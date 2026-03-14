import React, { useState, useEffect } from 'react'
import { Table, Form, Input, Button, Space, message, Card, Row, Col, Modal } from 'antd'
import {
  SearchOutlined, ReloadOutlined, PlusOutlined, ArrowLeftOutlined, StopOutlined, UserAddOutlined,
  UnorderedListOutlined, AppstoreOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate, useLocation } from 'react-router-dom'
import type { SysUser, AuthUserQueryParams } from '@/types/user'
import {
  allocatedUserList, authUserCancel, authUserCancelAll, authUserSelectAll, unallocatedUserList
} from '@/api/system/role'

// 列表类型枚举
type ListType = 'allocated' | 'unallocated'

const AuthUser: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 从路由参数获取 roleId
  const pathParts = location.pathname.split('/')
  const roleIdFromPath = pathParts[pathParts.length - 1]
  const roleId = Number(roleIdFromPath) || (location.state as any)?.roleId

  const [loading, setLoading] = useState(false)
  const [userList, setUserList] = useState<SysUser[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()
  const [queryParams, setQueryParams] = useState<AuthUserQueryParams>({
    pageNum: 1,
    pageSize: 10,
    roleId: roleId,
    userName: undefined,
    phonenumber: undefined
  })

  // 列表类型：已授权 / 未授权
  const [listType, setListType] = useState<ListType>('allocated')

  // 获取用户列表
  const getList = async (params?: AuthUserQueryParams) => {
    setLoading(true)
    try {
      const requestParams: AuthUserQueryParams = params || {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        roleId: roleId,
        userName: queryParams.userName,
        phonenumber: queryParams.phonenumber
      }
      let res
      if (listType === 'allocated') {
        res = await allocatedUserList(requestParams)
      } else {
        res = await unallocatedUserList(requestParams)
      }
      if (res.code === 200) {
        setUserList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getList()
  }, [listType, queryParams.pageNum, queryParams.pageSize])

  // 切换列表类型
  const handleToggleListType = (type: ListType) => {
    setListType(type)
    setSelectedRowKeys([])
    form.resetFields()
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      roleId: roleId,
      userName: undefined,
      phonenumber: undefined
    })
  }

  // 搜索
  const handleQuery = () => {
    const values = form.getFieldsValue()
    const newParams: AuthUserQueryParams = {
      pageNum: 1,
      pageSize: queryParams.pageSize,
      roleId: roleId,
      userName: values.userName,
      phonenumber: values.phonenumber
    }
    setQueryParams(newParams)
    // 直接调用获取数据
    getList(newParams)
  }

  // 重置
  const resetQuery = () => {
    form.resetFields()
    const newParams: AuthUserQueryParams = {
      pageNum: 1,
      pageSize: 10,
      roleId: roleId,
      userName: undefined,
      phonenumber: undefined
    }
    setQueryParams(newParams)
    // 直接调用获取数据
    getList(newParams)
  }

  // 多选
  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys)
  }

  // 返回角色管理
  const handleClose = () => {
    navigate('/system/role')
  }

  // 授权（单个）
  const handleAuthorize = (record: SysUser) => {
    Modal.confirm({
      title: '系统提示',
      content: `确认要给用户"${record.userName}"分配该角色吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await authUserSelectAll({
            roleId: roleId,
            userIds: String(record.userId!)
          })
          if (res.code === 200) {
            message.success('授权成功')
            getList()
          }
        } catch (error) {
          console.error('授权失败:', error)
        }
      }
    })
  }

  // 批量授权
  const handleBatchAuthorize = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要授权的用户')
      return
    }

    Modal.confirm({
      title: '系统提示',
      content: `确认要给选中的 ${selectedRowKeys.length} 个用户分配该角色吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await authUserSelectAll({
            roleId: roleId,
            userIds: selectedRowKeys.join(',')
          })
          if (res.code === 200) {
            message.success(res.msg || '授权成功')
            setSelectedRowKeys([])
            getList()
          }
        } catch (error) {
          console.error('批量授权失败:', error)
        }
      }
    })
  }

  // 取消授权（单个）
  const cancelAuthUser = (record: SysUser) => {
    Modal.confirm({
      title: '系统提示',
      content: `确认要取消该用户"${record.userName}"角色吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await authUserCancel({
            userId: record.userId!,
            roleId: roleId
          })
          if (res.code === 200) {
            message.success('取消授权成功')
            getList()
          }
        } catch (error) {
          console.error('取消授权失败:', error)
        }
      }
    })
  }

  // 批量取消授权
  const cancelAuthUserAll = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要取消授权的用户')
      return
    }

    Modal.confirm({
      title: '系统提示',
      content: '是否取消选中用户授权数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await authUserCancelAll({
            roleId: roleId,
            userIds: selectedRowKeys.join(',')
          })
          if (res.code === 200) {
            message.success('取消授权成功')
            setSelectedRowKeys([])
            getList()
          }
        } catch (error) {
          console.error('批量取消授权失败:', error)
        }
      }
    })
  }

  // 已授权用户表格列定义
  const allocatedColumns: ColumnsType<SysUser> = [
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      ellipsis: true
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      ellipsis: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true
    },
    {
      title: '手机',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
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
      render: (time: string) => time ? time : '-'
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<StopOutlined />}
          onClick={() => cancelAuthUser(record)}
        >
          取消授权
        </Button>
      )
    }
  ]

  // 未授权用户表格列定义
  const unallocatedColumns: ColumnsType<SysUser> = [
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      ellipsis: true
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      ellipsis: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true
    },
    {
      title: '手机',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
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
      render: (time: string) => time ? time : '-'
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<UserAddOutlined />}
          onClick={() => handleAuthorize(record)}
        >
          授权
        </Button>
      )
    }
  ]

  // 返回按钮样式
  const backBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '16px'
  }

  return (
    <div className="app-container auth-user">
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
          onClick={handleClose}
          style={backBtnStyle}
        >
          返回角色管理
        </Button>
      </div>

      {/* 列表类型切换 - 独立区域 */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#fff', 
        borderRadius: '4px',
        marginBottom: '0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <Space>
          <Button
            type={listType === 'allocated' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            size="large"
            onClick={() => handleToggleListType('allocated')}
            style={{ 
              fontWeight: listType === 'allocated' ? 600 : 400,
              borderColor: listType === 'allocated' ? '#1890ff' : '#d9d9d9'
            }}
          >
            已授权用户
          </Button>
          <Button
            type={listType === 'unallocated' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="large"
            onClick={() => handleToggleListType('unallocated')}
            style={{ 
              fontWeight: listType === 'unallocated' ? 600 : 400,
              borderColor: listType === 'unallocated' ? '#1890ff' : '#d9d9d9'
            }}
          >
            未授权用户
          </Button>
        </Space>
      </div>

      {/* 搜索和表格区域 */}
      <Card size="small" style={{ 
        borderRadius: '4px', 
        marginTop: '0',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0'
      }}>
        {/* 搜索区域 */}
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fafafa', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <Form form={form}>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="userName" label="用户名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入用户名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="phonenumber" label="手机号码" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入手机号码"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col style={{ display: 'flex', alignItems: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleQuery}
                  >
                    搜索
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={resetQuery}
                  >
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>

        {/* 批量操作按钮 */}
        <div style={{ marginBottom: '16px' }}>
          <Space>
            {listType === 'unallocated' && (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleBatchAuthorize}
                disabled={selectedRowKeys.length === 0}
              >
                批量授权
              </Button>
            )}
            {listType === 'allocated' && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={cancelAuthUserAll}
                disabled={selectedRowKeys.length === 0}
              >
                批量取消授权
              </Button>
            )}
          </Space>
        </div>

        {/* 表格 */}
        <Table
          rowKey={(record) => String(record.userId || '')}
          loading={loading}
          columns={listType === 'allocated' ? allocatedColumns : unallocatedColumns}
          dataSource={userList}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange
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
      </Card>
    </div>
  )
}

export default AuthUser
