/**
* SAJJ Simple API for JSON/JavaScript objects
* This is not intended as a streaming string parser, though walkJSONString() is provided to allow it;
*  Clarinet (https://github.com/dscape/clarinet ) is more likely the better choice for such cases.
*  SAJJ, as with SAX, can be adapted to allow DOM TreeWalker-style parsing (pull or automatic cycling) or XSL-style
*  iteration (though optional whether to ultimately replace original content), e.g., for use with JsonML style
*  templates (or JsonML enhanced via full JS with event handlers); besides use cases specific to JS/JSON,
*  although could use DOM or XML strings to represent JSON and utilizing walkers available to these,
*  this would be far more cumbersome than the other way around.
* @SampleUseCases
1) Converting JavaScript structures to JSON
2) Implementing a SAX-like parser over XML-as-JSON solutions like JsonML
3) XSL-like transformations of JSON (or XML-as-JSON)
4) (Send pull request to add your own here!)
* @SampleImplementations
1) JSON.stringify()
2) (Send pull request to add your own here!)
* @DesignChoices
1) Accurate, easy to use, small, fast, memory-efficient, universal in coverage, clean code
2) Convenient (e.g., with overridable methods) but not auto-creating likely useful utilities like
  Object.keys(), Object.getOwnPropertyNames(), JSON, etc. as seems less than modular. Might reconsider
  optionally auto-exporting utilities, or adding as handler arguments, in the future, but not planning for now.
2) Context-aware (handlers to include parent objects as well as values, or JSONPaths)
3) Customizable: Ability to override/customize any functionality and allow custom types but without need for reimplementing iteration routines
4) Offer optional support of regular JavaScript objects (including those potentially representing XML/HTML with events)
5) Allow pull or auto-push reporting
6) Configuration vis-a-vis Clarinet/sax-js options:
  a) Decided for now against trim/normalize options as in Clarinet as seemed not very useful, though could be
    allowed easily in stringHandler
  b) lowercase and xmlns seem too XML-specific
  c) position has analogue in JSONPath goal
7) Decided against causing conversion to string and feeding into Clarinet as use cases of beginning
  with JSON rather than merely converting to it were too great (toward JS as main environment or even content-type).
8) Decided against Clarinet handler names as considered ugly relative to CamelCase (despite JS-event-style-familiarity)
9) Decided against passing Object.keys (or other exports of Object properties like getOwnPropertyNames)
  to beginObjectHandler/beginArrayHandler (and corresponding end methods) as auto-iteration of
  keys/values ought to address most use cases for obtaining all keys and user can do it themselves
  if needed. We did pass length of array to begin and endArrayHandler, however.
10) Have module support standard export formats
11) Demonstrate functionality by implementing JSON.stringify though provide empty version
12) Leverage knowledge of existing standard APIs where possible (e.g., DOM NodeIterator/TreeWalker APIs) with
  minimum, though adequate, adaptation (e.g., change "Node" references to "JSONValue", but otherwise keep same)
*
* @PossibleFutureTodos
1) Add references to E() in docs along with JsonML references once E() is documented
2) Once DOM methods may be available to E(), change JSONValueIterator/JSONTreeWalker to update
  logical view of the JSON structure (i.e., post-filtered), as with DOM traversal,
  when the hierarchy is modified.
3) Integrate with allowing stream input as in Clarinet?
*
* @Todos
*
0) Infinity, NaN, String, Number, Date, etc.
1) Include pull parser option (modify endHandler, delegateHandlers, arrayHandler, objectHandler?)
  0) TreeWalker whatToShow/Filter simple (Traverser, Filter) vs. all SAJJ methods by pull
  a) Iterator - return null when no more at beginning or end
  b) TreeWalker
  c) (remember to add all to exports)
  d) Fix description above about TreeWalker if implement or not
2) Add depth level @property (which could be used, e.g., by a JSON.stringify implementation)
  a) Implement JSON.stringify (without calling JSON.stringify!); if not, fix SampleImplementations above
    i) Finish array/object (call delegateHandlersByType inside keyValueHandler or in object/arrayHandler?;
      change keyValueHandlers to return commas, etc.)
    ii) avoid functions/undefined/prototype completely, and converting nonfinite to null
3) Add JSONPaths (or implement JSONPath reporting in SAJJ as in jsonPath())? XPath to TreeWalker/NodeIterator or string SAX XML? .getXPath on DOM node prototype?
4) Versions (including ones which just return to replace); make first filter option return iterator as possible with wrapping of any JSON
  a) forEach (default)
  b) filter() version with return boolean for whatToShow/filter option
  c) some()/every() (cycle through all until find)
  d) map()
  e) reduce()/reduceRight() (need prev argument for both; previousValue() method for latter);
    i) For JSON.stringify implementation, just do: prev += curr;

5) Verify design goals accurate, met, and comprehensive
6) Simplify as per http://ejohn.org/blog/unimpressed-by-nodeiterator/
7) Use DOMNodeRemoved event for NodeIterator implementation?

*/
// UTILITY CONSTRUCTORS

// Traverser
/* eslint-disable indent */
export class JSONTraverser {

  /**
  * Analogue to DOM method document.createNodeIterator
  * @param {Object} obj JSON object to iterate over
  * @param {Number} [whatToShow] Defaults to JSONFilter.SHOW_ALL
  * @param {Object|Function} [filter] Can be an object with "acceptValue()" or independent function accepting value.
  * @param {Object} [options] Additional configuration options
  * @todo Support object + JSONPath as first argument for iteration within a larger tree
  */
  createJSONValueIterator (obj, whatToShow, filter, options) {
    return new SAJJ(obj, this._buildOptions(whatToShow, filter, options, {iterator: true}));
  }
  /**
  * Analogue to DOM method document.createTreeWalker
  * @param {Object} obj JSON object to iterate over
  * @param {Number} [whatToShow] Defaults to JSONFilter.SHOW_ALL
  * @param {Object|Function} [filter] Can be an object with "acceptValue()" or independent function accepting value.
  * @param {Object} [options] Additional configuration options
  * @todo Support object + JSONPath as first argument for iteration within a larger tree
  */
  createJSONTreeWalker (obj, whatToShow, filter, options) {
    return new SAJJ(obj, this._buildOptions(whatToShow, filter, options, {treeWalker: true}));
  }
  _buildOptions (whatToShow, filter, options, configObj) {
    const newOpts = _copyObject(options || {}, true);
    newOpts.whatToShow = whatToShow;
    newOpts.filter = filter;
    for (const config in configObj) {
      newOpts[config] = configObj[config];
    }
    return newOpts;
  }
/* eslint-enable indent */
}

// TreeWalker
/* eslint-disable indent */
export class JSONTreeWalker {
  /*
  this.root;
  this.filter;
  this.whatToShow;
  this.currentValue;
  */

  nextValue () {
  }
  previousValue () {
  }

  /**
  * @todo Though parentValue may be relevant, the others below may require a property (including numeric) or properties
  * to determine child; Children and siblings may only be relevant when handling object/array itself, not keys
  * (which may not have children, and if they did, they would be on a new reportable object anyways); siblings
  * may seem relevanat to keys, but these are really just values; it may be meaningful, however, to add
  * "firstValue" and "lastValue" for reference at key value level, as well as add "children" to grab
  * entire array of children
  */
  parentValue () {
  }
  firstChild () {
  }
  lastChild () {
  }
  previousSibling () {
  }
  nextSibling () {
  }
/* eslint-enable indent */
}

// Iterator
/* eslint-disable indent */
export class JSONValueIterator {
  /*
  this.root;
  this.filter;
  this.whatToShow;
  */
  // Analogues to DOM4-specified properties
  /*
  this.referenceValue;
  this.pointerBeforeReferenceValue;
  */

  nextValue () {
  }
  previousValue () {
  }
  detach () { // For TreeWalker too?
  }
/* eslint-enable indent */
}

// Filter
/* eslint-disable indent */
/**
* Analogue to NodeFilter
*/
class JSONFilter {
  /***
  * Analogue to acceptNode of DOM NodeFilter
  */
  acceptValue (value) {
    throw new Error('The JSONFilter class is not meant to be instantiated; it is meant only for its constants and description of interface.');
  }

  // Constants returned by acceptValue
  static FILTER_ACCEPT = 1;
  static FILTER_REJECT = 2;
  static FILTER_SKIP = 3;

  // For whatToShow
  static SHOW_ALL = 0xFFFFFFFF;
  static SHOW_NULL = 0x00000001;
  static SHOW_BOOLEAN = 0x00000002;
  static SHOW_NUMBER = 0x00000004;
  static SHOW_STRING = 0x00000008;
  static SHOW_ARRAY = 0x00000010;
  static SHOW_OBJECT = 0x00000020;
  static SHOW_UNDEFINED = 0x00000040; // JS only
  static SHOW_NONFINITENUMBER = 0x00000080; // JS only (we don't add an extra underscore as doesn't fit with easy CamelCase handling)
  static SHOW_FUNCTION = 0x00000100; // JS only
}

// PRIVATE STATIC UTILITIES

/**
* Make a shallow or deep copy of an object
* @private
* @constant
* @param {Object} obj Object to copy
* @param {Boolean} [deep] Whether or not to make a deep copy. Defaults to false
* @returns {Object} Copied object
*/
function _copyObject (obj, deep) {
  const copyObj = {};
  for (const prop in obj) {
    if (deep && obj[prop] && typeof obj[prop] === 'object') {
      copyObj[prop] = _copyObject(obj[prop]);
    } else {
      copyObj[prop] = obj[prop];
    }
  }
  return copyObj;
}

// SPECIALIZED CONSTRUCTORS (JS OR JSON)

/**
* @constructor
*/
export function SAJJ_JS (rootJSONObj, options) {
  const newOpts = _copyObject(options); // We don't make a deep copy, as we only need to overwrite the mode
  newOpts.mode = 'JavaScript';
  return new SAJJ(rootJSONObj, newOpts);
}

/**
* @constructor
*/
export function SAJJ_JSON (rootJSONObj, options) { // Default is JSON mode so can just pass through
  return new SAJJ(rootJSONObj, options);
}

// GENERIC JSON/JS CONSTRUCTOR

/**
* @constructor
* @param {Object} options See setDefaultOptions() function body for some possibilities
* @param {null|boolean|number|string|function|nonfiniteNumber|undefined} rootJSONObj The root JSON value to traverse
* @property {null|boolean|number|string|function|nonfiniteNumber|undefined} root The root JSON value to traverse;
                                     part of JSONValueIterator/JSONTreeWalker interfaces
* @todo Fix docs of options
* @todo Support object + JSONPath as first argument for iteration within a larger tree
*/
class SAJJ {
  constructor (rootJSONObj, options) {
    this.root = rootJSONObj;
    this.setDefaultOptions(options);
  }

  // OPTIONS
  /**
  * @property {Number} [whatToShow] Part of JSONValueIterator and JSONTreeWalker interfaces
  * @property {JSONFilter} [filter] Part of JSONValueIterator and JSONTreeWalker interfaces
  */
  setDefaultOptions (options) {
    this.options = options || {};

    // These two are custom, but used for distinguishing API analogous to DOM createNodeIterator and createTreeWalker
    this.iterator = options.iterator || false; // Set by JSONValueIterator constructor
    this.treeWalker = options.treeWalker || false; // Set by JSONTreeWalker constructor

    // Todo: to make properties read-only, etc., use https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperties

    if (this.iterator) {
      this.referenceValue = this.root; // Analogue to step of DOM4 createNodeIterator
      this.pointerBeforeReferenceNode = true; // Analogue to step of DOM4 createNodeIterator
      // The following three properties are required internally per DOM4 spec, but not public
      this._iteratorCollection = []; // Live (with filter and root; linear, sorted in tree order)
      this._detached = false;
      this._active = false;
    } else if (this.treeWalker || 1) { // We'll allow as default for now
      this.currentValue = this.root; // Analogue to step of DOM createTreeWalker
      // The following property is required internally per DOM4 spec, but not public
      this._active = false;
    }

    // Analogue to step of DOM createNodeIterator and createTreeWalker
    this.whatToShow = options.whatToShow || JSONFilter.SHOW_ALL;
    this.filter = typeof options.filter === 'function'
      ? {acceptValue: options.filter}
      : (options.filter || null);

    // CUSTOM PROPERTIES
    this.mode = options.mode || 'JSON'; // Whether to support full JavaScript objects (with functions, undefined, nonfiniteNumbers) or JSON; will not distinguish object literals from other objects, but neither does JSON.stringify which ignores prototype and drops functions/undefined and converts nonfinite to null

    // Default is true as will be pretty limited if not iterating
    this.delayedIteration = options.delayedIteration || true;
    this.distinguishKeysValues = options.distinguishKeysValues || false;

    this.iterateArrays = options.iterateArrays || true;
    this.iterateObjects = options.iterateObjects || true;

    this.iterateObjectPrototype = options.iterateObjectPrototype || false;
    this.iterateArrayPrototype = options.iterateArrayPrototype || false;

    this.alterDefaultHandlers(); // This must be called after options are set
  }

  /**
  * Rather than use the strategy design pattern, we'll override our prototype selectively
  */
  alterDefaultHandlers () {
    // If delaying iteration, it will grab the function into the object's memory;
    //   otherwise (for immediate iteration), we can take advantage of the
    //   default prototype
    if (this.delayedIteration) {
      this.delegateHandlers = this.delayedDelegateIterateHandlers;
    }
    if (this.distinguishKeysValues) {
      this.keyValueHandler = this.keyValueDistinguishedHandler;
    }
  }

  // PUBLIC METHODS TO INITIATE PARSING

  /**
  * For strings, one may wish to use Clarinet (https://github.com/dscape/clarinet ) to
  *   avoid extra overhead or parsing twice
  * @param {String} str The JSON string to be walked (after complete conversion to an object)
  * @param {Object|Array} [parentObject] The parent object or array containing the string (not required)
  * @param {String} [parentKey] The parent object or array's key (not required)
  * @param {Boolean} [parentObjectArrayBool] Whether the parent object is an array (not another object) (not required)
  */
  walkJSONString (str, parentObject, parentKey, parentObjectArrayBool) {
    this.walkJSONObject(JSON.parse(str), parentObject, parentKey, parentObjectArrayBool);
  }

  /**
  *
  * @param {Object} obj The JSON object to walk
  * @param {Object|Array} [parentObject] The parent object or array containing the string (not required)
  * @param {String} [parentKey] The parent object or array's key (not required)
  * @param {Boolean} [parentObjectArrayBool] Whether the parent object is an array (not another object) (not required)
  */
  walkJSONObject (obj, parentObject, parentKey, parentObjectArrayBool) {
    const parObj = parentObject || this.options.parentObject,
      parKey = parentKey || this.options.parentKey,
      parObjArrBool = parentObjectArrayBool || this.options.parentObjectArrayBool || (parObj && this.isArrayType(parObj));

    this.delegateHandlersByType(obj, parObj, parKey, parObjArrBool);
    this.endHandler(obj, parObj, parKey, parObjArrBool);
  }

  /*
  Todo:
    a) forEach (default) (but with option to stop without need to return value or where undefined is continue by default)
    b) filter() version with return boolean for whatToShow/filter option
      i) some()/every() (cycle through all until find); like filter() but stops if one found or not one found and
        calls nextValue() immediately afterward by default since only one value (though could be used to find
        additional matching of some() or not matching of every())
    c) map() (use parentObject to manipulate in place; otherwise, similar to reduce() with parentObject and clone())
    d) reduce()/reduceRight() (need prev argument for both; previousValue() method for latter);
      i) For JSON.stringify implementation, just do: prev += curr;  or prev = curr + prev;
  */

  // END HANDLER

  /**
  * We just make available the passed in arguments
  */
  endHandler (obj, parObj, parKey, parObjArrBool) {
  }

  // HANDLER DELEGATION BY TYPE

  // Todo: override this (or separate out and override secondary method) to delegate
  //     objects/arrays separately but for others, pass type as arg, not within method name

  delegateHandlersByType (
    obj, parentObject, parentKey, parentObjectArrayBool
  ) {
    const type = this.detectBasicType(obj, parentObject, parentKey, parentObjectArrayBool);

    let runIfSilent = true,
      dontReject = true,
      dontSkip = this.acceptType(type);

    // Todo: Change to continue (silent) iteration for arrays/objects
    // Todo: handle iterator/treeWalker boolean options (also allowing neither to work well)
    //     shared methods:
    //     1) nextValue
    //     2) previousValue
    //     JSONValueIterator properties: pointerBeforeReferenceValue (bool), referenceValue
    //              methods: detach
    //     JSONTreeWalker properties: this.currentValue;
    //          methods: parentValue, firstChild, lastChild, previousSibling, nextSibling
    // this._iteratorCollection

    if (this.filter && dontSkip) {
      const result = this.filter.acceptValue(obj);
      dontSkip = result === JSONFilter.FILTER_ACCEPT;
      dontReject = this.iterator || result !== JSONFilter.FILTER_REJECT;
    }

    switch (type) {
    case 'null': case 'undefined':
      if (dontSkip) {
        this.delegateHandlers(type + 'Handler', parentObject, parentKey, parentObjectArrayBool);
      }
      break;
    case 'array': case 'object':
      runIfSilent = dontReject;
      // Fallthrough
    case 'ignore': // Will delegate by default so that handler can log, etc.
      // Fallthrough
    default:
      if (dontSkip && runIfSilent) {
        this.delegateHandlers(type + 'Handler', parentObject, parentKey, parentObjectArrayBool, obj);
      }
      break;
    }
  };

  /**
  * Checks whatToShow options on whether to handle the type. No need to check JSMode as already checked earlier
  */
  acceptType (type) {
    const ct = this.cachedTypes;
    if (typeof ct[type] === 'boolean') {
      return ct[type];
    }
    const ret = (this.whatToShow & JSONFilter.SHOW_ALL) || (this.whatToShow & JSONFilter['SHOW_' + type.toUpperCase()]);
    ct[type] = ret;
    return ret;
  }

  /**
  * Allows override to allow for immediate or delayed execution; should handle both null/undefined
  * types (which require no first value argument since only one is possible) and other types
  */
  delegateHandlers (type, parentObj, parentKey, parentObjectArrayBool, obj) {
    if (arguments.length === 5) {
      this[type](obj, parentObj, parentKey, parentObjectArrayBool);
    } else {
      this[type](parentObj, parentKey, parentObjectArrayBool);
    }
  }

  /**
  * While this can be overridden on the prototype (impacting all objects) or
  *   object directly (as it can be in the constructor), it should not be
  *   called directly, but rather via the iterateHandlers boolean option
  *   passed during instantiation.
  */
  delayedDelegateIterateHandlers (type, parentObj, parentKey, parentObjectArrayBool, obj) {
    const that = this;
    if (arguments.length === 5) {
      return {
        next () {
          that[type](obj, parentObj, parentKey, parentObjectArrayBool);
        }
      };
    } else {
      this[type](parentObj, parentKey, parentObjectArrayBool);
    }
  }

  // DETECT TYPES
  detectBasicType (obj, parentObject, parentKey, parentObjectArrayBool) {
    const type = typeof obj,
      JSMode = this.mode === 'JavaScript';
    switch (type) {
    // JavaScript-only
    case 'number':
      if (!isFinite(obj)) {
        if (JSMode) {
          return 'nonfiniteNumber';
        // Can return a custom type and add that handler to the object to convert to JSON
        }
        return this.typeErrorHandler('nonfiniteNumber', obj, parentObject, parentKey, parentObjectArrayBool);
      }
      // Fallthrough
    case 'function': case 'undefined':
      if (!JSMode) {
        // Can return a custom type and add that handler to the object to convert to JSON
        return this.typeErrorHandler(type, obj, parentObject, parentKey, parentObjectArrayBool);
      }
      // Fallthrough
    case 'boolean': case 'string':
      return type;
    case 'object':
      return obj
        ? (this.isArrayType(obj)
          ? 'array'
          : (JSMode ? this.detectObjectType(obj) : 'object')
        )
        : 'null';
    }
  }

  /**
  * Could override to always return false if one wished to merge arrayHandler/objectHandler or, if in
  *  JSMode, to merge detectObjectType and this detectArrayType method. To merge arrayKeyValueHandler and
  *  objectKeyValueHandler, see keyValueHandler.
  */
  isArrayType (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  /**
  * Allow overriding to detect Date, RegExp, or other types (which will in turn route to corresponding
  *  names)
  */
  detectObjectType (obj) {
    return 'object';
  }

  // ERROR HANDLING
  /**
  May throw or return type string (can be custom type if handler present)
  */
  typeErrorHandler (type, obj, parentObject, parentKey, parentObjectArrayBool) {
    switch (type) {
    // Could utilize commented out portions as below to allow JSON mode to still handle certain non-JSON types (though
    //  may be better to use use JS mode in such a case)
    case 'function':
      return 'ignore';
      // return type;
    case 'undefined':
      return 'ignore';
      // return type;
      // Or maybe this:
      // return 'null';
    case 'nonfiniteNumber': // We'll behave by default as does JSON.stringify
      return 'null';
    default:
      throw new Error('Values of type "' + type + '" are only allowed in JavaScript mode, not JSON.');
    }
  }

  // HANDLERS

  /**
  * Could override for logging; meant for allowing dropping of properties/methods, e.g., undefined/functions, as
  *  done, for example, by JSON.stringify
  */
  ignoreHandler (obj, parentObj, parentKey, parentObjectArrayBool) {
  }

  // JavaScript-only (non-JSON) handler methods (not used or required for JSON mode)
  functionHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return value.toString(); // May not be supported everywhere
  }

  undefinedHandler (parentObject, parentKey, parentObjectArrayBool) {
    return 'undefined';
  }
  nonfiniteNumberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return String(value);
  }
  // JSON handler methods
  booleanHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return String(value);
  }
  numberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return String(value);
  }
  stringHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return JSON.stringify(value);
  }
  nullHandler (parentObject, parentKey, parentObjectArrayBool) {
    return 'null';
  }

  // It is probably not necessary to override the defaults for the following two methods
  objectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    this.beginObjectHandler(value, parentObject, parentKey, parentObjectArrayBool);
    if (this.iterateObjects) {
      let i = 0;
      if (this.iterateObjectPrototype) {
        for (const key in value) {
          this.currentKey = key;
          this.currentObject = value[key];
          this.keyValueHandler(value[key], key, parentObject, parentKey, parentObjectArrayBool, true, i);
          i++;
        }
      } else {
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            this.currentKey = key;
            this.currentObject = value[key];
            this.keyValueHandler(value[key], key, parentObject, parentKey, parentObjectArrayBool, true, i);
            i++;
          }
        }
      }
    }
    this.endObjectHandler(value, parentObject, parentKey, parentObjectArrayBool);
  }

  arrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    const arrLength = value.length;
    this.beginArrayHandler(value, parentObject, parentKey, parentObjectArrayBool, arrLength);
    if (this.iterateArrays) {
      if (this.iterateArrayPrototype) {
        for (const key in value) {
          this.currentKey = key;
          this.currentObject = value[key];
          this.keyValueHandler(value[key], key, parentObject, parentKey, parentObjectArrayBool, false); // Ambiguous about whether array value is being iterated or array object value
        }
      } else {
        const arrl = value.length;
        for (let key = 0; key < arrl; key++) {
          this.currentKey = key;
          this.currentObject = value[key];
          this.keyValueHandler(value[key], key, parentObject, parentKey, parentObjectArrayBool, false);
        }
      }
    }
    this.endArrayHandler(value, parentObject, parentKey, parentObjectArrayBool, arrLength);
  }

  // These four methods can be overridden without affecting the logic of the objectHandler and arrayHandler to utilize
  //   reporting of the object as a whole
  beginObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '{';
  }
  endObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '}';
  }
  beginArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '[';
  }
  endArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return ']';
  }

  /**
  * Can override to avoid delegating to separate array/object handlers; see detectArrayType notes
  *   for a means to treat objectHandler/arrayHandler as the same; overridden optionally in
  *   constructor by keyValueDistinguishedHandler
  */

  // Todo: override for TreeWalker/JSONValueIterator (or make it identical if possible as the scalar version)

  keyValueHandler (
    value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt
  ) {
    if (arrayBool) {
      this.arrayKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool);
    } else {
      this.objectKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, iterCt);
    }
  }

  arrayKeyValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }
  objectKeyValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }

  // OPTIONAL DISTINGUISHING OF KEY AND VALUE HANDLERS

  /**
  * Constructor may use this to override keyValueHandler
  */
  keyValueDistinguishedHandler (value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    this.keyHandler(key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
    this.valueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
  }
  keyHandler (key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    if (arrayBool) {
      this.arrayKeyHandler(key, parentObject, parentKey, parentObjectArrayBool);
    } else {
      this.objectKeyHandler(key, parentObject, parentKey, parentObjectArrayBool, iterCt);
    }
  }
  valueHandler (value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    if (arrayBool) {
      this.arrayValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool);
    } else {
      this.objectvalueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, iterCt);
    }
  }
  objectKeyHandler (key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
  }
  objectValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }
  arrayKeyHandler (key, parentObject, parentKey, parentObjectArrayBool) {
  }
  arrayValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }
}

export default SAJJ;

// EXPORTS
// return {SAJJ, SAJJ_JSON, SAJJ_JS}; // Does no harm if window or exports
