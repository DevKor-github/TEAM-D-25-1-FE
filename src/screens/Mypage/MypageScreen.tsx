// file: src/screens/MyPageScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
//import BookmarkIcon from '../../assets/icons/bookmark.svg';
import BasicProfileIcon from '../../assets/basic_profile.svg';

import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import {
  getMyTree,
  getUser,
  getFollwerList,
  getFollowingList,
  getMe,
  getTag,
} from '../../apis/api/user';
import { CLOUDFRONT_URL } from '@env';

// PNG 리소스
const treeImg = require('../../assets/image/mytree.png');
const treeicon = require('../../assets/real_tree0_0.png');
const grooNameIcon = require('../../assets/groo_name_icon.png');
const grooPictureIcon = require('../../assets/groo_picture_icon.png');

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 14;
const CARD_RADIUS = 16;
const HIGHLIGHT_CARD_SIZE = SCREEN_W - H_MARGIN * 2;
const DEFAULT_VISIBLE = 2; // ← 기본 노출 개수

const FALLBACKS = {
  topCard: { message: '나만의 나무를 심어보아요' },
  recap:   { message: '나만의 정원을 꾸며보아요!' },
};

type TreeItemT = { id: string; name: string; meta: string; count: number };
type MyTree = {
  restaurantId?: string;
  restaurantName?: string;
  recommendationCount?: number;
  recommandationCount?: number;
  location?: string;
};

// ---------- 태그 유틸 ----------
type TagMaps = {
  styleKeyToValue: Map<string, string>;
  foodKeyToValue: Map<string, string>;
  styleValueSet: Set<string>;
  foodValueSet: Set<string>;
};

const buildTagMaps = (settings: any): TagMaps => {
  const coalesce = (...v: any[]) => v.find(x => x !== undefined && x !== null);

  const normalizeOptions = (src: any) => {
    const out: Array<{ key: string; value: string }> = [];
    if (!src) return out;
    if (Array.isArray(src)) {
      src.forEach((it: any) => {
        if (typeof it === 'string') {
          out.push({ key: it, value: it });
        } else if (it && typeof it === 'object') {
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
  const styleSrc = coalesce(s?.styleTags, s?.styletags, s?.style_tags, s?.styles);
  const foodSrc  = coalesce(s?.foodTags,  s?.foodtags,  s?.food_tags,  s?.foods);

  const styleKVs = normalizeOptions(styleSrc);
  const foodKVs  = normalizeOptions(foodSrc);

  const styleKeyToValue = new Map(styleKVs.map(kv => [kv.key, kv.value]));
  const foodKeyToValue  = new Map(foodKVs.map(kv => [kv.key, kv.value]));
  const styleValueSet   = new Set(styleKVs.map(kv => kv.value));
  const foodValueSet    = new Set(foodKVs.map(kv => kv.value));

  return { styleKeyToValue, foodKeyToValue, styleValueSet, foodValueSet };
};

const toValueList = (src: any, keyToValue: Map<string, string>, valueSet: Set<string>): string[] => {
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

// ---------- 컴포넌트 ----------
export default function MyPageScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [nickname, setNickname] = useState<string>('');
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [treeCount, setTreeCount] = useState<number>(0);

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [avatarVer, setAvatarVer] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [topTree, setTopTree] = useState<{ name: string; count: number } | null>(null);

  const [recap, setRecap] = useState<{ messageEm: string; messageRest: string; imageUrl?: string; }>(
    { messageEm: '', messageRest: '' }
  );

  const [profile, setProfile] = useState({
    intro: '',
    mbti: null as string | null,
    styles: [] as string[],
    foods: [] as string[],
  });

  const [tagMaps, setTagMaps] = useState<TagMaps>({
    styleKeyToValue: new Map(),
    foodKeyToValue: new Map(),
    styleValueSet: new Set(),
    foodValueSet: new Set(),
  });

  const [plantedList, setPlantedList] = useState<TreeItemT[]>([]);
  const [plantedVisible, setPlantedVisible] = useState(DEFAULT_VISIBLE);
  const [wateredList, setWateredList] = useState<TreeItemT[]>([]);
  const [wateredVisible, setWateredVisible] = useState(DEFAULT_VISIBLE);
  
  type SortByType = 'height' | 'name';
  const [plantedSortBy, setPlantedSortBy] = useState<SortByType>('height');
  const [wateredSortBy, setWateredSortBy] = useState<SortByType>('height');

  const openProfileEdit = () => {
    navigation.navigate('ProfileEdit', {
      mbti: profile.mbti,
      styles: profile.styles,
      foods: profile.foods,
      intro: profile.intro,
      avatarUri: profileImageUrl,
      onSave: (data: {
        intro: string;
        mbti: string | null;
        styles: string[];
        foods: string[];
        avatarUri?: string | null;
      }) => {
        setProfile(prev => ({ ...prev, intro: data.intro, mbti: data.mbti, styles: data.styles, foods: data.foods }));
        if (typeof data.avatarUri !== 'undefined') {
          setProfileImageUrl(data.avatarUri || null);
          setAvatarVer(v => v + 1);
          setAvatarFailed(false);
        }
      },
    });
  };

  const mapTreesToItems = (trees: MyTree[] = []): TreeItemT[] => {
    return (trees ?? []).map((t, i) => {
      const count = Number(t.recommendationCount ?? t.recommandationCount ?? 0);
      const metaParts = [!isNaN(count) ? `${count}M` : '', t.location || ''].filter(Boolean);
      return {
        id: t.restaurantId ?? `tree-${i}`,
        name: t.restaurantName ?? '이름없음',
        meta: metaParts.join('  '),
        count: isNaN(count) ? 0 : count,
      };
    });
  };

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

  const splitRecapMessage = (msg?: string): { em: string; rest: string } => {
    const raw = (msg ?? '').trim();
    if (!raw) return { em: '', rest: '' };
    const idx = raw.indexOf('만큼');
    if (idx >= 0) return { em: raw.slice(0, idx).trim(), rest: raw.slice(idx).trim() };
    const tokens = raw.split(/\s+/);
    const em = tokens.slice(0, 2).join(' ');
    const rest = raw.slice(em.length).trim();
    return { em, rest };
  }

  const loadProfileAndCounts = useCallback(async () => {
    try {
      const [settings, meCore, me]: any[] = await Promise.all([getTag(), getMe(), getUser()]);
      const maps = buildTagMaps(settings);
      setTagMaps(maps);

      if (meCore?.nickname || me?.nickname) setNickname(meCore?.nickname ?? me?.nickname);

      const desc = (typeof meCore?.description === 'string' ? meCore.description : me?.description) ?? '';
      setProfile(prev => ({ ...prev, intro: desc }));

      const rawImg = (meCore?.profileImageUrl ?? meCore?.profileImage ?? me?.profileImageUrl ?? me?.profileImage ?? '');
      const img = (typeof rawImg === 'string' ? rawImg.trim() : '');
      setProfileImageUrl(img.length ? img : null);
      setAvatarVer(v => v + 1);
      setAvatarFailed(false);

      const mbtiValue =
        (typeof me?.mbti === 'string' && me?.mbti.trim()) ? me.mbti.trim()
        : (typeof meCore?.mbti === 'string' && meCore?.mbti.trim()) ? meCore.mbti.trim()
        : null;

      const stylesVal = toValueList(me?.styleTags, maps.styleKeyToValue, maps.styleValueSet);
      const foodsVal  = toValueList(me?.foodTags,  maps.foodKeyToValue,  maps.foodValueSet);
      setProfile(prev => ({ ...prev, mbti: mbtiValue, styles: stylesVal, foods: foodsVal }));

      const uFollower = typeof me?.followerCount === 'number' ? me.followerCount : undefined;
      const uFollowing = typeof me?.followingCount === 'number' ? me.followingCount : undefined;
      const uTreeCount = typeof me?.treeCount === 'number' ? me.treeCount : Array.isArray(me?.myTrees) ? me.myTrees.length : undefined;

      if (uFollower != null) setFollowerCount(uFollower);
      if (uFollowing != null) setFollowingCount(uFollowing);
      if (uTreeCount != null) setTreeCount(uTreeCount);

      if (Array.isArray(me?.myTrees)) {
        const items = mapTreesToItems(me.myTrees as MyTree[]);
        setPlantedList(items);
        setPlantedVisible(Math.min(DEFAULT_VISIBLE, items.length));
      } else {
        setPlantedList([]); setPlantedVisible(0);
      }

      if (Array.isArray(me?.wateredTrees)) {
        const wItems = mapTreesToItems(me.wateredTrees as MyTree[]);
        setWateredList(wItems);
        setWateredVisible(Math.min(DEFAULT_VISIBLE, wItems.length));
      } else {
        setWateredList([]); setWateredVisible(0);
      }

      if (Array.isArray(me?.myTrees) && me.myTrees.length > 0) {
        setTopTree(pickTopTree(me.myTrees as MyTree[]));
      } else {
        setTopTree(null);
      }

      if (typeof me?.recapMessage === 'string') {
        const { em, rest } = splitRecapMessage(me.recapMessage);
        setRecap(prev => ({ ...prev, messageEm: em, messageRest: rest }));
      }
      if (typeof me?.recapImageUrl === 'string' && me.recapImageUrl.trim()) {
        setRecap(prev => ({ ...prev, imageUrl: me.recapImageUrl }));
      }
    } catch (e) {
      console.error('프로필/팔로우/나무/태그 로드 실패:', e);
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

  const recapHasText = Boolean((recap.messageEm || '').trim() || (recap.messageRest || '').trim());
  const recapImgSource = recap.imageUrl ? { uri: recap.imageUrl } : treeImg;

  const avatarSrc = (() => {
    if (!profileImageUrl) return null;
    const isAbsolute = profileImageUrl.startsWith('http');
    const finalUrl = isAbsolute ? profileImageUrl : CLOUDFRONT_URL + profileImageUrl;
    return { uri: finalUrl + (finalUrl.includes('?') ? '&' : '?') + 'v=' + avatarVer };
  })();

  const sortedPlantedList = useMemo(() => {
    const sorted = [...plantedList];
    if (plantedSortBy === 'height') {
      sorted.sort((a, b) => b.count - a.count);
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [plantedList, plantedSortBy]);

  const sortedWateredList = useMemo(() => {
    const sorted = [...wateredList];
    if (wateredSortBy === 'height') {
      sorted.sort((a, b) => b.count - a.count);
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [wateredList, wateredSortBy]);

  // --- 토글 상태 계산 ---
  const plantedExpanded = plantedList.length > DEFAULT_VISIBLE && plantedVisible >= plantedList.length;
  const wateredExpanded = wateredList.length > DEFAULT_VISIBLE && wateredVisible >= wateredList.length;

  const canTogglePlanted = plantedList.length > DEFAULT_VISIBLE;
  const canToggleWatered = wateredList.length > DEFAULT_VISIBLE;

  const togglePlanted = () => {
    setPlantedVisible(v =>
      plantedExpanded ? Math.min(DEFAULT_VISIBLE, plantedList.length) : plantedList.length
    );
  };
  const toggleWatered = () => {
    setWateredVisible(v =>
      wateredExpanded ? Math.min(DEFAULT_VISIBLE, wateredList.length) : wateredList.length
    );
  };

  return (
    <SafeAreaView style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brandWrap}>
          <Image source={grooPictureIcon} style={styles.brandPic} />
          <Image source={grooNameIcon} style={styles.brandName} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}} accessibilityLabel="설정">
            <SettingsIcon width={30} height={30}  />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.card}>
          <TouchableOpacity onPress={openProfileEdit} style={styles.editFab} accessibilityLabel="프로필 수정" activeOpacity={0.8}>
            <PencilIcon width={23} height={23} />
          </TouchableOpacity>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {avatarSrc && !avatarFailed ? (
                <Image
                  source={avatarSrc}
                  style={styles.avatarImg}
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <BasicProfileIcon width={50} height={50} />
              )}
            </View>
            <View style={styles.profileRight}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{nickname || '닉네임'}</Text>
              </View>

              <Text style={styles.bio}>
                {profile.intro?.trim()?.length ? profile.intro : '한줄소개로 나를 표현해보세요!'}
              </Text>

              <View style={styles.divider} />

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

        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightTray}>
          <View style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
            <LinearGradient colors={['#F4F4F4', '#BDEABC']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <Image source={treeImg} style={styles.highlightTree} />
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
                <Text style={styles.fallbackTitle}>{FALLBACKS.topCard.message}</Text>
              )}
            </View>
          </View>

          <View style={[styles.highlightItem, { width: HIGHLIGHT_CARD_SIZE }]}>
            <LinearGradient colors={['#F4F4F4', '#F6D4E3']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <Image source={recapImgSource} style={styles.recapImage} />
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
                <>
                  <Text style={styles.recapFallbackTitle}>{FALLBACKS.recap.message}</Text>
                  <Text style={styles.recapSubtitle}>심은 나무: {Number.isFinite(treeCount) ? treeCount : 0}그루</Text>
                </>
              )}
            </View>
          </View>
        </ScrollView>

        <Section
          title="내가 심은 나무"
          data={sortedPlantedList.slice(0, plantedVisible)}
          onToggle={togglePlanted}
          canToggle={canTogglePlanted}
          toggleLabel={plantedExpanded ? '내역 접기' : '내역 더보기'}
          sortBy={plantedSortBy}
          onSortChange={() => setPlantedSortBy(s => s === 'height' ? 'name' : 'height')}
        />

        <Section
          title="내가 물 준 나무"
          data={sortedWateredList.slice(0, wateredVisible)}
          onToggle={toggleWatered}
          canToggle={canToggleWatered}
          toggleLabel={wateredExpanded ? '내역 접기' : '내역 더보기'}
          emptyText="아직 내역이 없어요."
          sortBy={wateredSortBy}
          onSortChange={() => setWateredSortBy(s => s === 'height' ? 'name' : 'height')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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

// ▼ Section: 토글형 "내역 더보기/접기"
function Section({
  title, data, onToggle, canToggle, toggleLabel, emptyText, sortBy, onSortChange
}: {
  title: string;
  data: TreeItemT[];
  onToggle: () => void;
  canToggle: boolean;
  toggleLabel: string;
  emptyText?: string;
  sortBy: 'height' | 'name';
  onSortChange: () => void;
}) {
  const isEmpty = data.length === 0;

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!isEmpty && (
          <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7} onPress={onSortChange}>
            <Text style={styles.sortText}>
              {sortBy === 'height' ? '높이순' : '가나다순'}
            </Text>
            <Text style={styles.sortChevron}>▾</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionBody}>
        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{emptyText ?? '목록이 비어 있어요.'}</Text>
          </View>
        ) : (
          <>
            {data.map(it => <TreeCard key={it.id} item={it} />)}

            {/* 목록이 2개 초과일 때만 토글 버튼 노출 */}
            {canToggle && (
              <TouchableOpacity style={styles.moreBtn} onPress={onToggle} activeOpacity={0.85}>
                <Text style={styles.moreBtnText}>{toggleLabel}</Text>
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

  header: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 8 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  brandName: { width: 60, height: 23, resizeMode: 'contain' },
  brandPic: { width: 60, height: 23, resizeMode: 'contain' },
  headerRight: { marginLeft: 'auto', flexDirection: 'row', gap: 5 },
  iconBtn: { padding: 5, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

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
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'cover',
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

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0.7, marginTop: 14 },

  highlightTray: { paddingHorizontal: H_MARGIN, gap: 14 },

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

  topOverlay: { position: 'absolute', top: 22, left: 30, width: '90%' },

  titleWrap: { gap: 6 },
  highlightTitleLine: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 28 },
  highlightEm: { color: '#0DBC65' },
  highlightTree: { position: 'absolute', right: -8, bottom: -6, width: 300, height: 300, resizeMode: 'contain' },

  fallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 28 },

  recapTopOverlay: { position: 'absolute', top: 22, left: 30, width: '100%', zIndex: 1 },
  recapTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 40 },
  recapFallbackTitle: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 40 },
  recapSubtitle: { marginTop: 8, fontSize: 18, color: '#6B6B6B', fontWeight: '600' },
  recapImage: { position: 'absolute', right: -200, bottom: -30, width: '180%', height: '100%', resizeMode: 'contain' },

  sectionHeader: { marginTop: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '600', color: '#0E0F11', marginLeft: 7 },
  sortBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', padding: 4 },
  sortText: { color: '#737373', fontSize: 15, marginRight: 3 },
  sortChevron: { color: '#737373', fontSize: 15 },

  sectionBody: { marginTop: 15, marginHorizontal: 14 },
  emptyWrap: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#777' },

  treeCard: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F6F6F8', borderRadius: 15, marginBottom: 5,
  },
  treeIcon: { width: 35, height: 35, marginRight: 12, resizeMode: 'contain' },
  treeName: { fontSize: 15, fontWeight: '600', color: '#0E0F11' },
  treeMeta: { fontSize: 14, color: '#A0A0A0', marginTop: 4 },
  dotMenu: { marginLeft: 13, fontSize: 25, color: '#949494' },

  moreBtn: {
    marginTop: 4, marginBottom: 6, alignSelf: 'stretch', height: 42, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F1F1',
    alignItems: 'center', justifyContent: 'center',
  },
  moreBtnText: { fontSize: 14, color: '#555' },

  listCard: { display: 'none' },
  treeRow: { display: 'none' },
  treeRowDivider: { display: 'none' },
  treeThumb: { width: 40, height: 40, borderRadius: 8, resizeMode: 'contain' },
  rowChevron: { fontSize: 22, color: '#C2C6CE', paddingHorizontal: 4 },
});
