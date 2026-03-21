import React from 'react'

import InnerLink from '@/components/InnerLink'

const DruidMonitor: React.FC = () => {
  // 开发环境使用代理，生产环境直接使用后端路径
  const isDev = import.meta.env.DEV
  const url = isDev 
    ? '/dev-api/druid/login.html' 
    : '/druid/login.html'

  return (
    <div>
      <InnerLink src={url} />
    </div>
  )
}

export default DruidMonitor
