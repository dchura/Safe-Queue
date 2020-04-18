# Safe-Queue

## Authors

- Dave Chura


## Contents

1. [Overview](#overview)
2. [The idea](#the-idea)
3. [How it works](#how-it-works)


## Overview

### What's the problem?

COVID-19 has changed everyone's lives and social distancing has created an new environment for stores, polling places and businesses of all kinds.  The need to limit entry has created long lines of people at least 6 feet apart, who must stand for a long times outside in hot and cold weather.  This is not just inconvience but also discourages necessary shopping and can even harm our democracy as shown in the Wisconsin Election,  where lines reached several hours long.

What is needed is a solution that empowers stores, businesses and polling places to create lines without physically being in line.

### How can technology help?

Of course, physical lines cand be replaced by virtual lines, where people do not have to be physically in a line to "be in line". These lines are "safe" becuase you are never near anyone else while waiting.

There are many "reservation" systems available today, however these do not address the ad-hoc nature of shopping where the time taken by a customer in a store varies widely.  Reservation systems cannot handle the on-demand nature of shopping (and voting) that people see as "normal" and they need this normalcy in COVID-19 times.  People want to go to stores when they want to go, and spend the time they need. This cannot be "reserved" effectively for the customer and cannot be effectively managed by the business.

Furthermore, reservation systems are hard to use, including sign-ups, calendars, personal information, and a promise to show up in the future, which must be managed by businesses.  Stores (e.g. Costco) will find it impossible to use reservation systems for on-demand shopping, Polling places will find it impossible to create reservations for voting - voting is a right, and missing your reservation isn't a option.


## The idea

SAFE QUEUE IS A COMPLETELY DIFFERENT IDEA THAN A RESERVATION SYSTEM. It does create virtual lines ("safe queues") but it directly solves the on-demand nature that consumers want as "normal" for shopping. It does so with a unique combination of technologies that result in queuing that is safe in COVID-19 times, both for consumers and employees.

It is a super-simple App that is used by both the business (or polling place) and by the consumer.   There is no sign up required for consumers or for busineses, so it can be used immediately upon download. Absolutely no personal information is required, and consumers can be in line at a business within seconds of downloading the app to their devices.   Consumers use the app to join "safe queues" and businesses  use the app to manage entry into their business.  

Safe Queue is realized as a mobile app with cloud services (including computing, middleware, databases, push notifications, geolocation, geocoding). The mobile app is implemeneted in react-native and all cloud services have been tested in the IBM Cloud.




## How it works

The key element of Safe Queue is GPS location.  The app uses your GPS location as a condition for entering the 'safe queue' of a business.  A consumer can enter a line for a business if he is located within 1000 feet of the business.  It doesn't matter who you are, as long as you are nearby typically waiting in your car where you are 'safe' rather than standing outside in a line with lots of other people. If you drive away from the business, you are removed from the line automatically by the App.    The app provides directions to businesses and clearly shows when you can get in line at a business (i.e. you are close enough to it)

A business creates a 'safe queue' in the same App, which becomes published where consumers see it in their Apps.  The location of the store is location of device that created the safe queue (though the location is reverse-geocoded for convienence to users). An employee of the business controls the actual entry of people in the business with a few simple buttons.  The business can delete the 'safe queue' at any time, if they want.  However, any consumer who shows up long before opening hours can get in line, provided they stay close to the business!

Another key element of Safe Queue is a QR-Code.  The identity of persons in line is encapsulated in a randomly-generated QR Code by the App,  which is scanned by the business to validate entry.   This code is completely anonymous, which is what consumers expect when shopping. 

Another key element of Safe Queue is Push Notifications.  The employee at the business manages the line using the Safe Queue App, and notifies consumers when they should come in. The system automatically notifies the next few people in line that their time is coming soon.  There is no texting, cell phone numbers or any other personal information used, so this is anonymous.

The last key element of Safe Queue is Voice Alerts.  Consumers get typical notifications with text, but Safe Queue adds brief audio to them.  Instead of a ding, they hear a short message like: "This is Safe Queue, you are next in line".  Consumers do not have to watch their phones continuosly and can do other things while waiting.

### Typical Use Case

A consumer wants to go to Costco for a number of items.  He opens up Safe Queue, sees his Costco has a 'safe queue'. Great, he is far away so can't get in line. He drives to the Costco and when he gets close enough (1000 feet) to the store, his app turns green for Costco. He taps on it (it is large) and he's entered into the line.



