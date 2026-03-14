import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'antd/dist/reset.css'
import './assets/styles/index.scss'
import '@/components/AuthGuard/index.scss'

// 移除 StrictMode，避免开发环境双重调用导致接口请求两次
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
