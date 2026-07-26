import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

/**
 * Komponen kamera depan untuk verifikasi wajah.
 * Mengekspos method getFrame() via ref untuk capture + descriptor di parent.
 */
const FaceCamera = forwardRef(function FaceCamera({ active = true }, ref) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch {
        setError('Tidak bisa mengakses kamera. Izinkan akses kamera di browser.')
      }
    }
    if (active) start()
    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [active])

  useImperativeHandle(ref, () => ({
    video: () => videoRef.current,
    snapshot: () => {
      const v = videoRef.current
      if (!v) return null
      const canvas = document.createElement('canvas')
      const size = Math.min(v.videoWidth, v.videoHeight)
      canvas.width = 320
      canvas.height = 320
      const ctx = canvas.getContext('2d')
      // mirror agar selfie natural
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      const sx = (v.videoWidth - size) / 2
      const sy = (v.videoHeight - size) / 2
      ctx.drawImage(v, sx, sy, size, size, 0, 0, 320, 320)
      return canvas.toDataURL('image/jpeg', 0.8)
    },
  }))

  return (
    <div className="cam">
      {error ? (
        <div className="cam-error">{error}</div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className="cam-video" />
          <div className="cam-ring" aria-hidden="true" />
          <div className="cam-scan" aria-hidden="true" />
          {!ready && <div className="cam-loading"><span className="spinner spinner-ghost" /></div>}
        </>
      )}
    </div>
  )
})

export default FaceCamera
