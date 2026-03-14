import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, Modal, message, Tooltip, Row, Col, DatePicker } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined, UnlockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SysLogininfor, LogininforQueryParams } from '@/types/system'
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/monitor/logininfor'
import Auth from '@/components/Auth'
import '../index.scss'

const RangePicker = DatePicker.RangePicker

const LogininforManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [logininforList, setLogininforList] = useState<SysLogininfor[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪是否手动触发请求
  const manualRequestRef = useRef(false)
  // 保存当前搜索条件的引用
  const searchParamsRef = useRef<LogininforQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 状态字典
  const statusOptions = [
    { label: '成功', value: 0 },
    { label: '失败', value: 1 }
  ]

  // 获取登录日志列表
  const getList = async (params?: LogininforQueryParams) => {
    setLoading(true)
    try {
      let requestParams: LogininforQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await list(requestParams)
      if (res.code === 200) {
        setLogininforList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取登录日志列表失败:', error)
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
    
    const newParams: LogininforQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      ipaddr: values.ipaddr,
      userName: values.userName,
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

  // 删除登录日志
  const handleDelete = (infoId?: number) => {
    const infoIds = infoId || selectedRowKeys
    Modal.confirm({
      title: '系统提示',
      content: '是否确认删除访问编号为"' + infoIds + '"的数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delLogininfor(infoIds)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        } catch (error) {
          console.error('删除登录日志失败:', error)
        }
      }
    })
  }

  // 清空登录日志
  const handleClean = async () => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认清空所有登录日志数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await cleanLogininfor()
          if (res.code === 200) {
            message.success('清空成功')
            getList()
          }
        } catch (error) {
          console.error('清空登录日志失败:', error)
        }
      }
    })
  }

  // 解锁用户
  const handleUnlock = async () => {
    const selectedRecords = logininforList.filter(item => selectedRowKeys.includes(item.infoId!))
    const userNames = selectedRecords.map(item => item.userName).filter(Boolean) as string[]
    
    if (userNames.length === 0) {
      message.warning('请选择要解锁的用户')
      return
    }

    Modal.confirm({
      title: '系统提示',
      content: '是否确认解锁用户"' + userNames.join(', ') + '"数据项？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 批量解锁
          for (const userName of userNames) {
            await unlockLogininfor(userName)
          }
          message.success('用户' + userNames.join(', ') + '解锁成功')
          getList()
        } catch (error) {
          console.error('解锁用户失败:', error)
        }
      }
    })
  }

  // 表格列定义
  const columns: ColumnsType<SysLogininfor> = [
    {
      title: '访问编号',
      dataIndex: 'infoId',
      key: 'infoId',
      width: 100,
      align: 'center'
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      align: 'center',
      ellipsis: true,
      sorter: true
    },
    {
      title: '地址',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      width: 130,
      align: 'center',
      ellipsis: true
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      align: 'center',
      ellipsis: true
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      align: 'center',
      ellipsis: true
    },
    {
      title: '登录状态',
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
      title: '描述',
      dataIndex: 'msg',
      key: 'msg',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '访问时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 160,
      align: 'center',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-',
      sorter: true
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
                <Form.Item name="ipaddr" label="登录地址" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入登录地址"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="userName" label="用户名称" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="请输入用户名称"
                    style={{ width: 200 }}
                    allowClear
                    onPressEnter={handleQuery}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="登录状态"
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
                <Form.Item label="登录时间" name="dateRange" style={{ marginBottom: 0 }}>
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
            <Auth permission="monitor:logininfor:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleDelete()}
              >
                删除
              </Button>
            </Auth>
            <Auth permission="monitor:logininfor:remove">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClean}
              >
                清空
              </Button>
            </Auth>
            <Auth permission="monitor:logininfor:unlock">
              <Button
                type="primary"
                icon={<UnlockOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={handleUnlock}
              >
                解锁
              </Button>
            </Auth>
            <Auth permission="monitor:logininfor:export">
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Auth>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={logininforList}
          rowKey="infoId"
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
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  )
}

export default LogininforManagement
