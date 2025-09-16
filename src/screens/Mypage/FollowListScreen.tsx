// file: src/screens/FollowListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { getUser, getFollowingList, getFollwerList, getFollower, type UserSummary } from '../../apis/api/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CLOUDFRONT_URL } from '@env';

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

// ▼▼▼ [수정 1] filter 부분에 `p is Person` 타입 가드를 추가하여 빨간 줄을 해결합니다. ▼▼▼
const mapToPersons = (arr?: any[]): Person[] =>
  (arr ?? [])
    .map((u: any) => ({
      id: u?.id ?? u?.userId,
      name: u?.nickname ?? u?.username ?? u?.name ?? '이름',
      profileImageUrl: u?.profileImage ?? u?.profileImageUrl ?? null,
    }))
    // 이 필터를 통과한 객체 p는 Person 타입임을 TypeScript에 명확히 알려줍니다.
    .filter((p): p is Person => p.id != null) 
    .map((p) => ({ ...p, id: String(p.id) }));

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

      const fetchData = async () => {
        try {
          setLoading(true);
          const me = await getUser();
          // me?.userId가 없을 경우를 대비하여 확실하게 문자열로 변환합니다.
          const userId = String(me?.userId ?? '');

          if (!userId) {
            console.warn('userId를 찾을 수 없습니다.');
            setLoading(false);
            return;
          }

          const [followersRes, followingRes] = await Promise.all([
            getFollwerList(),
            getFollowingList(userId),
          ]);
          
          // ▼▼▼ [수정 2] state 업데이트 시점 문제를 해결하는 로직입니다. ▼▼▼
          // 1. API 응답을 state가 아닌 임시 로컬 변수에 먼저 저장합니다.
          const initialFollowers = mapToPersons(followersRes?.items ?? []);
          const initialFollowing = mapToPersons(followingRes ?? []);

          // 2. 각 사용자의 상세 정보를 병렬(Promise.all)로 효율적으로 가져옵니다.
          const enrichUsers = async (users: Person[]): Promise<Person[]> => {
            const detailPromises = users.map(user => 
              getFollower(user.id).catch(e => {
                console.warn(`getFollower(${user.id}) 실패:`, e);
                return user; // 실패 시 원본 사용자 정보 반환
              })
            );
            const detailedUsers = await Promise.all(detailPromises);
            
            return users.map((originalUser, index) => {
              const detail = detailedUsers[index];
              const profileImage = detail?.profileImage ?? detail?.profileImageUrl;
              return {
                ...originalUser,
                profileImageUrl: profileImage ? `${CLOUDFRONT_URL}${profileImage}` : null,
              };
            });
          };

          const [enrichedFollowers, enrichedFollowing] = await Promise.all([
            enrichUsers(initialFollowers),
            enrichUsers(initialFollowing)
          ]);

          if (!mounted) return;

          // 3. 모든 정보가 합쳐진 최종 배열로 state를 "한 번에" 업데이트합니다.
          setFollowers(enrichedFollowers);
          setFollowing(enrichedFollowing);

        } catch (e) {
          console.error('팔로우 목록 로드 에러:', e);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchData();

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