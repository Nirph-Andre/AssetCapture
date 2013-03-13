
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
      Util.setEventInfo('initEvent', 'Ready', 'ready');
      this.setState();
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
      Notify.alert('Connected', App.online ? 'Online' : 'Offline');
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
      Util.setEventInfo('appStatus', state, evtClass);
    },
    
    
    // Callbacks
    newDevice: function() {
      Notify.alert('First Load', '');
    },
    dbReady: function() {
      Notify.hideStatic();
      $('#lblCurrentLocation').html(Config.data.location);
    },
    connectionRequired: function() {
      Notify.notifyStatic('Connection required for application to proceed.');
      return true;
    },
    dbFail: function() {
      Notify.notifyStatic('Fatal database error, application cannot proceed.');
      return true;
    },
    configFail: function() {
      Notify.notifyStatic('Could not load configuration data, application cannot proceed.');
      return true;
    },
    synchFail: function() {
      Notify.notifyStatic('Could synchronize data to server, application cannot proceed.');
      return true;
    },
    
    
    // Content loading
    loadLayout: function(name) {
      $('#contentLayout').html(Data.view(Table.Content, {
        'type': 'layout',
        'name': name
        }));
    },
    loadPage: function(name) {
      $('#contentPage').html(Data.view(Table.Content, {
        'type': 'page',
        'name': name
        }));
    },
    loadContent: function(container, name) {
      $('#' + container).html(Data.view(Table.Content, {
        'type': 'content',
        'name': name
        }));
    }
    
};
