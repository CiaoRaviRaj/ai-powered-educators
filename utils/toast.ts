// Toast.js

import { toast } from 'react-hot-toast'

const Toast = {
  success: (message = "") => {
    toast.success(message)
  },
  error: (message = "") => {
    toast.error(message)
  },

  info: (message = "") => {
    toast(message)
  },
  customError: (message = "") => {
    toast.error(message, {
      position: 'top-center',
      duration: 1000,
      style: { width: '150%', wordBreak: 'break-all' }
    })
  },
  messageSuccess: (message = "", duration : number | undefined, className = "") => {
    toast.success(message, {
      duration,
      style: { width: '150%', wordBreak: 'break-all' },
      className
    })
  },
  messageError: (message = "", duration : number | undefined, className = "") => {
    toast.error(message, {
      duration,
      style: { width: '150%', wordBreak: 'break-all' },
      className
    })
  },
 
}

export default Toast