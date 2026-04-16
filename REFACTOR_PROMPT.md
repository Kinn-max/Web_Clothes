Tôi có một Vue 3 component FittingRoom.vue dùng Three.js + MediaPipe cho tính năng thử đồ ảo (virtual fitting room). File hiện tại ~600 dòng, tất cả logic trong 1 file duy nhất. Hãy refactor theo cấu trúc sau:

## Yêu cầu cấu trúc

src/
├── views/
│   └── FittingRoom.vue          # Chỉ template + gọi composables, <50 dòng
├── composables/
│   ├── useThreeScene.js         # Init Three.js: scene, camera, renderer, lighting
│   ├── useGLBModel.js           # Load GLB, buildVertexZones, DoubleSide material
│   ├── useMediaPipe.js          # Init PoseLandmarker, detectForVideo
│   ├── useClothingTransform.js  # updateClothing, smooth pos/scale/rot, back-facing detect
│   ├── useArmDeform.js          # deformArms, deformSleeve, smoothstep, skirt physics
│   └── useFittingControls.js   # scaleX, scaleY, offsetY, sleeveStrength, resetControls
├── components/fitting/
│   ├── SizeControlPanel.vue     # UI slider panel bên phải
│   ├── StatusBadge.vue          # Badge tracking/ready + confidence + fps
│   ├── GuideOverlay.vue         # Khung dashed guide khi status=ready
│   └── CaptureButton.vue        # Nút chụp ảnh + flash effect
└── utils/
    ├── landmarkToWorld.js       # hàm lmToWorld, avgVisibility
    └── capturePhoto.js          # hàm composite video + canvas rồi download

## Yêu cầu kỹ thuật

1. Tất cả CSS scoped xóa hết, thay bằng Tailwind classes thuần
2. Các transition Vue (fade, flash, slide-right) dùng Tailwind + headlessui hoặc class binding thay vì <style scoped>
3. Mỗi composable export các ref và function cần thiết, không import chéo lẫn nhau trừ utils
4. useClothingTransform nhận vào các ref từ useFittingControls làm tham số thay vì import trực tiếp
5. Back-facing detection: khi isFacingBack thay đổi thì SNAP ngay (không animate), dùng clothing.rotation.set(0, Math.PI, smoothRotZ) không cộng smoothRotY
6. Giữ nguyên toàn bộ logic hiện tại: hysteresis back-facing, skirt spring physics, sleeve deform, size sliders

## Code hiện tại

[paste toàn bộ nội dung FittingRoom.vue vào đây]

## Output mong muốn

Xuất từng file một theo đúng cấu trúc trên, mỗi file đầy đủ code có thể chạy được ngay.
## Yêu cầu thêm: README.md

Tạo thêm file `src/features/fitting/README.md` mô tả:

### Nội dung README cần có:

1. **Cấu trúc thư mục** dạng tree đầy đủ với mô tả ngắn mỗi file

2. **Data flow diagram** dạng ASCII art hoặc mermaid showing:
   - FittingRoom.vue → composables → utils
   - Luồng data: webcam → MediaPipe → landmarks → ClothingTransform → Three.js render

3. **Mỗi composable** ghi rõ:
   - Mục đích
   - Input params
   - Exported refs & functions
   - Ví dụ usage

4. **Mỗi component** ghi rõ:
   - Props
   - Emits
   - Slot (nếu có)

5. **Setup & chạy local**:
   - Dependencies cần cài (three, @mediapipe/tasks-vision, v.v.)
   - File GLB để ở đâu (public/)
   - Lệnh dev/build

6. **Các biến có thể tune** (threshold, const):
   - BACK_ENTER_TH, BACK_EXIT_TH
   - SPRING_K, SPRING_D
   - POS_LERP, SCALE_LERP, ROT_LERP
   - sleeveMinLocal multiplier
   Ghi rõ ý nghĩa và gợi ý giá trị nên dùng

Format: Markdown chuẩn, dùng heading ##/###, code block cho ví dụ, mermaid block cho diagram.