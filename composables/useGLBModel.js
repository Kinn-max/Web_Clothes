/**
 * useGLBModel – Load GLB, auto-split into front/back mesh groups,
 *               classify vertex zones for deformation.
 *
 * Split strategy: at load time two independent THREE.Group objects are
 * built from cloned geometries, each with FrontSide culling.
 *   clothingFront → shown when person faces the camera
 *   clothingBack  → shown when person turns their back (rotation.y = Math.PI applied
 *                   by useClothingTransform, which causes the back faces to face camera)
 *
 * Vertex zone classification (shared for both groups):
 *   0 = body (torso)
 *   1 = left sleeve
 *   2 = right sleeve
 *   3 = skirt / hem
 */
export function useGLBModel() {
  let clothing      = null   // original gltf.scene (kept hidden, used as source)
  let clothingFront = null   // active group for front view
  let clothingBack  = null   // active group for back view
  let modelHeight   = 1
  let meshDataFront = []
  let meshDataBack  = []

  /**
   * Load GLB, center it, then build front/back groups.
   *
   * @param {object} THREE
   * @param {object} scene  - THREE.Scene
   * @param {object} cbs    - { onProgress(ratio), onLoaded(), onError(err) }
   */
  async function loadModel(THREE, scene, { onProgress, onLoaded, onError } = {}) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

    return new Promise((resolve) => {
      const loader = new GLTFLoader()
      loader.load(
        '/chinese_clothing.glb',
        (gltf) => {
          clothing = gltf.scene

          // Center the model
          const box = new THREE.Box3().setFromObject(clothing)
          modelHeight = box.max.y - box.min.y
          const modelCenter = new THREE.Vector3()
          box.getCenter(modelCenter)
          clothing.position.sub(modelCenter)
          clothing.updateMatrixWorld(true)

          // Build the two render groups and populate meshData arrays
          buildFrontBackGroups(THREE, scene)

          // Original clothing object is no longer needed for rendering
          clothing.visible = false

          onLoaded?.()
          resolve()
        },
        (xhr) => {
          if (xhr.total > 0) onProgress?.(xhr.loaded / xhr.total)
        },
        (err) => {
          console.error('GLB load error:', err)
          onError?.(err)
          resolve()
        }
      )
    })
  }

  /**
   * Traverse the loaded clothing, clone each mesh's geometry into front & back
   * copies, set FrontSide culling, classify vertex zones, and add both groups
   * to the scene.
   */
  function buildFrontBackGroups(THREE, scene) {
    if (!clothing) return

    clothingFront = new THREE.Group()
    clothingBack  = new THREE.Group()
    meshDataFront = []
    meshDataBack  = []

    clothing.traverse((node) => {
      if (!node.isMesh) return

      const geo = node.geometry
      if (!geo?.attributes?.position) return

      const mats = Array.isArray(node.material) ? node.material : [node.material]

      // Clone geometry independently so front/back can be deformed separately
      const geoF = geo.clone()
      const geoB = geo.clone()

      // FrontSide culling: each group shows only outward-facing triangles.
      // clothingBack will have rotation.y = Math.PI applied by useClothingTransform,
      // causing its back faces to face the camera – FrontSide correctly shows those.
      const matF = mats.map(m => { const c = m.clone(); c.side = THREE.FrontSide; return c })
      const matB = mats.map(m => { const c = m.clone(); c.side = THREE.FrontSide; return c })

      const meshF = new THREE.Mesh(geoF, matF.length === 1 ? matF[0] : matF)
      const meshB = new THREE.Mesh(geoB, matB.length === 1 ? matB[0] : matB)

      meshF.frustumCulled = false
      meshB.frustumCulled = false

      // Preserve each child node's local transform within the parent group.
      // Parent group position/rotation is managed by useClothingTransform.
      meshF.matrix.copy(node.matrix)
      meshF.matrixAutoUpdate = false
      meshB.matrix.copy(node.matrix)
      meshB.matrixAutoUpdate = false

      clothingFront.add(meshF)
      clothingBack.add(meshB)

      // ── Vertex zone classification ──────────────────────────────────────
      const posAttrF = geoF.attributes.position
      const posAttrB = geoB.attributes.position
      const count    = posAttrF.count

      geoF.computeBoundingBox()
      const lb  = geoF.boundingBox
      const lH  = lb.max.y - lb.min.y
      const lW  = lb.max.x - lb.min.x
      const lcx = (lb.min.x + lb.max.x) / 2

      const skirtTopLocal  = lb.min.y + lH * 0.42
      const sleeveMinLocal = lW * 0.15

      const zonesF = new Uint8Array(count)
      const zonesB = new Uint8Array(count)
      const tmpV   = new THREE.Vector3()

      for (let i = 0; i < count; i++) {
        tmpV.fromBufferAttribute(posAttrF, i)
        const lx = tmpV.x - lcx
        const ly = tmpV.y

        let z
        if      (ly < skirtTopLocal)       z = 3  // skirt
        else if (lx < -sleeveMinLocal)     z = 1  // left sleeve
        else if (lx >  sleeveMinLocal)     z = 2  // right sleeve
        else                               z = 0  // body

        zonesF[i] = z
        zonesB[i] = z
      }

      meshDataFront.push({
        node: meshF,
        origPos: new Float32Array(posAttrF.array),
        zones: zonesF,
        posAttr: posAttrF,
      })
      meshDataBack.push({
        node: meshB,
        origPos: new Float32Array(posAttrB.array),
        zones: zonesB,
        posAttr: posAttrB,
      })
    })

    scene.add(clothingFront)
    scene.add(clothingBack)

    // Both hidden until tracking starts
    clothingFront.visible = false
    clothingBack.visible  = false
  }

  return {
    getClothingFront:  () => clothingFront,
    getClothingBack:   () => clothingBack,
    getModelHeight:    () => modelHeight,
    getMeshDataFront:  () => meshDataFront,
    getMeshDataBack:   () => meshDataBack,
    loadModel,
  }
}
