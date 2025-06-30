import { faceArrToStrMap } from './map.js'

/**
 * 深克隆
 * @param {*} obj 需克隆的对象
 * @returns 新对象
 */
export function deepCopy(obj) {
  let type = {}
  if (obj instanceof Array) type = []
  return copy(obj, type)
  function copy(oldobj, newobj) {
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
/**
 * 节流
 * @param {function} fn 需节流的函数
 * @param {number} delay 延时 默认500毫秒
 * @param {object} that fn指向的对象
 * @returns {function}
 */
export function throttle(fn, delay = 500, that = this) {
  let flag = true
  return function () {
    if (flag) {
      flag = false
      fn.call(that, ...arguments)
      setTimeout(() => flag = true, delay)
    }
  }
}
/**
 * 将传入的字符串复制到剪切板
 * @param {string} text 需粘贴到剪贴板的字符串
 * @returns {Promise} promise
 */
export function pasteTextToClipboard(text) {
  return navigator.clipboard.writeText(text)
}
/**
 * rbg字符串转十六进制
 * @param {string} rgbStr 需转换的rbg字符串
 * @returns 十六进制字符串
 */
export function rgbToHexadecimal(rgbStr) {
  // 将RGB字符串拆分为三个数值
  let rgbArray = rgbStr.substring(4, rgbStr.length - 1).split(',')
  // 将每个数值转换为16进制，并拼接起来
  let hexadecimal = "#" + Number(rgbArray[0]).toString(16).padStart(2, '0') +
    Number(rgbArray[1]).toString(16).padStart(2, '0') +
    Number(rgbArray[2]).toString(16).padStart(2, '0')
  return hexadecimal
}

/**
 * 将魔方当前状态表抽象为字符串
 * @param {object} colorData 颜色数据对象
 * @returns UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB 规格的字符串
 */
export function extractAsStr(colorData) {
  const arr = []
  for (let i = 0; i < 6; i++) {
    const { colorI, face } = faceArrToStrMap[i]
    for (let j = 0; j < 9; j++) {
      arr.push(colorData[face[j]].color[colorI])
    }
  }
  return arr.join('')
}

/**
 * extractAsStr 逆向
 * @param {object} colorData 颜色数据对象
 */
export function strToArr(colorData1, colorData2, str) {
  str = str.toLowerCase()
  for (let i = 0; i < 6; i++) {
    const { colorI, face } = faceArrToStrMap[i]
    const strI = i * 9
    for (let j = 0; j < 9; j++) {
      colorData1[face[j]].color[colorI] = str[strI + j]
      colorData2[face[j]].color[colorI] = str[strI + j]
    }
  }
}
