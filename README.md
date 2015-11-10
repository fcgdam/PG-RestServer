# PG-RestServer
REST Server for Phant Graphs application and IoT device provisioning

This code implements a REST API for the application Phant-Graphs, 
used to graph data from streams stored in Phant (Sparkfun) servers.

It also implements a simple REST API for IoT device provisioning.

The underling support database is SQLITE, which means that no server or other configurations
are needed.

Please note, that the first commit the code is still in Alpha stages,
missing important things like proper logging, referential integrity, modularization,
and contains most certain unknow and deadly bugs...

# How to use
Just clone the repository, and at the root execute **npm install** to install modules dependencies.

Edit: It seems that the latest npm sqlite3 module is now fine, and the above command: npm install
will install the module without issues. 
If it fails use the following instructions:

To install node-sqlite3 execute the following command: 
**npm install https://github.com/mapbox/node-sqlite3/tarball/master**

To run, use the following command at the root directory of the application: **node restserver.js**

# To test
Use Firefox plugin HTTPRequester.

#API available

The API is available at the URL  http://localhost:3000/api

* http://localhost:3000/api/phantservers -> Manages Phant servers configuration
* http://localhost:3000/api/phantstreams -> Manages Phant data streams
* http://localhost:3000/api/phantgraphs  -> Manages Phant graphs types
* http://localhost:3000/api/config       -> Configuration data for the front end application

And for device provisioning:

http://localhost:3000/api/devices
