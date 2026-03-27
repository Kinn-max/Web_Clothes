// composables/useAcne.ts
import { ref } from 'vue';

/* ================= TYPES ================= */

export interface AcneRegionResult {
  has_acne: boolean;
  confidence: number;
  severity: string;
}

export interface AcneSummary {
  total_regions: number;
  acne_regions: number;
  clear_regions: number;
  overall_severity: string;
  average_confidence: number;
  severity_count: Record<string, number>;
}

export interface AcneAdviceItem {
  region: string;
  severity: string;
  recommendation: string;
}

export interface AcneOverall {
  severity: string;
  recommendation: string;
  need_doctor: boolean;
}

export interface AcneDetectResponse {
  success: boolean;
  data: {
    regions: Record<string, AcneRegionResult>;
    summary: AcneSummary;
    advice: AcneAdviceItem[];
    overall: AcneOverall;
  };
}
export const useAcne = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const regions = ref<Record<string, AcneRegionResult> | null>(null);
  const summary = ref<AcneSummary | null>(null);
  const advice = ref<AcneAdviceItem[]>([]);
  const overall = ref<AcneOverall | null>(null);

  const detectAcne = async (file: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await $fetch<AcneDetectResponse>(
        'http://localhost:8000/acne/detect',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.success) {
        throw new Error('Acne detection failed');
      }

      regions.value = response.data.regions;
      summary.value = response.data.summary;
      advice.value = response.data.advice;
      overall.value = response.data.overall;
    } catch (err: any) {
      console.error(err);
      error.value =
        err?.data?.error ||
        err?.message ||
        'Không thể phân tích ảnh mụn';
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    regions.value = null;
    summary.value = null;
    advice.value = [];
    overall.value = null;
    error.value = null;
  };

  return {
    loading,
    error,
    regions,
    summary,
    advice,
    overall,
    detectAcne,
    reset,
  };
};
