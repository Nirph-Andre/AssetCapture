
var Util = {
    
    // Event status convenience
    setEventInfo: function(id, status, evtClass) {
      $('#' + id).removeClass('processing');
      $('#' + id).removeClass('ready');
      $('#' + id).removeClass('problem');
      $('#' + id).addClass(evtClass);
      $('#' + id).html(status);
    },
    
    
    // Current date-time convenience
    getCurrentDateTime: function() {
      var currentdate = new Date(); 
      return currentdate.getFullYear() + "-"
              + (currentdate.getMonth()+1)  + "-" 
              + currentdate.getDate() + " "  
              + currentdate.getHours() + ":"  
              + currentdate.getMinutes() + ":" 
              + currentdate.getSeconds();
    },
    
    
    // Escape a string
    addSlashes: function(input) {
      if (typeof(input) != 'string') {
        return input;
      }
      alert('addSlashes input: ' + input);
      input = input
        .replace(/\\/g,'\\\\')
        .replace(/\'/g,'\\\'')
        .replace(/\"/g,'\\"')
        .replace(/\0/g,'\\0');
      alert('addSlashes result: ' + input);
      return input;
    },
    
    
    // Unescape a string
    stripSlashes: function(input) {
      if (typeof(input) != 'string') {
        return input;
      }
      input = input
        .replace(/\\'/g,'\'')
        .replace(/\\"/g,'"')
        .replace(/\\0/g,'\0')
        .replace(/\\\\/g,'\\');
      return input;
    }
    
};
