import React from 'react'

interface IFrameProps {
  src?: string
  style?: React.CSSProperties
}

const IFrame: React.FC<IFrameProps> = ({ src, style }) => {
  return (
    <iframe
      src={src || ''}
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
