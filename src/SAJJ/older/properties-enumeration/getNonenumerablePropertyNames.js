// Submitted to https://developer.mozilla.org/en-US/docs/Enumerability_and_ownership_of_properties

// Note that this is not the most efficient algorithm for all cases, but
//   useful for a quick demonstration

export const SimplePropertyRetriever = {
  getOwnEnumerables (obj) {
    // Or could use for..in filtered with hasOwnProperty or just this:
    //   return Object.keys(obj);
    return this._getPropertyNames(
      obj, true, false, this._enumerable
    );
  },
  getOwnNonenumerables (obj) {
    return this._getPropertyNames(obj, true, false, this._notEnumerable);
  },
  getOwnEnumerablesAndNonenumerables (obj) {
    // Or just use: return Object.getOwnPropertyNames(obj);
    return this._getPropertyNames(
      obj, true, false, this._enumerableAndNotEnumerable
    );
  },
  getPrototypeEnumerables (obj) {
    return this._getPropertyNames(obj, false, true, this._enumerable);
  },
  getPrototypeNonenumerables (obj) {
    return this._getPropertyNames(obj, false, true, this._notEnumerable);
  },
  getPrototypeEnumerablesAndNonenumerables (obj) {
    return this._getPropertyNames(
      obj, false, true, this._enumerableAndNotEnumerable
    );
  },
  getOwnAndPrototypeEnumerables (obj) {
    return this._getPropertyNames(
      obj, true, true, this._enumerable
    ); // Or could use unfiltered for..in
  },
  getOwnAndPrototypeNonenumerables (obj) {
    return this._getPropertyNames(obj, true, true, this._notEnumerable);
  },
  getOwnAndPrototypeEnumerablesAndNonenumerables (obj) {
    return this._getPropertyNames(
      obj, true, true, this._enumerableAndNotEnumerable
    );
  },
  // Private static property checker callbacks
  _enumerable (obj, prop) {
    return Object.prototype.propertyIsEnumerable.call(obj, prop);
  },
  _notEnumerable (obj, prop) {
    return !Object.prototype.propertyIsEnumerable.call(obj, prop);
  },
  _enumerableAndNotEnumerable (/* obj, prop */) {
    return true;
  },

  // Inspired by http://stackoverflow.com/a/8024294/271577
  _getPropertyNames (
    obj, iterateSelfBool, iteratePrototypeBool, includePropCb
  ) {
    const props = [];

    while (obj) {
      if (iterateSelfBool) {
        // eslint-disable-next-line no-loop-func -- Safe
        Object.getOwnPropertyNames(obj).forEach((prop) => {
          if (!props.includes(prop) && includePropCb(obj, prop)) {
            props.push(prop);
          }
        });
      }
      if (!iteratePrototypeBool) {
        break;
      }
      iterateSelfBool = true;
      obj = Object.getPrototypeOf(obj);
    }

    return props;
  }
};

export default function getNonenumerablePropertyNames (obj) {
  const props = [];

  do {
    // eslint-disable-next-line no-loop-func -- Safe
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (!props.includes(prop) &&
        !Object.prototype.propertyIsEnumerable.call(obj, prop)
      ) {
        props.push(prop);
      }
    });
  } while ((obj = Object.getPrototypeOf(obj)));

  return props;
}

// Credit http://stackoverflow.com/a/8024294/271577
export function getAllPropertyNames (obj) {
  const props = [];

  do {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (!props.includes(prop)) {
        props.push(prop);
      }
    });
  } while ((obj = Object.getPrototypeOf(obj)));

  return props;
}
