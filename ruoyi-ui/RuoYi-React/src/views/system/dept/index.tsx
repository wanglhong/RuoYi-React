import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, InputNumber, Row, Col, TreeSelect, Radio } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, SortDescendingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysDept, DeptQueryParams, DeptTreeSelect } from '@/types/system'
import { listDept, getDept, addDept, updateDept, delDept, listDeptExcludeChild } from '@/api/system/dept'
import Auth from '@/components/Auth'
import '../index.scss'

const DeptManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [deptList, setDeptList] = useState<SysDept[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentDept, setCurrentDept] = useState<SysDept>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()
  const [deptOptions, setDeptOptions] = useState<DeptTreeSelect[]>([])
  const [isExpandAll, setIsExpandAll] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)

  // 获取部门列表
  const getList = async (params?: DeptQueryParams) => {
    setLoading(true)
    try {
      const res = await listDept(params)
      if (res.code === 200) {
        const deptTree = handleTree(res.data || [], 'deptId')
        setDeptList(deptTree)
        // 设置展开的 row keys
        const keys = getAllKeys(deptTree)
        setExpandedRowKeys(keys)
      }
    } catch (error) {
      console.error('获取部门列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取所有部门节点的 key
  const getAllKeys = (data: SysDept[]): React.Key[] => {
    const keys: React.Key[] = []
    const loop = (items: SysDept[]) => {
      items.forEach(item => {
        if (item.deptId !== undefined) {
          keys.push(item.deptId)
        }
        if (item.children && item.children.length > 0) {
          loop(item.children)
        }
      })
    }
    loop(data)
    return keys
  }

  // 处理树形数据
  const handleTree = (data: any[], keyField: string): any[] => {
    const result: any[] = []
    const temp: Record<string, any> = {}
    
    for (let i = 0; i < data.length; i++) {
      temp[data[i][keyField]] = data[i]
    }
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const parentId = item.parentId
      if (parentId !== null && parentId !== undefined && temp[parentId]) {
        if (!temp[parentId].children) {
          temp[parentId].children = []
        }
        temp[parentId].children.push(item)
      } else {
        result.push(item)
      }
    }
    return result
  }

  useEffect(() => {
    getList()
  }, [])

  // 搜索
  const handleQuery = () => {
    const values = queryParamsForm.getFieldsValue()
    const newParams: DeptQueryParams = {
      deptName: values.deptName,
      status: values.status
    }
    manualRequestRef.current = true
    getList(newParams)
  }

  // 重置
  const handleReset = () => {
    queryParamsForm.resetFields()
    manualRequestRef.current = true
    getList()
  }

  // 展开/折叠操作
  const toggleExpandAll = () => {
    const newExpandAll = !isExpandAll
    setIsExpandAll(newExpandAll)
    if (newExpandAll) {
      setExpandedRowKeys(getAllKeys(deptList))
    } else {
      setExpandedRowKeys([])
    }
  }

  // 获取部门选项树
  const getDeptOptions = async (excludeId?: number) => {
    try {
      let res
      if (excludeId) {
        res = await listDeptExcludeChild(excludeId)
      } else {
        res = await listDept()
      }
      if (res.code === 200) {
        const tree = handleTree(res.data || [], 'deptId')
        setDeptOptions(convertToTreeSelect(tree))
      }
    } catch (error) {
      console.error('获取部门树失败:', error)
    }
  }

  // 转换为 TreeSelect 格式
  const convertToTreeSelect = (data: SysDept[]): DeptTreeSelect[] => {
    return data.map(item => ({
      id: item.deptId!,
      label: item.deptName!,
      children: item.children ? convertToTreeSelect(item.children) : undefined
    }))
  }

  // 新增部门
  const handleAdd = async (row?: SysDept) => {
    reset()
    await getDeptOptions()
    if (row && row.deptId) {
      setCurrentDept({ parentId: row.deptId })
      form.setFieldsValue({ parentId: row.deptId })
    } else {
      setCurrentDept({ parentId: 0 })
      form.setFieldsValue({ parentId: 0 })
    }
    setModalTitle('添加部门')
    setModalVisible(true)
  }

  // 修改部门
  const handleUpdate = async (row: SysDept) => {
    reset()
    await getDeptOptions(row.deptId)
    try {
      const res = await getDept(row.deptId!)
      if (res.code === 200) {
        setCurrentDept(res.data || {})
        setModalTitle('修改部门')
        setModalVisible(true)
        form.setFieldsValue({
          parentId: res.data?.parentId,
          deptName: res.data?.deptName,
          orderNum: res.data?.orderNum,
          leader: res.data?.leader,
          phone: res.data?.phone,
          email: res.data?.email,
          status: res.data?.status
        })
      }
    } catch (error) {
      console.error('获取部门详情失败:', error)
      message.error('获取部门详情失败')
    }
  }

  // 删除部门
  const handleDelete = (row: SysDept) => {
    if (row.parentId === 0) {
      message.warning('不能删除父节点')
      return
    }
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除名称为"' + row.deptName + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delDept(row.deptId!)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除部门失败:', error)
        }
      }
    })
  }

  // 重置表单
  const reset = () => {
    setCurrentDept({})
    form.resetFields()
    form.setFieldsValue({
      parentId: undefined,
      orderNum: 0,
      status: '0'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentDept, ...values }

      if (currentDept.deptId !== undefined) {
        const res = await updateDept(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addDept(data)
        if (res.code === 200) {
          message.success('新增成功')
          setModalVisible(false)
          getList()
        }
      }
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  // 表格列定义
  const columns: ColumnsType<SysDept> = [
    {
      title: '部门名称',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 260
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 100,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (text: string) => (
        <span style={{ color: text === '0' ? 'green' : 'red' }}>
          {text === '0' ? '正常' : '停用'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      align: 'center',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Auth permission="system:dept:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:dept:add">
            <Tooltip title="新增">
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleAdd(record)}
              />
            </Tooltip>
          </Auth>
          {record.parentId !== 0 && (
            <Auth permission="system:dept:remove">
              <Tooltip title="删除">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            </Auth>
          )}
        </Space>
      )
    }
  ]

  // 转换为 TreeSelect 数据格式
  const convertTreeData = (data: DeptTreeSelect[]): any[] => {
    return data.map(item => ({
      value: item.id,
      title: item.label,
      children: item.children ? convertTreeData(item.children) : undefined
    }))
  }

  return (
    <div className="app-container">
      {/* 搜索区域 */}
      {showSearch && (
        <Card className="search-card" size="small">
          <Form form={queryParamsForm}>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="deptName" label="部门名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入部门名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="部门状态"
                    style={{ width: 200 }}
                    allowClear
                  >
                    <Select.Option value="0">正常</Select.Option>
                    <Select.Option value="1">停用</Select.Option>
                  </Select>
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
            <Auth permission="system:dept:add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleAdd()}
              >
                新增
              </Button>
            </Auth>
            <Button
              icon={<SortDescendingOutlined />}
              onClick={toggleExpandAll}
            >
              展开/折叠
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={deptList}
          rowKey="deptId"
          loading={loading}
          size="small"
          pagination={false}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as number[])
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={640}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
        >
          <Row gutter={16}>
            <Col span={24} hidden={currentDept.parentId === 0}>
              <Form.Item
                name="parentId"
                label="上级部门"
                rules={[{ required: true, message: '上级部门不能为空' }]}
              >
                <TreeSelect
                  placeholder="选择上级部门"
                  treeData={convertTreeData(deptOptions)}
                  allowClear
                  showSearch
                  treeNodeFilterProp="title"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deptName"
                label="部门名称"
                rules={[{ required: true, message: '部门名称不能为空' }]}
              >
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderNum"
                label="显示排序"
                rules={[{ required: true, message: '显示排序不能为空' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="leader"
                label="负责人"
              >
                <Input placeholder="请输入负责人" maxLength={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码' }]}
              >
                <Input placeholder="请输入联系电话" maxLength={11} />
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
            <Col span={12}>
              <Form.Item
                name="status"
                label="部门状态"
              >
                <Radio.Group>
                  <Radio value="0">正常</Radio>
                  <Radio value="1">停用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default DeptManagement
