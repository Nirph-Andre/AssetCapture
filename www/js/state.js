
// Collections
var Process = {};


// Application state management
var WM = {
    
    // Map processes to object names
    procMap: {},
    
    

    
    // ****************************** MODELS ********************************* //
    // Table model
    process: function (objName, procName) {
      State.procMap[procName] = objName;
      this.objName = objName;
      this.name = procName;
      this.hooks = {'init': [], 'done': [], 'fail': []};
      this.onInit = function (callback) {
        this.hooks.init[] = callback;
      };
      this.onDone = function (callback) {
        this.hooks.done[] = callback;
      };
      this.onFail = function (callback) {
        this.hooks.fail[] = callback;
      };
      this.trigger = function(event, data) {
        for (var ind in this.hooks[event]) {
          (this.hooks[event][ind])(event, data);
        }
      };
    }
    
    
};


var Work_ = {
    
    procs: {},
    switches: {}
    
};


var Work_.Main = new WM.work_('Main')
  .addState('Loading', 'Initializing Application', WM.STATE_CRITICAL)
  .addState('Exception', 'Critical error occured, application terminating.', WM.STATE_EXCEPTION)
  .addState('Synchronizing', 'Synchronizing important data.', WM.STATE_NOTICE)
  .addState('Exiting', 'Closing Application', WM.STATE_CRITICAL)
  .addProcess('Init', [
     function (_) { // action
       _.setState('Loading');
       // do some stuff
     },
     function (_) { // action
       _.call(Location.getCoords, {});
     },
     function (_) { // action
       
     }
   ], function (_) { // switch
    switch (_.status) {
      case 'ok':
        return 'SetLayout'; break;
      default:
        return 'Exit'; break;
    }
  })
  .addProcess('SetLayout', [
     function (_) { // action
       
     },
     function (_) { // action
       
     },
     function (_) { // action
       
     }
   ], function (_) { // switch
    
  })
  .addProcess('Exit', [
      function (_) { // action
        _.setState('Exiting');
        // do some cleanup stuff
      }
    ], function (_) { // switch
     App.quit();
   });

// All public system calls must use this format
var moo = function(_i, params) {
  try
  {
    // Run some code here
    // when done
    _f.done(_i, {datapacket});
    // or
    _f.fail(_i, errorMessage, {errorData});
  }
  catch(err)
  {
    // Handle errors here
    // when done
    _f.exception(_i, errorMessage, {errorData});
  }
};

var _f = {
    
    _tid: 0,
    _pid: 0,
    _triggers: {},
    _completed: {},
    
    
    _check: function () {
      for (var _t in _f._triggers) {
        var allDone = true;
        var packets = {};
        var pid = [];
        for (var _i in _f._triggers[_t].pid) {
          if (typeof _f._completed[_i] == 'undefined') {
            allDone = false;
          } else if (allDone) {
            packets[_f._triggers[_t].id] = _f._completed[_i];
          }
          pid.push(_i);
        }
        if (allDone) {
          _f._triggers[_t].callback(packets, _f._triggers[_t].params);
          delete _f._triggers[_t];
          for (var i in pid) {
            var _i = pid[i];
            delete _f._completed[_i];
          }
        }
      }
    },
    
    
    call: function (id, method, methodParams, callback, callbackParams) {
      var _i = "i" + _f._pid++;
      var _t = "t" + _f._tid++;
      _f._triggers[_t] = {"id": id, "pid": [_i], "callback": callback, "params": callbackParams};
      method(_i, methodParams);
    },
    
    stack: function (id, methods, callback, callbackParams) {
      var pid = [];
      var stack = {};
      for (var ind in methods) {
        var _i = "i" + _f._pid++;
        stack[_i] = {"method": methods[ind][0], "params": methods[ind][1]};
        pid.push(_i);
      }
      var _t = "t" + _f._tid++;
      _f._triggers[_t] = {"id": id, "pid": pid, "callback": callback, "params": callbackParams};
      for (var _i in stack) {
        stack[_i].method(_i, stack[_i].params);
      }
    },
    
    
    done: function (_i, data) {
      _f._completed[_i] = {"ok": true, "data": data};
      _f._check();
    },
    fail: function (_i, error, errorData) {
      _f._completed[_i] = {"ok": false, "error": error, "errorData": errorData};
      _f._check();
    },
    exception: function (_i, error, errorData) {
      _f._completed[_i] = {"ok": false, "error": error, "errorData": errorData};
      _f._check();
    }
    
};

/*
App.bla();
Notify.moo();
Location.bar();
App.loadPage();
User.input();



*/