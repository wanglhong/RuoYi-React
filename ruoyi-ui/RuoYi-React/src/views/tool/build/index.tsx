import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Card, Button, Space, Input, InputNumber, Select, Switch, Slider, Radio, Checkbox, DatePicker, TimePicker, Rate, Upload, Divider, Modal, message, Form, Tooltip } from 'antd'
import { DownloadOutlined, CopyOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, DragOutlined } from '@ant-design/icons'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { inputComponents, selectComponents, layoutComponents } from '@/utils/generator/config'
import type { DrawingItem } from '@/utils/generator/drawingDefault'
import './index.scss'

const { TextArea } = Input
const { RangePicker } = DatePicker
const { Group: RadioGroup } = Radio
const { Group: CheckboxGroup } = Checkbox
const { Option } = Select

// 可排序的表单项组件
const SortableFormItem: React.FC<{
  item: DrawingItem
  active: boolean
  onClick: () => void
  onCopy: () => void
  onDelete: () => void
  renderComponent: (item: DrawingItem) => React.ReactNode
}> = ({ item, active, onClick, onCopy, onDelete, renderComponent }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.formId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`form-item-wrapper ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="form-item-header">
        <span className="drag-handle" {...attributes} {...listeners}>
          <DragOutlined /> {item.label}
        </span>
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={onCopy} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
        </Space>
      </div>
      <div className="form-item-content">
        {renderComponent(item)}
      </div>
    </div>
  )
}

// 表单构建器主组件
const FormBuilder: React.FC = () => {
  const [drawingList, setDrawingList] = useState<DrawingItem[]>([])
  const [activeData, setActiveData] = useState<DrawingItem | null>(null)
  const [formConf, setFormConf] = useState({
    size: 'middle',
    labelWidth: 100,
    gutter: 15,
  })
  const [copyModalVisible, setCopyModalVisible] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  const idCounter = useRef(100)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setDrawingList((items) => {
        const oldIndex = items.findIndex((item) => item.formId === active.id)
        const newIndex = items.findIndex((item) => item.formId === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // 添加组件
  const addComponent = (component: any) => {
    const newItem: DrawingItem = {
      ...JSON.parse(JSON.stringify(component)),
      formId: ++idCounter.current,
      vModel: `field${idCounter.current}`,
      span: 24,
    }
    setDrawingList([...drawingList, newItem])
    setActiveData(newItem)
  }

  // 复制组件
  const copyComponent = (item: DrawingItem) => {
    const newItem: DrawingItem = {
      ...JSON.parse(JSON.stringify(item)),
      formId: ++idCounter.current,
      vModel: `field${idCounter.current}`,
    }
    setDrawingList([...drawingList, newItem])
    setActiveData(newItem)
  }

  // 删除组件
  const deleteComponent = (formId: number) => {
    const newList = drawingList.filter((item) => item.formId !== formId)
    setDrawingList(newList)
    if (activeData?.formId === formId) {
      setActiveData(newList.length > 0 ? newList[newList.length - 1] : null)
    }
  }

  // 更新活动组件
  const updateActiveData = (field: string, value: any) => {
    if (!activeData) return
    const newData = { ...activeData, [field]: value }
    setActiveData(newData)
    setDrawingList(drawingList.map((item) => (item.formId === activeData.formId ? newData : item)))
  }

  // 生成代码
  const generateCode = () => {
    const code = generateFormCode(drawingList, formConf)
    setGeneratedCode(code)
    setCopyModalVisible(true)
  }

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    message.success('代码已复制到剪切板')
  }

  // 清空画布
  const clearCanvas = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有组件吗？',
      onOk: () => {
        setDrawingList([])
        setActiveData(null)
        idCounter.current = 100
      },
    })
  }

  // 下载文件
  const downloadFile = () => {
    const code = generateFormCode(drawingList, formConf)
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GeneratedForm.tsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 渲染表单组件
  const renderComponent = (item: DrawingItem) => {
    const commonProps = {
      placeholder: item.placeholder,
      defaultValue: item.defaultValue,
      disabled: item.disabled,
      style: item.style || { width: '100%' },
    }

    switch (item.tag) {
      case 'Input':
        return <Input {...commonProps} allowClear={item.allowClear} maxLength={item.maxLength} showCount={item.showCount} />
      case 'Input.TextArea':
        return <TextArea {...commonProps} autoSize={item.autoSize} maxLength={item.maxLength} showCount={item.showCount} />
      case 'Input.Password':
        return <Input.Password {...commonProps} allowClear={item.allowClear} />
      case 'InputNumber':
        return <InputNumber {...commonProps} min={item.min} max={item.max} step={item.step} precision={item.precision} />
      case 'Select':
        return (
          <Select {...commonProps} allowClear={item.allowClear} showSearch={item.showSearch} mode={item.mode}>
            {item.options?.map((opt, idx) => (
              <Option key={idx} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        )
      case 'Radio.Group':
        return (
          <RadioGroup {...commonProps} optionType={item.optionType} buttonStyle={item.buttonStyle}>
            {item.options?.map((opt, idx) => (
              <Radio key={idx} value={opt.value}>{opt.label}</Radio>
            ))}
          </RadioGroup>
        )
      case 'Checkbox.Group':
        return (
          <CheckboxGroup {...commonProps} value={item.defaultValue || []}>
            {item.options?.map((opt, idx) => (
              <Checkbox key={idx} value={opt.value}>{opt.label}</Checkbox>
            ))}
          </CheckboxGroup>
        )
      case 'Switch':
        return <Switch {...commonProps} checkedChildren={item.checkedChildren} unCheckedChildren={item.unCheckedChildren} />
      case 'Slider':
        return <Slider {...commonProps} min={item.min} max={item.max} step={item.step} dots={item.dots} range={item.range} />
      case 'TimePicker':
        return <TimePicker {...commonProps} format={item.format} />
      case 'DatePicker':
        return <DatePicker {...commonProps} format={item.format} style={{ width: '100%' }} />
      case 'DatePicker.RangePicker':
        return <RangePicker {...commonProps} format={item.format} style={{ width: '100%' }} />
      case 'Rate':
        return <Rate {...commonProps} max={item.max} allowHalf={item.allowHalf} showText={item.showText} />
      case 'Button':
        return <Button type={item.type} icon={item.icon} size={item.size}>{item.default}</Button>
      default:
        return <Input placeholder="未实现的组件" />
    }
  }

  // 生成表单代码
  const generateFormCode = (items: DrawingItem[], conf: any) => {
    const formItems = items.map((item) => {
      return `      <Form.Item label="${item.label}" name="${item.vModel}" ${item.required ? 'rules={[{ required: true, message: \'请输入\' + \'' + item.label + '\' }]}' : ''}>
        ${renderComponentCode(item)}
      </Form.Item>`
    }).join('\n')

    return `import React from 'react'
import { Form, Input, InputNumber, Select, Radio, Checkbox, Switch, Slider, DatePicker, TimePicker, Rate, Button } from 'antd'

const GeneratedForm: React.FC = () => {
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    console.log('表单值:', values)
  }

  return (
    <Form
      form={form}
      size="${conf.size}"
      labelCol={{ span: ${Math.floor(conf.labelWidth / 6.25)} }}
      onFinish={handleSubmit}
    >
${formItems}
      <Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form.Item>
    </Form>
  )
}

export default GeneratedForm
`
  }

  // 渲染组件代码
  const renderComponentCode = (item: DrawingItem) => {
    const tag = item.tag.split('.')[0]
    switch (tag) {
      case 'Input':
        if (item.tag.includes('TextArea')) return '<TextArea />'
        if (item.tag.includes('Password')) return '<Input.Password />'
        return '<Input />'
      case 'Select':
        return '<Select />'
      case 'Radio':
        return '<Radio.Group />'
      case 'Checkbox':
        return '<Checkbox.Group />'
      case 'Switch':
        return '<Switch />'
      case 'Slider':
        return '<Slider />'
      case 'TimePicker':
        return '<TimePicker />'
      case 'DatePicker':
        return item.tag.includes('RangePicker') ? '<DatePicker.RangePicker />' : '<DatePicker />'
      case 'Rate':
        return '<Rate />'
      case 'InputNumber':
        return '<InputNumber />'
      case 'Button':
        return '<Button />'
      default:
        return '<Input />'
    }
  }

  // 右侧属性面板
  const renderRightPanel = () => {
    if (!activeData) {
      return (
        <div className="empty-panel">
          <p>请选择一个组件进行配置</p>
        </div>
      )
    }

    return (
      <div className="config-panel">
        <Divider orientation="left">基础属性</Divider>
        <Form layout="vertical" size="small">
          <Form.Item label="字段名">
            <Input
              value={activeData.vModel}
              onChange={(e) => updateActiveData('vModel', e.target.value)}
              disabled
            />
          </Form.Item>
          <Form.Item label="标签">
            <Input
              value={activeData.label}
              onChange={(e) => updateActiveData('label', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="占位文字">
            <Input
              value={activeData.placeholder}
              onChange={(e) => updateActiveData('placeholder', e.target.value)}
              disabled={!activeData.placeholder}
            />
          </Form.Item>
          <Form.Item label="默认值">
            <Input
              value={activeData.defaultValue}
              onChange={(e) => updateActiveData('defaultValue', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="栅格">
            <InputNumber
              value={activeData.span}
              onChange={(value) => updateActiveData('span', value)}
              min={1}
              max={24}
            />
          </Form.Item>
          <Form.Item label="必填">
            <Switch
              checked={activeData.required}
              onChange={(checked) => updateActiveData('required', checked)}
            />
          </Form.Item>
          <Form.Item label="禁用">
            <Switch
              checked={activeData.disabled}
              onChange={(checked) => updateActiveData('disabled', checked)}
            />
          </Form.Item>
        </Form>
      </div>
    )
  }

  return (
    <div className="form-builder">
      {/* 左侧组件列表 */}
      <div className="left-board">
        <div className="board-title">Form Generator</div>
        <Divider>输入型组件</Divider>
        <div className="components-list">
          {inputComponents.map((comp, idx) => (
            <div key={idx} className="component-item" onClick={() => addComponent(comp)}>
              {comp.label}
            </div>
          ))}
        </div>
        <Divider>选择型组件</Divider>
        <div className="components-list">
          {selectComponents.map((comp, idx) => (
            <div key={idx} className="component-item" onClick={() => addComponent(comp)}>
              {comp.label}
            </div>
          ))}
        </div>
        <Divider>布局型组件</Divider>
        <div className="components-list">
          {layoutComponents.map((comp, idx) => (
            <div key={idx} className="component-item" onClick={() => addComponent(comp)}>
              {comp.label}
            </div>
          ))}
        </div>
      </div>

      {/* 中间画布 */}
      <div className="center-board">
        <div className="action-bar">
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={downloadFile}>
              导出文件
            </Button>
            <Button type="primary" icon={<CopyOutlined />} onClick={generateCode}>
              复制代码
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={clearCanvas}>
              清空
            </Button>
          </Space>
        </div>
        <div className="canvas-board">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={drawingList.map((item) => item.formId)} strategy={verticalListSortingStrategy}>
              <Form size={formConf.size}>
                {drawingList.map((item) => (
                  <SortableFormItem
                    key={item.formId}
                    item={item}
                    active={activeData?.formId === item.formId}
                    onClick={() => setActiveData(item)}
                    onCopy={() => copyComponent(item)}
                    onDelete={() => deleteComponent(item.formId)}
                    renderComponent={renderComponent}
                  />
                ))}
              </Form>
            </SortableContext>
          </DndContext>
          {drawingList.length === 0 && (
            <div className="empty-canvas">
              从左侧拖入或点选组件进行表单设计
            </div>
          )}
        </div>
      </div>

      {/* 右侧属性面板 */}
      <div className="right-board">
        {renderRightPanel()}
      </div>

      {/* 代码预览弹窗 */}
      <Modal
        title="生成的代码"
        open={copyModalVisible}
        onCancel={() => setCopyModalVisible(false)}
        width="80%"
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyCode}>
            复制
          </Button>,
          <Button key="close" onClick={() => setCopyModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <pre className="code-preview">{generatedCode}</pre>
      </Modal>
    </div>
  )
}

export default FormBuilder
