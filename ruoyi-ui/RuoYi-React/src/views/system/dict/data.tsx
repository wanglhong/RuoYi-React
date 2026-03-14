import React, { useState, useEffect, useRef } from 'react'
import { Modal, Table, Card, Button, Space, Form, Input, Select, InputNumber, Row, Col, Radio, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysDictData, DictDataQueryParams } from '@/types/system'
import { listData, getData, addData, updateData, delData } from '@/api/system/dict'
import Auth from '@/components/Auth'

interface DictDataProps {
  visible: boolean
  onClose: () => void
  dictType: string
  dictName: string
}

const DictData: React.FC<DictDataProps> = ({ visible, onClose, dictType, dictName }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState<SysDictData[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentData, setCurrentData] = useState<SysDictData>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<DictDataQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取字典数据列表
  const getList = async (params?: DictDataQueryParams) => {
    setLoading(true)
    try {
      let requestParams: DictDataQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      // 添加字典类型参数
      requestParams.dictType = dictType

      const res = await listData(requestParams)
      if (res.code === 200) {
        setDataList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取字典数据列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && dictType) {
      getList()
    }
  }, [visible, dictType])

  // 搜索
  const handleQuery = () => {
    const values = queryParamsForm.getFieldsValue()
    const newParams: DictDataQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      dictLabel: values.dictLabel,
      status: values.status
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

  // 新增字典数据
  const handleAdd = () => {
    reset()
    setModalTitle('添加字典数据')
    setModalVisible(true)
  }

  // 修改字典数据
  const handleUpdate = async (row?: SysDictData) => {
    reset()
    const dictCode = row?.dictCode || selectedRowKeys[0]
    try {
      const res = await getData(dictCode)
      if (res.code === 200) {
        setCurrentData(res.data || {})
        setModalTitle('修改字典数据')
        setModalVisible(true)
        form.setFieldsValue({
          dictLabel: res.data?.dictLabel,
          dictValue: res.data?.dictValue,
          dictSort: res.data?.dictSort,
          cssClass: res.data?.cssClass,
          listClass: res.data?.listClass,
          isDefault: res.data?.isDefault,
          status: res.data?.status
        })
      }
    } catch (error) {
      console.error('获取字典数据详情失败:', error)
      message.error('获取字典数据详情失败')
    }
  }

  // 删除字典数据
  const handleDelete = (dictCode?: number) => {
    const dictCodes = dictCode || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除字典编码为"' + dictCodes + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delData(dictCodes)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除字典数据失败:', error)
        }
      }
    })
  }

  // 重置表单
  const reset = () => {
    setCurrentData({})
    form.resetFields()
    form.setFieldsValue({
      dictSort: 0,
      isDefault: 'N',
      status: '0'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentData, ...values, dictType }

      if (currentData.dictCode !== undefined) {
        const res = await updateData(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addData(data)
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
  const columns: ColumnsType<SysDictData> = [
    {
      title: '字典编码',
      dataIndex: 'dictCode',
      key: 'dictCode',
      width: 100,
      align: 'center'
    },
    {
      title: '字典标签',
      dataIndex: 'dictLabel',
      key: 'dictLabel',
      width: 150,
      align: 'center'
    },
    {
      title: '字典键值',
      dataIndex: 'dictValue',
      key: 'dictValue',
      width: 150,
      align: 'center'
    },
    {
      title: '字典排序',
      dataIndex: 'dictSort',
      key: 'dictSort',
      width: 100,
      align: 'center'
    },
    {
      title: '是否默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      align: 'center',
      render: (text: string) => (
        <span style={{ color: text === 'Y' ? 'green' : 'red' }}>
          {text === 'Y' ? '是' : '否'}
        </span>
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
                onClick={() => handleDelete(record.dictCode)}
              />
            </Tooltip>
          </Auth>
        </Space>
      )
    }
  ]

  return (
    <>
      <Modal
        title={`字典数据管理 - ${dictName}`}
        open={visible}
        onCancel={onClose}
        width={900}
        footer={null}
        destroyOnHidden
      >
        {/* 搜索区域 */}
        <Card className="search-card" size="small" style={{ marginBottom: 16 }}>
          <Form form={queryParamsForm}>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="dictLabel" label="字典标签" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入字典标签"
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
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={dataList}
            rowKey="dictCode"
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
            scroll={{ x: 800 }}
          />
        </Card>
      </Modal>

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
            <Col span={12}>
              <Form.Item
                name="dictLabel"
                label="字典标签"
                rules={[{ required: true, message: '字典标签不能为空' }]}
              >
                <Input placeholder="请输入字典标签" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dictValue"
                label="字典键值"
                rules={[{ required: true, message: '字典键值不能为空' }]}
              >
                <Input placeholder="请输入字典键值" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dictSort"
                label="字典排序"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isDefault"
                label="是否默认"
              >
                <Radio.Group>
                  <Radio value="Y">是</Radio>
                  <Radio value="N">否</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cssClass"
                label="样式属性"
              >
                <Input placeholder="请输入样式属性" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="listClass"
                label="列表显示"
              >
                <Input placeholder="请输入列表显示" />
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
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default DictData
