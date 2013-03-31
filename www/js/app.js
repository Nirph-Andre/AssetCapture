
var App = {

    // Status data
    location: 'Device',
    state: 'Initializing',
    stateDescription: 'Initializing',
    connectionStact: {},
    online: true,
    firstRun: false,
    authenticated: false,


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
          Interface.listFromTable(Table.Location, {}, 'name', App.setLocation);
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
      $('#actRoom').prop('disabled', true);
      $('#actMoveMain').prop('disabled', true);
      Interface.listFromTable(Table.Town, {'location_id': id}, 'name', App.setTown, true);
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
      $('#actTown').html(Config.data.town);
      $('#actStreet').html('Select Street');
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actStreet').prop('disabled', false);
      $('#actBuilding').prop('disabled', true);
      $('#actFloor').prop('disabled', true);
      $('#actRoom').prop('disabled', true);
      $('#actMoveMain').prop('disabled', true);
      Interface.listFromTable(Table.Street, {'town_id': id}, 'name', App.setStreet, true);
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
      $('#actStreet').html(Config.data.street);
      $('#actBuilding').html('Select Building');
      $('#actFloor').html('Scan Floor Barcode');
      $('#actRoom').html('Scan Room Barcode');
      $('#actBuilding').prop('disabled', false);
      $('#actFloor').prop('disabled', true);
      $('#actRoom').prop('disabled', true);
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
      $('#actRoom').prop('disabled', true);
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
            $('#actRoom').html(Config.data.floor);
          });
        } else {
          Config.setDataItem('room_id', xdata.id);
          Config.setDataItem('room', xdata.name);
          $('#actRoom').html(Config.data.floor);
        }
      });
    }

};
