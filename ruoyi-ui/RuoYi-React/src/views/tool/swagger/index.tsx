import React from 'react'

import InnerLink from '@/components/InnerLink'

const Swagger: React.FC = () => {
  // 开发环境使用代理，生产环境直接使用后端路径
  const isDev = import.meta.env.DEV
  const url = isDev 
    ? '/dev-api/swagger-ui/index.html' 
    : '/swagger-ui/index.html'

  return <InnerLink src={url} />
}

export default Swagger
