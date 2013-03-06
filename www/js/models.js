
Table.Content = new Data.model('Content', 'x_content', {
  'type': EM.attr('string', {required: true, maxLength: 25}),
  'name': EM.attr('string', {required: true, maxLength: 250}),
  'html': EM.attr('text', {}),
  'js': EM.attr('text', {}),
  'updated': EM.attr('datetime', {})
});

Table.Synch = new Data.model('Synch', 'x_synch', {
  'table': EM.attr('string', {required: true, maxLength: 100}),
  'mode': EM.attr('tinyint', {required: true}),
  'local_time': EM.attr('datetime', {}),
  'server_time': EM.attr('datetime', {})
});

Table.Asset = new Data.model('Asset', 'asset', {
  'sid': EM.attr('int', {}),
  'synchdate': EM.attr('datetime', {}),
  'type': EM.attr('string', {required: true, maxLength: 100}),
  'name': EM.attr('string', {required: true, maxLength: 100})
});

Table.Profile = new Data.model('Profile', 'profile', {
  'company': EM.belongsTo('Company', {required: true}),
  'name': EM.attr('string', {required: true, maxLength: 100}),
  'surname': EM.attr('string', {required: true, maxLength: 100}),
  'app_access_type': EM.hasOne('AppAccessType', {required: true}),
  'app_access_times': EM.hasMany('AppAccessTime', {})
});

Table.Contact = new Data.model('Contact', 'contact', {
  'name': EM.attr('string', {required: true, maxLength: 100}),
  'surname': EM.attr('string', {required: true, maxLength: 100}),
  'mobile': EM.attr('int', {required: true, maxLength: 16})
});

Entity.Profile = new Data.entity({
  'root': 'Profile',
  'parent': 'Dealer',
  'relations': ['Title', {
    'table': 'UserType',
    'relations': ['AppAccessType'],
    'children': ['AppAccessTime']
  }],
  'children': ['Permissions']
});
