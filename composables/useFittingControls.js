import { ref } from 'vue'

/**
 * useFittingControls – Reactive refs for size/position sliders + reset.
 */
export function useFittingControls() {
  const showControls   = ref(true)
  const scaleX         = ref(1.0)
  const scaleY         = ref(1.0)
  const offsetY        = ref(0.0)
  const sleeveStrength = ref(0.75)

  function resetControls() {
    scaleX.value         = 1.0
    scaleY.value         = 1.0
    offsetY.value        = 0.0
    sleeveStrength.value = 0.75
  }

  return { showControls, scaleX, scaleY, offsetY, sleeveStrength, resetControls }
}
