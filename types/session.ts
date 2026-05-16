
export interface SessionSummary {
  id: number;
  title: string;
  updated_at: string;
}

export interface SessionDetail {
  id: number;
  title: string;
  messages: {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    suggested_products?: string;
    image_url?:string;
    created_at: string;
  }[];
}