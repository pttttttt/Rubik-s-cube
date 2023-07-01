import { rotateTime } from "./configInformation"
export const operation = { // 所有层的基础操作
  r: ['r', 90], r1: ['r', -90], r2: ['r', 180, rotateTime * 2],
  l: ['l', 90], l1: ['l', -90], l2: ['l', -180, rotateTime * 2],
  f: ['f', 90], f1: ['f', -90], f2: ['f', 180, rotateTime * 2],
  b: ['b', 90], b1: ['b', -90], b2: ['b', -180, rotateTime * 2],
  u: ['u', 90], u1: ['u', -90], u2: ['u', 180, rotateTime * 2],
  d: ['d', 90], d1: ['d', -90], d2: ['d', -180, rotateTime * 2]
}
const { r, r1, r2, l, l1, l2, f, f1, f2, b, b1, b2, u, u1, u2, d, d2 } = operation
export const formula = { // 公式
  centerLayerRight: { // 中间层 右
    r: [u, b, u1, b1, u1, r1, u, r],
    l: [u, f, u1, f1, u1, l1, u, l],
    f: [u, r, u1, r1, u1, f1, u, f],
    b: [u, l, u1, l1, u1, b1, u, b],
    u: false,
    d: false
  },
  centerLayerLeft: { // 中间层 左
    r: [u1, f1, u, f, u, r, u1, r1],
    l: [u1, b1, u, b, u, l, u1, l1],
    f: [u1, l1, u, l, u, f, u1, f1],
    b: [u1, r1, u, r, u, b, u1, b1],
    u: false,
    d: false
  },
  topLayerOne: { // 顶层 L
    r: [b1, r, b, r1, u1, r1, u, r],
    l: [f1, l, f, l1, u1, l1, u, l],
    f: [r1, f, r, f1, u1, f1, u, f],
    b: [l1, b, l, b1, u1, b1, u, b],
    u: false,
    d: false
  },
  topLayerTwo: { // 顶层 横
    r: [r, b, u, b1, u1, r1],
    l: [l, f, u, f1, u1, l1],
    f: [f, r, u, r1, u1, f1],
    b: [b, l, u, l1, u1, b1],
    u: false,
    d: false
  },
  topLayerFishOne: { // 顶面复原
    r: [b1, u2, b, u, b1, u, b],
    l: [f1, u2, f, u, f1, u, f],
    f: [r1, u2, r, u, r1, u, r],
    b: [l1, u2, l, u, l1, u, l],
    u: false,
    d: false
  },
  topLayerCornerBlock: { // 顶层 角块
    r: [b, l1, b, r2, b1, l, b, r2, b2],
    l: [f, r1, f, l2, f1, r, f, l2, f2],
    f: [r, b1, r, f2, r1, b, r, f2, r2],
    b: [l, f1, l, b2, l1, f, l, b2, l2],
    u: false,
    d: false
  },
  topLayerEdgeBlockOne: { // 顶层 棱块 正
    r: [b, u1, b, u, b, u, b, u1, b1, u1, b2],
    l: [f, u1, f, u, f, u, f, u1, f1, u1, f2],
    f: [r, u1, r, u, r, u, r, u1, r1, u1, r2],
    b: [l, u1, l, u, l, u, l, u1, l1, u1, l2],
    u: false,
    d: false
  }
}
export const formulaButton = [{ // 公式配置按钮
  key: 'centerLayerRight',
  active: false,
  name: '中间层 右'
}, {
  key: 'centerLayerLeft',
  active: false,
  name: '中间层 左'
}, {
  key: 'topLayerOne',
  active: false,
  name: '顶层 L'
}, {
  key: 'topLayerTwo',
  active: false,
  name: '顶层 横'
}, {
  key: 'topLayerFishOne',
  active: false,
  name: '顶面复原'
}, {
  key: 'topLayerCornerBlock',
  active: false,
  name: '顶层 角块'
}, {
  key: 'topLayerEdgeBlockOne',
  active: false,
  name: '顶层 棱块'
}]
export const otherFormula = { // 其他公式
  crossOne: [r, u, r1, u1, r, u, r1, b, u2, b1, u1, l, u2, l1, u1, l, u, l1, u2, f, u2, f1, u1, f, u, f1, u2, f1, u, f, u, r, u1, r1, u1, l1, u, l, u, f, u1, f1, u2, b, u1, b1, u1, r1, u, r, u2, b1, u, b, u, l, u1, l1, r1, f, r, f1, u1, f1, u1, f, u, f1, u1, f, u, f1, u, f, u, r, u1, r, u, r, u, r, u1, r1, u1, r2],
  crossTwo: [b, u, b1, u1, b, u, b1, l, u2, l1, u1, f, u2, f1, u1, f, u, f1, u2, r, u2, r1, u1, r, u, r1, u2, r1, u, r, u, b, u1, b1, u1, f1, u, f, u, r, u1, r1, u2, l, u1, l1, u1, b1, u, b, u2, l1, u, l, u, f, u1, f1, b1, r, b, r1, u1, r1, u, r, l1, u2, l, u, l1, u1, l, u, l1, u, l, u, f, u1, f, u, f, u, f, u1, f1, u1, f2],
  crossThree: [b1, u1, b, u, b1, u1, b, r1, u2, r, u, f1, u2, f, u, f1, u1, f, u2, f, u2, f1, u1, f, u, f1, u, b, u1, b1, u1, r1, u, r, u, l, u1, l1, u1, b1, u, b, u, f, u1, f1, u1, l1, u, l, u2, r, u1, r1, u1, f1, u, f, l1, b, l, b1, u1, b1, u, b, u2, f, r1, f, l2, f1, r, f, l2, f2, u],
  flower: [r2, l2, u2, d2, f2, b2],
  changeCenterBlock: [r1, l, u1, d, f1, b, r1, l]
}
export const otherFormulaButton = [{ // 其他公司配置按钮
  key: 'changeCenterBlock',
  name: '交换中心块'
}, {
  key: 'flower',
  name: '花'
}, {
  key: 'crossOne',
  name: '十字 一'
}, {
  key: 'crossTwo',
  name: '十字 二'
}, {
  key: 'crossThree',
  name: '十字 三'
}]
