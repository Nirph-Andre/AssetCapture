
var Table = {};
var Entity = {};

var EM = {
    belongsTo: function(table, validation) {
      return {
        'type': 'belongsTo',
        'table': table,
        'datatype': 'INTEGER',
        'validation': validation
      };
    },
    hasOne: function(table, validation) {
      return {
        'type': 'hasOne',
        'table': table,
        'datatype': 'INTEGER',
        'validation': validation
      };
    },
    hasMany: function(table, validation) {
      return {
        'type': 'hasMany',
        'table': table,
        'datatype': 'INTEGER',
        'validation': validation
      };
    },
    attr: function(type, validation) {
      var dType = '';
      switch(type)
      {
        case 'string':
          dType = 'VARCHAR(255)';
          break;
        case 'mediumstring':
          dType = 'VARCHAR(100)';
          break;
        case 'smallstring':
          dType = 'VARCHAR(50)';
          break;
        case 'tinystring':
          dType = 'VARCHAR(10)';
          break;
        case 'text':
          dType = 'TEXT';
          break;
        case 'int':
          dType = 'INTEGER';
          break;
        case 'boolen':
          dType = 'BOOLEAN';
          break;
        case 'bigint':
          dType = 'BIGINT';
          break;
        case 'mediumint':
          dType = 'MEDIUMINT';
          break;
        case 'smallint':
          dType = 'SMALLINT';
          break;
        case 'tinyint':
          dType = 'TINYINT';
          break;
        case 'decimal':
          dType = 'DECIMAL(13,2)';
          break;
        case 'date':
          dType = 'DATE';
          break;
        case 'datetime':
          dType = 'DATETIME';
          break;
        case 'blob':
          dType = 'BLOB';
          break;
        default:
          dType = 'VARCHAR(255)';
      }
      return {
        'type': 'attr',
        'datatype': dType,
        'validation': validation
      };
    }
};

var Data = {
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
      App.setState('DbInit', 'Local database initializing.');
      Data.openDatabase();
    },
    
    // Open db connection
    openDatabase: function() {
      Data.db = window.openDatabase(Config.dbName, Config.dbVersion, Config.dbDisplayName, Config.dbSize);
      Data.initStore();
      if (true) {
        Data.db.transaction(Data.resetDb, Data.transactError, Data.transactSuccess);
      } else {
        App.setState();
      }
    },
    
    // Initialize data store
    initStore: function() {
      var table = '';
      for (table in Table) {
        Data.storeClean[Table[table]] = {};
      }
      Data.store = Data.storeClean;
    },
    
    // Reset data store from template
    cleanStore: function() {
      Data.store = Data.storeClean;
    },

    // ReCreate tables
    resetDb: function(tx) {
      var table = '';
      var dType = '';
      for (table in Table) {
        var field = '';
        var stmnt = 'CREATE TABLE IF NOT EXISTS ' + table + ' (id INTEGER PRIMARY KEY AUTOINCREMENT';
        for (field in Table[table]['fields']) {
          if ('hasMany' != Table[table]['fields'][field]['type']) {
            stmnt += ', ' + field + ' ' + Table[table]['fields'][field]['datatype'];
          }
        }
        stmnt += ')';
        tx.executeSql('DROP TABLE IF EXISTS ' + table);
        alert(stmnt);
        tx.executeSql(stmnt);
      }
    },
    
    // Success and error handling
    transactSuccess: function() {
      App.setState();
    },
    transactError: function(err) {
      Notify.alert('Oops', 'Data.transactError: ' + err.message);
      App.setState('DbError', 'Local database error');
    },
    querySuccess: function(tx, result) {
      Data.store = result.rows;
      App.setState();
    },
    queryError: function(err) {
      Notify.alert('Oops', 'Data.queryError: ' + err.message);
      App.setState('DbError', 'Local database error');
    },
    
    // Generic query execution
    query: function(statement, success, fail) {
      if (!success) {
        return;
      }
      var errorCallback = fail ? fail : Data.queryError;
      Data.db.transaction(function(tx) {
        tx.executeSql(statement);
      }, errorCallback, successCallback);
    },
    
    // Create a new data entity.
    save: function(table, id, data, callback, errorCallback) {
      // Prepare data for query
      var field = '';
      var dataSet = {};
      var fieldSet = [];
      for (field in table.fields) {
        if (data[field]) {
          fieldSet.push(field + ' = "' + data[field] + '"');
          dataSet[field] = data[field];
        }
      }
      if (id) {
        // Build update statement
        stmnt = 'UPDATE ' + table.name + ' SET ' + fieldSet.join(', ') + ' WHERE id = ' + id;
      } else {
        // Build insert statement
        stmnt = 'INSERT INTO ' + table.name + ' SET ' + fieldSet.join(', ');
      }
      
      // Execute query
      Data.query(stmnt, function(tx, result) {
        if (result.rowsAffected) {
          // All good
          if (!id) {
            id = result.insertId;
          }
        } else {
          // No change
        }
        dataSet['id'] = id;
        if (callback) {
          callback(dataSet);
        }
      }, function(err) {
        // Oops, something went wrong
        Notify.alert('Oops', 'Data.queryError: ' + err.message);
        if (errorCallback) {
          errorCallback(err);
        }
      });
    },
    
    // Create a new data entity.
    remove: function(table, id, callback, errorCallback) {
      
    },
    
    // View a single record with relevant dependants
    view: function(table, id, where, callback, errorCallback) {
      // Prepare statement
      var stmnt = 'SELECT * FROM ' + table.name;
      var filter = [];
      if (id) {
        filter.push('id = ' + id);
      }
      if (where) {
        for (field in where) {
          filter.push(field + ' = "' + where[field] + '"');
        }
      }
      if (filter.length) {
        stmnt += ' WHERE ' + filter.join(' AND ');
      }
      stmnt += ' LIMIT 1';
      
      // Execute query
      Data.query(stmnt, function(tx, result) {
        // Do we have data?
        if (result.rows.length) {
          var item = result.rows.shift();
          if (callback) {
            callback(item);
          }
        } else {
          // No entry found
          if (callback) {
            callback({});
          }
        }
      }, function(err) {
        // Oops, something went wrong
        Notify.alert('Oops', 'Data.queryError: ' + err.message);
        if (errorCallback) {
          errorCallback(err);
        }
      });
    },
    
    model: function (name, meta) {
      this.name = name;
      this.fields = meta;
      this.data = {};
      this.hooks = {};
      this.listen = function(event, callback) {
        
      };
      this.speak = function() {
        var field = '';
        var myFields = []
        for (field in this.fields) {
          myFields.push(field);
        }
        alert(this.name + ': ' + myFields.join(','));
      }
    },
    entity: function(meta) {
      this.struct = meta;
      this.hooks = {};
      this.listen = function(event, callback) {
        
      };
    }
};
