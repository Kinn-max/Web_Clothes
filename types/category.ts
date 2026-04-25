export interface GarmentCategory {
  id: number
  name: string
  description?: string
  is_deleted: boolean
  created_at: string
}

export interface CategoryCreate {
  name: string
  description?: string
}

export interface CategoryUpdate extends Partial<CategoryCreate> {}
