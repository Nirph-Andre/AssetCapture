
var Location = {
    
    // Scan a barcode
    getPosition: function(callback, errorCallback) {
      try {
        navigator.geolocation.getCurrentPosition(function(result) {
          alert("We got a position\n" +
                "Lat: " + result.coords.latitude + "\n" +
                "Long: " + result.coords.longitude + "\n" +
                "Acc: " + result.coords.accuracy);
          alert(JSON.stringify(result));
          Server.addressFromCoordinates(result.coords.latitude, result.coords.longitude, function(data) {
            alert(JSON.stringify(data));
          });
        }, function(error) {
          alert("Scanning failed: " + error);
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not do scan: ' + err.message);
      }
    }
    
};
