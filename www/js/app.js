
var App = {
    
    // Status data
    location: 'Device',
    state: 'Initializing',
    stateDescription: 'Initializing',
    online: true,
    
    
    // Application Constructor
    initialize: function() {
      this.bindEvents();
      Util.setEventInfo('initEvent', 'Ready', 'ready');
      this.setState();
      //if ('Device' == this.location) {
        Data.initialize();
      //}
    },
    
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      document.addEventListener('offline', App.nowOffline, false);
      document.addEventListener('online', App.nowOnline, false);
    },
    
    
    // Connectivity handling
    nowOffline: function() {
      App.online = false;
    },
    nowOnline: function() {
      App.online = true;
    },
    
    
    // Application status
    setState: function(state, description) {
      App.state = state ? state : 'Ready';
      App.stateDescription = description ? description : 'Ready';
      $('#appStatus').html(App.state);
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
