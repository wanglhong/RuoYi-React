import React, { useState, useRef } from 'react'
import { Modal, Upload, message, Button, Avatar } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { UserOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { uploadAvatar } from '@/api/system/user'
import { useUserStore } from '@/store'
import './UserAvatar.scss'

const UserAvatar: React.FC = () => {
  const userStore = useUserStore()
  const avatar = userStore.avatar

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 显示裁剪弹窗
  const handleEditCropper = () => {
    setOpen(true)
    setFileList([])
  }

  // 预览图片
  const handlePreview = async (file: UploadFile) => {
    if (!file.originFileObj) {
      setPreviewImage(file.url || '')
      setPreviewOpen(true)
      return
    }

    // 读取文件进行预览
    const reader = new FileReader()
    reader.readAsDataURL(file.originFileObj)
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
      setPreviewOpen(true)
    }
  }

  // 移除文件
  const handleRemove = () => {
    setFileList([])
  }

  // 自定义上传行为
  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    const formData = new FormData()
    formData.append('avatarfile', file as File)

    try {
      setLoading(true)
      const response = await uploadAvatar(formData)

      // 更新用户头像
      const imgUrl = response.imgUrl
      userStore.avatar = imgUrl

      message.success('修改成功')
      setOpen(false)
      setFileList([])
      onSuccess?.(response)
    } catch (error: any) {
      message.error(error.message || '上传失败')
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  // 上传前验证
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.indexOf('image/') !== -1
    if (!isImage) {
      message.error('文件格式错误，请上传图片类型，如：JPG，PNG 后缀的文件。')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }

  // 关闭弹窗
  const handleClose = () => {
    setOpen(false)
    setFileList([])
  }

  const uploadButton = (
    <div className="avatar-upload-btn">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  )

  return (
    <>
      <div className="user-info-head" onClick={handleEditCropper}>
        {avatar ? (
          <img
            src={avatar}
            alt="头像"
            className="img-circle img-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Avatar size={120} icon={<UserOutlined />} className="img-circle img-lg" />
        )}
      </div>

      <Modal
        title="修改头像"
        open={open}
        onCancel={handleClose}
        footer={null}
        width={800}
      >
        <div className="avatar-cropper-content">
          <div className="upload-area">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onRemove={handleRemove}
              customRequest={handleUpload}
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="image/*"
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </div>

          <div className="upload-tips">
            <p>请点击"上传头像"选择图片文件</p>
            <p>支持 JPG、PNG 格式，大小不超过 2MB</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={600}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  )
}

export default UserAvatar
