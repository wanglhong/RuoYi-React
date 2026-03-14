import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, logout } from '@/api/login'
import { getInfo } from '@/api/user'
import type { LoginParams } from '@/api/login'

interface UserState {
  token: string
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
}

interface UserActions {
  // getters
  hasToken: () => boolean
  
  // actions
  loginAction: (loginForm: LoginParams) => Promise<void>
  getUserInfo: () => Promise<void>
  logoutAction: () => Promise<void>
  resetUser: () => void
}

const initialState: UserState = {
  token: getToken() || '',
  name: '',
  avatar: '',
  roles: [],
  permissions: []
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      hasToken: () => {
        return !!get().token
      },

      loginAction: async (loginForm: LoginParams) => {
        try {
          const res = await login(loginForm)
          
          // 检查返回状态码
          if (res.code !== 200) {
            throw new Error(res.msg || '登录失败')
          }
          
          // token字段在顶层，不是在data中
          const token = res.token
          if (!token) {
            throw new Error('登录返回token为空')
          }
          
          set({ token })
          setToken(token)
          console.log('登录成功, token已保存')
        } catch (error) {
          throw error
        }
      },

      getUserInfo: async () => {
        try {
          const res = await getInfo()
          
          // 检查返回状态码
          if (res.code !== 200) {
            throw new Error(res.msg || '获取用户信息失败')
          }
          
          // 字段在顶层，不是在data中
          const { roles, permissions, user } = res
          
          console.log('用户信息:', { roles, permissions, user })
          
          // 设置用户信息 - 使用 nickName 作为显示名称
          const userName = user.nickName || user.userName || 'Admin'
          const userAvatar = user.avatar || ''
          
          console.log('设置用户名称:', userName, '头像:', userAvatar)
          
          if (roles && roles.length > 0) {
            set({
              roles,
              permissions,
              name: userName,
              avatar: userAvatar
            })
          } else {
            set({
              roles: ['ROLE_DEFAULT'],
              permissions: [],
              name: userName,
              avatar: userAvatar
            })
          }
          
          console.log('用户信息已更新')
        } catch (error) {
          throw error
        }
      },

      logoutAction: async () => {
        try {
          await logout()
        } finally {
          removeToken()
          set({
            token: '',
            name: '',
            avatar: '',
            roles: [],
            permissions: []
          })
        }
      },

      resetUser: () => {
        removeToken()
        set(initialState)
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
)
