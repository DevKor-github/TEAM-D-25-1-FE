export interface Tree {
  treeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  treeType: number;
  review: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  recommendationCount: number;
  images: string[];
  
}

export interface Restaruant {
  treeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  treeType: number;
  review: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  recommendationCount: number;
  images: string[];
}
