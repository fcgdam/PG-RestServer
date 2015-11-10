// Define and call the packages necessary for the building the REST API.
var sqlite3    = require('sqlite3').verbose();
var db         = new sqlite3.Database('data/phantgraphDB.sqlite');
var express    = require('express');
var app	       = express();
var bodyParser = require('body-parser');
var cors       = require('cors')
var morgan     = require('morgan');

// Initialize the database schema if necessary.
db.serialize(function() {  // All database operations will be executed in series.
    db.run("CREATE TABLE IF NOT EXISTS phantservers (name TEXT, url TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS phantstreams (name TEXT, key TEXT, serverid INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS phantgraphs  (name TEXT, serverid INTEGER, streamid INTEGER, graphorder INTEGER, charttype INTEGER, fields TEXT, options TEXT, graphoptions TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS configurations ( name TEXT , data TEXT)");
    
    db.run("CREATE TABLE IF NOT EXISTS devices ( deviceid TEXT , name TEXT , lastseen TEXT , ssid TEXT, ipaddr TEXT, cfgsn INTEGER, flags INTEGER, data TEXT, datec TEXT )");
    
    // Insert some sane values on the tables...
    db.all("SELECT ROWID , name, url FROM phantservers",
	function( err , row ) {
            if (err) {
               console.log("Error acessing table phantservers... It all crash later!!!");
            } else {
              if ( row.length === 0 )
                  db.run("INSERT INTO phantservers ('name','url') VALUES ('Default Server','http://localhost:8080') ");
            }
        });
    
    db.all("SELECT ROWID , name, data FROM configurations",
	function( err , row ) {
            if (err) {
               console.log("Error acessing table configurations... It all crash later!!!");
            } else {
              if ( row.length === 0 ) {
                  db.run("INSERT INTO configurations ('name','data') VALUES ('dash','{\"refreshp\":\"5000\",\"datapoints\":\"30\",\"maxerror\":\"10\",\"labelinterval\":\"5\",\"refresh\":\"0\",\"errorthrottle\":\"0\"}') ");
                  db.run("INSERT INTO configurations ('name','data') VALUES ('mqtt','') ");
              }
            }           
        });

        // Insert data into the devices table for testing purposes. Otherwise it should be the devices populating the table.
	//var data = new Date();
	//db.run("INSERT INTO devices ('deviceid','name','lastseen','ssid','ipaddr','cfgsn','flags','data','datec') VALUES ('1FBC45DEF4','Room 1 Sensor', '"+data+"','WiFiMain','192.168.34.56',0,0,'{}','"+data+"')");
	//db.run("INSERT INTO devices ('deviceid','name','lastseen','ssid','ipaddr','cfgsn','flags','data','datec') VALUES ('6BDE1FF249','Mailbox', '"+data+"','Lobby','192.168.3.6',0,0,'{}','"+data+"')");
	//db.run("INSERT INTO devices ('deviceid','name','lastseen','ssid','ipaddr','cfgsn','flags','data','datec') VALUES ('AE4F9A3BBC','Basement', '"+data+"','Lobby','192.168.3.5',0,0,'{}','"+data+"')");
});

//Configure Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

var router = express.Router();

// Root URI.
router.get('/', function(req, res) {
	res.json( {message: 'Phant Graphs REST API' });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PhantServers: Add, get and delete PhantServers.
router.route('/phantservers')
	// Create a phant server
	.post(function(req, res) {
		console.log('API: POST phantservers -> ');
		var phantserverName = req.body.name;
		var phantserverURL  = req.body.url;

		db.run("INSERT INTO phantservers ('name','url') VALUES ('" + phantserverName + "', '" + phantserverURL + "');");
		res.json( {status: 'OK', message: 'OK - Data inserted' } );
	})

	//Get all defined Phant Servers
	.get(function(req, res) {
		db.all("SELECT ROWID , name, url FROM phantservers",
			function( err , row ) {
				if (err) {
                                    res.json( { status:'NOK', message: 'ERROR selecting data'} );
                                } else {
                                    console.log('API: GET phantservers -> (' + row.length + ') records -> ' + JSON.stringify(row));
                                    res.json( row );
				}
			}
                );

	});
        
router.route('/phantservers/:id')
        .get(function(req,res) {
            db.get("SELECT ROWID, name, url FROM phantservers WHERE ROWID ="+req.params.id,
                function( err , row ) {
                    if (err) {
                        res.json( { status:'NOK', message: 'ERROR selecting data'} ); 
                    } else {
                        res.json( row );
		    }
		}
            );
        })
        .put(function(req,res) {
		console.log('API: UPDATE phantservers -> ' + req.params.id);
                console.log("UPDATE phantservers SET name='"+req.body.name+"', url='"+req.body.url+"' WHERE ROWID ="+req.params.id);
                db.run("UPDATE phantservers SET name='"+req.body.name+"', url='"+req.body.url+"' WHERE ROWID ="+req.params.id);
                res.json( {status: 'OK', message: 'OK - Data deleted' } );
        })
	.delete(function(req, res) {
		console.log('API: DELETE phantservers -> ' + req.params.id );
                db.run("DELETE FROM phantservers WHERE ROWID=" + req.params.id);
		res.json( {status: 'OK', message: 'OK - Data deleted' } );

	});
        
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// PhantServers: Add, get and delete PhantServers.
router.route('/phantstreams')

	// Create a phant server
	.post(function(req, res) {
		console.log('API: POST phantstreams -> ');
		var phantStreamName = req.body.name;
		var phantStreamKey  = req.body.key;
                var phantServerID   = req.body.serverid;

		db.run("INSERT INTO phantstreams ('name','key', 'serverid') VALUES ('" + phantStreamName + "', '" + phantStreamKey + "', '"+ phantServerID +"');");
		res.json( {status: 'OK', message: 'OK - Data inserted' } );
	})

	//Get all defined Phant Servers
	.get(function(req, res) {
		db.all("SELECT ROWID , name, key, serverid FROM phantstreams",
			function( err , row ) {
				if (err) {
                                    res.json( { status:'NOK', message: 'ERROR selecting data'} );
                                } else {
                                    console.log('API: GET phantstreams -> (' + row.length + ') records -> ' + JSON.stringify(row));
                                    res.json( row );
                                }
			}
                );

	});
        
router.route('/phantstreams/:id')
        .get(function(req,res) {
            db.get("SELECT ROWID, name, url FROM phantstreams WHERE ROWID="+req.params.id,
                function( err , row ) {
                    if (err) {
                        res.json( { status:'NOK', message: 'ERROR selecting data'} ); 
                    } else {
                        res.json( row );
		    }
		}
            );
        })
        .put(function(req,res) {
		console.log('API: UPDATE phantstreams -> ' + req.params.id);
                console.log("UPDATE phantstreams SET name='"+req.body.name+"', key='"+req.body.key+"', serverid='"+req.body.serverid+"' WHERE ROWID ="+req.params.id);
                db.run("UPDATE phantstreams SET name='"+req.body.name+"', key='"+req.body.key+"', serverid='"+req.body.serverid+"' WHERE ROWID ="+req.params.id);
                res.json( {status: 'OK', message: 'OK - Data deleted' } );
        })
	.delete(function(req, res) {

		console.log('API: DELETE phantstream -> ' + req.params.id );
                db.run("DELETE FROM phantstreams WHERE ROWID=" + req.params.id);
		res.json( {status: 'OK', message: 'OK - Data deleted' } );

	});


 ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// PhantGraphs: Add, get and delete Graphs definitions.
router.route('/phantgraphs')

	// Create a phant server
	.post(function(req, res) {
		console.log('API: POST phantgraphs -> ');
		var phantGraphName     = req.body.name;       // This list of variables is here just to show how it's done to get JSON data from the body
		var phantGraphServer   = req.body.serverid;
                var phantGraphStream   = req.body.streamid;
                var phantGraphOrder    = req.body.graphorder;
                var phantGraphChart    = req.body.charttype;
                var phantGraphFields   = req.body.fields;
                var phantGraphOptions  = req.body.options;
                var phantGraphGraphOpt = req.body.graphoptions;

		db.run("INSERT INTO phantgraphs ('name','serverid', 'streamid', 'graphorder', 'charttype', 'fields', 'options', 'graphoptions') VALUES ('" + phantGraphName + "', '" + phantGraphServer + "', '" + phantGraphStream + "', '" + phantGraphOrder + "', '" + phantGraphChart + "', '" + phantGraphFields + "', '" + phantGraphOptions + "', '" + phantGraphGraphOpt + "' );");
   
                res.json( {status: 'OK', message: 'OK - Data inserted' } );
	})

	//Get all defined Phant Servers
	.get(function(req, res) {
                console.log('API: GET ALL phantgraphs -> ');
		db.all("SELECT ROWID , name, serverid, streamid, graphorder, charttype, fields, options, graphoptions FROM phantgraphs",
			function( err , row ) {
				if (err) {
                                    console.log("API: GET phantgraphs -> ERROR!!!!");
                                    res.json( { status:'NOK', message: 'ERROR selecting data'} );
                                } else {
                                    console.log('API: GET phantgraphs -> (' + row.length + ') records -> ' + JSON.stringify(row));
                                    res.json( row );
                                }
			}
                );
	});
        
router.route('/phantgraphs/:id')
        .get(function(req,res) {
            db.get("SELECT ROWID , name, serverid, streamid, graphorder, charttype, fields, options, graphoptions FROM phantgraphs WHERE ROWID="+req.params.id,
                function( err , row ) {
                    if (err) {
                        res.json( { status:'NOK', message: 'ERROR selecting data'} ); 
                    } else {
                        res.json( row );
		    }
		}
            );
        })
        .put(function(req,res) {
		console.log('API: UPDATE phantgraphs -> ' + req.params.id);
                console.log("UPDATE phantgraphs SET name='" +req.body.name+ "', serverid='" +req.body.serverid + "', streamid='" + req.body.streamid + "', graphorder='" + req.body.graphorder + "', charttype='" + req.body.charttype + "', fields='" + req.body.fields + "', options='" + req.body.options + "', graphoptions='" + req.body.graphoptions + "' WHERE ROWID ="+req.params.id);
                
                db.run("UPDATE phantgraphs SET name='" +req.body.name+ "', serverid='" +req.body.serverid + "', streamid='" + req.body.streamid + "', graphorder='" + req.body.graphorder + "', charttype='" + req.body.charttype + "', fields='" + req.body.fields + "', options='" + req.body.options + "', graphoptions='" + req.body.graphoptions + "' WHERE ROWID ="+req.params.id);
                
                res.json( {status: 'OK', message: 'OK - Data deleted' } );
        })
	.delete(function(req, res) {

		console.log('API: DELETE phantgraphs -> ' + req.params.id );
                db.run("DELETE FROM phantgraphs WHERE ROWID=" + req.params.id);
		res.json( {status: 'OK', message: 'OK - Data deleted' } );

	});       
        
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Config: Gets and updates configurations hold in the data field.        
router.route('/config/:id')
        .get(function(req,res) {
            console.log("CONFIG -> Fetching config data for: " + req.params.id);
            db.get("SELECT ROWID , name, data FROM configurations WHERE name='"+req.params.id+"'",
                function( err , row ) {
                    if (err) {
                        res.json( { status:'NOK', message: 'ERROR selecting data'} ); 
                    } else {
                        res.json( row );
		    }
		}
            );
        })
        .put(function(req,res) {
		console.log("CONFIG -> Saving config data for: " + req.params.id );
                
                db.run("UPDATE configurations SET data='" + req.body.data + "' WHERE name ='" + req.params.id+"'");
                
                res.json( {status: 'OK', message: 'OK - Data deleted' } );
        })        
        

/////////////////////////////////////////////////////////////////////////////////////
// REST services for device provisioning

router.route('/devices')
        // Get all devices.
	.get ( function(req, res) {
		console.log("Devices list");
		db.all("SELECT ROWID, deviceid, name, lastseen, ssid, ipaddr, cfgsn, flags, data, datec  FROM devices",
			function( err , row ) {
				if (err) {
                                    console.log("API: GET phantgraphs -> ERROR!!!!");
                                    res.json( { status:'NOK', message: 'ERROR selecting data'} );
                                } else {
                                    console.log('API: GET devices -> (' + row.length + ') records -> ' + JSON.stringify(row));
                                    res.json( row );
                                }
			}
                );
	})
        
router.route('/devices/:id')
	.get( function(req, res) {
		console.log("DEVICES -> GET request received: " + req.params.id);
                // Update the lastseen field.
		var currdate = new Date();
		db.run("UPDATE devices SET lastseen='" + currdate + "' WHERE deviceid='" + req.params.id + "'");

		db.get("SELECT cfgsn, data FROM devices WHERE deviceid='"+req.params.id+"'",
                        function( err , row ) {
                                if (err) {    
                                        console.log("Error acessing table devices!!");
                                        res.json( {status: 'NOK', message: 'Device get information failed' } );
                                } else {
                                        if ( (typeof row == 'undefined') ) { 
                                            res.json( {status: 'NOK', message: 'Device NOT Registered' } );
					} else {
                                            res.json( row );
					}
				}
			});
	})	
	.put( function(req, res) {
		console.log("DEVICES -> UPDATE request received: " + req.params.id);
		db.run("UPDATE devices SET name='"+req.body.name+"', cfgsn="+req.body.cfgsn.toString()+", data='"+req.body.data+"' WHERE deviceid='"+req.params.id+"'");  
                res.json( {status: 'OK', message: 'Device Updated' } );
	})	
	.post( function(req, res) {
		console.log("DEVICES -> POST Device request received: " + req.params.id);
		console.log("Body: " + JSON.stringify(req.body) );
		console.log("IP address: " + req.body.ipaddr );
		console.log("SSID: " + req.body.ssid );

		db.get("SELECT ROWID , deviceid, name, lastseen, ssid, ipaddr, cfgsn, flags, data, datec FROM devices WHERE deviceid='"+req.params.id+"'",
        		function( err , row ) {
            			if (err) {
               				console.log("Error acessing table devices!!");
                			res.json( {status: 'NOK', message: 'Device Registration failed' } );
            			} else {
              				if ( (typeof row == 'undefined') ) {	// Device is new... if row is undefined (no results)
						var deviceid  = req.params.id;
						var name      = req.params.id;
						var lastseen  = new Date();
						var ssid      = req.body.ssid;
						var ipaddr    = req.body.ipaddr;
						var cfgsn     = "1";
						var flags     = "0";
						var data      = "";
						var datec     = lastseen;
                  				//console.log("INSERT INTO devices ('deviceid','name','lastseen','ssid','ipaddr','cfgsn','flags','data','datec') VALUES ('" + deviceid + "', '" + name + "', '" + lastseen + "', '" + ssid + "', '" + ipaddr + "', " + cfgsn + ", " + flags + ", '" + data + "', '" + datec + "')");
                  				db.run("INSERT INTO devices ('deviceid','name','lastseen','ssid','ipaddr','cfgsn','flags','data','datec') VALUES ('" + deviceid + "', '" + name + "', '" + lastseen + "', '" + ssid + "', '" + ipaddr + "', " + cfgsn + ", " + flags + ", '" + data + "', '" + datec + "')");
						res.json( {status: 'OK', message: 'Device Registed' } );
					} else {
						console.log("Device is already registered.");
						console.log("Returning JSON configuration data..." + JSON.stringify(row) );
						
						// Update the lastseen time.
						var currdate = new Date();
						db.run("UPDATE devices SET lastseen='" + currdate + "' WHERE deviceid='" + req.params.id + "'");

						res.json( row );
					}
            		}
        	});
	})	
        
        
// Our base url is /api
app.use('/api', router);
app.listen(3000);

var datenow = new Date();
console.log("========================================");
console.log("Server started at " + datenow );
console.log("Api endpoint available at http://localhost:3000/api");

