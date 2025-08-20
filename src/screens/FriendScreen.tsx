// src/screens/FollowerScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image, ScrollView,
  TouchableOpacity, StyleSheet as RNStyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

// API
import { followUser, getFollower, getUserFollowStatus, unfollowUser } from '../apis/api/user';

// SVG / PNG
import BasicProfileIcon from '../assets/basic_profile.svg';
const treeImg = require('../assets/image/mytree.png');
const treeicon = require('../assets/extree.png');
const backbutton = require('../assets/arrow.png');

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 14;
const CARD_RADIUS = 16;
const HIGHLIGHT_CARD_SIZE = SCREEN_W - H_MARGIN * 2;

type TreeItemT = { id: string; name: string; meta: string };

export default function FollowerScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { selectedUser } = route.params;
  const friendId = selectedUser?.id;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // 친구의 심은 나무 리스트
  const [plantedList, setPlantedList] = useState<TreeItemT[]>([]);
  const [plantedVisible, setPlantedVisible] = useState(0);

  // ---- helpers ----
  const mapTreesToItems = (trees: any[] = []): TreeItemT[] => {
    const withIdx = trees.map((t, i) => ({ ...t, __i: i }));
    withIdx.sort((a: any, b: any) => {
      const ca = Number(a.recommendationCount ?? a.recommandationCount ?? 0);
      const cb = Number(b.recommendationCount ?? b.recommandationCount ?? 0);
      if (cb !== ca) return cb - ca;
      return a.__i - b.__i;
    });
    return withIdx.map((t: any) => {
      const count = Number(t.recommendationCount ?? t.recommandationCount ?? 0);
      const name = t.restaurantName ?? t.name ?? t.title ?? '이름없음';
      const metaParts = [Number.isFinite(count) ? `${count}M` : '', t.location || ''].filter(Boolean);
      return {
        id: t.restaurantId ?? t.id ?? `tree-${t.__i}`,
        name,
        meta: metaParts.join('  '),
      };
    });
  };

  const getBiggestInfo = (obj: any | null | undefined) => {
    if (!obj) return null;
    const name = obj.name ?? obj.restaurantName ?? obj.treeName ?? obj.title ?? '';
    const count = Number(obj.recommendationCount ?? obj.recommandationCount ?? obj.count ?? 0);
    if (!name) return null;
    return { name, count: isNaN(count) ? 0 : count };
  };

  const pickTopTree = (trees: any[] = []) => {
    if (!Array.isArray(trees) || trees.length === 0) return null;
    const getCnt = (t: any) => Number(t?.recommendationCount ?? t?.recommandationCount ?? 0);
    let bestIdx = 0;
    let best = getCnt(trees[0]);
    for (let i = 1; i < trees.length; i++) {
      const c = getCnt(trees[i]);
      if (c > best) { best = c; bestIdx = i; }
    }
    const t = trees[bestIdx];
    const name = t?.restaurantName ?? t?.name ?? t?.title ?? '이름없음';
    return { name, count: isNaN(best) ? 0 : best };
  };

  const splitRecapMessage = (raw?: string) => {
    const msg = (raw ?? '').trim();
    if (!msg) return { em: '', rest: '' };
    const idx = msg.indexOf('만큼');
    if (idx >= 0) return { em: msg.slice(0, idx).trim(), rest: msg.slice(idx).trim() };
    const tokens = msg.split(/\s+/);
    const em = tokens.slice(0, 2).join(' ');
    const rest = msg.slice(em.length).trim();
    return { em, rest };
  };

  // ---- fetch ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getFollower(friendId);
        setUserData(data);

        if (Array.isArray(data?.myTrees)) {
          const items = mapTreesToItems(data.myTrees);
          setPlantedList(items);
          setPlantedVisible(Math.min(2, items.length));
        } else {
          setPlantedList([]);
          setPlantedVisible(0);
        }

        const followStatus = await getUserFollowStatus(friendId);
        setIsFollowing(followStatus?.hasRequestedFollow ?? false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (friendId != null) fetchData();
  }, [friendId]);

  const refreshUserData = useCallback(async () => {
    try {
      const data = await getFollower(friendId);
      setUserData(data);
      if (Array.isArray(data?.myTrees)) {
        const items = mapTreesToItems(data.myTrees);
        setPlantedList(items);
        setPlantedVisible(Math.min(2, items.length));
      } else {
        setPlantedList([]);
        setPlantedVisible(0);
      }
    } catch (e) {
      console.error('유저 데이터 새로고침 실패:', e);
    }
  }, [friendId]);

  const toggleFollow = useCallback(async () => {
    try {
      if (isFollowing) {
        await unfollowUser(friendId);
        setIsFollowing(false);
      } else {
        await followUser(friendId);
        setIsFollowing(true);
      }
      await refreshUserData();
    } catch (error) {
      console.error('팔로우/언팔 요청 실패:', error);
    }
  }, [friendId, isFollowing, refreshUserData]);

  // ---- 하이라이트 파생값 (폴백 버그 수정) ----
  const biggestFromApi = getBiggestInfo(userData?.biggestTree);
  const topFromList   = pickTopTree(userData?.myTrees);
  const topTree       = biggestFromApi ?? topFromList;

  const plantedCount = Number(userData?.treeCount ?? (userData?.myTrees?.length ?? 0));
  const hasPlanted   = plantedCount > 0;

  const { em: recapEm, rest: recapRest } = splitRecapMessage(userData?.recapMessage);

  const recapImgSource = hasPlanted && userData?.recapImageUrl
    ? { uri: userData.recapImageUrl }
    : treeImg;

  const plantedHasMore = plantedVisible < plantedList.length;

  return (
    <SafeAreaView style={[styles.root, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Image source={backbutton} style={styles.headerBackIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구의 프로필</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
          {/* 프로필 카드 (마이페이지와 같은 기본 프사) */}
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <BasicProfileIcon width={56} height={56} />
              </View>
              <View style={styles.profileRight}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{userData?.nickname ?? '닉네임'}</Text>
                </View>
                <Text style={styles.bio}>
                  {userData?.intro?.trim?.() || '한줄소개로 나를 설명해보세요!'}
                </Text>
                <View style={styles.divider} />
                <View style={styles.statsRowSimple}>
                  <View style={styles.statCol}>
                    <Text style={styles.statValText}>{userData?.treeCount ?? 0}</Text>
                    <Text style={styles.statKeyText}>심은 나무</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statValText}>{userData?.followerCount ?? 0}</Text>
                    <Text style={styles.statKeyText}>팔로워</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statValText}>{userData?.followingCount ?? 0}</Text>
                    <Text style={styles.statKeyText}>팔로잉</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 팔로우 버튼 */}
          <View style={styles.followBar}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={toggleFollow}
              accessibilityState={{ selected: isFollowing }}
              style={[styles.followBtn, isFollowing ? styles.following : styles.follow]}>
              <Text style={[styles.followTxt, !isFollowing && styles.followTxtActive]}>
                {isFollowing ? '팔로잉' : '팔로우'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 하이라이트 카드들 */}
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightTray}>
            {/* 1) 가장 큰 나무 (이미지는 그대로 treeImg 유지) */}
            <View style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
              <LinearGradient
                colors={['#F4F4F4', '#BDEABC']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.topOverlay}>
                {hasPlanted && topTree ? (
                  <View style={styles.titleWrap}>
                    <Text style={styles.highlightTitleLine}>
                      가장 큰 나무는 <Text style={styles.highlightEm}>{topTree.name}</Text>의
                    </Text>
                    <Text style={styles.highlightTitleLine}>
                      <Text style={styles.highlightEm}>{String(topTree.count)}</Text>M 아름드리 나무예요!
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.fallbackTitle}>아직 심은 나무가 없어요ㅜ.ㅜ</Text>
                )}
              </View>
              <Image source={treeImg} style={styles.highlightTree} />
            </View>

            {/* 2) 리캡 (심은 나무가 있으면 recapImageUrl 표시, 없으면 폴백) */}
            <View style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
              <LinearGradient
                colors={['#F4F4F4', '#F6D4E3']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.recapTopOverlay}>
                {(recapEm || recapRest) ? (
                  <>
                    <Text style={styles.recapTitle}>
                      <Text style={styles.highlightEm}>{recapEm}</Text>
                      {recapRest ? ' ' : ''}{recapRest}
                    </Text>
                    <Text style={styles.recapSubtitle}>심은 나무: {plantedCount}그루</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.recapFallbackTitle}>나만의 정원을 꾸며보아요!</Text>
                    <Text style={styles.recapSubtitle}>심은 나무: {plantedCount}그루</Text>
                  </>
                )}
              </View>

              {hasPlanted && userData?.recapImageUrl ? (
                <Image source={recapImgSource} style={styles.recapImage} />
              ) : (
                <Image source={treeImg} style={styles.highlightTree} />
              )}
            </View>
          </ScrollView>

          {/* 친구가 심은 나무 (myTrees 기반) */}
          <Section
            title="친구가 심은 나무"
            data={plantedList.slice(0, plantedVisible)}
            hasMore={plantedVisible < plantedList.length}
            onMore={() => setPlantedVisible(v => Math.min(v + 2, plantedList.length))}
            emptyText="아직 내역이 없어요."
          />
        </ScrollView>
      )}
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
  header: {
    height: 48, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, marginBottom: 8, justifyContent: 'space-between',
  },
  headerBackBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerBackIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111' },

  /* 프로필 카드 */
  card: {
    marginHorizontal: H_MARGIN, backgroundColor: '#F6F6F8', borderRadius: CARD_RADIUS,
    padding: 16, elevation: 3, position: 'relative', marginBottom: 10,
  },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 95, height: 95, borderRadius: 50, backgroundColor: '#E7E7E7',
    alignItems: 'center', justifyContent: 'center',
  },
  profileRight: { flex: 1, marginLeft: 25 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline' },
  name: { fontSize: 18, fontWeight: '600', color: '#111' },
  bio: { marginTop: 8, color: '#4B4B4B', fontSize: 16 },
  divider: { height: RNStyleSheet.hairlineWidth, backgroundColor: '#D4D4D4', marginTop: 10, marginBottom: 8 },

  statsRowSimple: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statValText: { fontSize: 15, fontWeight: '600', color: '#111' },
  statKeyText: { fontSize: 14, color: '#111', marginTop: 3 },

  /* 팔로우 바 */
  followBar: { alignItems: 'center', marginTop: 4, marginBottom: 8 },
  followBtn: {
    borderRadius: 10, height: 50, paddingHorizontal: 2, width: 370,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, marginTop: 10,
  },
  following: { backgroundColor: '#F6F6F8' },
  follow: { backgroundColor: '#6CDF44' },
  followTxt: { fontSize: 16, fontWeight: '500', color: '#111' },
  followTxtActive: { color: '#111' },

  /* 하이라이트 컨테이너 */
  highlightTray: { paddingHorizontal: H_MARGIN, gap: 14 },

  /* 공통 하이라이트 카드 */
  highlightItem: {
    aspectRatio: 1.1, borderRadius: CARD_RADIUS, overflow: 'hidden',
    paddingLeft: 16, paddingRight: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'stretch', position: 'relative',
  },

  /* 마이페이지와 동일한 텍스트 배치 */
  topOverlay: { position: 'absolute', top: 22, left: 30, width: '95%' },
  recapTopOverlay: { position: 'absolute', top: 22, left: 30, width: '100%' },

  titleWrap: { gap: 6 },
  highlightTitleLine: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 30 },
  highlightEm: { color: '#0DBC65' },
  fallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 28 },

  /* 오른쪽 하단 기본 트리 이미지 */
  highlightTree: { position: 'absolute', right: -8, bottom: -6, width: 300, height: 300, resizeMode: 'contain' },

  /* 리캡 이미지 (마이페이지와 동일 느낌) */
  recapImage: {
    position: 'absolute',
    right: -200,
    bottom: -30,
    width: '180%',
    height: '100%',
    resizeMode: 'contain',
  },

  recapTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 40 },
  recapFallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 40 },
  recapSubtitle: { marginTop: 8, fontSize: 18, color: '#6B6B6B', fontWeight: '600' },

  /* 섹션 */
  sectionHeader: { marginTop: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '600', color: '#0E0F11', marginLeft: 7 },
  sortBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', padding: 4 },
  sortText: { color: '#737373', fontSize: 15, marginRight: 3 },
  sortChevron: { color: '#737373', fontSize: 15 },

  sectionBody: { marginTop: 15, marginHorizontal: 14 },

  /* 빈 목록 */
  emptyWrap: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#777' },

  /* 카드 */
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
});
