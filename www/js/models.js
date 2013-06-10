


Table.Config = new Data.model('Config', 'x_config', {
  'name': EM.attr('string', {required: true, maxLength: 250}),
  'value': EM.attr('string', {required: true, maxLength: 250})
});

Table.Synch = new Data.model('Synch', 'x_synch', {
  'table': EM.attr('string', {required: true, maxLength: 100}),
  'mode': EM.attr('tinyint', {required: true}),
  'filter': EM.attr('string', {maxLength: 100}),
  'local_time': EM.attr('datetime', {}),
  'server_time': EM.attr('datetime', {})
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




Table.Location = new Data.model('Location', 'location', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Town = new Data.model('Town', 'town', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'location_id': EM.belongsTo(Table.Location, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Street = new Data.model('Street', 'street', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'town_id': EM.belongsTo(Table.Town, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Building = new Data.model('Building', 'building', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'location_id': EM.belongsTo(Table.Location, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Floor = new Data.model('Floor', 'floor', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'building_id': EM.belongsTo(Table.Building, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Room = new Data.model('Room', 'room', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'floor_id': EM.belongsTo(Table.Floor, {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.AssetType = new Data.model('AssetType', 'asset_type', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.AssetSubType = new Data.model('AssetSubType', 'asset_sub_type', {
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

Table.StreetLightType = new Data.model('StreetLightType', 'street_light_type', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Condition = new Data.model('Condition', 'condition', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Owner = new Data.model('Owner', 'owner', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Asset = new Data.model('Asset', 'asset', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'location_id': EM.belongsTo(Table.Location, {required: true}),
  'town_id': EM.belongsTo(Table.Town, {required: true}),
  'street_id': EM.belongsTo(Table.Street, {required: false}),
  'building_id': EM.belongsTo(Table.Building, {required: false}),
  'floor_id': EM.belongsTo(Table.Floor, {required: false}),
  'room_id': EM.belongsTo(Table.Room, {required: false}),
  'previous_town_id': EM.belongsTo(Table.Town, {required: true}),
  'previous_street_id': EM.belongsTo(Table.Street, {required: false}),
  'previous_building_id': EM.belongsTo(Table.Building, {required: false}),
  'previous_floor_id': EM.belongsTo(Table.Floor, {required: false}),
  'previous_room_id': EM.belongsTo(Table.Room, {required: false}),
  'owner_id': EM.belongsTo(Table.Owner, {required: true}),
  'gps_relative': EM.attr('tinyint', {required: false}),
  'gps_accuracy': EM.attr('string', {required: false, maxLength: 50}),
  'gps_lat': EM.attr('string', {required: false, maxLength: 50}),
  'gps_long': EM.attr('string', {required: false, maxLength: 50}),
  'identifier': EM.attr('string', {required: true, maxLength: 100}),
  'asset_type_id': EM.hasOne(Table.AssetType, {required: true}),
  'asset_sub_type_id': EM.hasOne(Table.AssetSubType, {required: true}),
  'asset_description_id': EM.hasOne(Table.AssetDescription, {required: true}),
  'asset_sub_description_id': EM.hasOne(Table.AssetSubDescription, {required: false}),
  'details': EM.attr('string', {required: true, maxLength: 250}),
  'material_id': EM.hasOne(Table.Material, {required: false}),
  'pole_length_id': EM.hasOne(Table.PoleLength, {required: false}),
  'street_light_type_id': EM.hasOne(Table.StreetLightType, {required: false}),
  'condition_id': EM.hasOne(Table.Condition, {required: false}),
  'previous_condition_id': EM.hasOne(Table.Condition, {required: false})
});

Table.Photo = new Data.model('Photo', 'photo', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'asset_id': EM.belongsTo(Table.Asset, {required: true}),
  'type': EM.attr('string', {required: true, maxLength: 100}),
  'data': EM.attr('string', {required: false, maxLength: 250})
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
