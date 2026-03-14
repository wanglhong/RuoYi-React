import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout as AntLayout, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './index.scss'

const { Content } = AntLayout

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <ConfigProvider locale={zhCN}>
      <AntLayout className="app-wrapper">
        {/* 顶部导航栏 */}
        <Navbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <AntLayout className="main-container">
          {/* 侧边菜单栏 */}
          <Sidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />

          {/* 内容区域 */}
          <AntLayout className="content-wrapper">
            <Content className="app-main">
              <Outlet />
            </Content>
            {/* 底部栏 */}
            <Footer />
          </AntLayout>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  )
}

export default Layout
