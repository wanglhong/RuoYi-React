import React from 'react'
import { Tooltip } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import './index.scss'

const RuoYiGit: React.FC = () => {
  const handleGoto = () => {
    window.open('https://gitee.com/y_project/RuoYi-Vue', '_blank')
  }

  return (
    <Tooltip title="源码地址" placement="bottom">
      <div className="ruoyi-git" onClick={handleGoto}>
        <GithubOutlined />
      </div>
    </Tooltip>
  )
}

export default RuoYiGit
