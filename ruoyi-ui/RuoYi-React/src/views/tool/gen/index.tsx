import React, { useState, useEffect, useRef } from 'react'
import { Table, Card, Button, Space, Form, Input, DatePicker, Modal, message, Tooltip, Tabs, type TabsProps } from 'antd'
import { DownloadOutlined, PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { GenTable, GenQueryParams } from '@/types/api/tool/gen'
import { listTable, previewTable, delTable, genCode, synchDb } from '@/api/tool/gen'
import Auth from '@/components/Auth'
import dayjs, { Dayjs } from 'dayjs'
import './index.scss'

const { RangePicker } = DatePicker

const GenManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [tableList, setTableList] = useState<GenTable[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [form] = Form.useForm()
  const [queryParams, setQueryParams] = useState<GenQueryParams>({
    pageNum: 1,
    pageSize: 10,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  })
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [previewActiveName, setPreviewActiveName] = useState('domain.java')
  const [sortInfo, setSortInfo] = useState<{ field: string; order: string }>({ field: 'createTime', order: 'descend' })

  // 用于防止重复调用
  const hasRequestedRef = useRef(false)

  // 获取列表
  const getList = async () => {
    if (hasRequestedRef.current) return
    hasRequestedRef.current = true
    setLoading(true)
    try {
      const params: GenQueryParams = { ...queryParams }
      if (dateRange) {
        params.params = {
          beginTime: dateRange[0].format('YYYY-MM-DD'),
          endTime: dateRange[1].format('YYYY-MM-DD')
        }
      }
      const res = await listTable(params)
      if (res.code === 200) {
        setTableList(res.rows || [])
        setTotal(res.total || 0)
      }
    } catch (error) {
      console.error('获取表列表失败:', error)
      message.error('获取表列表失败')
    } finally {
      setLoading(false)
      hasRequestedRef.current = false
    }
  }

  useEffect(() => {
    getList()
  }, [queryParams])

  // 搜索按钮操作
  const handleQuery = () => {
    const values = form.getFieldsValue()
    setQueryParams({
      ...queryParams,
      pageNum: 1,
      tableName: values.tableName,
      tableComment: values.tableComment
    })
  }

  // 重置按钮操作
  const resetQuery = () => {
    form.resetFields()
    setDateRange(null)
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      orderByColumn: 'createTime',
      isAsc: 'desc'
    })
    setSortInfo({ field: 'createTime', order: 'descend' })
  }

  // 多选框选中数据
  const handleSelectionChange = (selectedRows: GenTable[]) => {
    setSelectedRowKeys(selectedRows.map(item => item.tableId as React.Key))
  }

  // 生成代码操作
  const handleGenTable = (row?: GenTable) => {
    const selectedTables = row ? [row] : tableList.filter(item => selectedRowKeys.includes(item.tableId as React.Key))
    if (selectedTables.length === 0) {
      message.error('请选择要生成的数据')
      return
    }

    const tbNames = selectedTables.map(item => item.tableName).filter(Boolean) as string[]
    
    if (row && row.genType === '1') {
      genCode(row.tableName!).then(() => {
        message.success('成功生成到自定义路径：' + row.genPath)
      })
    } else {
      const zipName = tbNames.length === 1 ? tbNames[0] + '.zip' : 'ruoyi.zip'
      // 使用下载工具
      const baseUrl = import.meta.env.VITE_APP_BASE_API
      window.open(`${baseUrl}/tool/gen/batchGenCode?tables=${tbNames.join(',')}`, '_blank')
    }
  }

  // 同步数据库操作
  const handleSynchDb = (row: GenTable) => {
    Modal.confirm({
      title: '确认同步',
      content: `确认要强制同步"${row.tableName}"表结构吗？`,
      onOk: async () => {
        try {
          await synchDb(row.tableName!)
          message.success('同步成功')
          getList()
        } catch (error) {
          console.error('同步失败:', error)
        }
      }
    })
  }

  // 预览按钮
  const handlePreview = async (row: GenTable) => {
    try {
      const res = await previewTable(row.tableId!)
      if (res.code === 200) {
        setPreviewData(res.data || {})
        setPreviewOpen(true)
        setPreviewActiveName('domain.java')
      }
    } catch (error) {
      console.error('预览失败:', error)
      message.error('预览失败')
    }
  }

  // 复制代码
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success('复制成功')
    })
  }

  // 修改按钮操作
  const handleEditTable = (row?: GenTable) => {
    const tableId = row?.tableId || (selectedRowKeys[0] as number)
    const tableName = row?.tableName || tableList.find(item => item.tableId === tableId)?.tableName
    // 打开新页面
    const params = `pageNum=${queryParams.pageNum}`
    window.open(`/tool/gen-edit/index/${tableId}?${params}`, '_blank')
  }

  // 删除按钮操作
  const handleDelete = (row?: GenTable) => {
    const tableIds = row ? [row.tableId] : selectedRowKeys
    Modal.confirm({
      title: '确认删除',
      content: `是否确认删除表编号为"${tableIds.join(',')}"的数据项？`,
      onOk: async () => {
        try {
          await delTable(tableIds as number[])
          message.success('删除成功')
          getList()
        } catch (error) {
          console.error('删除失败:', error)
        }
      }
    })
  }

  // 表格排序
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const field = sorter.field as string
    const order = sorter.order === 'descend' ? 'desc' : 'asc'
    setSortInfo({ field, order })
    setQueryParams({
      ...queryParams,
      orderByColumn: field,
      isAsc: order
    })
  }

  const columns: ColumnsType<GenTable> = [
    {
      type: 'selection',
      align: 'center',
      width: 55
    },
    {
      title: '序号',
      width: 50,
      align: 'center',
      render: (_, __, index) => (queryParams.pageNum! - 1) * queryParams.pageSize! + index + 1
    },
    {
      title: '表名称',
      dataIndex: 'tableName',
      align: 'center',
      ellipsis: true
    },
    {
      title: '表描述',
      dataIndex: 'tableComment',
      align: 'center',
      ellipsis: true
    },
    {
      title: '实体',
      dataIndex: 'className',
      align: 'center',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 160,
      sorter: true,
      defaultSortOrder: 'descend'
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      align: 'center',
      width: 160,
      sorter: true
    },
    {
      title: '操作',
      align: 'center',
      width: 330,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(record)} size="small">
              <Auth permission="tool:gen:preview">预览</Auth>
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditTable(record)} size="small">
              <Auth permission="tool:gen:edit">编辑</Auth>
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} size="small">
              <Auth permission="tool:gen:remove">删除</Auth>
            </Button>
          </Tooltip>
          <Tooltip title="同步">
            <Button type="link" icon={<SyncOutlined />} onClick={() => handleSynchDb(record)} size="small">
              <Auth permission="tool:gen:edit">同步</Auth>
            </Button>
          </Tooltip>
          <Tooltip title="生成代码">
            <Button type="link" icon={<DownloadOutlined />} onClick={() => handleGenTable(record)} size="small">
              <Auth permission="tool:gen:code">生成</Auth>
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]

  // 预览弹窗的 Tab 配置
  const previewTabsItems: TabsProps['items'] = Object.keys(previewData).map(key => {
    const label = key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))
    return {
      key: label,
      label,
      children: (
        <div style={{ position: 'relative' }}>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => copyCode(previewData[key])}
            style={{ position: 'absolute', right: 0, top: 0 }}
          >
            复制
          </Button>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f5f5f5', padding: 16 }}>{previewData[key]}</pre>
        </div>
      )
    }
  })

  return (
    <Card className="app-container">
      <Form form={form} layout="inline" style={{ display: showSearch ? 'flex' : 'none' }}>
        <Form.Item label="表名称" name="tableName">
          <Input placeholder="请输入表名称" style={{ width: 200 }} onPressEnter={handleQuery} allowClear />
        </Form.Item>
        <Form.Item label="表描述" name="tableComment">
          <Input placeholder="请输入表描述" style={{ width: 200 }} onPressEnter={handleQuery} allowClear />
        </Form.Item>
        <Form.Item label="创建时间">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetQuery}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 10 }}>
        <Space>
          <Auth permission="tool:gen:code">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => handleGenTable()}
            >
              生成
            </Button>
          </Auth>
          <Auth role="admin">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('创建表功能待实现')}>
              创建
            </Button>
          </Auth>
          <Auth permission="tool:gen:import">
            <Button type="primary" icon={<UploadOutlined />} onClick={() => message.info('导入表功能待实现')}>
              导入
            </Button>
          </Auth>
          <Auth permission="tool:gen:edit">
            <Button type="primary" icon={<EditOutlined />} disabled={selectedRowKeys.length !== 1} onClick={handleEditTable}>
              修改
            </Button>
          </Auth>
          <Auth permission="tool:gen:remove">
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={handleDelete}>
              删除
            </Button>
          </Auth>
        </Space>
      </div>

      <Table
        rowKey="tableId"
        loading={loading}
        dataSource={tableList}
        columns={columns}
        rowSelection={{ selectedRowKeys, onChange: handleSelectionChange }}
        pagination={{
          current: queryParams.pageNum,
          pageSize: queryParams.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => setQueryParams({ ...queryParams, pageNum: page, pageSize })
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="代码预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width="80%"
        footer={null}
      >
        <Tabs activeKey={previewActiveName} onChange={(key) => setPreviewActiveName(key)} items={previewTabsItems} />
      </Modal>
    </Card>
  )
}

export default GenManagement
