/**
 * rbg字符串转十六进制
 * @param {string} rgbStr 需转换的rbg字符串
 * @returns 十六进制字符串
 */
export default function rgbToHexadecimal (rgbStr) {
  // 将RGB字符串拆分为三个数值
  let rgbArray = rgbStr.substring(4, rgbStr.length-1).split(',')
  // 将每个数值转换为16进制，并拼接起来
  let hexadecimal = "#" + Number(rgbArray[0]).toString(16).padStart(2, '0') +
    Number(rgbArray[1]).toString(16).padStart(2, '0') +
    Number(rgbArray[2]).toString(16).padStart(2, '0')
  return hexadecimal
}