import Config from 'react-native-config';

import DeviceInfo from 'react-native-device-info';

let serverUrl = Config.STARTER_KIT_SERVER_URL;
if (serverUrl.endsWith('/')) {
  serverUrl = serverUrl.slice(0, -1)
}
// const serverUrl = 'http://localhost:3000';

//const daveUrl = 'http://192.168.1.77:3000';
const daveUrl = 'https://safequeue.mybluemix.net';


const uniqueid = DeviceInfo.getUniqueId();

export const userID = () => {
  return uniqueid;
}

/*
 * THe contact is of this form:
 * uniqueID][APNtoken
 */
export const getUserIDFromContact = (contact) => {
   var arr = contact.split('][');
   return arr[0];
}
export const getAPNTokenFromContact = (contact) => {
  var arr = contact.split('][');
  return arr[1];
}
export const createContact = (userid, token) => {
  return userid + "][" + token;
}


export const push = (token, payload, sound) => {
  return fetch(`${daveUrl}/api/push/${token}/${sound}/${payload}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
        return response.json();
    }
  });
};

export const search = (query) => {
  const type = query.type ? `type=${query.type}` : ''
  const name = query.name ? `name=${query.name}` : ''
  const contact = query.contact ? `contact=${query.contact}` : ''
  const userID = query.userID ? `userID=${query.userID}` : ''
        
  return fetch(`${daveUrl}/api/resource?${name}&${type}&${contact}&${userID}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};

export const add = (item) => {
  return fetch(`${daveUrl}/api/resource`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};

export const update = (item) => {
  return fetch(`${daveUrl}/api/resource/${item.id}`, {
    method: 'PATCH',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Item not found');
      } else {
        throw new Error('Please try again. If the problem persists contact an administrator.');
      }
    }
  });
};

export const remove = (item) => {
  return fetch(`${daveUrl}/api/resource/${item.id}`, {
    method: 'DELETE',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Item not found');
      } else {
        throw new Error('Please try again. If the problem persists contact an administrator.');
      }
    }
  });
};

export const session = () => {
  return fetch(`${daveUrl}/api/session`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      } else {
        return response.text();
      }
    });
};

export const message = (payload) => {
  return fetch(`${daveUrl}/api/message`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
};

export const addressFromLocation = (loc, callback) => {
       var hereurl = "https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?apiKey=vYb6CK_C2mfI-bgLTmKKXIdu_qqhhQgDSLtqEyTH68A&mode=retrieveAddresses&prox=";
                         
       fetch(`${hereurl}${loc}`, {
             method: 'GET',
             mode: 'no-cors',
             cache: 'no-cache',
             headers: {
               'Content-Type': 'application/json'
             }
       }).then((response) => response.json())
         .then((responseJson) => {
                 console.log(responseJson);
             
             var o = responseJson.Response.View[0].Result[0].Location.Address;
             var number = (o.HouseNumber == null) ? '' : o.HouseNumber;
             var street = (o.Street      == null) ? '' : o.Street;
             var city   = (o.City        == null) ? '' : o.City;
             var state  = (o.State       == null) ? '' : o.State;
             var zip    = (o.PostalCode  == null) ? '' : o.PostalCode;
             
             callback(number + " " + street + "\n" + city + ", " + state + ' ' + zip);
            
             /*
             Label: "6847 Vallon Dr, Rancho Palos Verdes, CA 90275, United States"
             Country: "USA"
             State: "CA"
             County: "Los Angeles"
             City: "Rancho Palos Verdes"
             Street: "Vallon Dr"
             HouseNumber: "6847"
             PostalCode: "90275"
             AdditionalData: (4) [{…}, {…}, {…}, {…}]
              */
     });
 }

