
var Server = {
    contentStoreUpdated: false,
    dataStoreUpdated: false,
    refreshAppMeta: function() {
      if (!Server.contentStoreUpdated) {
        Data.getLastChangeTime(Table.Content, this.loadContentStore);
      }
    },
    loadContentStore: function(dTime) {
      Server.post('load-content-store', {
        'last_change': dTime
      }, function(jsonp) {
        var index = 0;
        if (jsonp.create) {
          for (index in jsonp.create) {
            Data.save(Table.Content, null, jsonp.create[index]);
          }
        }
        if (jsonp.update) {
          for (index in jsonp.update) {
            Data.save(Table.Content, jsonp.update[index]['id'], jsonp.update[index]);
          }
        }
        Server.contentStoreUpdated = true;
      }, function(jqXHR, textStatus, errorThrown) {
        Notify.alert('Oops', 'Could not retrieve application data from server.');
      });
    },
    loadContent: function(target, page) {
      Server.post(page, {}, function(jsonp) {
        if (jsonp.html) {
          $('#' + target).html(jsonp.html);
        }
        if (jsonp.js) {
          eval(jsonp.js);
        }
      }, function(jqXHR, textStatus, errorThrown) {
        Notify.alert('Oops', 'Could not load requested content from server.');
      });
    },
    post: function(action, data, callback, errorCallback) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: Config.serviveNode + action,
        data: data,
        success: callback,
        error: errorCallback
      });
    }
};
