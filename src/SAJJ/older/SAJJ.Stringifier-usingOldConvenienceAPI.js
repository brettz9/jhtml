/* globals SAJJ, ObjectArrayDelegator */
/**
* Provides JSON.stringifier()-like functionality (no replacer or space arguments currently, however).
* This class uses the abstract ObjectArrayDelegator for object/array delegating so the stringification can occur solely on the terminal methods here
* @todo Could implement our own stringifier for strings rather than using JSON.stringify
*/

const Stringifier = SAJJ.createConstructor(ObjectArrayDelegator); // Convenience method to create constructor not requiring new keyword and inheriting from the designated constructor (or SAJJ when not present)

// JSON terminal handler methods

// These four methods can be overridden without affecting the logic of the objectHandler and arrayHandler to utilize
//   reporting of the object as a whole
Stringifier.prototype.beginObjectHandler = function beginObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return '{';
};
Stringifier.prototype.endObjectHandler = function endObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return '}';
};
Stringifier.prototype.beginArrayHandler = function beginArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return '[';
};
Stringifier.prototype.endArrayHandler = function endArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return ']';
};

// JSON terminal key handler methods

Stringifier.prototype.objectKeyHandler = function (key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
  return '"' + key.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '":';
};
Stringifier.prototype.arrayKeyHandler = function (key, parentObject, parentKey, parentObjectArrayBool) {
  return '';
};

// JSON terminal joiner handler methods

Stringifier.prototype.objectKeyValueJoinerHandler = function objectKeyValueJoinerHandler () {
  return ',';
};
Stringifier.prototype.arrayKeyValueJoinerHandler = function arrayKeyValueJoinerHandler () {
  return ',';
};

// JSON terminal primitive handler methods

Stringifier.prototype.nullHandler = function nullHandler (parentObject, parentKey, parentObjectArrayBool) {
  return 'null';
};
Stringifier.prototype.booleanHandler = function booleanHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return String(value);
};
Stringifier.prototype.numberHandler = function numberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return String(value);
};
Stringifier.prototype.stringHandler = function stringHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return JSON.stringify(value);
};

// JavaScript-only (non-JSON) (terminal) handler methods (not used or required for JSON mode)
Stringifier.prototype.functionHandler = function functionHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return value.toString(); // May not be supported everywhere
};
Stringifier.prototype.undefinedHandler = function undefinedHandler (parentObject, parentKey, parentObjectArrayBool) {
  return 'undefined';
};
Stringifier.prototype.nonfiniteNumberHandler = function nonfiniteNumberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
  return String(value);
};

SAJJ.exportClass(Stringifier, 'Stringifier');

export default Stringifier;
