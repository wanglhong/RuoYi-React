import React from 'react'
import { Layout, Avatar, Dropdown, Modal, message, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { UserOutlined, LogoutOutlined, DownOutlined, ExclamationCircleOutlined, GithubOutlined, BookOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore, usePermissionStore } from '@/store'
import './Navbar.scss'

const { Header } = Layout

interface NavbarProps {
  collapsed: boolean
  onToggle: () => void
}

const Navbar: React.FC<NavbarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate()
  const name = useUserStore((state) => state.name)
  const avatar = useUserStore((state) => state.avatar)
  const logoutAction = useUserStore((state) => state.logoutAction)
  const resetPermission = usePermissionStore((state) => state.resetPermission)

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        // 跳转到个人中心
        navigate('/user/profile')
        break
      case 'logout':
        handleLogout()
        break
      default:
        break
    }
  }

  // 退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定注销并退出系统吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 调用退出登录接口
          await logoutAction()

          // 清除权限数据
          resetPermission()

          message.success('退出成功')

          // 跳转到登录页
          navigate('/login', { replace: true })
        } catch (error: any) {
          // 即使退出失败，也要清除本地数据并跳转
          message.error(error.message || '退出失败')
          navigate('/login', { replace: true })
        }
      }
    })
  }

  const userItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ]

  return (
    <Header className="navbar-container">
      {/* 左侧：Logo + 网站名称 */}
      <div className="navbar-left">
        <div className="logo-section">
          <div className="logo-icon">
            <img src="/logo.png" alt="logo" onError={(e) => {
              e.currentTarget.style.display = 'none'
            }} />
          </div>
          <span className="site-title">若依后台管理系统</span>
        </div>
      </div>

      {/* 右侧：官网链接 + 文档链接 + 用户名 */}
      <div className="navbar-right">
        {/* 若依官网 */}
        <Tooltip title="若依官网" placement="bottom">
          <div className="nav-icon" onClick={() => window.open('https://www.ruoyi.vip', '_blank')}>
            <HomeOutlined />
          </div>
        </Tooltip>

        {/* 源码地址 */}
        <Tooltip title="源码地址" placement="bottom">
          <div className="nav-icon" onClick={() => window.open('https://gitee.com/y_project/RuoYi-Vue', '_blank')}>
            <GithubOutlined />
          </div>
        </Tooltip>

        {/* 文档地址 */}
        <Tooltip title="文档地址" placement="bottom">
          <div className="nav-icon" onClick={() => window.open('http://doc.ruoyi.vip/ruoyi-vue', '_blank')}>
            <BookOutlined />
          </div>
        </Tooltip>

        {/* 用户菜单 */}
        <Dropdown
          menu={{ items: userItems, onClick: handleMenuClick }}
          placement="bottomRight"
        >
          <div className="user-info">
            <Avatar
              size="small"
              src={avatar}
              icon={<UserOutlined />}
            />
            <span className="username">{name || 'Admin'}</span>
            <DownOutlined className="dropdown-icon" />
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

export default Navbar
