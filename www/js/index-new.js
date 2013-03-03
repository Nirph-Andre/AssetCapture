
var config = {
    dbName: 'AssetCapture',
    dbDisplayName: 'Asset Capture',
    dbVersion: '1.0',
    dbSize: 1000000
};

var app = {
    state: 'Initializing',
    stateDescription: 'Initializing',
    // Application Constructor
    initialize: function() {
      console.log('app.initialize()');
      this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      console.log('app.bindEvents()');
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      console.log('app.onDeviceReady()');
      app.receivedEvent('deviceready');
      app.setState();
      //data.initialize();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      console.log('app.receivedEvent(' + id + ')');
      var parentElement = document.getElementById(id);
      var listeningElement = parentElement.querySelector('.listening');
      var receivedElement = parentElement.querySelector('.received');

      listeningElement.setAttribute('style', 'display:none;');
      receivedElement.setAttribute('style', 'display:block;');

      console.log('Received Event: ' + id);
    },
    setState: function(state, description) {
      app.state = state ? state : 'Ready';
      app.stateDescription = description ? description : 'Ready';
      $('#appStatus').html(app.state);
      alert(app.stateDescription);
    }
};

var entities = {
    profile: {},
    company: {children: {'company_branch'}}
};

var tables = {
    profile: {
      name: {type: 'varchar(100)'},
      surname: {type: 'varchar(100)'},
      mobile: {type: 'varchar(20)'}
    },
    company: {
      name: {type: 'varchar(100)'}
    },
    company_branch: {
      company_id: {type: 'int'},
      name: {type: 'varchar(100)'}
    }
};

var data = {
    db: null,
    initialize: function() {
      console.log('data.initialize()');
      app.setState('DbInit', 'Local database initializing.');
    },
    openDatabase: function() {
      this.db = window.openDatabase(config.dbName, config.dbVersion, config.dbDisplayName, config.dbSize);
      if (true) {
        data.db.transaction(data.resetDb, data.transactError, data.transactSuccess);
      } else {
        app.setState();
      }
    },
    resetDb: function(tx) {
      var entity = '';
      var table = '';
      for (entity in entities) {
        table = entity;
        var field = '';
        var stmnt = 'CREATE TABLE IF NOT EXISTS ' + table + ' (id unique';
        for (field in tables[entity]) {
          stmnt += ', ' + field + ' ' + tables[entity][field]['type'];
        }
        stmnt += ')';
        alert(stmnt);
        tx.executeSql('DROP TABLE IF EXISTS ' + table);
        tx.executeSql(stmnt);
        if (entities[entity]['children']) {
          for (table in entities[entity]['children']) {
            var field = '';
            var stmnt = 'CREATE TABLE IF NOT EXISTS ' + table + ' (id unique';
            for (field in tables[entity]) {
              stmnt += ', ' + field + ' ' + tables[entity][field]['type'];
            }
            stmnt += ')';
            alert(stmnt);
            tx.executeSql('DROP TABLE IF EXISTS ' + table);
            tx.executeSql(stmnt);
          }
        }
      }
    },
    transactSuccess: function() {
      console.log('data.transactSuccess()');
      app.setState();
    },
    transactError: function(err) {
      console.log('data.transactError: ' + err);
      app.setState('DbError', 'Local database error');
      alert(err);
    }
};























