import React, { useEffect, useState } from 'react'
import IFrame from '@/components/iFrame'

const Swagger: React.FC = () => {
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_APP_BASE_API
    setUrl(baseUrl + '/swagger-ui/index.html')
  }, [])

  return <IFrame src={url} />
}

export default Swagger
