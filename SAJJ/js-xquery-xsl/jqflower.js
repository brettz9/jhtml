// Inspiration from XQuery, https://github.com/nkallen/jquery-database , and http://www.sitepen.com/blog/2008/07/16/jsonquery-data-querying-beyond-jsonpath/
// I also came across http://plugins.jquery.com/project/jLINQ (and http://www.hugoware.net/Projects/jLinq ) and http://jsinq.codeplex.com/ after starting this work
// Flower is inspired by the FLWOR expressions of XQuery (For, Let, Where, Order by, Return)
// Methods are prefixed by '$' to avoid use of JavaScript keywords (e.g., for, let, return)
// (JS-pre-declared) Variables could be implementable without need for "this." in subsequent methods by using eval() and strings, but less JS-like (and may as well do XQuery parser in that case) and also less secure

// Fix: only accept where, order by, and return if a let or for has been called, and require where, order by, and return in that order
function JQFlower (opts) {
    if (!(this instanceof JQFlower)) {
        return new JQFlower(opts);
    }
    this.depth = 0;
    this.forMap = {children:{}};
    if (opts) {
        this.$declaration(opts);
    }
}
// Allows invoking on an explicit function separately though it is unnecessary 
//  as this function is also auto-invoked by the constructor
JQFlower.prototype.$declaration = function (opts) {
    for (var opt in opts) {
        
    }
	return this;
};
JQFlower.prototype.$ = JQFlower.prototype.$wrapper = function () {
    return this;
};
JQFlower.prototype.$for = function (query) {
    for (var key in query) {
        query = query[key];
        break;
    }
    this.key = key;
    this.query = query;
    this.vrs = '';
    if (typeof query === 'function') {
        query.call(this); // Continue the FLWOR chain asynchronously
    }
};
JQFlower.prototype.$at = function (vrs) {
    return this;
};

JQFlower.prototype.$let = function (vrs) {
    if (typeof vrs === 'function') {
        vrs = vrs();
    }
    for (var p in vrs) {
        this.vrs += 'var ' + p + '=' + vrs[p] + ';';
    }
    return this;
};
JQFlower.prototype.$where = function (__clause__) {
    // Fix: filter down this.key
    eval(this.vrs);
    this.nodes = this.nodes.querySelectorAll(__clause__);
    return this;
};
JQFlower.prototype.$orderBy = function (order) {
    // Fix: order this.key
    eval(this.vrs);
    return this;
};
JQFlower.prototype.$return = function (cb) {
    if (typeof cb === 'function') {
        var scope = {};
        scope[this.key] = document.querySelectorAll(this.query);
        return cb.call(scope);
    }
    var nodes = document.querySelectorAll(this.query);
    for (var i=0; i < nodes.length; i++) {
        eval('var '+this.key + '= nodes[i];' +this.vrs + ';' + cb);
    }
};

// Branch off into domain-specific functions (and associated with constant strings?)

// Fix: define this on JQFlower, unless a 'global' declaration is made

// Make JSON-specific ones, jQuery-specific (e.g., filter()), etc.

// XQuery-like element converter
function string (el) {
    if (el.length) {
        var content = '';
        for (var i = 0; i < el.length; i++) {
            content += el[i].textContent;
        }
        return content;
    }
    return el.textContent;
}

// For users who don't want jQuery
var $in = function queryAll (node, selector) {
    if (selector) {
        return [].slice.call(node.querySelectorAll(this.query));
    }
    else {
        return [].slice.call(document.querySelectorAll(this.query));
    }
};
var queryAll = $in;
