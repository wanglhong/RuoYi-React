import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Tabs, Typography, Space, Descriptions } from 'antd'
import type { TabsProps, DescriptionsProps } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, TeamOutlined, SafetyOutlined, ClockCircleOutlined } from '@ant-design/icons'
import UserAvatar from './components/UserAvatar'
import UserInfo from './components/UserInfo'
import ResetPwd from './components/ResetPwd'
import { getUserProfile } from '@/api/system/user'
import type { SysUser } from '@/types/user'
import './index.scss'

const { Text } = Typography

interface UserProfileState {
  user: SysUser
  roleGroup: string
  postGroup: string
}

const Profile: React.FC = () => {
  const { activeTab } = useParams<{ activeTab?: string }>()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<string>(activeTab || 'userinfo')
  const [state, setState] = useState<UserProfileState>({
    user: {} as SysUser,
    roleGroup: '',
    postGroup: ''
  })

  const getUser = async () => {
    try {
      const response = await getUserProfile()
      setState({
        user: response.data,
        roleGroup: response.roleGroup || '',
        postGroup: response.postGroup || ''
      })
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  // 同步 URL 参数
  useEffect(() => {
    if (activeTab && activeTab !== selectedTab) {
      setSelectedTab(activeTab)
    }
  }, [activeTab])

  // 切换 Tab 时更新 URL
  const handleTabChange = (key: string) => {
    setSelectedTab(key)
    navigate(`/user/profile/${key}`, { replace: true })
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'userinfo',
      label: '基本资料',
      children: <UserInfo user={state.user} onUpdated={getUser} />
    },
    {
      key: 'resetPwd',
      label: '修改密码',
      children: <ResetPwd />
    }
  ]

  const descriptionItems: DescriptionsProps['items'] = [
    {
      key: 'userName',
      label: '用户名称',
      children: state.user.userName || '-',
      icon: <UserOutlined />
    },
    {
      key: 'phonenumber',
      label: '手机号码',
      children: state.user.phonenumber || '-',
      icon: <PhoneOutlined />
    },
    {
      key: 'email',
      label: '用户邮箱',
      children: state.user.email || '-',
      icon: <MailOutlined />
    },
    {
      key: 'dept',
      label: '所属部门',
      children: state.user.dept ? state.user.dept.deptName : '-',
      icon: <TeamOutlined />
    },
    {
      key: 'role',
      label: '所属角色',
      children: state.roleGroup || '-',
      icon: <SafetyOutlined />
    },
    {
      key: 'createTime',
      label: '创建日期',
      children: state.user.createTime || '-',
      icon: <ClockCircleOutlined />
    }
  ]

  return (
    <div className="profile-container app-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="user-card" title="个人信息">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <UserAvatar />
            </div>
            <Descriptions
              column={1}
              size="middle"
              items={descriptionItems.map(item => ({
                ...item,
                label: (
                  <Space>
                    {item.icon}
                    <span>{item.label}</span>
                  </Space>
                ),
                children: <span style={{ textAlign: 'right', display: 'block' }}>{item.children}</span>
              }))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={16} lg={16} xl={16}>
          <Card className="info-card" title="基本资料">
            <Tabs activeKey={selectedTab} onChange={handleTabChange} items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
