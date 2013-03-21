
var Config = {
    dbName: 'AssetCapture',
    dbDisplayName: 'Asset Capture',
    dbVersion: '1.0',
    dbSize: 1000000,
    serviveNode: 'http://qac.nirphrdp.com/api/',
    data: {},
    setData: function(data) {
      Config.data = data;
      for (var i = 0; i < data; i++) {
        Config.data[synchEntries.item(i).name] = synchEntries.item(i).value;
      }
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
