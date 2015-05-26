/*globals SAJJ, ObjectArrayDelegator, DOMParser, exports */
/*jslint todo: true */
/**
* JHTML is a format which can represent arbitrary JSON structures in a faithful, human-readable, and portable manner.
* It is also round-trippable except in the case when converting *from* object-containing JSON to JHTML when the
* ECMAScript/JSON interpreter does not iterate the properties in definition order (as it is not required to do)
* @namespace Contains methods for conversions between JSON and JHTML (as strings or objects)
* @requires SAJJ
* @requires ObjectArrayDelegator
* @requires polyfill: Array.prototype.map
* @requires polyfill: Array.prototype.reduce
* @requires polyfill: Element.prototype.textContent
* @requires polyfill: Element.prototype.itemProp
* @requires polyfill: HTMLDocument.prototype.getItems
* @todo Add polyfills, e.g., https://github.com/termi/Microdata-JS/
* @todo Add option for stringification (JSON or JHTML) to provide indentation, etc.
*/
var exports;
(function () {'use strict';
    function item2JSONObject (item, throwOnSpan) {
        var ret, state, textContent = item.textContent, topLevelJSONElement = item.nodeName.toLowerCase();
        switch (topLevelJSONElement) {
            case 'span':
                if (throwOnSpan) {
                    throw 'A <span> element is not allowed in this context';
                }
                return textContent;
            case 'i': // null, boolean, number (or undefined, function, non-finite number, Date or RegExp object)
                switch (textContent) {
                    case 'null':
                        return null;
                    case 'true':
                        return true;
                    case 'false':
                        return false;
// Todo: check option on whether allowing non-JSON
                    // Non-JSON
                    case 'undefined':
                        return undefined;
                    case 'Infinity':
                        return Infinity;
                    case '-Infinity':
                        return -Infinity;
                    case 'NaN':
                        return NaN;
                    default:
                        // number
                        if ((/^\-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e(?:\+|\-)?\d+)?$/i).test(textContent)) {
                            return parseFloat(textContent);
                        }
                        // function
                        var funcMatch = textContent.match(/^function \w*([\w, ]*) {([\s\S]*)}$/);
                        if (funcMatch) {
                            return Function.apply(null, funcMatch[1].split(/, /).concat(funcMatch[2]));
                        }
                        // Date
                        if ((/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) /).test(textContent)) {
                            return new Date(Date.parse(textContent));
                        }
                        // RegExp
                        var regexMatch = textContent.match(/^\/([\s\S]*)\/(g?)(i?)(m?)$/);
                        if (regexMatch) {
                            var flags = (regexMatch[2] ? 'g' : '') + (regexMatch[3] ? 'i' : '') + (regexMatch[4] ? 'm' : '');
                            return new RegExp(regexMatch[1], flags);
                        }
                        break;
                }
                return;
            case 'dl': // object
                // JSON allows empty objects (and HTML allows empty <dl>'s) so we do also
                state = 'dt';
                ret = {};
                var key;
                [].forEach.call(item.childNodes, function (prev, node) {
                    if (ignoreHarmlessNonelementNodes(node, item)) {
                        return;
                    }
                    var nodeName = node.nodeName.toLowerCase();
                    if (state !== nodeName) {
                        throw 'Unexpected state encountered: ' + state;
                    }
                    if (nodeName === 'dt') {
                        if (node.children.length) {
                            throw '<dt> should not have any children';
                        }
                        state = 'dd';
                        key = node.textContent;
                        return;
                    }
                    // Can now only be a <dd>
                    state = 'dt';
                    if (node.children.length > 1) {
                        throw '<dd> should not have more than one element child (<ol>, <dl>, or <i>)';
                    }
                    if (!node.children.length) { // String
                        obj[key] = node.textContent;
                        return;
                    }
                    if ((/\S/).test(node.textContent)) {
                        throw 'There should be no text content inside of <dd> when there is an element child.';
                    }
                    obj[key] = item2JSONObject(node.children[0], true);
                    return;
                });
                if (state !== 'dt') {
                    throw 'Ended a definition list without a final <dd> to match the previous <dt>.';
                }
                return ret;
            case 'ol': // array
                if (item.getAttribute('start') !== '0') {
                    throw 'For the sake of readability, <ol> must include a start="0" attribute within JHTML.';
                }
                // JSON allows empty arrays (and HTML allows empty <ol>'s) so we do also
                [].forEach.call(item.childNodes, function (prev, node) {
                    if (ignoreHarmlessNonelementNodes(node, item)) {
                        return prev;
                    }
                    var nodeName = node.nodeName.toLowerCase();
                    if (nodeName !== 'li') {
                        throw 'Unexpected child of <ol> element: ' + nodeName;
                    }
                    if (node.children.length > 1) {
                        throw '<li> should not have more than a single element child (<ol>, <dl>, or <i>)';
                    }
                    if (!node.children.length) { // String
                        return prev + JSON.stringify(node.textContent) + ',';
                    }
                    if ((/\S/).test(node.textContent)) {
                        throw 'There should be no text content inside of <li> when there is an element child.';
                    }
                    return prev + node.childNodes.reduce(getHarmlessChildNodes(node), '') + ',';
                });
                return ret;
        }
    }
    function escapeHTMLText (str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
    var exp,
        jhtmlNs = 'http://brett-zamir.me/ns/microdata/json-as-html/2',
        JHTMLStringifier = SAJJ.createAndReturn({inherits: ObjectArrayDelegator, methods: 
{

// JSON terminal handler methods

// These four methods can be overridden without affecting the logic of the objectHandler and arrayHandler to utilize
//   reporting of the object as a whole
beginObjectHandler: function beginObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '<dl' + (parentObject ? '' : ' itemscope="" itemtype="' + jhtmlNs + '"') + '>';
},
endObjectHandler: function endObjectHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '</dl>';
},
beginArrayHandler: function beginArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '<ol start="0"' + (parentObject ? '' : ' itemscope="" itemtype="' + jhtmlNs + '"') + '>';
},
endArrayHandler: function endArrayHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '</ol>';
},

// JSON terminal key handler methods

objectKeyHandler: function (key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    return '<dt>' + escapeHTMLText(key) + '</dt>';
},
arrayKeyHandler: function (key, parentObject, parentKey, parentObjectArrayBool) {
    return '';
},

// JSON terminal joiner handler methods

objectKeyValueJoinerHandler: function objectKeyValueJoinerHandler () {
    return '';
},
arrayKeyValueJoinerHandler: function arrayKeyValueJoinerHandler () {
    return '';
},

// JSON terminal primitive handler methods

nullHandler: function nullHandler (parentObject, parentKey, parentObjectArrayBool) {
    if (!parentObject) {
        return 'null';
    }
    return '<i>null</i>';
},
booleanHandler: function booleanHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    if (!parentObject) {
        return String(value);
    }
    return '<i>' + String(value) + '</i>';
},
numberHandler: function numberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    if (!parentObject) {
        return String(value);
    }
    return '<i>' + String(value) + '</i>';
},
stringHandler: function stringHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    if (!parentObject) {
        return escapeHTMLText(value);
    }
    return escapeHTMLText(value);
},

// JavaScript-only (non-JSON) (terminal) handler methods (not used or required for JSON mode)
functionHandler: function functionHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '<i>' + escapeHTMLText(value.toString()) + '</i>'; // May not be supported everywhere
},
undefinedHandler: function undefinedHandler (parentObject, parentKey, parentObjectArrayBool) {
    return '<i>undefined</i>';
},
nonfiniteNumberHandler: function nonfiniteNumberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '<i>' + String(value) + '</i>';
},

objectValueHandler: function objectValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    return '<dd>' + this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool) + '</dd>';
},
arrayValueHandler: function arrayValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    return '<li>' + this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool) + '</li>';
},

beginHandler: function (obj, parObj, parKey, parObjArrBool) {
    var objType = typeof obj;
    return obj && objType === 'object' ? '' : '<' + (['boolean', 'object', 'number'].indexOf(objType) > -1 ? 'i' : 'span') + ' itemscope="" itemtype="' + jhtmlNs + '">';
},
endHandler: function (obj, parObj, parKey, parObjArrBool) {
    var objType = typeof obj;
    return obj && objType === 'object' ? '' : '</' + (['boolean', 'object', 'number'].indexOf(objType) > -1 ? 'i' : 'span') + '>';
}


        }});

    if (exports === undefined) {
        window.JHTML = {};
        exp = window.JHTML;
    }
    else {
        exp = exports;
    }

    exp.toJSONObject = function (items) {
        return JSON.parse(this.toJSONString(items));
    };
    /**
    * We don't validate that other attributes are not present, but they should not be
    */
    exp.toJSONString = function (items) {
        var jsonHtml = items || document.getItems(jhtmlNs),
            ret = [].map.call(jsonHtml, item2JSONString);
        return ret.length === 1 ? ret[0] : '[' + ret.join(',') + ']';
    };
    exp.toJHTMLDOM = function (jsonObj) {
        var jhtmlStr = this.toJHTMLString(jsonObj);
        return new DOMParser().parseFromString(jhtmlStr, 'text/html');
    };
    exp.toJHTMLString = function (jsonObj, options) {
        options = options || {};
        options.distinguishKeysValues = true;
        var jhtmlStringifier = new JHTMLStringifier(options);
        return jhtmlStringifier.walkJSONObject(jsonObj);
    };

}());
