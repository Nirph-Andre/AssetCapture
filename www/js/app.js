
var Session = {};
var PhotoSession = {};

var PhotoRequirement = {
    'RESERVOIR': true,
    'WATER TANK': true,
    'PUMP': true,
    'MOTOR': true,
    'PURIFICATION WORKS': true,
    'OXIDATION DAM': true,
    'DAM': true
};

var App = {

    // Status data
    authData: {},
    location: 'Device',
    state: 'Initializing',
    stateDescription: 'Initializing',
    connectionStact: {},
    online: true,
    firstRun: false,
    authenticated: false,
    itemPhotoRequired: false,
    damagePhotoRequired: false,
    awaitGps: [],
    photosSynched: 0,
    photosToSynch: [],


    // Application Constructor
    initialize: function() {
      //Notify.notifyStatic();
      $('.page').hide();
      $('#pageLogin').show();
      App.bindEvents();
      this.setState('Processing', 'Initializing Application');
      Data.initialize();
    },


    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      App.online = (navigator.connection.type == Connection.NONE) ? false : true;
      $(document).bind('offline', App.nowOffline);
      $(document).bind('online', App.nowOnline);
      $(document).bind('backbutton', Interface.back);
    },


    // Connectivity handling
    nowOffline: function() {
      App.online = false;
    },
    nowOnline: function() {
      App.online = true;
      for (var id in App.connectionStact) {
        App.connectionStact[id]();
      }
      App.connectionStact = {};
    },


    // Application status
    setState: function(state, description, evtClass) {
      App.state = state ? state : 'Ready';
      App.stateDescription = description ? description : 'Ready';
      var evtClass = 'processing';
      switch (App.state) {
        case 'Ready': evtClass = 'ready'; break;
        case 'Error': evtClass = 'problem'; break;
      }
      Util.setEventInfo('initEvent', App.state, evtClass);
    },


    // Status handling
    newDevice: function() {
      App.firstRun = true;
    },
    dbReady: function() {
      Notify.hideStatic();
      App.setState();
    },
    dbFail: function(message) {
      Notify.notifyStatic('Fatal database error, application cannot proceed.');
      App.setState('Database Error', message, 'problem');
      if (message) {
        Notify.alert('Database Error', message);
      }
      return true;
    },
    configReady: function() {
      if (Config.data.location) {
        $('.location').html(Config.data.location);
      }
    },
    configFail: function() {
      Notify.notifyStatic('Could not load configuration data, application cannot proceed.');
      App.setState('Configuration Error', 'Could not load configuration data.', 'problem');
      return true;
    },
    uploadPhoto: function (imageURI) {
    },
    synchNextPhoto: function() {
    	if (!App.photosToSynch[App.photosSynched]) {
    		App.synchComplete();
    		return;
    	}
    	var photoId = App.photosToSynch[App.photosSynched];
    	Notify.notifyStatic('Synchronizing photo ' + (App.photosSynched + 1) + ' of ' + App.photosToSynch.length);
    	Data.view(Table.Photo, photoId, {}, function(data) {
            if (data.id) {
            	Data.view(Table.Asset, data.asset_id, {}, function(asset) {
            		data.asset_id = asset.sid;
            		var imageURI = data.data;

                    var params = {};
                    params.asset_id = asset.sid;
                    params.type = data.type;

                	var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
                    options.mimeType = "image/jpeg";
                    options.params = params;

                    var ft = new FileTransfer();
                    ft.upload(imageURI, encodeURI(Config.serviceNode + 'data/upload'), function (r) {
                    	Data.remove(Table.Photo, photoId, true);
                    	App.photosSynched++;
                    	App.synchNextPhoto();
                    }, function (error) {
                    	Notify.alert('Photo upload error', JSON.stringify(error));
                    	App.synchComplete();
                    }, options);
            	});
            } else {
            	App.synchComplete();
            }
          });
    },
    synchPhotos: function() {
    	Notify.notifyStatic('Synchronizing photos.');
    	Data.query('SELECT id FROM photo', function(tx, result) {
    		if (result && result.rows && result.rows.length) {
    			App.photosSynched = 0;
    			App.photosToSynch = [];
    			for (var i = 0; i < result.rows.length; i++) {
    				var item = Data.stripRecordSlashes(result.rows.item(i));
    				App.photosToSynch.push(item.id);
    			}
    			App.synchNextPhoto();
    		} else {
				App.synchComplete();
				return;
    		}
          }, function(err) {
            // Oops, something went wrong
            Notify.alert('Photo synch query oops', 'Data.queryError: ' + err.message);
            return true;
          });
    },
    synchComplete: function() {
      Notify.hideStatic();
      App.setState();
      Data.list(Table.Location, {}, function(data) {
        Util.populateSelect('locationSelect', 'Select Location', data, Config.data.location);
      });
      if (App.firstRun) {
        Interface.loadPage('Home');
        App.firstRun = false;
      }
    },
    synchFail: function(message) {
      if (typeof message == 'undefined') {
        App.connectionRequired('synch', Data.refreshAppMeta);
      } else {
        Notify.notifyStatic('Synchronization Error', message);
        App.setState('Synchronization Error', message, 'problem');
      }
      return true;
    },
    connectionRequired: function(id, callback) {
      App.connectionStact[id] = callback;
      Notify.notifyStatic('Connection required for application to proceed.');
      Notify.alert('Connection Error', 'Please connect to internet to proceed.');
      App.setState('Connection Required', 'Please connect to internet to proceed', 'processing');
      return true;
    },


    // ****************************** AUTHENTICATION ********************************* //
    // Authentication
    login: function (username, password) {
      App.authData = {"username": username, "password": password};
      Server.post('authentication/login', App.authData, function (jsonResult) {
        if ('Error' == jsonResult.Status) {
          Notify.alert('Oops', jsonResult.Message);
        } else if ('Success' == jsonResult.Status) {
          App.authenticated = true;
          if (App.firstRun) {
            Data.refreshAppMeta();
          } else {
            Interface.loadPage('Home');
          }
        }
      }, function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
        //Notify.alert('Oops', 'Could not reach the server. Please ensure you are connected to the internet and try again.');
      });
    },


    // ****************************** GLOBAL ********************************* //
    // Primary app logic
    pageLoaded: function(page) {
      switch(page) {
      case 'Location':
        if ('Unknown' == Config.data.location) {
          Interface.listFromTable(Table.Location, {}, 'name', App.setLocation, false, 'Select Location');
        }
        break;
      case 'CaptureMain':
        $('#contextNav').show();
        break;
      }
    },
    pageClosed: function(page) {

    },
    startCapture: function() {
      Interface.loadPage('Location');
    },
    endCapture: function() {
      $('#contextNav').hide();
      Interface.loadPage('Home');
    },
    setDefaultGps: function(lat, long, accuracy) {
      if (accuracy === false) {
        Config.setDataItem('default_haveGps', 0);
        $('#actMoveMain').prop('disabled', true);
        App.setState('Awaiting GPS', 'Waiting for GPS coordinates before proceeding.', 'problem');
      } else {
        Config.setDataItem('default_haveGps', 1);
        Config.setDataItem('default_lat', lat);
        Config.setDataItem('default_long', long);
        Config.setDataItem('default_accuracy', accuracy);
        $('#actMoveMain').prop('disabled', false);
        App.setState();
      }
    },
    setGps: function(lat, long, accuracy) {
      if (accuracy === false) {
        Config.setDataItem('haveGps', 0);
      } else {
        Config.setDataItem('haveGps', 1);
        Config.setDataItem('lat', lat);
        Config.setDataItem('long', long);
        Config.setDataItem('accuracy', accuracy);
        for (var i in App.awaitGps) {
          App.awaitGps[i](lat, long, accuracy);
        }
        App.awaitGps = [];
      }
    },


    // ****************************** CONTEXT INFORMATION ********************************* //
    setLocation: function(id, name) {
      Config.setDataItem('location_id', id);
      Config.setDataItem('location', name);
      Config.setDataItem('town_id', 0);
      Config.setDataItem('town', '');
      Config.setDataItem('street_id', 0);
      Config.setDataItem('street', '');
      Config.setDataItem('owner_id', 0);
      Config.setDataItem('department_id', 0);
      Config.setDataItem('building_id', 0);
      Config.setDataItem('building', '');
      Config.setDataItem('floor_id', 0);
      Config.setDataItem('floor', '');
      Config.setDataItem('room_id', 0);
      Config.setDataItem('room', '');
      Config.setDataItem('default_haveGps', 0);
      $('.location').html(Config.data.location);
      $('#actLocation').html(Config.data.location);
      $('#actTown').html('Select Town');
      $('#actStreet').html('Select Street');
      $('#actOwner').html('Select Owner');
      $('#actDepartment').html('Select Department');
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actTown').prop('disabled', false);
      $('#actStreet').prop('disabled', true);
      $('#actOwner').prop('disabled', true);
      $('#actDepartment').prop('disabled', true);
      $('#actBuilding').prop('disabled', true);
      $('#actFloor').prop('disabled', true);
      $('#actFloorNA').prop('disabled', true);
      $('#actRoom').prop('disabled', true);
      $('#actRoomNA').prop('disabled', true);
      $('#actMoveMain').prop('disabled', true);
      Interface.listFromTable(Table.Town, {'location_id': id}, 'name', App.setTown, true, 'Select Town');
    },
    setTown: function(id, name) {
      Config.setDataItem('town_id', id);
      Config.setDataItem('town', name);
      Config.setDataItem('street_id', 0);
      Config.setDataItem('street', '');
      Config.setDataItem('owner_id', 0);
      Config.setDataItem('department_id', 0);
      Config.setDataItem('building_id', 0);
      Config.setDataItem('building', '');
      Config.setDataItem('floor_id', 0);
      Config.setDataItem('floor', '');
      Config.setDataItem('room_id', 0);
      Config.setDataItem('room', '');
      Config.setDataItem('default_haveGps', 0);
      $('#actTown').html(Config.data.town);
      $('#actStreet').html('Select Street');
      $('#actOwner').html('Select Owner');
      $('#actDepartment').html('Select Department');
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actStreet').prop('disabled', false);
      $('#actOwner').prop('disabled', false);
      $('#actDepartment').prop('disabled', true);
      $('#actBuilding').prop('disabled', true);
      $('#actFloor').prop('disabled', true);
      $('#actFloorNA').prop('disabled', true);
      $('#actRoom').prop('disabled', true);
      $('#actRoomNA').prop('disabled', true);
      $('#actMoveMain').prop('disabled', true);
      Interface.listFromTable(Table.Street, {'town_id': id}, 'name', App.setStreet, true, 'Select Street');
    },
    setStreet: function(id, name) {
      Config.setDataItem('street_id', id);
      Config.setDataItem('street', name);
      Config.setDataItem('owner_id', 0);
      Config.setDataItem('department_id', 0);
      Config.setDataItem('building_id', 0);
      Config.setDataItem('building', '');
      Config.setDataItem('floor_id', 0);
      Config.setDataItem('floor', '');
      Config.setDataItem('room_id', 0);
      Config.setDataItem('room', '');
      Config.setDataItem('default_haveGps', 0);
      $('#actStreet').html(Config.data.street);
      $('#actOwner').html('Select Owner');
      $('#actDepartment').html('Select Department');
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actOwner').prop('disabled', false);
      $('#actDepartment').prop('disabled', true);
      $('#actBuilding').prop('disabled', false);
      $('#actFloor').prop('disabled', true);
      $('#actFloorNA').prop('disabled', true);
      $('#actRoom').prop('disabled', true);
      $('#actRoomNA').prop('disabled', true);
      $('#actMoveMain').prop('disabled', true);
    },
    setOwner: function(id, name) {
        Config.setDataItem('owner_id', id);
        Config.setDataItem('department_id', 0);
        $('#actOwner').html(name);
        $('#actDepartment').html('Select Department');
        $('#actDepartment').prop('disabled', false);
        $('#actMoveMain').prop('disabled', true);
      },
    setDepartment: function(id, name) {
      Config.setDataItem('department_id', id);
      $('#actDepartment').html(name);
      $('#actMoveMain').prop('disabled', false);
    },
    setBuilding: function(id, name) {
      Config.setDataItem('building_id', id);
      Config.setDataItem('building', name);
      Config.setDataItem('floor_id', 0);
      Config.setDataItem('floor', '');
      Config.setDataItem('room_id', 0);
      Config.setDataItem('room', '');
      $('#actBuilding').html(Config.data.building);
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actFloor').prop('disabled', false);
      $('#actFloorNA').prop('disabled', false);
      $('#actRoom').prop('disabled', true);
      $('#actRoomNA').prop('disabled', true);
    },
    setFloor: function(name) {
      var context = {
          'building_id': Config.data.building_id,
          'name': name
          };
      Data.view(Table.Floor, null, context, function(xdata) {
        if (!xdata.id) {
          Data.save(Table.Floor, null, context, function(data) {
            Config.setDataItem('floor_id', data.id);
            Config.setDataItem('floor', data.name);
            $('#actFloor').html(Config.data.floor);
          });
        } else {
          Config.setDataItem('floor_id', xdata.id);
          Config.setDataItem('floor', xdata.name);
          $('#actFloor').html(Config.data.floor);
        }
        Config.setDataItem('room_id', 0);
        Config.setDataItem('room', '');
        $('#actRoom').html('Scan Room Barcode');
        $('#actRoom').prop('disabled', false);
        $('#actRoomNA').prop('disabled', false);
      });
    },
    setRoom: function(name) {
      var context = {
          'floor_id': Config.data.floor_id,
          'name': name
          };
      Data.view(Table.Room, null, context, function(xdata) {
        if (!xdata.id) {
          Data.save(Table.Room, null, context, function(data) {
            Config.setDataItem('room_id', data.id);
            Config.setDataItem('room', data.name);
            $('#actRoom').html(Config.data.room);
          });
        } else {
          Config.setDataItem('room_id', xdata.id);
          Config.setDataItem('room', xdata.name);
          $('#actRoom').html(Config.data.room);
        }
      });
    },


    // ****************************** ASSET UTILS ********************************* //
    evalAsset: function() {
      // Check if we have all the required fields
      if (0 == Session.asset_type_id
          || 0 == Session.asset_sub_type_id
          || 0 == Session.asset_description_id
          || 0 == Session.condition_id
          || (App.itemPhotoRequired && !PhotoSession.haveItemPhoto)
          || (App.damagePhotoRequired && !PhotoSession.haveDamagePhoto)
          ) {
        $('#actSaveAsset').prop('disabled', true);
      } else {
        $('#actSaveAsset').prop('disabled', false);
      }
    },
    resetAsset: function() {
      $('#actScanAsset').html('Scan Item Barcode');
      Session = {};
      PhotoSession = {};
      PhotoSession.haveItemPhoto = false;
      PhotoSession.haveDamagePhoto = false;
      $('#itemPhoto').attr('src', '');
      $('#actItemPic').hide();
      $('#damagePhoto').attr('src', '');
      $('#actDamagePic').hide();
      App.itemPhotoRequired = false;
      App.damagePhotoRequired = false;
      Session.id = null;
      $('#actAssetType').html('Select Asset Type');
      Session.asset_type_id = 0;
      $('#actAssetType').prop('disabled', true);
      $('#actAssetSubType').html('Select Asset Sub Type');
      Session.asset_sub_type_id = 0;
      $('#actAssetSubType').prop('disabled', true);
      $('#actAssetDescription').html('Select Asset Description');
      Session.asset_description_id = 0;
      $('#actAssetDescription').prop('disabled', true);
      $('#actAssetSubDescription').html('Select Asset Sub Description');
      Session.asset_sub_description_id = null;
      $('#inpDetails').val('');
      Session.details = '';
      $('#actAssetSubDescription').prop('disabled', true);
      $('#actMaterial').html('Select Material');
      Session.material_id = null;
      $('#actMaterial').hide();
      $('#actPoleLength').html('Select Pole Length');
      Session.pole_length_id = null;
      $('#actPoleLength').hide();
      $('#actLightType').html('Select Light Type');
      Session.street_light_type_id = null;
      $('#actLightType').hide();
      $('#actCondition').html('Select Condition');
      Session.condition_id = 0;
      Session.gps_lat = '';
      Session.gps_long = '';
      Session.gps_relative = null;
      $('#actFlagDuplicate').hide();
    },


    // ****************************** ASSET INFORMATION ********************************* //
    getItemPhoto: function() {
      Camera.takePhoto(60, function(imageURI) {
        $('#itemPhoto').attr('src', imageURI);
        PhotoSession.item = imageURI;
        PhotoSession.haveItemPhoto = true;
        App.evalAsset();
      });
    },
    getDamagePhoto: function() {
      Camera.takePhoto(60, function(imageURI) {
        $('#damagePhoto').attr('src', imageURI);
        PhotoSession.damage = imageURI;
        PhotoSession.haveDamagePhoto = true;
        App.evalAsset();
      });
    },
    scanAsset: function() {
      App.resetAsset();
      if (0 == Config.data.default_haveGps) {
        Location.getPosition(App.setGps);
      }
      Barcode.scan(App.setItemIdentifier);
    },
    setItemIdentifier: function(identifier) {
      Config.setDataItem('identifier', identifier);
      $('#actScanAsset').html(identifier);
      //Notify.notifyStatic('Searching for existing item.', true);
      Data.list(Table.Asset, {'identifier': identifier, 'archived': 0}, function(data) {
        //Notify.hideStatic();
        if (!data.length) {
          // Item not found, capturing new item
          Notify.alert('Notice', 'Asset not found on database, capturing new asset.');
          App.newAsset(identifier);
        } else if (data.length > 1) {
          Notify.alert('Notice', 'Multiple assets found, acquiring list.');
          var stmnt = 'SELECT `a`.`id`, `ad`.`name` AS asset, `l`.`name` AS location '
            + ' FROM asset a '
            + ' JOIN asset_description ad ON `ad`.`id`=`a`.`asset_description_id` '
            + ' JOIN location l ON `l`.`id`=`a`.`location_id` '
            + ' WHERE `a`.`identifier`=' + "'" + Data.addSlashes(identifier) + "' "
            + ' AND `a`.`archived`=0';

          try {
            Data.query(stmnt, function(tx, result) {
              // Do we have data?
              if (result.rows.length) {
                var listData = [];
                var len = result.rows.length;
                for (var i = 0; i < len; i++) {
                  var item = result.rows.item(i);
                  var label = item.asset + ', ' + item.location;
                  listData.push({"value": item.id, "label": label});
                }
                listData.push({"value": 0, "label": 'New Asset'});
                Interface.allowNew = false;
                Interface.listFromData(listData, App.setAsset, 'Select Correct Asset');
              } else {
                // No entry found
                Notify.alert('Oops', 'Expected multiple asset entries, found none.');
              }
            }, function(err) {
              // Oops, something went wrong
              Notify.hideStatic();
              Notify.alert('Oops', 'App.setItemIdentifier: ' + err.message);
              return true;
            });
          } catch(err) {
            Notify.alert('Oops', 'App.setItemIdentifier.catch: ' + err.message);
          }
        } else {
          App.setAsset(data[0].id);
        }
      });
    },
    setAsset: function(id) {
      if (0 == id) {
        App.newAsset(Config.data.identifier);
        return;
      }
      Data.view(Table.Asset, id, {}, function(data) {
        if (data.id) {
          // Found entry, populate fields with relevant data.
          App.resetAsset();
          Notify.alert('Notice', 'Found existing item, if this is not the correct asset select Flag As Duplicate button.');
          $('#actScanAsset').html(Config.data.identifier);
          Session = {};
          Session.id = id;
          Session.gps_lat      = data.gps_lat;
          Session.gps_long     = data.gps_long;
          Session.gps_relative = data.gps_relative;
          Session.gps_accuracy = data.gps_accuracy;
          Data.view(Table.AssetType, data.asset_type_id, {}, function(data) {
            if (data.id) {
              $('#actAssetType').html(data.name);
              Session.asset_type_id = data.asset_type_id;
              $('#actAssetType').prop('disabled', false);
            }
          });
          Data.view(Table.AssetSubType, data.asset_sub_type_id, {}, function(data) {
            if (data.id) {
              Config.setDataItem('asset_sub_type', data.name);
              $('#actAssetSubType').html(data.name);
              Session.asset_sub_type_id = data.asset_sub_type_id;
              $('#actAssetSubType').prop('disabled', false);
            }
          });
          Data.view(Table.AssetDescription, data.asset_description_id, {}, function(data) {
            if (data.id) {
              Config.setDataItem('asset_description', data.name);
              $('#actAssetDescription').html(data.name);
              Session.asset_description_id = data.asset_description_id;
              $('#actAssetDescription').prop('disabled', false);
            }
          });
          if (data.asset_sub_description_id) {
            Data.view(Table.AssetSubDescription, data.asset_sub_description_id, {}, function(data) {
              if (data.id) {
                $('#actAssetSubDescription').html(data.name);
                Session.asset_sub_description_id = data.asset_sub_description_id;
                $('#actAssetSubDescription').prop('disabled', false);
              }
            });
          }
          $('#inpDetails').val(data.details);
          Session.details = data.details;
          if (data.material_id) {
            Data.view(Table.Material, data.material_id, {}, function(data) {
              if (data.id) {
                $('#actMaterial').html(data.name);
                Session.material_id = data.material_id;
              }
            });
          }
          if (data.pole_length_id) {
            Data.view(Table.PoleLength, data.pole_length_id, {}, function(data) {
              if (data.id) {
                $('#actPoleLength').html(data.name);
                Session.pole_length_id = data.pole_length_id;
              }
            });
          }
          if (data.street_light_type_id) {
            Data.view(Table.StreetLightType, data.street_light_type_id, {}, function(data) {
              if (data.id) {
                $('#actLightType').html(data.name);
                Session.street_light_type_id = data.street_light_type_id;
              }
            });
          }
          if (data.condition_id) {
            Data.view(Table.Condition, data.condition_id, {}, function(data) {
              if (data.id) {
                $('#actCondition').html(data.name);
                Session.condition_id = data.condition_id;
                Session.previous_condition_id = data.condition_id;
              }
            });
          }
          if ('ELECTRICITY' == Config.data.asset_sub_type
              && ('POLE NO LIGHT' == Config.data.asset_description
                  || 'STREET LIGHT' == Config.data.asset_description)) {
            $('#actMaterial').show();
            $('#actPoleLength').show();
            $('#actLightType').show();
          }
          $('#actFlagDuplicate').show();
          App.evalAsset();

          // Check for location conflict.
	      Session.previous_town_id     = data.town_id;
	      Session.previous_street_id   = data.street_id;
	      Session.previous_building_id = data.building_id;
	      Session.previous_floor_id    = data.floor_id;
	      Session.previous_room_id     = data.room_id;
	      if (data.town_id != Config.data.town_id
	    		  || data.street_id != Config.data.street_id
	    		  || data.building_id != Config.data.building_id
	    		  || data.previous_floor_id != Config.data.previous_floor_id
	    		  || data.room_id != Config.data.room_id) {
	    	  // We have a location difference.
	    	  App.locationItems = 0;
	    	  App.prevLocation = {};
	    	  if (data.town_id) {
		    	  Data.view(Table.Town, data.town_id, {}, function(data) {
	                	App.prevLocation.town = data.name;
		                App.locationItems++;
		                if (5 == App.locationItems) {
		                	App.locationDiff();
		                }
		              });
	    	  } else {
	    		  App.prevLocation.town = '';
	    		  App.locationItems++;
	              if (5 == App.locationItems) {
	            	  App.locationDiff();
	              }
	    	  }
	    	  if (data.street_id) {
		    	  Data.view(Table.Street, data.street_id, {}, function(data) {
	                	App.prevLocation.street = data.name;
		                App.locationItems++;
		                if (5 == App.locationItems) {
		                	App.locationDiff();
		                }
		              });
	    	  } else {
	    		  App.prevLocation.street = '';
	    		  App.locationItems++;
	              if (5 == App.locationItems) {
	            	  App.locationDiff();
	              }
	    	  }
	    	  if (data.building_id) {
		    	  Data.view(Table.Building, data.building_id, {}, function(data) {
	                	App.prevLocation.building = data.name;
		                App.locationItems++;
		                if (5 == App.locationItems) {
		                	App.locationDiff();
		                }
		              });
	    	  } else {
	    		  App.prevLocation.building = '';
	    		  App.locationItems++;
	              if (5 == App.locationItems) {
	            	  App.locationDiff();
	              }
	    	  }
	    	  if (data.floor_id) {
		    	  Data.view(Table.Floor, data.floor_id, {}, function(data) {
	                	App.prevLocation.floor = data.name;
		                App.locationItems++;
		                if (5 == App.locationItems) {
		                	App.locationDiff();
		                }
		              });
	    	  } else {
	    		  App.prevLocation.floor = '';
	    		  App.locationItems++;
	              if (5 == App.locationItems) {
	            	  App.locationDiff();
	              }
	    	  }
	    	  if (data.room_id) {
		    	  Data.view(Table.Room, data.room_id, {}, function(data) {
	                	App.prevLocation.room = data.name;
		                App.locationItems++;
		                if (5 == App.locationItems) {
		                	App.locationDiff();
		                }
		              });
	    	  } else {
	    		  App.prevLocation.room = '';
	    		  App.locationItems++;
	              if (5 == App.locationItems) {
	            	  App.locationDiff();
	              }
	    	  }
	      }
        } else {
          // Did not find entry, create new asset
          App.newAsset(Config.data.identifier);
        }
      });
    },
    locationDiff: function () {
    	alert('Liocation Diff');
    	var listData = [];
    	var currLocation = Config.data.town
						+ ('' != Config.data.street ? ', ' + Config.data.street + '<br/>' : '')
						+ ('' != Config.data.building ? ', ' + Config.data.building : '')
						+ ('' != Config.data.floor ? ', ' + Config.data.floor : '')
						+ ('' != Config.data.room ? ', ' + Config.data.room : '');
    	var prevLocation = App.prevLocation.town
				    	+ ('' != App.prevLocation.street ? ', ' + App.prevLocation.street + '<br/>' : '')
				    	+ ('' != App.prevLocation.building ? ', ' + App.prevLocation.building : '')
				    	+ ('' != App.prevLocation.floor ? ', ' + App.prevLocation.floor : '')
				    	+ ('' != App.prevLocation.room ? ', ' + App.prevLocation.room : '');
    	listData.push({"value": 0, "label": currLocation});
    	listData.push({"value": 1, "label": prevLocation});
    	App.prevLocation = {};
        Interface.allowNew = false;
        Interface.listFromData(listData, App.resolveLocation, 'Select Correct Location');
    },
    resolveLocation: function(id) {
      if (1 == id) {
	      Session.town_id     = Session.previous_town_id
	      Session.street_id   = Session.previous_street_id;
	      Session.building_id = Session.previous_building_id;
	      Session.floor_id    = Session.previous_floor_id;
	      Session.room_id     = Session.previous_room_id;
	  }
    },
    newAsset: function(identifier) {
      // Clear out all fields
      App.resetAsset();
      $('#actFlagDuplicate').hide();
      $('#actScanAsset').html(identifier);
      $('#actAssetType').prop('disabled', false);
    },
    setAssetType: function(id, name) {
      Session.asset_type_id = id;
      Session.asset_sub_type_id = 0;
      Session.asset_description_id = 0;
      Session.asset_sub_description_id = null;
      Session.material_id = null;
      Session.pole_length_id = null;
      Session.street_light_type_id = null;
      Session.condition_id = 0;
      $('#inpDetails').val('');
      Session.details = '';
      $('#actAssetType').html(name);
      $('#actAssetSubType').html('Select Asset Sub Type');
      $('#actAssetDescription').html('Select Asset Description');
      $('#actAssetSubDescription').html('Select Asset Sub Description');
      $('#actMaterial').html('Select Material');
      $('#actPoleLength').html('Select Pole Length');
      $('#actLightType').html('Select Light Type');
      $('#actCondition').html('Select Condition');
      $('#actAssetSubType').prop('disabled', false);
      $('#actAssetDescription').prop('disabled', true);
      $('#actAssetSubDescription').prop('disabled', true);
      $('#actMaterial').hide();
      $('#actPoleLength').hide();
      $('#actLightType').hide();
      Interface.listFromTable(Table.AssetSubType, {'asset_type_id': Session.asset_type_id}, 'name', App.setAssetSubType, false, 'Select Asset Sub Type');
      App.evalAsset();
    },
    setAssetSubType: function(id, name) {
      Config.setDataItem('asset_sub_type', name);
      Session.asset_sub_type_id = id;
      Session.asset_description_id = 0;
      Session.asset_sub_description_id = null;
      Session.material_id = null;
      Session.pole_length_id = null;
      Session.street_light_type_id = null;
      Session.condition_id = 0;
      $('#inpDetails').val('');
      Session.details = '';
      $('#actAssetSubType').html(name);
      $('#actAssetDescription').html('Select Asset Description');
      $('#actAssetSubDescription').html('Select Asset Sub Description');
      $('#actMaterial').html('Select Material');
      $('#actPoleLength').html('Select Pole Length');
      $('#actLightType').html('Select Light Type');
      $('#actCondition').html('Select Condition');
      $('#actAssetDescription').prop('disabled', false);
      $('#actAssetSubDescription').prop('disabled', true);
      $('#actMaterial').hide();
      $('#actPoleLength').hide();
      $('#actLightType').hide();
      Interface.listFromTable(Table.AssetDescription, {'asset_sub_type_id': Session.asset_sub_type_id}, 'name', App.setAssetDescription, false, 'Select Asset Description');
      App.evalAsset();
    },
    setAssetDescription: function(id, name) {
      Session.asset_description_id = id;
      Session.asset_sub_description_id = null;
      Session.material_id = null;
      Session.pole_length_id = null;
      Session.street_light_type_id = null;
      Session.condition_id = 0;
      $('#inpDetails').val('');
      Session.details = '';
      $('#actAssetDescription').html(name);
      $('#actAssetSubDescription').html('Select Asset Sub Description');
      $('#actMaterial').html('Select Material');
      $('#actPoleLength').html('Select Pole Length');
      $('#actLightType').html('Select Light Type');
      $('#actCondition').html('Select Condition');
      $('#actAssetSubDescription').prop('disabled', false);
      if ('ELECTRICITY' == Config.data.asset_sub_type
          && ('POLE NO LIGHT' == name
              || 'STREET LIGHT' == name)) {
        $('#actMaterial').show();
        $('#actPoleLength').show();
        $('#actLightType').show();
      }
      $('#itemPhoto').attr('src', '');
      if (PhotoRequirement[name]) {
        App.itemPhotoRequired = true;
        $('#actItemPic').show();
      } else {
        App.itemPhotoRequired = false;
        $('#actItemPic').hide();
      }
      App.evalAsset();
    },
    setDetails: function(htmlId, $value) {
      Session.details = '';
    },
    setAssetSubDescription: function(id, name) {
      Session.asset_sub_description_id = id;
      $('#actAssetSubDescription').html(name);
      App.evalAsset();
    },
    setMaterial: function(id, name) {
      $("html, body").animate({ scrollTop: $("#actMaterial").scrollTop() }, 1000);
      Session.material_id = id;
      $('#actMaterial').html(name);
      App.evalAsset();
    },
    setPoleLength: function(id, name) {
      $("html, body").animate({ scrollTop: $("#actPoleLength").scrollTop() }, 1000);
      Session.pole_length_id = id;
      $('#actPoleLength').html(name);
      App.evalAsset();
    },
    setLightType: function(id, name) {
      $("html, body").animate({ scrollTop: $("#actLightType").scrollTop() }, 1000);
      Session.street_light_type_id = id;
      $('#actLightType').html(name);
      App.evalAsset();
    },
    setCondition: function(id, name) {
      $("html, body").animate({ scrollTop: $("#actCondition").scrollTop() }, 1000);
      Session.condition_id = id;
      $('#actCondition').html(name);
      $('#damagePhoto').attr('src', '');
      if ('POOR' == name || 'BROKEN' == name) {
        App.damagePhotoRequired = true;
        $('#actDamagePic').show();
      } else {
        App.damagePhotoRequired = false;
        $('#actDamagePic').hide();
      }
      App.evalAsset();
    },
    saveAsset: function(lat, long, accuracy) {
      // GPS coords
      if (lat && long) {
        Session.gps_relative = 0;
        Notify.hideStatic();
        Session.gps_lat = lat;
        Session.gps_long = long;
        Session.gps_accuracy = accuracy;
      } else if (1 == Config.data.default_haveGps) {
        Session.gps_relative = 1;
        Session.gps_lat = Config.data.default_lat;
        Session.gps_long = Config.data.default_long;
        Session.gps_accuracy = Config.data.default_accuracy;
      } else if (1 == Config.data.haveGps) {
        Session.gps_relative = 0;
        Session.gps_lat = Config.data.lat;
        Session.gps_long = Config.data.long;
        Session.gps_accuracy = Config.data.accuracy;
      } else {
        Notify.notifyStatic('Waiting for GPS location...');
        App.awaitGps.push(App.saveAsset);
        Location.getPosition(App.setGps);
        return;
      }
      // Location data
      Session.identifier    = Config.data.identifier;
      Session.location_id   = Config.data.location_id;
      Session.owner_id      = Config.data.owner_id;
      Session.department_id = Config.data.department_id;
      if (!Session.town_id)
	  {
	      Session.town_id       = Config.data.town_id;
	      Session.street_id     = Config.data.street_id;
	      Session.building_id   = Config.data.building_id;
	      Session.floor_id      = Config.data.floor_id;
	      Session.room_id       = Config.data.room_id;
	  }
      // Save entry
      Data.save(Table.Asset, Session.id, Session, function(data) {
        if (PhotoSession.haveItemPhoto) {
          Data.save(Table.Photo, null, {'asset_id': data.id, 'data': PhotoSession.item, 'type': 'item'});
        }
        if (PhotoSession.haveDamagePhoto) {
          Data.save(Table.Photo, null, {'asset_id': data.id, 'data': PhotoSession.damage, 'type': 'damage'});
        }
        Notify.alert('Done', 'Asset successfully saved.');
        App.resetAsset();
        Interface.back();
      }, function(err) {
        Notify.alert('Oops', 'Could not save asset due to error: ' + err.message);
      });
    }

};




































