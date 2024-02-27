/**
 * 防抖
 * @param {function} fn 需防抖的函数
 * @param {number} delay 延时 默认500毫秒
 * @returns {function}
 */
export default function throttle (fn, delay = 500) {
  let flag = true
  return function(...args) {
    if (flag) {
      flag = false
      // fn.apply(this, ...args)
      fn(...args)
      setTimeout(() => flag = true, delay)
    }
  }
}