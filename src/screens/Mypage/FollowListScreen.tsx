// file: src/screens/FollowListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CLOUDFRONT_URL } from '@env';

import {
  getUser,
  getFollowingList,
  getFollwerList, // 기존 SDK (오타지만 그대로 둠)
  getFollower,    // 개별 유저 상세
} from '../../apis/api/user';

import BasicProfileIcon from '../../assets/basic_profile.svg';
const backIcon = require('../../assets/arrow.png');

type Person = {
  id: string;
  name: string;
  profileImageUrl?: string | null;
};
type TabKey = 'followers' | 'following';
const GREEN = '#6CDF44';
const ROUTE_FRIEND = 'Friend';

const isAbs = (s?: string | null) => !!s && /^https?:\/\//i.test(s || '');

// ★★ followers 응답 스키마 보정: followerId/ followingId / fromUserId / toUserId 까지 체크
const pickUserIdFromRow = (u: any): string | undefined => {
  // 서버에 따라 팔로워 리스트는 "나를 팔로우한 사람"의 ID가 들어있음
  // 보통 followerId, fromUserId 등에 들어옴
  const cands = [
    u?.id,
    u?.userId,
    u?.followerId,
    u?.followingId,
    u?.fromUserId,
    u?.toUserId,
    u?.follower?.id,
    u?.follower?.userId,
    u?.user?.id,
    u?.user?.userId,
  ];
  const found = cands.find((v) => v != null && `${v}`.trim() !== '');
  return found != null ? String(found) : undefined;
};

const pickNameFromRow = (u: any): string => {
  const cands = [
    u?.nickname,
    u?.username,
    u?.name,
    u?.follower?.nickname,
    u?.follower?.name,
    u?.user?.nickname,
    u?.user?.name,
  ];
  const found = cands.find((v) => typeof v === 'string' && v.trim());
  return (found as string) ?? '이름';
};

const pickProfileFromRow = (u: any): string | null => {
  const cands = [
    u?.profileImage,
    u?.profileImageUrl,
    u?.avatarUrl,
    u?.follower?.profileImage,
    u?.follower?.profileImageUrl,
    u?.user?.profileImage,
    u?.user?.profileImageUrl,
  ];
  const found = cands.find((v) => typeof v === 'string' && v.trim());
  return found ? String(found) : null;
};

const mapToPersonsFollowers = (arr?: any[]): Person[] =>
  (arr ?? [])
    .map((u: any) => {
      const id = pickUserIdFromRow(u);
      const name = pickNameFromRow(u);
      const profileImageUrl = pickProfileFromRow(u);
      return { id, name, profileImageUrl };
    })
    .filter((p): p is Person => !!p.id)
    .map((p) => ({ ...p, id: String(p.id) }));

const mapToPersonsFollowing = (arr?: any[]): Person[] =>
  (arr ?? [])
    .map((u: any) => ({
      id: pickUserIdFromRow(u),
      name: pickNameFromRow(u),
      profileImageUrl: pickProfileFromRow(u),
    }))
    .filter((p): p is Person => !!p.id)
    .map((p) => ({ ...p, id: String(p.id) }));

export default function FollowListScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const initialTabParam = (route?.params?.initialTab as TabKey | undefined) ?? 'followers';
  const [tab, setTab] = useState<TabKey>(initialTabParam);

  // 친구 프로필에서 넘어온 userId (그 친구)
  const routeUserId = route?.params?.userId ? String(route.params.userId) : null;

  const [followers, setFollowers] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = route?.params?.initialTab as TabKey | undefined;
    if (next && next !== tab) setTab(next);
  }, [route?.params?.initialTab]);

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else (navigation.getParent?.() ?? navigation).navigate('Mypage');
  };

  const openFriend = (id: string) => {
    navigation.navigate(ROUTE_FRIEND, { selectedUser: { id } });
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchData = async () => {
        try {
          setLoading(true);

          // 1) 타깃 유저 결정: route → me
          let targetUserId = routeUserId;
          if (!targetUserId) {
            const me = await getUser();
            targetUserId = String(me?.userId ?? '');
          }
          if (!targetUserId) {
            console.warn('targetUserId를 찾을 수 없습니다.');
            setFollowers([]); setFollowing([]);
            return;
          }

          // 2) API가 userId 파라미터를 받지 않는 경우를 대비, 다양한 방식으로 강제 시도
          const tryGetFollowers = async (uid: string) => {
            // a) SDK가 userId를 받는 버전
            try {
              const res = await (getFollwerList as any)(uid);
              return res?.items ?? res ?? [];
            } catch (_) {}

            // b) SDK가 파라미터 없는 버전(내 팔로워만) → 이 경우엔 routeUserId와 me가 다르면 “틀린 결과”가 됨
            //    그러니 이 경로는 마지막 폴백으로만 사용
            try {
              const res = await getFollwerList();
              return res?.items ?? res ?? [];
            } catch (_) {}

            return [];
          };

          const tryGetFollowing = async (uid: string) => {
            try {
              const res = await getFollowingList(uid);
              return res?.items ?? res ?? [];
            } catch (e) {
              // 혹시 파라미터 없는 사양이면
              try {
                const res = await (getFollowingList as any)(undefined);
                return res?.items ?? res ?? [];
              } catch (_) {
                return [];
              }
            }
          };

          const [followersRaw, followingRaw] = await Promise.all([
            tryGetFollowers(targetUserId),
            tryGetFollowing(targetUserId),
          ]);

          // 3) 매핑(팔로워/팔로잉 각각 스키마 다름 대비)
          const initialFollowers = mapToPersonsFollowers(followersRaw);
          const initialFollowing = mapToPersonsFollowing(followingRaw);

          // 4) 상세 보강(프로필 이미지 절대/상대 경로 처리)
          const enrichUsers = async (users: Person[]): Promise<Person[]> => {
            const detail = await Promise.all(
              users.map(u => getFollower(u.id).catch(() => null))
            );
            return users.map((u, i) => {
              const d = detail[i] as any;
              const raw = d?.profileImage ?? d?.profileImageUrl ?? u.profileImageUrl ?? null;
              const finalUrl = isAbs(raw) ? raw : (raw ? `${CLOUDFRONT_URL}${raw}` : null);
              const name = d?.nickname || d?.username || d?.name || u.name;
              return { ...u, name, profileImageUrl: finalUrl };
            });
          };

          const [enrichedFollowers, enrichedFollowing] = await Promise.all([
            enrichUsers(initialFollowers),
            enrichUsers(initialFollowing),
          ]);

          if (!mounted) return;
          setFollowers(enrichedFollowers);
          setFollowing(enrichedFollowing);
        } catch (e) {
          console.error('팔로우 목록 로드 에러:', e);
          if (mounted) { setFollowers([]); setFollowing([]); }
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchData();
      return () => { mounted = false; };
    }, [routeUserId])
  );

  const data = tab === 'followers' ? followers : following;

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      onPress={() => openFriend(item.id)}
      activeOpacity={0.85}
      style={styles.row}
    >
      <View style={styles.avatarContainer}>
        {item.profileImageUrl ? (
          <Image source={{ uri: item.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <BasicProfileIcon width={27} height={27} />
        )}
      </View>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>팔로워 및 팔로잉</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'followers' && styles.tabActive]} onPress={() => setTab('followers')}>
          <Text style={[styles.tabText, tab === 'followers' ? styles.tabTextActive : styles.tabTextInactive]}>
            팔로워 {followers.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'following' && styles.tabActive]} onPress={() => setTab('following')}>
          <Text style={[styles.tabText, tab === 'following' ? styles.tabTextActive : styles.tabTextInactive]}>
            팔로잉 {following.length}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList<Person>
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: 'center', color: '#777' }}>목록이 비어 있어요.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#111' },
  headerSpacer: { width: 40 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: GREEN },
  tabText: { fontSize: 17, fontWeight: '500' },
  tabTextActive: { color: '#111' },
  tabTextInactive: { color: '#999999' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  avatarContainer: {
    width: 40, height: 40, borderRadius: 24, marginRight: 12,
    backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 16, color: '#111' },
  separator: { height: 1, backgroundColor: '#EFEFEF', marginLeft: 80 },
});
