// 表单设计器默认值
export interface DrawingItem {
  layout: 'colFormItem' | 'rowFormItem'
  tag: string
  tagIcon: string
  label: string
  vModel?: string
  formId: number
  placeholder?: string
  defaultValue?: any
  span: number
  style?: React.CSSProperties
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  changeTag?: boolean
  children?: DrawingItem[]
  // 特定组件属性
  type?: string
  allowClear?: boolean
  maxLength?: number
  showCount?: boolean
  autoSize?: { minRows: number; maxRows: number }
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  step?: number
  format?: string
  checkedChildren?: string
  unCheckedChildren?: string
  dots?: boolean
  range?: boolean
  max?: number
  allowHalf?: boolean
  showText?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  multiple?: boolean
  action?: string
  // 布局属性
  gutter?: number
  justify?: string
  align?: string
  layoutTree?: boolean
}

export const drawingDefaultValue: DrawingItem[] = []

export function initDrawingDefaultValue() {
  if (drawingDefaultValue.length === 0) {
    drawingDefaultValue.push({
      layout: 'colFormItem',
      tagIcon: 'input',
      label: '手机号',
      vModel: 'mobile',
      formId: 1,
      tag: 'Input',
      placeholder: '请输入手机号',
      defaultValue: '',
      span: 24,
      style: { width: '100%' },
      allowClear: true,
      maxLength: 11,
      showCount: true,
      readOnly: false,
      disabled: false,
      required: true,
      changeTag: true,
    })
  }
}

export function cleanDrawingDefaultValue() {
  drawingDefaultValue.splice(0, drawingDefaultValue.length)
}
