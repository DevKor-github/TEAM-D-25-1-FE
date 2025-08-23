// src/screens/FollowerScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image, ScrollView,
  TouchableOpacity, StyleSheet as RNStyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Chip from '../components/Chip';
import { getAuth } from '@react-native-firebase/auth';
import { CLOUDFRONT_URL } from '@env';


// API
import {
  followUser,
  getFollower,
  getUserFollowStatus,
  unfollowUser,
  getTag,
} from '../apis/api/user';

// SVG / PNG
import BasicProfileIcon from '../assets/basic_profile.svg';
const treeImg = require('../assets/image/mytree.png');
const treeicon = require('../assets/real_tree0_0.png');
const backbutton = require('../assets/arrow.png');

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 14;
const CARD_RADIUS = 16;
const HIGHLIGHT_CARD_SIZE = SCREEN_W - H_MARGIN * 2;

/** ---------- 이미지 오리진 후보 (환경에 맞게 필요시 수정) ---------- */
const API_ORIGIN       = 'https://api.groo.space';
const WEB_ORIGIN       = 'https://groo.space';
const CDN_ORIGIN       = 'https://d16invwz2az818.cloudfront.net';

type TreeItemT = { id: string; name: string; meta: string };

/** =================== 프로필 이미지 유틸 =================== */
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const joinUrl = (a: string, b: string) =>
  a.replace(/\/+$/, '') + '/' + String(b).replace(/^\/+/, '');

// getFollower 응답에서 프로필 이미지 "원시값" 추출(문자열/객체 모든 경우)
const pickProfileRaw = (u: any): string | null => {
  if (!u) return null;
  const cands = [
    u.profileImageUrl, u.profileImage, u.imageUrl, u.avatarUrl, u.photoUrl,
    u.profile?.imageUrl, u.profile?.url, u.profile?.path,
    u.profileImage?.imageUrl, u.profileImage?.url, u.profileImage?.path,
    u.image?.url, u.image?.path,
  ];
  for (const c of cands) {
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (c && typeof c === 'object') {
      const inner = c.url || c.imageUrl || c.path;
      if (typeof inner === 'string' && inner.trim()) return inner.trim();
    }
  }
  return null;
};

// 상대경로면 여러 오리진 조합으로 후보 URL 배열 생성(+ /api 접두도 시도)
const buildAvatarCandidates = (raw: string): string[] => {
  if (!raw) return [];
  if (isAbs(raw)) return [raw];

  // 안전하게 선행 슬래시 제거
  const path = raw.replace(/^\/+/, '');

  const list: string[] = [];
  // 1) API_ORIGIN
  list.push(joinUrl(API_ORIGIN, path));
  list.push(joinUrl(API_ORIGIN, joinUrl('api', path))); // 일부 서버가 /api 프리픽스 사용
  // 2) WEB_ORIGIN
  list.push(joinUrl(WEB_ORIGIN, path));
  // 3) CDN_ORIGIN
  list.push(joinUrl(CDN_ORIGIN, path));

  // 중복 제거
  return Array.from(new Set(list));
};

/** =================== 컴포넌트 =================== */
export default function FollowerScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { selectedUser } = route.params;
  const friendId = selectedUser?.id;

  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // 표시 전용 상태
  const [nickname, setNickname] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  const [mbti, setMbti] = useState<string | null>(null);
  const [stylesVal, setStylesVal] = useState<string[]>([]);
  const [foodsVal, setFoodsVal] = useState<string[]>([]);

  /** ✅ 프로필 이미지 관련 상태 */
  const [avatarCands, setAvatarCands] = useState<string[]>([]);
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [imgHeaders, setImgHeaders] = useState<Record<string, string> | undefined>(undefined);
  const [cacheVer, setCacheVer] = useState(0);

  // 나무 리스트
  const [plantedList, setPlantedList] = useState<TreeItemT[]>([]);
  const [plantedVisible, setPlantedVisible] = useState(0);

  // 태그 맵 (키→값)
  const [tagMaps, setTagMaps] = useState<{
    styleKeyToValue: Map<string, string>;
    foodKeyToValue: Map<string, string>;
    styleValueSet: Set<string>;
    foodValueSet: Set<string>;
  }>({
    styleKeyToValue: new Map(),
    foodKeyToValue: new Map(),
    styleValueSet: new Set(),
    foodValueSet: new Set(),
  });

  /** ---- 태그 유틸 ---- */
  const coalesce = (...v: any[]) => v.find(x => x !== undefined && x !== null);
  const buildTagMaps = (settings: any) => {
    const normalize = (src: any) => {
      const out: Array<{ key: string; value: string }> = [];
      if (!src) return out;
      if (Array.isArray(src)) {
        src.forEach((it: any) => {
          if (typeof it === 'string') out.push({ key: it, value: it });
          else if (it && typeof it === 'object') {
            const key = String(coalesce(it.key, it.code, it.id, it.value, it.label));
            const value = String(coalesce(it.value, it.label, it.name, it.title, it.text, key));
            if (key && value) out.push({ key, value });
          }
        });
      } else if (typeof src === 'object') {
        Object.entries(src).forEach(([k, v]) => {
          const value = typeof v === 'string'
            ? v
            : String(coalesce((v as any)?.value, (v as any)?.label, k));
          out.push({ key: String(k), value });
        });
      }
      return out;
    };
    const s = settings?.settings ?? settings ?? {};
    const styleKVs = normalize(coalesce(s?.styleTags, s?.styletags, s?.style_tags, s?.styles));
    const foodKVs  = normalize(coalesce(s?.foodTags,  s?.foodtags,  s?.food_tags,  s?.foods));
    return {
      styleKeyToValue: new Map(styleKVs.map(kv => [kv.key, kv.value])),
      foodKeyToValue:  new Map(foodKVs.map(kv => [kv.key, kv.value])),
      styleValueSet:   new Set(styleKVs.map(kv => kv.value)),
      foodValueSet:    new Set(foodKVs.map(kv => kv.value)),
    };
  };
  const toValueList = (src: any, keyToValue: Map<string, string>, valueSet: Set<string>) => {
    if (!Array.isArray(src)) return [];
    const out: string[] = [];
    for (const it of src) {
      if (typeof it === 'string') {
        const s = it.trim();
        if (!s) continue;
        if (valueSet.has(s)) out.push(s);
        else if (keyToValue.has(s)) out.push(keyToValue.get(s)!);
        else out.push(s);
      } else if (it && typeof it === 'object') {
        const v = it.value ?? it.label ?? it.name ?? it.title ?? it.text ?? '';
        const k = it.key ?? it.code ?? it.id ?? '';
        if (typeof v === 'string' && v.trim()) out.push(v.trim());
        else if (typeof k === 'string' && keyToValue.has(k)) out.push(keyToValue.get(k)!);
      }
    }
    return Array.from(new Set(out));
  };

  /** ---- 데이터 로드 ---- */
  const [userDataCache, setUserDataCache] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (friendId == null) return;
      try {
        setLoading(true);

        // 이미지가 인증 필요하면 Authorization 헤더 세팅(파이어베이스 토큰)
        const fbUser = getAuth().currentUser;
        if (fbUser) {
          const token = await fbUser.getIdToken();
          setImgHeaders({ Authorization: `Bearer ${token}` });
        } else {
          setImgHeaders(undefined);
        }

        const [settings, data, followStatus] = await Promise.all([
          getTag(),
          getFollower(friendId),
          getUserFollowStatus(friendId),
        ]);

        // 태그 맵
        const maps = buildTagMaps(settings);
        setTagMaps(maps);

        setUserDataCache(data);
        setNickname(data?.nickname ?? '닉네임');

        const desc = (typeof data?.description === 'string' && data.description.trim())
          ? data.description
          : (typeof data?.intro === 'string' ? data.intro : '');
        setIntro(desc ?? '');

        /** ✅ 프로필 이미지 후보 계산 */
        const raw = pickProfileRaw(data);                  // 예: "/images/review/xxxx.jpg"
        const cands = raw ? buildAvatarCandidates(raw) : [];
        setAvatarCands(cands);
        setAvatarIdx(0);
        setAvatarFailed(!cands.length);
        setCacheVer(v => v + 1);                           // 캐시버스터

        // 태그(value)
        setMbti((typeof data?.mbti === 'string' && data.mbti.trim()) ? data.mbti.trim() : null);
        setStylesVal(toValueList(data?.styleTags, maps.styleKeyToValue, maps.styleValueSet));
        setFoodsVal(toValueList(data?.foodTags,  maps.foodKeyToValue,  maps.foodValueSet));

        // 리스트
        if (Array.isArray(data?.myTrees)) {
          const withIdx = data.myTrees
            .map((t: any, i: number) => ({ ...t, __i: i }))
            .sort((a: any, b: any) => {
              const ca = Number(a.recommendationCount ?? a.recommandationCount ?? 0);
              const cb = Number(b.recommendationCount ?? b.recommandationCount ?? 0);
              if (cb !== ca) return cb - ca;
              return a.__i - b.__i;
            })
            .map((t: any) => {
              const count = Number(t.recommendationCount ?? t.recommandationCount ?? 0);
              const name = t.restaurantName ?? t.name ?? t.title ?? '이름없음';
              const metaParts = [Number.isFinite(count) ? `${count}M` : '', t.location || ''].filter(Boolean);
              return { id: t.restaurantId ?? t.id ?? `tree-${t.__i}`, name, meta: metaParts.join('  ') };
            });
          setPlantedList(withIdx);
          setPlantedVisible(Math.min(2, withIdx.length));
        } else {
          setPlantedList([]); setPlantedVisible(0);
        }

        // 팔로우 상태
        setIsFollowing(followStatus?.hasRequestedFollow ?? false);
      } catch (e) {
        console.error('친구 데이터 로드 실패:', e);
        setAvatarFailed(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [friendId]);

  const refreshUserData = useCallback(async () => {
    try {
      const data = await getFollower(friendId);
      setUserDataCache(data);
      setNickname(data?.nickname ?? '닉네임');

      const desc = (typeof data?.description === 'string' && data.description.trim())
        ? data.description
        : (typeof data?.intro === 'string' ? data.intro : '');
      setIntro(desc ?? '');

      const raw = pickProfileRaw(data);
      const cands = raw ? buildAvatarCandidates(raw) : [];
      setAvatarCands(cands);
      setAvatarIdx(0);
      setAvatarFailed(!cands.length);
      setCacheVer(v => v + 1);

      setMbti((typeof data?.mbti === 'string' && data.mbti.trim()) ? data.mbti.trim() : null);
      setStylesVal(toValueList(data?.styleTags, tagMaps.styleKeyToValue, tagMaps.styleValueSet));
      setFoodsVal(toValueList(data?.foodTags,  tagMaps.foodKeyToValue,  tagMaps.foodValueSet));

      if (Array.isArray(data?.myTrees)) {
        const items = data.myTrees.map((t: any, i: number) => ({
          id: t.restaurantId ?? t.id ?? `tree-${i}`,
          name: t.restaurantName ?? t.name ?? t.title ?? '이름없음',
          meta: [Number(t.recommendationCount ?? t.recommandationCount ?? 0) + 'M', t.location || '']
            .filter(Boolean).join('  '),
        }));
        setPlantedList(items);
        setPlantedVisible(Math.min(2, items.length));
      } else {
        setPlantedList([]); setPlantedVisible(0);
      }
    } catch (e) {
      console.error('유저 데이터 새로고침 실패:', e);
    }
  }, [friendId, tagMaps]);

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

  /** ---- 하이라이트 파생값 ---- */
  const biggestFromApi = (() => {
    const obj = userDataCache?.biggestTree;
    if (!obj) return null;
    const name = obj.name ?? obj.restaurantName ?? obj.treeName ?? obj.title ?? '';
    const count = Number(obj.recommendationCount ?? obj.recommandationCount ?? obj.count ?? 0);
    if (!name) return null;
    return { name, count: isNaN(count) ? 0 : count };
  })();
  const topFromList = (() => {
    const trees = userDataCache?.myTrees;
    if (!Array.isArray(trees) || trees.length === 0) return null;
    const getCnt = (t: any) => Number(t?.recommendationCount ?? t?.recommandationCount ?? 0);
    let bestIdx = 0, best = getCnt(trees[0]);
    for (let i = 1; i < trees.length; i++) {
      const c = getCnt(trees[i]);
      if (c > best) { best = c; bestIdx = i; }
    }
    const t = trees[bestIdx];
    const name = t?.restaurantName ?? t?.name ?? t?.title ?? '이름없음';
    return { name, count: isNaN(best) ? 0 : best };
  })();
  const topTree = biggestFromApi ?? topFromList;

  const plantedCount = Number(userDataCache?.treeCount ?? (userDataCache?.myTrees?.length ?? 0));
  const hasPlanted   = plantedCount > 0;

  const recapMsg = (userDataCache?.recapMessage ?? '').trim();
  const idx = recapMsg.indexOf('만큼');
  const recapEm = idx >= 0 ? recapMsg.slice(0, idx).trim() : recapMsg.split(/\s+/).slice(0, 2).join(' ');
  const recapRest = idx >= 0 ? recapMsg.slice(idx).trim() : recapMsg.slice(recapEm.length).trim();

  /** ✅ 현재 시도 중인 아바타 URL */
  const currentAvatar = avatarCands[avatarIdx];
  const avatarSrc =
    currentAvatar
      ? {
          uri: currentAvatar,
          headers: imgHeaders, // 인증 필요한 경우 자동 전송
        }
      : null;

  console.log('avatar',avatarSrc)

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
          {/* 프로필 카드 */}
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                {avatarSrc && !avatarFailed ? (
                  <Image
                    source={avatarSrc}
                    style={styles.avatarImg}
                    onError={() => {
                      // 실패하면 다음 후보 URL로 폴백
                      if (avatarIdx + 1 < avatarCands.length) {
                        setAvatarIdx(i => i + 1);
                      } else {
                        setAvatarFailed(true);
                      }
                    }}
                  />
                ) : (
                  <BasicProfileIcon width={56} height={56} />
                )}
              </View>

              <View style={styles.profileRight}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{nickname || '닉네임'}</Text>
                </View>

                <Text style={styles.bio}>
                  {intro?.trim?.() ? intro : '한줄소개로 나를 설명해보세요!'}
                </Text>

                <View style={styles.divider} />

                {/* 통계줄 */}
                <View style={styles.statsRowSimple}>
                  <View style={styles.statCol}>
                    <Text style={styles.statValText}>{plantedCount}</Text>
                    <Text style={styles.statKeyText}>심은 나무</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statValText}>{userDataCache?.followerCount ?? 0}</Text>
                    <Text style={styles.statKeyText}>팔로워</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statValText}>{userDataCache?.followingCount ?? 0}</Text>
                    <Text style={styles.statKeyText}>팔로잉</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 칩 블록(마이페이지와 동일 위치) */}
            <View style={styles.chipsRow}>
              {stylesVal.map(s => <Chip key={`style-${s}`} label={s} variant="style" selected />)}
              {foodsVal.map(f => <Chip key={`food-${f}`} label={f} variant="food" selected />)}
              {mbti ? <Chip label={mbti} variant="mbti" selected /> : null}
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
            {/* 1) 가장 큰 나무 */}
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

            {/* 2) 리캡 */}
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

              {userDataCache?.recapImageUrl ? (
                <Image source={{ uri: userDataCache.recapImageUrl }} style={styles.recapImage} />
              ) : (
                <Image source={treeImg} style={styles.highlightTree} />
              )}
            </View>
          </ScrollView>

          {/* 친구가 심은 나무 */}
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
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },

  profileRight: { flex: 1, marginLeft: 25 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline' },
  name: { fontSize: 18, fontWeight: '600', color: '#111' },
  bio: { marginTop: 8, color: '#4B4B4B', fontSize: 16 },
  divider: { height: RNStyleSheet.hairlineWidth, backgroundColor: '#D4D4D4', marginTop: 10, marginBottom: 10 },

  /* 칩 줄 — 마이페이지와 동일 포지션 */
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginTop: 14 },

  /* 통계줄 */
  statsRowSimple: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statValText: { fontSize: 15, fontWeight: '600', color: '#111' },
  statKeyText: { fontSize: 14, color: '#111', marginTop: 3 },

  /* 팔로우 바 */
  followBar: { alignItems: 'center', marginTop: 4, marginBottom: 10 },
  followBtn: {
    borderRadius: 10, height: 50, paddingHorizontal: 2, width: 368,
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

  topOverlay: { position: 'absolute', top: 22, left: 30, width: '95%' },
  recapTopOverlay: { position: 'absolute', top: 22, left: 30, width: '100%' },

  titleWrap: { gap: 6 },
  highlightTitleLine: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 30 },
  highlightEm: { color: '#0DBC65' },
  fallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 28 },

  highlightTree: { position: 'absolute', right: -8, bottom: -6, width: 300, height: 300, resizeMode: 'contain' },

  recapImage: {
    position: 'absolute', right: -200, bottom: -30, width: '180%', height: '100%', resizeMode: 'contain',
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
