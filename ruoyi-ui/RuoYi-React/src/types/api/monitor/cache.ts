/** 缓存信息 */
export interface SysCache {
  /** 缓存名称 */
  cacheName?: string
  /** 缓存键名 */
  cacheKey?: string
  /** 缓存内容 */
  cacheValue?: string
  /** 备注 */
  remark?: string
  /** Redis 信息 */
  info?: {
    /** Redis 版本 */
    redis_version?: string
    /** 运行模式 */
    redis_mode?: string
    /** 端口 */
    tcp_port?: string
    /** 客户端数 */
    connected_clients?: string
    /** 运行时间 (天) */
    uptime_in_days?: string
    /** 使用内存 */
    used_memory_human?: string
    /** 使用 CPU */
    used_cpu_user_children?: string
    /** 内存配置 */
    maxmemory_human?: string
    /** AOF 是否开启 */
    aof_enabled?: string
    /** RDB 是否成功 */
    rdb_last_bgsave_status?: string
    /** 网络入口 */
    instantaneous_input_kbps?: string
    /** 网络出口 */
    instantaneous_output_kbps?: string
  }
  /** Key 数量 */
  dbSize?: number
  /** 命令统计 */
  commandStats?: Array<{
    name?: string
    value?: number
  }>
}
