var _ = require('underscore');

module.exports = function createElements( elementType, dataArray, dataPropName, keyProp ){
  return _.map(dataArray,function(data,ix){
    var props = {};
    if( keyProp ){
      props.key = data[keyProp];
    }else{
      props.key = ix;
    }
    props[dataPropName] = data;
    return React.createElement(elementType, props);
  });
}
