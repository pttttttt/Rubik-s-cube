/**
 * 用于魔方单层旋转之后的颜色变换
 * @param {object} data 要操作的魔方体配置对象
 * @param {string} layer 要操作的层
 * @param {number} deg 当前旋转的角度
 */
export default function colorExchange (data, layer, deg) { // 旋转后的颜色变换函数
  let a, b, c, d, e, A, B, C, D, E // 中转变量
  // 通过最low的方式去实现的颜色变换(手动去调换每一个面的颜色) 暂时没找到合适的方法去简化代码
  // 外层switch区分层 内层区分旋转角度 旋转方向从上往下依次为：顺时针，逆时针，顺时针
  switch(layer) {
    case 'u':
      switch(deg) {
        case -90:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[6].angle[0].color
          data[0].angle[1].color = data[6].angle[5].color
          data[0].angle[4].color = data[6].angle[1].color

          data[6].angle[0].color = data[4].angle[0].color
          data[6].angle[5].color = data[4].angle[3].color
          data[6].angle[1].color = data[4].angle[5].color

          data[4].angle[0].color = data[2].angle[0].color
          data[4].angle[3].color = data[2].angle[4].color
          data[4].angle[5].color = data[2].angle[3].color

          data[2].angle[0].color = a
          data[2].angle[4].color = b
          data[2].angle[3].color = c

          d = data[1].angle[0].color 
          e = data[1].angle[4].color

          data[1].angle[0].color = data[7].angle[0].color
          data[1].angle[4].color = data[7].angle[1].color

          data[7].angle[0].color = data[5].angle[0].color
          data[7].angle[1].color = data[5].angle[5].color

          data[5].angle[0].color = data[3].angle[0].color
          data[5].angle[5].color = data[3].angle[3].color

          data[3].angle[0].color = d
          data[3].angle[3].color = e
          break
        case 90:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[2].angle[0].color
          data[0].angle[1].color = data[2].angle[4].color
          data[0].angle[4].color = data[2].angle[3].color

          data[2].angle[0].color = data[4].angle[0].color
          data[2].angle[4].color = data[4].angle[3].color
          data[2].angle[3].color = data[4].angle[5].color

          data[4].angle[0].color = data[6].angle[0].color
          data[4].angle[3].color = data[6].angle[5].color
          data[4].angle[5].color = data[6].angle[1].color

          data[6].angle[0].color = a
          data[6].angle[5].color = b
          data[6].angle[1].color = c

          d = data[1].angle[0].color 
          e = data[1].angle[4].color

          data[1].angle[0].color = data[3].angle[0].color
          data[1].angle[4].color = data[3].angle[3].color

          data[3].angle[0].color = data[5].angle[0].color
          data[3].angle[3].color = data[5].angle[5].color

          data[5].angle[0].color = data[7].angle[0].color
          data[5].angle[5].color = data[7].angle[1].color

          data[7].angle[0].color = d
          data[7].angle[1].color = e
          break
        case -180:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[4].angle[0].color
          data[0].angle[1].color = data[4].angle[3].color
          data[0].angle[4].color = data[4].angle[5].color

          data[4].angle[0].color = a
          data[4].angle[3].color = b
          data[4].angle[5].color = c

          A = data[6].angle[0].color
          B = data[6].angle[5].color
          C = data[6].angle[1].color

          data[6].angle[0].color = data[2].angle[0].color
          data[6].angle[5].color = data[2].angle[4].color
          data[6].angle[1].color = data[2].angle[3].color

          data[2].angle[0].color = A
          data[2].angle[4].color = B
          data[2].angle[3].color = C

          d = data[1].angle[0].color
          e = data[1].angle[4].color

          data[1].angle[0].color = data[5].angle[0].color
          data[1].angle[4].color = data[5].angle[5].color

          data[5].angle[0].color = d
          data[5].angle[5].color = e

          D = data[7].angle[0].color
          E = data[7].angle[1].color

          data[7].angle[0].color = data[3].angle[0].color
          data[7].angle[1].color = data[3].angle[3].color

          data[3].angle[0].color = D
          data[3].angle[3].color = E
          break
      }
      break
    case 'd':
      switch(deg) {
        case -90:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[20].angle[2].color
          data[22].angle[3].color = data[20].angle[4].color
          data[22].angle[5].color = data[20].angle[3].color

          data[20].angle[2].color = data[18].angle[2].color
          data[20].angle[4].color = data[18].angle[1].color
          data[20].angle[3].color = data[18].angle[4].color

          data[18].angle[2].color = data[24].angle[2].color
          data[18].angle[1].color = data[24].angle[5].color
          data[18].angle[4].color = data[24].angle[1].color

          data[24].angle[2].color = a
          data[24].angle[5].color = b
          data[24].angle[1].color = c

          d = data[21].angle[2].color 
          e = data[21].angle[3].color

          data[21].angle[2].color = data[19].angle[2].color
          data[21].angle[3].color = data[19].angle[4].color

          data[19].angle[2].color = data[25].angle[2].color
          data[19].angle[4].color = data[25].angle[1].color

          data[25].angle[2].color = data[23].angle[2].color
          data[25].angle[1].color = data[23].angle[5].color

          data[23].angle[2].color = d
          data[23].angle[5].color = e
          break
        case 90:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[24].angle[2].color
          data[22].angle[3].color = data[24].angle[5].color
          data[22].angle[5].color = data[24].angle[1].color

          data[24].angle[2].color = data[18].angle[2].color
          data[24].angle[5].color = data[18].angle[1].color
          data[24].angle[1].color = data[18].angle[4].color

          data[18].angle[2].color = data[20].angle[2].color
          data[18].angle[1].color = data[20].angle[4].color
          data[18].angle[4].color = data[20].angle[3].color

          data[20].angle[2].color = a
          data[20].angle[4].color = b
          data[20].angle[3].color = c

          d = data[21].angle[2].color 
          e = data[21].angle[3].color

          data[21].angle[2].color = data[23].angle[2].color
          data[21].angle[3].color = data[23].angle[5].color

          data[23].angle[2].color = data[25].angle[2].color
          data[23].angle[5].color = data[25].angle[1].color

          data[25].angle[2].color = data[19].angle[2].color
          data[25].angle[1].color = data[19].angle[4].color

          data[19].angle[2].color = d
          data[19].angle[4].color = e
          break
        case -180:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[18].angle[2].color
          data[22].angle[3].color = data[18].angle[1].color
          data[22].angle[5].color = data[18].angle[4].color

          data[18].angle[2].color = a
          data[18].angle[1].color = b 
          data[18].angle[4].color = c

          A = data[20].angle[2].color
          B = data[20].angle[4].color
          C = data[20].angle[3].color

          data[20].angle[2].color = data[24].angle[2].color
          data[20].angle[4].color = data[24].angle[5].color
          data[20].angle[3].color = data[24].angle[1].color

          data[24].angle[2].color = A
          data[24].angle[5].color = B
          data[24].angle[1].color = C

          d = data[21].angle[2].color 
          e = data[21].angle[3].color

          data[21].angle[2].color = data[25].angle[2].color
          data[21].angle[3].color = data[25].angle[1].color

          data[25].angle[2].color = d
          data[25].angle[1].color = e

          D = data[19].angle[2].color
          E = data[19].angle[4].color

          data[19].angle[2].color = data[23].angle[2].color
          data[19].angle[4].color = data[23].angle[5].color

          data[23].angle[2].color = D
          data[23].angle[5].color = E
          break
      }
      break
    case 'r':
      switch(deg) {
        case 90:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[18].angle[4].color
          data[0].angle[1].color = data[18].angle[1].color
          data[0].angle[4].color = data[18].angle[2].color

          data[18].angle[4].color = data[24].angle[2].color
          data[18].angle[1].color = data[24].angle[1].color
          data[18].angle[2].color = data[24].angle[5].color

          data[24].angle[2].color = data[6].angle[5].color
          data[24].angle[1].color = data[6].angle[1].color
          data[24].angle[5].color = data[6].angle[0].color

          data[6].angle[5].color = a
          data[6].angle[1].color = b
          data[6].angle[0].color = c

          d = data[7].angle[0].color
          e = data[7].angle[1].color

          data[7].angle[0].color = data[9].angle[4].color
          data[7].angle[1].color = data[9].angle[1].color

          data[9].angle[4].color = data[25].angle[2].color
          data[9].angle[1].color = data[25].angle[1].color

          data[25].angle[2].color = data[15].angle[5].color
          data[25].angle[1].color = data[15].angle[1].color

          data[15].angle[5].color = d
          data[15].angle[1].color = e
          break
        case -90:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[6].angle[5].color
          data[0].angle[1].color = data[6].angle[1].color
          data[0].angle[4].color = data[6].angle[0].color

          data[6].angle[5].color = data[24].angle[2].color
          data[6].angle[1].color = data[24].angle[1].color
          data[6].angle[0].color = data[24].angle[5].color

          data[24].angle[2].color = data[18].angle[4].color
          data[24].angle[1].color = data[18].angle[1].color
          data[24].angle[5].color = data[18].angle[2].color

          data[18].angle[4].color = a
          data[18].angle[1].color = b
          data[18].angle[2].color = c

          d = data[7].angle[0].color
          e = data[7].angle[1].color

          data[7].angle[0].color = data[15].angle[5].color
          data[7].angle[1].color = data[15].angle[1].color

          data[15].angle[5].color = data[25].angle[2].color
          data[15].angle[1].color = data[25].angle[1].color

          data[25].angle[2].color = data[9].angle[4].color
          data[25].angle[1].color = data[9].angle[1].color

          data[9].angle[4].color = d
          data[9].angle[1].color = e
          break
        case 180:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[24].angle[2].color
          data[0].angle[1].color = data[24].angle[1].color
          data[0].angle[4].color = data[24].angle[5].color

          data[24].angle[2].color = a
          data[24].angle[1].color = b
          data[24].angle[5].color = c

          A = data[18].angle[4].color
          B = data[18].angle[1].color
          C = data[18].angle[2].color

          data[18].angle[4].color = data[6].angle[5].color
          data[18].angle[1].color = data[6].angle[1].color
          data[18].angle[2].color = data[6].angle[0].color

          data[6].angle[5].color = A
          data[6].angle[1].color = B
          data[6].angle[0].color = C

          d = data[7].angle[0].color 
          e = data[7].angle[1].color

          data[7].angle[0].color = data[25].angle[2].color
          data[7].angle[1].color = data[25].angle[1].color

          data[25].angle[2].color = d
          data[25].angle[1].color = e

          D = data[9].angle[4].color
          E = data[9].angle[1].color

          data[9].angle[4].color = data[15].angle[5].color
          data[9].angle[1].color = data[15].angle[1].color

          data[15].angle[5].color = D
          data[15].angle[1].color = E
          break
      }
      break
    case 'l':
      switch(deg) {
        case 90:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[4].angle[5].color
          data[22].angle[3].color = data[4].angle[3].color
          data[22].angle[5].color = data[4].angle[0].color

          data[4].angle[5].color = data[2].angle[0].color
          data[4].angle[3].color = data[2].angle[3].color
          data[4].angle[0].color = data[2].angle[4].color

          data[2].angle[0].color = data[20].angle[4].color
          data[2].angle[3].color = data[20].angle[3].color
          data[2].angle[4].color = data[20].angle[2].color

          data[20].angle[4].color = a
          data[20].angle[3].color = b
          data[20].angle[2].color = c

          d = data[21].angle[2].color
          e = data[21].angle[3].color

          data[21].angle[2].color = data[13].angle[5].color
          data[21].angle[3].color = data[13].angle[3].color

          data[13].angle[5].color = data[3].angle[0].color
          data[13].angle[3].color = data[3].angle[3].color

          data[3].angle[0].color = data[11].angle[4].color
          data[3].angle[3].color = data[11].angle[3].color

          data[11].angle[4].color = d
          data[11].angle[3].color = e
          break
        case -90:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[20].angle[4].color
          data[22].angle[3].color = data[20].angle[3].color
          data[22].angle[5].color = data[20].angle[2].color

          data[20].angle[4].color = data[2].angle[0].color
          data[20].angle[3].color = data[2].angle[3].color
          data[20].angle[2].color = data[2].angle[4].color

          data[2].angle[0].color = data[4].angle[5].color
          data[2].angle[3].color = data[4].angle[3].color
          data[2].angle[4].color = data[4].angle[0].color

          data[4].angle[5].color = a
          data[4].angle[3].color = b
          data[4].angle[0].color = c

          d = data[21].angle[2].color 
          e = data[21].angle[3].color

          data[21].angle[2].color = data[11].angle[4].color
          data[21].angle[3].color = data[11].angle[3].color

          data[11].angle[4].color = data[3].angle[0].color
          data[11].angle[3].color = data[3].angle[3].color

          data[3].angle[0].color = data[13].angle[5].color
          data[3].angle[3].color = data[13].angle[3].color

          data[13].angle[5].color = d
          data[13].angle[3].color = e
          break
        case 180:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[2].angle[0].color
          data[22].angle[3].color = data[2].angle[3].color
          data[22].angle[5].color = data[2].angle[4].color

          data[2].angle[0].color = a
          data[2].angle[3].color = b
          data[2].angle[4].color = c

          A = data[4].angle[5].color
          B = data[4].angle[3].color
          C = data[4].angle[0].color

          data[4].angle[5].color = data[20].angle[4].color
          data[4].angle[3].color = data[20].angle[3].color
          data[4].angle[0].color = data[20].angle[2].color

          data[20].angle[4].color = A
          data[20].angle[3].color = B
          data[20].angle[2].color = C

          d = data[21].angle[2].color 
          e = data[21].angle[3].color

          data[21].angle[2].color = data[3].angle[0].color
          data[21].angle[3].color = data[3].angle[3].color

          data[3].angle[0].color = d
          data[3].angle[3].color = e

          D = data[13].angle[5].color
          E = data[13].angle[3].color

          data[13].angle[5].color  = data[11].angle[4].color
          data[13].angle[3].color  = data[11].angle[3].color

          data[11].angle[4].color = D
          data[11].angle[3].color = E
          break
      }
      break
    case 'f':
      switch(deg) {
        case 90:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[2].angle[3].color
          data[0].angle[1].color = data[2].angle[0].color
          data[0].angle[4].color = data[2].angle[4].color

          data[2].angle[3].color = data[20].angle[2].color
          data[2].angle[0].color = data[20].angle[3].color
          data[2].angle[4].color = data[20].angle[4].color

          data[20].angle[2].color = data[18].angle[1].color
          data[20].angle[3].color = data[18].angle[2].color
          data[20].angle[4].color = data[18].angle[4].color

          data[18].angle[1].color = a
          data[18].angle[2].color = b
          data[18].angle[4].color = c

          d = data[1].angle[0].color
          e = data[1].angle[4].color

          data[1].angle[0].color = data[11].angle[3].color
          data[1].angle[4].color = data[11].angle[4].color

          data[11].angle[3].color = data[19].angle[2].color
          data[11].angle[4].color = data[19].angle[4].color

          data[19].angle[2].color = data[9].angle[1].color
          data[19].angle[4].color = data[9].angle[4].color

          data[9].angle[1].color = d
          data[9].angle[4].color = e
          break
        case -90:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[18].angle[1].color
          data[0].angle[1].color = data[18].angle[2].color
          data[0].angle[4].color = data[18].angle[4].color

          data[18].angle[1].color = data[20].angle[2].color
          data[18].angle[2].color = data[20].angle[3].color
          data[18].angle[4].color = data[20].angle[4].color

          data[20].angle[2].color = data[2].angle[3].color
          data[20].angle[3].color = data[2].angle[0].color
          data[20].angle[4].color = data[2].angle[4].color

          data[2].angle[3].color = a
          data[2].angle[0].color = b
          data[2].angle[4].color = c

          d = data[1].angle[0].color
          e = data[1].angle[4].color

          data[1].angle[0].color = data[9].angle[1].color
          data[1].angle[4].color = data[9].angle[4].color

          data[9].angle[1].color = data[19].angle[2].color
          data[9].angle[4].color = data[19].angle[4].color

          data[19].angle[2].color = data[11].angle[3].color
          data[19].angle[4].color = data[11].angle[4].color

          data[11].angle[3].color = d
          data[11].angle[4].color = e
          break
        case 180:
          a = data[0].angle[0].color
          b = data[0].angle[1].color
          c = data[0].angle[4].color

          data[0].angle[0].color = data[20].angle[2].color
          data[0].angle[1].color = data[20].angle[3].color
          data[0].angle[4].color = data[20].angle[4].color

          data[20].angle[2].color = a
          data[20].angle[3].color = b
          data[20].angle[4].color = c

          A = data[2].angle[3].color
          B = data[2].angle[0].color
          C = data[2].angle[4].color

          data[2].angle[3].color = data[18].angle[1].color
          data[2].angle[0].color = data[18].angle[2].color
          data[2].angle[4].color = data[18].angle[4].color

          data[18].angle[1].color = A
          data[18].angle[2].color = B
          data[18].angle[4].color = C

          d = data[1].angle[0].color
          e = data[1].angle[4].color

          data[1].angle[0].color = data[19].angle[2].color
          data[1].angle[4].color = data[19].angle[4].color

          data[19].angle[2].color = d
          data[19].angle[4].color = e

          D = data[11].angle[3].color
          E = data[11].angle[4].color

          data[11].angle[3].color = data[9].angle[1].color
          data[11].angle[4].color = data[9].angle[4].color

          data[9].angle[1].color = D
          data[9].angle[4].color = E
          break
      }
      break
    case 'b':
      switch(deg) {
        case 90:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[24].angle[1].color
          data[22].angle[3].color = data[24].angle[2].color
          data[22].angle[5].color = data[24].angle[5].color

          data[24].angle[1].color = data[6].angle[0].color
          data[24].angle[2].color = data[6].angle[1].color
          data[24].angle[5].color = data[6].angle[5].color

          data[6].angle[0].color = data[4].angle[3].color
          data[6].angle[1].color = data[4].angle[0].color
          data[6].angle[5].color = data[4].angle[5].color

          data[4].angle[3].color = a
          data[4].angle[0].color = b
          data[4].angle[5].color = c

          d = data[13].angle[3].color 
          e = data[13].angle[5].color

          data[13].angle[3].color = data[23].angle[2].color
          data[13].angle[5].color = data[23].angle[5].color

          data[23].angle[2].color = data[15].angle[1].color
          data[23].angle[5].color = data[15].angle[5].color

          data[15].angle[1].color = data[5].angle[0].color
          data[15].angle[5].color = data[5].angle[5].color

          data[5].angle[0].color = d
          data[5].angle[5].color = e
          break
        case -90:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[4].angle[3].color
          data[22].angle[3].color = data[4].angle[0].color
          data[22].angle[5].color = data[4].angle[5].color

          data[4].angle[3].color = data[6].angle[0].color
          data[4].angle[0].color = data[6].angle[1].color
          data[4].angle[5].color = data[6].angle[5].color

          data[6].angle[0].color = data[24].angle[1].color
          data[6].angle[1].color = data[24].angle[2].color
          data[6].angle[5].color = data[24].angle[5].color

          data[24].angle[1].color = a
          data[24].angle[2].color = b
          data[24].angle[5].color = c

          d = data[13].angle[3].color
          e = data[13].angle[5].color

          data[13].angle[3].color = data[5].angle[0].color
          data[13].angle[5].color = data[5].angle[5].color

          data[5].angle[0].color = data[15].angle[1].color
          data[5].angle[5].color = data[15].angle[5].color

          data[15].angle[1].color = data[23].angle[2].color
          data[15].angle[5].color = data[23].angle[5].color

          data[23].angle[2].color = d
          data[23].angle[5].color = e
          break
        case 180:
          a = data[22].angle[2].color
          b = data[22].angle[3].color
          c = data[22].angle[5].color

          data[22].angle[2].color = data[6].angle[0].color
          data[22].angle[3].color = data[6].angle[1].color
          data[22].angle[5].color = data[6].angle[5].color

          data[6].angle[0].color = a
          data[6].angle[1].color = b
          data[6].angle[5].color = c

          A = data[24].angle[1].color
          B = data[24].angle[2].color
          C = data[24].angle[5].color

          data[24].angle[1].color = data[4].angle[3].color
          data[24].angle[2].color = data[4].angle[0].color
          data[24].angle[5].color = data[4].angle[5].color

          data[4].angle[3].color = A
          data[4].angle[0].color = B
          data[4].angle[5].color = C

          d = data[13].angle[3].color
          e = data[13].angle[5].color

          data[13].angle[3].color = data[15].angle[1].color
          data[13].angle[5].color = data[15].angle[5].color

          data[15].angle[1].color = d
          data[15].angle[5].color = e

          D = data[23].angle[2].color
          E = data[23].angle[5].color

          data[23].angle[2].color = data[5].angle[0].color
          data[23].angle[5].color = data[5].angle[5].color

          data[5].angle[0].color = D
          data[5].angle[5].color = E
          break
      }
      break
  }
}