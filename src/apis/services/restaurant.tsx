export const getRestaurantList = (
  rawRestaurant: {
    id: number;
    placeId: string;
    name: string;
    address: string;
    latitude: string | number;
    longitude: string | number;
    createdAt: string;
  }[],
) => {
  return rawRestaurant.map(
    ({id, placeId, name, address, latitude, longitude, createdAt}) => {
      return {
        id: id,
        placeId: placeId,
        name: name,
        address: address,
        latitude:
          typeof latitude === 'string' ? parseFloat(latitude) : latitude,
        longitude:
          typeof longitude === 'string' ? parseFloat(longitude) : longitude,
        createdAt: createdAt,
      };
    },
  );
};
