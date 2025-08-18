import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Tree} from '../types/tree';
import {ParamListBase, RouteProp} from '@react-navigation/native';

// ParamListBase를 확장하여 Detail 스크린의 파라미터 타입을 정의합니다.
interface RootStackParamList extends ParamListBase {
  Detail: {tree: Tree};
  // 다른 스크린들의 파라미터 타입도 여기에 정의할 수 있습니다.
}

// Detail 스크린에 전달되는 route prop의 타입을 정의합니다.
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

interface DetailScreenProps {
  route: DetailScreenRouteProp;
}
const DetailScreen: React.FC<DetailScreenProps> = ({route}) => {
  const {tree} = route.params;
  return (
    <View style={styles.container}>
      <View
        style={[styles.imagePlaceholder, {backgroundColor: '#a0d468'}]}></View>
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/extree.png')}
          style={styles.treeImage}
        />
        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
          <Text style={styles.name}>{tree.name} </Text>
        </View>
        <Text style={styles.address}>{tree.address}</Text>
        <View>
          <TouchableOpacity style={styles.waterButton}>
            <Text style={styles.waterButtonText}>물 주기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagePlaceholder: {
    width: '100%',
    height: '50%', // 적절한 높이로 조절
    marginBottom: 20,
  },
  treeImage: {
    position: 'absolute',
    bottom: '103%',
    width: '100%',
    height: '100%', // 적절한 높이로 조절
  },

  headerContainer: {
    position: 'absolute',
    bottom: 0,

    paddingTop: 50,
    padding: 20,
    width: '100%',
    height: '55%',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    color: 'gray',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    color: 'gray',
  },
  waterButton: {
    backgroundColor: '#6CDF44', // 연한 녹색
    paddingVertical: 15,
    borderRadius: 70,
    marginTop: 20,
    alignItems: 'center',
  },
  waterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailScreen;
