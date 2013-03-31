
var Location = {

    // Scan a barcode
    getPosition: function(callback, errorCallback) {
      callback(0, 0, false);
      try {
        navigator.geolocation.getCurrentPosition(function(result) {
          callback(result.coords.latitude, result.coords.longitude, result.coords.accuracy);
          /*Server.addressFromCoordinates(result.coords.latitude, result.coords.longitude, function(data) {
            alert(JSON.stringify(data));
          });*/
        }, function(error) {
          Notify.alert('Oops', 'GPS call failed: ' + error);
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not do scan: ' + err.message);
      }
    }

};
