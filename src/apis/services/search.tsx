export const getSearchUsersList = (
  rawUser: {
    id: string;
    username: string;
    nickname: string;
    profileImageUrl: string;
  }[],
) => {
  return rawUser.map(({id, username, nickname, profileImageUrl}) => {
    return {
      id: id,
      username: username,
      nickname: nickname,
      profileImageUrl: profileImageUrl,
    };
  });
};

export const getSearchRestaurantsList = (
  rawRestaurant: {
    id: string;
    placeId: string;
    name: string;
    address: string;
  }[],
) => {
  return rawRestaurant.map(({id, placeId, name, address}) => {
    return {
      id: id,
      placeId: placeId,
      name: name,
      address: address,
    };
  });
};
