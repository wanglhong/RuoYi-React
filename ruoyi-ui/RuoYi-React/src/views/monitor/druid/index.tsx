import React from 'react'
import IFrame from '@/components/iFrame'

const DruidMonitor: React.FC = () => {
  const url = import.meta.env.VITE_APP_BASE_API + '/druid/login.html'

  return (
    <div>
      <IFrame src={url} />
    </div>
  )
}

export default DruidMonitor
