
var config = {
    dbName: 'AssetCapture',
    dbDisplayName: 'Asset Capture',
    dbVersion: '1.0',
    dbSize: 1000000
};

var entities = {
    content: {'synch': 'readonly'},
    profile: {'synch': 'readwrite'},
    company: {'children': ['company_branch']}
};

var tables = {
    'content': {
      'type': {'type': 'VARCHAR(100)'},
      'name': {'type': 'VARCHAR(100)'},
      'html': {'type': 'TEXT'},
      'js': {'type': 'TEXT'}
    },
    'profile': {
      'name': {'type': 'VARCHAR(100)'},
      'surname': {'type': 'VARCHAR(100)'},
      'mobile': {'type': 'VARCHAR(20)'}
    },
    'company': {
      'name': {'type': 'VARCHAR(100)'}
    },
    'company_branch': {
      'company_id': {'type': 'INTEGER'},
      'name': {'type': 'VARCHAR(100)'}
    }
};

var app = {
    state: 'Initializing',
    stateDescription: 'Initializing',
    // Application Constructor
    initialize: function() {
      console.log('initialize()');
      this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      console.log('bindEvents()');
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      console.log('onDeviceReady()');
      app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      console.log('receivedEvent(' + id + ')');
      var parentElement = document.getElementById(id);
      var listeningElement = parentElement.querySelector('.listening');
      var receivedElement = parentElement.querySelector('.received');

      listeningElement.setAttribute('style', 'display:none;');
      receivedElement.setAttribute('style', 'display:block;');

      notify.alert('Received Event', id);
      app.setState();
      data.initialize();
    },
    setState: function(state, description) {
      app.state = state ? state : 'Ready';
      app.stateDescription = description ? description : 'Ready';
      $('#appStatus').html(app.state);
      notify.alert('State Change', app.stateDescription);
    },
    loadLayout: function(name) {
      $('#contentLayout').html(data.view('content', {
        'type': 'layout',
        'name': name
        }));
    },
    loadPage: function(name) {
      $('#contentPage').html(data.view('content', {
        'type': 'page',
        'name': name
        }));
    },
    loadContent: function(container, name) {
      $('#' + container).html(data.view('content', {
        'type': 'content',
        'name': name
        }));
    },
    retrieveServerContent: function(page) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'http://dev.nirphrdp.com/' + page,
        data: {},
        success: function(jsonp) {
          alert('Content loaded from http://dev.nirphrdp.com/' + page);
          $('#contentLayout').html(jsonp);
        }
      });
    }
};

var data = {
    // Database object
    db: null,
    // Query counter
    qC: 0,
    // Query handling data
    qCdata: {},
    // Clean store template
    storeClean: {},
    // Data store
    store: {},
    
    
    // Initialize db handling
    initialize: function() {
      console.log('data.initialize()');
      app.setState('DbInit', 'Local database initializing.');
      data.openDatabase();
    },
    
    // Open db connection
    openDatabase: function() {
      data.db = window.openDatabase(config.dbName, config.dbVersion, config.dbDisplayName, config.dbSize);
      data.initStore();
      if (true) {
        data.db.transaction(data.resetDb, data.transactError, data.transactSuccess);
      } else {
        app.setState();
      }
    },
    
    // Initialize data store
    initStore: function() {
      var table = '';
      for (table in tables) {
        data.storeClean[table] = {};
      }
      data.store = data.storeClean;
    },
    
    // Reset data store from template
    cleanStore: function() {
      data.store = data.storeClean;
    },
    
    // ReCreate tables
    resetDb: function(tx) {
      var entity = '';
      var table = '';
      var index = '';
      for (entity in entities) {
        table = entity;
        var field = '';
        var stmnt = 'CREATE TABLE IF NOT EXISTS ' + table + ' (id INTEGER PRIMARY KEY AUTOINCREMENT';
        for (field in tables[entity]) {
          stmnt += ', ' + field + ' ' + tables[entity][field]['type'];
        }
        stmnt += ')';
        notify.alert('QUERY', stmnt);
        tx.executeSql('DROP TABLE IF EXISTS ' + table);
        tx.executeSql(stmnt);
        if (entities[entity]['children']) {
          for (index in entities[entity]['children']) {
            table = entities[entity]['children'][index];
            var field = '';
            var stmnt = 'CREATE TABLE IF NOT EXISTS ' + table + ' (id unique';
            for (field in tables[entity]) {
              stmnt += ', ' + field + ' ' + tables[entity][field]['type'];
            }
            stmnt += ')';
            notify.alert('QUERY', stmnt);
            tx.executeSql('DROP TABLE IF EXISTS ' + table);
            tx.executeSql(stmnt);
          }
        }
      }
    },
    
    // Success and error handling
    transactSuccess: function() {
      notify.alert('YAY', 'data.transactSuccess()');
      app.setState();
    },
    transactError: function(err) {
      notify.alert('Oops', 'data.transactError: ' + err.message);
      app.setState('DbError', 'Local database error');
    },
    querySuccess: function(tx, result) {
      notify.alert('YAY', 'data.querySuccess()');
      data.store = result.rows;
      app.setState();
    },
    queryError: function(err) {
      notify.alert('Oops', 'data.queryError: ' + err.message);
      app.setState('DbError', 'Local database error');
    },
    
    // Generic query execution
    query: function(statement, success, fail) {
      if (!success) {
        return;
      }
      var errorCallback = fail ? fail : data.queryError;
      data.db.transaction(function(tx) {
        tx.executeSql(statement);
      }, errorCallback, successCallback);
    },
    
    // Create a new data entity.
    save: function(entity, id, data, success, fail) {
      // Arrange the data we need to insert/update
      data.cleanStore();
      var index = 0;
      var table = '';
      var field = '';
      var fields = [];
      var dataSet = {};
      /*if (entities[entity]['children']) {
        for (index in entities[entity]['children']) {
          table = entities[entity]['children'][index];
          if (data[table]) {
            dataSet[table] = data[table];
            delete data[table];
          }
        }
      }*/
      dataSet[entity] = data;
      // Do the inserts/updates
      for (table in dataSet) {
        fields = [];
        for (field in dataSet[table]) {
          fields.push(field + ' = "' + dataSet[table][field] + '"');
        }
        if (id) {
          // Build update statement
          stmnt = 'UPDATE ' + table + ' SET ' + fields.join(', ') + ' WHERE id = ' + id;
        } else {
          // Build insert statement
          stmnt = 'INSERT INTO ' + table + ' SET ' + fields.join(', ');
        }
        
        data.query(stmnt, function(tx, result) {
          if (result.rowsAffected) {
            // All good
            if (!id) {
              id = result.insertId;
            }
          } else {
            // No change
          }
          data['id'] = id;
          data.store[entity] = data;
          if (success) {
            success(data);
          }
        }, function(err) {
          // Oops, something went wrong
          notify.alert('Oops', 'data.queryError: ' + err.message);
          if (fail) {
            fail(err);
          }
        });
        
        
        
        
        if (table != entity && id) {
          
        }
      }
    },
    
    // Create a new data entity.
    remove: function(entity, id, success, fail) {
      
    },
    
    // View a single record with relevant dependants
    view: function(entity, id, where, success, fail) {
      data.cleanStore();
      var tmpStore = {};
      // Prepare statement
      var table = '';
      var stmnt = 'SELECT * FROM ' + entity;
      if (id) {
        stmnt += ' WHERE id = ' + id;
      }
      if (where) {
        var filter = [];
        for (field in where) {
          filter.push(field + ' = "' + where[index] + '"');
        }
        stmnt += ' WHERE ' + filter.join(' AND ');
      }
      // Execute query
      notify.alert('QUERY', stmnt);
      data.query(stmnt, function(tx, result) {
        // Do we have data?
        if (result.rows.length) {
          data.store[entity] = result.rows.shift();
          tmpStore = data.store[entity];
          // Do we have dependant data to collect?
          if (entities[entity]['children']) {
            // Keep some meta so that we know when the stack is complete
            var depTable = '';
            var myQc = data.qC++;
            if (data.qC > 500000) {
              data.qC = 0; 
            }
            stmnt = [];
            var index = 0;
            for (index in entities[entity]['children']) {
              depTable = entities[entity]['children'][index];
              stmnt.push('SELECT "' + depTable + '" AS table_ident, ' + depTable + '.* FROM ' + depTable + ' WHERE ' + entity + '_id = ');
            }
            data.qCdata[myQc] = {'counter': stmnt.length, 'handled': 0};
            // Collect all dependant data
            for (index in stmnt) {
              notify.alert('QUERY', stmnt[index]);
              data.query(stmnt[index], function(tx, result) {
                if (result.rows.length) {
                  var row = result.rows.shift();
                  var tableIdent = row.table_ident;
                  delete row.table_ident;
                  data.store[tableIdent] = row;
                  tmpStore[tableIdent] = row;
                } else {
                  data.store[tableIdent] = {};
                  tmpStore[tableIdent] = {};
                }
                data.qCdata[myQc]['handled'] += 1;
                if (data.qCdata[myQc]['counter'] == data.qCdata[myQc]['handled']) {
                  // Last query result, do callback
                  if (success) {
                    success(tmpStore);
                  }
                }
              }, function(err) {
                // Oops, something went wrong
                notify.alert('Oops', 'data.queryError: ' + err.message);
                if (fail) {
                  fail(err);
                }
              });
            }
          }
        } else {
          // No entry found
          data.store[entity] = {};
          tmpStore = {};
          if (success) {
            success(tmpStore);
          }
        }
      }, function(err) {
        // Oops, something went wrong
        notify.alert('Oops', 'data.queryError: ' + err.message);
        if (fail) {
          fail(err);
        }
      });
      
    }
};

var notify = {
    alert: function(title, message, button, callback) {
      navigator.notification.alert(message, callback, title, button ? button : 'OK');

    }
};
