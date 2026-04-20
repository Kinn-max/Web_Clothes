/**
 * useThreeScene – Init Three.js: scene, camera, renderer, lighting.
 * Call initThree(canvasEl) once, then use getters to access objects.
 */
export function useThreeScene() {
  let THREE    = null
  let scene    = null
  let camera   = null
  let renderer = null

  async function initThree(canvasEl) {
    THREE = await import('three')

    const w = window.innerWidth
    const h = window.innerHeight

    scene  = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(55, w / h, 0.01, 100)
    camera.position.set(0, 0, 2.2)

    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled   = false
    renderer.outputColorSpace    = THREE.SRGBColorSpace
    renderer.toneMapping         = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    const hemi = new THREE.HemisphereLight(0xffeedd, 0x223355, 1.2)
    scene.add(hemi)

    const key = new THREE.DirectionalLight(0xfff5e0, 1.6)
    key.position.set(1.5, 3, 3)
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xaaccff, 0.5)
    fill.position.set(-2, 1, 1)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffffff, 0.4)
    rim.position.set(0, -2, -3)
    scene.add(rim)
  }

  function onResize() {
    if (!camera || !renderer) return
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  function render() {
    renderer?.render(scene, camera)
  }

  function dispose() {
    renderer?.dispose()
  }

  return {
    getThree:    () => THREE,
    getScene:    () => scene,
    getCamera:   () => camera,
    getRenderer: () => renderer,
    initThree,
    onResize,
    render,
    dispose,
  }
}
