import React, { useState, useEffect, useRef } from 'react'
import { Card, Tabs, Form, Input, Button, Table, Select, Checkbox, Space, message, Modal, Row, Col, TreeSelect } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { GenTable, GenTableColumn, GenTableInfoResult } from '@/types/api/tool/gen'
import { getGenTable, updateGenTable } from '@/api/tool/gen'
import { useParams, useNavigate } from 'react-router-dom'

const { TextArea } = Input
const { Option } = Select

// 基本信息表单组件
const BasicInfoForm: React.FC<{ info: GenTable; form: any }> = ({ info, form }) => {
  return (
    <Form form={form} layout="vertical" initialValues={info}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="表名称"
            name="tableName"
            rules={[{ required: true, message: '请输入表名称' }]}
          >
            <Input placeholder="请输入表名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="表描述"
            name="tableComment"
            rules={[{ required: true, message: '请输入表描述' }]}
          >
            <Input placeholder="请输入表描述" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="实体类名称"
            name="className"
            rules={[{ required: true, message: '请输入实体类名称' }]}
          >
            <Input placeholder="请输入实体类名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="作者"
            name="functionAuthor"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

// 字段信息表格组件
const ColumnInfoTable: React.FC<{
  columns: GenTableColumn[]
  onChange: (columns: GenTableColumn[]) => void
}> = ({ columns, onChange }) => {
  const [localColumns, setLocalColumns] = useState<GenTableColumn[]>(columns || [])

  useEffect(() => {
    setLocalColumns(columns || [])
  }, [columns])

  const updateColumn = (index: number, field: keyof GenTableColumn, value: any) => {
    const newColumns = [...localColumns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setLocalColumns(newColumns)
    onChange(newColumns)
  }

  const columnsType: ColumnsType<GenTableColumn> = [
    {
      title: '序号',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: '字段列名',
      dataIndex: 'columnName',
      width: 120,
      ellipsis: true
    },
    {
      title: '字段描述',
      dataIndex: 'columnComment',
      width: 120,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateColumn(index, 'columnComment', e.target.value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '物理类型',
      dataIndex: 'columnType',
      width: 120,
      ellipsis: true
    },
    {
      title: 'Java 类型',
      dataIndex: 'javaType',
      width: 110,
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => updateColumn(index, 'javaType', value)}
          style={{ width: '100%' }}
        >
          <Option value="Long">Long</Option>
          <Option value="String">String</Option>
          <Option value="Integer">Integer</Option>
          <Option value="Double">Double</Option>
          <Option value="BigDecimal">BigDecimal</Option>
          <Option value="Date">Date</Option>
          <Option value="Boolean">Boolean</Option>
        </Select>
      )
    },
    {
      title: 'Java 属性',
      dataIndex: 'javaField',
      width: 120,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateColumn(index, 'javaField', e.target.value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '插入',
      dataIndex: 'isInsert',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          checked={text === '1'}
          onChange={(e) => updateColumn(index, 'isInsert', e.target.checked ? '1' : '0')}
        />
      )
    },
    {
      title: '编辑',
      dataIndex: 'isEdit',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          checked={text === '1'}
          onChange={(e) => updateColumn(index, 'isEdit', e.target.checked ? '1' : '0')}
        />
      )
    },
    {
      title: '列表',
      dataIndex: 'isList',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          checked={text === '1'}
          onChange={(e) => updateColumn(index, 'isList', e.target.checked ? '1' : '0')}
        />
      )
    },
    {
      title: '查询',
      dataIndex: 'isQuery',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          checked={text === '1'}
          onChange={(e) => updateColumn(index, 'isQuery', e.target.checked ? '1' : '0')}
        />
      )
    },
    {
      title: '查询方式',
      dataIndex: 'queryType',
      width: 100,
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => updateColumn(index, 'queryType', value)}
          style={{ width: '100%' }}
        >
          <Option value="EQ">=</Option>
          <Option value="NE">!=</Option>
          <Option value="GT">&gt;</Option>
          <Option value="GTE">&gt;=</Option>
          <Option value="LT">&lt;</Option>
          <Option value="LTE">&lt;=</Option>
          <Option value="LIKE">LIKE</Option>
          <Option value="BETWEEN">BETWEEN</Option>
        </Select>
      )
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          checked={text === '1'}
          onChange={(e) => updateColumn(index, 'isRequired', e.target.checked ? '1' : '0')}
        />
      )
    },
    {
      title: '显示类型',
      dataIndex: 'htmlType',
      width: 120,
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => updateColumn(index, 'htmlType', value)}
          style={{ width: '100%' }}
        >
          <Option value="input">文本框</Option>
          <Option value="textarea">文本域</Option>
          <Option value="select">下拉框</Option>
          <Option value="radio">单选框</Option>
          <Option value="checkbox">复选框</Option>
          <Option value="datetime">日期控件</Option>
          <Option value="imageUpload">图片上传</Option>
          <Option value="fileUpload">文件上传</Option>
          <Option value="editor">富文本控件</Option>
        </Select>
      )
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      width: 120,
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => updateColumn(index, 'dictType', value)}
          style={{ width: '100%' }}
          allowClear
          showSearch
          placeholder="请选择"
        >
          {/* 字典选项需要通过 API 获取 */}
        </Select>
      )
    }
  ]

  return (
    <Table
      columns={columnsType}
      dataSource={localColumns}
      rowKey="columnId"
      pagination={false}
      scroll={{ y: 500 }}
      size="small"
    />
  )
}

// 生成信息表单组件
const GenInfoForm: React.FC<{
  info: GenTable
  tables: GenTable[]
  form: any
  onInfoChange: (info: GenTable) => void
}> = ({ info, tables, form, onInfoChange }) => {
  const [menuOptions, setMenuOptions] = useState<any[]>([])
  const [subColumns, setSubColumns] = useState<GenTableColumn[]>([])

  // 获取菜单树
  useEffect(() => {
    // TODO: 调用菜单 API
    // listMenu().then(response => {
    //   setMenuOptions(response.data)
    // })
  }, [])

  // 当子表改变时，获取子表的列
  useEffect(() => {
    if (info.subTableName) {
      const subTable = tables.find(t => t.tableName === info.subTableName)
      setSubColumns(subTable?.columns || [])
    } else {
      setSubColumns([])
    }
  }, [info.subTableName, tables])

  const handleTplCategoryChange = (value: string) => {
    if (value !== 'sub') {
      onInfoChange({ ...info, subTableName: undefined, subTableFkName: undefined })
    }
  }

  const handleSubTableChange = (value: string) => {
    onInfoChange({ ...info, subTableFkName: undefined })
  }

  return (
    <Form form={form} layout="vertical" initialValues={info}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="生成模板"
            name="tplCategory"
            rules={[{ required: true, message: '请选择生成模板' }]}
          >
            <Select onChange={handleTplCategoryChange}>
              <Option value="crud">单表（增删改查）</Option>
              <Option value="tree">树表（增删改查）</Option>
              <Option value="sub">主子表（增删改查）</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="前端类型"
            name="tplWebType"
          >
            <Select>
              <Option value="element-ui">Vue2 Element UI 模版</Option>
              <Option value="element-plus">Vue3 Element Plus 模版</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="生成包路径"
            name="packageName"
            rules={[{ required: true, message: '请输入生成包路径' }]}
          >
            <Input placeholder="例如 com.ruoyi.system" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="生成模块名"
            name="moduleName"
            rules={[{ required: true, message: '请输入生成模块名' }]}
          >
            <Input placeholder="例如 system" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="生成业务名"
            name="businessName"
            rules={[{ required: true, message: '请输入生成业务名' }]}
          >
            <Input placeholder="例如 user" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="生成功能名"
            name="functionName"
            rules={[{ required: true, message: '请输入生成功能名' }]}
          >
            <Input placeholder="例如 用户" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="生成代码方式"
            name="genType"
          >
            <Select>
              <Option value="0">zip 压缩包</Option>
              <Option value="1">自定义路径</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="上级菜单" name="parentMenuId">
            <TreeSelect
              treeData={menuOptions}
              placeholder="请选择系统菜单"
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>
        </Col>
        {info.genType === '1' && (
          <Col span={24}>
            <Form.Item label="自定义路径" name="genPath">
              <Input placeholder="填写磁盘绝对路径，若不填写，则生成到当前 Web 项目下" />
            </Form.Item>
          </Col>
        )}
      </Row>

      {info.tplCategory === 'tree' && (
        <>
          <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 'bold' }}>其他信息</div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="树编码字段" name="treeCode">
                <Select placeholder="请选择">
                  {info.columns?.map((column, index) => (
                    <Option key={index} value={column.columnName}>
                      {column.columnName}：{column.columnComment}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="树父编码字段" name="treeParentCode">
                <Select placeholder="请选择">
                  {info.columns?.map((column, index) => (
                    <Option key={index} value={column.columnName}>
                      {column.columnName}：{column.columnComment}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="树名称字段" name="treeName">
                <Select placeholder="请选择">
                  {info.columns?.map((column, index) => (
                    <Option key={index} value={column.columnName}>
                      {column.columnName}：{column.columnComment}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {info.tplCategory === 'sub' && (
        <>
          <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 'bold' }}>关联信息</div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="关联子表的表名" name="subTableName">
                <Select placeholder="请选择" onChange={handleSubTableChange}>
                  {tables.map((table, index) => (
                    <Option key={index} value={table.tableName}>
                      {table.tableName}：{table.tableComment}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="子表关联的外键名" name="subTableFkName">
                <Select placeholder="请选择">
                  {subColumns.map((column, index) => (
                    <Option key={index} value={column.columnName}>
                      {column.columnName}：{column.columnComment}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </Form>
  )
}

// 主组件
const GenEdit: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const [activeName, setActiveName] = useState('columnInfo')
  const [info, setInfo] = useState<GenTable>({})
  const [columns, setColumns] = useState<GenTableColumn[]>([])
  const [tables, setTables] = useState<GenTable[]>([])
  const [basicForm] = Form.useForm()
  const [genInfoForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 获取表详细信息
  useEffect(() => {
    const fetchDetail = async () => {
      if (!tableId) return
      setLoading(true)
      try {
        const res = await getGenTable(Number(tableId))
        if (res.code === 200 && res.data) {
          const data = res.data as GenTableInfoResult
          setColumns(data.rows || [])
          setInfo(data.info || {})
          setTables(data.tables || [])
        }
      } catch (error) {
        console.error('获取表详细信息失败:', error)
        message.error('获取表详细信息失败')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [tableId])

  // 提交表单
  const handleSubmit = async () => {
    try {
      // 验证基本信息表单
      await basicForm.validateFields()
      // 验证生成信息表单
      await genInfoForm.validateFields()

      const genTable: GenTable = {
        ...info,
        columns: columns,
        params: {
          treeCode: info.treeCode,
          treeName: info.treeName,
          treeParentCode: info.treeParentCode,
          parentMenuId: info.parentMenuId
        }
      }

      const res = await updateGenTable(genTable)
      if (res.code === 200) {
        message.success(res.msg || '修改成功')
        // 返回到列表页
        navigate('/tool/gen')
      } else {
        message.error(res.msg || '修改失败')
      }
    } catch (error: any) {
      console.error('表单验证失败:', error)
      message.error('表单校验未通过，请重新检查提交内容')
    }
  }

  // 返回按钮
  const handleBack = () => {
    navigate('/tool/gen')
  }

  const tabsItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: <BasicInfoForm info={info} form={basicForm} />
    },
    {
      key: 'columnInfo',
      label: '字段信息',
      children: <ColumnInfoTable columns={columns} onChange={setColumns} />
    },
    {
      key: 'genInfo',
      label: '生成信息',
      children: (
        <GenInfoForm
          info={info}
          tables={tables}
          form={genInfoForm}
          onInfoChange={setInfo}
        />
      )
    }
  ]

  return (
    <Card loading={loading}>
      <Tabs activeKey={activeName} onChange={setActiveName} items={tabsItems} />
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
          <Button onClick={handleBack}>返回</Button>
        </Space>
      </div>
    </Card>
  )
}

export default GenEdit
