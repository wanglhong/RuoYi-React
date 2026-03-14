import React, { useEffect, useState, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, Modal, message, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { list, forceLogout } from '@/api/monitor/online'
import type { OnlineQueryParams, SysUserOnline } from '@/types'
import Auth from '@/components/Auth'
import '../index.scss'

const OnlineManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [onlineList, setOnlineList] = useState<SysUserOnline[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [queryParamsForm] = Form.useForm()

  // 用于跟踪搜索条件
  const searchParamsRef = useRef<OnlineQueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 获取在线用户列表
  const getList = async (params?: OnlineQueryParams) => {
    setLoading(true)
    try {
      let requestParams: OnlineQueryParams
      if (params) {
        requestParams = { ...params }
        searchParamsRef.current = { ...params }
      } else {
        requestParams = { ...searchParamsRef.current }
      }

      const res = await list(requestParams)
      if (res.code === 200) {
        setOnlineList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取在线用户列表失败:', error)
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
    const newParams: OnlineQueryParams = {
      pageNum: 1,
      pageSize: searchParamsRef.current.pageSize,
      ipaddr: values.ipaddr,
      userName: values.userName
    }
    setPageNum(1)
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
    setPageNum(1)
    setPageSize(10)
    getList(newParams)
  }

  // 强退
  const handleForceLogout = async (row: SysUserOnline) => {
    try {
      await Modal.confirm({
        title: '系统提示',
        content: `是否确认强退名称为 "${row.userName}" 的用户？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          const res = await forceLogout(row.tokenId!)
          if (res.code === 200) {
            message.success('删除成功')
            getList()
          }
        }
      })
    } catch (error) {
      console.error('强退用户失败:', error)
    }
  }

  // 表格列定义
  const columns: ColumnsType<SysUserOnline> = [
    {
      title: '序号',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => (pageNum - 1) * pageSize + index + 1
    },
    {
      title: '会话编号',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 200,
      align: 'center',
      ellipsis: true
    },
    {
      title: '登录名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      align: 'center',
      ellipsis: true
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    {
      title: '主机',
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
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      align: 'center',
      render: (text: number) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Auth permission="monitor:online:forceLogout">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleForceLogout(record)}
          >
            强退
          </Button>
        </Auth>
      )
    }
  ]

  return (
    <div className="app-container">
      {/* 搜索区域 */}
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
        <Table
          columns={columns}
          dataSource={onlineList}
          rowKey="tokenId"
          loading={loading}
          size="small"
          pagination={{
            current: pageNum,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPageNum(page)
              setPageSize(pageSize)
              const newParams = {
                ...searchParamsRef.current,
                pageNum: page,
                pageSize
              }
              searchParamsRef.current = newParams
              getList(newParams)
            }
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  )
}

export default OnlineManagement
