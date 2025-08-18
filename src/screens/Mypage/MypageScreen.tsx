// src/screens/MyPageScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Chip from '../../components/Chip';

// SVG 아이콘
import SettingsIcon from '../../assets/icons/setting.svg';
import PencilIcon from '../../assets/icons/edit-pen.svg';
import BookmarkIcon from '../../assets/icons/bookmark.svg';

import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getMyTree, getUser, getFollwerList, getFollowingList } from '../../apis/api/user';

// PNG 리소스
const avatar = require('../../assets/image/profile.png');
const treeImg = require('../../assets/image/mytree.png');
const treeicon = require('../../assets/extree.png');
const grooNameIcon = require('../../assets/groo_name_icon.png');
const grooPictureIcon = require('../../assets/groo_picture_icon.png');

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 14;
const CARD_RADIUS = 16;
const HIGHLIGHT_CARD_SIZE = SCREEN_W - H_MARGIN * 2;

type TreeItemT = { id: string; name: string; meta: string };

export default function MyPageScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // 서버 닉네임
  const [nickname, setNickname] = useState<string>('');

  // 서버 카운트
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  // 프로필(로컬 편집용)
  const [profile, setProfile] = useState({
    intro: '',
    mbti: null as string | null,
    styles: [] as string[],
    foods: [] as string[],
  });

  // 샘플 리스트
  const plantedBase: TreeItemT[] = useMemo(
    () => [
      { id: 'p1', name: '특별식당', meta: '39m  서울특별시 동대문구' },
      { id: 'p2', name: '돈까스 발전소', meta: '10m  서울특별시 동대문구' },
    ],
    []
  );
  const wateredBase: TreeItemT[] = useMemo(
    () => [
      { id: 'w1', name: '효이당', meta: '98m  서울특별시 성북구' },
      { id: 'w2', name: '해마루', meta: '76m  서울특별시 동대문구' },
    ],
    []
  );

  const [plantedList, setPlantedList] = useState<TreeItemT[]>(plantedBase);
  const [plantedVisible, setPlantedVisible] = useState(2);
  const [wateredList, setWateredList] = useState<TreeItemT[]>(wateredBase);
  const [wateredVisible, setWateredVisible] = useState(2);

  const openProfileEdit = () => {
    navigation.navigate('ProfileEdit', {
      mbti: profile.mbti,
      styles: profile.styles,
      foods: profile.foods,
      intro: profile.intro,
      onSave: (data: { intro: string; mbti: string | null; styles: string[]; foods: string[] }) => {
        setProfile(data);
      },
    });
  };

  const appendMore = (list: TreeItemT[]): TreeItemT[] => {
    const suffix = '_' + Math.random().toString(36).slice(2, 6);
    const clones = list.map((it, idx) => ({ ...it, id: it.id + suffix + '_' + idx }));
    return [...list, ...clones];
  };

  // 하이라이트 카드(배경만 다름)
  const highlightSlides = [
    { id: 'main', colors: ['#F4F4F4', '#BDEABC'] },
    { id: 'alt', colors: ['#F4F4F4', '#EABCD2'] },
  ];

  // 공용 로더(닉네임 + 팔로워/팔로잉 수)
  const loadProfileAndCounts = useCallback(async () => {
    try {
      const me = await getUser(); // { id, nickname, ... }
      if (me?.nickname) setNickname(me.nickname);

      const userId = me?.id;
      if (userId) {
        const [followersRes, followingRes] = await Promise.all([
          getFollwerList(),        // /users/me/followers
          getFollowingList(userId) // /users/{id}/following
        ]);

        const followersLen = Array.isArray(followersRes)
          ? followersRes.length
          : (followersRes?.items?.length ?? 0);
        const followingLen = Array.isArray(followingRes)
          ? followingRes.length
          : (followingRes?.items?.length ?? 0);

        setFollowerCount(followersLen);
        setFollowingCount(followingLen);
      }
    } catch (e) {
      console.error('프로필/팔로우 카운트 로드 실패:', e);
    }
  }, []);

  // 최초 로그인 상태 감지 시 로드
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        console.warn('로그인된 사용자가 없습니다.');
        return;
      }
      loadProfileAndCounts();
      // 원한다면 여기서 심은 나무 개수도 별도로 세팅 가능
      try {
        const trees = await getMyTree();
        console.log('getMyTree:', trees);
      } catch (e) {
        console.error('내 나무를 불러오지 못했습니다:', e);
      }
    });
    return unsubscribe;
  }, [loadProfileAndCounts]);
  


  // 화면 재진입 시 최신값으로 리프레시
  useFocusEffect(
    useCallback(() => {
      loadProfileAndCounts();
    }, [loadProfileAndCounts])
  );

  // 팔로워/팔로잉 리스트로 이동
  const openFollowList = (initialTab: 'followers' | 'following') => {
    navigation.navigate('FollowList', { initialTab });
  };

  return (
    <SafeAreaView style={[styles.root, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.brandWrap}>
          <Image source={grooPictureIcon} style={styles.brandPic} />
          <Image source={grooNameIcon} style={styles.brandName} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}} accessibilityLabel="북마크">
            <BookmarkIcon width={30} height={30} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}} accessibilityLabel="설정">
            <SettingsIcon width={30} height={30} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* 프로필 카드 */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={openProfileEdit}
            style={styles.editFab}
            accessibilityLabel="프로필 수정"
            activeOpacity={0.8}
          >
            <PencilIcon width={23} height={23} />
          </TouchableOpacity>

          <View style={styles.profileRow}>
            <Image source={avatar} style={styles.avatar} />
            <View style={styles.profileRight}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{nickname || '닉네임'}</Text>
              </View>

              <Text style={styles.bio}>
                {profile.intro && profile.intro.trim().length > 0
                  ? profile.intro
                  : '한줄소개로 나를 설명해보세요!'}
              </Text>

              <View style={styles.divider} />

              {/* 통계줄: 심은 나무 / 팔로워 / 팔로잉 */}
              <View style={styles.statsRowSimple}>
                <View style={styles.statCol}>
                  <Text style={styles.statValText}>201</Text>
                  <Text style={styles.statKeyText}>심은 나무</Text>
                </View>

                <TouchableOpacity
                  style={styles.statCol}
                  activeOpacity={0.7}
                  onPress={() => openFollowList('followers')}
                >
                  <Text style={styles.statValText}>{followerCount}</Text>
                  <Text style={styles.statKeyText}>팔로워</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statCol}
                  activeOpacity={0.7}
                  onPress={() => openFollowList('following')}
                >
                  <Text style={styles.statValText}>{followingCount}</Text>
                  <Text style={styles.statKeyText}>팔로잉</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.chipsRow}>
            {profile.styles.map(s => (
              <Chip key={`style-${s}`} label={s} variant="style" selected />
            ))}
            {profile.foods.map(f => (
              <Chip key={`food-${f}`} label={f} variant="food" selected />
            ))}
            {profile.mbti ? <Chip label={profile.mbti} variant="mbti" selected /> : null}
          </View>
        </View>

        {/* 하이라이트 카드 - 가로 스크롤 */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightTray}
        >
          {highlightSlides.map(slide => (
            <View key={slide.id} style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
              <LinearGradient
                colors={slide.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.highlightTextBox}>
                <View style={styles.titleWrap}>
                  <Text style={styles.highlightTitleLine}>
                    가장 큰 나무는 <Text style={styles.highlightEm}>카페 브레송</Text>의
                  </Text>
                  <Text style={styles.highlightTitleLine}>
                    <Text style={styles.highlightEm}>182M</Text> 아름드리 나무예요!
                  </Text>
                </View>

                <TouchableOpacity style={styles.highlightCta} activeOpacity={0.9} onPress={() => {}}>
                  <Text style={styles.highlightCtaText}>보러가기</Text>
                  <Text style={styles.highlightCtaArrow}>›</Text>
                </TouchableOpacity>
              </View>

              <Image source={treeImg} style={styles.highlightTree} />
            </View>
          ))}
        </ScrollView>

        {/* 리스트들 */}
        <Section
          title="내가 심은 나무"
          data={plantedList.slice(0, plantedVisible)}
          onMore={() => {
            if (plantedVisible < plantedList.length) {
              setPlantedVisible(v => Math.min(v + 2, plantedList.length));
            } else {
              const extended = appendMore(plantedList);
              setPlantedList(extended);
              setPlantedVisible(v => Math.min(v + 2, extended.length));
            }
          }}
        />

        <Section
          title="내가 물 준 나무"
          data={wateredList.slice(0, wateredVisible)}
          onMore={() => {
            if (wateredVisible < wateredList.length) {
              setWateredVisible(v => Math.min(v + 2, wateredList.length));
            } else {
              const extended = appendMore(wateredList);
              setWateredList(extended);
              setWateredVisible(v => Math.min(v + 2, extended.length));
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/** 개별 나무 카드 */
function TreeCard({ item }: { item: TreeItemT }) {
  return (
    <View style={styles.treeCard}>
      <Image source={treeicon} style={styles.treeIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.treeName}>{item.name}</Text>
        <Text style={styles.treeMeta}>{item.meta}</Text>
      </View>
      <Text style={styles.dotMenu}>⋮</Text>
    </View>
  );
}

/** 섹션 */
function Section({
  title,
  data,
  onMore,
}: {
  title: string;
  data: TreeItemT[];
  onMore: () => void;
}) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
          <Text style={styles.sortText}>높이순</Text>
          <Text style={styles.sortChevron}>▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionBody}>
        {data.map(it => (
          <TreeCard key={it.id} item={it} />
        ))}

        <TouchableOpacity style={styles.moreBtn} onPress={onMore} activeOpacity={0.85}>
          <Text style={styles.moreBtnText}>내역 더보기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },

  /* 헤더 */
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  brandName: { width: 60, height: 23, resizeMode: 'contain' },
  brandPic: { width: 60, height: 23, resizeMode: 'contain' },
  headerRight: { marginLeft: 'auto', flexDirection: 'row', gap: 5 },
  iconBtn: { padding: 5, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  /* 프로필 카드 */
  card: {
    marginHorizontal: H_MARGIN,
    backgroundColor: '#F6F6F8',
    borderRadius: CARD_RADIUS,
    padding: 16,
    elevation: 3,
    position: 'relative',
    marginBottom: 15,
  },
  editFab: { position: 'absolute', top: 10, right: 10, padding: 6, borderRadius: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 95, height: 95, borderRadius: 50, backgroundColor: '#E7E7E7' },
  profileRight: { flex: 1, marginLeft: 25 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline' },
  name: { fontSize: 18, fontWeight: '600', color: '#111' },
  bio: { marginTop: 8, color: '#4B4B4B', fontSize: 16 },
  divider: { height: RNStyleSheet.hairlineWidth, backgroundColor: '#D4D4D4', marginTop: 10, marginBottom: 8 },

  /* 간결한 3열 통계 */
  statsRowSimple: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statValText: { fontSize: 13, fontWeight: '600', color: '#111' },
  statKeyText: { fontSize: 13, color: '#111', marginTop: 3 },

  /* 칩 영역 */
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginTop: 14 },

  /* 하이라이트 트레이 */
  highlightTray: {
    paddingHorizontal: H_MARGIN,
    gap: 14,
  },

  /* 하이라이트 카드 */
  highlightItem: {
    aspectRatio: 1.1,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  },
  highlightTextBox: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  titleWrap: { gap: 6 },
  highlightTitleLine: { fontSize: 22, fontWeight: '700', color: '#111', lineHeight: 26 },
  highlightEm: { color: '#0DBC65' },
  highlightCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },
  highlightCtaText: { fontSize: 13, fontWeight: '600', color: '#333333' },
  highlightCtaArrow: { marginLeft: 6, fontSize: 18, lineHeight: 18, color: '#7C7C7C' },
  highlightTree: { position: 'absolute', right: -8, bottom: -6, width: 300, height: 300, resizeMode: 'contain' },

  /* 섹션 */
  sectionHeader: { marginTop: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '600', color: '#0E0F11', marginLeft: 7 },
  sortBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', padding: 4 },
  sortText: { color: '#737373', fontSize: 15, marginRight: 3 },
  sortChevron: { color: '#737373', fontSize: 15 },

  sectionBody: { marginTop: 15, marginHorizontal: 14 },

  /* 개별 나무 카드 */
  treeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F6F6F8',
    borderRadius: 15,
    marginBottom: 5,
  },
  treeIcon: { width: 45, height: 45, marginRight: 12, resizeMode: 'contain' },
  treeName: { fontSize: 15, fontWeight: '600', color: '#0E0F11' },
  treeMeta: { fontSize: 14, color: '#A0A0A0', marginTop: 4 },
  dotMenu: { marginLeft: 13, fontSize: 25, color: '#949494' },

  /* 더보기 버튼 */
  moreBtn: {
    marginTop: 4,
    marginBottom: 6,
    alignSelf: 'stretch',
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F1F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtnText: { fontSize: 14, color: '#555' },

  /* (기존 리스트 스타일은 미사용) */
  listCard: { display: 'none' },
  treeRow: { display: 'none' },
  treeRowDivider: { display: 'none' },
  treeThumb: { width: 40, height: 40, borderRadius: 8, resizeMode: 'contain' },
  rowChevron: { fontSize: 22, color: '#C2C6CE', paddingHorizontal: 4 },
});
