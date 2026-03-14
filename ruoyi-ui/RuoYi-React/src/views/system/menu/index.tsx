import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, Radio, TreeSelect, Row, Col, InputNumber, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, SortDescendingOutlined, FolderOutlined, FolderOpenOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysMenu, MenuQueryParams, TreeSelect as TreeSelectType } from '@/types/system'
import { listMenu, getMenu, addMenu, updateMenu, delMenu, treeselect } from '@/api/system/menu'
import Auth from '@/components/Auth'
import '../index.scss'

const MenuManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [menuList, setMenuList] = useState<SysMenu[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentMenu, setCurrentMenu] = useState<SysMenu>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()
  const [menuOptions, setMenuOptions] = useState<TreeSelectType[]>([])
  const [isExpandAll, setIsExpandAll] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])
  const [menuType, setMenuType] = useState<string>('')

  // 监听菜单类型字段变化
  Form.useWatch('menuType', form, (value) => {
    setMenuType(value)
  })

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)

  // 获取菜单列表
  const getList = async (params?: MenuQueryParams) => {
    setLoading(true)
    try {
      const res = await listMenu(params)
      if (res.code === 200) {
        const menuTree = handleTree(res.data || [], 'menuId')
        setMenuList(menuTree)
        // 默认折叠，不设置 expandedRowKeys
      }
    } catch (error) {
      console.error('获取菜单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取所有菜单节点的 key
  const getAllKeys = (data: SysMenu[]): React.Key[] => {
    const keys: React.Key[] = []
    const loop = (items: SysMenu[]) => {
      items.forEach(item => {
        if (item.menuId !== undefined) {
          keys.push(item.menuId)
        }
        if (item.children && item.children.length > 0) {
          loop(item.children)
        }
      })
    }
    loop(data)
    return keys
  }

  // 查询菜单下拉树结构
  const getTreeselect = async () => {
    try {
      const res = await treeselect()
      if (res.code === 200) {
        const menu = { id: 0, label: '主类目', children: res.data || [] }
        setMenuOptions([menu])
      }
    } catch (error) {
      console.error('获取菜单树失败:', error)
    }
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
    const newParams: MenuQueryParams = {
      menuName: values.menuName,
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
      setExpandedRowKeys(getAllKeys(menuList))
    } else {
      setExpandedRowKeys([])
    }
  }

  // 新增菜单
  const handleAdd = async (row?: SysMenu) => {
    reset()
    await getTreeselect()
    if (row && row.menuId) {
      setCurrentMenu({ parentId: row.menuId })
    } else {
      setCurrentMenu({ parentId: 0 })
    }
    setModalTitle('添加菜单')
    setModalVisible(true)
  }

  // 修改菜单
  const handleUpdate = async (row: SysMenu) => {
    reset()
    await getTreeselect()
    try {
      const res = await getMenu(row.menuId!)
      if (res.code === 200) {
        setCurrentMenu(res.data || {})
        setModalTitle('修改菜单')
        setModalVisible(true)
        form.setFieldsValue({
          parentId: res.data?.parentId,
          menuName: res.data?.menuName,
          icon: res.data?.icon,
          menuType: res.data?.menuType,
          orderNum: res.data?.orderNum,
          isFrame: res.data?.isFrame,
          isCache: res.data?.isCache,
          visible: res.data?.visible,
          status: res.data?.status,
          path: res.data?.path,
          component: res.data?.component,
          perms: res.data?.perms,
          query: res.data?.query,
          routeName: res.data?.routeName
        })
      }
    } catch (error) {
      console.error('获取菜单详情失败:', error)
      message.error('获取菜单详情失败')
    }
  }

  // 删除菜单
  const handleDelete = (row: SysMenu) => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除名称为"' + row.menuName + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delMenu(row.menuId!)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除菜单失败:', error)
        }
      }
    })
  }

  // 重置表单
  const reset = () => {
    setCurrentMenu({})
    form.resetFields()
    form.setFieldsValue({
      parentId: 0,
      menuType: 'M',
      isFrame: '1',
      isCache: '0',
      visible: '0',
      status: '0'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentMenu, ...values }

      if (currentMenu.menuId !== undefined) {
        const res = await updateMenu(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addMenu(data)
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
  const columns: ColumnsType<SysMenu> = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
      width: 200,
      ellipsis: true
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      align: 'center',
      render: (text: string) => text ? <span className="menu-icon">{text}</span> : '-'
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 80,
      align: 'center'
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
      key: 'perms',
      width: 200,
      ellipsis: true
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
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
      width: 160,
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
          <Auth permission="system:menu:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:menu:add">
            <Tooltip title="新增">
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleAdd(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:menu:remove">
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
        </Space>
      )
    }
  ]

  // 转换菜单树为 TreeSelect 格式
  const convertToTreeData = (data: TreeSelectType[]): any[] => {
    return data.map(item => ({
      value: item.id,
      title: item.label,
      children: item.children ? convertToTreeData(item.children) : undefined
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
                <Form.Item name="menuName" label="菜单名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入菜单名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="菜单状态"
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
            <Auth permission="system:menu:add">
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
          dataSource={menuList}
          rowKey="menuId"
          loading={loading}
          size="small"
          pagination={false}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as number[])
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={720}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="parentId"
                label="上级菜单"
              >
                <TreeSelect
                  placeholder="选择上级菜单"
                  treeData={convertToTreeData(menuOptions)}
                  allowClear
                  showSearch
                  treeNodeFilterProp="title"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="menuType"
                label="菜单类型"
                rules={[{ required: true, message: '请选择菜单类型' }]}
              >
                <Radio.Group>
                  <Radio value="M">目录</Radio>
                  <Radio value="C">菜单</Radio>
                  <Radio value="F">按钮</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderNum"
                label="显示排序"
                rules={[{ required: true, message: '菜单顺序不能为空' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="menuName"
                label="菜单名称"
                rules={[{ required: true, message: '菜单名称不能为空' }]}
              >
                <Input placeholder="请输入菜单名称" />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType === 'F'}>
              <Form.Item
                name="icon"
                label="菜单图标"
              >
                <Input placeholder="点击选择图标" readOnly />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType === 'F'}>
              <Form.Item
                name="isFrame"
                label="是否外链"
              >
                <Radio.Group>
                  <Radio value="1">否</Radio>
                  <Radio value="0">是</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType === 'F'}>
              <Form.Item
                name="path"
                label="路由地址"
                rules={[{ required: true, message: '路由地址不能为空' }]}
              >
                <Input placeholder="请输入路由地址" />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType !== 'C'}>
              <Form.Item
                name="routeName"
                label="路由名称"
              >
                <Input placeholder="请输入路由名称" />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType !== 'C'}>
              <Form.Item
                name="component"
                label="组件路径"
              >
                <Input placeholder="请输入组件路径" />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType === 'M'}>
              <Form.Item
                name="perms"
                label="权限字符"
              >
                <Input placeholder="请输入权限标识" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType !== 'C'}>
              <Form.Item
                name="query"
                label="路由参数"
              >
                <Input placeholder="请输入路由参数" maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType !== 'C'}>
              <Form.Item
                name="isCache"
                label="是否缓存"
              >
                <Radio.Group>
                  <Radio value="0">缓存</Radio>
                  <Radio value="1">不缓存</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12} hidden={menuType === 'F'}>
              <Form.Item
                name="visible"
                label="显示状态"
              >
                <Radio.Group>
                  <Radio value="0">显示</Radio>
                  <Radio value="1">隐藏</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="菜单状态"
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

export default MenuManagement
