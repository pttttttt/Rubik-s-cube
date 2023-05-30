import { rotateTime } from "./configInformation"

export const operation = { // 所有层的基础操作
    r: [['r', 90], ['r', -90], ['r', 180, rotateTime * 2]],
    l: [['l', 90], ['l', -90], ['l', -180, rotateTime * 2]],
    f: [['f', 90], ['f', -90], ['f', 180, rotateTime * 2]],
    b: [['b', 90], ['b', -90], ['b', -180, rotateTime * 2]],
    u: [['u', 90], ['u', -90], ['u', 180, rotateTime * 2]],
    d: [['d', 90], ['d', -90], ['d', -180, rotateTime * 2]]
  }
export const formula = { // 公式
    centerLayerRight: { // 中间层 右
      r: [operation.u[0], operation.b[0], operation.u[1], operation.b[1], operation.u[1], operation.r[1], operation.u[0], operation.r[0]],
      l: [operation.u[0], operation.f[0], operation.u[1], operation.f[1], operation.u[1], operation.l[1], operation.u[0], operation.l[0]],
      f: [operation.u[0], operation.r[0], operation.u[1], operation.r[1], operation.u[1], operation.f[1], operation.u[0], operation.f[0]],
      b: [operation.u[0], operation.l[0], operation.u[1], operation.l[1], operation.u[1], operation.b[1], operation.u[0], operation.b[0]],
      u: false,
      d: false
    },
    centerLayerLeft: { // 中间层 左
      r: [operation.u[1], operation.f[1], operation.u[0], operation.f[0], operation.u[0], operation.r[0], operation.u[1], operation.r[1]],
      l: [operation.u[1], operation.b[1], operation.u[0], operation.b[0], operation.u[0], operation.l[0], operation.u[1], operation.l[1]],
      f: [operation.u[1], operation.l[1], operation.u[0], operation.l[0], operation.u[0], operation.f[0], operation.u[1], operation.f[1]],
      b: [operation.u[1], operation.r[1], operation.u[0], operation.r[0], operation.u[0], operation.b[0], operation.u[1], operation.b[1]],
      u: false,
      d: false
    },
    topLayerOne: { // 顶层 L
      r: [operation.b[1], operation.r[0], operation.b[0], operation.r[1], operation.u[1], operation.r[1], operation.u[0], operation.r[0]],
      l: [operation.f[1], operation.l[0], operation.f[0], operation.l[1], operation.u[1], operation.l[1], operation.u[0], operation.l[0]],
      f: [operation.r[1], operation.f[0], operation.r[0], operation.f[1], operation.u[1], operation.f[1], operation.u[0], operation.f[0]],
      b: [operation.l[1], operation.b[0], operation.l[0], operation.b[1], operation.u[1], operation.b[1], operation.u[0], operation.b[0]],
      u: false,
      d: false
    },
    topLayerTwo: { // 顶层 横
      r: [operation.r[0], operation.b[0], operation.u[0], operation.b[1], operation.u[1], operation.r[1]],
      l: [operation.l[0], operation.f[0], operation.u[0], operation.f[1], operation.u[1], operation.l[1]],
      f: [operation.f[0], operation.r[0], operation.u[0], operation.r[1], operation.u[1], operation.f[1]],
      b: [operation.b[0], operation.l[0], operation.u[0], operation.l[1], operation.u[1], operation.b[1]],
      u: false,
      d: false
    },
    topLayerFishOne: { // 顶面复原
      r: [operation.b[1], operation.u[2], operation.b[0], operation.u[0], operation.b[1], operation.u[0], operation.b[0]],
      l: [operation.f[1], operation.u[2], operation.f[0], operation.u[0], operation.f[1], operation.u[0], operation.f[0]],
      f: [operation.r[1], operation.u[2], operation.r[0], operation.u[0], operation.r[1], operation.u[0], operation.r[0]],
      b: [operation.l[1], operation.u[2], operation.l[0], operation.u[0], operation.l[1], operation.u[0], operation.l[0]],
      u: false,
      d: false
    },
    topLayerCornerBlock: { // 顶层 角块
      r: [operation.b[0], operation.l[1], operation.b[0], operation.r[2], operation.b[1], operation.l[0], operation.b[0], operation.r[2], operation.b[2]],
      l: [operation.f[0], operation.r[1], operation.f[0], operation.l[2], operation.f[1], operation.r[0], operation.f[0], operation.l[2], operation.f[2]],
      f: [operation.r[0], operation.b[1], operation.r[0], operation.f[2], operation.r[1], operation.b[0], operation.r[0], operation.f[2], operation.r[2]],
      b: [operation.l[0], operation.f[1], operation.l[0], operation.b[2], operation.l[1], operation.f[0], operation.l[0], operation.b[2], operation.l[2]],
      u: false,
      d: false
    },
    topLayerEdgeBlockOne: { // 顶层 棱块 正
      r: [operation.b[0], operation.u[1], operation.b[0], operation.u[0], operation.b[0], operation.u[0], operation.b[0], operation.u[1], operation.b[1], operation.u[1], operation.b[2]],
      l: [operation.f[0], operation.u[1], operation.f[0], operation.u[0], operation.f[0], operation.u[0], operation.f[0], operation.u[1], operation.f[1], operation.u[1], operation.f[2]],
      f: [operation.r[0], operation.u[1], operation.r[0], operation.u[0], operation.r[0], operation.u[0], operation.r[0], operation.u[1], operation.r[1], operation.u[1], operation.r[2]],
      b: [operation.l[0], operation.u[1], operation.l[0], operation.u[0], operation.l[0], operation.u[0], operation.l[0], operation.u[1], operation.l[1], operation.u[1], operation.l[2]],
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
  
// 十字
// [['r', 90], ['u', 90], ['r', -90], ['u', -90], ['r', 90], ['u', 90], ['r', -90], ['b', 90], ['u', 180, 400], ['b', -90], ['f', 90], ['u', 180, 400], ['f', -90], ['u', -90], ['f', 90], ['u', 90], ['f', -90], ['l', 90], ['u', 180, 400], ['l', -90], ['u', -90], ['l', 90], ['u', 90], ['l', -90], ['u', -90], ['l', -90], ['u', 90], ['l', 90], ['u', 90], ['f', 90], ['u', -90], ['f', -90], ['u', 180, 400], ['b', 90], ['u', -90], ['b', -90], ['u', -90], ['r', -90], ['u', 90], ['r', 90], ['u', 180, 400], ['b', -90], ['u', 90], ['b', 90], ['u', 90], ['l', 90], ['u', -90], ['l', -90], ['u', -90], ['r', 90], ['u', -90], ['r', -90], ['u', -90], ['f', -90], ['u', 90], ['l', 90], ['f', 90], ['l', -90], ['u', -90], ['l', -90], ['u', 90], ['l', 90], ['f', -90], ['u', 180, 400], ['f', 90], ['u', 90], ['f', -90], ['u', 90], ['f', 90], ['r', 90], ['b', -90], ['r', 90], ['f', 180, 400], ['r', -90], ['b', 90], ['r', 90], ['f', 180, 400], ['r', 180, 400], ['u', -90], ['f', 180, 400], ['u', 90], ['f', 90], ['u', 90], ['f', -90], ['u', -90], ['f', -90], ['u', -90], ['f', -90], ['u', 90], ['f', -90]]

// 十字 2
// [['b', 90], ['u', 90], ['b', -90], ['u', -90], ['b', 90], ['u', 90], ['b', -90], ['l', 90], ['u', 180, 400], ['l', -90], ['u', -90], ['f', 90], ['u', 180, 400], ['f', -90], ['u', -90], ['f', 90], ['u', 90], ['f', -90], ['u', 180, 400], ['r', 90], ['u', -90], ['r', -90], ['u', 180, 400], ['r', 90], ['u', 90], ['r', -90], ['u', -90], ['l', -90], ['u', 90], ['l', 90], ['u', 90], ['f', 90], ['u', -90], ['f', -90], ['u', -90], ['b', -90], ['u', 90], ['b', 90], ['u', 90], ['l', 90], ['u', -90], ['l', -90], ['r', -90], ['u', 90], ['r', 90], ['u', 90], ['b', 90], ['u', -90], ['b', -90], ['u', 90], ['f', -90], ['u', 90], ['f', 90], ['u', 90], ['r', 90], ['u', -90], ['r', -90], ['b', -90], ['r', 90], ['b', 90], ['r', -90], ['u', -90], ['r', -90], ['u', 90], ['r', 180, 400], ['b', 90], ['u', 90], ['b', -90], ['u', -90], ['r', -90], ['f', -90], ['u', 180, 400], ['f', 90], ['u', 90], ['f', -90], ['u', 90], ['f', 90], ['r', -90], ['u', -90], ['r', 90], ['u', -90], ['r', -90], ['u', 180, 400], ['r', 90], ['u', 90], ['r', 180, 400], ['u', 90], ['r', 90], ['u', 90], ['r', -90], ['u', -90], ['r', -90], ['u', -90], ['r', -90], ['u', 90], ['r', -90]]

// 花
// [['r', 180, 400], ['l', -180, 400], ['u', 180, 400], ['d', -180, 400], ['f', 180, 400], ['b', -180, 400]]


    // topLayerEdgeBlockTwo: { // 顶层 棱块 逆
    //   r: [operation.b[2], operation.u[0], operation.b[0], operation.u[0], operation.b[1], operation.u[1], operation.b[1], operation.u[1], operation.b[1], operation.u[0], operation.b[1]],
    //   l: [operation.f[2], operation.u[0], operation.f[0], operation.u[0], operation.f[1], operation.u[1], operation.f[1], operation.u[1], operation.f[1], operation.u[0], operation.f[1]],
    //   f: [operation.r[2], operation.u[0], operation.r[0], operation.u[0], operation.r[1], operation.u[1], operation.r[1], operation.u[1], operation.r[1], operation.u[0], operation.r[1]],
    //   b: [operation.l[2], operation.u[0], operation.l[0], operation.u[0], operation.l[1], operation.u[1], operation.l[1], operation.u[1], operation.l[1], operation.u[0], operation.l[1]],
    //   u: false,
    //   d: false
    // },
    // topLayerFishTwo: { // 顶层 小鱼 逆
    //   r: [operation.b[1], operation.u[1], operation.b[0], operation.u[1], operation.b[1], operation.u[2], operation.b[0]],
    //   l: [operation.f[1], operation.u[1], operation.f[0], operation.u[1], operation.f[1], operation.u[2], operation.f[0]],
    //   f: [operation.r[1], operation.u[1], operation.r[0], operation.u[1], operation.r[1], operation.u[2], operation.r[0]],
    //   b: [operation.l[1], operation.u[1], operation.l[0], operation.u[1], operation.l[1], operation.u[2], operation.l[0]],
    //   u: false,
    //   d: false
    // },