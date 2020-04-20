import React from 'react';
import { StyleSheet, Image, Modal, TouchableHighlight, RefreshControl, Text, TextInput, FlatList, View, KeyboardAvoidingView, TouchableOpacity, Alert } from 'react-native';
import PickerSelect from 'react-native-picker-select';
import Geolocation from '@react-native-community/geolocation';


import QRCode from 'react-native-qrcode-svg';
import DialogInput from 'react-native-dialog-input';

import { Dialog } from 'react-native-simple-dialogs';


import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from "react-native-push-notification";

import { Buffer } from 'buffer';

import { search, update, add, remove, push, userID, addressFromLocation } from '../lib/utils';
import { getUserIDFromContact, getAPNTokenFromContact } from '../lib/utils'

// Annoying and maybe needs to be fixed...
import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings([
    'VirtualizedLists should never be nested', // TODO: Remove when fixed
])

var debugOverride = false;   // force debug in just this file

const styles = StyleSheet.create({
  outerView: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%'
  },
    modalView: {
       margin: 20,
       backgroundColor: "white",
       borderRadius: 10,
       padding: 10,
       alignItems: "center",
       shadowColor: "#000",
       shadowOffset: {
         width: 2,
         height: 8
       },
       shadowOpacity: 0.25,
       shadowRadius: 8, //3.84,
       elevation: 5
     },
    modalTitleText: {
        fontFamily: 'IBMPlexSans-Bold',

      marginBottom: 8,
      fontSize: 24,
      textAlign: "center"
    },
    modalText: {
        fontFamily: 'IBMPlexSans-Medium',
        color: '#000',
        fontSize: 20,
      textAlign: "center"
    },

    modalTextInput: {
        

        margin: 4,
        height: 40,
    width:250,
        borderColor: '#7a42f4',
        borderWidth: 1,
      fontFamily: 'IBMPlexSans-Medium',
      backgroundColor: '#fff',
      padding: 8,
    fontSize:18,
      marginBottom: 15,
    },
    
    textKluge: {
    marginTop: 16,
      fontSize: 48,
      textAlign: "center"
    },
    openButton: {
    fontSize: 24,
      backgroundColor: "#F194FF",
      borderRadius: 10,
      padding: 10,
      elevation: 2
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
    },
    splitView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    splitViewColumn: {
         flexDirection: 'column',
         justifyContent: 'center',
       },
  inputsView: {
    backgroundColor: '#F1F0EE',
    padding: 16,
    padding: 22,
  },
  label: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 14,
    paddingBottom: 5
  },
  selector: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 10
  },
  textInput: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 10,
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
  searchResultText: {
    fontFamily: 'IBMPlexSans-Bold',
    padding: 10,
    color: '#1062FE'
  },
  qrCodeDisplay: {
      alignItems: 'center',
      marginTop: 10
  },
    textLineNumberView: {
        alignItems: 'center',
       },
    textLineNumber: {
      fontFamily: 'IBMPlexSans-Medium',
      fontSize: 48,
      marginBottom: 10
    },
    textNicknameView: {
        alignItems: 'center',
        marginTop: 10,
    },
    textNickname: {
        fontFamily: 'IBMPlexSans-Medium',
        fontSize: 18,
    },
    textMarginTop: {
         fontFamily: 'IBMPlexSans-Medium',
         fontSize: 14,
         marginTop: 10
    },
  flatListView: {
      backgroundColor: '#F0F0F0',
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
    itemTouchableCLOSE: {
      flexDirection: 'column',
      padding: 10,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
          borderRadius: 10,
          borderWidth: 1.0,
          marginTop: 2,
          marginLeft: 2,
          marginRight: 2,
      backgroundColor: '#97FEAE'
    },
    itemTouchableINLINE: {
      flexDirection: 'column',
      padding: 15,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
        borderRadius: 10,
        borderWidth: 1.0,
        marginTop: 2,
        marginLeft: 2,
        marginRight: 2,
        backgroundColor: '#E3D4FF'
    },
    itemTouchableSELECTED: {
      flexDirection: 'column',
      padding: 15,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
        borderRadius: 10,
        borderWidth: 1.0,
        marginTop: 2,
        marginLeft: 2,
        marginRight: 2,
        backgroundColor: '#97FEAE'
    },
    itemTouchableEXPIRED: {
      flexDirection: 'column',
      padding: 15,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
        borderRadius: 10,
        borderWidth: 1.0,
        marginTop: 2,
        marginLeft: 2,
        marginRight: 2,
        backgroundColor: '#FD98A1'
    },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 24,
    fontFamily: 'IBMPlexSans-Medium',
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray'
  },
    distanceAwayFar: {
      fontSize: 18,
      fontFamily: 'IBMPlexSans-Medium',
      color: 'gray',
      alignSelf: 'flex-end',
      justifyContent: 'center',
      alignItems: 'center'
    },
    distanceAwayClose: {
      fontSize: 18,
      fontFamily: 'IBMPlexSans-Medium',
      color: 'green',
      alignSelf: 'flex-end',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    lineCountClose: {
      fontSize: 20,
      //fontFamily: 'IBMPlexSans-Medium',
      color: 'green',
      alignSelf: 'flex-end',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    lineCountFar: {
      fontSize: 20,
      //fontFamily: 'IBMPlexSans-Medium',
      color: 'gray',
      alignSelf: 'flex-end',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray'
  },
  modalStyle: {
  },
  backdropStyle: {
      backgroundColor: 'rgba(52, 52, 52, 0.8)'
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

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
                
export async function externalFunctionAsync() {
      var xyz = global.foo;
      Alert.alert("ASYNC", "GOT:\n" + xyz);
}
export function externalFunction() {
      Alert.alert("SYNC", "GOT SYNC HERE");
       return 'catfood';
}
                
// Background timers
var backgroundCountdown = 10;
var selectedCountdown = 0;
var isSelected = '0';
var idStoreInline = '';
var nameStoreInline = '';
                
                
var movecount = 0;
                
const SearchResources = function ({ route, navigation }) {
  const [query, setQuery] = React.useState({ type: 'Store', name: '' });
  const [items, setItems] = React.useState([]);
  const [sortedfilteredItems, setSortedFilteredItems] = React.useState([]);
  const [inlineWithMeItems, setInlineWithMeItems] = React.useState([]);
  const [inlinePositionMe, setInlinePositionMe] = React.useState(0);
  const [info, setInfo] = React.useState('');
  const [loader, setLoader] = React.useState('...');
  const [inline, setInline] = React.useState('0');
  const [inlineStoreId, setInlineStoreId] = React.useState('');
  const [inlineMe, setInlineMe] = React.useState('');
  const [position, setPosition] = React.useState({})
  const [refreshing, setRefreshing] = React.useState(false);
  const [showQRCode, setShowQRCode] = React.useState('0');
  const [QRCodeValue, setQRCodeValue] = React.useState('');
  const [bShowJoinDialog, showJoinDialog] = React.useState('0');
  const [joinProps, setJoinProps] = React.useState({});
  const [selected, setSelected] = React.useState('0');  // we were notified to go in, but aren't there yet
  const [countdown, setCountdown] = React.useState('');  // we were notified to go in, but aren't there yet
  const [bShowYourLineNumber, showYourLineNumber] = React.useState('1');
  const [myNickname, setMyNickname] = React.useState('');

      React.useEffect(() => {
            // get our location upon entry
            // and then start our search once we know where we are
            navigation.addListener('focus', () => {
                Geolocation.getCurrentPosition((pos) => {
                     var loc =`${pos.coords.latitude},${pos.coords.longitude}`;
                     setPosition(pos);
                     setQuery({...query, location: loc});
                     global.deviceLocation = loc;
                                    
                     // We know where we are, so search for stores near me
                     // NOTE: seems all of the sets above are lazy, so aren't available to the next call
                     updateBusinessList("Loading...");
                });
                
                // Keep getting position updates
                Geolocation.watchPosition((pos) => {
                    var loc = `${pos.coords.latitude},${pos.coords.longitude}`;  // string position
                    setPosition(pos);
                    setQuery({...query, location: loc});
                    global.deviceLocation = loc;
                    updateBusinessList("GeoLocation...")
                    movecount++;
                    setLoader("Moved number " + movecount);
                    //updateDistances();  would be better if it worked
                },
                {enableHighAccuracy: true});
              
                // TODO: "silent" Push doens't seem tot work, so use broadcast and poll for now
                // Look for new notifications
                let timerId = setTimeout(function tick() {
                   // check every second
                   if(global.arrCustomerNotifications.length > 0) {
                       // copy the notifications first, then process
                       // though I understand Javascript has no concurrency issues (?)
                       var notes = new Array();
                       for(var i=0; i<global.arrCustomerNotifications.length; i++) {
                           notes.push(global.arrCustomerNotifications[i]);
                       }
                       // remove them all
                       while(global.arrCustomerNotifications.length){
                            global.arrCustomerNotifications.shift();
                       }
                       PushNotificationIOS.setApplicationIconBadgeNumber(0);  // clear the badge

                       // process them, but need gps location
                       setQuery({...query, location: global.deviceLocation});
                       for(var i=0; i<notes.length; i++) {
                           var note = notes[i];
                           
                           // we got a notification while the app was not running
                           if(note == "unknown") {
                               Alert.alert("Notification", "Received unknown notification, received while the app was not running. Will assume we were notified to be next....");
                               
                               /* THIS IS NOT GOING TO WORK - need a Dababase solution
                               // BIG KLUGE - if we were first in line, assume we were just notified to go in
                               setSelected('1');  // to change the display and start timer
                               isSelected = '1';
                               updateBusinessList(global.deviceLocation, "Updating, you've been notified...");
                               selectedCountdown = 5 * 60;  // Start 5 minute countdown
                                */
                               continue;  // nothing else to do here
                           }
                           
                           const data = JSON.parse(note.data.payload);
                           var type = data.type;
                           if(type == global.notificationYouAreNext)
                           {
                               // This is notification for me, so alert myself !!!
                               var notifyUserID = data.userid;
                               var notifyNickname = data.nickname;
                               // sanity chack
                               if(notifyUserID != userID()) {
                                   Alert.alert("INTERNAL ERROR", "Received notification to come in for a user with different ID than me.\n\nGot:\n" + notifyUserID + "\n\nExpected:\n" + userID());
                               }
                               setSelected('1');  // to change the display and start timer
                               isSelected = '1';
                               updateBusinessList("Updating, you've been notified...");
                               
                               // Start 5 minute countdown
                               selectedCountdown = 5 * 60;
                           }
                           else if(type == global.notificationScanned)
                           {
                               // We were just scanned to clear everything !!
                               clearInLine();
                               updateBusinessList("Updating, scanned..");
                           }
                           else if(type == global.notificationMoveUp)
                           {
                                // This means a user went into a store, so we all move up
                                // I won't get this if I was scanned
                                // redundant Alert.alert(note.alert.title, "");
                                updateBusinessList("Updating, the line has moved up...");
                           }
                       }
                   }
                   
                   // handle selected countdowntimer
                   // TODO: There doesn't seem to be a reliable way to stop this until we
                   //       get proper silent notifidations working
                   if((isSelected == '1') && (selectedCountdown > 0)) {
                        var min = Math.floor(selectedCountdown / 60);
                        var sec = selectedCountdown % 60;
                        var smin = min.toFixed(0).toString();
                        var ssec = sec.toFixed(0).toString();
                        if(sec < 10) ssec = '0' + ssec;
                        setCountdown(smin + ":" + ssec);
                        selectedCountdown--;
                        if(selectedCountdown == 0) {
                            // We're expired
                           // Alert.alert("DANG!", "You didn't get there in time.\n\n" +
                            //            "You've been pushed back one the line.");
                        }
                   }
                                            
                   // handele general countdowntimer
                   // for updates to people joining/leaving the line
                   // TODO: there doesn't seem to be working "silent" APN push, so we'll poll for now
                   //       as right now, the user will to tap on a notification every time something changes
                   backgroundCountdown--;
                   if(backgroundCountdown <= 0) {
                        // update in case something changed
                        if(global.deviceLocation != "") {
                            updateBusinessList("Updating in background...");
                            backgroundCountdown = 5;  // every 5 seconds
                        }
                   }
                                             
                   // Keep going!
                   timerId = setTimeout(tick, 1000); // (*)
                }, 1000);
            });
      }, []);
                
                
      const updateDistances = () => {
          // I don't think this works...
          for(var i=0; i<sortedfilteredItems.length; i++) {
              var item = sortedfilteredItems[i];
              distanceAwayDisplay(item);
          }
      }

      function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
      }

      function deg2rad(deg) {
        return deg * (Math.PI/180)
      }
                      
      function canGetInLine(dist) {  // in M, not KM
        if(dist < 300)
            return true;
        else
            return false;
      }
                      
      const distanceBetweenInMeters = (a, b) => {
        var arr = a.split(',');
        var lat1 = arr[0];
        var lon1 = arr[1];
        
        var arrme = b.split(',');
        var lat1me = arrme[0];
        var lon1me = arrme[1];
            
        var distance = getDistanceFromLatLonInKm(lat1,lon1,lat1me,lon1me);
        return distance * 1000;
     }
                               
    const distanceInMeters = (props) => {
       var arr = props.location.split(',');
       var lat1 = arr[0];
       var lon1 = arr[1];
        
        var arrme = query.location.split(',');
        var lat1me = arrme[0];
        var lon1me = arrme[1];
            
        var distance = getDistanceFromLatLonInKm(lat1,lon1,lat1me,lon1me);
        return distance * 1000;
    };
        
                      
      const inLineAlready = () => { return (idStoreInline == '') ? false : true;}
        
      // clear everything needed to reset the display to not in line
       const clearInLine = () => {
            isSelected = '0';
            selectedCountdown = 0;
            setInlineStoreId('');
            idStoreInline = '';
            setInline('0');
            setInlineMe('');
            setSelected('0');
            setCountdown('');
            setShowQRCode('0');
       }
        
       const addRandomUsers = (props, number) => {
          for(var i=0; i<number; i++) {
               var nickname = "USER_"  + i;
               var userid = Math.floor((Math.random() * 10000) + 1);   // number between 1 and 10000
               var apnToken = "xxxxxxx";  // can't be notified
                
               // base64 encode nickname
               var nickname64 = Buffer.from(nickname, 'binary').toString('base64');
                   
               const payload = {
                 ...query,
                   type:'Store',
                   name: props.name,
                   contact: userid + '][' + apnToken,
                   description: nickname64,
                   userID: props.userID
               };
                   
               clearInLine();

               add(payload)
                 .then(() => {
                     //Alert.alert('Done!', 'You are now in line at\n' + props.name, [{text: 'OK'}]);
                     //updateBusinessList("Updating after join...");
                 })
                 .catch(err => {
                   //Alert.alert('ERROR', 'add failed.\n' + err + '\n If the problem persists contact an administrator.', [{text: 'OK'}]);
                 });
            }
        }
                      
            
     /*
      *  Join a line at the store
      */
      const joinLine = (nickname) => {
        var props = joinProps;
        showJoinDialog('0');
            
        // base64 encode nickname
        var nickname64 = Buffer.from(nickname, 'binary').toString('base64');
            
        const payload = {
          ...query,
            type:'Store',
            name: props.name,
            contact: userID() + '][' + global.apnToken,
            description: nickname64,
            userID: props.userID
        };
            
        clearInLine();

        add(payload)
          .then(() => {
              Alert.alert('Done!', 'You are now in line at\n' + props.name, [{text: 'OK'}]);
              updateBusinessList("Updating after join...");
          })
          .catch(err => {
            console.log(err);
            //Alert.alert('ERROR', 'add failed.\n' + err + '\n If the problem persists contact an administrator.', [{text: 'OK'}]);
          });
      };
       
  /*
   *   Leave a line by choice, need the id of the database entry
   */
   const leaveLine = (itemid, userMessage) => {
     const payload = {
       ...query,
            id: itemid
     };
            
     clearInLine();

     // remove the line db entry
     remove(payload)
       .then(() => {
           // Notify everyone else they've moved up (maybe)
           for(var i=0; i<inlineWithMeItems.length; i++) {
                var tonotify = inlineWithMeItems[i];
               
               if(inlineMe == tonotify['_id'])
                   continue;  // dont' send to me
                
                // another user in line
                var type = global.notificationMoveUp;
                var title = nameStoreInline;
                var body  = 'The line has moved!';
                var sound;
                if(i == 1)      { sound = 'next.wav';   body = 'You are now next in line.'; }
                else if(i == 2) { sound = 'second.wav'; body = 'You are now 2nd in line.'; }
                else if(i == 3) { sound = 'third.wav';  body = 'You are now 3rd in line.'; }
                else if(i == 4) { sound = 'fourth.wav'; body = 'You are now 4th in line.'; }
                else
                    break;  // don't send notifications beyond 4th in line
                
                var token  = getAPNTokenFromContact(tonotify.contact);
                var payload = {title: title, body: body, payload: {type: type, nickname: '', userid: ''}};
                var spayload = JSON.stringify(payload);
                var spayload64 = Buffer.from(spayload, 'binary').toString('base64');
                push(token, spayload64, sound)
                     .then((response) => {
                         if(response.result == 'SUCCESS') {
                         }
                         else {
                             Alert.alert("Notification Failed", 'Reported error:\n' + response.result);
                         }
                     })
                     .catch(err => {
                        Alert.alert('Notification Failed', 'Network error:\n' + err, [{text: 'OK'}]);
                     });
           }
           
           Alert.alert('Left the Safe Queue', userMessage, [{text: 'OK'}]);
           updateBusinessList("Updating after leave...");  // reload
       })
       .catch(err => {
         console.log(err);
         //Alert.alert('ERROR', 'Remove failed.\n' + err + '\n If the problem persists contact an administrator.', [{text: 'OK'}]);
       });
   };
           
                    
  const itemPressed = (props) => {
     if(props['_id'] == idStoreInline) {
          // we're in a line
          Alert.alert("Leave the line?", "Do you really want to leave the line?",
          [
              { text: "No",
                 onPress: () => console.log("Cancel Pressed"),
                 style: "cancel"
              },
              {  text: "Yes",
                 onPress: () => {
                     leaveLine(inlineMe, '');
                 }
              }
          ], { cancelable: false });
     }
     else if(canGetInLine(distanceInMeters(props))) {
         

         //setJoinProps(props);
         //addRandomUsers(props, 7);
         //return;
         
        setJoinProps(props);
        showJoinDialog('1');
     }
     else {
          // debug - add users
          //setJoinProps(props);
          //addRandomUsers(props, 1);
          //return;
         Alert.alert("Sorry...", "You aren't close enough to\n" + props.name + "\nto get in line.",
                  [
                      { text: "Okay",
                         onPress: () => console.log("Cancel Pressed"),
                         style: "cancel"
                      },
                      {  text: "MAP IT FOR ME",
                         onPress: () => {navigation.navigate('Map', { item: props })}
                      }
                  ], { cancelable: false });
         
              
          //Alert.alert("Sorry...", "You aren't close enough to\n" + props.name + "\nto get in line.");
     }
  }
                      
  const distanceAwayInFeet = (props) => {
      var distance = distanceInMeters(props);
      return distance * 3.28084;
  }
                      
                      
   // returns x ft or x mi
   const lineCountDisplay = (props) => {
         
             
         return result;
   }
                     
  // returns x ft or x mi
  const distanceAwayDisplay = (props) => {
        var feet = distanceAwayInFeet(props);
        if(feet > 5280) {
            feet = feet/5280;
            result = feet.toFixed(0) + " mi";
        }
        else if(feet > 2000) {
            feet = feet/5280;
            result = feet.toFixed(1) + " mi";
        }
        else
            result = feet.toFixed(0) + " ft";
            
        return result;
  }
                      
  const distanceStyleHighlight = (props) => {
        if(canGetInLine(distanceInMeters(props)))
            return styles.distanceAwayClose;
        else
            return styles.distanceAwayFar;
  }
                      
  const lineCountStyleHighlight = (props) => {
        if(canGetInLine(distanceInMeters(props)))
            return styles.lineCountClose;
        else
            return styles.lineCountFar;
  }
                       
  const myPostionInLine = (props) => {
        var n1 = inlinePositionMe + 1;
        return n1.toString();
  }

  const totalInLine = (props) => {
        var t = inlineWithMeItems.length;
        return t.toString();
  }

  const distanceDisplay = (props) => {
        var result = props.description + '\n'; // address first
        var distance = distanceInMeters(props);
        var feet = distance * 3.28084;

        if(feet > 5280) {
            feet = feet/5280;
            result += feet.toFixed(0) + " miles away";
        }
        else {
            
            // Am I waiting in this store's line?
            if(props['_id'] == inlineStoreId) {
                // Yes, so what is my position?
                var n1 = inlinePositionMe + 1;
                var n = n1.toString();
                var t = inlineWithMeItems.length;
                var ts = t.toString();
                if(n1 == 1) {
                    if(isSelected == '1') //selected == '1')
                        result += "GO TO THE BUSINESS NOW!!!";
                    else
                        result += "YOU ARE NEXT IN LINE";
                }
                else
                    result += "YOU ARE NUMBER " + n1 + ' OF ' + ts;
            }
            else if(canGetInLine(distance))
                if(inLineAlready())
                    result += feet.toFixed(0) + " feet away.";
                else
                    result += feet.toFixed(0) + " feet away, TAP HERE TO GET IN LINE";
            else
                result += feet.toFixed(0) + " feet away"
        }
        return result;
     };
                      
      const itemStyleSelect = (props) => {
            // A bit of a kluge here - seems to be timing issue where we still appear selected...
            // This prevents a selected or waiting (colored background) entry in the middle of a list
            if(sortedfilteredItems.length > 1) {
                // Assumed not in a line
                if(canGetInLine(distanceInMeters(props)))
                    return styles.itemTouchableCLOSE;
                else
                    return styles.itemTouchable;
            }

            if(props['_id'] == inlineStoreId) {
                // We're in a line
                if(isSelected == '1') //selected == '1')
                    return styles.itemTouchableSELECTED
                else
                    return styles.itemTouchableINLINE
            }
            else {
                // We're not in a line, but highlight stores "close" to me
                if(canGetInLine(distanceInMeters(props)))
                    return styles.itemTouchableCLOSE;
                else
                   return styles.itemTouchable;
            }
      }
           
    /*
    const getLogo = (name) => {
        if(name == "Starbucks") return
              '<View>
                  <Image style={styles.costcoLogo} source={require('../images/logo_costco.png')} />
              </View>';
        
        if(name == "Trader Joe's") return
              '<View>
                  <Image style={styles.traderjoesLogo} source={require('../images/logo_traderjoes.png')} />
              </View>';
        
        if(name == "Wal-Mart") return
              '<View>
                  <Image style={styles.walmartLogo} source={require('../images/logo_walmart.png')} />
              </View>';
            
        if(name == "Ralphs") return
              '<View>
                  <Image style={styles.ralphsLogo} source={require('../images/logo_ralphs.png')} />
              </View>';
            
        // Default to just the name
        return
             '<View style={styles.itemView}>
                  <Text style={styles.itemName}>{props.name}</Text>
              </View>';
    }
     */
      
  /*
   * This is each displayed item
   *
   * For prototype, we have prepopulated logos...  // TODO: add import logo function
   */
  const Item = (props) => {
    return (
      <TouchableOpacity style={itemStyleSelect(props)}
            onPress={() => {
                itemPressed(props)
            }}>
        <View style={styles.splitView}>
            <View>
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
                
                <Text style={styles.itemDescription}>{ props.description }</Text>
            </View>
           
            
            <View style={styles.splitViewColumn}>
                <View style={distanceStyleHighlight(props)}>
                    <Text style={distanceStyleHighlight(props)}>{distanceAwayDisplay(props)}</Text>
                </View>
                <View style={lineCountStyleHighlight(props)}>
                    <Text style={lineCountStyleHighlight(props)}>Q: {props.quantity}</Text>
                </View>
            </View>
           
        </View>
            { ((showQRCode == '0') ? false : true) ?
                <View>
                    <View style={styles.textNicknameView}>
                        <Text style={styles.textNickname}>{myNickname}</Text>
                    </View>
                    <View style={styles.qrCodeDisplay} hide={true}>
                         <QRCode
                           value={QRCodeValue}
                           size={180}
                           color="black"
                           backgroundColor="white"
                           />
                       <Text>This is your entrance code.</Text>
                  
                    { ((isSelected == '1') ? false : true) ?
                       <View style={styles.textLineNumberView}>
                            <Text style={styles.textMarginTop}>Your position:</Text>
                            <Text style={styles.textLineNumber}>{myPostionInLine(props)}</Text>
                            <Text>of {totalInLine(props)} in line</Text>
                        </View>
                        :
                        <View style={styles.textLineNumberView}>
                            <Text style={styles.textMarginTop}>Time Left:</Text>
                            <Text style={styles.textLineNumber}>{countdown}</Text>
                        </View>
                    }
                    </View>
                </View>: null
             }
      </TouchableOpacity>
    );
  };
                      
  const searchPress = () => {
      updateBusinessList("Loading...");   // this was explicit user interaction
  }

  /*
   *  Update the display!!
   */
  const updateBusinessList = (userMessage) => {
    const payload = {
      ...query
    };
           
    //if(userMessage == "Geolocation...")
    //    setLoader(userMessage);
    search(payload)
      .then((results) => {
        setShowQRCode('0');  // until we know otherwise
        setQRCodeValue('');
        sortandfilter(results, global.deviceLocation)
        //setLoader('Done.');
        setRefreshing(false);
      })
      .catch(err => {
          // this seems to happen on occasion, so have to look into it
          // don't forget it, just blink it for now
          if(global.debug || debugOverride) {
              setLoader("Seach error: " + err);
              let timerId = setTimeout(function tick() {
                  setLoader('');
              }, 2000);
              //Alert.alert('ERROR', 'Search error.' + err, [{text: 'A OK'}]);
          }
      });
  };
                      
  const sortandfilter = (items, loc) => {
        var arrme = (loc != "") ? loc.split(',') : query.location.split(',')
        var lat1me = arrme[0];
        var lon1me = arrme[1];
            
        // Sort all items from closest to farthest
        const sorteditems = items.sort((a, b) => {
            var arra = a.location.split(',');
            var lat1a = arra[0];
            var lon1a = arra[1];
            const aDist = getDistanceFromLatLonInKm(lat1a,lon1a,lat1me,lon1me);
                                                   
            var arrb = b.location.split(',');
            var lat1b = arrb[0];
            var lon1b = arrb[1];
            const bDist = getDistanceFromLatLonInKm(lat1b,lon1b,lat1me,lon1me);
                                                
           return aDist - bDist;
        });
        
        // find the stores we're dealing with here...
        var allStores = new Map();
        for(var i=0; i<sorteditems.length; i++) {
            var sitem = sorteditems[i];
            var customer = getUserIDFromContact(sitem.contact);
            if(customer == "none@none.com") {
                sitem.quantity = 0;
                allStores.set(sitem.name, sitem); // TODO: currently uses name as uniqueID, change to real ID
            }
        }
                   
        // See if we're in line somewhere, as if so we'll collapse the list to just that
        // TODO: uses store name as equality (assumes uniqueness) so we'll change that to ID eventually
        idStoreInline = '';  // til we know otherwise
        nameStoreInline = ''; // til we know otherwise
        var finalitems = new Array();
        for(var i=0; i<sorteditems.length; i++) {
            var item = sorteditems[i];
            
            // look for already me in line...
            // I'm in line if the contact field has my user ID
            var contactID = getUserIDFromContact(item.contact);
            if(contactID == userID()) {
                 setInline('1');  // seems redundant now
                 setInlineMe(item['_id']);
                 nameStoreInline = item.name;
                 // nickname is base64, so decode it
                 var nickname = Buffer.from(item.description, 'base64').toString('binary');
                 setMyNickname(nickname);
            }
            
            if(contactID == "none@none.com") {
                // This is a store
                // A store has contact of "none@none.com"   TODO: use a better way
                finalitems.push(item);   // only stores shown
            }
            else {
                // This is someone in line for a store
                // Add him to the line count for that store
                var sitem = allStores.get(item.name);
                sitem.quantity++;
            }
        }
            
        // If we're in line, then get the entire line and our position in it
        // This must look in the original list, since we've removed ourself form the sorted one
        if(nameStoreInline != "") {
            var inlineWithMe = new Array();
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                // If the contact is none@none.com this means it is a store (not a customer)
                var contactID = getUserIDFromContact(item.contact);
                if((item.name == nameStoreInline) && (contactID != 'none@none.com')) {
                    // this is a customer waiting with us, including me
                    inlineWithMe.push(item)
                }
            }
            
            // Save the line (for updates) and sort it by whenCreated
            const sortedline = inlineWithMe.sort((a, b) => {
               var aq = parseInt(a.whenCreated);
               var bq = parseInt(b.whenCreated);
               return aq - bq;
            });
            setInlineWithMeItems(sortedline);
            
            // find my position in line
            var item_me;
            for(var i=0; i<sortedline.length; i++) {
               var item = sortedline[i];
               var contactID = getUserIDFromContact(item.contact);
               if(contactID == userID())
               {
                   // this is me, I'm the i+1 person in line
                   setInlinePositionMe(i);  // 0-based
                   item_me = item;
                   break;  // I should only be there once  TODO: make sure this is true
               }
            }
        
            // find the _id of document that is this store, used for updates to the store
            // NOTE: Not sure this is needed anymore, since we don't update the store on join/leave
            //
            // Also, collapse the List to show just the store we are in line for
            var reallyfinalitems = new Array();
            for(var i=0; i<finalitems.length; i++) {
                var item = finalitems[i];
                if(item.name == nameStoreInline) {
                    // BUT WAIT !!!  Make sure we didn't leave the area of the store
                    var store = item.location;
                    var me = global.deviceLocation;
                    if(!canGetInLine(distanceBetweenInMeters(me, store))) {
                       // we're moved away from the store
                         leaveLine(item_me['_id'], "Sorry...,\nyou're no longer close enough to remain in the Safe Queue.");
                        setQRCodeValue('');
                        setShowQRCode('0');
                        setSortedFilteredItems(finalitems);  // just stores
                        return;
                    }
                    
                    setInlineStoreId(item['_id']);
                    idStoreInline = item['_id'];
                    reallyfinalitems.push(item)
                    setSortedFilteredItems(reallyfinalitems)
                    break;
               }
            }
            
            setQRCodeValue(userID());  // this code is my user ID
            setShowQRCode('1');
        }
        else
            setSortedFilteredItems(finalitems);
  }
                      
    // Refresh on pull
     const onRefresh = () => {
        setRefreshing(true);
        updateBusinessList("User refresh...");
     };

  

  return (
    <View style={styles.outerView}>
          
          { (false) ?

          <Dialog
              visible={bShowJoinDialog}
              title="Custom Dialog"
              onTouchOutside={(bShowJoinDialog == '0') ? false : true} >
              <View>
                          // your content here
        
        <Text> HELLO </Text>
                
              </View>
          </Dialog> : null
        }
          
          { (false) ? // }(bShowJoinDialog == '1') ?

          <View style={styles.centeredView}>
        <KeyboardAvoidingView
             behavior={Platform.OS == "ios" ? "padding" : "height"}
             style={styles.container}
           >
          <Modal
            animationType="slide"
            transparent={true}
            visible={(bShowJoinDialog == '0') ? false : true}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
            }}
          >
          <View style={styles.centeredView}>
                   <View style={styles.modalView}>
                     <Text style={styles.modalTitleText}>Join Line</Text>
        
                    <Text style={styles.modalText}>Enter a nickname (optional)</Text>

        
                    <TextInput style={styles.modalTextInput}
                       value={''}
                       placeholder='bob'
                       editable={true}
        autoFocus={true}
        clearTextOnFocus={true}
        textAlign={'left'}
                    />
        
                    <View style={styles.splitView}>

                     <TouchableHighlight
                           style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                           onPress={() => {
                                showJoinDialog(!bShowJoinDialog);
                           }}
                         >
                         <Text style={styles.textStyle}>Cancel</Text>
                     </TouchableHighlight>
                    <TouchableHighlight
                                  style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                                  onPress={() => {
                                       showJoinDialog(!bShowJoinDialog);
                                  }}
                                >
                                <Text style={styles.textStyle}>Okay</Text>
                            </TouchableHighlight>
                    </View>
        
                    <TextInput
                       style={styles.textKluge}
                       value={''}
                       placeholder=''
                       editable={false}
        autoFocus={true}
        clearTextOnFocus={true}
        textAlign={'left'}
                    />
                   </View>
                 </View>
               </Modal>
          <TouchableHighlight
              style={styles.openButton}
              onPress={() => {
                    showJoinDialog('0');
              }}
            >
              <Text style={styles.textStyle}>Show Modal</Text>
            </TouchableHighlight>
        </KeyboardAvoidingView>
          </View> : null
      }
          
      <View>
          <DialogInput isDialogVisible={(bShowJoinDialog == '0') ? false : true}
                      title={"Join the Safe Queue"}
                      message={"Enter a nickname (optional)"}
                      hintInput ={"nickname"}
                      modalStyle={styles.backdropStyle}
                      submitText={'Join'}
                      submitInput={ (inputText) => {joinLine(inputText)} }
                      closeDialog={ () => {showJoinDialog('0')}}>
          </DialogInput>
      </View>
          
      <FlatList style={styles.flatListView}
          data={sortedfilteredItems}
          renderItem={({ item }) => <Item {...item} />}
          keyExtractor={item => item.id || item['_id']}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
           
      { (global.debug || debugOverride) ?
          <View>
          <View style={styles.inputsView}>
             <Text style={styles.label}>{loader}</Text>
          </View>
          <TextInput
                style={styles.textInputDisabled}
                value={global.deviceLocation}
                placeholder='street address, city, state'
                editable={false}
             />
          </View> : null
       }
    </View>

  );
};

export default SearchResources;
