/**
 * 所有层的基础操作
 */
export const operation = {
  r: ['r', 90], r1: ['r', -90], r2: ['r', 180],
  l: ['l', 90], l1: ['l', -90], l2: ['l', -180],
  f: ['f', 90], f1: ['f', -90], f2: ['f', 180],
  b: ['b', 90], b1: ['b', -90], b2: ['b', -180],
  u: ['u', 90], u1: ['u', -90], u2: ['u', 180],
  d: ['d', 90], d1: ['d', -90], d2: ['d', -180]
}
const { r, r1, r2, l, l1, l2, f, f1, f2, b, b1, b2, u, u1, u2, d, d1, d2 } = operation
/**
 * 每一个面相对位置映射
 */
const relativePosition = {
  r: { r: 'b', l: 'f', f: 'r', b: 'l' },
  l: { r: 'f', l: 'b', f: 'l', b: 'r' },
  f: { r: 'r', l: 'l', f: 'f', b: 'b' },
  b: { r: 'l', l: 'r', f: 'b', b: 'f' }
}
/**
 * 传入一个公式 自动生成所有面的公式
 * @param {array} formula 魔方公式
 * @returns 生成的所有公式
 */
function autoGenerateFormula(formula) {
  const result = { r: false, l: false, f: false, b: false, u: false, d: false }
  for (const key in relativePosition) {
    result[key] = formula.map(([layer, deg]) => relativePosition[layer] ? newFormula(layer, deg, key) : [layer, deg])
  }
  function newFormula(layer, deg, key) {
    let newKey = relativePosition[key][layer]
    newKey += deg === 90 ? '' : deg === -90 ? '1' : '2'
    return operation[newKey]
  }
  return result
}
export const formula = { // 层先法复原公式
  centerLayerRight: autoGenerateFormula([u, r, u1, r1, u1, f1, u, f]), // 中间层 右
  centerLayerLeft: autoGenerateFormula([u1, l1, u, l, u, f, u1, f1]),  // 中间层 左
  centerLayerFlip: autoGenerateFormula([r, u2, r1, u, r, u2, r1, u, f1, u1, f]), // 中间层 翻转
  topLayerOne: autoGenerateFormula([r1, f, r, f1, u1, f1, u, f]),  // 顶层 L
  topLayerTwo: autoGenerateFormula([f, r, u, r1, u1, f1]),  // 顶层 横
  topLayerFishOne: autoGenerateFormula([r1, u2, r, u, r1, u, r]),  // 顶面复原 一
  topLayerFishTwo: autoGenerateFormula([r1, u2, r, u, r1, u1, r, u, r1, u, r]), // 顶面复原 二
  topLayerCornerBlock: autoGenerateFormula([r, b1, r, f2, r1, b, r, f2, r2]),  // 顶层 角块
  topLayerEdgeBlockOne: autoGenerateFormula([r, u1, r, u, r, u, r, u1, r1, u1, r2]),  // 顶层 棱块 正
}

export const autoRecoveryFormula = { // 自动复原函数所需额外公式
  F1: autoGenerateFormula([f1, u, l1]), // 顶层棱块翻转 以下步骤使用: b2
  F2: autoGenerateFormula([r, u, r1]), // 底层角块复原 以下步骤使用: b4
  F3: autoGenerateFormula([f1, u1, f]), // 底层角块复原 以下步骤使用: b4
  F4: autoGenerateFormula([r, u2, r1, u1, r, u, r1]), // 底层角块复原 以下步骤使用: b4
  F5: autoGenerateFormula([r, u, r1, u1, r, u, r1]), // 底层角块复原 以下步骤使用: b5
  F6: autoGenerateFormula([r, u1, r1, u1, f1, u, f]), // 中间层棱块复原 以下步骤使用: c1
  F7: autoGenerateFormula([f1, u, f, u, r, u1, r1]), // 中间层棱块复原 以下步骤使用: c1
}

export const formulaButton = [ // 公式配置按钮
  { key: 'centerLayerRight', active: false, name: '中间层 右' },
  { key: 'centerLayerLeft', active: false, name: '中间层 左' },
  { key: 'centerLayerFlip', active: false, name: '中间层 翻转' },
  { key: 'topLayerOne', active: false, name: '顶层 L' },
  { key: 'topLayerTwo', active: false, name: '顶层 横' },
  { key: 'topLayerFishOne', active: false, name: '顶面 一' },
  { key: 'topLayerFishTwo', active: false, name: '顶面 二' },
  { key: 'topLayerCornerBlock', active: false, name: '顶层 角块' },
  { key: 'topLayerEdgeBlockOne', active: false, name: '顶层 棱块' }
]

export const otherFormula = { // 其他公式
  crossOne: [l2, b2, d, r2, d2, f2, u, b2, f2, d1, l2, u2, b2, u1, l1, b2, f2, d2, u2, r1],
  crossTwo: [f2, l2, d, b2, d2, r2, u, l2, r2, d1, f2, u2, l2, u1, b1, l2, r2, d2, u2, f1],
  crossThree: [l2, b2, d, r2, d2, f2, u, b2, f2, d1, l2, u2, b2, u1, l1, b2, f2, d2, u2, r1],
  flower: [r2, l2, u2, d2, f2, b2],
  // abc: [b2, d, r2, d, r2, f2, u, l2, r2, d1, l2, d1, f1, l2, f2, l1, f2, r2, f1, l2, d1, u1], // b2dr2dr2f2ul2r2d'l2d'f'l2f2l'f2r2f'l2d'u'
  // abc: [b2, r2, b2, f2, u1, b2, r2, d2, f2, l2, f2, r1, f2, d, u1, l2, b1, r2, f2, l1, b2, u2], // b2r2b2f2u'b2r2d2f2l2f2r'f2du'l2b'r2f2l'b2u2
  changeCenterBlock: [r1, l, u1, d, f1, b, r1, l]
}

export const otherFormulaButton = [ // 其他公式配置按钮
  { key: 'changeCenterBlock', name: '交换中心块' },
  { key: 'flower', name: '花' },
  { key: 'crossOne', name: '十字 一' },
  { key: 'crossTwo', name: '十字 二' },
  { key: 'crossThree', name: '十字 三' }
]
