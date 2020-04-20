import 'react-native-gesture-handler';
import * as React from 'react';

import { View, Text, Button, Alert, Image } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoadingScreen from './src/screens/loading';
import Home from './src/screens/home';
import Chat from './src/screens/chat';
import SearchResources from './src/screens/customer';
import AddResource from './src/screens/queueadd';
import EditResource from './src/screens/queuemanagement';
import MyResources from './src/screens/manager';
import Map from './src/screens/map';



import Geolocation from '@react-native-community/geolocation';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from "react-native-push-notification";

import { HomeIcon, DonateIcon, SearchIcon, MapIcon, CheckedIcon } from './src/images/svg-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ResourcesStackOptions = ({ navigation }) => {
  return ({
    headerStyle: { backgroundColor: '#7030A0',},
      
      headerTintColor: '#fff',
        headerTitleStyle: {
        fontSize: 20,
          fontWeight: 'bold',
      },
      /*
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate('Chat')}
        title='Chat '
      />
    )
       */
  });
};

const DonationsStackOptions = ({ navigation }) => {
  return ({
  headerStyle: { backgroundColor: '#7030A0',},
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate('Create Queue')}
        color='#FFF'
        title='Add '
                        />
    ),
    headerTintColor: '#fff',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
      
  });
};

const CreateQueueStackOptions = ({ navigation }) => {
  return ({
  headerStyle: { backgroundColor: '#7030A0',},
    headerTintColor: '#fff',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
  });
};

const QueueManagementStackOptions = ({ navigation }) => {
  return ({
  headerStyle: { backgroundColor: '#7030A0',},
    headerTintColor: '#fff',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
  });
};


const tabBarOptions = {
  //showLabel: false,
  activeTintColor: '#7030A0',
  inactiveTintColor: '#000',
  style: {
    backgroundColor: '#F1F0EE',
    paddingTop: 5
  }
};

const TabLayout = () => (
  <Tab.Navigator
    style={{paddingTop: 50}}
    initialRouteName='Home'
    tabBarOptions={tabBarOptions} >
    <Tab.Screen
      name='HOME'
      component={Home}
      options={{
            tabBarIcon: ({color}) => (<HomeIcon fill={color} />)
      }}
    />
    <Tab.Screen
      name='MANAGER'
      component={DonateStackLayout}
      options={{
        tabBarIcon: ({color}) => (<DonateIcon fill={color} />)
      }}
    />
    <Tab.Screen
      name='CUSTOMER'
      component={SearchStackLayout}
      options={{
        tabBarIcon: ({color}) => (<CheckedIcon fill={color} />)
      }}
    />
  </Tab.Navigator>
);
            
const DonateStackLayout = () => (
  <Stack.Navigator
        navigationOptions={{
            headerTintColor: '#7030A0',
            headerTitleStyle: { color: '#fff', },
        }}>
       <Stack.Screen name='Management' component={MyResources} options={DonationsStackOptions}/>
       <Stack.Screen name='Create Queue' component={AddResource} options={CreateQueueStackOptions}/>
       <Stack.Screen name='Queue Manager' component={EditResource} options={QueueManagementStackOptions} />
  </Stack.Navigator>
);

const SearchStackLayout = () => (
  <Stack.Navigator>
    <Stack.Screen name='Safe Queues' component={SearchResources} options={ResourcesStackOptions} />
    <Stack.Screen name='Chat' component={Chat} />
    <Stack.Screen name='Map' component={Map} />
  </Stack.Navigator>
);
        
global.deviceLocation = "";
global.apnToken = "";
global.arrCustomerNotifications = new Array();
global.arrBusinessNotifications = new Array();
global.notificationYouAreNext = "youarnext";  // notification types
global.notificationMoveUp     = "moveup";
global.notificationScanned    = "scanned";
global.notificationUnknown    = "unknown";  // we got this when the app started, but can't tell what it is


// debug
global.debug = false;

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
    
  React.useEffect(() => {
      // Get our initial GPS position globally known
      // Other components will watch the GPS position when needed
      Geolocation.getCurrentPosition((pos) => {
          var loc =`${pos.coords.latitude},${pos.coords.longitude}`;
          global.deviceLocation = loc;
      });
    
      // Get a push token
      // TODO: this can be a bit rude to ask for push notifications at start up, so make it polite
      PushNotification.configure({
            onRegister: function(token) {
                 if(global.apnToken == "") {
                     // kluge here, since we can't seem to get push notifications while the app was closed.
                     // Assume this means we just started up...
                     PushNotification.getApplicationIconBadgeNumber(function(numBadges) {
                         if(numBadges > 0) {
                             // well now
                             //global.arrCustomerNotifications.push(notification);
                             //Alert.alert("We have unhandled Nofications", numBadges.toString());
                             
                             var note = new Object();
                             note.type = notificationUnknown;
                             global.arrCustomerNotifications.push("unknown");
                         }
                    });
                 }
               
                // Set the APN Token
                if(global.debug && global.apnToken == "")
                    Alert.alert("APN TOKEN", "GOT:\n" + token.token); // debug
                global.apnToken = token.token;
            },
            onNotification: function(notification) {
                // pass on the notification to everybody "listening"
                global.arrCustomerNotifications.push(notification);
                global.arrBusinessNotifications.push(notification);
                //Alert.alert(notification.alert.title, notification.alert.body);
                // required on iOS only
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            onError: function() { Alert.alert("APNS", "onError called"); },  // does this exist???
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            popInitialNotification: true,
            requestPermissions: true,
      });
      
      // switch screens after we've loaded
      // TODO: stay here til we have a GPS location
      setTimeout(() => {
         setIsLoading(false);
      }, 500);
  }, []);

  if (isLoading) {
    return (<LoadingScreen />);
  } else {
    return (
      <NavigationContainer>
        <TabLayout/>
      </NavigationContainer>
    );
  }
};

            
export default App;
