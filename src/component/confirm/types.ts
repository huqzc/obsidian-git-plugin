export interface IFsConfirmProps {
  visible: boolean
  title: string
  okText?: string
  onOk: () => void
  cancelText?: string
  onCancel: () => void
}
