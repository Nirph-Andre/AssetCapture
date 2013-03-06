
var Barcode = {
    
    // Database object
    scanner: null,
    
    
    // Initialize scanner
    scan2: function() {
      try {
        Barcode.scanner = PhoneGap.require("cordova/plugin/BarcodeScanner");
      } catch(err) {
        Notify.alert('Oops', 'Could not load scanner plugin: ' + err.message);
      }
    },
    
    
    // Scan a barcode
    scan: function(callback, errorCallback) {
      try {
        window.plugins.barcodeScanner.scan(function(result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format); 
        }, function(error) {
          alert("Scanning failed: " + error);
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not do scan: ' + err.message);
      }
    }
    
};
