/**
 * 将传入的字符串复制到剪切板
 * @param {string} text 需粘贴到剪贴板的字符串
 * @returns {boolean} 成功与否
 */
export default function pasteTextToClipboard (text) {
  let textarea = document.createElement("input")//创建input元素
  const currentFocus = document.activeElement//当前获得焦点的元素，保存一下
  document.body.appendChild(textarea)//添加元素
  textarea.value = text
  textarea.focus()
  textarea.setSelectionRange(0, textarea.value.length)//获取光标起始位置到结束位置
  //textarea.select(); 这个是直接选中所有的，效果和上面一样
  let flag = true
  try {
    flag = document.execCommand("copy")//执行复制
  } catch(eo) {
    flag = false
  }
  document.body.removeChild(textarea)//删除元素
  currentFocus.focus() //恢复焦点
  return flag
}
