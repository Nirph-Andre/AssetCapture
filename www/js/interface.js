
var Interface = {
    
    currentLayout: '',
    currentPage: 'Login',
    currentContent: '',
    pageStack: [],
    listCallback: null,
    
    // Cater for phone back button
    back: function(e) {
      if ('Login' == Interface.currentPage || 'Home' == Interface.currentPage) {
        navigator.app.exitApp();
      } else {
        $('#page' + Interface.pageStack.pop()).hide();
        Interface.currentPage = Interface.pageStack.pop();
        Interface.pageStack.push(Interface.currentPage);
        $('#page' + Interface.currentPage).show();
      }
      if (typeof e != 'undefined') {
        e.preventDefault();
      }
    },
    
    // Interface Content
    loadLayout: function(name) {
      /*Data.view(Table.Content, null, {
        'type': 'layout',
        'name': name
      }, function(data) {
        $('#contentLayout').html(data.html);
        if (data.js && data.js.length) {
          eval(data.js);
        }
        App.setState();
      });*/
    },
    loadPage: function(name) {
      if ('Home' == name) {
        Interface.pageStack = ['Home'];
      } else {
        Interface.pageStack.push(name);
      }
      $('#page' + Interface.currentPage).hide();
      $('#page' + name).show();
      Interface.currentPage = name;
    },
    loadContent: function(container, name) {
      /*Data.view(Table.Content, null, {
        'type': 'content',
        'name': name
      }, function(data) {
        $('#' + container).html(data.html);
        if (data.js && data.js.length) {
          eval(data.js);
        }
        App.setState();
      });*/
    },
    
    // Select from list
    listFromTable: function(table, filter, labelField, callback) {
      Data.list(table, filter, function(data) {
        var listData = [];
        for (var i in data) {
          listData.push({"value": data[i].id, "label": data[i][labelField]});
        }
        Interface.listFromData(listData, callback);
      });
    },
    listFromData: function(data, callback) {
      Interface.listCallback = callback;
      Interface.loadPage('ListSelect');
      $('#listDataContent').html('');
      for (var i in data) {
        $('#listDataContent').append('<div><button class="btn btn-mobile-list span12" onClick="Interface.listSelect('
                                     + data[i].value + ', \'' + Util.addSlashes(data[i].label) + '\');">'
                                     + data[i].label + '</button></div>');
      }
    },
    listSelect: function(value, label) {
      Interface.back();
      Interface.listCallback(value, label);
    }
    
};