import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
  Text,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TopBarProps = {
  onPressBack: () => void;
  onPressBookmark?: () => void;
  bookmarked?: boolean;
  style?: ViewStyle;
  iconSize?: number;
  toastPlaceholder?: React.ReactNode;
  bookmarkDisabled?: boolean;
  /** 가운데 제목(옵션) */
  title?: string;
  titleStyle?: TextStyle;
};

const backIcon = require('../assets/chevron-left.png');
const bookmarkOutline = require('../assets/bookmark.png');

export default function TopBar({
  onPressBack,
  onPressBookmark,
  bookmarked = false,
  style,
  iconSize = 28,
  toastPlaceholder,
  bookmarkDisabled = false,
  title,
  titleStyle,
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        style,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.inner}>
        {/* 왼쪽: 뒤로가기 */}
        <TouchableOpacity
          accessibilityLabel="뒤로가기"
          onPress={onPressBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.touch}
        >
          <Image
            source={backIcon}
            style={{ width: iconSize, height: iconSize, resizeMode: 'contain', tintColor: '#fff' }}
          />
        </TouchableOpacity>

        {/* 가운데 제목: 절대 배치로 중앙 고정 (아이콘 레이아웃에 영향 없음) */}
        {Boolean(title) && (
          <View pointerEvents="none" style={styles.centerTitleWrap}>
            <Text style={[styles.centerTitle, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* 북마크 */}
        <TouchableOpacity
          accessibilityLabel="북마크"
          onPress={bookmarkDisabled ? undefined : onPressBookmark}
          disabled={bookmarkDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.touch, bookmarkDisabled && { opacity: 0.7 }]}
        >
          <Image
            source={bookmarkOutline}
            style={{ width: iconSize, height: iconSize, resizeMode: 'contain', tintColor: '#fff' }}
          />
        </TouchableOpacity>
      </View>

      {toastPlaceholder && <View style={styles.toastWrapper}>{toastPlaceholder}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  inner: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  touch: { padding: 4 },

  /*가운데 제목 중앙*/
  centerTitleWrap: {
    position: 'absolute',
    left: 56,                 // 좌측 아이콘 영역 제외
    right: 56,                // 우측 아이콘 영역 
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  toastWrapper: {
    position: 'absolute',
    bottom: -8,
    left: 0, right: 0,
    alignItems: 'center',
  },
});
