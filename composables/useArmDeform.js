/**
 * useArmDeform – Vertex deformation for sleeves and skirt spring physics.
 * Pure computation – no Vue state.
 */
export function useArmDeform() {
  // Reuse vectors across frames to avoid GC pressure
  let _tmpAxis = null, _tmpProj = null
  let _tmpVtx  = null, _tmpDisp = null, _tmpTarget = null, _tmpRef = null

  function smoothstep(a, b, t) {
    const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
    return x * x * (3 - 2 * x)
  }

  /**
   * Compute displacement for one sleeve vertex toward the arm bone chain.
   * Returns the reused _tmpDisp vector (copy before next call if needed).
   */
  function deformSleeve(THREE, ox, oy, oz, shoulder, elbow, wrist, blendStrength) {
    if (!_tmpAxis) {
      _tmpAxis   = new THREE.Vector3()
      _tmpProj   = new THREE.Vector3()
      _tmpVtx    = new THREE.Vector3()
      _tmpDisp   = new THREE.Vector3()
      _tmpTarget = new THREE.Vector3()
      _tmpRef    = new THREE.Vector3()
    }

    _tmpVtx.set(ox, oy, oz)

    const upperLen = shoulder.distanceTo(elbow)
    const lowerLen = elbow.distanceTo(wrist)

    _tmpAxis.subVectors(wrist, shoulder)
    const totalLen = _tmpAxis.length()
    if (totalLen < 0.001) return _tmpDisp.set(0, 0, 0)

    _tmpAxis.normalize()
    _tmpProj.subVectors(_tmpVtx, shoulder)
    const t    = Math.max(0, Math.min(1, _tmpProj.dot(_tmpAxis) / totalLen))
    const tMid = upperLen / (upperLen + lowerLen)

    if (t <= tMid) {
      _tmpTarget.lerpVectors(shoulder, elbow, t / tMid)
    } else {
      _tmpTarget.lerpVectors(elbow, wrist, (t - tMid) / (1 - tMid))
    }

    _tmpRef.copy(shoulder).addScaledVector(_tmpAxis, _tmpProj.dot(_tmpAxis))
    _tmpRef.copy(shoulder).addScaledVector(_tmpAxis, t * totalLen)
    _tmpDisp.subVectors(_tmpTarget, _tmpRef)

    const w = smoothstep(0.05, 0.95, t)
    _tmpDisp.multiplyScalar(w * blendStrength)

    return _tmpDisp
  }

  /**
   * Deform all sleeve/skirt vertices toward landmark positions.
   *
   * @param {object}   THREE
   * @param {Array}    meshData       - from useGLBModel
   * @param {Vector3}  lShoul/lElbow/lWrist  - left arm world positions
   * @param {Vector3}  rShoul/rElbow/rWrist  - right arm world positions
   * @param {number}   skirtSwayX     - skirt lateral sway offset (world)
   * @param {number}   sleeveStrength - blend factor 0–1
   * @param {number}   modelHeight    - GLB model height for sway scaling
   */
  function deformArms(THREE, meshData, lShoul, lElbow, lWrist, rShoul, rElbow, rWrist, skirtSwayX, sleeveStrength, modelHeight) {
    if (!meshData || meshData.length === 0) return

    for (const { node, origPos, zones, posAttr } of meshData) {
      node.updateWorldMatrix(true, false)
      const invNode = new THREE.Matrix4().copy(node.matrixWorld).invert()

      // Transform landmarks to node-local space
      const lsN = lShoul.clone().applyMatrix4(invNode)
      const leN = lElbow.clone().applyMatrix4(invNode)
      const lwN = lWrist.clone().applyMatrix4(invNode)
      const rsN = rShoul.clone().applyMatrix4(invNode)
      const reN = rElbow.clone().applyMatrix4(invNode)
      const rwN = rWrist.clone().applyMatrix4(invNode)

      const arr   = posAttr.array
      let changed = false

      for (let i = 0; i < zones.length; i++) {
        const zone = zones[i]
        const ox   = origPos[i * 3]
        const oy   = origPos[i * 3 + 1]
        const oz   = origPos[i * 3 + 2]

        if (zone === 1) {
          const dx = deformSleeve(THREE, ox, oy, oz, lsN, leN, lwN, sleeveStrength)
          arr[i * 3]     = ox + dx.x
          arr[i * 3 + 1] = oy + dx.y
          arr[i * 3 + 2] = oz + dx.z
          changed = true
        } else if (zone === 2) {
          const dx = deformSleeve(THREE, ox, oy, oz, rsN, reN, rwN, sleeveStrength)
          arr[i * 3]     = ox + dx.x
          arr[i * 3 + 1] = oy + dx.y
          arr[i * 3 + 2] = oz + dx.z
          changed = true
        } else if (zone === 3) {
          const swayScale = (oy < -0.1) ? 1.0 : 0.3
          arr[i * 3]     = ox + skirtSwayX * swayScale * (modelHeight * 0.3)
          arr[i * 3 + 1] = oy
          arr[i * 3 + 2] = oz
          changed = true
        } else {
          arr[i * 3]     = ox
          arr[i * 3 + 1] = oy
          arr[i * 3 + 2] = oz
        }
      }

      if (changed) {
        posAttr.needsUpdate = true
        node.geometry.computeVertexNormals()
      }
    }
  }

  return { deformArms }
}
