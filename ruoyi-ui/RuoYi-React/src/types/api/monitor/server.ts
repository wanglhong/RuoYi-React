/** 服务器信息 */
export interface SysServer {
  /** CPU 信息 */
  cpu?: {
    /** 核心数 */
    cpuNum?: number
    /** 用户使用率 */
    used?: number
    /** 系统使用率 */
    sys?: number
    /** 当前空闲率 */
    free?: number
  }
  /** 内存信息 */
  mem?: {
    /** 总内存 */
    total?: number
    /** 已用内存 */
    used?: number
    /** 剩余内存 */
    free?: number
    /** 使用率 */
    usage?: number
  }
  /** JVM 信息 */
  jvm?: {
    /** Java 名称 */
    name?: string
    /** Java 版本 */
    version?: string
    /** 总内存 */
    total?: number
    /** 已用内存 */
    used?: number
    /** 剩余内存 */
    free?: number
    /** 使用率 */
    usage?: number
    /** 启动时间 */
    startTime?: string
    /** 运行时长 */
    runTime?: string
    /** 安装路径 */
    home?: string
    /** 运行参数 */
    inputArgs?: string
  }
  /** 系统信息 */
  sys?: {
    /** 服务器名称 */
    computerName?: string
    /** 服务器 IP */
    computerIp?: string
    /** 操作系统 */
    osName?: string
    /** 系统架构 */
    osArch?: string
    /** 项目路径 */
    userDir?: string
  }
  /** 磁盘信息 */
  sysFiles?: Array<{
    /** 盘符路径 */
    dirName?: string
    /** 文件系统 */
    sysTypeName?: string
    /** 盘符类型 */
    typeName?: string
    /** 总大小 */
    total?: string
    /** 可用大小 */
    free?: string
    /** 已用大小 */
    used?: string
    /** 已用百分比 */
    usage?: number
  }>
}
