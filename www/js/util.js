
var Util = {
    
    // Event status convenience
    setEventInfo: function(id, status, evtClass) {
      $('#' + id).removeClass('processing');
      $('#' + id).removeClass('ready');
      $('#' + id).removeClass('problem');
      $('#' + id).addClass(evtClass);
      $('#' + id).html(status);
    },
    
    
    // Toggle loader popup
    toggleLoader: function(note, blink) {
      note = note ? note : 'LOADING';
      $('#modalStaticNotifyContent').removeClass('blink');
      if (blink || 'LOADING' == note) {
        $('#modalStaticNotifyContent').addClass('blink');
      }
      $('#modalStaticNotifyContent').html(note);
      $('#modalStaticNotify').modal('toggle');
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
    }
    
};
