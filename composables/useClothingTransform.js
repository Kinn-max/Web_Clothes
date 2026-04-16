import { lmToWorld, avgVisibility } from '~/utils/landmarkToWorld'

// Lerp factors
const POS_LERP   = 0.18
const SCALE_LERP = 0.15
const ROT_LERP   = 0.12

// Back-facing hysteresis thresholds
const BACK_ENTER_TH = 0.25   // enter back-mode when avgVis < 0.25
const BACK_EXIT_TH  = 0.45   // exit  back-mode when avgVis > 0.45

// Skirt spring physics constants
const SPRING_K = 0.08
const SPRING_D = 0.75

/**
 * useClothingTransform – smooth position/scale/rotation, back-facing detection,
 *                        skirt spring physics.
 *
 * Works with two separate mesh groups from useGLBModel:
 *   clothingFront – visible when user faces camera (rotation.y ≈ 0)
 *   clothingBack  – visible when user turns back   (rotation.y = Math.PI, SNAP)
 *
 * @param {object} controls - { scaleX, scaleY, offsetY, sleeveStrength } refs from useFittingControls
 */
export function useClothingTransform({ scaleX, scaleY, offsetY, sleeveStrength }) {
  // Smooth state (plain numbers/objects – not reactive, updated every frame)
  let smoothPos   = null
  let smoothScale = null
  let smoothRotZ  = 0
  let smoothRotY  = 0

  // Back-facing state with hysteresis
  let isFacingBack   = false
  let prevFacingBack = false

  // Skirt spring state
  let skirtVelX    = 0
  let skirtOffsetX = 0
  let lastHipX     = 0
  let hipVelX      = 0

  /**
   * Update clothing transform for one frame.
   *
   * @param {object} opts
   *   THREE         - Three.js module
   *   clothingFront - THREE.Group (front mesh from useGLBModel)
   *   clothingBack  - THREE.Group (back mesh from useGLBModel)
   *   modelHeight   - number
   *   landmarks     - MediaPipe PoseLandmarker landmarks array
   *   deformArms    - function from useArmDeform
   *   meshDataFront - array from useGLBModel.getMeshDataFront()
   *   meshDataBack  - array from useGLBModel.getMeshDataBack()
   *   onStatus      - (status: string, text: string) => void
   *   onConfidence  - (value: number) => void
   */
  function updateClothing({
    THREE, clothingFront, clothingBack,
    modelHeight, landmarks,
    deformArms, meshDataFront, meshDataBack,
    onStatus, onConfidence,
  }) {
    if (!clothingFront || !clothingBack) return

    const lShoul = lmToWorld(landmarks[11], THREE)
    const rShoul = lmToWorld(landmarks[12], THREE)
    const lHip   = lmToWorld(landmarks[23], THREE)
    const rHip   = lmToWorld(landmarks[24], THREE)
    const lElbow = lmToWorld(landmarks[13], THREE)
    const rElbow = lmToWorld(landmarks[14], THREE)
    const lWrist = lmToWorld(landmarks[15], THREE)
    const rWrist = lmToWorld(landmarks[16], THREE)

    const conf = avgVisibility(landmarks, [11, 12, 23, 24])
    onConfidence?.(conf)

    if (conf < 0.35) {
      clothingFront.visible = false
      clothingBack.visible  = false
      onStatus?.('ready', 'Không thấy rõ – hãy đứng thẳng vào khung')
      return
    }

    // ── Compute target transform ─────────────────────────────────────────
    const shoulderMid   = new THREE.Vector3().addVectors(lShoul, rShoul).multiplyScalar(0.5)
    const hipMid        = new THREE.Vector3().addVectors(lHip, rHip).multiplyScalar(0.5)
    const shoulderWidth = lShoul.distanceTo(rShoul)
    const bodyH         = shoulderMid.distanceTo(hipMid)

    const autoScaleY = (bodyH * 2.8) / modelHeight
    const autoScaleX = (shoulderWidth * 1.45) / modelHeight
    const autoScale  = (autoScaleX + autoScaleY) / 2
    const finalScale = new THREE.Vector3(
      autoScale * scaleX.value,
      autoScale * scaleY.value,
      autoScale
    )

    const verticalShift = bodyH * (-0.10 + offsetY.value)
    const targetPos = new THREE.Vector3()
      .addVectors(shoulderMid, hipMid)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, verticalShift, 0))

    const shoulderDir = new THREE.Vector3().subVectors(rShoul, lShoul)
    const targetRotZ  = Math.atan2(shoulderDir.y, shoulderDir.x)
    const targetRotY  = (rShoul.z - lShoul.z) * 0.15

    // ── Smooth all transforms ────────────────────────────────────────────
    if (!smoothPos) {
      smoothPos   = targetPos.clone()
      smoothScale = finalScale.clone()
      smoothRotZ  = targetRotZ
      smoothRotY  = targetRotY
    } else {
      smoothPos.lerp(targetPos, POS_LERP)
      smoothScale.lerp(finalScale, SCALE_LERP)
      smoothRotZ += (targetRotZ - smoothRotZ) * ROT_LERP
      smoothRotY += (targetRotY - smoothRotY) * ROT_LERP
    }

    // ── Back-facing detection with hysteresis ────────────────────────────
    if (!isFacingBack && conf < BACK_ENTER_TH) {
      isFacingBack = true
    } else if (isFacingBack && conf > BACK_EXIT_TH) {
      isFacingBack = false
    }
    if (isFacingBack !== prevFacingBack) {
      // SNAP: reset rotY so there's no lerp animation across the flip
      smoothRotY     = 0
      prevFacingBack = isFacingBack
    }

    // ── Apply transform to the ACTIVE group ──────────────────────────────
    // Both groups share position and scale; only rotation differs.
    const activeGroup    = isFacingBack ? clothingBack  : clothingFront
    const inactiveGroup  = isFacingBack ? clothingFront : clothingBack
    const activeMeshData = isFacingBack ? meshDataBack  : meshDataFront

    inactiveGroup.visible = false
    activeGroup.visible   = true

    activeGroup.position.copy(smoothPos)
    activeGroup.scale.copy(smoothScale)

    if (isFacingBack) {
      // SNAP to 180° Y → back faces now face the camera.
      // FrontSide culling on clothingBack meshes will correctly render them.
      activeGroup.rotation.set(0, Math.PI, smoothRotZ)
    } else {
      // Quaternion compose: qZ (shoulder tilt) × qY (body turn depth)
      const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), smoothRotY)
      const qZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), smoothRotZ)
      activeGroup.quaternion.multiplyQuaternions(qZ, qY)
    }

    // ── Skirt spring physics ─────────────────────────────────────────────
    const hipX    = hipMid.x
    const rawVelX = hipX - lastHipX
    lastHipX = hipX
    hipVelX  = hipVelX * 0.7 + rawVelX * 0.3

    const springForce = -SPRING_K * skirtOffsetX
    const damping     = -SPRING_D * skirtVelX
    skirtVelX    += springForce + damping - hipVelX * 0.4
    skirtOffsetX += skirtVelX
    skirtOffsetX  = Math.max(-0.15, Math.min(0.15, skirtOffsetX))

    // Force world matrices to update BEFORE vertex deform uses them
    activeGroup.updateMatrixWorld(true)

    // ── Vertex deformation (only on the active group) ────────────────────
    deformArms(
      THREE, activeMeshData,
      lShoul, lElbow, lWrist,
      rShoul, rElbow, rWrist,
      skirtOffsetX, sleeveStrength.value, modelHeight
    )

    onStatus?.('tracking', isFacingBack ? '↩ Đang xem lưng áo' : '✓ Đang tracking')
  }

  return { updateClothing }
}
