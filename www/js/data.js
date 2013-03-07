
// Collections
var Table = {};
var Entity = {};
var Synch = {};


// DB field type definitions
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
    // Map tables to object names
    tableMap: {},
    
    
    // Initialize db handling
    initialize: function() {
      App.setState('DbInit', 'Local database initializing.');
      Data.openDatabase();
    },
    
    
    // Open db connection
    openDatabase: function() {
      Data.db = window.openDatabase(Config.dbName, Config.dbVersion, Config.dbDisplayName, Config.dbSize);
      if (true) {
        Data.db.transaction(Data.resetDb, Data.transactError, Data.transactSuccess);
      } else {
        App.setState();
      }
    },

    
    // ReCreate tables
    resetDb: function(tx) {
      // Create tables
      var table = '';
      var dType = '';
      for (table in Table) {
        var field = '';
        var stmnt = 'CREATE TABLE IF NOT EXISTS `' + table + '` (id INTEGER PRIMARY KEY AUTOINCREMENT';
        for (field in Table[table]['fields']) {
          if ('hasMany' != Table[table]['fields'][field]['type']) {
            stmnt += ', `' + field + '` ' + Table[table]['fields'][field]['datatype'];
          }
        }
        stmnt += ', `created` DATETIME';
        stmnt += ', `changed` DATETIME';
        stmnt += ')';
        tx.executeSql('DROP TABLE IF EXISTS ' + table);
        tx.executeSql(stmnt);
      }
    },
    
    
    // Success and error handling
    transactSuccess: function() {
      App.setState();

      // Add intial synch records
      alert('moo?');
      Data.save(Table.Synch, null, {'table': 'x_content', 'mode': 0}, function() {
        alert('moo.');
        Data.view(Table.Synch, null, {'table': 'x_content'}, function(data) {
          alert(JSON.stringify(data));
        }, function(err) {
          alert('no moo. ' + err.message);
        });
      }, function (err) {
        alert('no moo! ' + err.message);
      });
    },
    transactError: function(err) {
      Notify.alert('Oops', 'Data.transactError: ' + err.message);
      App.setState('DbError', 'Local database error');
    },
    queryError: function(err) {
      Notify.alert('Oops', 'Data.queryError: ' + err.message);
      App.setState('DbError', 'Local database error');
    },
    devNull: function() { },
    
    
    // Generic query execution
    query: function(statement, callback, errorCallback) {
      var errorCallback = errorCallback ? errorCallback : Data.queryError;
      Data.db.transaction(function(tx) {
        tx.executeSql(statement, [], callback);
      }, errorCallback, Data.devNull);
    },
    
    
    // Create a new data entity.
    save: function(table, id, data, callback, errorCallback) {
      // Prepare data for query
      var field = '';
      var dataSet = {};
      var fieldSet = [];
      var dTime = Util.getCurrentDateTime();
      if (id) {
        // Build update statement
        for (field in table.fields) {
          if (data[field]) {
            fieldSet.push('`' + field + '` = "' + data[field] + '"');
            dataSet[field] = data[field];
          }
        }
        fieldSet.push('`changed` = "' + dTime + '"');
        var filter = [];
        if ('object' == typeof(id)) {
          var field = '';
          for (field in id) {
            filter.push('`' + field + '` = "' + id[field] + '"');
          }
        } else {
          filter.push('`id` = ' + id);
        }
        stmnt = 'UPDATE `' + table.name + '` SET ' + fieldSet.join(', ') + ' WHERE ' + filter.join(' AND ');
      } else {
        // Build insert statement
        fieldSet = {'fields': [], 'values': []};
        for (field in table.fields) {
          if (data[field]) {
            fieldSet.fields.push('`' + field + '`');
            fieldSet.values.push('"' + data[field] + '"');
            dataSet[field] = data[field];
          }
        }
        fieldSet.fields.push('`changed`');
        fieldSet.values.push('"' + dTime + '"');
        fieldSet.fields.push('`created`');
        fieldSet.values.push('"' + dTime + '"');
        stmnt = 'INSERT INTO `' + table.name + '` (' + fieldSet.fields.join(', ') + ') VALUES (' + fieldSet.values.join(', ') + ') ';
      }
      alert(stmnt);
      
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
        if (typeof callback != 'undefined') {
          callback(dataSet);
        }
      }, function(err) {
        // Oops, something went wrong
        if (typeof errorCallback != 'undefined') {
          errorCallback(err);
        } else {
          Notify.alert('Oops', 'Data.queryError: ' + err.message);
        }
      });
    },
    
    
    // Create a new data entity.
    remove: function(table, id, callback, errorCallback) {
      
    },
    
    
    // View a single record with relevant dependants
    view: function(table, id, where, callback, errorCallback) {
      // Prepare statement
      alert(10);
      var stmnt = 'SELECT * FROM `' + table.name + '`';
      var filter = [];
      if (id) {
        filter.push('`id` = ' + id);
      }
      if (where) {
        for (field in where) {
          filter.push('`' + field + '` = "' + where[field] + '"');
        }
      }
      if (filter.length) {
        stmnt += ' WHERE ' + filter.join(' AND ');
      }
      stmnt += ' LIMIT 1';
      alert(11);
      
      // Execute query
      Data.query(stmnt, function(tx, result) {
        // Do we have data?
        alert(12);
        if (result != null && result.rows != null && result.rows.length) {
          alert(13);
          var item = result.rows.shift();
          if (typeof callback != 'undefined') {
            callback(item);
          }
        } else {
          alert(14);
          // No entry found
          if (typeof callback != 'undefined') {
            callback({});
          }
        }
      }, function(err) {
        alert(15);
        // Oops, something went wrong
        if (typeof errorCallback != 'undefined') {
          errorCallback(err);
        } else {
          Notify.alert('Oops', 'Data.queryError: ' + err.message);
        }
      });
    },
    
    
    // Retrieve list of entries
    list: function(table, where, callback, errorCallback) {
      // Prepare statement
      var stmnt = 'SELECT * FROM `' + table.name + '`';
      var filter = [];
      if (where) {
        for (field in where) {
          filter.push('`' + field + '` = "' + where[field] + '"');
        }
      }
      if (filter.length) {
        stmnt += ' WHERE ' + filter.join(' AND ');
      }
      
      // Execute query
      Data.query(stmnt, function(tx, result) {
        // Do we have data?
        if (result.rows.length) {
          if (typeof callback != 'undefined') {
            callback(result.rows);
          }
        } else {
          // No entry found
          if (typeof callback != 'undefined') {
            callback({});
          }
        }
      }, function(err) {
        // Oops, something went wrong
        Notify.alert('Oops', 'Data.queryError: ' + err.message);
        if (typeof errorCallback != 'undefined') {
          errorCallback(err);
        }
      });
    },
    
    
    // Retrieve list of entries
    listSynchData: function(table, callback, errorCallback) {
      // Prepare
      var synchData = {
          'create': {},
          'update': {},
          'remove': {}
      };
      if (table.mode == 0) {
        // Downstream only, no local changes
        callback(synchData);
      }
      var errorCallback = errorCallback ? errorCallback : Data.queryError;
      var stmnt = '';
      
      // Collect data
      Data.db.transaction(function(tx) {
        // Collect newly created entries
        stmnt = 'SELECT * FROM `' + table.name + '`';
              + ' WHERE `sid` IS NULL';
        tx.executeSql(stmnt, function(tx, result) {
          if (result.rows.length) {
            synchData.create = result.rows;
          }
        });
        // Collect updated entries
        stmnt = 'SELECT * FROM `' + table.name + '`';
              + ' WHERE `sid` IS NOT NULL AND `synchdate` < `changed`';
        if (table.fields.archived) {
          stmnt += ' AND `archived` = 0';
        }
        tx.executeSql(stmnt, function(tx, result) {
          if (result.rows.length) {
            synchData.update = result.rows;
          }
        });
        // Collect archived entries
        if (table.fields.archived) {
          stmnt = 'SELECT * FROM `' + table.name + '`';
                + ' WHERE `sid` IS NOT NULL AND `synchdate` < `changed` AND `archived` = 1';
          tx.executeSql(stmnt, function(tx, result) {
            if (result.rows.length) {
              synchData.remove = result.rows;
            }
          });
        }
      }, errorCallback, function() {
        callback(synchData);
      });
    },
    
    
    // Get latest change datetime from a table
    getLastChangeTime: function(table, callback, datefield) {
      // Prepare statement
      var datefield = datefield ? datefield : 'changed';
      var stmnt = 'SELECT MAX(`' + datefield + '`) as changed FROM ' + table.name;
      
      // Execute query
      Data.query(stmnt, function(tx, result) {
        // Do we have data?
        if (result.rows.length) {
          var item = result.rows.shift();
          if (typeof callback != 'undefined') {
            callback(item.changed);
          }
        }
      }, function(err) {
        // Oops, something went wrong
        Notify.alert('Oops', 'getLastChangeTime.queryError: ' + err.message);
      });
    },
    
    
    // Table model
    model: function (objName, tableName, meta) {
      Data.tableMap[tableName] = objName;
      this.objName = objName;
      this.name = tableName;
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
    
    
    // Entity model
    entity: function(meta) {
      this.struct = meta;
      this.hooks = {};
      this.listen = function(event, callback) {
        
      };
    }
    
};
