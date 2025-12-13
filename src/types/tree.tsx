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

export interface Restaurant {
  treeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  treeType: number;

  // ✅ 배열/문자열 둘 다 허용
  review: string | string[];

  tags: string[];
  createdAt: string;
  updatedAt: string;
  recommendationCount: number;
  images: string[];

  // ✅ 서버에서 내려오는 추가 필드들(옵셔널로)
  nickname?: string;
  profileImageUrl?: string;
}

