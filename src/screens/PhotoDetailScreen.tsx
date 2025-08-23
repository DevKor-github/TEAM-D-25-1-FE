// src/screens/PhotoDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Text,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { getFollower } from '../apis/api/user';
import { getTreeDetail } from '../apis/api/tree';
import BasicProfileIcon from '../assets/basic_profile.svg';
import {CLOUDFRONT_URL} from '@env';

const { width, height } = Dimensions.get('window');

// 왼쪽 화살표 PNG만 불러오기
const chevron = require('../assets/chevron-left.png');
const defaultProfileImage = require('../assets/image/profile.png'); // 네가 말해준 경로

export default function PhotoDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const title = route.params?.title ?? '카페 브레송';

  const total = route.params?.total ?? 0;
  const imgData = route.params?.images ?? [];

  console.log('img', imgData);
  const [currentIndex, setCurrentIndex] = useState(
    route.params?.startIndex as number,
  );
  const [profileImage, setProfileImage] = useState();
  const [nickname, setNickname] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  const date = imgData[currentIndex].addedDate;
  console.log(imgData[currentIndex]);

  // 더미 사진 배열
  // const images = [
  //   require('../assets/dummypic.png'),
  //   require('../assets/dummypic.png'),
  //   require('../assets/dummypic.png'),
  // ];
  //const total = images.length;

  const goPrev = () => setCurrentIndex(i => (i > 0 ? i - 1 : total - 1));
  const goNext = () => setCurrentIndex(i => (i < total - 1 ? i + 1 : 0));

  const formatKoreanDate = (dateString: Date) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');

    return `${year}.${formattedMonth}.${formattedDay}`;
  };

  useEffect(() => {
    // Define an async function inside the effect
    const fetchFollower = async () => {
      try {
        // Check if imgData[currentIndex] exists to prevent errors
        if (imgData && imgData[currentIndex] && imgData[currentIndex].userId) {
          const res = await getFollower(imgData[currentIndex].userId);
          console.log('User', res);
          setProfileImage(res.profileImage);
          setNickname(res.nickname);

          console.log('profileImage', profileImage);
          console.log('nickname', nickname);
        }
      } catch (e) {
        console.error('유저를 불러오지 못했습니다.', e);
      }
    };
    const fetchTreeData = async () => {
      try {
        // Check if imgData[currentIndex] exists to prevent errors
        if (imgData && imgData[currentIndex] && imgData[currentIndex].userId) {
          const res = await getTreeDetail(imgData[currentIndex].treeId);
          console.log('Tree', res);
          setCreatedAt(formatKoreanDate(res.createdAt));
          console.log('createdAt', createdAt);
        }
      } catch (e) {
        console.error('tree를 불러오지 못했습니다.', e);
      }
    };

    // Call the async function
    fetchFollower();
    fetchTreeData();
  }, [imgData, currentIndex, profileImage, nickname, createdAt]);

  return (
    <SafeAreaView style={styles.root}>
      {/* 상단 TopBar (중앙 타이틀) */}
      <TopBar
        onPressBack={() => navigation.goBack()}
        bookmarkDisabled
        style={{backgroundColor: '#232323'}}
        iconSize={30}
        title={title}
        titleStyle={{color: '#fff', fontSize: 20, fontWeight: '600'}}
      />

      <View style={styles.viewer}>
        <Image
          source={{uri: imgData[currentIndex].imageUri}}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* 좌/우 화살표 */}
        <TouchableOpacity
          style={[styles.arrowBtn, {left: 16}]}
          onPress={goPrev}
          activeOpacity={0.7}>
          <Image source={chevron} style={styles.arrowImg} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.arrowBtn, {right: 13}]}
          onPress={goNext}
          activeOpacity={0.8}>
          <Image
            source={chevron}
            style={[styles.arrowImg, {transform: [{rotate: '180deg'}]}]}
          />
        </TouchableOpacity>

        {/* 페이지 인디케이터 */}
        <View style={styles.pagePill}>
          <Text style={styles.pagePillText}>
            {currentIndex + 1} / {total}
          </Text>
        </View>
      </View>

      {/* 하단 프로필 영역 */}
      <View style={styles.metaSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {profileImage ? (
              <Image
                source={{
                  uri: CLOUDFRONT_URL + profileImage,
                }}
                style={styles.avatarImg}
              />
            ) : (
              <BasicProfileIcon width={50} height={50} />
            )}
          </View>

          <View style={{marginLeft: 10}}>
            <Text style={styles.nick}>{nickname}</Text>
            <Text style={styles.date}>{createdAt}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const VIEWER_HEIGHT = height * 0.48; // 사진 영역 높이

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#232323'},

  /**
   * 사진 뷰어
   * - TopBar 아래로 약간의 여백만 두고, 화면 상단 쪽에 붙여 배치
   * - 내부에 화살표/인디케이터를 absolute로 배치
   */
  viewer: {
    width: '100%',
    height: VIEWER_HEIGHT,
    marginTop: 130, //사진위치조저ㅡㅇ할때
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: width,
    height: '75%',
  },

  /* 좌/우 화살표 */
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 35,
    height: 35,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowImg: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    resizeMode: 'contain',
  },

  /* 페이지 인디케이터 */
  pagePill: {
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pagePillText: {color: '#fff', fontSize: 13, fontWeight: '600'},

  /* 하단 프로필 */
  metaSection: {
    paddingHorizontal: 20,
    paddingVertical: 140,
  },
  profileRow: {flexDirection: 'row', alignItems: 'center'},

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    resizeMode: 'cover',
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
  nick: {color: '#fff', fontSize: 17, fontWeight: '500', marginLeft: 10},
  handle: {color: '#999', fontSize: 17, fontWeight: '400', marginLeft: 10},
  date: {color: '#9a9a9a', fontSize: 15, marginTop: 5, marginLeft: 10},
});
