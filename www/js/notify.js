
var Notify = {

    // State data
    staticNotificationVisible: false,


    // Friendly non-static user notification
    alert: function(title, message, button, callback) {
      navigator.notification.alert(
          message,
          callback,
          title,
          button ? button : 'OK'
      );
    },


    // Pretty static user notification
    notifyStatic: function(note, blink, id) {
      note = note ? note : 'LOADING';
      $('#modalStaticNotifyContent').removeClass('blink');
      if (blink || 'LOADING' == note) {
        $('#modalStaticNotifyContent').addClass('blink');
      }
      if (id) {
    	  $('#staticNote' + id).remove();
    	  $('#modalStaticNotifyContent').append('<span id="staticNote' + id + '"><br/>' + note + '</span>');
      } else {
    	  $('#modalStaticNotifyContent').html(note);
      }
      if (!Notify.staticNotificationVisible) {
        $('#modalStaticNotify').modal('toggle');
        Notify.staticNotificationVisible = true;
      }
    },


    // Remove notification sub-element
    removeStatic: function(id) {
    	$('#staticNote' + id).remove();
    },


    // Disable static notification
    hideStatic: function() {
      if (Notify.staticNotificationVisible) {
        $('#modalStaticNotify').modal('toggle');
        Notify.staticNotificationVisible = false;
      }
    }
};
