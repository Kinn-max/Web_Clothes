export interface Store {
  id: string;          
  name: string;
  address_detail: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  managerId?: string;   
  createdAt?: any;
  updatedAt?: any;
}