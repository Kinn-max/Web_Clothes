export interface Garment {
  id: number
  name: string
  description?: string
  cloth_image_url?: string
  cloth_image_public_id?: string
  model_url: string
  public_id: string
  item_index?: number
  store_id?: string
  category_id?: number
  firestore_product_id?: string
  color?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface GarmentCreate {
  name: string
  description?: string
  item_index?: number
  category_id?: number
  store_id?: string
  firestore_product_id?: string
  color?: string
}

export interface GarmentUpdate extends Partial<GarmentCreate> {}
