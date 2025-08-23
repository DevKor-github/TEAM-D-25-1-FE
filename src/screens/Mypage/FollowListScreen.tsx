// file: src/screens/FollowListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { getUser, getFollowingList, getFollwerList, type UserSummary, getFollower, getFollwingList } from '../../apis/api/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CLOUDFRONT_URL } from '@env';

// ▼▼▼ 1. SVG 아이콘을 import하고, 기존 PNG import는 제거합니다. ▼▼▼
import BasicProfileIcon from '../../assets/basic_profile.svg'; 
const backIcon = require('../../assets/arrow.png');

type Person = {
  id: string;
  name: string;
  profileImageUrl?: string | null; // 프로필 이미지 URL을 저장할 필드 추가
};
type TabKey = 'followers' | 'following';
const GREEN = '#6CDF44';
const ROUTE_FRIEND = 'Friend';

// id, name, profileImageUrl을 매핑하도록 수정
const mapToPersons = (arr?: UserSummary[] | any[]): Person[] =>
  (arr ?? [])
    .map((u: any) => ({
      id: u?.id ?? u?.userId,
      name: u?.nickname || u?.username || '이름',
      profileImageUrl: u?.profileImageUrl || u?.profileImage, // 프로필 이미지 URL 매핑
    }))
    .filter((p: any) => p.id != null)
    .map((p: any) => ({
      id: String(p.id),
      name: p.name,
      profileImageUrl: p.profileImageUrl,
    }));

export default function FollowListScreen({ navigation, route }: any) {
  const initialTabParam = (route?.params?.initialTab as TabKey | undefined) ?? 'followers';
  const [tab, setTab] = useState<TabKey>(initialTabParam);

  const [followers, setFollowers] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

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
      const coerceId = (v: any) => (v == null ? undefined : String(v));

      (async () => {
        try {
          setLoading(true);
          const paramId = coerceId(route?.params?.userId ?? route?.params?.user?.id);
          let userId = paramId;
          if (!userId) {
            const me = await getUser();
            userId = coerceId(me?.userId);
          }
          if (!userId) {
            console.warn('userId를 찾을 수 없습니다.');
            return;
          }

          const [followersRes, followingRes] = await Promise.all([
            getFollwerList(),
            getFollowingList(userId),
          ]);

          setFollowers(mapToPersons(followersRes?.items ?? followersRes));
          setFollowing(mapToPersons(followingRes ?? []));
          console.log('rawfollowers', followers);
          console.log('rawfollowing', following);

          const enrichedFollowers = [];
          for (const f of followers) {
            
            try {
              const detail = await getFollower(f.id);
              console.log('detail',detail)
              enrichedFollowers.push({
                ...f,
                profileImageUrl: detail?.profileImage
                ? CLOUDFRONT_URL+detail.profileImage
                : undefined,
              });
            } catch (e) {
              console.warn(`getFollower(${f.id}) 실패:`, e);
              enrichedFollowers.push(f); // 실패하면 원본 유지
            }
          }
          // const enrichedFollowing = [];
          // for (const f of following) {
            
          //   try {
          //     const detail = await getFollower(f.id);
          //     console.log('detail',detail)
          //     enrichedFollowing.push({
          //       ...f,
          //       profileImageUrl: detail?.profileImage
          //       ? CLOUDFRONT_URL+detail.profileImage
          //       : undefined,
          //     });
          //   } catch (e) {
          //     console.warn(`getFollowing(${f.id}) 실패:`, e);
          //     enrichedFollowing.push(f); // 실패하면 원본 유지
          //   }
          // }

          setFollowers(enrichedFollowers);
          //setFollowing(enrichedFollowing);
          

          if (!mounted) return;
          

          

          console.log('followers', followers);
          console.log('following', following);
        } catch (e) {
          console.error('팔로우 목록 로드 에러:', e);
        } finally {
          if (mounted) setLoading(false);
        }
      })();

      return () => { mounted = false; };
    }, [route?.params?.userId])
  );



  const data = tab === 'followers' ? followers : following;

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      onPress={() => openFriend(item.id)}
      activeOpacity={0.85}
      style={styles.row}
    >
      {/* ▼▼▼ 2. 프로필 이미지 URL 유무에 따라 조건부 렌더링 ▼▼▼ */}
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
  // ▼▼▼ 3. 아바타 관련 스타일 수정 및 추가 ▼▼▼
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#EFEFEF', // 기본 배경색
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // 이미지가 밖으로 나가지 않도록
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: { fontSize: 16, color: '#111' },
  separator: { height: 1, backgroundColor: '#EFEFEF', marginLeft: 80 },
});