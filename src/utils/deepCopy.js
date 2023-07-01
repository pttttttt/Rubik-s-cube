/**
 * 深克隆
 * @param {*} obj 需克隆的参数
 * @returns 新对象
 */
export default function deepCopy (obj) {
  let type = {}
  if (obj instanceof Array) type = []
  return copy(obj, type)
  function copy (oldobj, newobj) {
    for (let k in oldobj) {
      const item = oldobj[k]
      if (item instanceof Array) {
        newobj[k] = []
        copy(item, newobj[k])
      } else if (item instanceof Object) {
        newobj[k] = {};
        copy(item, newobj[k])
      } else {
        newobj[k] = item
      }
    }
    return newobj
  }
}
