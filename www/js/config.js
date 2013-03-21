
var Config = {
    dbName: 'AssetCapture',
    dbDisplayName: 'Asset Capture',
    dbVersion: '1.0',
    dbSize: 1000000,
    serviveNode: 'http://qac.nirphrdp.com/api/',
    data: {},
    setData: function(data) {
      for (var i in data) {
        Config.data[data[i].name] = Data.stripSlashes(data[i].value);
      }
      App.configReady();
    },
    setDataItem: function(name, value) {
      Data.view(Table.Config, null, {'name': name}, function(data) {
        var id = null;
        if (data.length) {
          id = data.id
        }
        Data.save(Table.Config, id, {'name': name, 'value': value});
      });
      Config.data[name] = value;
    }
};
