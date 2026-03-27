<template>
  <div class="map-picker">
    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">
         Chọn vị trí trên bản đồ
      </label>
      <p class="text-sm text-gray-500 mb-2">
        Click vào bản đồ để chọn vị trí chính xác của bạn
      </p>
      
      <!-- Search Address -->
      <div class="flex gap-2 mb-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm địa chỉ (VD: 123 Nguyễn Huệ, Quận 1, HCM)"
          class="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keypress.enter="searchAddress"
        />
        <button
          @click="searchAddress"
          :disabled="isSearching"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isSearching ? 'Đang tìm...' : 'Tìm kiếm' }}
        </button>
      </div>

      <!-- Selected Coordinates Display -->
      <div v-if="selectedPosition" class="p-3 bg-blue-50 rounded-md text-sm">
        <p class="font-medium text-blue-900"> Vị trí đã chọn:</p>
        <p class="text-blue-700">
          Latitude: {{ selectedPosition.lat.toFixed(6) }}, 
          Longitude: {{ selectedPosition.lng.toFixed(6) }}
        </p>
        <p v-if="reverseGeocodeResult" class="text-blue-600 mt-1">
          {{ reverseGeocodeResult }}
        </p>
      </div>
    </div>

    <!-- Map Container -->
    <div 
      ref="mapContainer" 
      class="map-container rounded-lg border-2 border-gray-300"
      style="height: 400px; width: 100%;"
    ></div>

    <!-- Buttons -->
    <div class="mt-4 flex gap-2">
      <button
        @click="getCurrentLocation"
        :disabled="isGettingLocation"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
      >
        {{ isGettingLocation ? 'Đang lấy vị trí...' : 'Vị trí hiện tại' }}
      </button>
      
      <button
        v-if="selectedPosition"
        @click="clearSelection"
        class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
         Xóa vị trí
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Props & Emits
interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  initialLat: null,
  initialLng: null,
});

const emit = defineEmits<{
  (e: 'update:position', value: { lat: number; lng: number } | null): void;
}>();

// State
const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const searchQuery = ref('');
const isSearching = ref(false);
const isGettingLocation = ref(false);
const selectedPosition = ref<{ lat: number; lng: number } | null>(null);
const reverseGeocodeResult = ref('');

// Default center (Ho Chi Minh City)
const defaultCenter = { lat: 10.762622, lng: 106.660172 };

/**
 * Initialize Map
 */
onMounted(() => {
  if (!mapContainer.value) return;

  // Khởi tạo bản đồ
  map = L.map(mapContainer.value).setView(
    [
      props.initialLat || defaultCenter.lat,
      props.initialLng || defaultCenter.lng,
    ],
    props.initialLat ? 15 : 13
  );

  // Thêm tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Nếu có initial position, hiển thị marker
  if (props.initialLat && props.initialLng) {
    selectedPosition.value = {
      lat: props.initialLat,
      lng: props.initialLng,
    };
    addMarker(props.initialLat, props.initialLng);
  }

  // Event: Click vào map để chọn vị trí
  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    selectedPosition.value = { lat, lng };
    addMarker(lat, lng);
    emit('update:position', { lat, lng });
    
    // Reverse geocoding để lấy địa chỉ
    reverseGeocode(lat, lng);
  });
});

/**
 * Add/Update Marker
 */
const addMarker = (lat: number, lng: number) => {
  if (!map) return;

  // Xóa marker cũ nếu có
  if (marker) {
    map.removeLayer(marker);
  }

  // Thêm marker mới
  marker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    }),
  }).addTo(map);

  // Pan to marker
  map.setView([lat, lng], 15);
};

/**
 * Get Current Location
 */
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Trình duyệt không hỗ trợ định vị');
    return;
  }

  isGettingLocation.value = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      selectedPosition.value = { lat: latitude, lng: longitude };
      addMarker(latitude, longitude);
      emit('update:position', { lat: latitude, lng: longitude });
      reverseGeocode(latitude, longitude);
      isGettingLocation.value = false;
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert('Không thể lấy vị trí hiện tại. Vui lòng bật GPS và cấp quyền truy cập.');
      isGettingLocation.value = false;
    }
  );
};

/**
 * Search Address using Nominatim
 */
const searchAddress = async () => {
  if (!searchQuery.value.trim()) return;

  isSearching.value = true;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&q=${encodeURIComponent(searchQuery.value)}&limit=1`
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      selectedPosition.value = { lat: latitude, lng: longitude };
      addMarker(latitude, longitude);
      emit('update:position', { lat: latitude, lng: longitude });
      reverseGeocodeResult.value = display_name;
    } else {
      alert('Không tìm thấy địa chỉ. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Search error:', error);
    alert('Lỗi khi tìm kiếm địa chỉ');
  } finally {
    isSearching.value = false;
  }
};

/**
 * Reverse Geocoding (Coordinates → Address)
 */
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&lat=${lat}&lon=${lng}`
    );

    const data = await response.json();
    if (data && data.display_name) {
      reverseGeocodeResult.value = data.display_name;
    }
  } catch (error) {
    console.error('Reverse geocode error:', error);
  }
};

/**
 * Clear Selection
 */
const clearSelection = () => {
  selectedPosition.value = null;
  reverseGeocodeResult.value = '';
  emit('update:position', null);

  if (marker && map) {
    map.removeLayer(marker);
    marker = null;
  }
};

/**
 * Cleanup
 */
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  z-index: 1;
}

/* Fix Leaflet icon paths issue */
:deep(.leaflet-default-icon-path) {
  background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png');
}
</style>