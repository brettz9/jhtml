/*globals define, exports, module*/
/*jslint todo:true*/
/**
* SAJJ Simple API for JSON/JavaScript objects
* This is not intended as a streaming string parser, though walkJSONString() is provided for whole strings; 
*  Clarinet (https://github.com/dscape/clarinet ) is more likely the better choice for such cases.
*  SAJJ, as with SAX, could be adapted to allow DOM TreeWalker-style parsing (pull or automatic cycling) along with
*  XSL-style iteration (though optional whether to ultimately replace original content), e.g., for use with Jamilih or JsonML style 
*  templates (or enhanced via full JS with event handlers)
* @SampleUseCases
1) Converting JavaScript structures to JSON
2) Implementing a SAX-like parser over XML-as-JSON solutions like Jamilih or JsonML
3) XSL-like transformations of JSON (or XML-as-JSON), e.g., to JHTML
* @SampleImplementations
1. Conversion of JSON to JHTML
2. JSON.stringify() (Todo: support replacer and space arguments)
* @DesignGoals
1. Accurate, easy to use, small, fast, memory-efficient, universal in coverage, clean code
2. Convenient (e.g., with overridable methods) but not auto-creating likely useful polyfills like 
    Object.keys(), Object.getOwnPropertyNames(), JSON, etc. Might reconsider
    optionally auto-exporting them, or adding as handler arguments, in the future, but not planning for now.
3. Context-aware (handlers to include parent objects as well as values or JSONPaths)
4. Customizable: Ability to override/customize any functionality and allow custom types but without need for reimplementing iteration routines
5. Offer optional support of regular JavaScript objects (including those potentially representing XML/HTML with events)
6. Allow pull or auto-push reporting
7. Configuration vis-a-vis Clarinet/sax-js options:
    a) Decided for now against trim/normalize options as in Clarinet as seemed not very useful, though could be 
        allowed easily in stringHandler
    b) lowercase and xmlns seem too XML-specific
    c) position has analogue in JSONPath goal
8. Decided against causing conversion to string and feeding into Clarinet as use cases of beginning 
    with JSON rather than merely converting to it were too great (toward JS as main environment or even content-type).
9. Decided against Clarinet handler names as considered ugly relative to CamelCase (despite JS-event-style-familiarity)
10. Decided against passing Object.keys (or other exports of Object properties like getOwnPropertyNames) 
    to beginObjectHandler/beginArrayHandler (and corresponding end methods) as auto-iteration of 
    keys/values ought to address most use cases for obtaining all keys and user can do it themselves 
    if needed. We did pass length of array to begin and endArrayHandler, however.
11. Have module support standard export formats
12. Demonstrate functionality by implementing JSON.stringify though provide empty version
*
* @PossibleFutureTodos
1. Add references to jml() in docs along with JsonML references
2. Integrate with allowing stream input as in Clarinet?
3. TreeWalker/NodeIterator equivalents? 
4. Add array-extra methods along with functional join?
*
* @Todos
*
1. Infinity, NaN, String, Number, Date, etc.
2. Add depth level @property (which could be used, e.g., by a JSON.stringify implementation)
    a) Implement JSON.stringify (without calling JSON.stringify!); if not, fix SampleImplementations above
        i) Finish array/object (call delegateHandlersByType inside keyValueHandler or in object/arrayHandler?; 
            change keyValueHandlers to return commas, etc.)
        ii) avoid functions/undefined/prototype completely, and converting nonfinite to null
3. Add JSONPaths (or implement JSONPath reporting in SAJJ as in jsonPath())? XPath to string SAX XML? .getXPath on DOM node prototype?
*/

(function () {'use strict';

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
    var prop, copyObj = {};
    for (prop in obj) {
        if (deep && obj[prop] && typeof obj[prop] === 'object') {
            copyObj[prop] = _copyObject(obj[prop]);
        }
        else {
            copyObj[prop] = obj[prop];
        }
    }
    return copyObj;
}


// GENERIC JSON/JS CONSTRUCTOR

/**
* @constructor
* @param {Object} options See setDefaultOptions() function body for some possibilities
* @requires SAJJ.interface.js (or another such interface file)
* @todo Fix docs of options
* @todo Support object + JSONPath as first argument for iteration within a larger tree
*/
function SAJJ (options) {
    if (!(this instanceof SAJJ)) {
        return new SAJJ(options);
    }

    this.setDefaultOptions(options);
}

// OPTIONS
SAJJ.prototype.setDefaultOptions = function setDefaultOptions (options) {
    options = options || {};
    this.options = options;
    
    // Todo: to make properties read-only, etc., use https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperties
    
    // CUSTOM PROPERTIES
    this.mode = options.mode || 'JSON'; // Whether to support full JavaScript objects (with functions, undefined, nonfiniteNumbers) or JSON; will not distinguish object literals from other objects, but neither does JSON.stringify which ignores prototype and drops functions/undefined and converts nonfinite to null
    
    this.distinguishKeysValues = options.distinguishKeysValues || false;
    
    this.iterateArrays = options.iterateArrays !== undefined ? options.iterateArrays : true;
    this.iterateObjects = options.iterateObjects !== undefined ? options.iterateObjects : true;
    
    this.iterateObjectPrototype = options.iterateObjectPrototype || false;
    this.iterateArrayPrototype = options.iterateArrayPrototype || false;

    this.alterDefaultHandlers(options); // This must be called after options are set
};

/**
* Rather than use the strategy design pattern, we'll override our prototype selectively
*/
SAJJ.prototype.alterDefaultHandlers = function alterDefaultHandlers (options) {
    if (this.distinguishKeysValues) {
        this.keyValueHandler = this.keyValueDistinguishedHandler;
    }
    if (options.delegateHandlers) {
        this.delegateHandlers = options.delegateHandlers;
    }
};
    
// PUBLIC METHODS TO INITIATE PARSING

/**
* For strings, one may wish to use Clarinet (https://github.com/dscape/clarinet ) to 
*   avoid extra overhead or parsing twice
* @param {String} str The JSON string to be walked (after complete conversion to an object)
* @param {Object|Array} [parentObject] The parent object or array containing the string (not required)
* @param {String} [parentKey] The parent object or array's key (not required)
* @param {Boolean} [parentObjectArrayBool] Whether the parent object is an array (not another object) (not required)
*/
SAJJ.prototype.walkJSONString = function walkJSONString (str, parentObject, parentKey, parentObjectArrayBool) {
    this.walkJSONObject(JSON.parse(str), parentObject, parentKey, parentObjectArrayBool);
};

/**
* 
* @param {Object} obj The JSON object to walk
* @param {Object|Array} [parentObject] The parent object or array containing the string (not required)
* @param {String} [parentKey] The parent object or array's key (not required)
* @param {Boolean} [parentObjectArrayBool] Whether the parent object is an array (not another object) (not required)
* @property {string|any} ret The intermediate return value (if any) from beginHandler and delegateHandlersByType delegation
* @returns {string|any} The final return value including beginHandler and delegateHandlersByType delegation plus any endHandler additions; one may build one's own intermediate values, but "ret" should be set to return the value
*/
SAJJ.prototype.walkJSONObject = function walkJSONObject (obj, parentObject, parentKey, parentObjectArrayBool) {
    this.root = obj;
    var parObj = parentObject || this.options.parentObject, 
        parKey = parentKey || this.options.parentKey,
        parObjArrBool = parentObjectArrayBool || this.options.parentObjectArrayBool || (parObj && this.isArrayType(parObj));
    this.ret = this.beginHandler(obj, parObj, parKey, parObjArrBool);
    this.ret += this.delegateHandlersByType(obj, parObj, parKey, parObjArrBool);
    this.ret += this.endHandler(obj, parObj, parKey, parObjArrBool);
    return this.ret;
};

// BEGIN AND END HANDLERS

SAJJ.prototype.beginHandler = function endHandler (obj, parObj, parKey, parObjArrBool) {
    return '';
};

/**
* We just make available the passed in arguments
*/
SAJJ.prototype.endHandler = function endHandler (obj, parObj, parKey, parObjArrBool) {
    return '';
};

// HANDLER DELEGATION BY TYPE

// Todo: override this (or separate out and override secondary method) to delegate 
//         objects/arrays separately but for others, pass type as arg, not within method name

SAJJ.prototype.delegateHandlersByType = function delegateHandlersByType (obj, parentObject, parentKey, parentObjectArrayBool) {
    var suffix = 'Handler',
        type = this.detectBasicType(obj, parentObject, parentKey, parentObjectArrayBool);
    
    switch (type) {
        case 'null': case 'undefined':
            return this.delegateHandlers(type + suffix, parentObject, parentKey, parentObjectArrayBool);
        case 'array': case 'object':
        case 'ignore': // Will delegate by default so that handler can log, etc.
            // Fall-through
        default:
            return this.delegateHandlers(type + suffix, parentObject, parentKey, parentObjectArrayBool, obj);
    }
};

/**
* Allows override to allow for immediate or delayed execution; should handle both null/undefined 
* types (which require no first value argument since only one is possible) and other types
*/
SAJJ.prototype.delegateHandlers = function (type, parentObj, parentKey, parentObjectArrayBool, obj) {
    if (arguments.length === 5) {
        return this[type](obj, parentObj, parentKey, parentObjectArrayBool);
    }
    return this[type](parentObj, parentKey, parentObjectArrayBool);
};

// DETECT TYPES
SAJJ.prototype.detectBasicType = function detectBasicType (obj, parentObject, parentKey, parentObjectArrayBool) {
    var type = typeof obj,
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
            return type;
        case 'function': case 'undefined':
            if (!JSMode) {
                // Can return a custom type and add that handler to the object to convert to JSON
                return this.typeErrorHandler(type, obj, parentObject, parentKey, parentObjectArrayBool);
            }
        case 'boolean': case 'string':
            return type;
        case 'object':
            return obj ? 
                (this.isArrayType(obj) ? 
                    'array' : 
                    (JSMode ? this.detectObjectType(obj) : 'object')
                ) : 
                'null';
    }
};

/**
* Could override to always return false if one wished to merge arrayHandler/objectHandler or, if in
*  JSMode, to merge detectObjectType and this isArrayType method. To merge arrayKeyValueHandler and 
*  objectKeyValueHandler, see keyValueHandler.
*/
SAJJ.prototype.isArrayType = function isArrayType (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

/**
* Allow overriding to detect Date, RegExp, or other types (which will in turn route to corresponding
*  names)
*/
SAJJ.prototype.detectObjectType = function detectObjectType (obj) {
    return 'object';
};

// ERROR HANDLING
/**
May throw or return type string (can be custom type if handler present)
*/
SAJJ.prototype.typeErrorHandler = function errorHandler (type, obj, parentObject, parentKey, parentObjectArrayBool) {
    switch (type) {
        // Could utilize commented out portions as below to allow JSON mode to still handle certain non-JSON types (though
        //  may be better to use JS mode in such a case)
        /*
        case 'function':
            return 'ignore';
            // return type;
        case 'undefined':
            return 'ignore';
            // return type;
            // Or maybe this:
            // return 'null';
        */
        case 'nonfiniteNumber': // We'll behave by default as does JSON.stringify
            return 'null';
        default:
            throw 'Values of type "' + type + '" are only allowed in JavaScript mode, not JSON.';
    }
};

// HANDLERS

/**
* Could override for logging; meant for allowing dropping of properties/methods, e.g., undefined/functions, as 
*  done, for example, by JSON.stringify
*/
SAJJ.prototype.ignoreHandler = function ignoreHandler (obj, parentObj, parentKey, parentObjectArrayBool) {
};

// CLASS METHODS

// Todo: Could make convenience method to build constructor, add to prototype, and export class all together 

SAJJ.createAndReturn = function createAndReturn (options) {
    var method,
        Constructor = options.constructs || SAJJ.createConstructor(options.inherits);
    for (method in options.methods) {
        Constructor.prototype[method] = options.methods[method];
    }
    return Constructor;
};

SAJJ.createAndExport = function createAndExport (options) {
    var Constructor = SAJJ.createAndReturn(options);
    SAJJ.exportClass(Constructor, options.name);
    return Constructor;
};

SAJJ.createConstructor = function createConstructor (Inheritor) {
    Inheritor = Inheritor || SAJJ;
    var Constructor = function (options) {
        if (!(this instanceof Constructor)) {
            return new Constructor(options);
        }
        this.setDefaultOptions(options);
    };
    Constructor.prototype = new Inheritor();
    return Constructor;
};
SAJJ.exportClass = function exportClass (clss, name) {
    name = name || clss.name;
    if (typeof define !== 'undefined' && define.amd) { // AMD might not allow us to do this dynamically
        define(name, function () {
            return clss;
        });
    }
    else {
        var mod = typeof module !== 'undefined' ? module.exports : window;
        mod[name] = clss;
    }
};

// SPECIALIZED CONSTRUCTORS (JS)

/**
* @constructor
*/
function SAJJ_JS (options) {
    var newOpts = _copyObject(options); // We don't make a deep copy, as we only need to overwrite the mode
    newOpts.mode = 'JavaScript';
    return new SAJJ(newOpts);
}

// EXPORTS
var exp = (typeof define !== 'undefined' && define.amd ? {} : typeof exports !== 'undefined' ? exports : window);
exp.SAJJ = SAJJ;
exp.SAJJ_JS = SAJJ_JS;

if (typeof define !== 'undefined' && define.amd) {
    define(exp);
}

}());
