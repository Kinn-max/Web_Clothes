/**
 * Convert a normalized MediaPipe landmark to Three.js world coordinates.
 *
 * @param {Object} lm    - MediaPipe landmark { x, y, z, visibility }
 * @param {Object} THREE - Three.js module
 * @returns {THREE.Vector3}
 */
export function lmToWorld(lm, THREE) {
  const aspect = window.innerWidth / window.innerHeight
  const halfH  = 2.2 * Math.tan((55 / 2) * Math.PI / 180)
  const halfW  = halfH * aspect

  return new THREE.Vector3(
    -(lm.x - 0.5) * halfW * 2,
    -(lm.y - 0.5) * halfH * 2,
    -lm.z * 1.5
  )
}

/**
 * Compute the average visibility of a subset of landmarks.
 *
 * @param {Array}  lms     - Array of MediaPipe landmarks
 * @param {number[]} indices - Landmark indices to average
 * @returns {number} 0–1
 */
export function avgVisibility(lms, indices) {
  let sum = 0
  for (const i of indices) sum += (lms[i]?.visibility ?? 0)
  return sum / indices.length
}
