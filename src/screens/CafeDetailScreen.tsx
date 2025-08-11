// src/screens/CafeDetailScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import PrimaryButton from '../components/PrimaryButton';
import CommentBubble from '../components/CommentBubble';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 355;
const TREE_WIDTH = 300;
const TREE_HEIGHT = 320;
const BUTTON_HEIGHT = 48;
const BUTTON_GAP = 10;

// 파넬 위치/크기
const PANEL_W = 120;
const PANEL_H = 110;
const PANEL_BOTTOM = 60;
const PANEL_SHIFT_X = 110;

type TreeSlide = {
  id: string;
  levelText: string;   // 표지판 1줄
  infoText: string;    // 표지판 2줄 (예: 종·높이)
  img: any;            // require()
};

export default function CafeDetailScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [bookmarked, setBookmarked] = useState(false);
  const [remainPhotos] = useState(11); // 더미
  const totalPhotos = 3 + remainPhotos;

  // 히어로 슬라이드 데이터
  const slides: TreeSlide[] = [
    { id: 't1', levelText: '나무 3단계', infoText: '참나무·13m', img: require('../assets/extree.png') },
    { id: 't2', levelText: '나무 2단계', infoText: '단풍나무·9m', img: require('../assets/extree.png') },
    { id: 't3', levelText: '나무 1단계', infoText: '전나무·5m',  img: require('../assets/extree.png') },
  ];

  const [page, setPage] = useState(0);
  const pagerRef = useRef<ScrollView>(null);

  // 시트가 화면 끝까지 보이도록
  const sheetDynamicStyle = {
    minHeight: height - HERO_HEIGHT + 24,
    paddingBottom: insets.bottom + BUTTON_HEIGHT + BUTTON_GAP + 16,
  };

  const goPhotoDetail = (startIndex: number) => {
    navigation.navigate('PhotoDetail', {
      title: '카페 브레숑',
      startIndex,
      total: totalPhotos,
    });
  };

  const onHeroMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    setPage(idx);
  };

  const goToPage = (idx: number) => {
    pagerRef.current?.scrollTo({ x: width * idx, y: 0, animated: true });
    setPage(idx);
  };

  return (
    <SafeAreaView style={styles.root}>
      <TopBar
        onPressBack={() => navigation.goBack()}
        onPressBookmark={() => setBookmarked(b => !b)}
        bookmarked={bookmarked}
        iconSize={30}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 상단 히어로 */}
        <View style={styles.hero}>
          {/* 배경 */}
          <Image source={require('../assets/dummypic.png')} style={styles.heroBackground} resizeMode="cover" />
          {/* 어두운 오버레이 (항상 아래 레이어) */}
          <View pointerEvents="none" style={styles.heroOverlay} />

          {/* ====== 여기부터 오버레이 위 레이어 ====== */}
          {/* 가로 페이저 */}
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onHeroMomentumEnd}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            style={[StyleSheet.absoluteFill, { zIndex: 3 }]}   // ✅ 오버레이 위
            contentContainerStyle={{ height: HERO_HEIGHT }}
          >
            {slides.map((slide) => (
              <View key={slide.id} style={{ width, height: HERO_HEIGHT, justifyContent: 'flex-end' }}>
                {/* 말풍선 (프로필+댓글) */}
                <CommentBubble
                  name="유냐유냐"
                  text="사장님이 친절해서 좋아요!"
                  style={{ position: 'absolute', top: insets.top + 28, left: 83, zIndex: 4 }} // ✅ 오버레이 위
                />

                {/* 트리 + 나무 판넬 */}
                <View style={styles.treeWrapper}>
                  <Image source={slide.img} style={styles.treeImg} resizeMode="contain" />
                  <View style={styles.panelGroup}>
                    <Image
                      source={require('../assets/wood_panel.png')}
                      style={styles.woodPanelImg}
                      resizeMode="contain"
                    />
                    <View style={styles.signTextBox}>
                      <Text style={styles.signLine1}>{slide.levelText}</Text>
                      <Text style={styles.signLine2}>{slide.infoText}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          {/* ====== 오버레이 위 레이어 끝 ====== */}
        </View>

        {/* 시트 */}
        <View style={[styles.sheet, sheetDynamicStyle]}>
          {/* 페이저 dot */}
          <View style={styles.pagerOnCard}>
            {slides.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => goToPage(idx)}
                activeOpacity={0.8}
                style={[styles.dot, idx === page && styles.activeDot]}
              />
            ))}
          </View>

          {/* 타이틀/주소 */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>카페 브레송</Text>
            <Text style={styles.subTag}>카페</Text>
          </View>
          <Text style={styles.address}>서울 성북구 고려대로24가길 11 2층</Text>

          {/* 사진 그리드 */}
          <View style={styles.imageGrid}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => goPhotoDetail(0)}>
              <Image source={require('../assets/dummypic.png')} style={styles.largeImage} resizeMode="cover" />
            </TouchableOpacity>

            <View style={styles.rightColumn}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => goPhotoDetail(1)}>
                <Image source={require('../assets/dummypic.png')} style={styles.smallImage} resizeMode="cover" />
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={() => goPhotoDetail(2)} style={styles.overlayContainer}>
                <Image source={require('../assets/dummypic.png')} style={styles.smallImage} resizeMode="cover" />
                <View style={styles.plusOverlay}>
                  <Text style={styles.plusText}>+{remainPhotos}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={[styles.actionWrapper, { bottom: insets.bottom + BUTTON_GAP }]}>
        <PrimaryButton label="물주기" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 0 },

  /* 히어로 */
  hero: { height: HERO_HEIGHT, justifyContent: 'flex-end', overflow: 'visible' },
  heroBackground: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', zIndex: 0 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1 }, // ✅ 배경 위

  /* 트리 */
  treeWrapper: {
    position: 'absolute',
    top: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3, // ✅ 오버레이 위
  },
  treeImg: { width: TREE_WIDTH, height: TREE_HEIGHT },

  /* 파넬 */
  panelGroup: {
    position: 'absolute',
    width: PANEL_W,
    height: PANEL_H,
    bottom: PANEL_BOTTOM,
    marginLeft: PANEL_SHIFT_X,
    zIndex: 5, // ✅ 트리 위
  },
  woodPanelImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  signTextBox: {
    position: 'absolute',
    top: Math.round(PANEL_H * 0.245),
    left: Math.round(PANEL_W * 0.22),
    width: Math.round(PANEL_W * 0.6),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6, // ✅ 텍스트 가장 위
  },
  signLine1: { fontSize: 11, fontWeight: '400', color: '#623A0E', fontFamily: 'pannel' },
  signLine2: { fontSize: 12, color: '#623A0E', marginTop: 1.5, fontFamily: 'pannel' },

  /* 시트 */
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 5,
    zIndex: 1,
  },

  /* 페이저 dot */
  pagerOnCard: { alignSelf: 'center', flexDirection: 'row', marginTop: 25, marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D5D5D5', marginHorizontal: 3 },
  activeDot: { backgroundColor: '#3C3C3C' },

  /* 텍스트 */
  titleRow: { flexDirection: 'row', alignItems: 'baseline' },
  title: { fontSize: 20, fontWeight: '600' },
  subTag: { fontSize: 14, marginLeft: 6, color: '#767676', fontWeight: '600' },
  address: { fontSize: 14, color: '#767676', fontWeight: '400', marginTop: 6 },

  /* 사진 */
  imageGrid: { flexDirection: 'row', marginTop: 14 },
  largeImage: { width: (width - 16 * 2) * 0.58, height: 200, borderRadius: 4 },
  rightColumn: { flex: 1, marginLeft: 3, justifyContent: 'space-between' },
  smallImage: { width: '100%', height: 98, borderRadius: 4 },
  overlayContainer: { position: 'relative' },

  plusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4, // ✅ 작은 이미지와 동일
  },
  plusText: { color: '#fff', fontSize: 18, fontWeight: '400' },

  /* 물주기 버튼 (하단 고정) */
  actionWrapper: { position: 'absolute', left: 16, right: 16 },
});
