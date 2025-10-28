import {Linking} from 'react-native';

export const linking = {
  prefixes: ['groo://'],
  config: {
    screens: {
      Splash: 'splash',
      Onboard: 'onboard',
      Login: 'login',
      SignUp: 'signup',
      Welcome: 'welcome',
      Map: 'main',
      Detail: 'detail/:id',
      PhotoDetail: 'photo/:id',
      Mypage: 'mypage',
      Search: 'search',
      Friend: 'friend',
      Complete: 'complete',
      FollowList: 'followlist',
      KeywordSelection: 'keywordselection',
      ProfileEdit: 'profileedit',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url != null) return url;
  },
};
