// 存储一些频繁使用的映射
import { operation } from '../utils/formula.js'
import { autoRecoveryFormula } from './formula.js'
const { r, r1, l, l1, f, f1, b, b1 } = operation
const { F2, F3, F4, F6, F7 } = autoRecoveryFormula

/**
 * 旋转角度 -> 公式后缀
 */
export const degToSuffixMap = { '90': '', '-90': '1', '-180': '2', '180': '2' }

/**
 * 层 -> 旋转轴 角度
 */
export const layerToAxisMap = { r: ['x', 1], l: ['x', -1], u: ['y', -1], d: ['y', 1], f: ['z', 1], b: ['z', -1] }

/**
 * 数组格式颜色 -> 字符串
 */
export const faceArrToStrMap = [
  { colorI: 0, face: [4, 5, 6, 3, 8, 7, 2, 1, 0] },
  { colorI: 1, face: [0, 7, 6, 9, 16, 15, 18, 25, 24] },
  { colorI: 4, face: [2, 1, 0, 11, 10, 9, 20, 19, 18] },
  { colorI: 2, face: [20, 19, 18, 21, 26, 25, 22, 23, 24] },
  { colorI: 3, face: [4, 3, 2, 13, 12, 11, 22, 21, 20] },
  { colorI: 5, face: [6, 5, 4, 15, 14, 13, 24, 23, 22] },
]

/**
 * 正方体六个面旋转角度映射
 * 顺序 上 右 下 左 前 后
 */
export const angleMap = ['rotateX(90deg)', 'rotateY(90deg)', 'rotateX(-90deg)', 'rotateY(-90deg)', '', 'rotateY(-180deg)']

/**
 * 正方体六个面在color数组中的下标映射
 * 顺序 上 右 下 左 前 后
 */
export const colorIndexToLayerMap = ['u', 'r', 'd', 'l', 'f', 'b']

/**
 * 按键弹起事件映射
 */
export const keyUpEventMap = {
  ' ': {
    ctrl(that) { that.menuMoveConfig.display = !that.menuMoveConfig.display }, // 切换菜单显隐
    normal(that) { // 魔方视角回正
      that.rubikSCubeRotateConfig.x = 0
      that.rubikSCubeRotateConfig.y = 0
    }
  },
  'Enter': {
    shift(that) { that.autoRecoveryItLayer() }, // 自动复原魔方
    normal(that) { that.disruptionHanlder() }, // 打乱魔方
  },
  'z': {
    ctrl(that) { that.rollBackHandler() }, // 撤销上一步 (仅在开始记录时有效)
  },
  'i': {
    ctrl(that) { that.settingConfig.display = !that.settingConfig.display }, // 切换设置菜单显隐
  }
}

/**
 * 按键按下事件映射
 */
export const keyDownEventMap = {
  'ArrowUp'(that) { that.rubikSCubeRotateConfig.x >= 45 || that.rubikSCubeRotateConfig.x++ },
  'ArrowDown'(that) { that.rubikSCubeRotateConfig.x <= -45 || that.rubikSCubeRotateConfig.x-- },
  'ArrowLeft'(that) {
    that.rubikSCubeRotateConfig.y <= -360 && that._recovery('y')
    that.rubikSCubeRotateConfig.y--
  },
  'ArrowRight'(that) {
    that.rubikSCubeRotateConfig.y >= 360 && that._recovery('y')
    that.rubikSCubeRotateConfig.y++
  },
}

/**
 * 层先法复原所需map
 */
export const autoRecoveryMap = {
  M1: { // 以下步骤使用: b1 b3
    f: [1, { r: f1, l: f }],
    r: [7, { f: r, b: r1 }],
    b: [5, { r: b, l: b1 }],
    l: [3, { b: l, f: l1 }],
  },
  M2: { // 以下步骤使用: b1
    f: [3, l1],
    r: [1, f1],
    b: [7, r1],
    l: [5, b1],
  },
  M3: { // 以下步骤使用: b4
    f: { l: 2, r: 0 },
    r: { f: 0, b: 6 },
    b: { r: 6, l: 4 },
    l: { b: 4, f: 2 },
  },
  M4: { // 以下步骤使用: b4
    0: [{ f: F3, r: F2, u: F4 }, 'f'],
    6: [{ r: F3, b: F2, u: F4 }, 'r'],
    4: [{ b: F3, l: F2, u: F4 }, 'b'],
    2: [{ l: F3, f: F2, u: F4 }, 'l'],
  },
  M5: { // 以下步骤使用: b4 b5
    18: [{ f: true, r: false }, 'f'],
    24: [{ r: true, b: false }, 'r'],
    22: [{ b: true, l: false }, 'b'],
    20: [{ l: true, f: false }, 'l'],
  },
  M6: { // 以下步骤使用: c1
    f: { l: 11, r: 9 },
    r: { f: 9, b: 15 },
    b: { r: 15, l: 13 },
    l: { b: 13, f: 11 },
  },
  M7: { // 以下步骤使用: c1
    9: [{ f: [5, F7], r: [3, F6] }, 'f'],
    15: [{ r: [3, F7], b: [1, F6] }, 'r'],
    13: [{ b: [1, F7], l: [7, F6] }, 'b'],
    11: [{ l: [7, F7], f: [5, F6] }, 'l'],
  },
  M8: { 6: 'r', 10: 'f', 4: 'r', 12: 'l', }, // 以下步骤使用: t1
  M9: { 0: 1, 2: 4, 4: 3, 6: 5, }, // 以下步骤使用: t2
  M10: { // 以下步骤使用: t3
    0: [4, 2, 'f'],
    2: [3, 4, 'l'],
    4: [5, 6, 'b'],
    6: [1, 0, 'r'],
  },
  M11: { // 以下步骤使用: t4
    1: [4, 'f'],
    3: [3, 'l'],
    5: [5, 'b'],
    7: [1, 'r'],
  },
  M12: { // 以下步骤使用: t4
    f: ['b', 7, 1],
    l: ['r', 1, 4],
    b: ['f', 3, 3],
    r: ['l', 5, 5],
  }
}
