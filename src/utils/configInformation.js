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
  u: 'rgba(0, 0, 0, .1)',
  d: 'rgba(0, 0, 0, .1)',
  f: 'rgba(0, 0, 0, .1)',
  b: 'rgba(0, 0, 0, .1)',
  r: 'rgba(0, 0, 0, .1)',
  l: 'rgba(0, 0, 0, .1)',
  hide: 'rgba(0, 0, 0, .1)'
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
