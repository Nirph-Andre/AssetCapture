
var Notify = {
    // Friendly non-blocking user notification
    alert: function(title, message, button, callback) {
      navigator.notification.alert(
          message,
          callback,
          title,
          button ? button : 'OK'
      );
    }
};
