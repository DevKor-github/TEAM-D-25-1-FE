// src/screens/CafeDetailScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import PrimaryButton from '../components/PrimaryButton';
import CommentBubble from '../components/CommentBubble';
import { getRestaurant, postTreeWater } from '../apis/api/tree';
import { Restaurant } from '../types/tree';
import WateredIcon from '../assets/watered.svg';
import { getFollower } from '../apis/api/user';
import { CLOUDFRONT_URL } from '@env';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 400;
const TREE_WIDTH = 300;
const TREE_HEIGHT = 320;
const BUTTON_HEIGHT = 48;
const BUTTON_GAP = 10;

const PANEL_W = 120;
const PANEL_H = 110;
const PANEL_BOTTOM = 60;
const PANEL_SHIFT_X = 110;

type TreeSlide = {
  id: string;
  nickname: string;
  review: string;
  levelText: string;
  infoText: string;
  img: any;
  profileImageURl: any;
};

type ImgData = {
  imageUri: any;
  userId: string;
  treeId: string;
};

type CafeDetailRouteParams = { restaurant: Restaurant };
type CafeDetailScreenRouteProp = RouteProp<{ CafeDetail: CafeDetailRouteParams }, 'CafeDetail'>;

export default function CafeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CafeDetailScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const {restaurant} = route.params;

  const [bookmarked, setBookmarked] = useState(false);
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([]);
  const [treeSlides, setTreeSlides] = useState<TreeSlide[]>([]);
  const [imgData, setImgData] = useState<ImgData[]>([]);
  const [remainPhotos, setRemainPhotos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(0);
  const pagerRef = useRef<ScrollView>(null);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastCount, setToastCount] = useState<number>(0);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (count: number) => {
    setToastCount(count);
    setToastVisible(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 2000);
    });
  };

  const sheetDynamicStyle = {
    minHeight: height - HERO_HEIGHT + 100,
    paddingBottom: insets.bottom + BUTTON_HEIGHT + BUTTON_GAP + 16,
  };

  const onHeroMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    setPage(idx);
  };

  const goToPage = (idx: number) => {
    pagerRef.current?.scrollTo({x: width * idx, y: 0, animated: true});
    setPage(idx);
  };

  useEffect(() => {
    console.log('imgData', imgData); // 3. 상태가 업데이트된 후 이 코드가 실행되어 imgData의 새 값이 출력됩니다.
  }, [imgData]); // 의존성 배열에 imgData를 추가

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);

        const treeId = restaurant.treeId;
        const restaurantId = treeId.split('_')[1];

        const data = await getRestaurant(restaurantId);
        console.log('data', data);
        if (Array.isArray(data) && data.length > 0) {
          setRestaurantList(data);


          const slides = data.map(item => ({
            id: item.treeId,
            levelText: `나무 ${item.treeType + 1}단계`,
            // ▼▼▼ 이 부분에 요청하신 텍스트를 추가합니다. ▼▼▼
            infoText: `참나무 · ${item.recommendationCount} M`,
            img: {uri: item.images[0] || ''},
            profileImageURl:
              item.profileImageUrl? CLOUDFRONT_URL + item.profileImageUrl : null,
            review: item.review || '한줄평이 없습니다.',
            nickname: item.nickname,
          }));
          setTreeSlides(slides);
          console.log('treeSlide', treeSlides);
          

          const allImages = data.flatMap(r => r.images);
          // {
          //   return r.images.map((imageUri: any) => ({
          //     imageUri: imageUri,
          //     userId: r.userId,

          //   })
          //   );
          // })

          const imagesWithUser = data.flatMap(r =>
            // r.images);
            {
              return r.images.map((imageUri: any) => ({
                imageUri: imageUri,
                userId: r.userId,
                treeId: r.treeId,
              }));
            },
          );

          console.log('imagesWithUser', imagesWithUser);

          setImgData(imagesWithUser);
          console.log('allImages', allImages);
          console.log('imgData', imgData);
          setRemainPhotos(Math.max(0, allImages.length - 3));
        } else {
          setRestaurantList([]);
          setTreeSlides([]);
          setImgData([]);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant data:', error);
        setRestaurantList([]);
        setTreeSlides([]);
        setImgData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurant) fetchRestaurantData();
  }, [restaurant]);

  if (isLoading || restaurantList.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  const mainRestaurantData = restaurantList[0];
  const {name, address} = mainRestaurantData;
  const allImages = restaurantList.flatMap(r => r.images);
  // {
  //   return r.images.map((imageUri: any) => ({
  //     imageUri: imageUri
  //   }));
  // }
  // );
  console.log('초기화인가');
  console.log(allImages);
  const goPhotoDetail = (startIndex: number) => {
    navigation.navigate('PhotoDetail', {
      title: name,
      startIndex,
      total: allImages.length,
      images: imgData,
    });
  };

  const onPressWater = async (treeId: string) => {
    try {
      await postTreeWater(treeId);
      const current = restaurantList[page] ?? restaurantList[0];
      const count = Number(current?.recommendationCount ?? 0);
      showToast(count);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.root]}>
      <TopBar
        onPressBack={() => navigation.goBack()}
        onPressBookmark={() => setBookmarked(b => !b)}
        bookmarked={bookmarked}
        iconSize={30}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 히어로 */}
        <View style={styles.hero}>
          <Image
            source={
              allImages[0]
                ? {uri: allImages[0]}
                : require('../assets/dummypic.png')
            }
            style={styles.heroBackground}
            resizeMode="cover"
          />
          <View pointerEvents="none" style={styles.heroOverlay} />

          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onHeroMomentumEnd}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            style={[StyleSheet.absoluteFill, {zIndex: 3}]}
            contentContainerStyle={{height: HERO_HEIGHT}}>
            {treeSlides.map(slide => (
              <View
                key={slide.id}
                style={{
                  width,
                  height: HERO_HEIGHT,
                  justifyContent: 'flex-end',
                }}>
                <CommentBubble
                  name={slide.nickname}
                  text={slide.review}
                  style={{
                    position: 'absolute',
                    top: insets.top + 28,
                    zIndex: 4,
                  }}
                  avatar={slide.profileImageURl}
                />

                <View style={styles.treeWrapper}>
                  <Image
                    source={require('../assets/extree.png')}
                    style={styles.treeImg}
                    resizeMode="contain"
                  />
                  <View style={styles.panelGroup}>
                    <Image
                      source={require('../assets/wood_panel.png')}
                      style={styles.woodPanelImg}
                      resizeMode="contain"
                    />
                    <View style={styles.signTextBox}>
                      <Text style={styles.signLine1}>{slide.levelText}</Text>
                      <Text style={styles.signLine2}>{slide.infoText}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 시트 */}
        <View style={[styles.sheet, sheetDynamicStyle]}>
          <View style={styles.pagerOnCard}>
            {treeSlides.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => goToPage(idx)}
                activeOpacity={0.8}
                style={[styles.dot, idx === page && styles.activeDot]}
              />
            ))}
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>{restaurant.name}</Text>
          </View>
          <Text style={styles.address}>{restaurant.address}</Text>
          <View style={styles.photoView}>
            {imgData.length == 0 ? (
              // 사진이 0개경우
              <>
                <Image
                  source={require('../assets/dummypic.png')}
                  style={styles.Image0_1}
                  resizeMode="cover"
                />
              </>
            ) : allImages.length === 1 ? (
              // 사진이 1개경우
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => goPhotoDetail(0)}>
                  <Image
                    source={
                      imgData[0].imageUri
                        ? {uri: imgData[0].imageUri}
                        : require('../assets/dummypic.png')
                    }
                    style={styles.Image0_1}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </>
            ) : allImages.length === 2 ? (
              // 사진이 2개일 경우
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => goPhotoDetail(0)}
                  style={{height: '100%', width: '50%'}}>
                  <Image
                    source={
                      imgData[0].imageUri
                        ? {uri: imgData[0].imageUri}
                        : require('../assets/dummypic.png')
                    }
                    style={styles.Image0_2}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => goPhotoDetail(1)}
                  style={{height: '100%', width: '100%'}}>
                  <Image
                    source={
                      imgData[1].imageUri
                        ? {uri: imgData[1].imageUri}
                        : require('../assets/dummypic.png')
                    }
                    style={styles.Image1_2}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </>
            ) : allImages.length === 3 ? (
              // 사진이 3개일 경우
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => goPhotoDetail(0)}
                  style={{height: '100%', width: '50%'}}>
                  <Image
                    source={
                      imgData[0].imageUri
                        ? {uri: imgData[0].imageUri}
                        : require('../assets/dummypic.png')
                    }
                    style={styles.Image0_3}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View style={styles.photoViewVertical}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => goPhotoDetail(1)}
                    style={{height: '50%', width: '100%'}}>
                    <Image
                      source={
                        imgData[1].imageUri
                          ? {uri: imgData[1].imageUri}
                          : require('../assets/dummypic.png')
                      }
                      style={styles.Image1_3}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => goPhotoDetail(2)}
                    style={{height: '50%', width: '100%'}}>
                    <Image
                      source={
                        imgData[2].imageUri
                          ? {uri: imgData[2].imageUri}
                          : require('../assets/dummypic.png')
                      }
                      style={styles.Image2_3}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // 사진이 3개 초과일 경우 (3개 이상)
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => goPhotoDetail(0)}
                  style={{height: '100%', width: '50%'}}>
                  <Image
                    source={
                      imgData[0].imageUri
                        ? {uri: imgData[0].imageUri}
                        : require('../assets/dummypic.png')
                    }
                    style={styles.Image0_3}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View style={styles.photoViewVertical}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => goPhotoDetail(1)}
                    style={{height: '50%', width: '100%'}}>
                    <Image
                      source={
                        imgData[1].imageUri
                          ? {uri: imgData[1].imageUri}
                          : require('../assets/dummypic.png')
                      }
                      style={styles.Image1_3}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  <View style={styles.imageContainer_4}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => goPhotoDetail(2)}>
                      <Image
                        source={
                          imgData[2].imageUri
                            ? {uri: imgData[2].imageUri}
                            : require('../assets/dummypic.png')
                        }
                        style={styles.Image2_4}
                        resizeMode="cover"
                      />
                      <View style={styles.overlay}>
                        <Text style={styles.plusText}>
                          +{allImages.length - 3}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View
        style={[styles.actionWrapper, {bottom: insets.bottom + BUTTON_GAP}]}>
        <PrimaryButton
          label="물주기"
          onPress={() => onPressWater(restaurant.treeId)}
        />
      </View>

      {/* 물주기 토스트 */}
      {toastVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.waterToast,
            {bottom: insets.bottom + BUTTON_GAP, opacity: toastOpacity},
          ]}>
          <Text style={styles.waterToastText} numberOfLines={1}>
            {`‘${restaurant.name}’에 물을 주었어요!`}
          </Text>
          <View style={styles.waterToastRight}>
            <WateredIcon width={20} height={20} />
            <Text style={styles.waterToastCount}>{toastCount}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#fff'},
  scrollContent: {paddingBottom: 0},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  hero: {height: HERO_HEIGHT, justifyContent: 'flex-end', overflow: 'visible'},
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1,
  },
  treeWrapper: {
    position: 'absolute',
    top: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  treeImg: {width: TREE_WIDTH, height: TREE_HEIGHT},
  panelGroup: {
    position: 'absolute',
    width: PANEL_W,
    height: PANEL_H,
    bottom: PANEL_BOTTOM,
    marginLeft: PANEL_SHIFT_X,
    zIndex: 5,
  },
  woodPanelImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  signTextBox: {
    position: 'absolute',
    top: Math.round(PANEL_H * 0.245),
    left: Math.round(PANEL_W * 0.22),
    width: Math.round(PANEL_W * 0.6),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  signLine1: {
    fontSize: 11,
    fontWeight: '400',
    color: '#623A0E',
    fontFamily: 'pannel',
  },
  signLine2: {
    fontSize: 12,
    color: '#623A0E',
    marginTop: 1.5,
    fontFamily: 'pannel',
  },
  sheet: {
    marginTop: -70,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 5,
    zIndex: 1,
  },
  pagerOnCard: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 25,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5D5D5',
    marginHorizontal: 3,
  },
  activeDot: {backgroundColor: '#3C3C3C'},
  titleRow: {flexDirection: 'row', alignItems: 'baseline'},
  title: {fontSize: 20, fontWeight: '600'},
  address: {fontSize: 14, color: '#767676', fontWeight: '400', marginTop: 6},
  photoScrollView: {marginTop: 14},
  photoScrollContainer: {flexDirection: 'row', gap: 8},
  scrollImage: {width: 150, height: 150, borderRadius: 4},
  actionWrapper: {position: 'absolute', left: 16, right: 16},

  // Toast
  waterToast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  waterToastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
    flexShrink: 1,
    marginRight: 12,
  },
  waterToastRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  waterToastCount: {color: '#fff', fontSize: 14, fontWeight: '400'},
  photoView: {
    // This style is for the container that holds all three images.
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    height: 180,
    paddingRight: 10,
    paddingLeft: 10,
  },
  Image0_1: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  Image0_2: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  Image1_2: {
    width: '50%',
    height: '100%',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  Image0_3: {
    // Style for the first image
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  photoViewVertical: {
    width: '50%',
    height:'100%',
    flexDirection: 'column',
  },
  Image1_3: {
    // Style for the second image
    width: '100%',
    height: '100%',
    borderTopRightRadius: 10,
  },
  Image2_3: {
    // Style for the third image
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 10,
  },
  imageContainer_4: {
    // A wrapper to position the overlay relative to the image
    position: 'relative',
    width: '100%',
    height: '50%',
    borderBottomRightRadius: 10,
  },
  Image2_4: {
    // Style for the third image
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 10,
  },
  overlay: {
    // The gray, semi-transparent layer
    ...StyleSheet.absoluteFillObject, // Fills the parent container
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black with 50% opacity

    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    // The text for the photo count
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});