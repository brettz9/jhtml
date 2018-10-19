// Dependencies: Object.keys, Object.getOwnPropertyNames, Object.hasOwnProperty

/*
// Obtaining Keys/Properties as Array

Object.keys:                direct enumerable
getOwnPropertyNames:            direct enumerable and nonenumerable
?:                      direct nonenumerable

use for-in:                 direct and indirect enumerable
getAllPropertyNames (custom function):    direct and indirect
   enumerable and nonenumerable
?:                      direct and indirect nonenumerable

?:                      indirect enumerable
?:                      indirect enumerable and nonenumerable
?:                      indirect nonenumerable

*/
class PropertyRetriever {
  constructor (obj) {
    this.obj = obj;
  }

  getOwnEnumerables () {
    const {obj} = this;
    return Object.keys(obj); // Could also use for-in with hasOwnProperty
  }

  getOwnNonenumerables () {
    const {obj} = this;

    return Object.getOwnPropertyNames(obj).reduce(function (prev, prop) {
      if (!prev.includes(prop) &&
        !Object.prototype.propertyIsEnumerable.call(obj, prop)
      ) {
        prev.push(prop);
      }
      return prev;
    }, []);
  }

  getOwnEnumerablesAndNonenumerables () {
    const {obj} = this;
    return Object.getOwnPropertyNames(obj);
  }

  getPrototypeEnumerables () {
    // var obj = this.obj;

  }

  getPrototypeNonenumerables () {
    // var obj = this.obj;

  }

  getPrototypeEnumerablesAndNonenumerables () {
    // var obj = this.obj;

  }

  getOwnAndPrototypeEnumerables () {
    // var obj = this.obj;

  }

  getOwnAndPrototypeNonenumerables () {
    // var obj = this.obj;

  }

  getOwnAndPrototypeEnumerablesAndNonenumerables () {
    // var obj = this.obj;

  }
}

/*
// Enumeration

use Object.keys:              direct enumerable
use getOwnPropertyNames:          direct enumerable and nonenumerable
?:                      direct nonenumerable

for-in:                   direct and indirect enumerable
use getAllPropertyNames (custom function):  direct and indirect
  enumerable and nonenumerable
?:                      direct and indirect nonenumerable

?:                      indirect enumerable
?:                      indirect enumerable and nonenumerable
?:                      indirect nonenumerable
*/
class PropertyEnumerator {
  enumerateOwnEnumerables (cb) {
    const {obj} = this;
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        cb(obj[prop], prop, obj);
      }
    }
  }

  enumerateOwnNonenumerables (/* cb */) {

  }

  enumerateOwnEnumerablesAndNonenumerables (/* cb */) {

  }

  enumeratePrototypeEnumerables (cb) {
    const {obj} = this;
    for (const prop in obj) {
      if (!Object.hasOwn(obj, prop)) {
        cb(obj[prop], prop, obj);
      }
    }
  }

  enumeratePrototypeNonenumerables (/* cb */) {

  }

  enumeratePrototypeEnumerablesAndNonenumerables (/* cb */) {

  }

  enumerateOwnAndPrototypeEnumerables (cb) {
    const {obj} = this;
    // eslint-disable-next-line guard-for-in -- Deliberate prototoype iteration
    for (const prop in obj) {
      cb(obj[prop], prop, obj);
    }
  }

  enumerateOwnAndPrototypeNonenumerables (/* cb */) {

  }

  enumerateOwnAndPrototypeEnumerablesAndNonenumerables (/* cb */) {

  }
}

// MULTIPLE-INHERITING CLASS (PropertyEnumerator AND PropertyRetriever)

class PropertyEnumeratorRetriever extends PropertyEnumerator {
}

// eslint-disable-next-line guard-for-in -- Deliberate prototoype iteration
for (const method in PropertyRetriever.prototype) {
  PropertyEnumeratorRetriever.prototype[method] =
    PropertyRetriever.prototype[method];
}

// EXPORTS
export {PropertyRetriever, PropertyEnumerator, PropertyEnumeratorRetriever};
