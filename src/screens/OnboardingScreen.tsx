// 파일: src/screens/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import PrimaryButton from '../components/PrimaryButton';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  ViewToken,
} from 'react-native';

const { width } = Dimensions.get('window');

const DOT_SIZE = 6;
// 중앙 이미지 최대 너비(원본비 유지). 필요시 0.7 → 0.6/0.8로 조절하세요.
const IMAGE_MAX_WIDTH = Math.min(width * 0.7, 320);

type Slide = {
  key: string;
  image: any;
  title: string;
};

const slides: Slide[] = [
  {
    key: '1',
    image: require('../assets/onboard1.png'),
    title: '친구에게 추천해주고      싶은 맛집을 지도에 심어요',
  },
  {
    key: '2',
    image: require('../assets/onboard2.png'),
    title: '내 친구가 심은 나무를   구경하고 방문해요',
  },
  {
    key: '3',
    image: require('../assets/onboard2.png'), // 2,3 동일 이미지
    title: "내가 방문한 친구의 '맛집나무'에 물을 줘요",
  },
];

type Props = { navigation: any };

function OnboardingSlide({
  slide,
  currentIndex,
  navigation,
}: {
  slide: Slide;
  currentIndex: number;
  navigation: any;
}) {
  // 원본 비율 계산(가로/세로)
  const src = Image.resolveAssetSource(slide.image);
  const aspectRatio =
    src && src.width && src.height ? src.width / src.height : 1;

  // 이미지 실제 렌더 크기 계산
  const imageW = IMAGE_MAX_WIDTH;
  const imageH = Math.round(imageW / (aspectRatio || 1));
  const cardH = Math.round(imageH * (1 / 3)); // 아랫부분 1/3 덮기

  return (
    <View style={styles.page}>
      {/* 상단: 중앙에 이미지(작게) */}
      <View style={styles.topArea}>
        <View style={[styles.imageBox, { width: imageW, height: imageH }]}>
          <Image
            source={slide.image}
            style={styles.image}
            resizeMode="contain"
          />

          {/* 글 박스(이미지 아랫부분 1/3 덮기) - 도트는 박스 안 맨 위 */}
          <View style={[styles.overlayCard, { height: cardH }]}>
            <View style={styles.dotsInCardRow}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.cardText} numberOfLines={3}>
              {slide.title}
            </Text>
          </View>
        </View>
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.bottomArea}>
        <PrimaryButton
          label="로그인"
          onPress={() => navigation.replace('Login')}
        />
      </View>
    </View>
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  const flatRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <OnboardingSlide
            slide={item}
            currentIndex={currentIndex}
            navigation={navigation}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  page: {
    width,
    flex: 1,
    backgroundColor: '#fff',
  },

  /* 이미지가 화면 정중앙에 오도록 */
  topArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // 세로/가로 중앙
    paddingHorizontal: 24,
  },

  imageBox: {
    position: 'relative',
    borderRadius: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: { width: '100%', height: '100%' },

  /* 이미지 아랫부분 1/3을 덮는 글 박스 (내부 상단에 도트) */
  overlayCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    paddingHorizontal: 2,
    paddingTop: 20,
    paddingBottom: 14,
    justifyContent: 'flex-start',
    elevation: 2,
  },

  /* 카드 안 도트 */
  dotsInCardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20, // 도트 아래 텍스트 여백
    gap: 8,
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginHorizontal: 1,
  },
  dotActive: { backgroundColor: '#111' },
  dotInactive: { backgroundColor: '#D9D9D9' },

  cardText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111',
    textAlign: 'left',
    lineHeight: 33,     
    paddingTop: 10,
    marginTop: 4,
  },

  /* 하단 버튼 */
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
});
