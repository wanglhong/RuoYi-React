import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Card, Button, Space, Form, Input, Select, DatePicker, Modal, message,
  Switch, Tree, Row, Col, InputNumber, Radio, Checkbox
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
  DownloadOutlined, CheckCircleOutlined, UserOutlined, CloseOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Tooltip } from 'antd'
import type { RoleQueryParams, SysRole, DeptTree } from '@/types/user'
import {
  listRole, getRole, addRole, updateRole, delRole, changeRoleStatus,
  dataScope, deptTreeSelect
} from '@/api/system/role'
import { roleMenuTreeselect, menuTreeselect } from '@/api/system/menu'
import dayjs from 'dayjs'
import './index.scss'

const RangePicker = DatePicker.RangePicker

const RoleManagement: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [roleList, setRoleList] = useState<SysRole[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [dataScopeVisible, setDataScopeVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentRole, setCurrentRole] = useState<SysRole>({})
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [dataScopeForm] = Form.useForm()
  const [queryParams, setQueryParams] = useState<RoleQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 树形数据相关
  const [menuOptions, setMenuOptions] = useState<DeptTree[]>([])
  const [deptOptions, setDeptOptions] = useState<DeptTree[]>([])
  const [menuExpand, setMenuExpand] = useState(false)
  const [menuNodeAll, setMenuNodeAll] = useState(false)
  const [deptExpand, setDeptExpand] = useState(true)
  const [deptNodeAll, setDeptNodeAll] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [deptExpandedKeys, setDeptExpandedKeys] = useState<React.Key[]>([])

  // 数据范围选项
  const dataScopeOptions = [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' }
  ]

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [currentDataScope, setCurrentDataScope] = useState<string>('1')
  const manualRequestRef = useRef(false)
  const searchParamsRef = useRef<RoleQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取角色列表
  const getRoleList = async (params?: RoleQueryParams) => {
    setLoading(true)
    try {
      let requestParams: RoleQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      // 处理日期范围
      if (dateRange && dateRange.length === 2) {
        requestParams.beginTime = dateRange[0].format('YYYY-MM-DD')
        requestParams.endTime = dateRange[1].format('YYYY-MM-DD')
      }

      const res = await listRole(requestParams)
      if (res.code === 200) {
        setRoleList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRoleList()
  }, [queryParams.pageNum, queryParams.pageSize])

  // 搜索
  const handleQuery = () => {
    const values = searchForm.getFieldsValue()
    const newParams: RoleQueryParams = {
      pageNum: 1,
      pageSize: queryParams.pageSize,
      roleName: values.roleName,
      roleKey: values.roleKey,
      status: values.status,
    }
    setQueryParams(newParams)
    manualRequestRef.current = true
    getRoleList(newParams)
  }

  // 重置
  const handleReset = () => {
    searchForm.resetFields()
    setDateRange(null)
    const newParams = {
      pageNum: 1,
      pageSize: 10
    }
    setQueryParams(newParams)
    searchParamsRef.current = newParams
    manualRequestRef.current = true
    getRoleList(newParams)
  }

  // 多选
  const handleSelectionChange = (selectedRows: any[]) => {
    setSelectedRowKeys(selectedRows.map(row => row.roleId))
  }

  // 新增
  const handleAdd = async () => {
    reset()
    const res = await menuTreeselect()
    if (res.code === 200) {
      setMenuOptions(res.data || [])
    }
    setModalTitle('添加角色')
    setModalVisible(true)
  }

  // 修改
  const handleUpdate = async (record?: SysRole) => {
    reset()
    const roleId = record?.roleId || selectedRowKeys[0]
    const res = await getRole(roleId!)
    if (res.code === 200) {
      const roleData = res.data || res
      setCurrentRole(roleData)
      
      // 获取菜单树
      const menuRes = await roleMenuTreeselect(roleId!)
      if (menuRes.code === 200) {
        setMenuOptions(menuRes.menus || [])
        // 设置选中的菜单
        setTimeout(() => {
          const checkedKeys = menuRes.checkedKeys || []
          checkedKeys.forEach((key: number) => {
            // 设置菜单选中状态将在 render 中处理
          })
        }, 100)
      }

      setModalTitle('修改角色')
      setModalVisible(true)

      // 设置表单值
      setTimeout(() => {
        form.setFieldsValue({
          roleName: roleData.roleName,
          roleKey: roleData.roleKey,
          roleSort: roleData.roleSort,
          status: roleData.status,
          remark: roleData.remark,
          menuCheckStrictly: roleData.menuCheckStrictly
        })
      }, 0)
    }
  }

  // 删除
  const handleDelete = (roleId: number | number[]) => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除角色编号为"' + roleId + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delRole(roleId)
          if (res.code === 200) {
            message.success('删除成功')
            getRoleList()
          }
        } catch (error) {
          console.error('删除角色失败:', error)
        }
      }
    })
  }

  // 状态修改
  const handleStatusChange = async (record: SysRole, checked: boolean) => {
    const newStatus = checked ? '0' : '1'
    const text = checked ? '启用' : '停用'

    Modal.confirm({
      title: '系统提示',
      content: `确认要"${text}""${record.roleName}"角色吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await changeRoleStatus(record.roleId!, newStatus)
          if (res.code === 200) {
            message.success(text + '成功')
          } else {
            // 恢复状态
            record.status = newStatus === '0' ? '1' : '0'
          }
        } catch (error) {
          // 恢复状态
          record.status = newStatus === '0' ? '1' : '0'
        }
      },
      onCancel: () => {
        // 恢复状态
        record.status = record.status === '0' ? '1' : '0'
      }
    })
  }

  // 分配数据权限
  const handleDataScope = async (record: SysRole) => {
    reset()
    const roleId = record.roleId!
    
    // 获取角色信息
    const res = await getRole(roleId)
    if (res.code === 200) {
      const roleData = res.data || res
      setCurrentRole(roleData)
      
      // 获取部门树
      const deptRes = await deptTreeSelect(roleId)
      if (deptRes.code === 200) {
        setDeptOptions(deptRes.depts || [])
        // 设置选中的部门
        setTimeout(() => {
          const checkedKeys = deptRes.checkedKeys || []
          setDeptExpandedKeys(getAllDeptKeys(deptRes.depts || []))
        }, 100)
      }

      setDataScopeVisible(true)
      setModalTitle('分配数据权限')

      // 设置当前数据范围值
      setCurrentDataScope(roleData.dataScope || '1')

      // 设置表单值
      setTimeout(() => {
        dataScopeForm.setFieldsValue({
          roleName: roleData.roleName,
          roleKey: roleData.roleKey,
          dataScope: roleData.dataScope
        })
      }, 0)
    }
  }

  // 分配用户 - 跳转到独立页面
  const handleAuthUser = (record: SysRole) => {
    navigate(`/system/role/authUser/${record.roleId}`)
  }

  // 重置表单
  const reset = () => {
    if (modalVisible) {
      form.resetFields()
    }
    if (dataScopeVisible) {
      dataScopeForm.resetFields()
    }
    setMenuExpand(false)
    setMenuNodeAll(false)
    setDeptExpand(true)
    setDeptNodeAll(false)
    setCurrentDataScope('1')
    setCurrentRole({
      roleId: undefined,
      roleName: undefined,
      roleKey: undefined,
      roleSort: 0,
      status: '0',
      menuIds: [],
      deptIds: [],
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      remark: undefined
    })
  }

  // 取消
  const handleCancel = () => {
    form.resetFields()
    setModalVisible(false)
    reset()
  }

  // 取消数据权限
  const handleDataScopeCancel = () => {
    dataScopeForm.resetFields()
    setDataScopeVisible(false)
    reset()
  }

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const menuKeys = getCheckedMenuKeys()
      
      const submitData: SysRole = {
        ...currentRole,
        ...values,
        menuIds: menuKeys
      }

      if (currentRole.roleId) {
        const res = await updateRole(submitData)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getRoleList()
        }
      } else {
        const res = await addRole(submitData)
        if (res.code === 200) {
          message.success('新增成功')
          setModalVisible(false)
          getRoleList()
        }
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 提交数据权限
  const handleDataScopeSubmit = async () => {
    try {
      const values = await dataScopeForm.validateFields()
      const deptKeys = getCheckedDeptKeys()
      
      const submitData: SysRole = {
        ...currentRole,
        ...values,
        deptIds: deptKeys
      }

      const res = await dataScope(submitData)
      if (res.code === 200) {
        message.success('修改成功')
        setDataScopeVisible(false)
        getRoleList()
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 获取选中的菜单 keys
  const getCheckedMenuKeys = (): number[] => {
    // 这里需要通过 ref 获取 Tree 的选中状态
    // 简化处理，实际需要从 Tree 组件获取
    return currentRole.menuIds || []
  }

  // 获取选中的部门 keys
  const getCheckedDeptKeys = (): number[] => {
    return currentRole.deptIds || []
  }

  // 转换菜单树数据为 Tree 组件格式
  const convertToTreeData = (data: DeptTree[]): any[] => {
    return data.map(item => ({
      key: item.id,
      title: item.label,
      children: item.children ? convertToTreeData(item.children) : undefined
    }))
  }

  // 获取所有部门 keys
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

  // 菜单树 Ref
  const menuTreeRef = React.useRef<any>(null)

  // 菜单展开/折叠
  const handleMenuExpand = (checked: boolean) => {
    setMenuExpand(checked)
    if (checked) {
      setExpandedKeys(getAllDeptKeys(menuOptions))
    } else {
      setExpandedKeys([])
    }
  }

  // 获取所有菜单节点 keys
  const getAllMenuKeys = (data: DeptTree[]): React.Key[] => {
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

  // 菜单全选/全不选
  const handleMenuNodeAll = (checked: boolean) => {
    setMenuNodeAll(checked)
    if (checked) {
      const allKeys = getAllMenuKeys(menuOptions)
      setCurrentRole({ ...currentRole, menuIds: allKeys })
    } else {
      setCurrentRole({ ...currentRole, menuIds: [] })
    }
  }

  // 部门展开/折叠
  const handleDeptExpand = (checked: boolean) => {
    setDeptExpand(checked)
    if (checked) {
      setDeptExpandedKeys(getAllDeptKeys(deptOptions))
    } else {
      setDeptExpandedKeys([])
    }
  }

  // 部门全选/全不选
  const handleDeptNodeAll = (checked: boolean) => {
    setDeptNodeAll(checked)
    if (checked) {
      const allKeys = getAllDeptKeys(deptOptions)
      setCurrentRole({ ...currentRole, deptIds: allKeys as number[] })
    } else {
      setCurrentRole({ ...currentRole, deptIds: [] })
    }
  }

  // 数据范围变化
  const handleDataScopeChange = (value: string) => {
    setCurrentDataScope(value)
    if (value !== '2') {
      // 清空选中的部门
    }
  }

  // 转换部门树数据为 Tree 组件格式
  const convertDeptToTreeData = (data: DeptTree[]): any[] => {
    return data.map(item => ({
      key: item.id,
      title: item.label,
      children: item.children ? convertDeptToTreeData(item.children) : undefined
    }))
  }

  // 表格列定义
  const columns: ColumnsType<SysRole> = [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 100,
      align: 'center'
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
      ellipsis: true
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey',
      width: 150,
      ellipsis: true
    },
    {
      title: '显示顺序',
      dataIndex: 'roleSort',
      key: 'roleSort',
      width: 100,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string, record: SysRole) => (
        <Switch
          checked={status === '0'}
          checkedChildren="正常"
          unCheckedChildren="停用"
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      align: 'center',
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          {record.roleId !== 1 && (
            <>
              <Tooltip title="修改">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleUpdate(record)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.roleId!)}
                />
              </Tooltip>
              <Tooltip title="数据权限">
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleDataScope(record)}
                />
              </Tooltip>
              <Tooltip title="分配用户">
                <Button
                  type="link"
                  size="small"
                  icon={<UserOutlined />}
                  onClick={() => handleAuthUser(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="app-container role-management">
      {/* 搜索区域 */}
      {showSearch && (
        <Card className="search-card" size="small">
          <Form form={searchForm}>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="roleName" label="角色名称">
                  <Input
                    placeholder="请输入角色名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="roleKey" label="权限字符">
                  <Input
                    placeholder="请输入权限字符"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态">
                  <Select
                    placeholder="角色状态"
                    style={{ width: 200 }}
                    allowClear
                  >
                    <Select.Option value="0">正常</Select.Option>
                    <Select.Option value="1">停用</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="创建时间">
                  <RangePicker
                    style={{ width: 240 }}
                    format="YYYY-MM-DD"
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item>
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

      {/* 工具栏 */}
      <Card className="table-card" size="small">
        <div className="toolbar">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate()}
            >
              修改
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => handleDelete(selectedRowKeys)}
            >
              删除
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.info('导出功能开发中')}
            >
              导出
            </Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          rowKey="roleId"
          loading={loading}
          columns={columns}
          dataSource={roleList}
          scroll={{ x: 1000 }}
          rowSelection={{
            selectedRowKeys,
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

      {/* 新增/编辑对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={680}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          className="role-form"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" maxLength={30} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="roleKey"
                label="权限字符"
                rules={[{ required: true, message: '请输入权限字符' }]}
                tooltip="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
              >
                <Input placeholder="请输入权限字符" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="roleSort"
                label="角色顺序"
                rules={[{ required: true, message: '请输入角色顺序' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Radio.Group>
                  <Radio value="0">正常</Radio>
                  <Radio value="1">停用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={24}>
              {/* 菜单权限 */}
              <div className="ant-form-item css-dev-only-do-not-override-mncuj7 ant-form-item-horizontal">
                <Row>
                    <div className="ant-col ant-col-5 ant-form-item-label css-dev-only-do-not-override-mncuj7">
                      <label>
                        菜单权限
                      </label>
                    </div>
                    <Col span={19}>
			                <div className="ant-form-item-control-input">
                          <Checkbox checked={menuExpand} onChange={(e) => handleMenuExpand(e.target.checked)}>
                            展开/折叠
                          </Checkbox>
                          <Checkbox checked={menuNodeAll} onChange={(e) => handleMenuNodeAll(e.target.checked)}>
                            全选/全不选
                          </Checkbox>
                          <Checkbox checked={currentRole.menuCheckStrictly} onChange={(e) => {
                            setCurrentRole({ ...currentRole, menuCheckStrictly: e.target.checked })
                          }}>
                            父子联动
                          </Checkbox>
                      </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={5}></Col>
                    <Col span={19}>
                      <div className="treeBorder">
                        <Tree
                          checkable
                          checkedKeys={currentRole.menuIds}
                          expandedKeys={expandedKeys}
                          onExpand={setExpandedKeys}
                          onCheck={(checkedKeys) => {
                            setCurrentRole({ ...currentRole, menuIds: checkedKeys as number[] })
                          }}
                          checkStrictly={!currentRole.menuCheckStrictly}
                          treeData={convertToTreeData(menuOptions)}
                          ref={menuTreeRef}
                        />
                      </div>
                    </Col>
                </Row>
              </div>
            </Col>
            <Col span={24}>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={3} placeholder="请输入备注" maxLength={255} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 数据权限对话框 */}
      <Modal
        title={modalTitle}
        open={dataScopeVisible}
        onOk={handleDataScopeSubmit}
        onCancel={handleDataScopeCancel}
        width={680}
        destroyOnHidden
      >
        <Form
          form={dataScopeForm}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          className="role-form"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="roleName" label="角色名称">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="roleKey" label="权限字符">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="dataScope"
                label="权限范围"
                rules={[{ required: true, message: '请选择权限范围' }]}
              >
                <Select onChange={handleDataScopeChange}>
                  {dataScopeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {currentDataScope === '2' && (
              <Col span={24}>
                {/* 数据权限 */}
                <div className="ant-form-item" style={{ marginBottom: 24 }}>
                  <Row gutter={16}>
                    <Col span={5}>
                      <div className="ant-form-item-label" style={{ textAlign: 'right', paddingRight: 16 }}>
                        <label>数据权限</label>
                      </div>
                    </Col>
                    <Col span={19}>
                      <div className="ant-form-item-control-input">
                        <Space>
                          <Checkbox checked={deptExpand} onChange={(e) => handleDeptExpand(e.target.checked)}>
                            展开/折叠
                          </Checkbox>
                          <Checkbox checked={deptNodeAll} onChange={(e) => handleDeptNodeAll(e.target.checked)}>
                            全选/全不选
                          </Checkbox>
                          <Checkbox checked={currentRole.deptCheckStrictly} onChange={(e) => {
                            setCurrentRole({ ...currentRole, deptCheckStrictly: e.target.checked })
                          }}>
                            父子联动
                          </Checkbox>
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </div>
                <div className="ant-form-item" style={{ marginBottom: 0 }}>
                  <Row gutter={16}>
                    <Col span={5}></Col>
                    <Col span={19}>
                      <div className="tree-container">
                        <Tree
                          checkable
                          checkedKeys={currentRole.deptIds}
                          expandedKeys={deptExpandedKeys}
                          onExpand={setDeptExpandedKeys}
                          onCheck={(checkedKeys) => {
                            setCurrentRole({ ...currentRole, deptIds: checkedKeys as number[] })
                          }}
                          checkStrictly={!currentRole.deptCheckStrictly}
                          defaultExpandAll
                          treeData={convertDeptToTreeData(deptOptions)}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default RoleManagement
