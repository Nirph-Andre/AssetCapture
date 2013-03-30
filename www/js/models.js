


Table.Config = new Data.model('Config', 'x_config', {
  'name': EM.attr('string', {required: true, maxLength: 250}),
  'value': EM.attr('string', {required: true, maxLength: 250})
});

Table.Content = new Data.model('Content', 'x_content', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'type': EM.attr('string', {required: true, maxLength: 25}),
  'name': EM.attr('string', {required: true, maxLength: 250}),
  'html': EM.attr('text', {}),
  'js': EM.attr('text', {}),
  'updated': EM.attr('datetime', {})
});

Table.Synch = new Data.model('Synch', 'x_synch', {
  'table': EM.attr('string', {required: true, maxLength: 100}),
  'mode': EM.attr('tinyint', {required: true}),
  'filter': EM.attr('string', {maxLength: 100}),
  'local_time': EM.attr('datetime', {}),
  'server_time': EM.attr('datetime', {})
});




Table.Location = new Data.model('Location', 'location', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.AssetType = new Data.model('AssetType', 'asset_type', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.AssetSubType = new Data.model('AssetType', 'asset_sub_type', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'asset_type_id': EM.belongsTo(Table.AssetType, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.AssetDescription = new Data.model('AssetDescription', 'asset_description', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'asset_sub_type_id': EM.belongsTo(Table.AssetSubType, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.AssetSubDescription = new Data.model('AssetSubDescription', 'asset_sub_description', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'asset_description_id': EM.belongsTo(Table.AssetDescription, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Material = new Data.model('Material', 'material', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.PoleLength = new Data.model('PoleLength', 'pole_length', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Asset = new Data.model('Asset', 'asset', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'location': EM.attr('string', {required: true, maxLength: 100}),
  'town': EM.attr('string', {required: true, maxLength: 100}),
  'street': EM.attr('string', {required: true, maxLength: 100}),
  'gps_relative': EM.attr('tinyint', {required: true, maxLength: 100}),
  'gps_lat': EM.attr('string', {required: true, maxLength: 50}),
  'gps_long': EM.attr('string', {required: true, maxLength: 50}),
  'identifier': EM.attr('string', {required: true, maxLength: 100}),
  'asset_type': EM.attr('string', {required: true, maxLength: 100}),
  'asset_sub_type': EM.attr('string', {required: true, maxLength: 100}),
  'asset_description': EM.attr('string', {required: true, maxLength: 100}),
  'asset_sub_description': EM.attr('string', {required: true, maxLength: 100}),
  'material': EM.attr('string', {required: true, maxLength: 100}),
  'length': EM.attr('string', {required: true, maxLength: 100}),
  'other_info': EM.attr('string', {required: true, maxLength: 100}),
  'condition': EM.attr('string', {required: true, maxLength: 100})
});




/*Entity.Profile = new Data.entity({
  'root': 'Profile',
  'parent': 'Dealer',
  'relations': ['Title', {
    'table': 'UserType',
    'relations': ['AppAccessType'],
    'children': ['AppAccessTime']
  }],
  'children': ['Permissions']
});*/
