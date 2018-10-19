'use strict';
function write (txt) {
  document.body.append(document.createTextNode(txt));
  document.body.append(document.createElement('br'));
}
function validate (txt) {
  try {
    const xml = new DOMParser().parseFromString(txt, 'application/xml');
    // Should be well-formed XML (as well as HTML)
    if (xml.documentElement.nodeName === 'parsererror') {
      throw xml.documentElement.textContent;
    }
    if (new DOMParser().parseFromString(txt, 'text/html').body.firstChild.nodeType !== 1) {
      throw new Error('An element is expected at root');
    }
  } catch (e) {
    write('error validating DOM:' + e);
  }
}
function validateAndWrite (txt) {
  validate(txt);
  write(txt);
}
function elementFromString (str) {
  return new DOMParser().parseFromString(str, 'text/html').body.firstElementChild;
}
