import request from '@/utils/request'

import type { DictTypeQueryParams, SysDictType, DictDataQueryParams, SysDictData, AjaxResult, TableDataInfo } from '@/types/system'

// 查询字典类型列表
export function listType(query: DictTypeQueryParams): Promise<TableDataInfo<SysDictType[]>> {
  return request({
    url: '/api/system/dict/type/list',
    method: 'get',
    params: query
  })
}

// 查询字典类型详细
export function getType(dictId: number): Promise<AjaxResult<SysDictType>> {
  return request({
    url: '/api/system/dict/type/' + dictId,
    method: 'get'
  })
}

// 新增字典类型
export function addType(data: SysDictType): Promise<AjaxResult> {
  return request({
    url: '/api/system/dict/type',
    method: 'post',
    data: data
  })
}

// 修改字典类型
export function updateType(data: SysDictType): Promise<AjaxResult> {
  return request({
    url: '/api/system/dict/type',
    method: 'put',
    data: data
  })
}

// 删除字典类型
export function delType(dictId: number | number[]): Promise<AjaxResult> {
  const idStr = Array.isArray(dictId) ? dictId.join(',') : dictId.toString()
  return request({
    url: '/api/system/dict/type/' + idStr,
    method: 'delete'
  })
}

// 刷新字典缓存
export function refreshCache(): Promise<AjaxResult> {
  return request({
    url: '/api/system/dict/type/refreshCache',
    method: 'delete'
  })
}

// 获取字典选择框列表
export function optionselect(): Promise<AjaxResult<SysDictType[]>> {
  return request({
    url: '/api/system/dict/type/optionselect',
    method: 'get'
  })
}

// 查询字典数据列表
export function listData(query: DictDataQueryParams): Promise<TableDataInfo<SysDictData[]>> {
  return request({
    url: '/api/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode: number): Promise<AjaxResult<SysDictData>> {
  return request({
    url: '/api/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 新增字典数据
export function addData(data: SysDictData): Promise<AjaxResult> {
  return request({
    url: '/api/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data: SysDictData): Promise<AjaxResult> {
  return request({
    url: '/api/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode: number | number[]): Promise<AjaxResult> {
  const idStr = Array.isArray(dictCode) ? dictCode.join(',') : dictCode.toString()
  return request({
    url: '/api/system/dict/data/' + idStr,
    method: 'delete'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType: string): Promise<AjaxResult<SysDictData[]>> {
  return request({
    url: '/api/system/dict/data/type/' + dictType,
    method: 'get'
  })
}
