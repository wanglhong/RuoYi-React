import React, { useEffect, useState } from 'react'

interface InnerLinkProps {
  src?: string
  style?: React.CSSProperties
}

const InnerLink: React.FC<InnerLinkProps> = ({ src, style }) => {
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (src) {
      // 模拟加载完成
      const timer = setTimeout(() => {
        setLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [src])

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 120px)' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1
          }}
        >
          <div style={{ textAlign: 'center' }}>加载中...</div>
        </div>
      )}
      <iframe
        src={src || ''}
        title="inner-link"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          ...style
        }}
      />
    </div>
  )
}

export default InnerLink
