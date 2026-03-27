<script setup lang="ts">
import type { ShippingStatus } from "@/@type/shipping";

interface Props {
  status: ShippingStatus;
}

const props = defineProps<Props>();

const statusConfig: Record<
ShippingStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Chờ xử lý", color: "text-gray-700", bg: "bg-gray-100" },
  confirmed: { label: "Đã xác nhận", color: "text-blue-700", bg: "bg-blue-100" },
  preparing: {
    label: "Đang chuẩn bị",
    color: "text-indigo-700",
    bg: "bg-indigo-100",
  },
  ready_to_ship: {
    label: "Sẵn sàng giao",
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
  picking_up: {
    label: "Đang lấy hàng",
    color: "text-cyan-700",
    bg: "bg-cyan-100",
  },
  picked_up: {
    label: "Đã lấy hàng",
    color: "text-teal-700",
    bg: "bg-teal-100",
  },
  in_transit: {
    label: "Đang vận chuyển",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  out_for_delivery: {
    label: "Đang giao hàng",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  delivered: {
    label: "Đã giao hàng",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  failed: {
    label: "Giao thất bại",
    color: "text-red-700",
    bg: "bg-red-100",
  },
  returning: { label: "Đang hoàn trả", color: "text-red-700", bg: "bg-red-100" },
  returned: { label: "Đã hoàn trả", color: "text-red-700", bg: "bg-red-100" },
  cancelled: { label: "Đã hủy", color: "text-gray-700", bg: "bg-gray-100" },
};

const config = computed(() => statusConfig[props.status]);
</script>

<template>
  <span
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
    :class="[config.color, config.bg]"
  >
    {{ config.label }}
  </span>
</template>