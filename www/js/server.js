
var Server = {
    
    // Status data
    synching: false,
    synchItems: 0,
    synchedItems: 0,
    
    
    // Synchronize all relevant data to and from server
    refreshAppMeta: function() {
      if (Server.synching) {
        return;
      }
      Server.synching = true;
      Data.list(Table.Synch, null, loadSynchData);
    },
    
    
    // Load synch data from server
    loadSynchData: function(synchEntries) {
      Server.synchItems = synchEntries.length;
      var item = {};
      var data = {};
      var objName = '';
      for (var i = 0; i < Server.synchItems; i++) {
        item = synchEntries.item(i);
        objName = Data.tableMap[synchEntries.table];
        Data.listSynchData(Table[objName], function(synchData) {
          Server.post('synch', {
            'table': synchEntries.table,
            'data': synchData
          }, function(jsonp) {
            Server.synchedItems++;
            
            // Update local entries with relevant server id's
            for (var ind in jsonp.Data.Feedback) {
              data = jsonp.Data.Feedback[ind];
              Data.save(Table[objName], data['id'], {
                'sid': data['sid'],
                'synchdate': jsonp.Result['synch_datetime']
              });
            }
            
            // Create new entries as provided by server
            for (var ind in jsonp.Data.Create) {
              data = jsonp.Data.Create[ind];
              data['synchdate'] = jsonp.Result['synch_datetime'];
              Data.save(Table[objName], null, data);
            }
            
            // Update existing entries
            for (var ind in jsonp.Data.Update) {
              data = jsonp.Data.Update[ind];
              data['synchdate'] = jsonp.Result['synch_datetime'];
              Data.save(Table[objName], {'sid': data.sid}, data);
            }
            
            // Remove existing entries
            for (var ind in jsonp.Data.Remove) {
              data = jsonp.Data.Remove[ind];
              data['synchdate'] = jsonp.Result['synch_datetime'];
              Data.save(Table[objName], {'sid': data.sid});
            }
            
            // Cleanup
            if (Server.synchedItems >= Server.synchItems) {
              Server.synchItems = 0;
              Server.synchItsynchedItemsems = 0;
              Server.synching = false;
            }
          }, function(err) {
            Server.synchedItems++;
            Notify.alert('Oops', 'Could nto collect required data for synchronizing to server.');
            if (Server.synchedItems >= Server.synchItems) {
              Server.synchItems = 0;
              Server.synchItsynchedItemsems = 0;
              Server.synching = false;
            }
          });
        });
      }
    },
    
    
    // Load html, css and js from server directly into view
    loadContent: function(target, page) {
      Server.post(page, {}, function(jsonp) {
        if (jsonp.html) {
          $('#' + target).html(jsonp.html);
        }
        if (jsonp.js) {
          eval(jsonp.js);
        }
      }, function(jqXHR, textStatus, errorThrown) {
        Notify.alert('Oops', 'Could not load requested content from server.');
      });
    },
    
    
    // Ajax post helper
    post: function(action, data, callback, errorCallback) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: Config.serviveNode + action,
        data: data,
        success: callback,
        error: errorCallback
      });
    }
    
};
