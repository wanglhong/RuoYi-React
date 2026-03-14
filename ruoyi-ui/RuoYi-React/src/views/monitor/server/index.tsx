import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, Row, Col, Spin, Typography, Switch, Select, Space } from 'antd'
import {
  AppstoreOutlined,
  TagsOutlined,
  MonitorOutlined,
  CoffeeOutlined,
  MessageOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { getServer } from '@/api/monitor/server'
import type { SysServer } from '@/types'
import '../index.scss'

const { Text } = Typography

const REFRESH_INTERVALS = [
  { label: '1 秒', value: 1000 },
  { label: '3 秒', value: 3000 },
  { label: '5 秒', value: 5000 },
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
  { label: '60 秒', value: 60000 }
]

const ServerMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [serverInfo, setServerInfo] = useState<SysServer | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  const getList = useCallback(async (showLoading: boolean = false) => {
    if (showLoading) {
      setLoading(true)
    }
    try {
      const response = await getServer()
      if (response.code === 200) {
        setServerInfo(response.data)
      }
    } catch (error) {
      console.error('获取服务监控数据失败:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      } else if (isInitialLoad.current) {
        setLoading(false)
        isInitialLoad.current = false
      }
    }
  }, [])

  useEffect(() => {
    getList(true)
  }, [getList])

  // 自动刷新逻辑
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        getList(false)
      }, refreshInterval)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, getList])

  const handleAutoRefreshChange = (checked: boolean) => {
    setAutoRefresh(checked)
  }

  const handleIntervalChange = (value: number) => {
    setRefreshInterval(value)
  }

  if (!serverInfo) {
    return (
      <div className="app-container">
        <Spin spinning={true} />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* 控制栏 */}
          <Col span={24}>
            <Card className="card-box" styles={{ body: { padding: '12px 16px' } }}>
              <Space size="large">
                <Space>
                  <Text>自动刷新</Text>
                  <Switch
                    checked={autoRefresh}
                    onChange={handleAutoRefreshChange}
                    checkedChildren="开"
                    unCheckedChildren="关"
                  />
                </Space>
                <Space>
                  <Text>刷新间隔</Text>
                  <Select
                    value={refreshInterval}
                    onChange={handleIntervalChange}
                    disabled={!autoRefresh}
                    style={{ width: 100 }}
                    options={REFRESH_INTERVALS}
                  />
                </Space>
                {autoRefresh && (
                  <Space>
                    <SyncOutlined spin />
                    <Text type="secondary">正在刷新</Text>
                  </Space>
                )}
              </Space>
            </Card>
          </Col>

          {/* CPU */}
          <Col span={12}>
            <Card
              className="card-box"
              title={
                <>
                  <AppstoreOutlined style={{ marginRight: 8 }} />
                  <span>CPU</span>
                </>
              }
            >
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>属性</th>
                      <th style={{ width: '50%' }}>值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>核心数</td>
                      <td>{serverInfo.cpu?.cpuNum}</td>
                    </tr>
                    <tr>
                      <td>用户使用率</td>
                      <td>{serverInfo.cpu?.used}%</td>
                    </tr>
                    <tr>
                      <td>系统使用率</td>
                      <td>{serverInfo.cpu?.sys}%</td>
                    </tr>
                    <tr>
                      <td>当前空闲率</td>
                      <td>{serverInfo.cpu?.free}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          {/* 内存 */}
          <Col span={12}>
            <Card
              className="card-box"
              title={
                <>
                  <TagsOutlined style={{ marginRight: 8 }} />
                  <span>内存</span>
                </>
              }
            >
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>属性</th>
                      <th style={{ width: '37.5%' }}>内存</th>
                      <th style={{ width: '37.5%' }}>JVM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>总内存</td>
                      <td>{serverInfo.mem?.total}G</td>
                      <td>{serverInfo.jvm?.total}M</td>
                    </tr>
                    <tr>
                      <td>已用内存</td>
                      <td>{serverInfo.mem?.used}G</td>
                      <td>{serverInfo.jvm?.used}M</td>
                    </tr>
                    <tr>
                      <td>剩余内存</td>
                      <td>{serverInfo.mem?.free}G</td>
                      <td>{serverInfo.jvm?.free}M</td>
                    </tr>
                    <tr>
                      <td>使用率</td>
                      <td>
                        <Text type={serverInfo.mem && serverInfo.mem.usage > 80 ? 'danger' : undefined}>
                          {serverInfo.mem?.usage}%
                        </Text>
                      </td>
                      <td>
                        <Text type={serverInfo.jvm && serverInfo.jvm.usage > 80 ? 'danger' : undefined}>
                          {serverInfo.jvm?.usage}%
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          {/* 服务器信息 */}
          <Col span={24}>
            <Card
              className="card-box"
              title={
                <>
                  <MonitorOutlined style={{ marginRight: 8 }} />
                  <span>服务器信息</span>
                </>
              }
            >
              <div className="table-container">
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '25%' }}>服务器名称</td>
                      <td style={{ width: '25%' }}>{serverInfo.sys?.computerName}</td>
                      <td style={{ width: '25%' }}>操作系统</td>
                      <td style={{ width: '25%' }}>{serverInfo.sys?.osName}</td>
                    </tr>
                    <tr>
                      <td>服务器 IP</td>
                      <td>{serverInfo.sys?.computerIp}</td>
                      <td>系统架构</td>
                      <td>{serverInfo.sys?.osArch}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          {/* Java 虚拟机信息 */}
          <Col span={24}>
            <Card
              className="card-box"
              title={
                <>
                  <CoffeeOutlined style={{ marginRight: 8 }} />
                  <span>Java 虚拟机信息</span>
                </>
              }
            >
              <div className="table-container">
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '15%' }}>Java 名称</td>
                      <td style={{ width: '35%' }}>{serverInfo.jvm?.name}</td>
                      <td style={{ width: '15%' }}>Java 版本</td>
                      <td style={{ width: '35%' }}>{serverInfo.jvm?.version}</td>
                    </tr>
                    <tr>
                      <td>启动时间</td>
                      <td>{serverInfo.jvm?.startTime}</td>
                      <td>运行时长</td>
                      <td>{serverInfo.jvm?.runTime}</td>
                    </tr>
                    <tr>
                      <td colSpan={1}>安装路径</td>
                      <td colSpan={3}>{serverInfo.jvm?.home}</td>
                    </tr>
                    <tr>
                      <td colSpan={1}>项目路径</td>
                      <td colSpan={3}>{serverInfo.sys?.userDir}</td>
                    </tr>
                    <tr>
                      <td colSpan={1}>运行参数</td>
                      <td colSpan={3}>{serverInfo.jvm?.inputArgs}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          {/* 磁盘状态 */}
          <Col span={24}>
            <Card
              className="card-box"
              title={
                <>
                  <MessageOutlined style={{ marginRight: 8 }} />
                  <span>磁盘状态</span>
                </>
              }
            >
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>盘符路径</th>
                      <th>文件系统</th>
                      <th>盘符类型</th>
                      <th>总大小</th>
                      <th>可用大小</th>
                      <th>已用大小</th>
                      <th>已用百分比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverInfo.sysFiles?.map((file, index) => (
                      <tr key={index}>
                        <td>{file.dirName}</td>
                        <td>{file.sysTypeName}</td>
                        <td>{file.typeName}</td>
                        <td>{file.total}</td>
                        <td>{file.free}</td>
                        <td>{file.used}</td>
                        <td>
                          <Text type={file.usage > 80 ? 'danger' : undefined}>
                            {file.usage}%
                          </Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default ServerMonitor
