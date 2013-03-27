
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
      input = input
        .replace(/'/g, "\'")
        .replace(/"/g, '\"');
      return input;
    },
    
    
    // Unescape a string
    stripSlashes: function(input) {
      if (typeof(input) != 'string') {
        return input;
      }
      input = input
        .replace(/\'/g, "'")
        .replace(/\"/g,'"');
      return input;
    },
    
    populateSelect: function(target, instruction, data, selected) {
      var opts = instruction
        ? '<option value="">-- ' + instruction + ' --</option>'
        : '';
      for (var i in data) {
        var chosen = (selected == i) ? ' selected' : '';
        opts += '<option value="' + i + '"' + chosen + '>' + data[i] + '</option>';
      }
      $('#' + target).html(opts);
    }
    
};
