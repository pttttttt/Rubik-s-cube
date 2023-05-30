export default function deepCopy(oldobj, newobj) {
  for (let k in oldobj) {
    const item = oldobj[k]
    if (item instanceof Array) {
      newobj[k] = []
      deepCopy(item, newobj[k])
    } else if (item instanceof Object) {
      newobj[k] = {};
      deepCopy(item, newobj[k])
    } else {
      newobj[k] = item
    }
  }
  return newobj
}