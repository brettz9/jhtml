/* eslint-env browser */
// JavaScript Stylesheet Language (Transformations)
// Can iterate over XML/XHTML/HTML, JSON, etc.
// Can build strings, DOM elements, JSON objects, JSON objects representing elements, etc.; use output() to determine

function JSL (ctx) {
  if (!(this instanceof JSL)) {
    return new JSL(ctx);
  }
  this.output = '';
  this.addContext(ctx);
}
JSL.prototype.addContext = function (ctx) {
  this.ctx = this.applyCtx = ctx || document.body;
};

// Takes object (since no need for particular order) with properties representing the 'match's as strings,
// and those properties taking either a function or another object with properties representing the modes as strings
JSL.prototype.match = function (templates) {
  this.templates = templates;
  return this.execute(); // Could be optional
};
JSL.prototype.execute = function () {
  const root = this.templates['/']; // Fix: can root have a mode?
  this.output += root.call(this);
  return this.output;
};
JSL.prototype.apply = JSL.prototype.applyTemplates = function (mode) {
  // Here we'll do the DOM way, but we should implement to allow JSON traversal
  const treeWalker = document.createTreeWalker(
    this.applyCtx,
    NodeFilter.SHOW_ELEMENT, {
      acceptNode (node) {
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );
  while (treeWalker.nextNode()) {
    const elem = treeWalker.currentNode.nodeName.toLowerCase();
    const match = this.templates[elem];
    if (match) {
      if (typeof match === 'object' && match[mode]) {
        this.output += match[mode].call(this);
      } else if (typeof match !== 'object') {
        this.output += match.call(this);
      }
    }
  }
  return this.output;
};
JSL.prototype.named = function (namedTemplates) {
  this.namedTemplates = namedTemplates;
  return this;
};
JSL.prototype.call = JSL.prototype.callTemplate = function (elem, mode, params) {
  if (!params && mode && typeof mode !== 'string') {
    params = mode;
    mode = undefined;
  }
  const match = this.namedTemplates[elem];
  let output = '';
  if (match) {
    if (typeof match === 'object' && match[mode]) {
      output += match[mode].apply(this, params);
    } else if (typeof match !== 'object') {
      output += match.apply(this, params);
    }
  }
  return output;
};

JSL.prototype.text = function (text) {
  return text; // Not so necessary in string mode!
};

JSL.prototype.variables = function (obj) {
  this.vars = obj;
  return this;
};

JSL.prototype.valueOf = function (sel) {
  // for now, implement as s string
  const node = sel === '.'
    ? this.ctx
    : this.ctx.querySelector(sel);

  return node.cloneNode(true).textContent;
};
JSL.prototype.copyOf = function (sel) {
  const node = sel === '.'
    ? this.ctx
    : this.ctx.querySelector(sel);

  // for now, implement as s string
  const div = document.createElement('div');
  div.append(node.cloneNode(true));
  return div.innerHTML;
};
JSL.prototype.copy = function () {
  // for now, implement as s string
  const div = document.createElement('div');
  div.append(this.ctx.cloneNode(true));
  return div.innerHTML;
};

// Can also just use Array.reduce
JSL.prototype.foreach = function (sel, cb) {
  let nodes = sel;
  if (typeof sel === 'string') {
    if (sel.slice(0, 2) === '. ') {
      nodes = this.ctx.querySelectorAll(sel.slice(2));
    } else {
      nodes = document.querySelectorAll(sel);
    }
  }
  const ct = nodes.length;
  let output = '';
  for (let i = 0; i < ct; i++) {
    this.ctx = nodes[i];
    output += cb.call(this, nodes[i]);
  }
  return output;
};
