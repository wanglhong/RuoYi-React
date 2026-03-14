import React from 'react'
import { Layout } from 'antd'
import './Footer.scss'

const { Footer: AntFooter } = Layout

const Footer: React.FC = () => {
  return (
    <AntFooter className="footer-container">
      <div className="footer-content">
        <span>Copyright © 2024 若依管理系统 All Rights Reserved.</span>
      </div>
    </AntFooter>
  )
}

export default Footer
