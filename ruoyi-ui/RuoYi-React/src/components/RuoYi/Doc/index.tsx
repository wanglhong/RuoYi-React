import React from 'react'
import { Tooltip } from 'antd'
import { BookOutlined } from '@ant-design/icons'
import './index.scss'

const RuoYiDoc: React.FC = () => {
  const handleGoto = () => {
    window.open('http://doc.ruoyi.vip/ruoyi-vue', '_blank')
  }

  return (
    <Tooltip title="文档地址" placement="bottom">
      <div className="ruoyi-doc" onClick={handleGoto}>
        <BookOutlined />
      </div>
    </Tooltip>
  )
}

export default RuoYiDoc
