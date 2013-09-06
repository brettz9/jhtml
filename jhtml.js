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
* @todo Finish unimplemented methods
* @todo Add polyfills, e.g., https://github.com/termi/Microdata-JS/
*/
(function () {'use strict';
    function ignoreHarmlessNonelementNodes (node, item) {
        if (
            (node.nodeType === 3 || node.nodeType === 4) && // Text or CDATA node
            !node.nodeValue.match(/^\s*$/)
        ) {
            throw 'Non-whitespace text or CDATA nodes are not allowed directly within <' +
                            item.nodeName.toLowerCase() + '>';
        }
        // Todo: also ignore nodes like comments or processing instructions? (A mistake of JSON?); we might even convert comments into JavaScript comments if this is used in a non-JSON-restricted JavaScript environment
        return node.nodeType !== 1; // Not an element (ignore comments, whitespace text nodes, etc.)
    }
    function getJSONFromItemProp (item) {
        var textContent = item.textContent,
            itemProp = item.itemProp.toString(); // FF for some reason doesn't convert to a string; item.getAttribute('itemprop'); // 
        switch(itemProp) {
            case 'null':
                if (textContent !== 'null') {
                    throw 'Invalid null value';
                }
                break;
            case 'boolean':
                if (textContent !== 'true' && textContent !== 'false') {
                    throw 'Invalid boolean value';
                }
                break;
            case 'number':
                if (!textContent.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e(?:\+|-)?\d+)?$/i)) {
                    throw 'Invalid number value';
                }
                break;
            // case 'string': // Todo: Allow?
            // case null: // Todo: Use this with getAttribute() but not .itemProp
            case '': // Todo: Use this with .itemProp.toString() but not with with .itemProp
            case undefined: // string is the default
                return JSON.stringify(item.textContent);
            default:
                throw 'Unrecognized itemprop value: ' + itemProp;
        }
        return textContent;
    }
    function item2JSONString (item, throwOnSpan) {
        function getHarmlessChildNodes (node) {
            return function (prev, childNode) {
                if (ignoreHarmlessNonelementNodes(childNode, node)) {
                    return prev;
                }
                // As per check above, will be exactly one element node in this batch
                return prev + item2JSONString(childNode, true);
            };
        }
        var ret, state, topLevelJSONElement = item.nodeName.toLowerCase();
        switch (topLevelJSONElement) {
            case 'span':
                if (throwOnSpan) {
                    throw 'A <span> element is not allowed in this context';
                }
                return getJSONFromItemProp(item);
            case 'dl': // object
                // JSON allows empty objects (and HTML allows empty <dl>'s) so we do also
                state = 'dt';
                ret = [].reduce.call(item.childNodes, function (prev, node) {
                    if (ignoreHarmlessNonelementNodes(node, item)) {
                        return prev;
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
                        return prev + JSON.stringify(node.textContent) + ':';
                    }
                    // Can now only be a <dd>
                    state = 'dt';
                    if (node.children.length > 1) {
                        throw '<dd> should not have more than one child';
                    }
                    if (!node.children.length) {
                        return prev + getJSONFromItemProp(node) + ',';
                    }
                    return prev + [].reduce.call(node.childNodes, getHarmlessChildNodes(node), '') + ',';
                }, '{').replace(/,$/, '') + '}';
                if (state !== 'dt') {
                    throw 'Ended a definition list without a final <dd> to match the previous <dt>.';
                }
                return ret;
            case 'ol': // array
                if (item.getAttribute('start') !== '0') {
                    throw 'For the sake of readability, <ol> must include a start="0" attribute';
                }
                // JSON allows empty arrays (and HTML allows empty <ol>'s) so we do also
                return [].reduce.call(item.childNodes, function (prev, node) {
                    if (ignoreHarmlessNonelementNodes(node, item)) {
                        return prev;
                    }
                    var nodeName = node.nodeName.toLowerCase();
                    if (nodeName !== 'li') {
                        throw 'Unexpected child of <ol> element: ' + nodeName;
                    }
                    if (node.children.length > 1) {
                        throw '<li> should not have more than a single <ol> or <dl> child';
                    }
                    if (!node.children.length) {
                        return prev + getJSONFromItemProp(node) + ',';
                    }
                    return prev + node.childNodes.reduce(getHarmlessChildNodes(node), '') + ',';
                }, '[').replace(/,$/, '') + ']';
        }
    }
    function escapeHTMLText (str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
    var exp,
        jhtmlNs = 'http://brett-zamir.me/ns/microdata/json-as-html/1',
        JHTMLStringifier = SAJJ.createAndReturn({inherits: ObjectArrayDelegator, methods: {

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
    return ' itemprop="null">' + 'null';
},
booleanHandler: function booleanHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return ' itemprop="boolean">' + String(value);
},
numberHandler: function numberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return ' itemprop="number">' + String(value);
},
stringHandler: function stringHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return '>' + escapeHTMLText(value);
},

// JavaScript-only (non-JSON) (terminal) handler methods (not used or required for JSON mode)
functionHandler: function functionHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return ' itemprop="function">' + escapeHTMLText(value.toString()); // May not be supported everywhere
},
undefinedHandler: function undefinedHandler (parentObject, parentKey, parentObjectArrayBool) {
    return ' itemprop="undefined">' + 'undefined';
},
nonfiniteNumberHandler: function nonfiniteNumberHandler (value, parentObject, parentKey, parentObjectArrayBool) {
    return ' itemprop="number">' + String(value);
},

objectValueHandler: function objectValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    return '<dd' + (value && typeof value === 'object' ? '>' : '') + this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool) + '</dd>';
},
arrayValueHandler: function arrayValueHandler (value, key, parentObject, parentKey, parentObjectArrayBool) {
    return '<li' + this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool) + '</li>';
},

beginHandler: function (obj, parObj, parKey, parObjArrBool) {
    return obj && typeof obj === 'object' ? '' : '<span itemscope="" itemtype="' + jhtmlNs + '"';
},
endHandler: function (obj, parObj, parKey, parObjArrBool) {
    return obj && typeof obj === 'object' ? '' : '</span>';
}


        }});

    if (typeof exports === 'undefined') {
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
