import { create } from 'zustand'

interface SettingsState {
  theme: string
  sideTheme: string
  showSettings: boolean
  topNav: boolean
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
}

interface SettingsActions {
  changeSetting: (key: keyof SettingsState, value: any) => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  theme: '#409EFF',
  sideTheme: 'theme-dark',
  showSettings: false,
  topNav: false,
  tagsView: true,
  fixedHeader: false,
  sidebarLogo: true,
  dynamicTitle: false,
  changeSetting: (key, value) => set({ [key]: value })
}))
