import React, { useEffect, useState, useRef } from 'react'
import { Card, Col, Row, Table, Button, Space, Form, Input, Spin, message } from 'antd'
import {
  FolderOutlined,
  KeyOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  listCacheName,
  listCacheKey,
  getCacheValue,
  clearCacheName,
  clearCacheKey,
  clearCacheAll
} from '@/api/monitor/cache'
import type { SysCache } from '@/types'
import '../index.scss'

interface CacheNameItem {
  cacheName: string
  remark?: string
}

interface CacheForm {
  cacheName?: string
  cacheKey?: string
  cacheValue?: string
}

const CacheList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [cacheNames, setCacheNames] = useState<CacheNameItem[]>([])
  const [cacheKeys, setCacheKeys] = useState<string[]>([])
  const [cacheForm, setCacheForm] = useState<CacheForm>({})
  const [nowCacheName, setNowCacheName] = useState<string>('')
  const [selectedCacheNameRow, setSelectedCacheNameRow] = useState<CacheNameItem | null>(null)
  const [selectedCacheKeyRow, setSelectedCacheKeyRow] = useState<string | null>(null)

  const tableHeight = window.innerHeight - 200

  // 查询缓存名称列表
  const getCacheNames = async () => {
    setLoading(true)
    try {
      const response = await listCacheName()
      if (response.code === 200) {
        setCacheNames(response.data || [])
      }
    } catch (error) {
      console.error('查询缓存名称列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 刷新缓存名称列表
  const handleRefreshCacheNames = async () => {
    await getCacheNames()
    message.success('刷新缓存列表成功')
  }

  // 清理指定名称缓存
  const handleClearCacheName = async (row: CacheNameItem) => {
    try {
      const response = await clearCacheName(row.cacheName)
      if (response.code === 200) {
        message.success(`清理缓存名称 [${row.cacheName}] 成功`)
        getCacheKeys(row)
      }
    } catch (error) {
      console.error('清理缓存名称失败:', error)
    }
  }

  // 查询缓存键名列表
  const getCacheKeys = async (row?: CacheNameItem) => {
    const cacheName = row !== undefined ? row.cacheName : nowCacheName
    if (cacheName === '') {
      return
    }

    setSubLoading(true)
    try {
      const response = await listCacheKey(cacheName)
      if (response.code === 200) {
        setCacheKeys(response.data || [])
        setNowCacheName(cacheName)
      }
    } catch (error) {
      console.error('查询缓存键名列表失败:', error)
    } finally {
      setSubLoading(false)
    }
  }

  // 刷新缓存键名列表
  const handleRefreshCacheKeys = async () => {
    await getCacheKeys()
    message.success('刷新键名列表成功')
  }

  // 清理指定键名缓存
  const handleClearCacheKey = async (cacheKey: string) => {
    try {
      const response = await clearCacheKey(cacheKey)
      if (response.code === 200) {
        message.success(`清理缓存键名 [${cacheKey}] 成功`)
        getCacheKeys()
      }
    } catch (error) {
      console.error('清理缓存键名失败:', error)
    }
  }

  // 列表前缀去除
  const nameFormatter = (row: CacheNameItem): string => {
    if (!row?.cacheName) return ''
    return row.cacheName.replace(':', '')
  }

  // 键名前缀去除
  const keyFormatter = (cacheKey: string): string => {
    return cacheKey.replace(nowCacheName, '')
  }

  // 查询缓存内容详细
  const handleCacheValue = async (cacheKey: string) => {
    try {
      const response = await getCacheValue(nowCacheName, cacheKey)
      if (response.code === 200) {
        setCacheForm(response.data || {})
      }
    } catch (error) {
      console.error('查询缓存内容详细失败:', error)
    }
  }

  // 清理全部缓存
  const handleClearCacheAll = async () => {
    try {
      const response = await clearCacheAll()
      if (response.code === 200) {
        message.success('清理全部缓存成功')
        getCacheNames()
        setCacheKeys([])
        setCacheForm({})
      }
    } catch (error) {
      console.error('清理全部缓存失败:', error)
    }
  }

  // 缓存名称表格列
  const cacheNameColumns: ColumnsType<CacheNameItem> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '缓存名称',
      dataIndex: 'cacheName',
      key: 'cacheName',
      align: 'center',
      ellipsis: true,
      render: (text, record) => nameFormatter(record)
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleClearCacheName(record)}
        />
      )
    }
  ]

  // 缓存键名表格列
  const cacheKeyColumns: ColumnsType<string> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '缓存键名',
      key: 'cacheKey',
      align: 'center',
      ellipsis: true,
      render: (text, record, index) => keyFormatter(cacheKeys[index])
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleClearCacheKey(cacheKeys[index])}
        />
      )
    }
  ]

  useEffect(() => {
    getCacheNames()
  }, [])

  return (
    <div className="app-container">
      <Row gutter={10}>
        <Col span={8}>
          <Card
            style={{ height: `calc(100vh - 125px)` }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <FolderOutlined style={{ marginRight: 8 }} />
                  <span>缓存列表</span>
                </span>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshCacheNames}
                />
              </div>
            }
          >
            <Spin spinning={loading}>
              <Table
                columns={cacheNameColumns}
                dataSource={cacheNames}
                rowKey="cacheName"
                size="small"
                scroll={{ y: tableHeight }}
                pagination={false}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedCacheNameRow(record)
                    setSelectedCacheKeyRow(null)
                    setCacheForm({})
                    getCacheKeys(record)
                  }
                })}
                rowClassName={(record) =>
                  selectedCacheNameRow?.cacheName === record.cacheName ? 'ant-table-row-selected' : ''
                }
              />
            </Spin>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{ height: `calc(100vh - 125px)` }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <KeyOutlined style={{ marginRight: 8 }} />
                  <span>键名列表</span>
                </span>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshCacheKeys}
                />
              </div>
            }
          >
            <Spin spinning={subLoading}>
              <Table
                columns={cacheKeyColumns}
                dataSource={cacheKeys.map((key, index) => ({ key, index }))}
                rowKey="key"
                size="small"
                scroll={{ y: tableHeight }}
                pagination={false}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedCacheKeyRow(record.key)
                    handleCacheValue(record.key)
                  }
                })}
                rowClassName={(record) =>
                  selectedCacheKeyRow === record.key ? 'ant-table-row-selected' : ''
                }
              />
            </Spin>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{ height: `calc(100vh - 125px)` }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  <span>缓存内容</span>
                </span>
                <Button type="link" onClick={handleClearCacheAll}>
                  清理全部
                </Button>
              </div>
            }
          >
            <Form>
              <Row gutter={32}>
                <Col offset={1} span={22}>
                  <Form.Item label="缓存名称:" style={{ marginBottom: 16 }}>
                    <Input value={cacheForm.cacheName} readOnly />
                  </Form.Item>
                </Col>
                <Col offset={1} span={22}>
                  <Form.Item label="缓存键名:" style={{ marginBottom: 16 }}>
                    <Input value={cacheForm.cacheKey} readOnly />
                  </Form.Item>
                </Col>
                <Col offset={1} span={22}>
                  <Form.Item label="缓存内容:" style={{ marginBottom: 16 }}>
                    <Input.TextArea value={cacheForm.cacheValue} rows={8} readOnly />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CacheList
