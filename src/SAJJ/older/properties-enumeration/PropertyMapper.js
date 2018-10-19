// Could implement other Array methods, like some(), filter(), etc.

class PropertyMapper {
  mapOwnEnumerables (/* cb */) {

  }

  mapOwnNonenumerables (/* cb */) {

  }

  mapOwnEnumerablesAndNonenumerables (/* cb */) {

  }

  mapPrototypeEnumerables (/* cb */) {

  }

  mapPrototypeNonenumerables (/* cb */) {

  }

  mapPrototypeEnumerablesAndNonenumerables (/* cb */) {

  }

  mapOwnAndPrototypeEnumerables (cb) {
    const {obj} = this;

    const ret = [];
    // eslint-disable-next-line guard-for-in -- Deliberate prototype iteration
    for (const prop in obj) {
      ret.push(cb(obj[prop], prop, obj));
    }
    return ret;
  }

  mapOwnAndPrototypeNonenumerables (/* cb */) {

  }

  mapOwnAndPrototypeEnumerablesAndNonenumerables (/* cb */) {

  }
}

export default PropertyMapper;

