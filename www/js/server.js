
var Server = {

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
      Server.getUri(
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
              errorCallback(errorThrown);
            } else {
              Notify.alert('Oops', 'Could not load address data from geocode api.');
            }
          }
      );
    },


    // Ajax post helper
    post: function(action, data, callback, errorCallback, asynch) {
    	asynch = (asynch !== 'undefined')
    		? asynch
    		: true;
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: Config.serviceNode + action,
        data: JSON.stringify(data),
        async: asynch
      })
      .done(callback)
      .fail(function(jqXHR, textStatus, errorThrown) {
        if (errorCallback !== 'undefined')  {
          errorCallback(jqXHR, textStatus, errorThrown);
        } else {
          Notify.alert('Oops', 'Could not talk to server: ' + errorThrown);
        }
      });
    },


    // Ajax get helper
    get: function(action, data, callback, errorCallback, asynch) {
    	asynch = (asynch !== 'undefined')
		? asynch
		: true;
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: Config.serviceNode + action,
        data: JSON.stringify(data),
        async: asynch
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


    // Ajax post helper
    postUri: function(uri, data, callback, errorCallback) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: uri,
        data: JSON.stringify(data)
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
    getUri: function(uri, data, callback, errorCallback) {
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: uri,
        data: JSON.stringify(data)
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
