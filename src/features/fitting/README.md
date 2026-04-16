# Virtual Fitting Room

AR-style virtual try-on powered by Three.js + MediaPipe PoseLandmarker.

---

## Cấu trúc thư mục

```
pages/
└── fitting-room.vue          # Entry point – template + composable wiring 

composables/
├── useThreeScene.js          # Three.js scene, camera, renderer, lights
├── useGLBModel.js            # GLB loader, vertex zone classification, DoubleSide
├── useMediaPipe.js           # PoseLandmarker init, per-frame detection
├── useFittingControls.js     # Reactive sliders: scaleX/Y, offsetY, sleeveStrength
├── useClothingTransform.js   # Position/scale/rotation smoothing, back-facing, skirt
└── useArmDeform.js           # Sleeve & skirt vertex deformation (pure computation)

components/fitting/
├── StatusBadge.vue           # tracking/ready badge + confidence% + fps
├── GuideOverlay.vue          # Dashed guide frame shown when status=ready
├── SizeControlPanel.vue      # Collapsible slider panel (right side)
└── CaptureButton.vue         # Shutter button + flash trigger

utils/
├── landmarkToWorld.js        # lmToWorld(), avgVisibility()
└── capturePhoto.js           # Composite video + canvas → PNG download
```

---

## Data flow

```mermaid
flowchart TD
    CAM[Webcam<br>getUserMedia] --> VID[video element]
    VID --> MP[useMediaPipe<br>detectForVideo]
    MP -->|landmarks[]| CT[useClothingTransform<br>updateClothing]
    CT -->|lmToWorld| U1[utils/landmarkToWorld]
    CT -->|deformArms| AD[useArmDeform]
    AD -->|meshData| GLB[useGLBModel<br>vertex buffer]
    CT -->|position/scale/rotation| CLO[clothing Object3D]
    CLO --> TS[useThreeScene<br>renderer.render]
    TS --> CNV[canvas overlay]

    FC[useFittingControls<br>scaleX/Y offsetY sleeve] -->|refs as params| CT
```

### Luồng chi tiết

```
getUserMedia → <video>
    ↓ every frame (requestAnimationFrame)
useMediaPipe.detectForVideo(video)
    ↓ PoseLandmarkerResult.landmarks[0]
useClothingTransform.updateClothing({ THREE, clothing, ... })
    ├─ lmToWorld() → shoulder/hip/elbow/wrist in world space
    ├─ avgVisibility() → confidence, back-facing hysteresis
    ├─ lerp pos / scale / rotZ + rotY
    ├─ skirt spring physics (hipVelX → skirtOffsetX)
    └─ useArmDeform.deformArms() → posAttr.needsUpdate = true
useThreeScene.render() → WebGLRenderer.render(scene, camera)
```

---

## Composables

### `useThreeScene()`

**Mục đích:** Khởi tạo và quản lý Three.js scene, camera, renderer, và đèn.

**Input params:** none (pass `canvasEl` vào `initThree`)

**Exported:**
| Symbol | Type | Mô tả |
|--------|------|--------|
| `initThree(canvasEl)` | async fn | Tạo scene/camera/renderer/lights |
| `onResize()` | fn | Cập nhật aspect ratio & renderer size |
| `render()` | fn | Gọi `renderer.render(scene, camera)` |
| `dispose()` | fn | Giải phóng WebGL resources |
| `getThree()` | fn → module | Three.js module (sau khi initThree) |
| `getScene()` | fn → Scene | |
| `getCamera()` | fn → Camera | |
| `getRenderer()` | fn → Renderer | |

**Usage:**
```js
const ts = useThreeScene()
await ts.initThree(canvasEl.value)
ts.render() // gọi mỗi frame
```

---

### `useGLBModel()`

**Mục đích:** Load file GLB, tự động tách thành `clothingFront` + `clothingBack`, classify vertex zones.

**Tách mesh tự động khi load:**
- `clothingFront` – THREE.Group với FrontSide culling; hiển thị khi người dùng đứng hướng mặt
- `clothingBack`  – THREE.Group với FrontSide culling; hiển thị khi người quay lưng
  (`useClothingTransform` áp `rotation.y = Math.PI` → back faces quay về phía camera)
- Mỗi group có geometry clone riêng → deformation độc lập

**Exported:**
| Symbol | Type | Mô tả |
|--------|------|--------|
| `loadModel(THREE, scene, cbs)` | async fn | Load GLB + gọi `buildFrontBackGroups` |
| `getClothingFront()` | fn → Group | |
| `getClothingBack()` | fn → Group | |
| `getModelHeight()` | fn → number | |
| `getMeshDataFront()` | fn → Array | `[{ node, origPos, zones, posAttr }]` cho front |
| `getMeshDataBack()` | fn → Array | `[{ node, origPos, zones, posAttr }]` cho back |

**Callbacks cho `loadModel`:**
```js
await glbModel.loadModel(THREE, scene, {
  onProgress: (ratio) => { /* 0–1 */ },
  onLoaded:   () => { /* done */ },
  onError:    (err) => { /* fallback */ },
})
```

---

### `useMediaPipe()`

**Mục đích:** Khởi tạo PoseLandmarker (full → lite fallback), detect pose per frame.

**Exported:**
| Symbol | Mô tả |
|--------|--------|
| `initMediaPipe({ onStatus })` | async, loads WASM + model |
| `detectForVideo(video)` | Trả về `result` hoặc `null` nếu same frame |
| `close()` | Giải phóng landmarker |

**Usage:**
```js
const mp = useMediaPipe()
await mp.initMediaPipe({ onStatus: ({ text, pct }) => { ... } })

// trong render loop:
const result = mp.detectForVideo(videoEl.value)
if (result?.landmarks?.length) { /* ... */ }
```

---

### `useFittingControls()`

**Mục đích:** Reactive refs cho các slider điều chỉnh kích thước.

**Exported:**
| Ref | Default | Range |
|-----|---------|-------|
| `showControls` | `true` | boolean |
| `scaleX` | `1.0` | 0.5–2.0 |
| `scaleY` | `1.0` | 0.5–2.0 |
| `offsetY` | `0.0` | -0.5–0.5 |
| `sleeveStrength` | `0.75` | 0.0–1.0 |
| `resetControls()` | – | reset về default |

---

### `useArmDeform()`

**Mục đích:** Vertex deformation cho tay áo (sleeve) và váy (skirt). Pure computation, không có Vue state.

**Exported:**
```ts
deformArms(
  THREE, meshData,
  lShoul, lElbow, lWrist,   // THREE.Vector3 – left arm
  rShoul, rElbow, rWrist,   // THREE.Vector3 – right arm
  skirtSwayX: number,       // lateral offset from spring physics
  sleeveStrength: number,   // blend 0–1
  modelHeight: number
)
```

Reuses vectors frame-to-frame để tránh GC pressure.

---

### `useClothingTransform({ scaleX, scaleY, offsetY, sleeveStrength })`

**Mục đích:** Tính toán và áp dụng transform cho clothing mesh mỗi frame.

**Input params:** Refs từ `useFittingControls` (không import trực tiếp).

**Exported:**
```ts
updateClothing({
  THREE, clothing, modelHeight, landmarks,
  deformArms, meshData,
  onStatus: (status, text) => void,
  onConfidence: (value) => void,
})
```

**Internal state (not exported):**
- `smoothPos`, `smoothScale`, `smoothRotZ`, `smoothRotY` – lerped each frame
- `isFacingBack`, `prevFacingBack` – hysteresis state
- `skirtVelX`, `skirtOffsetX`, `lastHipX`, `hipVelX` – spring physics

---

## Components

### `StatusBadge.vue`

| Prop | Type | Mô tả |
|------|------|--------|
| `status` | String | `'loading'` \| `'ready'` \| `'tracking'` |
| `statusText` | String | Label hiển thị |
| `confidence` | Number | 0–1, ẩn khi = 0 |
| `fps` | Number | |

Không có emits, không có slots.

---

### `GuideOverlay.vue`

| Prop | Type | Mô tả |
|------|------|--------|
| `show` | Boolean | Hiện khi `status === 'ready'` |

Fade transition tích hợp.

---

### `SizeControlPanel.vue`

| Prop | Type | Mô tả |
|------|------|--------|
| `visible` | Boolean | Hiện khi `status !== 'loading'` |
| `scaleX` | Number | |
| `scaleY` | Number | |
| `offsetY` | Number | |
| `sleeveStrength` | Number | |

| Emit | Payload | |
|------|---------|--|
| `update:scaleX` | number | |
| `update:scaleY` | number | |
| `update:offsetY` | number | |
| `update:sleeveStrength` | number | |
| `reset` | – | |

Toggle collapse nội bộ (state `open` trong component).

---

### `CaptureButton.vue`

| Prop | Type | Mô tả |
|------|------|--------|
| `disabled` | Boolean | True khi `status !== 'tracking'` |

| Emit | |
|------|--|
| `capture` | Khi bấm nút |

---

## Setup & chạy local

### Dependencies

```bash
npm install three @mediapipe/tasks-vision
# Tailwind đã có sẵn trong dự án Nuxt
```

### GLB model

Đặt file model vào:
```
public/chinese_clothing.glb
```

### Lệnh dev/build

```bash
npm run dev    # dev server http://localhost:3000
npm run build  # production build
```

Truy cập `/fitting-room` trong trình duyệt.

---

## Các biến có thể tune

### Back-facing detection (`useClothingTransform.js`)

| Const | Default | Mô tả |
|-------|---------|--------|
| `BACK_ENTER_TH` | `0.25` | Vào back-mode khi `avgVisibility < 0.25`. Giảm → nhạy hơn (dễ trigger), tăng → ổn định hơn |
| `BACK_EXIT_TH` | `0.45` | Ra back-mode khi `avgVisibility > 0.45`. Hysteresis gap = 0.20, giảm gap → flicker nhiều hơn |

**Gợi ý:** Giữ gap `EXIT - ENTER ≥ 0.15` để tránh flicker.

---

### Smooth lerp factors (`useClothingTransform.js`)

| Const | Default | Mô tả |
|-------|---------|--------|
| `POS_LERP` | `0.18` | Vị trí. Tăng → follow nhanh hơn, rung nhiều hơn |
| `SCALE_LERP` | `0.15` | Scale. Giảm → scale thay đổi mượt hơn |
| `ROT_LERP` | `0.12` | Rotation. Tăng nếu clothing lag khi người nghiêng vai |

---

### Skirt spring physics (`useClothingTransform.js`)

| Const | Default | Mô tả |
|-------|---------|--------|
| `SPRING_K` | `0.08` | Stiffness. Tăng → váy nảy về nhanh hơn |
| `SPRING_D` | `0.75` | Damping. Tăng → tắt dần nhanh (ít lắc lư) |

**Gợi ý:** `SPRING_K=0.05, SPRING_D=0.8` cho váy mượt mà hơn; `SPRING_K=0.15, SPRING_D=0.5` cho hiệu ứng vải nảy.

---

### Sleeve deformation (`useArmDeform.js`)

`sleeveMinLocal = lW * 0.15` trong `useGLBModel.buildVertexZones`:
- Multiplier `0.15` xác định vùng "body" vs "sleeve"
- Giảm → nhiều vertices thuộc sleeve hơn (deform xa hơn từ center)
- Tăng → sleeve nhỏ hơn, deform ít hơn

`smoothstep(0.05, 0.95, t)` trong `useArmDeform.deformSleeve`:
- Blend ramp từ shoulder đến wrist
- Điều chỉnh `0.05` / `0.95` để thay đổi vùng bắt đầu/kết thúc blend
