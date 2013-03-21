
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
    addSlashes: function(str) {
      str = str
        .replace(/\\/g,'\\\\')
        .replace(/\'/g,'\\\'')
        .replace(/\"/g,'\\"')
        .replace(/\0/g,'\\0');
      return str;
    },
    
    
    // Unescape a string
    stripSlashes: function(str) {
      str = str
        .replace(/\\'/g,'\'')
        .replace(/\\"/g,'"')
        .replace(/\\0/g,'\0')
        .replace(/\\\\/g,'\\');
      return str;
    }
    
};
