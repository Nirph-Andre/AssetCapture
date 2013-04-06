
var Barcode = {

    // Scan a barcode
    scan: function(callback, errorCallback) {
      try {
        window.plugins.barcodeScanner.scan(function(result) {
          if (result.cancelled == false) {
            callback(result.text);
          } else {
            Notify.alert("Notice", "Scanning cancelled.");
          }
        }, function(error) {
          if (typeof errorCallback != 'undefined') {
            errorCallback(message);
          } else {
            Notify.alert('Oops', 'Could not scan barcode: ' + error);
          }
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not do scan: ' + err.message);
      }
    }

};
