import React from 'react';
import { StyleSheet, Image, RefreshControl, View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PickerSelect from 'react-native-picker-select';
import { CheckedIcon, UncheckedIcon } from '../images/svg-icons';
import Geolocation from '@react-native-community/geolocation';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from "react-native-camera"

import { Buffer } from 'buffer';
 
import { update, remove, search, push, userID } from '../lib/utils'
import { getUserIDFromContact, getAPNTokenFromContact } from '../lib/utils'

// Annoying and maybe needs to be fixed...
import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings([
    'VirtualizedLists should never be nested', // TODO: Remove when fixed
])


const styles = StyleSheet.create({
  outerView: {
    flex: 1,
    padding: 22,
    backgroundColor: '#FFF'
  },
  splitView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeArea: {
    width: '40%'
  },
  label: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 14,
    paddingBottom: 5
  },

    heading: {
      fontFamily: 'IBMPlexSans-Medium',
      color: '#000',
      fontSize: 14,
      paddingTop: 5
    },
  selector: {
    fontFamily: 'IBMPlexSans-Medium',
    borderColor: '#D0E2FF',
    borderWidth: 2,
    padding: 16,
    marginBottom: 25
  },
  quantityArea: {
    width: '40%'
  },
  textInput: {
    fontFamily: 'IBMPlexSans-Medium',
    flex: 1,
    borderColor: '#D0E2FF',
    borderWidth: 2,
    padding: 14,
    elevation: 2,
    marginBottom: 25
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  checkboxLabel: {
    fontFamily: 'IBMPlexSans-Light',
    fontSize: 13
  },
  flatListView: {
    backgroundColor: '#FFF',
    width: '100%'
  },
    businessView: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    businessName: {
      fontSize: 24,
      fontFamily: 'IBMPlexSans-Medium',
    },
    businessDescription: {
      fontSize: 14,
      fontFamily: 'IBMPlexSans-Medium',
      color: 'gray'
    },
  textInputDisabled: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#f4f4f4',
    color: '#999',
    flex: 1,
    padding: 16,
    elevation: 2,
    marginBottom: 25
  },
    itemTouchable: {
      flexDirection: 'column',
      padding: 15,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      //borderBottomColor: '#dddddd',
      //borderBottomWidth: 0.25
    },
  updateButton: {
    backgroundColor: '#1062FE',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign:'center',
    marginTop: 15,
  borderRadius: 10
  },
  deleteButton: {
    backgroundColor: '#da1e28',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 6,
    textAlign:'center',
    marginTop: 15,
    borderRadius: 10
  },
  scannerDisplay: {
      alignItems: 'center',
      marginTop: 10
  },
    itemLineNumber: {
      fontSize: 14,
      fontFamily: 'IBMPlexSans-Medium',
      color: '#000'
    },
    itemView: {
        flexDirection: 'column',
        padding: 10,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        borderRadius: 10,
        borderWidth: 1.0,
        backgroundColor: '#FFF'
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
            width: 110,
            height: undefined,
            aspectRatio: 299 / 168
          },
     defaultLogo: {
        width: 40,
        height: undefined,
        aspectRatio: 225 / 225
      },
});

// Background timere
var abackgroundCountdown = 10;
var isScanning = '0';
var currentItem = {};

const EditResource = (props) => {
  const clearItem = { userID: userID(), type: 'Store', name: '', description: '', location: '', contact: '', quantity: '1' }
  const [item, setItem] = React.useState(clearItem);
  const [sortedfilteredItems, setSortedFilteredItems] = React.useState([]);
  const [useLocation, setUseLocation] = React.useState(true);
  const [loader, setLoader] = React.useState('Getting customers in line...');
  const [bShowLoader, showLoader] = React.useState('0');  // until we need it
  const [linelength, setLinelength] = React.useState('');
  const [position, setPosition] = React.useState({})
  const [items, setItems] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [bShowScanner, showScanner] = React.useState('0');
  const [bShowBtnScan, showBtnScan] = React.useState('0');
  const [bShowBtnNextCustomer, showBtnNextCustomer] = React.useState('0');
  const [bShowBtnDelete, showBtnDelete] = React.useState('0');
  const [bShowLineList, showLineList] = React.useState('1');

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
          var R = 6371; // Radius of the earth in km
          var dLat = deg2rad(lat2-lat1);  // deg2rad below
          var dLon = deg2rad(lon2-lon1);
          var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          var d = R * c; // Distance in km
          return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

  React.useEffect(() => {
    props.navigation.addListener('focus', () => {
        const item = props.route.params.item;
            setItem({
                ...item,
                quantity: item.quantity.toString()
            });
            currentItem = item;

            Geolocation.getCurrentPosition((pos) => {
                setPosition(pos);
                var loc =`${pos.coords.latitude},${pos.coords.longitude}`;
                global.deviceLocation = loc;
                updateLineList(loc, "Loading...");
            });
        
        // TODO: "silent" Push doens't seem tot work, so use broadcast and poll for now
        // Look for new notifications
        let timerId = setTimeout(function tick() {
            // check every second
              if(global.arrBusinessNotifications.length > 0) {
                  // copy the notifications first, then process
                  // though I understand Javascript has no concurrency issues (?)
                  var notes = new Array();
                  for(var i=0; i<global.arrBusinessNotifications.length; i++) {
                      notes.push(global.arrBusinessNotifications[i]);
                  }
                  // remove them all
                  while(global.arrBusinessNotifications.length){
                       global.arrBusinessNotifications.shift();
                  }
                  // process them
                  for(var i=0; i<notes.length; i++) {
                      var note = notes[i];
                      const data = JSON.parse(note.data.payload);
                      var type = data.type;
                      if(type == global.notificationYouAreNext)
                      {
                          // Ignore this one, this is for customers only
                          // Well.. and we sent this one!
                      }
                      else if(type == global.notificationMoveUp)
                      {
                          // This means a user went into a store, so we all move up
                          // Ignore this one, this is for customers only
                          // Well.. and we sent this one!
                      }
                  }
              }
                       
              // handle general countdowntimer
              // for updates to the line
              // TODO: there doesn't seem to be working "silent" APN push, so we'll poll for now
              //       as right now, the user will to tap on a notification every time something changes
              abackgroundCountdown--;
              if(abackgroundCountdown <= 0) {
                   // update in case something changed
                   updateLineList(global.deviceLocation, "Updating in background...");
                   abackgroundCountdown = 5;  // every 5 seconds, but JS timer is crap
              }
                                    
              // Keep going!
              timerId = setTimeout(tick, 1000); // (*)
       }, 1000);
    })
  }, []);

  const toggleUseLocation = () => {
    if (!useLocation && position) {
      setItem({
        ...item,
        location: `${position.coords.latitude},${position.coords.longitude}`
      });
      currentItem = item;
    }
    setUseLocation(!useLocation);
  };

  const updateItem = () => {
    const payload = {
      ...item,
        quantity: isNaN(item.quantity) ? 1 : parseInt(item.quantity),
        id: item.id || item['_id']
    };

    update(payload)
      .then(() => {
        Alert.alert('Done', 'Your item has been updated.', [{text: 'OK'}]);
        props.navigation.goBack();
      })
      .catch(err => {
        console.log(err);
        Alert.alert('ERROR', err.message, [{text: 'OK'}]);
      });
  };

  const confirmDelete = () => {
    // TODO: for now, don't allow delete if people are in line. For future, kick everyone out with warning
    if(sortedfilteredItems.length > 0) {
        Alert.alert("Sorry...", "There are persons in line, so can't do the delete.");
    }
    else {
        Alert.alert(
          'Delete',
          'Are you sure you want to delete this item?',
          [
            { text: 'Cancel' },
            { text: 'Delete', onPress: () => deleteItem() }
          ]
        )
    }
  }

  const deleteItem = () => {
    const payload = {
      ...item,
      id: item.id || item['_id']
    };

    remove(payload)
      .then(() => {
        Alert.alert('Done', 'Your item has been deleted.', [{text: 'OK'}]);
        props.navigation.goBack();
      })
      .catch(err => {
        console.log(err);
        Alert.alert('ERROR', err.message, [{text: 'OK'}]);
      });
  };
    
    const numberInLine = (props) => {
        // Since we don't have a line number property, look in the list for me
        for(var i=0; i<sortedfilteredItems.length; i++) {
            var item = sortedfilteredItems[i];
            if(item.contact == props.contact) {
                var n = i + 1;
                return n.toString();
            }
         }
        return props.whenCreated;
    }
                    
    const nicknameInLine = (props) => {
          if(props.description == '')
              return getUserIDFromContact(props.contact);   // USER ID if nothing else available
          else {
              // entered by the user, was base64 for the database
              return Buffer.from(props.description, 'base64').toString('binary');
          }
    }
      
            
    // NOT USED - we don't have a use case for tapping on someone in line
    const customerPressed = (props) => {
         return;   // nothing to do here
            
         Alert.alert("NOTIFY", "Do you want to notify the customer?",
         [
             { text: "No",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
             },
             {  text: "Yes",
                onPress: () => {
                    // DO IT  - something but I don't know what
                }
             }
         ], { cancelable: false });
    }
                      
    /*
     *  This is each entry in customer list
     */
    const Item = (props) => {
      return (
        <TouchableOpacity
            onPress={() => { customerPressed(props) }}>
              <View style={styles.itemView}>
                 <View style={styles.splitView}>
                    <Text style={styles.itemLineNumber}> {numberInLine(props)} </Text>
                    <Text style={styles.itemName}>{nicknameInLine(props)}</Text>
                 </View>
              </View>
        </TouchableOpacity>
      );
    };
                    
    const updateLineList = (loc, userMessage) => {
       const payload = {
         ...clearItem,
            type: 'Store',
            //name: item.name,
            userID: userID()
       };
             
       if(global.debug) {
            setLoader(userMessage);
            showLoader('1');
       }
       search(payload)
         .then((results) => {
               var num = sortandfilter(results, loc)
               if(num == 0)
                   setLinelength(`There is no one in line.`)
               else if(num == 1)
                   setLinelength(`1 customer in line:`)
               else
                   setLinelength(`${num} customers in line:`)
                   
                // Update the buttons, unless the scanner is open
                // this happens if a background update happens while the scanner is open
               if(isScanning == '0') {
                   showBtnDelete((num == 0) ? '1' : '0');  // show delete if 0 users in line
                   showLoader('0');
                   setRefreshing(false);
                   if(num > 0) {
                       showBtnNextCustomer('1');
                       showBtnScan('1');
                   } else {
                       showBtnNextCustomer('0');
                       showBtnScan('0');
                   }
               }
         })
         .catch(err => {
           console.log(err);
           setRefreshing(false);
           //Alert.alert('ERROR', 'Search error.' + err, [{text: 'OK'}]);
         });
     };

    const sortandfilter = (items, loc) => {
        // only show the persons in line for this store
        // so, userID = me  and its not the store entry itself and contact != none@none.com
        // and name is our name
        var lineitems = new Array();
        var myname = props.route.params.item.name;
        for(var i=0; i<items.length; i++) {
            var titem = items[i];
            
            var contactID = getUserIDFromContact(titem.contact);

            if((titem.userID == userID()) && (titem.name == myname) && !(contactID == 'none@none.com')) {
               lineitems.push(titem)
            }
        }
        // we will sort on whenCreated, which is acutally position in line
        const sorteditems = lineitems.sort((a, b) => {
            var aq = parseInt(a.whenCreated);
            var bq = parseInt(b.whenCreated);
            return aq - bq;
        });
        
        setSortedFilteredItems(sorteditems)
        return sorteditems.length;
    }
                    
   const notifyNextCustomer = () => {
       Alert.alert("Confirm", "Do you want to notify the customer?",
       [
           { text: "No",
              style: "cancel"
           },
           {  text: "Yes",
              onPress: () => {
                  notifyFirstInLine(sortedfilteredItems[0]);
                  // then we he arrives we take him out of line
                  // TODO: or if he doesn't come fast enough, we push him back in line
                  //       we have timeout, but nothing to do at the end of it
              }
           }
       ], { cancelable: false });
   }
                    
                    
   const notifyFirstInLine = (item) => {
        // get the token from contact
        var token = getAPNTokenFromContact(item.contact);
        if(token == '') {
            Alert.alert("ERROR", "No push Token, so can't notify");
        }
        else {
            var userid = getUserIDFromContact(item.contact);
            var nickname = (item.description == '') ? userid : item.description;
            var title = item.name + " is ready for you!";
            var body  = 'Go to the entrance now!  You have 5 minutes.';
            var payload = {title: title, body: body, payload:
                            {type: global.notificationYouAreNext, nickname: nickname, userid: userid}};
            var spayload = JSON.stringify(payload);
            var spayload64 = Buffer.from(spayload, 'binary').toString('base64');
            
            push(token, spayload64, "goin.wav")
                .then((response) => {
                    if(response.result == 'SUCCESS') {
                       nickname = Buffer.from(item.description, 'base64').toString('binary');
                       Alert.alert("DONE!", nickname + '\nhas been notified.\n\nHis 5 minute countdown is now reset.');
                    }
                    else {
                        Alert.alert("Notification Failed", 'Reported error:\n' + response.result);
                    }
                })
                .catch(err => {
                   console.log(err);
                   Alert.alert('Notification Failed', 'Network error:\n' + err, [{text: 'OK'}]);
                });
            
            // kinda kluge - we need to mark that the notifacaiton happened in the db
            // because we can't seme to get the notification when the app is not running
            // seems easy, but then we have deal with removeing the mark ...
        }
   }
                    
   const removeFromLine = (theId) => {
      const payload = {
        ...clearItem,
           id: theId
      };
             
      // remove the line db entry
      remove(payload)
        .then(() => {
            //Alert.alert('Done!', 'You are not in line anymore', [{text: 'OK'}]);
            updateLineList('', "Updating after remove...");
        })
        .catch(err => {
          console.log(err);
          Alert.alert('INTERNAL ERROR', 'Remove failed.\n' + err + '\n', [{text: 'OK'}]);
        });
    };
                    
    // Refresh on pull
    const onRefresh = () => {
         setRefreshing(true);
         updateLineList("", "Loading...");
    };
                    
    const scanCustomer = () => {
          showScanner('1');
          isScanning = '1';
          showBtnScan('0');
          showBtnNextCustomer('0');
    };
                    
    const scanCustomerCancel = () => {
          showScanner('0');
          isScanning = '0';
          showBtnScan('1');
          showBtnNextCustomer('1');
    };
                    
    const onScanSuccess = e => {
          scanCustomerCancel();

          // See if this matches the first customer in line
          var item = sortedfilteredItems[0];
          var firstID = getUserIDFromContact(item.contact);
          if(firstID == e.data) {
              // Yep, that him! let him in the store and the following actions:
              // remove him from the line (which moves everyone up) and notify everyone else
              Alert.alert("CONFIRMED", "This person has been removed from the line and everyone will notified they have moved up.");
              // We'll include the first person as well, so his display is updated too
              var tonotify = new Array();  // everyone to be notified
              for(var i=0; i<sortedfilteredItems.length; i++) {
                  var titem = sortedfilteredItems[i];
                  tonotify.push(titem);
              }
              
              // This removes the scanned person from the line
              removeFromLine(item['_id']);  // also refreshes the display
            
              // notify selected person he was scanned (so his display can clear)
              // and notify everyone else that they've moved up
              for(var i=0; i<tonotify.length; i++) {
                   var item = tonotify[i];
                
                   var type;
                   var title;
                   var body;
                   var sound;
                   if(i == 0) {
                      // the user we just scanned
                      type = global.notificationScanned;
                      title = "Thank you for using a Safe Queue!";
                      body  = 'Have a safe day!';
                      sound = 'silent.wav';
                   }
                   else {
                       // another user in line
                       type = global.notificationMoveUp;
                       title = props.name;
                       body  = 'The line has moved!';
                       if(i == 1)
                           sound = 'next.wav';
                       else if(i == 2)
                           sound = 'second.wav';
                       else if(i == 3)
                           sound = 'third.wav';
                       else if(i == 4)
                           sound = 'fourth.wav';
                       else
                           break;  // don't send notifications beyond 4th in line
                   }
                   var token  = getAPNTokenFromContact(item.contact);
                   var payload = {title: title, body: body, payload: {type: type, nickname: '', userid: ''}};
                   var spayload = JSON.stringify(payload);
                   var spayload64 = Buffer.from(spayload, 'binary').toString('base64');
                   push(token, spayload64, sound)
                       .then((response) => {
                           if(response.result == 'SUCCESS') {
                              //Alert.alert("DONE!", nickname + ' has been notified.');
                           }
                           else {
                               Alert.alert("Notification Failed", 'Reported error:\n' + response.result);
                           }
                       })
                       .catch(err => {
                          Alert.alert('Notification Failed', 'Network error:\n' + err, [{text: 'OK'}]);
                       });
              }
          }
          else {
              // Not the right customer, so find him for error  message
              var bFound = false;
              var position;
              for(var i=0; i<sortedfilteredItems.length; i++) {
                  var titem = sortedfilteredItems[i];
                  var tid = getUserIDFromContact(titem.contact);
                  if(tid == e.data) {
                      bFound = true;
                      position = i + 1;  // 1-based display
                      break;
                  }
              }
              if(bFound) {
                  var pos = position.toString();
                  Alert.alert("NOT YET!", e.data + "\nThis customer is number\n" + pos + "\nin line.");
              }
              else
                  Alert.alert("ERROR", "This customer is not in line at this store.\n\nCheck the store name and address on the customer's phone.");
          }
    };

  return (
    <ScrollView style={styles.outerView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
        <View style={styles.businessView}>
            {((item.name == "Costco") ? true : false) ?
                               <View>
                                   <Image style={styles.costcoLogo} source={require('../images/logo_costco.png')} />
                               </View> :
                            ((item.name == "Trader Joe's") ? true : false) ?
                               <View>
                                   <Image style={styles.traderjoesLogo} source={require('../images/logo_traderjoes.png')} />
                               </View> :
                            ((item.name == "Wal-Mart") ? true : false) ?
                               <View>
                                   <Image style={styles.walmartLogo} source={require('../images/logo_walmart.png')} />
                               </View> :
                           ((item.name == "Ralphs") ? true : false) ?
                               <View>
                                   <Image style={styles.ralphsLogo} source={require('../images/logo_ralphs.png')} />
                               </View> :
                           ((item.name == "Piggly Wiggly") ? true : false) ?
                               <View>
                                   <Image style={styles.pigglywigglyLogo} source={require('../images/logo_pigglywiggly.png')} />
                               </View> :
                           ((item.name == "Starbucks") ? true : false) ?
                               <View>
                                  <Image style={styles.starbucksLogo} source={require('../images/logo_starbucks.png')} />
                               </View> :
                           ((item.name == "Poll") ? true : false) ?
                               <View>
                                  <Image style={styles.pollLogo} source={require('../images/logo_poll.png')} />
                               </View> :
                           ((item.name == "Food Bank") ? true : false) ?
                                  <View>
                                     <Image style={styles.foodbankLogo} source={require('../images/logo_foodbank.png')} />
                                  </View> :
                           
                               <View style={styles.itemView}>
                                   <Text style={styles.itemName}>{item.name}</Text>
                               </View> }
        </View>
        <Text style={styles.businessDescription}>{item.description }</Text>
        
        { ((bShowScanner == '0') ? false : true) ?
                    <View style={styles.scannerDisplay}>
                     <QRCodeScanner
                            onRead={onScanSuccess}
                            topContent={
                              <Text style={styles.centerText}>
                               Scan Customer's Entrance Code
                              </Text>
                            }
                            bottomContent={
                                <TouchableOpacity onPress={scanCustomerCancel}>
                                    <Text style={styles.deleteButton}>Cancel</Text>
                                </TouchableOpacity>
                            }
                      /></View> : null
        }
        { ((bShowBtnNextCustomer == '0') ? false : true) ?
              <TouchableOpacity onPress={notifyNextCustomer}>
                  <Text style={styles.updateButton}>Notify Next Customer</Text>
              </TouchableOpacity> : null
        }
        { ((bShowBtnScan == '0') ? false : true) ?
              <TouchableOpacity onPress={scanCustomer}>
                  <Text style={styles.updateButton}>Scan Customer</Text>
              </TouchableOpacity> : null
        }
        
        { ((bShowLineList == '0') ? false : true) ?
            <View>
                <View style={styles.heading}>
                    <Text style={styles.heading}>{linelength}</Text>
                </View>
                <FlatList style={styles.flatListView}
                       data={sortedfilteredItems}
                       renderItem={({ item }) => <Item {...item} />}
                       keyExtractor={item => item.id || item['_id']}/>
            </View> : null
        }
                     
        { ((bShowLoader == '0') ? false : true) ?
            <View style={styles.inputsView}>
                <Text style={styles.label}>{loader}</Text>
            </View> : null
        }
        { ((bShowBtnDelete == '0') ? false : true) ?
            <TouchableOpacity onPress={confirmDelete}>
                    <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity> : null
        }
                   
        { (global.debug) ?
            <View>
                <Text style={styles.label}>Location</Text>
                <View style={styles.checkboxContainer}>
                <TouchableOpacity onPress={toggleUseLocation}>
                  {
                    (useLocation)
                      ?
                      <CheckedIcon height='18' width='18'/>
                      :
                      <UncheckedIcon height='18' width='18'/>
                  }
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}> Use my current location </Text>
                </View>
                <TextInput
                    style={useLocation ? styles.textInputDisabled : styles.textInput}
                    value={item.location}
                    onChangeText={(t) => setItem({ ...item, location: t})}
                    onSubmitEditing={updateItem}
                    returnKeyType='send'
                    enablesReturnKeyAutomatically={true}
                    placeholder='street address, city, state'/>
               </View> : null
         }
    </ScrollView>

  );
};

export default EditResource;
