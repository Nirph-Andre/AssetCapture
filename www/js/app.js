
var App = {
    
    // Status data
    location: 'Device',
    state: 'Initializing',
    stateDescription: 'Initializing',
    online: true,
    
    
    // Application Constructor
    initialize: function() {
      Notify.notifyStatic();
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
    },
    
    
    // Connectivity handling
    nowOffline: function() {
      App.online = false;
    },
    nowOnline: function() {
      App.online = true;
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
      $('#appStatus').html(App.state);
      Util.setEventInfo('initEvent', state, evtClass);
    },
    
    
    // Status handling
    newDevice: function() {
      //Notify.alert('First Load', '');
    },
    dbReady: function() {
      Notify.hideStatic();
      App.setState();
      $('#lblCurrentLocation').html(Config.data.location);
    },
    synchComplete: function() {
      Notify.hideStatic();
      App.setState();
    },
    connectionRequired: function() {
      Notify.notifyStatic('Connection required for application to proceed.');
      Notify.alert('Connection Error', 'Please connect to internet to proceed.');
      App.setState('Connection Required', 'Please connect to internet to proceed', 'processing');
      return true;
    },
    dbFail: function(message) {
      Notify.notifyStatic('Fatal database error, application cannot proceed.');
      App.setState('Database Error', message, 'problem');
      if (message) {
        Notify.alert('Database Error', message);
      }
      return true;
    },
    configFail: function() {
      Notify.notifyStatic('Could not load configuration data, application cannot proceed.');
      App.setState('Configuration Error', 'Could not load configuration data.', 'problem');
      return true;
    },
    synchFail: function(message) {
      Notify.notifyStatic('Could not synchronize data to server, application cannot proceed.');
      App.setState('Synchronization Error', message, 'problem');
      if (message) {
        Notify.alert('Synchronization Error', message);
      }
      return true;
    },
    
    
    // Content loading
    loadLayout: function(name) {
      Data.view(Table.Content, null, {
        'type': 'layout',
        'name': name
      }, function(data) {
        $('#contentLayout').html(data.html);
        if (data.js && data.js.length) {
          eval(data.js);
        }
      });
    },
    loadPage: function(name) {
      Data.view(Table.Content, null, {
        'type': 'page',
        'name': name
      }, function(data) {
        $('#contentPage').html(data.html);
        if (data.js && data.js.length) {
          eval(data.js);
        }
      });
    },
    loadContent: function(container, name) {
      Data.view(Table.Content, null, {
        'type': 'content',
        'name': name
      }, function(data) {
        $('#' + container).html(data.html);
        if (data.js && data.js.length) {
          eval(data.js);
        }
      });
    }
    
};
