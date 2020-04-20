import React from 'react';
import { StyleSheet, Image, ActivityIndicator, RefreshControl, FlatList, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Geolocation from '@react-native-community/geolocation';

import { PERMISSIONS, check, request } from 'react-native-permissions'

import { search, userID } from '../lib/utils'
import { getUserIDFromContact, getAPNTokenFromContact } from '../lib/utils'

// Annoying and maybe needs to be fixed...
import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings([
    'VirtualizedLists should never be nested', // TODO: Remove when fixed
])


const styles = StyleSheet.create({
  flatListView: {
     backgroundColor: '#F0F0F0',
     paddingTop: 20
  },
    outerView: {
       flex: 1,
       padding: 22,
     },
  itemTouchable: {
    flexDirection: 'column',
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
      borderRadius: 10,
      borderWidth: 1.0,
      marginTop: 2,
      marginLeft: 2,
  marginRight: 2
  },
  heading: {
      fontSize: 14,
      fontFamily: 'IBMPlexSans-Medium',
      color: 'gray',
  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemName: {
    fontSize: 24,
    fontFamily: 'IBMPlexSans-Medium',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray'
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray'
  },
  emptyListView: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyListText: {
    fontFamily: 'IBMPlexSans-Bold',
    color: '#999999',
    fontSize: 16
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
  },
  costcoLogo: {
     width: 180,
     height: undefined,
     aspectRatio: 2016 / 720
   },
  traderjoesLogo: {
       width: 120,
       height: undefined,
       aspectRatio: 3199 / 1352
     },
  walmartLogo: {
     width: 180,
     height: undefined,
     aspectRatio: 1600 / 442
   },
  ralphsLogo: {
        width: 180,
        height: undefined,
        aspectRatio: 880 / 363
      },
  pigglywigglyLogo: {
       width: 140,
       height: undefined,
       aspectRatio: 551 / 267
     },
  starbucksLogo: {
             width: 200,
             height: undefined,
             aspectRatio: 640 / 169
           },
  foodbankLogo: {
             width: 180,
             height: undefined,
             aspectRatio: 800 / 293
          },
    pollLogo: {
              width: 140,
              height: undefined,
              aspectRatio: 299 / 168
            },
  defaultLogo: {
     width: 40,
     height: undefined,
     aspectRatio: 225 / 225
   },
});

const MyResources = function ({ navigation }) {
  const [query, setQuery] = React.useState({ type: 'Store', name: '' });
  const [items, setItems] = React.useState([]);
  const [sortedfilteredItems, setSortedFilteredItems] = React.useState([]);
  const [loader, setLoader] = React.useState('Loading...');
  const [bShowLoader, showLoader] = React.useState('0');  // until we need it
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    navigation.addListener('focus', () => {
        Geolocation.getCurrentPosition((pos) => {
                searchItem();
            });
    })
  }, []);
    
   const searchItem = () => {
       const payload = {
         ...query,
            userID: userID()
       };
               
       showLoader('1');
       search(payload)
         .then((results) => {
             sortandfilter(results)
             showLoader('0');
             setRefreshing(false)
         })
         .catch(err => {
            //Alert.alert('ERROR', 'Search error.' + err, [{text: 'OK'}]);
            setRefreshing(false)
         });
     };
                         
     const sortandfilter = (items) => {
        // Get only stores (that is, no customers in line)
        var storeItems = new Array();
        for(var i=0; i<items.length; i++) {
           var item = items[i];
            
            // a store has contact userID of none@none.com
           var userID = getUserIDFromContact(item.contact);
           if(userID == "none@none.com") {
               // This is a store
               // A store has contact of "none@none.com"   TODO: use a better way
               storeItems.push(item);
           }
        }
        // Sort these by whenCreated
        const sorteditems = storeItems.sort((a, b) => {
            var aq = parseInt(a.whenCreated);
            var bq = parseInt(b.whenCreated);
            return aq - bq;
         });
         setSortedFilteredItems(sorteditems);
     }
    
    // Refresh on pull
    const onRefresh = () => {
         setRefreshing(true);
         searchItem();
    };
    
  const Item = (props) => {
    return (
      <TouchableOpacity style={styles.itemTouchable}
          onPress={() => {
            navigation.navigate('Queue Manager', { item: props });
        }}>
        <View style={styles.itemView}>
            {((props.name == "Costco") ? true : false) ?
               <View>
                   <Image style={styles.costcoLogo} source={require('../images/logo_costco.png')} />
               </View> :
            ((props.name == "Trader Joe's") ? true : false) ?
               <View>
                   <Image style={styles.traderjoesLogo} source={require('../images/logo_traderjoes.png')} />
               </View> :
            ((props.name == "Wal-Mart") ? true : false) ?
               <View>
                   <Image style={styles.walmartLogo} source={require('../images/logo_walmart.png')} />
               </View> :
           ((props.name == "Ralphs") ? true : false) ?
               <View>
                   <Image style={styles.ralphsLogo} source={require('../images/logo_ralphs.png')} />
               </View> :
           ((props.name == "Piggly Wiggly") ? true : false) ?
               <View>
                   <Image style={styles.pigglywigglyLogo} source={require('../images/logo_pigglywiggly.png')} />
               </View> :
           ((props.name == "Starbucks") ? true : false) ?
               <View>
                  <Image style={styles.starbucksLogo} source={require('../images/logo_starbucks.png')} />
               </View> :
            ((props.name == "Poll") ? true : false) ?
                 <View>
                    <Image style={styles.pollLogo} source={require('../images/logo_poll.png')} />
                 </View> :
            ((props.name == "Food Bank") ? true : false) ?
                  <View>
                     <Image style={styles.foodbankLogo} source={require('../images/logo_foodbank.png')} />
                  </View> :
               
                   <View style={styles.itemView}>
                       <Text style={styles.itemName}>{props.name}</Text>
                   </View> }
        </View>
        <Text style={styles.itemDescription}>{props.description}</Text>
      </TouchableOpacity>
    );
  };
  
  if (sortedfilteredItems.length > 0) {
    return (
        <View>
            { (((bShowLoader == '0') || !global.debug) ? false : true) ?
               <View style={styles.inputsView}>
                  <Text style={styles.label}>{loader}</Text>
               </View> : null
            }
            
            <ScrollView style={styles.outerView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
    
                <View style={styles.heading}>
                    <Text style={styles.label}>Tap on an entry to manage its queue:</Text>
                    <Text style={styles.label}></Text>
                </View>
            </ScrollView>
        
            <FlatList style={styles.flatListView}
                data={sortedfilteredItems}
                renderItem={({ item }) => <Item {...item}/>}
                keyExtractor={item => item.id || item['_id']} />
        </View>
    )
  }
  else {
    return (
        <ScrollView style={styles.outerView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

            { ((bShowLoader == '0') ? false : true) ?
                <View style={styles.inputsView}>
                    <Text style={styles.label}>{loader}</Text>
                </View>
                :
                <View>
                    <View style={styles.heading}>
                        <Text style={styles.label}>You aren't managing any businesses yet.</Text>
                    </View>
                    <View style={styles.heading}>
                        <Text style={styles.label}>Tap on Add to create one.</Text>
                    </View>
                </View>
            }
        </ScrollView>
    )
  }
};

export default MyResources;
