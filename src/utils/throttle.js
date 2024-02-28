/**
 * 防抖
 * @param {function} fn 需防抖的函数
 * @param {number} delay 延时 默认500毫秒
 * @param {object} that fn指向的对象
 * @returns {function}
 */
export default function throttle (fn, delay = 500, that = this) {
  let flag = true
  return function() {
    if (flag) {
      flag = false
      fn.call(that, ...arguments)
      setTimeout(() => flag = true, delay)
    }
  }
}