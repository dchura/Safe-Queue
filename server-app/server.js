require('dotenv').config({silent: true})

const express = require('express');
const bodyParser = require('body-parser');

const assistant = require('./lib/assistant.js');
const port = process.env.PORT || 3000

const cloudant = require('./lib/cloudant.js');

// for APNS
var apn = require('apn')

const app = express();
app.use(bodyParser.json());

const handleError = (res, err) => {
  const status = err.code !== undefined && err.code > 0 ? err.code : 500;
  return res.status(status).json(err);
};

app.get('/', (req, res) => {
  return res.json({
    status: 'ok'
  });
});

/**
 * Get a session ID
 *
 * Returns a session ID that can be used in subsequent message API calls.
 */
app.get('/api/session', (req, res) => {
  assistant
    .session()
    .then(sessionid => res.send(sessionid))
    .catch(err => handleError(res, err));
});

/**
 * Post process the response from Watson Assistant
 *
 * We want to see if this was a request for resources/supplies, and if so
 * look up in the Cloudant DB whether any of the requested resources are
 * available. If so, we insert a list of the resouces found into the response
 * that will sent back to the client.
 * 
 * We also modify the text response to match the above.
 */
function post_process_assistant(result) {
  let resource
  // First we look to see if a) Watson did identify an intent (as opposed to not
  // understanding it at all), and if it did, then b) see if it matched a supplies entity
  // with reasonable confidence. "supplies" is the term our trained Watson skill uses
  // to identify the target of a question about resources, i.e.:
  //
  // "Where can i find face-masks?"
  //
  // ....should return with an enitity == "supplies" and entitty.value = "face-masks"
  //
  // That's our trigger to do a lookup - using the entitty.value as the name of resource
  // to to a datbase lookup.
  if (result.intents.length > 0 ) {
    result.entities.forEach(item => {
      if ((item.entity == "supplies") &&  (item.confidence > 0.3)) {
        resource = item.value
      }
    })
  }
  if (!resource) {
    return Promise.resolve(result)
  } else {
    // OK, we have a resource...let's look this up in the DB and see if anyone has any.
    return cloudant
      .find('', resource, '')
      .then(data => {
        let processed_result = result
        if ((data.statusCode == 200) && (data.data != "[]")) {
          processed_result["resources"] = JSON.parse(data.data)
          processed_result["generic"][0]["text"] = 'There is' + '\xa0' + resource + " available"
        } else {
          processed_result["generic"][0]["text"] = "Sorry, no" + '\xa0' + resource + " available"           
        }
        return processed_result
      })
  }
}

/**
 * Post a messge to Watson Assistant
 *
 * The body must contain:
 * 
 * - Message text
 * - sessionID (previsoulsy obtained by called /api/session)
 */
app.post('/api/message', (req, res) => {
  const text = req.body.text || '';
  const sessionid = req.body.sessionid;
  console.log(req.body)
  assistant
    .message(text, sessionid)
    .then(result => {
      return post_process_assistant(result)
    })
    .then(new_result => {
      res.json(new_result)
    })
    .catch(err => handleError(res, err));
});

/**
 * Get a list of resources
 *
 * The query string may contain the following qualifiers:
 * 
 * - type
 * - name
 * - userID
 *
 * A list of resource objects will be returned (which can be an empty list)
 */
app.get('/api/resource', (req, res) => {
  const type = req.query.type;
  const name = req.query.name;
  const contact = req.query.contact;
  const userID = req.query.userID;
  cloudant
    .find(type, name, contact, userID)
    .then(data => {
      if (data.statusCode != 200) {
        res.sendStatus(data.statusCode)
      } else {
        res.send(data.data)
      }
    })
    .catch(err => handleError(res, err));
});

/**
 * Create a new resource
 *
 * The body must contain:
 * 
 * - type
 * - name
 * - contact
 * - userID
 *
 * The body may also contain:
 * 
 * - description
 * - quantity (which will default to 1 if not included)
 * 
 * The ID and rev of the resource will be returned if successful
 */
let types = ["Food", "Other", "Store", "Help"]
app.post('/api/resource', (req, res) => {
  if (!req.body.type) {
      console.log("No type");
    return res.status(422).json({ errors: "Type of item must be provided"});
  }
  if (!types.includes(req.body.type)) {
      console.log("BAD type");
    return res.status(422).json({ errors: "Type of item must be one of " + types.toString()});
  }
  if (!req.body.name) {
      console.log("BAD name");
    return res.status(422).json({ errors: "Name of item must be provided"});
  }
  if (!req.body.contact) {
      console.log("BAD contact");
    return res.status(422).json({ errors: "A method of conact must be provided"});
  }
  const type = req.body.type;
  const name = req.body.name;
  const description = req.body.description || '';
  const userID = req.body.userID || '';
  const quantity = req.body.quantity || 1;
  const location = req.body.location || '';
  const contact = req.body.contact;

  cloudant
    .create(type, name, description, quantity, location, contact, userID)
    .then(data => {
      if (data.statusCode != 201) {
        res.sendStatus(data.statusCode)
      } else {
        res.send(data.data)
      }
    })
    .catch(err => handleError(res, err));
});

/**
 * Update new resource
 *
 * The body may contain any of the valid attributes, with their new values. Attributes
 * not included will be left unmodified.
 * 
 * The new rev of the resource will be returned if successful
 */

app.patch('/api/resource/:id', (req, res) => {
  const type = req.body.type || '';
  const name = req.body.name || '';
  const description = req.body.description || '';
  const userID = req.body.userID || '';
  const quantity = req.body.quantity || '';
  const location = req.body.location || '';
  const contact = req.body.contact || '';

  cloudant
    .update(req.params.id, type, name, description, quantity, location, contact, userID)
    .then(data => {
      if (data.statusCode != 200) {
        res.sendStatus(data.statusCode)
      } else {
        res.send(data.data)
      }
    })
    .catch(err => handleError(res, err));
});

/**
 * Delete a resource
 */
app.delete('/api/resource/:id', (req, res) => {
  cloudant
    .deleteById(req.params.id)
    .then(statusCode => res.sendStatus(statusCode))
    .catch(err => handleError(res, err));
});

const server = app.listen(port, () => {
   const host = server.address().address;
   const port = server.address().port;
   console.log(`Safe Queue listening at http://${host}:${port}`);
});

/**
 * Push Notification
 */

// configuring APN with credentials
const apnOptions = {
  token: {
  key:     './certs/yourkey.p8',
    keyId:  'yourkeyid',
    teamId: 'yourteamid'
  },
  production: false
};

var apnProvider = new apn.Provider(apnOptions);

app.get('/api/push/:token/:sound/:payload', (req, res) => {

    var token = req.params.token;
    var spayload64 = req.params.payload;
    var sound = req.params.sound;
    console.log("PUSH token:" + token + "<BR>sound:" + sound + "<BR>payload:" + spayload64);
    
    var spayload = Buffer.from(spayload64, 'base64').toString('binary');
    console.log("Payload:" + spayload);
    
    var obj = JSON.parse(spayload);
    const title = obj.title;
    const body = obj.body;
    const payload = JSON.stringify(obj.payload);  // was made an object by parse above
    
    let notification = new apn.Notification({
          alert: {
            title: title,
            body: body
          },
          topic: 'com.enclayve.safequeue',
          payload: {
              payload
            //"content-available": "1",
          },
          pushType: 'alert',
          badge: 1,
          sound: sound
    });
    
    console.log("Sending PUSH....")
    const deviceTokens = [ token ];
    apnProvider.send(notification, deviceTokens).then(response => {
          // successful device tokens
          console.log(response.sent);
          // failed device tokens
          console.log(response.failed);
    });
    console.log("Sent PUSH.");
    
    // JSON Encode the result
    var obj = { result: 'SUCCESS', token: token, payload: payload };
    var myJSON = JSON.stringify(obj);
    res.send(myJSON);
});
