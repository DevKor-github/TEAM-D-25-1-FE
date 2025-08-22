export const getTreeList = (
  rawTree: {
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
    user?: {
      id: string;
      nickname?: string;
      profileImageUrl?: string;
    };
  }[],
) => {
  return rawTree.map(
    ({
      treeId,
      name,
      address,
      latitude,
      longitude,
      treeType,
      review,
      tags,
      createdAt,
      updatedAt,
      recommendationCount,
      images,
      user,
    }) => {
      return {
        treeId: treeId,
        name: name,
        address: address,
        latitude:
          typeof latitude === 'string' ? parseFloat(latitude) : latitude,
        longitude:
          typeof longitude === 'string' ? parseFloat(longitude) : longitude,
        treeType: treeType,
        review: review,
        tags: tags,
        createdAt: createdAt,
        updatedAt: updatedAt,
        recommendationCount: recommendationCount,
        images: images,
        userId: user?.id,
        nickname: user?.nickname,
        profileImageUrl: user?.profileImageUrl,
      };
    },
  );
};


export const getRestaruantList = (
  rawTree: {
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
    user: {
      id: string;
      nickname?: string; 
    };
  }[],
) => {
  return rawTree.map(
    ({
      treeId,
      name,
      address,
      latitude,
      longitude,
      treeType,
      review,
      tags,
      createdAt,
      updatedAt,
      recommendationCount,
      images,
      user,
    }) => {
      return {
        treeId: treeId,
        name: name,
        address: address,
        latitude:
          typeof latitude === 'string' ? parseFloat(latitude) : latitude,
        longitude:
          typeof longitude === 'string' ? parseFloat(longitude) : longitude,
        treeType: treeType,
        review: review,
        tags: tags,
        createdAt: createdAt,
        updatedAt: updatedAt,
        recommendationCount: recommendationCount,
        images: images,
        nickname: user?.nickname,
      };
    },
  );
};


