// src/screens/CafeDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import TopBar from '../components/TopBar';
import PrimaryButton from '../components/PrimaryButton';

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = 16;
const HERO_HEIGHT = 360;

export default function CafeDetailScreen() {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <TopBar
        onPressBack={() => {
          // navigation.goBack();
        }}
        onPressBookmark={() => setBookmarked(b => !b)}
        bookmarked={bookmarked}
        iconSize={26}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 히어로 영역 */}
        <View style={styles.hero}>
          <Image
            source={require('../assets/dummypic.png')}
            style={styles.heroBackground}
            resizeMode="cover"
          />

          {/* 트리 + 우드 패널(표지판) */}
          <View style={styles.treeWrapper}>
            {/* 트리 */}
            <Image
              source={require('../assets/extree.png')}
              style={styles.treeImg}
              resizeMode="contain"
            />
            {/* 우드 패널 이미지 */}
            <Image
              source={require('../assets/wood_panel.png')}
              style={styles.woodPanelImg}
              resizeMode="contain"
            />
            {/* 표지판 텍스트 */}
            <View style={styles.signTextBox}>
              <Text style={styles.signLine1}>나무 3단계</Text>
              <Text style={styles.signLine2}>참나무 · 13m</Text>
            </View>
          </View>

          {/* 페이지 도트 */}
          <View style={styles.pager}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* 하얀 시트: 화면 아래까지 꽉 차게 */}
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>카페 브레숑</Text>
            <Text style={styles.subTag}>카페</Text>
          </View>
          <Text style={styles.address}>서울 성북구 고려대로24가길 11 2층</Text>

          {/* 사진 그리드 */}
          <View style={styles.imageGrid}>
            <Image
              source={require('../assets/dummypic.png')}
              style={styles.largeImage}
              resizeMode="cover"
            />
            <View style={styles.rightColumn}>
              <Image
                source={require('../assets/dummypic.png')}
                style={styles.smallImage}
                resizeMode="cover"
              />
              <View style={styles.overlayContainer}>
                <Image
                  source={require('../assets/dummypic.png')}
                  style={styles.smallImage}
                  resizeMode="cover"
                />
                <View style={styles.plusBadge}>
                  <Text style={styles.plusText}>+11</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 시트 내부 여백 (하단 버튼과 겹치지 않게) */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/*  PrimaryButton 사용 - 물주기*/}
      <View style={styles.actionWrapper}>
        <PrimaryButton
          label="물주기"
          onPress={() => {
            // 물주기 로직
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 150, // 하단 버튼 여유
  },
  hero: {
    height: HERO_HEIGHT,
    justifyContent: 'flex-end',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.80,
  },

  /** 트리 & 표지판 */
  treeWrapper: {
    position: 'absolute',
    top: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  treeImg: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  woodPanelImg: {
    position: 'absolute',
    width: 100,
    height: 100,
    right: width * 0.2, // 기기 폭 기준으로 살짝 오른쪽에
    bottom: -156,
  },
  signTextBox: {
    position: 'absolute',
    right: width * 0.285,
    bottom: 8,
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signLine1: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a3a24',
  },
  signLine2: {
    fontSize: 11,
    color: '#4a3a24',
    marginTop: 2,
  },

  /** 도트 */
  pager: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5D5D5',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#3C3C3C',
  },

  /** 하얀 시트(카드 역할) */
  sheet: {
    marginTop: -34, // 히어로와 겹치게
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
    padding: 16,
    // 화면 아래까지 꽉 차도록 최소 높이 보장
    minHeight: height - HERO_HEIGHT + 34,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subTag: {
    fontSize: 13,
    marginLeft: 6,
    color: '#7A7A7A',
    fontWeight: '600',
  },
  address: {
    fontSize: 13,
    color: '#8B8B8B',
    marginTop: 6,
  },

  /** 사진 그리드 */
  imageGrid: {
    flexDirection: 'row',
    marginTop: 14,
  },
  largeImage: {
    width: (width - CARD_MARGIN * 2) * 0.62,
    height: 118,
    borderRadius: 10,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'space-between',
  },
  smallImage: {
    width: '100%',
    height: 56,
    borderRadius: 10,
  },
  overlayContainer: {
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  plusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  /** 하단 버튼 */
  actionWrapper: {
    position: 'absolute',
    left: CARD_MARGIN,
    right: CARD_MARGIN,
    bottom: 26,
  },
});
