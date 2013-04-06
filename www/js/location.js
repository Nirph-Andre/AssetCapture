
var Location = {

    // Get current GPS coordinates
    getPosition: function(callback, errorCallback) {
      callback(0, 0, false);
      try {
        navigator.geolocation.getCurrentPosition(function(result) {
          callback(result.coords.latitude, result.coords.longitude, result.coords.accuracy);
          /*Server.addressFromCoordinates(result.coords.latitude, result.coords.longitude, function(data) {
            alert(JSON.stringify(data));
          });*/
        }, function(error) {
          if (typeof errorCallback != 'undefined') {
            errorCallback(error);
          } else {
            Notify.alert('Oops', 'GPS call failed: ' + error);
          }
        }, {
          maximumAge: 3000,
          timeout: 5000,
          enableHighAccuracy: true
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not do GPS call: ' + err.message);
      }
    }

};
