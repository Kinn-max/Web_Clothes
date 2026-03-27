<script setup lang="ts">
const props = defineProps<{
  images: string[];
  selectedImage: string;
  imageBaseUrl: string;
}>();

const emit = defineEmits<{
  "update:selectedImage": [value: string];
}>();

const getImageUrl = (imgName: string) => {
  if (!imgName) return "https://placehold.co/600x600?text=No+Image";
  return imgName.startsWith("http") ? imgName : `${props.imageBaseUrl}/${imgName}`;
};
</script>

<template>
  <div class="lg:sticky lg:top-24 self-start">
    <div class="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm mb-4">
      <img :src="getImageUrl(selectedImage)" class="w-full h-full object-cover" alt="Product" />
    </div>
    <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <div
        v-for="img in images"
        :key="img"
        @click="emit('update:selectedImage', img)"
        :class="[
          'w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 flex-shrink-0',
          img === selectedImage 
            ? 'border-glow-primary-500 opacity-100 shadow-md scale-100' 
            : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-glow-primary-300'
        ]"
      >
        <img :src="getImageUrl(img)" class="w-full h-full object-cover" alt="Thumbnail" />
      </div>
    </div>
  </div>
</template>
