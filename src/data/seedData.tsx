const seedData = [
  {
    seedId: 0,
    name: '참나무 씨앗', // Oak Seed
    image: require('../assets/real_tree0_2.png'), // 상대 경로 주의: 이 파일 기준
    image_description: require('../assets/real_tree0_growing.png'),
    description:
      '참나무는 도토리가 열리는 나무예요. 느리게 자라지만 뿌리가 깊고 수백 년을 살 수 있을 만큼 오래 가요.',
  },
  {
    seedId: 1,
    name: '전나무 씨앗', // Conifer Seed
    image: require('../assets/real_tree1_2.png'),
    image_description: require('../assets/real_tree1_growing.png'),

    description:
      '전나무는 늘푸른 바늘잎을 가진 나무예요. 곧게 자라며 향기가 좋아요. 뿌리가 얕아 강한 바람에는 쉽게 쓰러질 수 있지만, 추운 지역에서도 잘 자라고 사계절 내내 푸른 잎을 간직해요.',
  },
  // {
  //   seedId: 2,
  //   name: '향나무 씨앗', // Juniper Seed (or similar evergreen)
  //   image: require('../assets/oak_Tree.png'),
  //   description:
  //     '향나무는 도토리가 열리는 나무예요. 느리게 자라지만 뿌리가 깊고 수백 년을 살 수 있을 만큼 오래 가요.',
  // },
  // {
  //   seedId: 3,
  //   name: '벚꽃나무 씨앗', // Cherry Blossom Seed
  //   image: require('../assets/oak_Tree.png'),
  //   description:
  //     '벚꽃나무는 도토리가 열리는 나무예요. 느리게 자라지만 뿌리가 깊고 수백 년을 살 수 있을 만큼 오래 가요.',
  // },
  // {
  //   seedId: 4,
  //   name: '단풍나무 씨앗', // Maple Seed
  //   image: require('../assets/oak_Tree.png'),
  //   description:
  //     '단풍나무는 도토리가 열리는 나무예요. 느리게 자라지만 뿌리가 깊고 수백 년을 살 수 있을 만큼 오래 가요.',
  // },
  // 필요에 따라 더 많은 씨앗 데이터 추가
];

export default seedData; // 데이터를 export 합니다.
