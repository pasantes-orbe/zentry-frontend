export interface CountryInteface {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  locality?: string;
  phone?: string;
  avatar?: string;
  image?: string;
  isActive?: boolean;

  perimeter_points?: { lat: number; lng: number }[]; // <--- nuevo
}
