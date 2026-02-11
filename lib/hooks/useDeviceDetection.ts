import { useState, useEffect } from 'react'

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent))
      setIsMac(/Mac|iPhone|iPad|iPod/.test(userAgent))
    }

    checkDevice()
  }, [])

  return { isMobile, isMac }
}
