
export interface User {
  id: number;           
  full_name: string;    
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
}


// Interface cho response chuẩn từ API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}