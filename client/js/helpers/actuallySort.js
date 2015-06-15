module.exports = actuallySort;

// oh javascript
function numericCompare(a,b){ return a-b; }
function actuallySort(array){ 
  return array.sort( numericCompare );
}
