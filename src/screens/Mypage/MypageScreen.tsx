// file: src/screens/MyPageScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image, ScrollView,
  TouchableOpacity, StyleSheet as RNStyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Chip from '../../components/Chip';

// SVG 아이콘
import SettingsIcon from '../../assets/icons/setting.svg';
import PencilIcon from '../../assets/icons/edit-pen.svg';
import BookmarkIcon from '../../assets/icons/bookmark.svg';
import BasicProfileIcon from '../../assets/basic_profile.svg';

import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getMyTree, getUser, getFollwerList, getFollowingList } from '../../apis/api/user';

// PNG 리소스
const treeImg = require('../../assets/image/mytree.png'); // 폴백 이미지
const treeicon = require('../../assets/extree.png');
const grooNameIcon = require('../../assets/groo_name_icon.png');
const grooPictureIcon = require('../../assets/groo_picture_icon.png');

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 14;
const CARD_RADIUS = 16;
const HIGHLIGHT_CARD_SIZE = SCREEN_W - H_MARGIN * 2;

// ✅ 카드별 단순 폴백 문구
const FALLBACKS = {
  topCard: {
    message: '나만의 나무를 심어보아요',
  },
  recap: {
    message: '나만의 정원을 꾸며보아요!',
  },
};

type TreeItemT = { id: string; name: string; meta: string };

// myTrees / wateredTrees 원소 타입(대략)
type MyTree = {
  restaurantId?: string;
  restaurantName?: string;
  recommendationCount?: number;
  recommandationCount?: number;
  location?: string;
};

export default function MyPageScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // 서버 표기값
  const [nickname, setNickname] = useState<string>('');
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [treeCount, setTreeCount] = useState<number>(0);

  // ✅ 서버의 프로필 이미지 URL (없으면 null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // 1번 하이라이트(초록 글씨만 동적)
  const [topTree, setTopTree] = useState<{ name: string; count: number } | null>(null);

  // 2번 하이라이트(리캡): 폴백 문구가 보이도록 초기값은 빈 문자열
  const [recap, setRecap] = useState<{ messageEm: string; messageRest: string; imageUrl?: string; }>(
    { messageEm: '', messageRest: '' }
  );

  // 프로필(로컬 편집 미리보기 포함)
  const [profile, setProfile] = useState({
    intro: '',                 // 서버 description
    mbti: null as string | null,
    styles: [] as string[],
    foods: [] as string[],
  });

  // ✅ 내가 심은 나무 / 물 준 나무
  const [plantedList, setPlantedList] = useState<TreeItemT[]>([]);
  const [plantedVisible, setPlantedVisible] = useState(2);

  const [wateredList, setWateredList] = useState<TreeItemT[]>([]);
  const [wateredVisible, setWateredVisible] = useState(2);

  const openProfileEdit = () => {
    navigation.navigate('ProfileEdit', {
      mbti: profile.mbti,
      styles: profile.styles,
      foods: profile.foods,
      intro: profile.intro,
      avatarUri: profileImageUrl, // 미리보기로 현재 URL 넘겨줌
      onSave: (data: {
        intro: string;
        mbti: string | null;
        styles: string[];
        foods: string[];
        avatarUri?: string | null; // 편집 화면에서 로컬파일/URL 모두 가능
      }) => {
        setProfile(prev => ({ ...prev, intro: data.intro, mbti: data.mbti, styles: data.styles, foods: data.foods }));
        // 즉시 미리보기 반영(서버에서 다시 가져오기 전까지)
        if (typeof data.avatarUri !== 'undefined') {
          setProfileImageUrl(data.avatarUri || null);
        }
      },
    });
  };

  // 공통: trees → TreeItemT로 매핑 + 정렬(추천수 desc, 동률이면 원래 순서)
  const mapTreesToItems = (trees: MyTree[] = []): TreeItemT[] => {
    const withIdx = trees.map((t, i) => ({ ...t, __i: i }));
    withIdx.sort((a: any, b: any) => {
      const ca = Number(a.recommendationCount ?? a.recommandationCount ?? 0);
      const cb = Number(b.recommendationCount ?? b.recommandationCount ?? 0);
      if (cb !== ca) return cb - ca; // desc
      return a.__i - b.__i;          // 안정적 동률 처리
    });
    return withIdx.map((t: any) => {
      const count = Number(t.recommendationCount ?? t.recommandationCount ?? 0);
      const metaParts = [
        isNaN(count) ? '' : `${count}M`,
        t.location || '',
      ].filter(Boolean);
      return {
        id: t.restaurantId ?? `tree-${t.__i}`,
        name: t.restaurantName ?? '이름없음',
        meta: metaParts.join('  '),
      };
    });
  };

  // myTrees에서 추천수 최댓값(동률이면 앞) 선택
  const pickTopTree = (trees: MyTree[]): { name: string; count: number } | null => {
    if (!Array.isArray(trees) || trees.length === 0) return null;
    let bestIdx = 0;
    let bestCount = Number(trees[0]?.recommendationCount ?? trees[0]?.recommandationCount ?? 0);
    for (let i = 1; i < trees.length; i++) {
      const c = Number(trees[i]?.recommendationCount ?? trees[i]?.recommandationCount ?? 0);
      if (c > bestCount) { bestCount = c; bestIdx = i; }
    }
    const name = trees[bestIdx]?.restaurantName ?? '이름없음';
    return { name, count: bestCount };
  };

  // recapMessage → {em, rest}
  const splitRecapMessage = (msg?: string): { em: string; rest: string } => {
    const raw = (msg ?? '').trim();
    if (!raw) return { em: '', rest: '' }; // 폴백 문구를 보여주기 위해 빈 값 유지
    const idx = raw.indexOf('만큼');
    if (idx >= 0) return { em: raw.slice(0, idx).trim(), rest: raw.slice(idx).trim() };
    const tokens = raw.split(/\s+/);
    const em = tokens.slice(0, 2).join(' ');
    const rest = raw.slice(em.length).trim();
    return { em, rest };
  };

  // 데이터 로드
  const loadProfileAndCounts = useCallback(async () => {
    try {
      const me: any = await getUser();

      if (me?.nickname) setNickname(me.nickname);

      // ✅ 한줄소개: 서버 description
      if (typeof me?.description === 'string') {
        setProfile(prev => ({ ...prev, intro: me.description ?? '' }));
      }

      // ✅ 프로필 이미지 URL (키 이름이 다를 가능성 고려)
      const img = (me?.profileImageUrl ?? me?.profileImage ?? '').trim?.() || '';
      setProfileImageUrl(img.length ? img : null);

      const userId = (me?.userId ?? me?.id) as string | undefined;
      const uFollower = typeof me?.followerCount === 'number' ? me.followerCount : undefined;
      const uFollowing = typeof me?.followingCount === 'number' ? me.followingCount : undefined;
      const uTreeCount =
        typeof me?.treeCount === 'number'
          ? me.treeCount
          : Array.isArray(me?.myTrees) ? me.myTrees.length : undefined;

      if (uFollower != null) setFollowerCount(uFollower);
      if (uFollowing != null) setFollowingCount(uFollowing);
      if (uTreeCount != null) setTreeCount(uTreeCount);

      // 내가 심은 나무
      if (Array.isArray(me?.myTrees)) {
        const items = mapTreesToItems(me.myTrees as MyTree[]);
        setPlantedList(items);
        setPlantedVisible(Math.min(2, items.length));
      } else {
        setPlantedList([]);
        setPlantedVisible(0);
      }

      // 내가 물 준 나무
      if (Array.isArray(me?.wateredTrees)) {
        const wItems = mapTreesToItems(me.wateredTrees as MyTree[]);
        setWateredList(wItems);
        setWateredVisible(Math.min(2, wItems.length));
      } else {
        setWateredList([]);
        setWateredVisible(0);
      }

      // 1번 카드용 최상위 나무
      if (Array.isArray(me?.myTrees) && me.myTrees.length > 0) {
        setTopTree(pickTopTree(me.myTrees as MyTree[]));
      } else {
        setTopTree(null);
      }

      // 2번 카드(리캡) 데이터
      if (typeof me?.recapMessage === 'string') {
        const { em, rest } = splitRecapMessage(me.recapMessage);
        setRecap(prev => ({ ...prev, messageEm: em, messageRest: rest }));
      }
      if (typeof me?.recapImageUrl === 'string' && me.recapImageUrl.trim()) {
        setRecap(prev => ({ ...prev, imageUrl: me.recapImageUrl }));
      }

      // 폴백 호출들
      const needFollower = uFollower == null;
      const needFollowing = uFollowing == null;
      const needTreeCount = uTreeCount == null;

      if (userId && (needFollower || needFollowing)) {
        const [followersRes, followingRes] = await Promise.all([
          needFollower ? getFollwerList() : Promise.resolve(null),
          needFollowing ? getFollowingList(userId) : Promise.resolve(null),
        ]);
        if (needFollower) {
          const followersLen = Array.isArray(followersRes) ? followersRes.length : followersRes?.items?.length ?? 0;
          setFollowerCount(followersLen);
        }
        if (needFollowing) {
          const followingLen = Array.isArray(followingRes) ? followingRes.length : followingRes?.items?.length ?? 0;
          setFollowingCount(followingLen);
        }
      }

      if (needTreeCount) {
        try {
          const trees = await getMyTree();
          const len = Array.isArray(trees) ? trees.length : trees?.items?.length ?? 0;
          setTreeCount(len);

          if (Array.isArray(trees)) {
            const items = mapTreesToItems(trees as MyTree[]);
            setPlantedList(items);
            setPlantedVisible(Math.min(2, items.length));

            if (trees.length > 0) setTopTree(pickTopTree(trees as MyTree[]));
          }
        } catch (e) {
          console.error('내 나무 폴백 호출 실패:', e);
        }
      }
    } catch (e) {
      console.error('프로필/팔로우/나무 카운트 로드 실패:', e);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) { console.warn('로그인된 사용자가 없습니다.'); return; }
      loadProfileAndCounts();
    });
    return unsubscribe;
  }, [loadProfileAndCounts]);

  useFocusEffect(
    useCallback(() => {
      loadProfileAndCounts();
    }, [loadProfileAndCounts])
  );

  const openFollowList = (initialTab: 'followers' | 'following') => {
    navigation.navigate('FollowList', { initialTab });
  };

  // 더보기 노출 여부
  const plantedHasMore = plantedVisible < plantedList.length;
  const wateredHasMore = wateredVisible < wateredList.length;

  // 2번 카드에서 외부값 조합(폴백 포함)
  const recapHasText = Boolean((recap.messageEm || '').trim() || (recap.messageRest || '').trim());
  const recapImgSource = recap.imageUrl ? { uri: recap.imageUrl } : treeImg;

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
          <TouchableOpacity onPress={openProfileEdit} style={styles.editFab} accessibilityLabel="프로필 수정" activeOpacity={0.8}>
            <PencilIcon width={23} height={23} />
          </TouchableOpacity>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.avatarImg} />
              ) : (
                <BasicProfileIcon width={50} height={50} />
              )}
            </View>
            <View style={styles.profileRight}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{nickname || '닉네임'}</Text>
              </View>

              {/* ✅ 한줄소개 폴백 문구 */}
              <Text style={styles.bio}>
                {profile.intro?.trim()?.length ? profile.intro : '한줄소개로 나를 표현해보세요!'}
              </Text>

              <View style={styles.divider} />

              {/* 통계줄 */}
              <View style={styles.statsRowSimple}>
                <View style={styles.statCol}>
                  <Text style={styles.statValText}>{treeCount}</Text>
                  <Text style={styles.statKeyText}>심은 나무</Text>
                </View>

                <TouchableOpacity style={styles.statCol} activeOpacity={0.7} onPress={() => openFollowList('followers')}>
                  <Text style={styles.statValText}>{followerCount}</Text>
                  <Text style={styles.statKeyText}>팔로워</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statCol} activeOpacity={0.7} onPress={() => openFollowList('following')}>
                  <Text style={styles.statValText}>{followingCount}</Text>
                  <Text style={styles.statKeyText}>팔로잉</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.chipsRow}>
            {profile.styles.map(s => <Chip key={`style-${s}`} label={s} variant="style" selected />)}
            {profile.foods.map(f => <Chip key={`food-${f}`} label={f} variant="food" selected />)}
            {profile.mbti ? <Chip label={profile.mbti} variant="mbti" selected /> : null}
          </View>
        </View>

        {/* 하이라이트 카드들 */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightTray}>
          {/* 1) 추천수 Top 나무 카드 */}
          <View style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
            <LinearGradient colors={['#F4F4F4', '#BDEABC']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
            {/* 상단 고정 */}
            <View style={styles.topOverlay}>
              {topTree ? (
                <View style={styles.titleWrap}>
                  <Text style={styles.highlightTitleLine}>
                    가장 큰 나무는 <Text style={styles.highlightEm}>{topTree.name}</Text>의
                  </Text>
                  <Text style={styles.highlightTitleLine}>
                    <Text style={styles.highlightEm}>{String(topTree.count)}</Text>M 아름드리 나무예요!
                  </Text>
                </View>
              ) : (
                // ✅ 데이터 없을 때의 단순 폴백 문구
                <Text style={styles.fallbackTitle}>{FALLBACKS.topCard.message}</Text>
              )}
            </View>
            <Image source={treeImg} style={styles.highlightTree} />
          </View>

          {/* 2) 리캡 카드 */}
          <View style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
            <LinearGradient colors={['#F4F4F4', '#F6D4E3']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <View style={styles.recapTopOverlay}>
              {recapHasText ? (
                <>
                  <Text style={styles.recapTitle}>
                    <Text style={styles.highlightEm}>{recap.messageEm}</Text>
                    {recap.messageRest ? ' ' : ''}
                    {recap.messageRest?.split('\n').map((seg, idx) => (
                      <Text key={idx}>{idx === 0 ? seg : `\n${seg}`}</Text>
                    ))}
                  </Text>
                  <Text style={styles.recapSubtitle}>심은 나무: {Number.isFinite(treeCount) ? treeCount : 0}그루</Text>
                </>
              ) : (
                // ✅ 데이터 없을 때의 단순 폴백 문구
                <>
                  <Text style={styles.recapFallbackTitle}>{FALLBACKS.recap.message}</Text>
                  <Text style={styles.recapSubtitle}>심은 나무: {Number.isFinite(treeCount) ? treeCount : 0}그루</Text>
                </>
              )}
            </View>
            <Image source={recapImgSource} style={styles.recapImage} />
          </View>
        </ScrollView>

        {/* 리스트들 */}
        <Section
          title="내가 심은 나무"
          data={plantedList.slice(0, plantedVisible)}
          onMore={() => setPlantedVisible(v => Math.min(v + 2, plantedList.length))}
          hasMore={plantedHasMore}
        />

        <Section
          title="내가 물 준 나무"
          data={wateredList.slice(0, wateredVisible)}
          onMore={() => setWateredVisible(v => Math.min(v + 2, wateredList.length))}
          hasMore={wateredHasMore}
          emptyText="아직 내역이 없어요."
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

/** 섹션 (빈 목록 메시지 지원) */
function Section({
  title, data, onMore, hasMore = false, emptyText,
}: {
  title: string;
  data: TreeItemT[];
  onMore: () => void;
  hasMore?: boolean;
  emptyText?: string;
}) {
  const isEmpty = data.length === 0;

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
        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{emptyText ?? '목록이 비어 있어요.'}</Text>
          </View>
        ) : (
          <>
            {data.map(it => <TreeCard key={it.id} item={it} />)}
            {hasMore && (
              <TouchableOpacity style={styles.moreBtn} onPress={onMore} activeOpacity={0.85}>
                <Text style={styles.moreBtnText}>내역 더보기</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },

  /* 헤더 */
  header: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 8 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  brandName: { width: 60, height: 23, resizeMode: 'contain' },
  brandPic: { width: 60, height: 23, resizeMode: 'contain' },
  headerRight: { marginLeft: 'auto', flexDirection: 'row', gap: 5 },
  iconBtn: { padding: 5, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  /* 프로필 카드 */
  card: {
    marginHorizontal: H_MARGIN, backgroundColor: '#F6F6F8', borderRadius: CARD_RADIUS,
    padding: 16, elevation: 3, position: 'relative', marginBottom: 15,
  },
  editFab: { position: 'absolute', top: 10, right: 10, padding: 6, borderRadius: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start' },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: '#E7E7E7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // ✅ 프로필 이미지 반영
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'cover',
  },

  profileRight: { flex: 1, marginLeft: 25 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline' },
  name: { fontSize: 18, fontWeight: '600', color: '#111' },

  // ✅ 한줄소개 텍스트
  bio: { marginTop: 8, color: '#4B4B4B', fontSize: 16 },

  divider: { height: RNStyleSheet.hairlineWidth, backgroundColor: '#D4D4D4', marginTop: 10, marginBottom: 8 },

  /* 통계 */
  statsRowSimple: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statValText: { fontSize: 15, fontWeight: '600', color: '#111' },
  statKeyText: { fontSize: 14, color: '#111', marginTop: 3 },

  /* 칩 영역 */
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginTop: 14 },

  /* 하이라이트 컨테이너 */
  highlightTray: { paddingHorizontal: H_MARGIN, gap: 14 },

  /* 공통 하이라이트 카드 */
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

  /* 상단 고정 오버레이 */
  topOverlay: { position: 'absolute', top: 22, left: 30, width: '90%' },

  /* 1번 카드 타이포 */
  titleWrap: { gap: 6 },
  highlightTitleLine: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 28 },
  highlightEm: { color: '#0DBC65' },
  highlightTree: { position: 'absolute', right: -8, bottom: -6, width: 300, height: 300, resizeMode: 'contain' },

  // ✅ 1번 카드 폴백 제목
  fallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 28 },

  /* 2번 카드(리캡) */
  recapTopOverlay: { position: 'absolute', top: 22, left: 30, width: '100%' },
  recapTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 40 },
  recapFallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 40 },
  recapSubtitle: { marginTop: 8, fontSize: 18, color: '#6B6B6B', fontWeight: '600' },
  recapImage: { position: 'absolute', right: -200, bottom: -30, width: '180%', height: '100%', resizeMode: 'contain' },

  /* 리스트 섹션 */
  sectionHeader: { marginTop: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '600', color: '#0E0F11', marginLeft: 7 },
  sortBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', padding: 4 },
  sortText: { color: '#737373', fontSize: 15, marginRight: 3 },
  sortChevron: { color: '#737373', fontSize: 15 },

  sectionBody: { marginTop: 15, marginHorizontal: 14 },

  /* 빈 목록 표시 */
  emptyWrap: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#777' },

  /* 개별 나무 카드 */
  treeCard: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F6F6F8', borderRadius: 15, marginBottom: 5,
  },
  treeIcon: { width: 45, height: 45, marginRight: 12, resizeMode: 'contain' },
  treeName: { fontSize: 15, fontWeight: '600', color: '#0E0F11' },
  treeMeta: { fontSize: 14, color: '#A0A0A0', marginTop: 4 },
  dotMenu: { marginLeft: 13, fontSize: 25, color: '#949494' },

  /* 더보기 버튼 */
  moreBtn: {
    marginTop: 4, marginBottom: 6, alignSelf: 'stretch', height: 42, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F1F6',
    alignItems: 'center', justifyContent: 'center',
  },
  moreBtnText: { fontSize: 14, color: '#555' },

  /* (기존 리스트 스타일은 미사용) */
  listCard: { display: 'none' },
  treeRow: { display: 'none' },
  treeRowDivider: { display: 'none' },
  treeThumb: { width: 40, height: 40, borderRadius: 8, resizeMode: 'contain' },
  rowChevron: { fontSize: 22, color: '#C2C6CE', paddingHorizontal: 4 },
});
