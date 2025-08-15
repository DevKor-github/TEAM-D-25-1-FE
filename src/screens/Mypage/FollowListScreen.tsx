// src/screens/FollowListScreen.tsx
import React, {useState, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const backIcon = require('../../assets/arrow.png');
const profilePng = require('../../assets/image/profile.png');

type Person = { id: string; name: string; handle: string };

const FOLLOWER_COUNT_LABEL = 51;
const FOLLOWING_COUNT_LABEL = 74;
const GREEN = '#6CDF44';

export default function FollowListScreen({navigation}: any) {
  const [tab, setTab] = useState<'followers' | 'following'>('followers');

  const followers: Person[] = useMemo(
    () => [
      {id: '1', name: '지우', handle: '@oxxyi0'},
      {id: '2', name: '태현', handle: '@taehyun9034'},
      {id: '3', name: '해인', handle: '@pm_dcaffeine'},
      {id: '4', name: '돈까스킬러', handle: '@pig_the_katsu'},
      {id: '5', name: '민쭈짱😎', handle: '@songsongsong'},
      {id: '6', name: '주웅', handle: '@baejewoong'},
      {id: '7', name: 'SEIN', handle: '@id_1234'},
      {id: '8', name: '이름', handle: '@id_1234'},
    ],
    [],
  );

  const following: Person[] = useMemo(
    () => [
      {id: '9', name: '지우', handle: '@oxxyi0'},
      {id: '10', name: '태현', handle: '@taehyun9034'},
      {id: '11', name: '해인', handle: '@pm_dcaffeine'},
      {id: '12', name: '돈까스킬러', handle: '@pig_the_katsu'},
      {id: '13', name: '민쭈짱😎', handle: '@songsongsong'},
      {id: '14', name: '주웅', handle: '@baejewoong'},
      {id: '15', name: 'SEIN', handle: '@id_1234'},
      {id: '16', name: '이름', handle: '@id_1234'},
    ],
    [],
  );

  const data = tab === 'followers' ? followers : following;

  // ✅ 항상 MyPage로 이동 (탭 네비 안에 있으면 부모로 이동)
  const goToMyPage = () => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate('Mypage');
    else navigation.navigate('Mypage');
  };

  const renderItem = ({item}: {item: Person}) => (
    <View style={styles.row}>
      <Image source={profilePng} style={styles.avatar} />
      <View style={{flex: 1}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.handle}>{item.handle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToMyPage}
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
              tab === 'followers' ? styles.tabTextActive : styles.tabTextInactive,
            ]}>
            팔로워 {FOLLOWER_COUNT_LABEL}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'following' && styles.tabActive]}
          onPress={() => setTab('following')}>
          <Text
            style={[
              styles.tabText,
              tab === 'following' ? styles.tabTextActive : styles.tabTextInactive,
            ]}>
            팔로잉 {FOLLOWING_COUNT_LABEL}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{paddingBottom: 12}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#FFF'},
  header: {height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14},
  backBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  backIcon: {width: 22, height: 22, resizeMode: 'contain'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#111'},
  headerSpacer: {width: 40},

  tabs: {flexDirection: 'row', paddingHorizontal: 20, marginTop: 8},
  tab: {flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent'},
  tabActive: {borderBottomColor: GREEN},
  tabText: {fontSize: 17, fontWeight: '500'},
  tabTextActive: {color: '#111'},
  tabTextInactive: {color: '#999999'},

  row: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14},
  avatar: {width: 48, height: 48, borderRadius: 24, marginRight: 12},
  name: {fontSize: 16, color: '#111', marginBottom: 2},
  handle: {fontSize: 14, color: '#8D8D8D'},

  separator: {height: 1, backgroundColor: '#EFEFEF', marginLeft: 80},
});
