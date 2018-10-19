export default function getAllPropertyNames (obj) {
  const props = [];

  do {
    Object.getOwnPropertyNames(obj).forEach(function (prop) {
      if (!props.includes(prop)) {
        props.push(prop);
      }
    });
  } while ((obj = Object.getPrototypeOf(obj)));

  return props;
}
