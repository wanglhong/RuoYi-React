import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, Row, Col, Radio, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysDictType, DictTypeQueryParams } from '@/types/system'
import { listType, getType, addType, updateType, delType, refreshCache } from '@/api/system/dict'
import Auth from '@/components/Auth'
import DictData from './data'
import '../index.scss'

const RangePicker = DatePicker.RangePicker

const DictManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [typeList, setTypeList] = useState<SysDictType[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentDict, setCurrentDict] = useState<SysDictType>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()
  const [dictDataVisible, setDictDataVisible] = useState(false)
  const [currentDictType, setCurrentDictType] = useState<string>('')
  const [currentDictName, setCurrentDictName] = useState<string>('')

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<DictTypeQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取字典类型列表
  const getList = async (params?: DictTypeQueryParams) => {
    setLoading(true)
    try {
      let requestParams: DictTypeQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await listType(requestParams)
      if (res.code === 200) {
        setTypeList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取字典类型列表失败:', error)
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
    
    const newParams: DictTypeQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      dictName: values.dictName,
      dictType: values.dictType,
      status: values.status
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

  // 新增字典类型
  const handleAdd = () => {
    reset()
    setModalTitle('添加字典类型')
    setModalVisible(true)
  }

  // 修改字典类型
  const handleUpdate = async (row?: SysDictType) => {
    reset()
    const dictId = row?.dictId || selectedRowKeys[0]
    try {
      const res = await getType(dictId)
      if (res.code === 200) {
        setCurrentDict(res.data || {})
        setModalTitle('修改字典类型')
        setModalVisible(true)
        form.setFieldsValue({
          dictName: res.data?.dictName,
          dictType: res.data?.dictType,
          status: res.data?.status,
          remark: res.data?.remark
        })
      }
    } catch (error) {
      console.error('获取字典类型详情失败:', error)
      message.error('获取字典类型详情失败')
    }
  }

  // 删除字典类型
  const handleDelete = (dictId?: number) => {
    const dictIds = dictId || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除字典编号为"' + dictIds + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delType(dictIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除字典类型失败:', error)
        }
      }
    })
  }

  // 打开字典数据管理
  const handleDictData = (row: SysDictType) => {
    setCurrentDictType(row.dictType || '')
    setCurrentDictName(row.dictName || '')
    setDictDataVisible(true)
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
    setCurrentDict({})
    form.resetFields()
    form.setFieldsValue({
      status: '0'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentDict, ...values }

      if (currentDict.dictId !== undefined) {
        const res = await updateType(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addType(data)
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
  const columns: ColumnsType<SysDictType> = [
    {
      title: '字典编号',
      dataIndex: 'dictId',
      key: 'dictId',
      width: 100,
      align: 'center'
    },
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 180,
      align: 'center',
      ellipsis: true,
      render: (text: string, record: SysDictType) => (
        <a onClick={() => handleDictData(record)}>{text}</a>
      )
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
          <Auth permission="system:dict:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:dict:remove">
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.dictId)}
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
                <Form.Item name="dictName" label="字典名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入字典名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="dictType" label="字典类型" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入字典类型"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="字典状态"
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
            <Auth permission="system:dict:add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </Auth>
            <Auth permission="system:dict:edit">
              <Button
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => handleUpdate()}
              >
                修改
              </Button>
            </Auth>
            <Auth permission="system:dict:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleDelete()}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="system:dict:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
            <Auth permission="system:dict:remove">
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
          dataSource={typeList}
          rowKey="dictId"
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
                name="dictName"
                label="字典名称"
                rules={[{ required: true, message: '字典名称不能为空' }]}
              >
                <Input placeholder="请输入字典名称" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="dictType"
                label="字典类型"
                rules={[{ required: true, message: '字典类型不能为空' }]}
              >
                <Input placeholder="请输入字典类型" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="status"
                label="状态"
              >
                <Radio.Group>
                  <Radio value="0">正常</Radio>
                  <Radio value="1">停用</Radio>
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

      {/* 字典数据管理弹窗 */}
      <DictData 
        visible={dictDataVisible} 
        onClose={() => setDictDataVisible(false)}
        dictType={currentDictType}
        dictName={currentDictName}
      />
    </div>
  )
}

export default DictManagement
