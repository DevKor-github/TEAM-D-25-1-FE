// file: src/screens/FollowListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { getUser, getFollowingList, getFollwerList, type UserSummary } from '../../apis/api/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const backIcon = require('../../assets/arrow.png');
const profilePng = require('../../assets/image/profile.png');

type Person = { id: string; name: string };
type TabKey = 'followers' | 'following';
const GREEN = '#6CDF44';

const mapToPersons = (arr?: UserSummary[] | any[]): Person[] =>
  (arr ?? []).map((u: any) => ({
    id: u.id ?? String(Math.random()),
    name: u.nickname || u.username || '이름',
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

  // ✅ 포커스될 때마다 userId 재해석 후 로드
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const coerceId = (v: any) =>
        v == null ? undefined : typeof v === 'string' ? v : String(v);

      (async () => {
        try {
          setLoading(true);

          // 1) 우선 라우트 파라미터에서
          const paramId = coerceId(route?.params?.userId ?? route?.params?.user?.id);

          // 2) 없으면 내 계정에서 (✅ me.userId 를 사용)
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
            getFollwerList(),         // /users/me/followers (본인 기준)
            getFollowingList(userId), // 대상 유저 기준
          ]);

          if (!mounted) return;

          setFollowers(mapToPersons(followersRes?.items ?? followersRes));
          setFollowing(mapToPersons(followingRes ?? []));
        } catch (e) {
          console.error('팔로우 목록 로드 에러:', e);
        } finally {
          if (mounted) setLoading(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [route?.params?.userId])
  );

  const data = tab === 'followers' ? followers : following;

  const renderItem = ({ item }: { item: Person }) => (
    <View style={styles.row}>
      <Image source={profilePng} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>팔로워 및 팔로잉</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
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
          keyExtractor={item => item.id}
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
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 6 },
  avatar: { width: 50, height: 48, borderRadius: 24, marginRight: 12 },
  name: { fontSize: 16, color: '#111', paddingTop: 6 },
  separator: { height: 1, backgroundColor: '#EFEFEF', marginLeft: 80 },
});
