// src/screens/FollowListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { getUser, getFollowingList, getFollwerList, type UserSummary } from '../../apis/api/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const backIcon = require('../../assets/arrow.png');
const profilePng = require('../../assets/image/profile.png');

type Person = { id: string; name: string };
const GREEN = '#6CDF44';

const mapToPersons = (arr?: UserSummary[] | any[]): Person[] =>
  (arr ?? []).map((u: any) => ({
    id: u.id ?? String(Math.random()),
    name: u.nickname || u.username || '이름',
  }));

export default function FollowListScreen({ navigation, route }: any) {
  const [tab, setTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // ✅ 뒤로가기: 있으면 goBack, 없으면 탭의 MyPage로 이동(보텀탭 유지용)
  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      const parent = navigation.getParent?.();
      if (parent) parent.navigate('Mypage');
      else navigation.navigate('Mypage');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const me = await getUser();
        const userId: string | undefined = route?.params?.userId ?? me?.id;
        if (!userId) {
          console.warn('userId를 찾을 수 없습니다.');
          return;
        }
        const [followersRes, followingRes] = await Promise.all([
          getFollwerList(),
          getFollowingList(userId),
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
    return () => { mounted = false; };
  }, [route?.params?.userId]);

  const data = tab === 'followers' ? followers : following;

  const renderItem = ({ item }: { item: Person }) => (
    <View style={styles.row}>
      <Image source={profilePng} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>팔로워 및 팔로잉</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'followers' && styles.tabActive]}
          onPress={() => setTab('followers')}>
          <Text
            style={[
              styles.tabText,
              tab === 'followers'
                ? styles.tabTextActive
                : styles.tabTextInactive,
            ]}>
            팔로워 {followers.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'following' && styles.tabActive]}
          onPress={() => setTab('following')}>
          <Text
            style={[
              styles.tabText,
              tab === 'following'
                ? styles.tabTextActive
                : styles.tabTextInactive,
            ]}>
            팔로잉 {following.length}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList<Person>
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{paddingBottom: 12}}
          ListEmptyComponent={
            <View style={{padding: 20}}>
              <Text style={{textAlign: 'center', color: '#777'}}>
                목록이 비어 있어요.
              </Text>
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
