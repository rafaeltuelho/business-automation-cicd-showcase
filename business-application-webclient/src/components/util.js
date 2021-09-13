import _ from 'lodash';

export function loadFromLocalStorage(key, parseJson = false) {
    console.debug('loading ' + key + ' from Browser\'s local storage...');
    const rawObj = localStorage.getItem(key);
    const strObj = JSON.parse(rawObj);
    if (rawObj) {
      console.log(key + ' loaded from local storage!');
      console.debug(strObj);
    }
    else {
      console.info(key + ' not found in the Browser\'s local storage!');
    }

    // console.debug('return JSON parsed? ' + parseJson)
    return parseJson ? strObj : rawObj;
}

export function stringifyValue(rawValue) {
  let str = '';
  // console.debug('util.stringifyValue(rawValue)', rawValue);
  str = _.toString(rawValue);
  if (!_.isNull(rawValue)) {
    if (_.isNumber(rawValue)) {
      if (_.isInteger(rawValue)) {
        // try to convert to date/time
        const integer = _.toInteger(rawValue);
        // see https://en.wikipedia.org/wiki/Unix_time
        if (_.toInteger(rawValue) >= 18000000 && _.toInteger(rawValue) <= 2147490000000) {
          str = _.toString(new Date(integer));
        }
      }
      else {
        str = _.toNumber(rawValue).toFixed(2);
      }
    }
  }
  //console.debug('util.stringifyValue(str)', str);

  return str;
}

export function removeLastSlash(str) {
  return str.endsWith('/') ? str.substr(0, str.length-1) : str;
}

export default { loadFromLocalStorage, stringifyValue, removeLastSlash }