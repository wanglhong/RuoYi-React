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
  Tooltip,
  Row,
  Col,
  Switch,
  Radio,
  Typography
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CaretRightOutlined,
  EyeOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Rule } from 'antd/es/form'
import {
  listJob,
  getJob,
  delJob,
  addJob,
  updateJob,
  runJob,
  changeJobStatus
} from '@/api/monitor/job'
import type { JobQueryParams, SysJob } from '@/types'
import Auth from '@/components/Auth'
import { useNavigate } from 'react-router-dom'
import '../index.scss'

const { Text } = Typography

const JobManagement: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [jobList, setJobList] = useState<SysJob[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [title, setTitle] = useState('')
  const [form] = Form.useForm()
  const [queryParamsForm] = Form.useForm()
  const [currentJobId, setCurrentJobId] = useState<number | undefined>(undefined)
  const [viewJobData, setViewJobData] = useState<SysJob | null>(null)

  // 用于跟踪搜索条件
  const searchParamsRef = useRef<JobQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 任务组字典
  const jobGroupOptions = [
    { label: '系统默认', value: '1' },
    { label: '系统用户', value: '2' },
    { label: '系统测试', value: '3' }
  ]

  // 任务状态字典
  const jobStatusOptions = [
    { label: '正常', value: '0' },
    { label: '暂停', value: '1' }
  ]

  // 获取定时任务列表
  const getList = async (params?: JobQueryParams) => {
    setLoading(true)
    try {
      let requestParams: JobQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await listJob(requestParams)
      if (res.code === 200) {
        setJobList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取定时任务列表失败:', error)
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
    const newParams: JobQueryParams = {
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

  // 任务状态修改
  const handleStatusChange = async (checked: boolean, row: SysJob) => {
    const newStatus = checked ? '0' : '1'
    const text = checked ? '启用' : '停用'
    try {
      await Modal.confirm({
        title: '系统提示',
        content: `确认要"${text}" "${row.jobName}" 任务吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          const res = await changeJobStatus(row.jobId!, newStatus)
          if (res.code === 200) {
            message.success(`${text}成功`)
            getList()
          }
        },
        onCancel: () => {
          // 恢复原状态
          row.status = checked ? '1' : '0'
        }
      })
    } catch (error) {
      row.status = checked ? '1' : '0'
      console.error('修改任务状态失败:', error)
    }
  }

  // 立即执行一次
  const handleRun = async (row: SysJob) => {
    try {
      await Modal.confirm({
        title: '系统提示',
        content: `确认要立即执行一次 "${row.jobName}" 任务吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          const res = await runJob(row.jobId!, row.jobGroup!)
          if (res.code === 200) {
            message.success('执行成功')
          }
        }
      })
    } catch (error) {
      console.error('执行任务失败:', error)
    }
  }

  // 任务详细信息
  const handleView = async (row: SysJob) => {
    try {
      const res = await getJob(row.jobId!)
      if (res.code === 200) {
        form.setFieldsValue(res.data!)
        setViewJobData(res.data!)
        setOpenView(true)
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
    }
  }

  // 任务日志列表
  const handleJobLog = (row?: SysJob) => {
    const jobId = row?.jobId || 0
    navigate(`/monitor/job-log/index/${jobId}`)
  }

  // 新增
  const handleAdd = () => {
    form.resetFields()
    form.setFieldsValue({
      misfirePolicy: '1',
      concurrent: '1',
      status: '0'
    })
    setOpen(true)
    setTitle('添加任务')
    setCurrentJobId(undefined)
  }

  // 修改
  const handleUpdate = async (row?: SysJob) => {
    const jobId = row?.jobId || selectedRowKeys[0]
    try {
      const res = await getJob(jobId)
      if (res.code === 200) {
        form.setFieldsValue(res.data!)
        setOpen(true)
        setTitle('修改任务')
        setCurrentJobId(jobId)
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
    }
  }

  // 提交表单
  const submitForm = async () => {
    try {
      const values = await form.validateFields()
      if (currentJobId !== undefined) {
        const res = await updateJob({ ...values, jobId: currentJobId })
        if (res.code === 200) {
          message.success('修改成功')
          setOpen(false)
          getList()
        }
      } else {
        const res = await addJob(values)
        if (res.code === 200) {
          message.success('新增成功')
          setOpen(false)
          getList()
        }
      }
    } catch (error) {
      console.error('保存任务失败:', error)
    }
  }

  // 删除
  const handleDelete = async (row?: SysJob) => {
    const jobIds = row?.jobId || selectedRowKeys
    try {
      await Modal.confirm({
        title: '系统提示',
        content: `是否确认删除定时任务编号为 "${jobIds}" 的数据项？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          const res = await delJob(jobIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        }
      })
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  // 导出
  const handleExport = () => {
    message.info('导出功能开发中')
    // TODO: 实现导出功能
  }

  // 表格列定义
  const columns: ColumnsType<SysJob> = [
    {
      title: '任务编号',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 100,
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
      title: 'cron 执行表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (text: string, record: SysJob) => (
        <Switch
          checked={text === '0'}
          checkedChildren="正常"
          unCheckedChildren="暂停"
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Auth permission="monitor:job:edit">
            <Tooltip title="修改">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="monitor:job:remove">
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="monitor:job:changeStatus">
            <Tooltip title="执行一次">
              <Button
                type="link"
                icon={<CaretRightOutlined />}
                onClick={() => handleRun(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="monitor:job:query">
            <Tooltip title="任务详细">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              />
            </Tooltip>
          </Auth>
          <Auth permission="monitor:job:query">
            <Tooltip title="调度日志">
              <Button
                type="link"
                icon={<ClockCircleOutlined />}
                onClick={() => handleJobLog(record)}
              />
            </Tooltip>
          </Auth>
        </Space>
      )
    }
  ]

  const rules: Record<string, Rule[]> = {
    jobName: [{ required: true, message: '任务名称不能为空' }],
    invokeTarget: [{ required: true, message: '调用目标字符串不能为空' }],
    cronExpression: [{ required: true, message: 'cron 执行表达式不能为空' }]
  }

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
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="jobGroup" label="任务组名" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="请选择任务组名"
                    style={{ width: 200 }}
                    allowClear
                  >
                    {jobGroupOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="任务状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="请选择任务状态"
                    style={{ width: 200 }}
                    allowClear
                  >
                    {jobStatusOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
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
            <Auth permission="monitor:job:add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </Auth>
            <Auth permission="monitor:job:edit">
              <Button
                type="primary"
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => handleUpdate()}
              >
                修改
              </Button>
            </Auth>
            <Auth permission="monitor:job:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleDelete()}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="monitor:job:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
            <Auth permission="monitor:job:query">
              <Button icon={<ClockCircleOutlined />} onClick={() => handleJobLog()}>
                日志
              </Button>
            </Auth>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={jobList}
          rowKey="jobId"
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

      {/* 新增/修改对话框 */}
      <Modal
        title={title}
        open={open}
        onOk={submitForm}
        onCancel={() => setOpen(false)}
        width={820}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="jobName" label="任务名称" rules={rules.jobName}>
                <Input placeholder="请输入任务名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobGroup" label="任务分组" rules={[{ required: true, message: '任务分组不能为空' }]}>
                <Select placeholder="请选择">
                  {jobGroupOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="invokeTarget"
                label={
                  <span>
                    调用方法
                    <Tooltip title="Bean 调用示例：ryTask.ryParams('ry')&#10;Class 类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')&#10;参数说明：支持字符串，布尔类型，长整型，浮点型，整型">
                      <span style={{ marginLeft: 4 }}>?</span>
                    </Tooltip>
                  </span>
                }
                rules={rules.invokeTarget}
              >
                <Input placeholder="请输入调用目标字符串" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="cronExpression" label="cron 表达式" rules={rules.cronExpression}>
                <Input placeholder="请输入 cron 执行表达式" />
              </Form.Item>
            </Col>
            {currentJobId !== undefined && (
              <Col span={24}>
                <Form.Item name="status" label="状态">
                  <Radio.Group>
                    {jobStatusOptions.map(option => (
                      <Radio key={option.value} value={option.value}>{option.label}</Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item name="misfirePolicy" label="执行策略">
                <Radio.Group>
                  <Radio value="1">立即执行</Radio>
                  <Radio value="2">执行一次</Radio>
                  <Radio value="3">放弃执行</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="concurrent" label="是否并发">
                <Radio.Group>
                  <Radio value="0">允许</Radio>
                  <Radio value="1">禁止</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 任务详细对话框 */}
      <Modal
        title="任务详细"
        open={openView}
        onCancel={() => setOpenView(false)}
        footer={
          <Button onClick={() => setOpenView(false)}>关闭</Button>
        }
        width={700}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="任务编号：" name="jobId">
                <Text>{viewJobData?.jobId}</Text>
              </Form.Item>
              <Form.Item label="任务名称：" name="jobName">
                <Text>{viewJobData?.jobName}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="任务分组：" name="jobGroup">
                <Text>
                  {jobGroupOptions.find(item => item.value === viewJobData?.jobGroup)?.label || viewJobData?.jobGroup}
                </Text>
              </Form.Item>
              <Form.Item label="创建时间：" name="createTime">
                <Text>{viewJobData?.createTime}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="cron 表达式：" name="cronExpression">
                <Text>{viewJobData?.cronExpression}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="下次执行时间：" name="nextValidTime">
                <Text>{viewJobData?.nextValidTime ? new Date(viewJobData.nextValidTime).toLocaleString() : '-'}</Text>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="调用目标方法：" name="invokeTarget">
                <Text>{viewJobData?.invokeTarget}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="任务状态：" name="status">
                <Text>{viewJobData?.status === '0' ? '正常' : '暂停'}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否并发：" name="concurrent">
                <Text>{viewJobData?.concurrent === '0' ? '允许' : '禁止'}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="执行策略：" name="misfirePolicy">
                <Text>
                  {viewJobData?.misfirePolicy === '1' ? '立即执行' :
                   viewJobData?.misfirePolicy === '2' ? '执行一次' :
                   viewJobData?.misfirePolicy === '3' ? '放弃执行' : '默认策略'}
                </Text>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default JobManagement
