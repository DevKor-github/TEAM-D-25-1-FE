// src/apis/utils/treeImage.tsx

// 추천 수 → 레벨 (1/2/3)
export const getTreeLevel = (recommendationCount: number): 1 | 2 | 3 => {
  const n = Number(recommendationCount ?? 0);
  if (n >= 50) return 3;
  if (n >= 20) return 2;
  return 1;
};

// treeType(0/1) + level(1/2/3) → 로컬 PNG 매핑
const TREE_MARKER_MAP: Record<string, any> = {
  // treeType === 0 → tree0_*
  '0_1': require('../../assets/trees/tree0_1.png'),
  '0_2': require('../../assets/trees/tree0_2.png'),
  '0_3': require('../../assets/trees/tree0_3.png'),

  // treeType === 1 → tree1_*
  '1_1': require('../../assets/trees/tree1_1.png'),
  '1_2': require('../../assets/trees/tree1_2.png'),
  '1_3': require('../../assets/trees/tree1_3.png'),
};

export const getTreeMarkerImage = (treeType: number, level: 1 | 2 | 3) => {
  const type01 = treeType === 1 ? 1 : 0; // ✅ 혹시 이상값 오면 0으로 폴백
  const key = `${type01}_${level}`;
  return TREE_MARKER_MAP[key] ?? TREE_MARKER_MAP['0_1'];
};

export const getTreeName = (treeType: number): string => {
  return treeType === 1 ? '전나무' : '참나무';
};
