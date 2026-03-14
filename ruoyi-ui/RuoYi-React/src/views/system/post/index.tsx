import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, InputNumber, Row, Col, Radio } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysPost, PostQueryParams } from '@/types/system'
import { listPost, getPost, addPost, updatePost, delPost } from '@/api/system/post'
import Auth from '@/components/Auth'
import '../index.scss'

const PostManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [postList, setPostList] = useState<SysPost[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentPost, setCurrentPost] = useState<SysPost>({})
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<PostQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取岗位列表
  const getList = async (params?: PostQueryParams) => {
    setLoading(true)
    try {
      let requestParams: PostQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await listPost(requestParams)
      if (res.code === 200) {
        setPostList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取岗位列表失败:', error)
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
    const newParams: PostQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      postCode: values.postCode,
      postName: values.postName,
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

  // 新增岗位
  const handleAdd = () => {
    reset()
    setModalTitle('添加岗位')
    setModalVisible(true)
  }

  // 修改岗位
  const handleUpdate = async (row?: SysPost) => {
    reset()
    const postId = row?.postId || selectedRowKeys[0]
    try {
      const res = await getPost(postId)
      if (res.code === 200) {
        setCurrentPost(res.data || {})
        setModalTitle('修改岗位')
        setModalVisible(true)
        form.setFieldsValue({
          postCode: res.data?.postCode,
          postName: res.data?.postName,
          postSort: res.data?.postSort,
          status: res.data?.status,
          remark: res.data?.remark
        })
      }
    } catch (error) {
      console.error('获取岗位详情失败:', error)
      message.error('获取岗位详情失败')
    }
  }

  // 删除岗位
  const handleDelete = (postId?: number) => {
    const postIds = postId || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除岗位编号为"' + postIds + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delPost(postIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除岗位失败:', error)
        }
      }
    })
  }

  // 重置表单
  const reset = () => {
    setCurrentPost({})
    form.resetFields()
    form.setFieldsValue({
      postSort: 0,
      status: '0'
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...currentPost, ...values }

      if (currentPost.postId !== undefined) {
        const res = await updatePost(data)
        if (res.code === 200) {
          message.success('修改成功')
          setModalVisible(false)
          getList()
        }
      } else {
        const res = await addPost(data)
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
  const columns: ColumnsType<SysPost> = [
    {
      title: '岗位编号',
      dataIndex: 'postId',
      key: 'postId',
      width: 100,
      align: 'center'
    },
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      key: 'postCode',
      width: 150,
      align: 'center'
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'postName',
      width: 150,
      align: 'center'
    },
    {
      title: '岗位排序',
      dataIndex: 'postSort',
      key: 'postSort',
      width: 100,
      align: 'center'
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
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Auth permission="system:post:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="system:post:remove">
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.postId)}
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
                <Form.Item name="postCode" label="岗位编码" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入岗位编码"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="postName" label="岗位名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入岗位名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="岗位状态"
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
            <Auth permission="system:post:add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </Auth>
            <Auth permission="system:post:edit">
              <Button
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => handleUpdate()}
              >
                修改
              </Button>
            </Auth>
            <Auth permission="system:post:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleDelete()}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="system:post:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={postList}
          rowKey="postId"
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
                name="postName"
                label="岗位名称"
                rules={[{ required: true, message: '岗位名称不能为空' }]}
              >
                <Input placeholder="请输入岗位名称" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="postCode"
                label="岗位编码"
                rules={[{ required: true, message: '岗位编码不能为空' }]}
              >
                <Input placeholder="请输入编码名称" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="postSort"
                label="岗位顺序"
                rules={[{ required: true, message: '岗位顺序不能为空' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="status"
                label="岗位状态"
                rules={[{ required: true, message: '请选择岗位状态' }]}
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
    </div>
  )
}

export default PostManagement
