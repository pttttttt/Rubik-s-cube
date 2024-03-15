/**
 * 将传入的字符串复制到剪切板
 * @param {string} text 需粘贴到剪贴板的字符串
 * @returns {Promise} promise
 */
export default function pasteTextToClipboard (text) {
  return navigator.clipboard.writeText(text)
}
