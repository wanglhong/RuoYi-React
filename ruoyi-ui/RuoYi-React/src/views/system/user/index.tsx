import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Card, Button, Space, Form, Input, Select, DatePicker, Modal, message, Tooltip, Switch, Radio, TreeSelect, Row, Col, Tree, Layout } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined, SafetyCertificateOutlined, FolderOutlined, FolderOpenOutlined, LockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UserQueryParams, SysUser, DeptTree, Post, Role } from '@/types/user'
import { listUser, getUser, addUser, updateUser, delUser, changeUserStatus, resetUserPwd, deptTreeSelect } from '@/api/system/user'
import Auth from '@/components/Auth'
import dayjs from 'dayjs'
import './index.scss'

const RangePicker = DatePicker.RangePicker
const { Sider, Content } = Layout

const UserManagement: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [userList, setUserList] = useState<SysUser[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentUser, setCurrentUser] = useState<SysUser>({})
  const [form] = Form.useForm()
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    pageNum: 1,
    pageSize: 10
  })
  // 新增状态
  const [deptOptions, setDeptOptions] = useState<DeptTree[]>([])
  const [postOptions, setPostOptions] = useState<Post[]>([])
  const [roleOptions, setRoleOptions] = useState<Role[]>([])
  const [queryParamsForm] = Form.useForm()
  // 部门树相关状态
  const [deptName, setDeptName] = useState('')
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  // 保存选中部门的父级路径，用于显示展开图标
  const [selectedParentKeys, setSelectedParentKeys] = useState<React.Key[]>([])

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<UserQueryParams>({
    pageNum: 1,
    pageSize: 10
  })
  // 用于跟踪双击事件，避免重复请求
  const doubleClickRef = useRef(false)

  // 获取部门树
  const getDeptTree = async () => {
    try {
      const res = await deptTreeSelect()
      if (res.code === 200) {
        const deptData = res.data || []
        setDeptOptions(deptData)
        // 默认展开所有节点
        setExpandedKeys(getAllDeptKeys(deptData))
      }
    } catch (error) {
      console.error('获取部门树失败:', error)
    }
  }

  // 获取所有部门节点的 key
  const getAllDeptKeys = (data: DeptTree[]): React.Key[] => {
    const keys: React.Key[] = []
    const loop = (items: DeptTree[]) => {
      items.forEach(item => {
        keys.push(item.id)
        if (item.children && item.children.length > 0) {
          loop(item.children)
        }
      })
    }
    loop(data)
    return keys
  }

  // 获取用户列表
  const getUserList = async (params?: UserQueryParams) => {
    setLoading(true)
    try {
      // 使用传入的参数，或者使用 searchParamsRef 中保存的搜索条件
      let requestParams: UserQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }
      
      console.log('请求参数:', requestParams)
      const res = await listUser(requestParams)
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
    getDeptTree()
  }, [])

  // 当选中部门变化时，更新父级路径
  useEffect(() => {
    if (selectedDeptId && deptOptions.length > 0) {
      const parentKeys = getParentKeys(deptOptions, selectedDeptId) || []
      setSelectedParentKeys(parentKeys)
    }
  }, [selectedDeptId, deptOptions])

  useEffect(() => {
    // 如果是手动触发的请求，跳过
    if (manualRequestRef.current) {
      manualRequestRef.current = false
      return
    }
    getUserList()
  }, [queryParams.pageNum, queryParams.pageSize])

  // 搜索
  const handleQuery = () => {
    const values = queryParamsForm.getFieldsValue()
    console.log('表单值:', values)
    
    // 构建新的查询参数
    const newParams: UserQueryParams = {
      pageNum: 1,
      pageSize: queryParams.pageSize,
      userName: values.userName,
      phonenumber: values.phonenumber,
      status: values.status,
      deptId: selectedDeptId || undefined,
    }
    
    // 获取日期范围
    const dateRangeValue = queryParamsForm.getFieldValue('dateRange')
    if (dateRangeValue && dateRangeValue.length === 2) {
      newParams.beginTime = dateRangeValue[0].format('YYYY-MM-DD')
      newParams.endTime = dateRangeValue[1].format('YYYY-MM-DD')
    }
    
    console.log('构建的查询参数:', newParams)
    
    setQueryParams(newParams)
    // 标记为手动触发，避免 useEffect 重复请求
    manualRequestRef.current = true
    // 直接传递新参数
    getUserList(newParams)
  }

  // 重置
  const handleReset = () => {
    queryParamsForm.resetFields()
    setSelectedDeptId(null)
    const newParams = {
      pageNum: 1,
      pageSize: 10
    }
    setQueryParams(newParams)
    searchParamsRef.current = newParams
    // 标记为手动触发
    manualRequestRef.current = true
    // 直接传递新参数
    getUserList(newParams)
  }

  // 新增用户
  const handleAdd = async () => {
    try {
      const res = await getUser() as any
      console.log('getUser for add response:', res)
      if (res.code === 200) {
        setPostOptions(res.posts || [])
        setRoleOptions(res.roles || [])
        setCurrentUser({ status: '0' })
        setModalTitle('添加用户')
        setModalVisible(true)
        form.resetFields()
        // 设置默认角色和岗位
        form.setFieldsValue({
          status: '0',
          postIds: [],
          roleIds: []
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      message.error('获取用户信息失败')
    }
  }

  // 编辑用户
  const handleUpdate = async (record: SysUser) => {
    try {
      const res = await getUser(record.userId) as any
      console.log('getUser response:', res)
      if (res.code === 200) {
        setPostOptions(res.posts || [])
        setRoleOptions(res.roles || [])
        // 若依API返回格式：数据字段在顶层，不在 data 中
        const userData = res.data || res
        setCurrentUser(userData)
        setModalTitle('修改用户')
        setModalVisible(true)
        // 设置表单值
        form.setFieldsValue({
          nickName: userData.nickName,
          deptId: userData.deptId,
          phonenumber: userData.phonenumber,
          email: userData.email,
          userName: userData.userName,
          sex: userData.sex,
          status: userData.status,
          postIds: res.postIds || [],
          roleIds: res.roleIds || [],
          remark: userData.remark
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      message.error('获取用户信息失败')
    }
  }

  // 删除用户
  const handleDelete = (userId: number | number[]) => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除用户编号为"' + userId + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delUser(userId)
          if (res.code === 200) {
            message.success('删除成功')
            getUserList()
          }
        } catch (error) {
          console.error('删除用户失败:', error)
        }
      }
    })
  }

  // 修改用户状态
  const handleStatusChange = async (record: SysUser, checked: boolean) => {
    const newStatus = checked ? '0' : '1'
    const text = checked ? '启用' : '停用'
    
    Modal.confirm({
      title: '系统提示',
      content: `确认要"${text}""${record.userName}"用户吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await changeUserStatus(record.userId!, newStatus)
          if (res.code === 200) {
            message.success(`${text}成功`)
            getUserList()
          }
        } catch (error) {
          console.error('修改状态失败:', error)
          message.error('修改状态失败')
        }
      },
      onCancel: () => {
        // 取消时恢复原状态
      }
    })
  }

  // 重置密码
  const handleResetPwd = (record: SysUser) => {
    let newPassword = ''
    Modal.confirm({
      title: '提示',
      content: (
        <div>
          <p>请输入"{record.userName}"的新密码</p>
          <Input.Password
            placeholder="请输入新密码"
            onChange={(e) => { newPassword = e.target.value }}
            id="resetPwdInput"
          />
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (!newPassword) {
          message.error('请输入新密码')
          return Promise.reject()
        }
        if (newPassword.length < 5 || newPassword.length > 20) {
          message.error('用户密码长度必须介于 5 和 20 之间')
          return Promise.reject()
        }
        if (/<|>|"|'|\||\\/.test(newPassword)) {
          message.error('不能包含非法字符：< > " \' \\ |')
          return Promise.reject()
        }
        try {
          const res = await resetUserPwd(record.userId!, newPassword)
          if (res.code === 200) {
            message.success('修改成功，新密码是：' + newPassword)
          }
        } catch (error) {
          console.error('重置密码失败:', error)
        }
      }
    })
  }

  // 分配角色
  const handleAuthRole = (record: SysUser) => {
    navigate(`/system/user-auth/role/${record.userId}`)
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentUser, ...values }

      if (currentUser.userId) {
        // 编辑
        const res = await updateUser(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getUserList()
        }
      } else {
        // 新增
        const res = await addUser(data)
        if (res.code === 200) {
          message.success('新增成功')
          setModalVisible(false)
          getUserList()
        }
      }
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  // 部门树搜索过滤
  const filterDeptTree = (data: DeptTree[], searchValue: string): DeptTree[] => {
    if (!searchValue) return data
    
    return data.filter(item => {
      const titleMatch = item.label.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
      const childrenMatch = item.children && filterDeptTree(item.children, searchValue).length > 0
      
      if (titleMatch || childrenMatch) {
        return true
      }
      return false
    }).map(item => ({
      ...item,
      children: item.children ? filterDeptTree(item.children, searchValue) : undefined
    })) as DeptTree[]
  }

  // 部门节点点击 - 只获取用户数据，不展开子部门
  const handleDeptSelect: any = (selectedKeys: React.Key[], info: any) => {
    // 如果是双击触发的事件，跳过
    if (doubleClickRef.current) {
      doubleClickRef.current = false
      return
    }

    const deptId = selectedKeys[0] as number
    setSelectedDeptId(deptId)

    // 构建新的查询参数
    const newParams: UserQueryParams = {
      ...searchParamsRef.current,
      deptId,
      pageNum: 1
    }

    setQueryParams(newParams)
    manualRequestRef.current = true
    getUserList(newParams)
  }

  // 获取选中部门的所有父级节点 keys
  const getParentKeys = (data: DeptTree[], targetId: React.Key, parentKeys: React.Key[] = []): React.Key[] | null => {
    for (const item of data) {
      if (item.id === targetId) {
        return parentKeys
      }
      if (item.children && item.children.length > 0) {
        const result = getParentKeys(item.children, targetId, [...parentKeys, item.id])
        if (result !== null) {
          return result
        }
      }
    }
    return null
  }

  // 双击部门节点 - 展开/收起该部门
  const handleDeptDoubleClick: any = (e: React.MouseEvent<HTMLSpanElement>, node: any) => {
    const nodeKey = node.key
    const isExpanded = expandedKeys.includes(nodeKey)

    // 设置双击标志，避免 onSelect 重复请求
    doubleClickRef.current = true

    if (isExpanded) {
      // 当前是展开状态，收起
      const newExpandedKeys = expandedKeys.filter(key => key !== nodeKey)
      setExpandedKeys(newExpandedKeys)
    } else {
      // 当前是收起状态，展开
      const newExpandedKeys = [...expandedKeys, nodeKey]
      setExpandedKeys(newExpandedKeys)
    }
    setAutoExpandParent(false)
  }

  // 部门搜索输入
  const handleDeptSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDeptName(value)
    
    // 展开匹配的节点
    if (value) {
      const matchedKeys = getMatchedKeys(deptOptions, value)
      setExpandedKeys(matchedKeys)
    } else {
      const keys = getAllDeptKeys(deptOptions)
      setExpandedKeys(keys)
    }
  }

  // 获取匹配的节点 keys
  const getMatchedKeys = (data: DeptTree[], searchValue: string): React.Key[] => {
    const keys: React.Key[] = []
    const loop = (items: DeptTree[], parentKey?: React.Key) => {
      items.forEach(item => {
        if (item.label.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
          keys.push(item.id)
          if (parentKey) keys.push(parentKey)
        }
        if (item.children && item.children.length > 0) {
          loop(item.children, item.id)
        }
      })
    }
    loop(data)
    return [...new Set(keys)]
  }

  // 展开/收起节点
  const handleExpand: any = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys)
    setAutoExpandParent(false)
  }

  // 转换部门树数据为 Tree 组件格式
  const convertToTreeData = (data: DeptTree[], level: number = 0): any[] => {
    return data.map(item => {
      const isExpanded = expandedKeys.includes(item.id)
      const isSelected = selectedDeptId === item.id
      const isParent = item.children && item.children.length > 0
      // 判断是否应该显示展开图标：选中部门或其父级路径上的部门
      const showOpenIcon = isParent && (isSelected || selectedParentKeys.includes(item.id))

      return {
        key: item.id,
        title: (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation()
              handleDeptDoubleClick(e, { key: item.id })
            }}
          >
            {item.label}
          </span>
        ),
        children: item.children ? convertToTreeData(item.children, level + 1) : undefined,
        icon: isParent ? (showOpenIcon || isExpanded ? <FolderOpenOutlined /> : <FolderOutlined />) : null,
        isLeaf: !isParent
      }
    })
  }

  // 表格列定义
  const columns: ColumnsType<SysUser> = [
    {
      title: '用户编号',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
      align: 'center'
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      ellipsis: true
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      width: 120,
      ellipsis: true
    },
    {
      title: '部门',
      dataIndex: ['dept', 'deptName'],
      key: 'deptName',
      width: 150,
      ellipsis: true
    },
    {
      title: '手机号码',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
      width: 120,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (text: string, record: SysUser) => (
        <Switch
          checked={text === '0'}
          onChange={(checked) => handleStatusChange(record, checked)}
          disabled={record.userId === 1}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      align: 'center',
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        if (record.userId === 1) return null
        return (
          <Space size={0}>
            <Auth permission="system:user:edit">
              <Tooltip title="修改">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleUpdate(record)}
                />
              </Tooltip>
            </Auth>
            <Auth permission="system:user:remove">
              <Tooltip title="删除">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.userId!)}
                />
              </Tooltip>
            </Auth>
            <Auth permission="system:user:resetPwd">
              <Tooltip title="重置密码">
                <Button
                  type="link"
                  size="small"
                  icon={<LockOutlined />}
                  onClick={() => handleResetPwd(record)}
                />
              </Tooltip>
            </Auth>
            <Auth permission="system:user:edit">
              <Tooltip title="分配角色">
                <Button
                  type="link"
                  size="small"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => handleAuthRole(record)}
                />
              </Tooltip>
            </Auth>
          </Space>
        )
      }
    }
  ]

  // 转换部门树数据为 TreeSelect 格式
  const convertDeptTree = (data: DeptTree[]): any[] => {
    return data.map(item => ({
      value: item.id,
      title: item.label,
      disabled: item.disabled,
      children: item.children ? convertDeptTree(item.children) : undefined
    }))
  }

  return (
    <div className="app-container user-management">
      <Layout className="user-layout">
        {/* 左侧部门树 */}
        <Sider 
          width={200} 
          className="dept-sider"
          theme="light"
        >
          <div className="dept-header">
            <Input
              placeholder="请输入部门名称"
              prefix={<SearchOutlined />}
              allowClear
              value={deptName}
              onChange={handleDeptSearch}
            />
          </div>
          <div className="dept-tree">
            <Tree
              treeData={convertToTreeData(filterDeptTree(deptOptions, deptName))}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onExpand={handleExpand}
              onSelect={handleDeptSelect}
              selectedKeys={selectedDeptId ? [selectedDeptId] : []}
            />
          </div>
        </Sider>

        {/* 右侧用户列表 */}
        <Content className="user-content">
          {/* 搜索区域 */}
          {showSearch && (
            <Card className="search-card" size="small">
              <Form form={queryParamsForm}>
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
                  <Col>
                    <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                      <Select
                        placeholder="用户状态"
                        style={{ width: 200 }}
                        allowClear
                      >
                        <Select.Option value="0">正常</Select.Option>
                        <Select.Option value="1">停用</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label="创建时间" name="dateRange" style={{ marginBottom: 0 }}>
                      <RangePicker
                        style={{ width: 240 }}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item style={{ marginBottom: 0 }}>
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
                          onClick={handleReset}
                        >
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}

          {/* 表格区域 */}
          <Card className="table-card" size="small">
            <div className="toolbar" style={{ marginBottom: 16 }}>
              <Space>
                <Auth permission="system:user:add">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    新增
                  </Button>
                </Auth>
                <Auth permission="system:user:edit">
                  <Button
                    icon={<EditOutlined />}
                    disabled={selectedRowKeys.length !== 1}
                    onClick={() => {
                      const user = userList.find(u => u.userId === selectedRowKeys[0])
                      if (user) handleUpdate(user)
                    }}
                  >
                    修改
                  </Button>
                </Auth>
                <Auth permission="system:user:remove">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={selectedRowKeys.length === 0}
                    onClick={() => handleDelete(selectedRowKeys)}
                  >
                    删除
                  </Button>
                </Auth>
                <Auth permission="system:user:import">
                  <Button icon={<UploadOutlined />}>
                    导入
                  </Button>
                </Auth>
                <Auth permission="system:user:export">
                  <Button icon={<DownloadOutlined />}>
                    导出
                  </Button>
                </Auth>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={userList}
              rowKey="userId"
              loading={loading}
              size="small"
              pagination={{
                current: queryParams.pageNum,
                pageSize: queryParams.pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, pageSize) => {
                  const newParams = {
                    ...searchParamsRef.current,
                    pageNum: page,
                    pageSize
                  }
                  setQueryParams(newParams)
                  searchParamsRef.current = newParams
                }
              }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys as number[])
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Content>
      </Layout>

      {/* 新增/编辑对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={680}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nickName"
                label="用户昵称"
                rules={[{ required: true, message: '请输入用户昵称' }]}
              >
                <Input placeholder="请输入用户昵称" maxLength={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deptId"
                label="归属部门"
              >
                <TreeSelect
                  placeholder="请选择归属部门"
                  treeData={convertDeptTree(deptOptions)}
                  allowClear
                  showSearch
                  treeNodeFilterProp="title"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phonenumber"
                label="手机号码"
                rules={[{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码' }]}
              >
                <Input placeholder="请输入手机号码" maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
              >
                <Input placeholder="请输入邮箱" maxLength={50} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              {!currentUser.userId && (
                <Form.Item
                  name="userName"
                  label="用户名称"
                  rules={[
                    { required: true, message: '请输入用户名称' },
                    { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间' }
                  ]}
                >
                  <Input placeholder="请输入用户名称" maxLength={30} />
                </Form.Item>
              )}
            </Col>
            <Col span={12}>
              {!currentUser.userId && (
                <Form.Item
                  name="password"
                  label="用户密码"
                  rules={[
                    { required: true, message: '请输入用户密码' },
                    { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间' },
                    { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |' }
                  ]}
                >
                  <Input.Password placeholder="请输入用户密码" maxLength={20} />
                </Form.Item>
              )}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sex" label="用户性别">
                <Select placeholder="请选择">
                  <Select.Option value="0">男</Select.Option>
                  <Select.Option value="1">女</Select.Option>
                  <Select.Option value="2">未知</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Radio.Group>
                  <Radio value="0">正常</Radio>
                  <Radio value="1">停用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="postIds" label="岗位">
                <Select
                  mode="multiple"
                  placeholder="请选择"
                  options={postOptions.map(item => ({
                    label: item.postName,
                    value: item.postId,
                    disabled: item.status === '1'
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roleIds" label="角色">
                <Select
                  mode="multiple"
                  placeholder="请选择"
                  options={roleOptions.map(item => ({
                    label: item.roleName,
                    value: item.roleId,
                    disabled: item.status === '1'
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remark" label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Input.TextArea rows={3} placeholder="请输入内容" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
