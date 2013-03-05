
Table.Content = new Data.model('x_content', {
  'type': EM.attr('string', {required: true, maxLength: 25}),
  'name': EM.attr('string', {required: true, maxLength: 250}),
  'html': EM.attr('text', {}),
  'js': EM.attr('text', {})
});

Table.Profile = new Data.model('profile', {
  'company': EM.belongsTo('Company', {required: true}),
  'name': EM.attr('string', {required: true, maxLength: 100}),
  'surname': EM.attr('string', {required: true, maxLength: 100}),
  'app_access_type': EM.hasOne('AppAccessType', {required: true}),
  'app_access_times': EM.hasMany('AppAccessTime', {})
});

Table.Contact = new Data.model('contact', {
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
