import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, Row, Col, Radio, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysConfig, ConfigQueryParams } from '@/types/system'
import { listConfig, getConfig, addConfig, updateConfig, delConfig, refreshCache } from '@/api/system/config'
import Auth from '@/components/Auth'
import '../index.scss'

const RangePicker = DatePicker.RangePicker

const ConfigManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [configList, setConfigList] = useState<SysConfig[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentConfig, setCurrentConfig] = useState<SysConfig>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<ConfigQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取参数列表
  const getList = async (params?: ConfigQueryParams) => {
    setLoading(true)
    try {
      let requestParams: ConfigQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await listConfig(requestParams)
      if (res.code === 200) {
        setConfigList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取参数列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getList()
  }, [])

  // 搜索
  const handleQuery = () => {
    const values = queryParamsForm.getFieldsValue()
    const dateRange = queryParamsForm.getFieldValue('dateRange')
    
    const newParams: ConfigQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      configName: values.configName,
      configKey: values.configKey,
      configType: values.configType
    }

    if (dateRange && dateRange.length === 2) {
      newParams.beginTime = dateRange[0].format('YYYY-MM-DD')
      newParams.endTime = dateRange[1].format('YYYY-MM-DD')
    }

    manualRequestRef.current = true
    getList(newParams)
  }

  // 重置
  const handleReset = () => {
    queryParamsForm.resetFields()
    const newParams = {
      pageNum: 1,
      pageSize: 10
    }
    searchParamsRef.current = newParams
    manualRequestRef.current = true
    getList(newParams)
  }

  // 新增参数
  const handleAdd = () => {
    reset()
    setModalTitle('添加参数')
    setModalVisible(true)
  }

  // 修改参数
  const handleUpdate = async (row?: SysConfig) => {
    reset()
    const configId = row?.configId || selectedRowKeys[0]
    try {
      const res = await getConfig(configId)
      if (res.code === 200) {
        setCurrentConfig(res.data || {})
        setModalTitle('修改参数')
        setModalVisible(true)
        form.setFieldsValue({
          configName: res.data?.configName,
          configKey: res.data?.configKey,
          configValue: res.data?.configValue,
          configType: res.data?.configType,
          remark: res.data?.remark
        })
      }
    } catch (error) {
      console.error('获取参数详情失败:', error)
      message.error('获取参数详情失败')
    }
  }

  // 删除参数
  const handleDelete = (configId?: number) => {
    const configIds = configId || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除参数编号为"' + configIds + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delConfig(configIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除参数失败:', error)
        }
      }
    })
  }

  // 刷新缓存
  const handleRefreshCache = async () => {
    try {
      const res = await refreshCache()
      if (res.code === 200) {
        message.success('刷新缓存成功')
      }
    } catch (error) {
      console.error('刷新缓存失败:', error)
    }
  }

  // 重置表单
  const reset = () => {
    setCurrentConfig({})
    form.resetFields()
    form.setFieldsValue({
      configType: 'Y'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentConfig, ...values }

      if (currentConfig.configId !== undefined) {
        const res = await updateConfig(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addConfig(data)
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
  const columns: ColumnsType<SysConfig> = [
    {
      title: '参数主键',
      dataIndex: 'configId',
      key: 'configId',
      width: 100,
      align: 'center'
    },
    {
      title: '参数名称',
      dataIndex: 'configName',
      key: 'configName',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '参数键名',
      dataIndex: 'configKey',
      key: 'configKey',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '参数键值',
      dataIndex: 'configValue',
      key: 'configValue',
      width: 200,
      align: 'center',
      ellipsis: true
    },
    {
      title: '系统内置',
      dataIndex: 'configType',
      key: 'configType',
      width: 100,
      align: 'center',
      render: (text: string) => (
        <span style={{ color: text === 'Y' ? 'green' : 'red' }}>
          {text === 'Y' ? '是' : '否'}
        </span>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      align: 'center',
      ellipsis: true
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
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Auth permission="system:config:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:config:remove">
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.configId)}
              />
            </Tooltip>
          </Auth>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {/* 搜索区域 */}
      {showSearch && (
        <Card className="search-card" size="small">
          <Form form={queryParamsForm}>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="configName" label="参数名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入参数名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="configKey" label="参数键名" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入参数键名"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="configType" label="系统内置" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="系统内置"
                    style={{ width: 200 }}
                    allowClear
                  >
                    <Select.Option value="Y">是</Select.Option>
                    <Select.Option value="N">否</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="创建时间" name="dateRange" style={{ marginBottom: 0 }}>
                  <RangePicker style={{ width: 240 }} format="YYYY-MM-DD" />
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
            <Auth permission="system:config:add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </Auth>
            <Auth permission="system:config:edit">
              <Button
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => handleUpdate()}
              >
                修改
              </Button>
            </Auth>
            <Auth permission="system:config:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleDelete()}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="system:config:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
            <Auth permission="system:config:remove">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefreshCache}
              >
                刷新缓存
              </Button>
            </Auth>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={configList}
          rowKey="configId"
          loading={loading}
          size="small"
          pagination={{
            current: searchParamsRef.current.pageNum,
            pageSize: searchParamsRef.current.pageSize,
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
              searchParamsRef.current = newParams
              getList(newParams)
            }
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[])
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
        width={540}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="configName"
                label="参数名称"
                rules={[{ required: true, message: '参数名称不能为空' }]}
              >
                <Input placeholder="请输入参数名称" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="configKey"
                label="参数键名"
                rules={[{ required: true, message: '参数键名不能为空' }]}
              >
                <Input placeholder="请输入参数键名" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="configValue"
                label="参数键值"
                rules={[{ required: true, message: '参数键值不能为空' }]}
              >
                <Input.TextArea placeholder="请输入参数键值" rows={4} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="configType"
                label="系统内置"
              >
                <Radio.Group>
                  <Radio value="Y">是</Radio>
                  <Radio value="N">否</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="remark"
                label="备注"
              >
                <Input.TextArea placeholder="请输入内容" rows={4} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default ConfigManagement
