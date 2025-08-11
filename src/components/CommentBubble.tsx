import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';

type Props = {
  name: string;
  text: string;
  style?: ViewStyle; 
  avatar?: ImageSourcePropType;
};

const defaultAvatar = require('../assets/image/profile.png'); //일단 프로필 사진 하나루..몽땅

export default function CommentBubble({ name, text, style, avatar = defaultAvatar }: Props) {
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Image source={avatar} style={styles.avatar} />

      <View style={styles.right}>
        {/* 이름 배지 */}
        <View style={styles.namePill}>
          <Text style={styles.nameText}>{name}</Text>
        </View>

        {/* 말풍선 + 꼬리 */}
        <View style={styles.bubbleWrap}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText} numberOfLines={2}>
              {text}
            </Text>
          </View>
          {/* 꼬리 (border trick) */}
          <View style={styles.tail} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  right: {
    marginLeft: 8,
  },
  namePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF7EF', 
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 12,
    color: '#008F47',
    fontWeight: '500',
  },
  bubbleWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  bubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 12,
    color: '#767676',
  },
  tail: {
    position: 'absolute',
    left: -6,
    top: 9,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#fff', // 말풍선 배경과 동일
  },
});
