const defaultColor = {
    u: '#fef12b',
    d: '#ffffff',
    r: '#dd1416',
    l: '#ff9c13',
    f: '#145dad',
    b: '#52b802',
    hide: '#efefef'
}
const whiteBlack = {
    u: 'black',
    d: 'white',
    r: 'black',
    l: 'white',
    f: 'black',
    b: 'white',
    hide: 'black'
}
const fresh = {
    u: '#ffffff',
    d: '#ffffff',
    r: '#ff9c13',
    l: '#ff9c13',
    f: '#52b802',
    b: '#52b802',
    hide: '#efefef'
}
const greenWhite = {
    u: '#7bc700',
    d: '#ffffff',
    r: '#7bc700',
    l: '#ffffff',
    f: '#7bc700',
    b: '#ffffff',
    hide: 'transparent'
}
const transparent = {
  u: 'rgb(254, 241, 43)',
  d: 'rgb(254, 254, 254)',
  f: 'rgb(20, 93, 173)',
  b: 'rgb(82, 184, 2)',
  r: 'rgb(221, 20, 22)',
  l: 'rgb(255, 156, 19)',
  hide: 'rgb(255, 255, 255)',
  border: 'rgb(0, 0, 0)',
  transparency: {
    u: 0.5,
    d: 0.5,
    f: 0.5,
    b: 0.5,
    r: 0.5,
    l: 0.5,
    hide: 0.2,
    get uOverlap () {
      const tmp = 1 - this.u
      return 1 - tmp * tmp
    },
    get dOverlap () {
      const tmp = 1 - this.d
      return 1 - tmp * tmp
    },
    get fOverlap () {
      const tmp = 1 - this.f
      return 1 - tmp * tmp
    },
    get bOverlap () {
      const tmp = 1 - this.b
      return 1 - tmp * tmp
    },
    get rOverlap () {
      const tmp = 1 - this.r
      return 1 - tmp * tmp
    },
    get lOverlap () {
      const tmp = 1 - this.l
      return 1 - tmp * tmp
    },
    get hideOverlap () {
      const tmp = 1 - this.hide
      return 1 - tmp * tmp
    },
    set whole (newValue) {
      for (const key in this) {
        if (key === 'hide') continue
        this[key] = newValue
      }
    },
    get whole () {
      return this.u
    }
  }
}
defaultColor, whiteBlack, fresh, greenWhite, transparent
export const bgcColor = '#7bc700' // 背景颜色
export const pageColor = transparent // 魔方各个面的颜色
export const rotateTime = 200 // 魔方单层旋转 90度 所需时间
export const initialAngle = { // 魔方初始角度
    x: -15,
    y: -15
}
export const companyLength = 100 // 魔方渲染时每个块的偏移量
export const tips = [{ // 魔方表面遮罩层配置信息
  id: "u",
  deg: 'rotateX(90deg)'
},{
  id: "d",
  deg: 'rotateX(-90deg)'
},{
  id: "r",
  deg: 'rotateY(90deg)'
},{
  id: "l",
  deg: 'rotateY(-90deg)'
},{
  id: "f",
  deg: ''
},{
  id: "b",
  deg: 'rotateY(180deg)'
}]
