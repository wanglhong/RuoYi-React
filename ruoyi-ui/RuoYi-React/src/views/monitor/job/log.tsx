import React, { useEffect, useState, useRef } from 'react'
import {
  Table,
  Card,
  Button,
  Space,
  Form,
  Input,
  Select,
  Modal,
  message,
  Row,
  Col,
  DatePicker,
  Typography
} from 'antd'
import {
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { listJobLog, delJobLog, cleanJobLog } from '@/api/monitor/jobLog'
import { getJob } from '@/api/monitor/job'
import type { JobLogQueryParams, SysJobLog } from '@/types'
import Auth from '@/components/Auth'
import { useParams, useNavigate } from 'react-router-dom'
import '../index.scss'

const { Text } = Typography
const { RangePicker } = DatePicker

const JobLogManagement: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [jobLogList, setJobLogList] = useState<SysJobLog[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()
  const [dateRange, setDateRange] = useState<[any, any] | null>(null)
  const [viewLogData, setViewLogData] = useState<SysJobLog | null>(null)

  // 用于跟踪搜索条件
  const searchParamsRef = useRef<JobLogQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 任务组字典
  const jobGroupOptions = [
    { label: '系统默认', value: '1' },
    { label: '系统用户', value: '2' },
    { label: '系统测试', value: '3' }
  ]

  // 状态字典
  const statusOptions = [
    { label: '正常', value: '0' },
    { label: '失败', value: '1' }
  ]

  // 获取调度日志列表
  const getList = async (params?: JobLogQueryParams) => {
    setLoading(true)
    try {
      let requestParams: JobLogQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      // 添加日期范围
      if (dateRange && dateRange.length === 2) {
        requestParams.beginTime = dateRange[0].format('YYYY-MM-DD HH:mm:ss')
        requestParams.endTime = dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      }

      const res = await listJobLog(requestParams)
      if (res.code === 200) {
        setJobLogList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取调度日志列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 如果有 jobId 参数，查询任务信息并填充搜索条件
    if (jobId && jobId !== '0') {
      getJob(Number(jobId)).then(response => {
        if (response.code === 200) {
          queryParamsForm.setFieldsValue({
            jobName: response.data?.jobName,
            jobGroup: response.data?.jobGroup
          })
        }
        getList()
      })
    } else {
      getList()
    }
  }, [])

  // 搜索
  const handleQuery = () => {
    const values = queryParamsForm.getFieldsValue()
    const newParams: JobLogQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      jobName: values.jobName,
      jobGroup: values.jobGroup,
      status: values.status
    }
    getList(newParams)
  }

  // 重置
  const handleReset = () => {
    queryParamsForm.resetFields()
    setDateRange(null)
    const newParams = {
      pageNum: 1,
      pageSize: 10
    }
    searchParamsRef.current = newParams
    getList(newParams)
  }

  // 多选框选中数据
  const handleSelectionChange = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys as number[])
  }

  // 详细
  const handleView = (row: SysJobLog) => {
    form.setFieldsValue(row)
    setViewLogData(row)
    setOpen(true)
  }

  // 删除
  const handleDelete = async () => {
    try {
      await Modal.confirm({
        title: '系统提示',
        content: `是否确认删除调度日志编号为 "${selectedRowKeys}" 的数据项？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          const res = await delJobLog(selectedRowKeys)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        }
      })
    } catch (error) {
      console.error('删除调度日志失败:', error)
    }
  }

  // 清空
  const handleClean = async () => {
    try {
      await Modal.confirm({
        title: '系统提示',
        content: '是否确认清空所有调度日志数据项？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          const res = await cleanJobLog()
          if (res.code === 200) {
            message.success('清空成功')
            getList()
          }
        }
      })
    } catch (error) {
      console.error('清空调度日志失败:', error)
    }
  }

  // 导出
  const handleExport = () => {
    message.info('导出功能开发中')
    // TODO: 实现导出功能
  }

  // 关闭
  const handleClose = () => {
    navigate('/monitor/job')
  }

  // 表格列定义
  const columns: ColumnsType<SysJobLog> = [
    {
      title: '日志编号',
      dataIndex: 'jobLogId',
      key: 'jobLogId',
      width: 80,
      align: 'center'
    },
    {
      title: '任务名称',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '任务组名',
      dataIndex: 'jobGroup',
      key: 'jobGroup',
      width: 100,
      align: 'center',
      render: (text: string) => {
        const option = jobGroupOptions.find(item => item.value === text)
        return option ? option.label : text
      }
    },
    {
      title: '调用目标字符串',
      dataIndex: 'invokeTarget',
      key: 'invokeTarget',
      width: 200,
      align: 'center',
      ellipsis: true
    },
    {
      title: '日志信息',
      dataIndex: 'jobMessage',
      key: 'jobMessage',
      width: 200,
      align: 'center',
      ellipsis: true
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (text: string) => {
        const option = statusOptions.find(item => item.value === text)
        return (
          <span style={{ color: text === '0' ? 'green' : 'red' }}>
            {option ? option.label : '未知'}
          </span>
        )
      }
    },
    {
      title: '执行时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      align: 'center',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          详细
        </Button>
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
                <Form.Item name="jobName" label="任务名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入任务名称"
                    style={{ width: 240 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="jobGroup" label="任务组名" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="请选择任务组名"
                    style={{ width: 240 }}
                    allowClear
                  >
                    {jobGroupOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="执行状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="请选择执行状态"
                    style={{ width: 240 }}
                    allowClear
                  >
                    {statusOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="执行时间" name="dateRange" style={{ marginBottom: 0 }}>
                  <RangePicker
                    style={{ width: 308 }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={(dates) => setDateRange(dates as [any, any] | null)}
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
            <Auth permission="monitor:job:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={handleDelete}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="monitor:job:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClean}
              >
                清空
              </Button>
            </Auth>
            <Auth permission="monitor:job:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
            <Button icon={<CloseOutlined />} onClick={handleClose}>
              关闭
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={jobLogList}
          rowKey="jobLogId"
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
            onChange: handleSelectionChange
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 调度日志详细对话框 */}
      <Modal
        title="调度日志详细"
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <Button onClick={() => setOpen(false)}>关闭</Button>
        }
        width={700}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="日志序号：" name="jobLogId">
                <Text>{viewLogData?.jobLogId}</Text>
              </Form.Item>
              <Form.Item label="任务名称：" name="jobName">
                <Text>{viewLogData?.jobName}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="任务分组：" name="jobGroup">
                <Text>
                  {jobGroupOptions.find(item => item.value === viewLogData?.jobGroup)?.label || viewLogData?.jobGroup}
                </Text>
              </Form.Item>
              <Form.Item label="执行时间：" name="createTime">
                <Text>{viewLogData?.createTime}</Text>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="调用方法：" name="invokeTarget">
                <Text>{viewLogData?.invokeTarget}</Text>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="日志信息：" name="jobMessage">
                <Text>{viewLogData?.jobMessage}</Text>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="执行状态：" name="status">
                <Text>{viewLogData?.status === '0' ? '正常' : '失败'}</Text>
              </Form.Item>
            </Col>
            {viewLogData?.status === '1' && (
              <Col span={24}>
                <Form.Item label="异常信息：" name="exceptionInfo">
                  <Text type="danger">{viewLogData?.exceptionInfo}</Text>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default JobLogManagement
