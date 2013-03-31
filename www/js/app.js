
var Session = {};

var App = {

    // Status data
    location: 'Device',
    state: 'Initializing',
    stateDescription: 'Initializing',
    connectionStact: {},
    online: true,
    firstRun: false,
    authenticated: false,
    awaitGps: [],


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
      Server.post('authentication/login', {"username": username, "password": password}, function (jsonResult) {
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
        Notify.alert('GPS accuracy', accuracy);
        Config.setDataItem('default_haveGps', 1);
        Config.setDataItem('default_lat', lat);
        Config.setDataItem('default_long', long);
        $('#actMoveMain').prop('disabled', false);
        App.setState();
      }
    },
    setGps: function(lat, long, accuracy) {
      if (accuracy === false) {
        Config.setDataItem('haveGps', 0);
      } else {
        Notify.alert('GPS accuracy', accuracy);
        Config.setDataItem('haveGps', 1);
        Config.setDataItem('lat', lat);
        Config.setDataItem('long', long);
        for (var i in App.awaitGps) {
          App.awaitGps[i](lat, long);
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
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actTown').prop('disabled', false);
      $('#actStreet').prop('disabled', true);
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
      Config.setDataItem('building_id', 0);
      Config.setDataItem('building', '');
      Config.setDataItem('floor_id', 0);
      Config.setDataItem('floor', '');
      Config.setDataItem('room_id', 0);
      Config.setDataItem('room', '');
      Config.setDataItem('default_haveGps', 0);
      $('#actTown').html(Config.data.town);
      $('#actStreet').html('Select Street');
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actStreet').prop('disabled', false);
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
      Config.setDataItem('building_id', 0);
      Config.setDataItem('building', '');
      Config.setDataItem('floor_id', 0);
      Config.setDataItem('floor', '');
      Config.setDataItem('room_id', 0);
      Config.setDataItem('room', '');
      Config.setDataItem('default_haveGps', 0);
      $('#actStreet').html(Config.data.street);
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actBuilding').prop('disabled', false);
      $('#actFloor').prop('disabled', true);
      $('#actFloorNA').prop('disabled', true);
      $('#actRoom').prop('disabled', true);
      $('#actRoomNA').prop('disabled', true);
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
      if (0 == Session.owner_id
          || 0 == Session.asset_type_id
          || 0 == Session.asset_sub_type_id
          || 0 == Session.asset_description_id
          ) {
        $('#actSaveAsset').prop('disabled', true);
      } else {
        $('#actSaveAsset').prop('disabled', false);
      }
    },
    resetAsset: function() {
      Session = {};
      Session.id = null;
      $('#actOwner').html('Select Owner');
      Session.owner_id = 0;
      $('#actOwner').prop('disabled', true);
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
      $('#actAssetSubDescription').prop('disabled', true);
      $('#actMaterial').html('Select Material');
      Session.material_id = null;
      $('#actMaterial').prop('disabled', true);
      $('#actPoleLength').html('Select Pole Length');
      Session.pole_length_id = null;
      $('#actPoleLength').prop('disabled', true);
      $('#actLightType').html('Select Light Type');
      Session.street_light_type_id = null;
      $('#actLightType').prop('disabled', true);
      $('#actCondition').html('Select Condition');
      Session.condition_id = null;
      $('#actCondition').prop('disabled', true);
      Session.gps_lat = '';
      Session.gps_long = '';
      Session.gps_relative = null;
    },


    // ****************************** ASSET INFORMATION ********************************* //
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
      Notify.notifyStatic('Searching for existing item.', true);
      Data.list(Table.Asset, {'identifier': identifier, 'archived': 0}, function(data) {
        Notify.hideStatic();
        if (!data.length) {
          // Item not found, capturing new item
          Notify.alert('Notice', 'Asset not found on database, capturing new asset.');
          App.newAsset(identifier);
        } else if (data.length > 1) {
          Notify.notifyStatic('Multiple assets found, acquiring list.', true);
          var stmnt = 'SELECT `a`.`id`, `ad`.`name` AS asset, `l`.`name` AS location '
            + ' FROM asset a '
            + ' JOIN asset_description ad ON `ad`.`id`=`a`.`asset_description_id` '
            + ' JOIN location l ON `l`.`id`=`a`.`location_id` '
            + ' WHERE `a`.`identifier`=' + "'" + Data.addSlashes(identifier) + "' "
            + ' AND `a`.`archived`=0';
          Data.query(stmnt, function(tx, result) {
            Notify.hideStatic();
            // Do we have data?
            if (result.rows.length) {
              var listData = [];
              for (var i = 0; i < len; i++) {
                var item = recordset.item(i);
                var label = item.asset + ', ' + item.location;
                listData.push({"value": item.id, "label": label});
              }
              listData.push({"value": 0, "label": 'New Asset'});
              Interface.allowNew = false;
              Interface.listFromData(listData, App.selectAsset, 'Select Correct Asset');
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
        } else {
          App.selectAsset(data[0].id);
        }
      });
    },
    setAsset: function(id) {
      if (0 == id) {
        App.newAsset(Config.data.identifier);
        return;
      }
      var stmnt = 'SELECT a.*, o.name AS owner, at.name AS asset_type,'
        + ' ast.name AS asset_sub_type, ad.name AS asset_description,'
        + ' asd.name AS asset_sub_description, m.name AS material,'
        + ' pl.name AS pole_length, slt.name AS street_light_type,'
        + ' c.name AS condition'
        + ' FROM asset a'
        + ' JOIN owner o ON o.id=a.owner_id'
        + ' JOIN asset_type at ON at.id=a.asset_type_id'
        + ' JOIN asset_sub_type ast ON ast.id=a.asset_sub_type_id'
        + ' JOIN asset_description ad ON ad.id=a.asset_description_id'
        + ' LEFJOIN asset_sub_description_id asd ON asd.id=a.asset_sub_description_id'
        + ' LEFT JOIN material m ON m.id=a.material_id'
        + ' LEFJOIN pole_length pl ON pl.id=a.pole_length_id'
        + ' LEFJOIN street_light_type slt ON slt.id=a.street_light_type_id'
        + ' LEFJOIN condition c ON c.id=a.condition_id'
        + ' WHERE a.id=' + id;
      Data.query(stmnt, function(tx, result) {
        if (result.rows.length) {
          // Found entry, populate fields with relevant data.
          var item = recordset.item(0);
          Session = {};
          Session.id = id;
          $('#actOwner').html(item.owner);
          Session.owner_id = item.owner_id;
          $('#actOwner').prop('disabled', false);
          $('#actAssetType').html(item.asset_type);
          Session.asset_type_id = item.asset_type_id;
          $('#actAssetType').prop('disabled', false);
          $('#actAssetSubType').html(item.asset_sub_type);
          Session.asset_sub_type_id = item.asset_sub_type_id;
          $('#actAssetDescription').html(item.asset_description);
          Session.asset_description_id = item.asset_description_id;
          $('#actAssetSubDescription').html(item.asset_sub_description);
          Session.asset_sub_description_id = item.asset_sub_description_id;
          $('#actMaterial').html(item.material);
          Session.material_id = item.material_id;
          $('#actPoleLength').html(item.pole_length);
          Session.pole_length_id = item.pole_length_id;
          $('#actLightType').html(item.street_light_type);
          Session.street_light_type_id = item.street_light_type_id;
          $('#actCondition').html(item.condition);
          Session.condition_id = item.condition_id;
          Session.gps_lat = item.gps_lat;
          Session.gps_long = item.gps_long;
          Session.gps_relative = item.gps_relative;
        } else {
          // Item not found, create new item
          App.newAsset(Config.data.identifier);
        }
      }, function(err) {
        // Oops, something went wrong
        Notify.alert('Oops', 'App.setAsset: ' + err.message);
        return true;
      });
    },
    newAsset: function(identifier) {
      // Clear out all fields
      App.resetAsset();
      $('#actOwner').prop('disabled', false);
      $('#actAssetType').prop('disabled', false);
    },
    setOwner: function(id, name) {
      Session.owner_id = id;
      $('#actOwner').html(name);
      App.evalAsset();
    },
    setAssetType: function(id, name) {
      Session.asset_type_id = id;
      Session.asset_sub_type_id = 0;
      Session.asset_description_id = 0;
      Session.asset_sub_description_id = null;
      Session.material_id = null;
      Session.pole_length_id = null;
      Session.street_light_type_id = null;
      Session.condition_id = null;
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
      $('#actMaterial').prop('disabled', true);
      $('#actPoleLength').prop('disabled', true);
      $('#actLightType').prop('disabled', true);
      $('#actCondition').prop('disabled', true);
      Interface.listFromTable(Table.AssetSubType, {'asset_type_id': Session.asset_type_id}, 'name', App.setAssetSubType, true, 'Select Asset Sub Type');
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
      Session.condition_id = null;
      $('#actAssetSubType').html(name);
      $('#actAssetDescription').html('Select Asset Description');
      $('#actAssetSubDescription').html('Select Asset Sub Description');
      $('#actMaterial').html('Select Material');
      $('#actPoleLength').html('Select Pole Length');
      $('#actLightType').html('Select Light Type');
      $('#actCondition').html('Select Condition');
      $('#actAssetDescription').prop('disabled', false);
      $('#actAssetSubDescription').prop('disabled', true);
      $('#actMaterial').prop('disabled', true);
      $('#actPoleLength').prop('disabled', true);
      $('#actLightType').prop('disabled', true);
      $('#actCondition').prop('disabled', true);
      Interface.listFromTable(Table.AssetDescription, {'asset_sub_type_id': Session.asset_sub_type_id}, 'name', App.setAssetDescription, true, 'Select Asset Description');
      App.evalAsset();
    },
    setAssetDescription: function(id, name) {
      Session.asset_description_id = id;
      Session.asset_sub_description_id = null;
      Session.material_id = null;
      Session.pole_length_id = null;
      Session.street_light_type_id = null;
      Session.condition_id = null;
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
        $('#actMaterial').prop('disabled', false);
        $('#actPoleLength').prop('disabled', false);
        $('#actLightType').prop('disabled', false);
      } else if ('ROAD SIGNS' == name) {
        $('#actCondition').prop('disabled', false);
      }
      App.evalAsset();
    },
    setAssetSubDescription: function(id, name) {
      Session.asset_sub_description_id = id;
      $('#actAssetSubDescription').html(name);
      App.evalAsset();
    },
    setMaterial: function(id, name) {
      Session.material_id = id;
      $('#actMaterial').html(name);
      App.evalAsset();
    },
    setPoleLength: function(id, name) {
      Session.pole_length_id = id;
      $('#actPoleLength').html(name);
      App.evalAsset();
    },
    setLightType: function(id, name) {
      Session.street_light_type_id = id;
      $('#actLightType').html(name);
      App.evalAsset();
    },
    setCondition: function(id, name) {
      Session.condition_id = id;
      $('#actCondition').html(name);
      App.evalAsset();
    },
    saveAsset: function(lat, long) {
      // GPS coords
      if (lat && long) {
        Notify.hideStatic();
        Session.gps_lat = lat;
        Session.gps_long = long;
      } else if (1 == Config.data.default_haveGps) {
        Session.gps_lat = Config.data.default_lat;
        Session.gps_long = Config.data.default_long;
      } else if (1 == Config.data.haveGps) {
        Session.gps_lat = Config.data.lat;
        Session.gps_long = Config.data.long;
      } else {
        Notify.notifyStatic('Waiting for GPS location...');
        App.awaitGps.push(App.saveAsset);
        Location.getPosition(App.setGps);
        return;
      }
      // Location data
      Session.location_id = Config.data.location_id;
      Session.town_id     = Config.data.town_id;
      Session.street_id   = Config.data.street_id;
      Session.building_id = Config.data.building_id;
      Session.floor_id    = Config.data.floor_id;
      Session.room_id     = Config.data.room_id;
      // Save entry
      alert(JSON.stringify(Session));
      Data.save(Table.Asset, Session.id, Session, function(data) {
        Notify.alert('Done', 'Asset successfully saved.');
        App.resetAsset();
        Interface.back();
      }, function(err) {
        Notify.alert('Oops', 'Could not save asset due to error: ' + err.message);
      });
    }

};




































