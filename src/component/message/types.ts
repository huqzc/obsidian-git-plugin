
export type MessageType = 'success' | 'warning' | 'info' | 'error'

export interface MessageItem extends MessageOption{
  id: string
  message: string
}

export interface MessageOption {
  type?: MessageType
  duration?: number
}
