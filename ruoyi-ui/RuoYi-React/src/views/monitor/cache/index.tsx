import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, Row, Col, Spin, Switch, Select, Space, Typography } from 'antd'
import { MonitorOutlined, PieChartOutlined, DashboardOutlined, SyncOutlined } from '@ant-design/icons'
import { getCache } from '@/api/monitor/cache'
import type { SysCache } from '@/types'
import * as echarts from 'echarts'
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

const CacheMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [cacheInfo, setCacheInfo] = useState<SysCache | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const commandstatsRef = useRef<HTMLDivElement>(null)
  const usedmemoryRef = useRef<HTMLDivElement>(null)
  const commandstatsChartRef = useRef<echarts.ECharts | null>(null)
  const usedmemoryChartRef = useRef<echarts.ECharts | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  const getList = useCallback(async (showLoading: boolean = false) => {
    if (showLoading) {
      setLoading(true)
    }
    try {
      const response = await getCache()
      if (response.code === 200) {
        setCacheInfo(response.data!)
      }
    } catch (error) {
      console.error('获取缓存监控数据失败:', error)
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

  // 初始化命令统计图表
  useEffect(() => {
    if (cacheInfo && commandstatsRef.current && cacheInfo.commandStats) {
      if (!commandstatsChartRef.current) {
        const chart = echarts.init(commandstatsRef.current, 'macarons')
        commandstatsChartRef.current = chart

        chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          series: [
            {
              name: '命令',
              type: 'pie',
              roseType: 'radius',
              radius: [15, 95],
              center: ['50%', '38%'],
              data: cacheInfo.commandStats,
              animationEasing: 'cubicInOut',
              animationDuration: 1000
            }
          ]
        })
      } else {
        // 更新数据时禁用动画，避免闪烁
        commandstatsChartRef.current.setOption({
          series: [{
            data: cacheInfo.commandStats,
            animation: false
          }]
        }, { notMerge: false })
      }
    }
  }, [cacheInfo?.commandStats])

  // 初始化内存仪表盘
  useEffect(() => {
    if (cacheInfo && usedmemoryRef.current && cacheInfo.info?.used_memory_human) {
      if (!usedmemoryChartRef.current) {
        const chart = echarts.init(usedmemoryRef.current, 'macarons')
        usedmemoryChartRef.current = chart

        const usedMemoryStr = cacheInfo.info.used_memory_human
        const maxMemoryStr = cacheInfo.info.maxmemory_human || '0B'

        const parseMemory = (memStr: string): number => {
          const match = memStr.match(/([\d.]+)([KMGT]?B)/i)
          if (!match) return 0
          const value = parseFloat(match[1])
          const unit = match[2].toUpperCase()
          const multipliers: Record<string, number> = {
            'KB': 1 / 1024,
            'MB': 1,
            'GB': 1024,
            'TB': 1024 * 1024
          }
          return value * (multipliers[unit] || 1)
        }

        const usedMemory = parseMemory(usedMemoryStr)
        const maxMemory = parseMemory(maxMemoryStr) || Math.max(usedMemory * 1.5, 1000)

        chart.setOption({
          tooltip: {
            formatter: '{b} <br/>{a} : ' + usedMemoryStr
          },
          series: [
            {
              name: '峰值',
              type: 'gauge',
              min: 0,
              max: Math.round(maxMemory),
              detail: {
                formatter: usedMemoryStr
              },
              data: [
                {
                  value: usedMemory,
                  name: '内存消耗'
                }
              ]
            }
          ]
        })
      } else {
        // 更新数据时禁用动画
        const usedMemoryStr = cacheInfo.info.used_memory_human
        usedmemoryChartRef.current.setOption({
          tooltip: {
            formatter: '{b} <br/>{a} : ' + usedMemoryStr
          },
          series: [{
            data: [{ value: cacheInfo.info.used_memory_human, name: '内存消耗' }],
            animation: false
          }]
        }, { notMerge: false })
      }
    }
  }, [cacheInfo?.info?.used_memory_human])

  // 窗口大小变化时重新渲染图表
  useEffect(() => {
    const handleResize = () => {
      commandstatsChartRef.current?.resize()
      usedmemoryChartRef.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (commandstatsChartRef.current) {
        commandstatsChartRef.current.dispose()
      }
      if (usedmemoryChartRef.current) {
        usedmemoryChartRef.current.dispose()
      }
    }
  }, [])

  const handleAutoRefreshChange = (checked: boolean) => {
    setAutoRefresh(checked)
  }

  const handleIntervalChange = (value: number) => {
    setRefreshInterval(value)
  }

  if (!cacheInfo?.info) {
    return (
      <div className="app-container">
        <Spin spinning={true} />
      </div>
    )
  }

  const info = cacheInfo.info

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

          <Col span={24}>
            <Card
              className="card-box"
              title={
                <>
                  <MonitorOutlined style={{ marginRight: 8 }} />
                  <span>基本信息</span>
                </>
              }
            >
              <div className="table-container">
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '12.5%' }}>Redis 版本</td>
                      <td style={{ width: '12.5%' }}>{info.redis_version}</td>
                      <td style={{ width: '12.5%' }}>运行模式</td>
                      <td style={{ width: '12.5%' }}>{info.redis_mode === 'standalone' ? '单机' : '集群'}</td>
                      <td style={{ width: '12.5%' }}>端口</td>
                      <td style={{ width: '12.5%' }}>{info.tcp_port}</td>
                      <td style={{ width: '12.5%' }}>客户端数</td>
                      <td style={{ width: '12.5%' }}>{info.connected_clients}</td>
                    </tr>
                    <tr>
                      <td>运行时间 (天)</td>
                      <td>{info.uptime_in_days}</td>
                      <td>使用内存</td>
                      <td>{info.used_memory_human}</td>
                      <td>使用 CPU</td>
                      <td>{parseFloat(info.used_cpu_user_children || '0').toFixed(2)}</td>
                      <td>内存配置</td>
                      <td>{info.maxmemory_human}</td>
                    </tr>
                    <tr>
                      <td>AOF 是否开启</td>
                      <td>{info.aof_enabled === '0' ? '否' : '是'}</td>
                      <td>RDB 是否成功</td>
                      <td>{info.rdb_last_bgsave_status}</td>
                      <td>Key 数量</td>
                      <td>{cacheInfo.dbSize}</td>
                      <td>网络入口/出口</td>
                      <td>{`${info.instantaneous_input_kbps}kps/${info.instantaneous_output_kbps}kps`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              className="card-box"
              title={
                <>
                  <PieChartOutlined style={{ marginRight: 8 }} />
                  <span>命令统计</span>
                </>
              }
            >
              <div ref={commandstatsRef} style={{ height: 420 }} />
            </Card>
          </Col>

          <Col span={12}>
            <Card
              className="card-box"
              title={
                <>
                  <DashboardOutlined style={{ marginRight: 8 }} />
                  <span>内存信息</span>
                </>
              }
            >
              <div ref={usedmemoryRef} style={{ height: 420 }} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default CacheMonitor
