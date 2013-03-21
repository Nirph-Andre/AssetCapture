
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
      alert('addSlashes to ' + str);
      str = str.replace(/\\/g,'\\\\');
      str = str.replace(/\'/g,'\\\'');
      str = str.replace(/\"/g,'\\"');
      str = str.replace(/\0/g,'\\0');
      alert('addSlashes result ' + str);
      return str;
    },
    
    
    // Unescape a string
    stripSlashes: function(str) {
      str = str.replace(/\\'/g,'\'');
      str = str.replace(/\\"/g,'"');
      str = str.replace(/\\0/g,'\0');
      str = str.replace(/\\\\/g,'\\');
      return str;
    }
    
};
