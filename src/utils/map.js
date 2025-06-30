// 存储一些频繁使用的映射

/**
 * 角度 -> 公式后缀
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
    shift(that) { that._autoRecovery() }, // 自动复原魔方
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