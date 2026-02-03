import { App } from 'antd'

type NotificationType = 'success' | 'error'

export const useNotification = () => {
  const { notification } = App.useApp()

  const showNotification = (type: NotificationType, message: string, description?: string) => {
    notification[type]({
      title: message,
      description,
      placement: 'bottomRight',
      duration: 3,
      showProgress: true,
      pauseOnHover: true
    })
  }

  const notifySuccess = (message: string, description?: string) => {
    showNotification('success', message, description)
  }

  const notifyError = (message: string, description: string, error?: unknown) => {
    console.error(error)
    showNotification('error', message, description)
  }

  return { notifySuccess, notifyError }
}
