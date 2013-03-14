
var Server = {
    
    // Status data
    synching: false,
    synchItems: 0,
    synchedItems: 0,
    
    
    // Synchronize all relevant data to and from server
    refreshAppMeta: function(callback, errorCallback) {
      if (Server.synching) {
        return;
      }
      if (!App.online) {
        App.connectionRequired();
        return;
      }
      Server.synching = true;
      App.setState('Loading', 'Synchronizing application data.');
      Data.list(Table.Synch, {}, function(data) {
        Server.loadSynchData(data, callback, errorCallback);
      });
    },
    
    
    // Load synch data from server
    loadSynchData: function(synchEntries, callback, errorCallback) {
      Server.synchItems = synchEntries.length;
      var item = {};
      var data = {};
      var objName = '';
      var filter = {};
      for (var i = 0; i < Server.synchItems; i++) {
        item = synchEntries.item(i);
        objName = Data.tableMap[item.table];
        filter = {};
        if (item.filter && item.filter.length) {
          filter[item.filter] = Config.data[item.filter] ? Config.data[item.filter] : null;
        }
        Data.listSynchData(Table[objName], function(synchData) {
          alert('list synch');
          Server.post('synch', {
            'table': item.table,
            'filter': filter,
            'data': synchData
          }, function(jsonResult) {
            alert('3');
            // Update local entries with relevant server id's
            for (var ind in jsonResult.Data.Feedback) {
              data = jsonResult.Data.Feedback[ind];
              Data.save(Table[objName], data['id'], {
                'sid': data['sid'],
                'synchdate': jsonResult.Result['synch_datetime']
              });
            }

            alert('4');
            // Create new entries as provided by server
            for (var ind in jsonResult.Data.Create) {
              data = jsonResult.Data.Create[ind];
              data['synchdate'] = jsonResult.Result['synch_datetime'];
              Data.save(Table[objName], null, data);
            }

            alert('5');
            // Update existing entries
            for (var ind in jsonResult.Data.Update) {
              data = jsonResult.Data.Update[ind];
              data['synchdate'] = jsonResult.Result['synch_datetime'];
              Data.save(Table[objName], {'sid': data.sid}, data);
            }

            alert('6');
            // Remove existing entries
            for (var ind in jsonResult.Data.Remove) {
              data = jsonResult.Data.Remove[ind];
              data['synchdate'] = jsonResult.Result['synch_datetime'];
              Data.save(Table[objName], {'sid': data.sid});
            }

            alert('7');
            // Cleanup
            Server.synchedItems++;
            if (Server.synchedItems >= Server.synchItems) {
              alert('8');
              Server.synchItems = 0;
              Server.synchItsynchedItemsems = 0;
              Server.synching = false;
              App.setState();
              App.synchComplete();
              if (typeof callback != 'undefined') {
                callback();
              }
            }
          }, function(jqXHR, textStatus, errorThrown) {
            alert('9');
            Server.synchedItems++;
            Notify.alert('Oops', 'Could not collect required data for synchronizing to server.');
            App.setState('Error', 'Could not collect required data for synchronizing to server: ' + textStatus);
            if (Server.synchedItems >= Server.synchItems) {
              Server.synchItems = 0;
              Server.synchItsynchedItemsems = 0;
              Server.synching = false;
              App.synchFail();
              if (typeof errorCallback != 'undefined') {
                errorCallback(err);
              }
            }
          });
        });
      }
    },
    
    
    // Load html, css and js from server directly into view
    loadContent: function(target, page) {
      Server.post(page, {}, function(jsonResult) {
        if (jsonResult.html) {
          $('#' + target).html(jsonResult.html);
        }
        if (jsonResult.js) {
          eval(jsonResult.js);
        }
      }, function(jqXHR, textStatus, errorThrown) {
        Notify.alert('Oops', 'Could not load requested content from server.');
      });
    },
    
    
    // Reverse geocode lookup on yahoo geocode api
    addressFromCoordinates: function(lat, long, callback, errorCallback) {
      var url = 'http://where.yahooapis.com/geocode?location='
              + lat + ',' + long + '&gflags=R&flags=J';
      Server.get(
          url, {}, function(jsonResult) {
            if (jsonResult) {
              if (jsonResult.ResultSet.Found == 0) {
                if (typeof callback != 'undefined') {
                  callback({
                    'city': false,
                    'neighborhood': false,
                    'street': false,
                    'code': false,
                    'lat': lat,
                    'long': long
                  });
                }
              } else {
                var addr = jsonResult.ResultSet.Results.shift();
                if (typeof callback != 'undefined') {
                  callback({
                    'city': addr.city,
                    'neighborhood': addr.neighborhood,
                    'street': addr.street,
                    'code': addr.postal,
                    'lat': lat,
                    'long': long
                  });
                }
              }
            }
          }, function(jqXHR, textStatus, errorThrown) {
            if (typeof errorCallback != 'undefined') {
              errorCallback(textStatus);
            } else {
              Notify.alert('Oops', 'Could not load address data from geocode api.');
            }
          }
      );
    },
    
    
    // Ajax post helper
    post: function(action, data, callback, errorCallback) {
      alert('post call to ' + Config.serviveNode + action);
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: Config.serviveNode + action,
        data: data
      })
      .done(callback)
      .fail(function(jqXHR, textStatus, errorThrown) {
        if (errorCallback !== 'undefined')  {
          errorCallback(jqXHR, textStatus, errorThrown);
        } else {
          Notify.alert('Oops', 'Could not talk to server: ' + textStatus);
        }
      });
    },
    
    // Ajax get helper
    get: function(uri, data, callback, errorCallback) {
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: uri,
        data: data
      })
      .done(callback)
      .fail(function(jqXHR, textStatus, errorThrown) {
        if (errorCallback !== 'undefined')  {
          errorCallback(jqXHR, textStatus, errorThrown);
        } else {
          Notify.alert('Oops', 'Could not talk to server: ' + textStatus);
        }
      });
    }
    
};
