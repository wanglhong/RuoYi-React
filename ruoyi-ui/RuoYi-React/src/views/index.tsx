import React from 'react'
import { Card, Row, Col, Statistic, Button, Space, Divider, Alert } from 'antd'
import { UserOutlined, TeamOutlined, FileTextOutlined, MessageOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import Auth from '@/components/Auth'
import { usePermission } from '@/hooks'
import './index.scss'

const Index: React.FC = () => {
  const { hasPermission, hasRole, permissions, roles } = usePermission()

  return (
    <div className="home-page">
      {/* 统计卡片 */}
      <Row gutter={16} className="stat-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="用户数"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色数"
              value={42}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="菜单数"
              value={156}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="消息数"
              value={86}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 权限信息 */}
      <Card className="permission-info-card" title="权限信息">
        <Alert
          message="当前用户权限"
          description={
            <div>
              <p><strong>角色：</strong>{roles.join(', ') || '无'}</p>
              <p><strong>权限：</strong>{permissions.slice(0, 5).join(', ')}{permissions.length > 5 ? '...' : ''}</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>

      {/* 权限控制示例 */}
      <Card className="permission-demo-card" title="权限控制示例">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <h4>按钮级权限控制：</h4>
            <Space>
              <Auth permission="system:user:add">
                <Button type="primary" icon={<PlusOutlined />}>
                  新增用户
                </Button>
              </Auth>

              <Auth permission="system:user:edit">
                <Button type="default" icon={<EditOutlined />}>
                  编辑用户
                </Button>
              </Auth>

              <Auth permission="system:user:remove">
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  删除用户
                </Button>
              </Auth>

              {!hasPermission('system:user:add') && 
               !hasPermission('system:user:edit') && 
               !hasPermission('system:user:remove') && (
                <Alert message="您没有用户管理相关权限" type="warning" />
              )}
            </Space>
          </div>

          <Divider />

          <div>
            <h4>角色验证：</h4>
            <Space>
              <Auth role="admin">
                <Button type="primary">管理员功能</Button>
              </Auth>

              <Auth role="common">
                <Button type="default">普通用户功能</Button>
              </Auth>
            </Space>
          </div>

          <Divider />

          <div>
            <h4>代码中使用：</h4>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`import { usePermission } from '@/hooks'

const { hasPermission, hasRole } = usePermission()

// 权限判断
if (hasPermission('system:user:add')) {
  // 有权限，执行操作
}

// 角色判断
if (hasRole('admin')) {
  // 是管理员，执行操作
}`}
            </pre>
          </div>
        </Space>
      </Card>

      {/* 欢迎信息 */}
      <Card className="welcome-card" title="欢迎使用若依管理系统">
        <p>若依是一款基于SpringBoot + React开发的后台管理系统。</p>
        <p>当前版本: v3.9.1</p>
        <p>您可以访问 <a href="https://ruoyi.vip" target="_blank" rel="noopener noreferrer">官网</a> 了解更多信息。</p>
      </Card>
    </div>
  )
}

export default Index
