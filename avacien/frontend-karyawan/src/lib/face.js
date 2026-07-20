// Wrapper face-api.js: load model, deteksi & ekstraksi descriptor 128-d.
import * as faceapi from '@vladmandic/face-api'

const MODEL_URL = '/models'
let loaded = false

export async function loadModels() {
  if (loaded) return
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
  loaded = true
}

const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })

/**
 * Ambil descriptor wajah dari elemen video. Mengembalikan array 128 float,
 * atau null bila tidak ada wajah terdeteksi.
 */
export async function getDescriptor(videoEl) {
  const detection = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) return null
  return Array.from(detection.descriptor)
}
