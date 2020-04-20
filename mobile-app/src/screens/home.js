import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Button, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import SearchResources from './customer';


import { search } from '../lib/utils';


const styles = StyleSheet.create({
  center: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF'
  },
  scroll: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 25,
    paddingTop: 75
  },
  image: {
    //alignSelf: 'flex-start',
    height: '100%',
    width:'100%',
    position:'absolute'
    //resizeMode: 'contain'
  },
  title: {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 36,
    color: '#323232',
    paddingBottom: 15
  },
  subtitle: {
    fontFamily: 'IBMPlexSans-Light',
    fontSize: 24,
    color: '#323232',
    textDecorationColor: '#D0E2FF',
    textDecorationLine: 'underline',
    paddingBottom: 5,
    paddingTop: 20
  },
  content: {
    fontFamily: 'IBMPlexSans-Light',
    color: '#323232',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16
  },
  buttonGroup: {
    flex: 1,
    paddingTop: 15,
    width: 175
  },
  button: {
    backgroundColor: '#1062FE',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign:'center',
    marginTop: 15
  }
});

const Home = function ({ route, navigation }) {
         
const [query, setQuery] = React.useState({ type: 'Food', name: '' });

const searchItem = () => {

    return;

  const payload = {
    ...query
  };

  search(payload)
    .then((results) => {
      setInfo(`${results.length} result(s)`)
      setItems(results);
    })
    .catch(err => {
      console.log(err);
      Alert.alert('ERROR', 'Please try again. If the problem persists contact an administrator.', [{text: 'OK'}]);
    });
};
                    
return (
  <View style={styles.center}>
      <Image
        style={styles.image}
        source={require('../images/safequeue_splash.png')}
       />
  </View>
);
};

export default Home;
