
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


    // Primary app logic
    pageLoaded: function(page) {
      switch(page) {
      case 'Location':
        Interface.listFromTable(Table.Location, {}, 'name', App.setLocation);
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
    setLocation: function(id, name) {
      Config.setDataItem('location_id', id);
      Config.setDataItem('location', name);
      Config.setDataItem('town_id', 0);
      Config.setDataItem('town', '');
      Config.setDataItem('street_id', 0);
      Config.setDataItem('street', '');
      $('.location').html(Config.data.location);
      $('#actLocation').html(Config.data.location);
      $('#actTown').prop('disabled', false);
      $('#actStreet').prop('disabled', true);
      $('#actMoveMain').prop('disabled', true);
      Interface.listFromTable(Table.Town, {'location_id': id}, 'name', App.setTown, true);
    },
    setTown: function(id, name) {
      Config.setDataItem('town_id', id);
      Config.setDataItem('town', name);
      Config.setDataItem('street_id', 0);
      Config.setDataItem('street', '');
      $('#actTown').html(Config.data.location);
      $('#actStreet').prop('disabled', false);
      $('#actMoveMain').prop('disabled', true);
      Interface.listFromTable(Table.Town, {'town_id': id}, 'name', App.setStreet, true);
    },
    setStreet: function(id, name) {
      Config.setDataItem('street_id', id);
      Config.setDataItem('street', name);
      $('#actMoveMain').prop('disabled', false);
      $('#actStreet').html(Config.data.location);
    }

};
