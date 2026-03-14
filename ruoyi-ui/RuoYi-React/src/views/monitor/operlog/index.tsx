import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, Row, Col, DatePicker } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType, SorterResult } from 'antd/es/table'
import type { SysOperLog, OperlogQueryParams } from '@/types/system'
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog'
import Auth from '@/components/Auth'
import '../index.scss'

const RangePicker = DatePicker.RangePicker

const OperlogManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [operlogList, setOperlogList] = useState<SysOperLog[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOperlog, setCurrentOperlog] = useState<SysOperLog>({})
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<OperlogQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 操作类型字典
  const operTypeOptions = [
    { label: '其他', value: 0 },
    { label: '新增', value: 1 },
    { label: '修改', value: 2 },
    { label: '删除', value: 3 },
    { label: '授权', value: 4 },
    { label: '导出', value: 5 },
    { label: '导入', value: 6 },
    { label: '强退', value: 7 },
    { label: '生成代码', value: 8 },
    { label: '清空数据', value: 9 }
  ]

  // 状态字典
  const statusOptions = [
    { label: '成功', value: 0 },
    { label: '失败', value: 1 }
  ]

  // 获取操作日志列表
  const getList = async (params?: OperlogQueryParams) => {
    setLoading(true)
    try {
      let requestParams: OperlogQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await list(requestParams)
      if (res.code === 200) {
        setOperlogList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取操作日志列表失败:', error)
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
    
    const newParams: OperlogQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      operIp: values.operIp,
      title: values.title,
      operName: values.operName,
      businessType: values.businessType,
      status: values.status
    }

    if (dateRange && dateRange.length === 2) {
      newParams.beginTime = dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      newParams.endTime = dateRange[1].format('YYYY-MM-DD HH:mm:ss')
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

  // 删除操作日志
  const handleDelete = (operId?: number) => {
    const operIds = operId || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除日志编号为"' + operIds + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delOperlog(operIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除操作日志失败:', error)
        }
      }
    })
  }

  // 清空操作日志
  const handleClean = async () => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认清空所有操作日志数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await cleanOperlog()
          if (res.code === 200) {
            message.success('清空成功')
            getList()
          }
        } catch (error) {
          console.error('清空操作日志失败:', error)
        }
      }
    })
  }

  // 查看详细
  const handleView = (row: SysOperLog) => {
    setCurrentOperlog(row)
    setDetailVisible(true)
  }

  // 获取操作类型名称
  const getTypeFormat = (businessType?: number): string => {
    const option = operTypeOptions.find(item => item.value === businessType)
    return option ? option.label : '其他'
  }

  // 表格列定义
  const columns: ColumnsType<SysOperLog> = [
    {
      title: '日志编号',
      dataIndex: 'operId',
      key: 'operId',
      width: 100,
      align: 'center'
    },
    {
      title: '系统模块',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '操作类型',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 100,
      align: 'center',
      render: (text: number) => {
        const option = operTypeOptions.find(item => item.value === text)
        return <span>{option ? option.label : '其他'}</span>
      }
    },
    {
      title: '操作人员',
      dataIndex: 'operName',
      key: 'operName',
      width: 110,
      align: 'center',
      ellipsis: true,
      sorter: true
    },
    {
      title: '操作地址',
      dataIndex: 'operIp',
      key: 'operIp',
      width: 130,
      align: 'center',
      ellipsis: true
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (text: number) => {
        const option = statusOptions.find(item => item.value === text)
        return (
          <span style={{ color: text === 0 ? 'green' : 'red' }}>
            {option ? option.label : '未知'}
          </span>
        )
      }
    },
    {
      title: '操作日期',
      dataIndex: 'operTime',
      key: 'operTime',
      width: 160,
      align: 'center',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-',
      sorter: true
    },
    {
      title: '消耗时间',
      dataIndex: 'costTime',
      key: 'costTime',
      width: 100,
      align: 'center',
      render: (text: number) => text ? text + '毫秒' : '-',
      sorter: true
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Auth permission="monitor:operlog:query">
            <Tooltip title="详细">
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              />
            </Tooltip>
          </Auth>
        </Space>
      )
    }
  ]

  // 处理排序
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      const newParams = {
        ...searchParamsRef.current,
        orderByColumn: sorter.field,
        isAsc: sorter.order === 'ascend' ? 'asc' : 'desc'
      }
      searchParamsRef.current = newParams
      getList(newParams)
    }
  }

  return (
    <div className="app-container">
      {/* 搜索区域 */}
      {showSearch && (
        <Card className="search-card" size="small">
          <Form form={queryParamsForm}>
            <Row gutter={[16, 16]}>
              <Col>
                <Form.Item name="operIp" label="操作地址" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入操作地址"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="title" label="系统模块" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入系统模块"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="operName" label="操作人员" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入操作人员"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="businessType" label="类型" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="操作类型"
                    style={{ width: 200 }}
                    allowClear
                  >
                    {operTypeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="操作状态"
                    style={{ width: 200 }}
                    allowClear
                  >
                    {statusOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="操作时间" name="dateRange" style={{ marginBottom: 0 }}>
                  <RangePicker style={{ width: 280 }} format="YYYY-MM-DD HH:mm:ss" />
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
            <Auth permission="monitor:operlog:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleDelete()}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="monitor:operlog:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClean}
              >
                清空
              </Button>
            </Auth>
            <Auth permission="monitor:operlog:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={operlogList}
          rowKey="operId"
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
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 操作日志详细对话框 */}
      <Modal
        title="操作日志详细"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={
          <Button onClick={() => setDetailVisible(false)}>关 闭</Button>
        }
        destroyOnHidden
      >
        <Form labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="操作模块：">
                <span>{currentOperlog.title} / {getTypeFormat(currentOperlog.businessType)}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="登录信息：">
                <span>{currentOperlog.operName} / {currentOperlog.operIp} / {currentOperlog.operLocation}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="请求地址：">
                <span>{currentOperlog.operUrl}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="请求方式：">
                <span>{currentOperlog.requestMethod}</span>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="操作方法：">
                <span>{currentOperlog.method}</span>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="请求参数：" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                <span>{currentOperlog.operParam}</span>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="返回参数：">
                <span>{currentOperlog.jsonResult}</span>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="操作状态：">
                <span>{currentOperlog.status === 0 ? '正常' : '失败'}</span>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="消耗时间：">
                <span>{currentOperlog.costTime}毫秒</span>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="操作时间：">
                <span>{currentOperlog.operTime ? new Date(currentOperlog.operTime).toLocaleString() : '-'}</span>
              </Form.Item>
            </Col>
            {currentOperlog.status === 1 && (
              <Col span={24}>
                <Form.Item label="异常信息：">
                  <span>{currentOperlog.errorMsg}</span>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default OperlogManagement
