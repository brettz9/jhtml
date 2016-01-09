var SAJJ, module;
(function () {'use strict';

if (exports !== undefined) {
    SAJJ = require('./SAJJ');
}

/**
* @abstract
* @class
* @todo Might add an add() method which defines how to combine result values (so as to allow for other means besides string concatenation)
*/
var ObjectArrayDelegator = SAJJ.createConstructor(); // Convenience method to create constructor not requiring new keyword and inheriting from the designated constructor (or SAJJ when not present)

// It is probably not necessary to override the defaults for the following two methods and perhaps not any of the others either
ObjectArrayDelegator.prototype.objectHandler = function objectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    var key, i = 0,
        ret = this.beginObjectHandler(value, parentObject, parentKey, parentObjectArrayBool),
        keyVals = [];
    if (this.iterateObjects) {
        if (this.iterateObjectPrototype) {
            for (key in value) {
                this.currentKey = key;
                this.currentObject = value[key];
                keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, false, i));
                i++;
            }
        }
        else {
            for (key in value) {
                if (value.hasOwnProperty(key)) {
                    this.currentKey = key;
                    this.currentObject = value[key];
                    keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, false, i));
                    i++;
                }
            }
        }
    }
    return ret + keyVals.join(this.objectKeyValueJoinerHandler()) + this.endObjectHandler(value, parentObject, parentKey, parentObjectArrayBool);
};

ObjectArrayDelegator.prototype.arrayHandler = function arrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    var key, arrl,
        arrLength = value.length,
        ret = this.beginArrayHandler(value, parentObject, parentKey, parentObjectArrayBool, arrLength),
        keyVals = [];
    if (this.iterateArrays) {
        if (this.iterateArrayPrototype) {
            for (key in value) {
                this.currentKey = key;
                this.currentObject = value[key];
                keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, true)); // Ambiguous about whether array value is being iterated or array object value
            }
        }
        else {
            for (key = 0, arrl = value.length; key < arrl; key++) {
                this.currentKey = key;
                this.currentObject = value[key];
                keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, true));
            }
        }
    }
    return ret + keyVals.join(this.arrayKeyValueJoinerHandler()) + this.endArrayHandler(value, parentObject, parentKey, parentObjectArrayBool, arrLength);
};

/**
* Can override to avoid delegating to separate array/object handlers; see isArrayType notes 
*   for a means to treat objectHandler/arrayHandler as the same; overridden optionally in 
*   constructor by keyValueDistinguishedHandler
*/

ObjectArrayDelegator.prototype.keyValueHandler = function keyValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    var objectRet = this.keyHandler(key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
    if (arrayBool) {
        return this.arrayKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool);
    }
    return objectRet + this.objectKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, iterCt);
};

ObjectArrayDelegator.prototype.arrayKeyValueHandler = function arrayKeyValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
};
ObjectArrayDelegator.prototype.objectKeyValueHandler = function objectKeyValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
};

// OPTIONAL DISTINGUISHING OF KEY AND VALUE HANDLERS

/**
* Constructor may use this to override keyValueHandler
*/
ObjectArrayDelegator.prototype.keyValueDistinguishedHandler = function keyValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    var ret = this.keyHandler(key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
    return ret + this.valueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
};
ObjectArrayDelegator.prototype.keyHandler = function (key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    if (arrayBool) {
        return this.arrayKeyHandler(key, parentObject, parentKey, parentObjectArrayBool);
    }
    return this.objectKeyHandler(key, parentObject, parentKey, parentObjectArrayBool, iterCt);
};
ObjectArrayDelegator.prototype.valueHandler = function (value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    if (arrayBool) {
        return this.arrayValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool);
    }
    return this.objectValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, iterCt);
};
ObjectArrayDelegator.prototype.objectValueHandler = function (value, key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
};
ObjectArrayDelegator.prototype.arrayValueHandler = function (value, key, parentObject, parentKey, parentObjectArrayBool) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
};

SAJJ.exportClass(ObjectArrayDelegator, 'ObjectArrayDelegator', module);


}());
