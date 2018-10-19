// Inspiration from XQuery, https://github.com/nkallen/jquery-database , and http://www.sitepen.com/blog/2008/07/16/jsonquery-data-querying-beyond-jsonpath/
// I also came across http://plugins.jquery.com/project/jLINQ (and http://www.hugoware.net/Projects/jLinq ) and http://jsinq.codeplex.com/ after starting this work
// Flower is inspired by the FLWOR expressions of XQuery (For, Let, Where, Order by, Return)
// Methods are prefixed by '$' to avoid use of JavaScript keywords (e.g., for, let, return)
// (JS-pre-declared) Variables could be implementable without need for "this." in subsequent methods by using eval() and strings, but less JS-like (and may as well do XQuery parser in that case) and also less secure

// Fix: only accept where, order by, and return if a let or for has been called, and require where, order by, and return in that order
class JQFlower {
  constructor (opts) {
    this.depth = 0;
    this.forMap = {children: {}};
    if (opts) {
      this.$declaration(opts);
    }
  }

    // Allows invoking on an explicit function separately though it is unnecessary
  //  as this function is also auto-invoked by the constructor
  $declaration (/* opts */) {
    /* for (const opt in opts) {

    } */
    return this;
  }

  $ () {
    return this;
  }

  $for (query) {
    let key;
    for (key in query) {
      query = query[key];
      break;
    }
    this.key = key;
    this.query = query;
    this.vrs = '';
    if (typeof query === 'function') {
      query.call(this); // Continue the FLWOR chain asynchronously
    }
  }

  $at (vrs) {
    return this;
  }

  $let (vrs) {
    if (typeof vrs === 'function') {
      vrs = vrs();
    }
    for (const p in vrs) {
      this.vrs += 'var ' + p + '=' + vrs[p] + ';';
    }
    return this;
  }

  $where (__clause__) {
    // Fix: filter down this.key
    eval(this.vrs);
    this.nodes = this.nodes.querySelectorAll(__clause__);
    return this;
  }

  $orderBy (order) {
    // Fix: order this.key
    eval(this.vrs);
    return this;
  }

  $return (cb) {
    if (typeof cb === 'function') {
      const scope = {};
      scope[this.key] = document.querySelectorAll(this.query);
      return cb.call(scope);
    }
    const nodes = document.querySelectorAll(this.query);
    for (let i = 0; i < nodes.length; i++) {
      eval('var ' + this.key + '= nodes[i];' + this.vrs + ';' + cb);
    }
  }
};

export default JQFlower;

// Branch off into domain-specific functions (and associated with constant strings?)

// Fix: define this on JQFlower, unless a 'global' declaration is made

// Make JSON-specific ones, jQuery-specific (e.g., filter()), etc.

// XQuery-like element converter
function string (el) {
  if (el.length) {
    let content = '';
    for (let i = 0; i < el.length; i++) {
      content += el[i].textContent;
    }
    return content;
  }
  return el.textContent;
}

// For users who don't want jQuery
const $in = function queryAll (node, selector) {
  if (selector) {
    return [...node.querySelectorAll(this.query)];
  }
  return [...document.querySelectorAll(this.query)];
};
const queryAll = $in;
