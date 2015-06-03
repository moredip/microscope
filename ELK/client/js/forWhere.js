var _ = require('underscore');

module.exports = function forWhere(collection,properties,operation){
  var subject = _.findWhere(collection,properties);
  if( typeof subject !== 'undefined' ){
    operation(subject);
  }
};
