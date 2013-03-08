
var Barcode = {
    
    // Database object
    scanner: null,
    
    
    // Scan a barcode
    scan: function(callback, errorCallback) {
      try {
        window.plugins.barcodeScanner.scan(function(result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format); 
          alert(JSON.stringify(result));
        }, function(error) {
          alert("Scanning failed: " + error);
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not do scan: ' + err.message);
      }
    }
    
};
