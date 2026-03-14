import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, Row, Col, Radio } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysNotice, NoticeQueryParams } from '@/types/system'
import { listNotice, getNotice, addNotice, updateNotice, delNotice } from '@/api/system/notice'
import Auth from '@/components/Auth'
import '../index.scss'

const { TextArea } = Input

const NoticeManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [noticeList, setNoticeList] = useState<SysNotice[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentNotice, setCurrentNotice] = useState<SysNotice>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<NoticeQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取公告列表
  const getList = async (params?: NoticeQueryParams) => {
    setLoading(true)
    try {
      let requestParams: NoticeQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await listNotice(requestParams)
      if (res.code === 200) {
        setNoticeList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取公告列表失败:', error)
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
    const newParams: NoticeQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      noticeTitle: values.noticeTitle,
      createBy: values.createBy,
      noticeType: values.noticeType,
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

  // 新增公告
  const handleAdd = () => {
    reset()
    setModalTitle('添加公告')
    setModalVisible(true)
  }

  // 修改公告
  const handleUpdate = async (row?: SysNotice) => {
    reset()
    const noticeId = row?.noticeId || selectedRowKeys[0]
    try {
      const res = await getNotice(noticeId)
      if (res.code === 200) {
        setCurrentNotice(res.data || {})
        setModalTitle('修改公告')
        setModalVisible(true)
        form.setFieldsValue({
          noticeTitle: res.data?.noticeTitle,
          noticeType: res.data?.noticeType,
          noticeContent: res.data?.noticeContent,
          status: res.data?.status
        })
      }
    } catch (error) {
      console.error('获取公告详情失败:', error)
      message.error('获取公告详情失败')
    }
  }

  // 删除公告
  const handleDelete = (noticeId?: number) => {
    const noticeIds = noticeId || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除公告编号为"' + noticeIds + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delNotice(noticeIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除公告失败:', error)
        }
      }
    })
  }

  // 重置表单
  const reset = () => {
    setCurrentNotice({})
    form.resetFields()
    form.setFieldsValue({
      status: '0'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentNotice, ...values }

      if (currentNotice.noticeId !== undefined) {
        const res = await updateNotice(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addNotice(data)
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
  const columns: ColumnsType<SysNotice> = [
    {
      title: '序号',
      dataIndex: 'noticeId',
      key: 'noticeId',
      width: 80,
      align: 'center',
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '公告标题',
      dataIndex: 'noticeTitle',
      key: 'noticeTitle',
      width: 250,
      align: 'center',
      ellipsis: true
    },
    {
      title: '公告类型',
      dataIndex: 'noticeType',
      key: 'noticeType',
      width: 100,
      align: 'center',
      render: (text: string) => {
        const typeMap: Record<string, string> = {
          '1': '通知',
          '2': '公告'
        }
        return <span style={{ color: text === '1' ? 'blue' : 'orange' }}>{typeMap[text] || text}</span>
      }
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
      title: '创建者',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 100,
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      align: 'center',
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Auth permission="system:notice:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:notice:remove">
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.noticeId)}
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
                <Form.Item name="noticeTitle" label="公告标题" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入公告标题"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="createBy" label="操作人员" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入操作人员"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="noticeType" label="类型" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="公告类型"
                    style={{ width: 200 }}
                    allowClear
                  >
                    <Select.Option value="1">通知</Select.Option>
                    <Select.Option value="2">公告</Select.Option>
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
            <Auth permission="system:notice:add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </Auth>
            <Auth permission="system:notice:edit">
              <Button
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => handleUpdate()}
              >
                修改
              </Button>
            </Auth>
            <Auth permission="system:notice:remove">
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
          dataSource={noticeList}
          rowKey="noticeId"
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
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
                name="noticeTitle"
                label="公告标题"
                rules={[{ required: true, message: '公告标题不能为空' }]}
              >
                <Input placeholder="请输入公告标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="noticeType"
                label="公告类型"
                rules={[{ required: true, message: '公告类型不能为空' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="1">通知</Select.Option>
                  <Select.Option value="2">公告</Select.Option>
                </Select>
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
                name="noticeContent"
                label="内容"
                rules={[{ required: true, message: '公告内容不能为空' }]}
              >
                <TextArea placeholder="请输入公告内容" rows={8} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default NoticeManagement
