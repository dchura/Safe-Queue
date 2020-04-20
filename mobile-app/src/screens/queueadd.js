import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PickerSelect from 'react-native-picker-select';
import { CheckedIcon, UncheckedIcon } from '../images/svg-icons';
import Geolocation from '@react-native-community/geolocation';

import { add, userID, addressFromLocation } from '../lib/utils'
import { getUserIDFromContact, getAPNTokenFromContact, createContact } from '../lib/utils'

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
    justifyContent: 'space-between'
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
      paddingTop: 20
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
  textInputDisabled: {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 11,
    backgroundColor: '#f4f4f4',
    color: '#999',
    flex: 1,
    padding: 10,
    elevation: 2,
    marginBottom: 25
  },
  button: {
    backgroundColor: '#1062FE',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign:'center',
    marginTop: 0,
    borderRadius: 10
  }
});

const AddResource = function ({ navigation }) {
    const clearItem = { userID: userID(), type: 'Store', name: '', description: '', location: '', contact: 'none@none.com', quantity:'1' }
  const [item, setItem] = React.useState(clearItem);
  const [useLocation, setUseLocation] = React.useState(true);
  const [position, setPosition] = React.useState({})
  const [placeholder, setPlaceholder] = React.useState('e.g., 3458 S. Main Street\nChicago IL 60462');

  React.useEffect(() => {
    navigation.addListener('focus', () => {
        if(global.deviceLocation == "") {
            // This is odd, since we expect App.js to get the location, but...
            Geolocation.getCurrentPosition((pos) => {
                var loc = `${pos.coords.latitude},${pos.coords.longitude}`;
                setPosition(pos);
                global.deviceLocation = loc;
                addressFromLocation(global.deviceLocation, updateEstimatedAddress);
                if (useLocation) {
                  setItem({
                      ...item, location: loc // `${pos.coords.latitude},${pos.coords.longitude}`
                  })
                }
            });
        }
        else {
            addressFromLocation(global.deviceLocation, updateEstimatedAddress);
        }
    })
  }, []);
    
  const updateEstimatedAddress = (address) => {
      setPlaceholder(address);
  }

  const toggleUseLocation = () => {
    if (!useLocation && position) {
      setItem({
        ...item,
            location: global.deviceLocation
      })
    }
    setUseLocation(!useLocation);
  };

  const addStore = () => {
       if(item.name == "") {
            Alert.alert("Error", "You must supply a name for the business.");
            return;
       }
      
      if(global.deviceLocation == "") {
          Alert.alert("Error", "Can't add the business since we don't have a GPS location yet.\n\nTry again in a moment");
          return;
      }
      
      if(global.apnToken == '') {
          Alert.alert("Error", "Can't add the business since notifications are enabled yet or haven't been delivered to this app.\n\nTry again in a moment.");
          return;
      }
      
      if(item.description == "")
      {
          item.description = placeholder;
          /*
        Alert.alert(
             'Confirm',
             'Are you sure you want to add this business without an address?',
             [
                { text: 'No' },
                { text: 'Yes', onPress: () => doAddStore() }
             ]);
         return;
           */
      }
                 
      // if we made it here, all is hunky-dory
      doAddStore();
  }
      
  const doAddStore = () => {
    const payload = {
      ...item,
        userID: userID(),
        location: global.deviceLocation,
        contact: createContact("none@none.com", apnToken)
    };

    add(payload)
      .then(() => {
          Alert.alert('Done!', 'Your Store has been added.', [{text: 'OK'}]);
          setItem({
              ...clearItem
          });
          navigation.goBack();
      })
      .catch(err => {
        console.log(err);
        Alert.alert('ERROR', 'Add failed. If the problem persists contact an administrator.', [{text: 'OK'}]);
      });
  };
  
  return (
    <ScrollView style={styles.outerView}>
        
          <Text style={styles.label}>Name</Text>
               <TextInput
                 style={styles.textInput}
                 value={item.name}
                 onChangeText={(t) => setItem({ ...item, name: t})}
                 //onSubmitEditing={addStore}
                 returnKeyType='done'
                 enablesReturnKeyAutomatically={true}
                 placeholder='e.g., Costco #4576'
                 blurOnSubmit={false}
               />
          <Text style={styles.label}>Address (Estimated, tap to change)</Text>
                 <TextInput
                   multiline={true}
                   style={styles.textInput}
                   value={item.description}
                   onChangeText={(t) => setItem({ ...item, description: t})}
                   //onSubmitEditing={addStore}
                   returnKeyType='default'
                   enablesReturnKeyAutomatically={true}
                   placeholder={placeholder}
                 />
          
          {
                item.type !== '' &&
                item.name.trim() !== '' &&
                item.contact.trim() !== '' &&
                <TouchableOpacity onPress={addStore}>
                  <Text style={styles.button}>Save</Text>
                </TouchableOpacity>
          }
          <Text style={styles.heading}>Your current location will be used as:</Text>
          
          <TextInput
            style={styles.textInputDisabled}
            value={global.deviceLocation}
            onChangeText={(t) => setItem({ ...item, location: t})}
            onSubmitEditing={addStore}
            returnKeyType='done'
            enablesReturnKeyAutomatically={true}
            placeholder='street address, city, state'
            editable={!useLocation}
          />

          
    </ScrollView>
  );
};

export default AddResource;
