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

const { width, height } = Dimensions.get('window');
const IMAGE_MAX_WIDTH = Math.min(width * 0.8, 350);
const DOT_SIZE = 6;

type Slide = {
  key: string;
  image: any;
  title: string;
  subtitle: string;
};

const slides: Slide[] = [
  {
    key: '1',
    image: require('../assets/onboard1.png'),
    title: '나무를 심어서 나의 맛집을 알려요',
    subtitle: '지도 위에 맛집을 심어 두고,\n친구들과 함께 공유할 수 있어요.',
  },
  {
    key: '2',
    image: require('../assets/onboard2.png'),
    title: '친구의 나무를 구경하고 방문해요',
    subtitle: '친구가 심어 둔 나무를 구경하고,\n직접 방문해 새로운 추억을 쌓아보세요.',
  },
  {
    key: '3',
    image: require('../assets/onboard2.png'),
    title: "내가 방문한 친구의 '맛집나무'에 물을 줘요",
    subtitle: '친구의 맛집나무에 물을 주며\n서로의 취향과 일상을 나눌 수 있어요.',
  },
];

function OnboardingSlide({ slide }: { slide: Slide }) {
  const src = Image.resolveAssetSource(slide.image);
  const ratio = src?.width && src?.height ? src.width / src.height : 1;

  const imgW = IMAGE_MAX_WIDTH;
  const imgH = imgW / ratio;

  return (
    <View style={styles.slidePage}>
      <View style={[styles.imageBox, { width: imgW, height: imgH }]}>
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
}

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const flatRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfig = { viewAreaCoveragePercentThreshold: 50 };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        {/* 🔼 위쪽: 슬라이드 이미지 */}
        <View style={styles.sliderArea}>
          <FlatList
            ref={flatRef}
            data={slides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.key}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewConfig}
            renderItem={({ item }) => <OnboardingSlide slide={item} />}
          />
        </View>

        {/* 📌 아래 고정 높이 bottom sheet (dot + 텍스트 + 버튼 포함) */}
        <View style={styles.overlayCard}>
          {/* 위쪽 영역: dot + 제목 + 서브텍스트 */}
          <View style={styles.topTextArea}>
            <View style={styles.dotsRow}>
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

            <Text style={styles.cardText}>{currentSlide.title}</Text>
            <Text style={styles.cardSubtitle}>{currentSlide.subtitle}</Text>
          </View>

          {/* 아래 영역: 버튼 */}
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              label="로그인"
              onPress={() => navigation.replace('Login')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  page: { flex: 1 },

  // 🔼 이미지 슬라이드 영역
  sliderArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  slidePage: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },

  // 🔽 고정 높이 bottom sheet
  overlayCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    paddingTop: 25,
    paddingHorizontal: 24,
    paddingBottom: 24,

    // 👉 여기서 전체 높이를 고정 (휴대폰 화면의 38% 정도)
    height: height * 0.38,
  },

  // 위쪽 텍스트 영역 (남은 공간 채우기)
  topTextArea: {
    flex: 1,
  },

  // dot row
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotActive: { backgroundColor: '#111' },
  dotInactive: { backgroundColor: '#D9D9D9' },

  cardText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#111',
    lineHeight: 32,
  },

  cardSubtitle: {
    fontSize: 17,
    color: '#555',
    marginTop: 15,
    lineHeight: 23,
  },

  // 버튼은 카드의 아래쪽에 고정 느낌
  buttonWrapper: {
    marginTop: 16,
  },
});
