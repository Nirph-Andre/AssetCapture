
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
    
    // Synchronization status
    synching: false,
    synchItems: 0,
    synchedItems: 0,
    
    // Some constants
    SYNCH_FROM_SERVER: 1,
    SYNCH_TO_SERVER: 2,
    SYNCH_BOTH: 3,
    
    
    

    // ****************************** INITIALIZATION ********************************* //
    // Initialize db handling
    initialize: function() {
      App.setState('Init Database', 'Local database initializing.');
      Data.openDatabase();
    },
    
    
    // Open db connection
    openDatabase: function() {
      Data.db = window.openDatabase(Config.dbName, Config.dbVersion, Config.dbDisplayName, Config.dbSize);
      if (true) {
        Data.db.transaction(Data.initDb, Data.transactError, Data.initData);
      } else {
        App.dbFail();
        App.setState('Error', 'Could not open local database');
      }
    },

    
    // Create tables
    initDb: function(tx) {
      // Create tables
      var table = '';
      var dType = '';
      for (table in Table) {
        var field = '';
        var stmnt = 'CREATE TABLE IF NOT EXISTS `' + Table[table]['name'] + '` (id INTEGER PRIMARY KEY AUTOINCREMENT';
        for (field in Table[table]['fields']) {
          if ('hasMany' != Table[table]['fields'][field]['type']) {
            stmnt += ', `' + field + '` ' + Table[table]['fields'][field]['datatype'];
          }
        }
        stmnt += ', `created` DATETIME';
        stmnt += ', `changed` DATETIME';
        stmnt += ')';
        tx.executeSql(stmnt);
      }
    },
    
    
    // Initial data setup
    initData: function() {
      App.setState();
      Data.view(Table.Synch, null, {'table': 'x_content'}, function(data) {
        if (!data.id) {
          // First application run on new device
          // Add content table to synch list and init server synch
          App.newDevice();
          Data.save(Table.Synch, null, {'table': 'x_content', 'mode': Data.SYNCH_FROM_SERVER});
          //Data.save(Table.Synch, null, {'table': 'moveable', 'mode': Data.SYNCH_BOTH});
          //Data.save(Table.Synch, null, {'table': 'infrastructure', 'mode': Data.SYNCH_BOTH, 'filter': 'location'});
          Data.save(Table.Config, null, {'name': 'location', 'value': 'Unknown'});
          Config.setDataItem('location', 'Unknown');
          App.configReady();
          App.dbReady();
        } else {
          Data.list(Table.Config, {}, function(data) {
            Config.setData(data);
            App.dbReady();
          }, function() {
            App.configFail();
            return true;
          });
        }
        Data.view(Table.Content, null, {'type': 'page', 'name': 'home'}, function(data) {
          if (!data.id) {
            App.dbReady();
            //Data.refreshAppMeta(App.dbReady, App.synchFail);
          } else {
            App.dbReady();
          }
        }, function(err) {
          alert('initData.viewContentEntry.error');
          return true;
        });
        App.dbReady();
      }, function(err) {
        alert('initData.viewSynchEntry.error');
        return true;
      });
    },

    
    

    // ****************************** ERROR HANDLING ********************************* //
    // Success and error handling
    transactError: function(err) {
      Notify.alert('Oops', 'Data.transactError: ' + err.message);
      App.setState('Error', 'Local database error');
      return true;
    },
    queryError: function(tx, err) {
      Notify.alert('Oops', 'Data.queryError: ' + err.message);
      App.setState('Error', 'Local database error');
      return true;
    },
    devNull: function() { },
    
    
    

    // ****************************** DATA MANIPULATION ********************************* //
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
      var mode = '';
      if (id) {
        // Build update statement
        mode = 'updated';
        if (data.created) {
          delete data.created;
        }
        if (data.changed) {
          delete data.changed;
        }
        for (field in table.fields) {
          if (data[field]) {
            fieldSet.push('`' + field + '` = "' + data[field] + '"');
            dataSet[field] = data[field];
          }
        }
        if (!data['synchdate']) {
          fieldSet.push('`changed` = "' + dTime + '"');
        }
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
        if (data.created) {
          delete data.created;
        }
        if (data.changed) {
          delete data.changed;
        }
        mode = 'created';
        fieldSet = {'fields': [], 'values': []};
        for (field in table.fields) {
          if (data[field]) {
            fieldSet.fields.push('`' + field + '`');
            fieldSet.values.push('"' + data[field] + '"');
            dataSet[field] = data[field];
          }
        }
        if (!data['synchdate']) {
          fieldSet.fields.push('`changed`');
          fieldSet.values.push('"' + dTime + '"');
          fieldSet.fields.push('`created`');
          fieldSet.values.push('"' + dTime + '"');
        } else {
          fieldSet.fields.push('`changed`');
          fieldSet.values.push('"' + data['synchdate'] + '"');
          fieldSet.fields.push('`created`');
          fieldSet.values.push('"' + data['synchdate'] + '"');
        }
        stmnt = 'INSERT INTO `' + table.name + '` (' + fieldSet.fields.join(', ') + ') VALUES (' + fieldSet.values.join(', ') + ') ';
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
        if (typeof callback != 'undefined') {
          callback(dataSet);
        }
        table.trigger(mode, dataSet);
      }, function(err) {
        // Oops, something went wrong
        if (typeof errorCallback != 'undefined') {
          errorCallback(err);
        } else {
          Notify.alert('Oops', 'Data.queryError: ' + err.message);
        }
        return true;
      });
    },
    
    
    // Create a new data entity.
    remove: function(table, id, callback, errorCallback) {
      
    },
    
    
    // View a single record with relevant dependants
    view: function(table, id, where, callback, errorCallback) {
      // Prepare statement
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
      
      // Execute query
      Data.query(stmnt, function(tx, result) {
        // Do we have data?
        if (result && result.rows && result.rows.length) {
          var item = result.rows.item(0);
          if (typeof callback != 'undefined') {
            callback(item);
          }
          table.trigger('loaded', item);
        } else {
          // No entry found
          if (typeof callback != 'undefined') {
            callback({});
          }
          table.trigger('loaded', {});
        }
      }, function(err) {
        // Oops, something went wrong
        if (typeof errorCallback != 'undefined') {
          errorCallback(err);
        } else {
          Notify.alert('Oops', 'Data.queryError: ' + err.message);
        }
        return true;
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
          table.trigger('listed', result.rows);
        } else {
          // No entry found
          if (typeof callback != 'undefined') {
            callback({});
          }
          table.trigger('listed', {});
        }
      }, function(err) {
        // Oops, something went wrong
        if (typeof errorCallback != 'undefined') {
          errorCallback(err);
        } else {
          Notify.alert('Oops', 'Data.queryError: ' + err.message);
        }
        return true;
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
          var item = result.rows.item(0);
          if (typeof callback != 'undefined') {
            callback(item.changed);
          }
        }
      }, function(err) {
        // Oops, something went wrong
        Notify.alert('Oops', 'getLastChangeTime.queryError: ' + err.message);
        return true;
      });
    },
    
    
    
    
    // ****************************** MODELS ********************************* //
    // Table model
    model: function (objName, tableName, meta) {
      Data.tableMap[tableName] = objName;
      this.objName = objName;
      this.name = tableName;
      this.fields = meta;
      this.data = {};
      this.hooks = {'created': [], 'updated': [], 'removed': [], 'loaded': [], 'listed': []};
      this.listen = function(event, callback) {
        if (this.hooks[event]) {
          this.hooks[event] = callback;
        }
      };
      this.trigger = function(event, data) {
        for (var ind in this.hooks[event]) {
          (this.hooks[event][ind])(event, data);
        }
      };
    },
    
    
    // Entity model
    entity: function(meta) {
      this.struct = meta;
      this.hooks = {};
      this.listen = function(event, callback) {
        
      };
    },
    
    
    

    // ****************************** SYNCHRONIZATION ********************************* //
    // Synchronize all relevant data to and from server
    refreshAppMeta: function(callback, errorCallback) {
      if (Data.synching) {
        return;
      }
      if (!App.online) {
        App.connectionRequired();
        return;
      }
      Data.synching = true;
      App.setState('Loading', 'Synchronizing application data.');
      Data.list(Table.Synch, {}, function(data) {
        Data.loadSynchData(data, callback, errorCallback);
      });
    },
    
    
    // Load synch data from server
    loadSynchData: function(synchEntries, callback, errorCallback) {
      Data.synchItems = synchEntries.length;
      Data.synchedItems = 0;
      var item = {};
      var data = {};
      var objName = '';
      var filter = {};
      for (var i = 0; i < Data.synchItems; i++) {
        item = synchEntries.item(i);
        objName = Data.tableMap[item.table];
        filter = {};
        if (item.filter && item.filter.length) {
          filter[item.filter] = Config.data[item.filter] ? Config.data[item.filter] : null;
        }
        Data.listSynchData(Table[objName], filter, item.server_time, function(table, synchData) {
          Server.post('data/synch', synchData, function(jsonResult) {
            alert(JSON.stringify(jsonResult));
            // Update local entries with relevant server id's
            for (var retObjName in jsonResult.Data) {
              alert('1');
              alert(retObjName);
              var table = Table[retObjName];
              alert('2');
              var synchItem = jsonResult.Data[retObjName];
              alert('3');
              var localTime = Util.getCurrentDateTime();
              alert(JSON.stringify(synchItem));
              for (var ind in synchItem.Feedback) {
                data = synchItem.Feedback[ind];
                if (!data.archive) {
                  Data.save(table, data.id, {
                    'sid': data.sid,
                    'synchdate': jsonResult.synch_datetime
                  });
                } else {
                  Data.remove(table, data.id);
                }
              }
  
              alert('4');
              // Create new entries as provided by server
              for (var ind in synchItem.Create) {
                data = synchItem.Create[ind];
                data.synchdate = jsonResult.synch_datetime;
                Data.synchUpdate(table, data);
              }
  
              alert('5');
              // Update existing entries
              for (var ind in synchItem.Update) {
                data = synchItem.Update[ind];
                data.synchdate = jsonResult.synch_datetime;
                Data.synchUpdate(table, data);
              }
  
              alert('6');
              // Remove existing entries
              for (var ind in synchItem.Remove) {
                data = synchItem.Remove[ind];
                data.synchdate = jsonResult.synch_datetime;
                Data.synchUpdate(table, data);
              }
  
              alert('7');
              // Update synch entry with relevant timestamps
              Data.view(Table.Synch, null, {'table': table.name}, function(data) {
                if (data.id) {
                  Data.save(Table.Synch, data.id, {
                    'local_time': localTime,
                    'server_time': jsonResult.synch_datetime
                  });
                }
              });
              
              // Cleanup
              alert('8');
              Data.synchedItems++;
              if (Data.synchedItems >= Data.synchItems) {
                alert('9');
                Data.synchItems = 0;
                Data.synchItsynchedItemsems = 0;
                Data.synching = false;
                App.setState();
                App.synchComplete();
                if (typeof callback != 'undefined') {
                  callback();
                }
              }
            }
          }, function(jqXHR, textStatus, errorThrown) {
            Data.synchedItems++;
            Notify.alert('Oops', textStatus);
            if (Data.synchedItems >= Data.synchItems) {
              App.synchFail('Could not collect required data for synchronizing to server: ' + textStatus);
              Data.synchItems = 0;
              Data.synchItsynchedItemsems = 0;
              Data.synching = false;
              if (typeof errorCallback != 'undefined') {
                errorCallback(err);
              }
            }
          });
        });
      }
    },
    
    
    // Retrieve list of entries
    listSynchData: function(table, synchFilter, serverTime, callback, errorCallback) {
      // Prepare
      var synchData = {};
      synchData[table.objName] =  {
          'lastSynchDate': serverTime,
          'filter': synchFilter,
          'create': {},
          'update': {},
          'remove': {}
      };
      if (table.mode == Data.SYNCH_FROM_SERVER) {
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
        tx.executeSql(stmnt, [], function(tx, result) {
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
        tx.executeSql(stmnt, [], function(tx, result) {
          if (result.rows.length) {
            synchData.update = result.rows;
          }
        });
        // Collect archived entries
        if (table.fields.archived) {
          stmnt = 'SELECT * FROM `' + table.name + '`';
                + ' WHERE `sid` IS NOT NULL AND `synchdate` < `changed` AND `archived` = 1';
          tx.executeSql(stmnt, [], function(tx, result) {
            if (result.rows.length) {
              synchData.remove = result.rows;
            }
          });
        }
      }, function(err) {
        App.dbFail(err.message);
        return true;
      }, function() {
        callback(table, synchData);
      });
    },
    
    
    // Synch retrieved server data to local store
    synchUpdate: function(table, serverData) {
      if (serverData.archived) {
        Data.view(table, null, {'sid': serverData.id}, function(data) {
          if (data.id) {
            Data.remove(Table[objName], data.id);
          }
        });
      } else if (serverData.id) {
        Data.view(table, null, {'sid': serverData.id}, function(data) {
          delete serverData.id;
          if (data.id) {
            Data.save(table, data.id, data);
          } else {
            Data.save(table, null, serverData);
          }
        });
      }
    }
    
};
