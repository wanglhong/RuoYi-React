import React, { useState, useEffect } from 'react'

interface IFrameProps {
  src?: string
  style?: React.CSSProperties
}

const IFrame: React.FC<IFrameProps> = ({ src, style }) => {
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    if (src) {
      setUrl(src)
    }
  }, [src])

  return (
    <iframe
      src={url}
      title="iframe-content"
      style={{
        width: '100%',
        height: 'calc(100vh - 120px)',
        border: 'none',
        ...style
      }}
    />
  )
}

export default IFrame
