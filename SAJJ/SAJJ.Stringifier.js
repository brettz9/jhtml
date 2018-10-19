/**
* Provides JSON.stringifier()-like functionality (no replacer or space arguments currently, however).
* This class uses the abstract ObjectArrayDelegator for object/array delegating so the stringification can occur solely on the terminal methods here
* @todo Could implement our own stringifier for strings rather than using JSON.stringify
*/
let SAJJ, ObjectArrayDelegator;

(function () {
'use strict';

if (typeof exports !== 'undefined') {
  SAJJ = require('./SAJJ');
  ObjectArrayDelegator = require('./SAJJ.ObjectArrayDelegator');
}

SAJJ.createAndExport({name: 'Stringifier', exportObject: typeof module !== 'undefined' ? module : undefined, inherits: ObjectArrayDelegator, methods: {

  // JSON terminal handler methods

  // These four methods can be overridden without affecting the logic of the objectHandler and arrayHandler to utilize
  //   reporting of the object as a whole
  beginObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '{';
  },
  endObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '}';
  },
  beginArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '[';
  },
  endArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return ']';
  },

  // JSON terminal key handler methods

  objectKeyHandler (key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    return '"' + key.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '":';
  },
  arrayKeyHandler (key, parentObject, parentKey, parentObjectArrayBool) {
    return '';
  },

  // JSON terminal joiner handler methods

  objectKeyValueJoinerHandler () {
    return ',';
  },
  arrayKeyValueJoinerHandler () {
    return ',';
  },

  // JSON terminal primitive handler methods

  nullHandler (parentObject, parentKey, parentObjectArrayBool) {
    return 'null';
  },
  booleanHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return String(value);
  },
  numberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return String(value);
  },
  stringHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return JSON.stringify(value);
  },

  // JavaScript-only (non-JSON) (terminal) handler methods (not used or required for JSON mode)
  functionHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return value.toString(); // May not be supported everywhere
  },
  undefinedHandler (parentObject, parentKey, parentObjectArrayBool) {
    return 'undefined';
  },
  nonfiniteNumberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return String(value);
  }
}});
}());
