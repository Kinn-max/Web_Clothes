/**
 * Composite video + Three.js canvas and download as PNG.
 *
 * @param {HTMLVideoElement} videoEl
 * @param {HTMLCanvasElement} canvasEl
 */
export async function capturePhoto(videoEl, canvasEl) {
  const w   = window.innerWidth
  const h   = window.innerHeight
  const out = document.createElement('canvas')
  out.width  = w
  out.height = h
  const ctx = out.getContext('2d')

  // Mirror-flip the video to match display (CSS scaleX(-1))
  ctx.save()
  ctx.translate(w, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(videoEl, 0, 0, w, h)
  ctx.restore()

  // Overlay Three.js canvas on top
  ctx.drawImage(canvasEl, 0, 0, w, h)

  const link    = document.createElement('a')
  link.download = `virtual-fitting-${Date.now()}.png`
  link.href     = out.toDataURL('image/png')
  link.click()
}
