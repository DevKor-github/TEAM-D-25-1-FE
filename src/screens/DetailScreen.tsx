import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Restaurant} from '../types/restaruant';
interface DetailScreenProps {
  route: {
    params: {
      restaurant: Restaurant;
    };
  };
}
const DetailScreen: React.FC<DetailScreenProps> = ({route}) => {
  const {restaurant} = route.params;
  return (
    <View style={styles.container}>
      <View
        style={[styles.imagePlaceholder, {backgroundColor: '#a0d468'}]}></View>
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/tree.png')}
          style={styles.treeImage}
        />
        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
          <Text style={styles.name}>{restaurant.name} </Text>
          <Text style={styles.category}>카페</Text>
        </View>
        <Text style={styles.address}>{restaurant.address}</Text>
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
