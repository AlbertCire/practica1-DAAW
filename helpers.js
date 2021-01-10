exports.moment = require('moment');
exports.dump = (obj) => JSON.stringify(obj, null, 2);
exports.menu = [
    { slug: '/stays', title: 'Stays', },
    { slug: '/tags', title: 'Tags', },
    { slug: '/top', title: 'Top', },
    { slug: '/add', title: 'Add', },
  ];