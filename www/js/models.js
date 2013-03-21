
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

Table.Moveable = new Data.model('Moveable', 'moveable', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'location': EM.attr('string', {required: true, maxLength: 100}),
  'identifier': EM.attr('string', {required: true, maxLength: 100}),
  'type': EM.attr('string', {required: true, maxLength: 100}),
  'sub_type': EM.attr('string', {required: true, maxLength: 100}),
  'description': EM.attr('string', {required: true, maxLength: 100})
});

Table.Infrastructure = new Data.model('Infrastructure', 'infrastructure', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'location': EM.attr('string', {required: true, maxLength: 100}),
  'identifier': EM.attr('string', {required: true, maxLength: 100}),
  'type': EM.attr('string', {required: true, maxLength: 100}),
  'sub_type': EM.attr('string', {required: true, maxLength: 100}),
  'description': EM.attr('string', {required: true, maxLength: 100})
});

Table.Profile = new Data.model('Profile', 'profile', {
  'company': EM.belongsTo('Company', {required: true}),
  'name': EM.attr('string', {required: true, maxLength: 100}),
  'surname': EM.attr('string', {required: true, maxLength: 100}),
  'app_access_type': EM.hasOne('AppAccessType', {required: true}),
  'app_access_times': EM.hasMany('AppAccessTime', {})
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
