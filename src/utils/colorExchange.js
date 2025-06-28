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
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[6].color[0]
          data[0].color[1] = data[6].color[5]
          data[0].color[4] = data[6].color[1]

          data[6].color[0] = data[4].color[0]
          data[6].color[5] = data[4].color[3]
          data[6].color[1] = data[4].color[5]

          data[4].color[0] = data[2].color[0]
          data[4].color[3] = data[2].color[4]
          data[4].color[5] = data[2].color[3]

          data[2].color[0] = a
          data[2].color[4] = b
          data[2].color[3] = c

          d = data[1].color[0] 
          e = data[1].color[4]

          data[1].color[0] = data[7].color[0]
          data[1].color[4] = data[7].color[1]

          data[7].color[0] = data[5].color[0]
          data[7].color[1] = data[5].color[5]

          data[5].color[0] = data[3].color[0]
          data[5].color[5] = data[3].color[3]

          data[3].color[0] = d
          data[3].color[3] = e
          break
        case 90:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[2].color[0]
          data[0].color[1] = data[2].color[4]
          data[0].color[4] = data[2].color[3]

          data[2].color[0] = data[4].color[0]
          data[2].color[4] = data[4].color[3]
          data[2].color[3] = data[4].color[5]

          data[4].color[0] = data[6].color[0]
          data[4].color[3] = data[6].color[5]
          data[4].color[5] = data[6].color[1]

          data[6].color[0] = a
          data[6].color[5] = b
          data[6].color[1] = c

          d = data[1].color[0] 
          e = data[1].color[4]

          data[1].color[0] = data[3].color[0]
          data[1].color[4] = data[3].color[3]

          data[3].color[0] = data[5].color[0]
          data[3].color[3] = data[5].color[5]

          data[5].color[0] = data[7].color[0]
          data[5].color[5] = data[7].color[1]

          data[7].color[0] = d
          data[7].color[1] = e
          break
        case -180:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[4].color[0]
          data[0].color[1] = data[4].color[3]
          data[0].color[4] = data[4].color[5]

          data[4].color[0] = a
          data[4].color[3] = b
          data[4].color[5] = c

          A = data[6].color[0]
          B = data[6].color[5]
          C = data[6].color[1]

          data[6].color[0] = data[2].color[0]
          data[6].color[5] = data[2].color[4]
          data[6].color[1] = data[2].color[3]

          data[2].color[0] = A
          data[2].color[4] = B
          data[2].color[3] = C

          d = data[1].color[0]
          e = data[1].color[4]

          data[1].color[0] = data[5].color[0]
          data[1].color[4] = data[5].color[5]

          data[5].color[0] = d
          data[5].color[5] = e

          D = data[7].color[0]
          E = data[7].color[1]

          data[7].color[0] = data[3].color[0]
          data[7].color[1] = data[3].color[3]

          data[3].color[0] = D
          data[3].color[3] = E
          break
      }
      break
    case 'd':
      switch(deg) {
        case -90:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[20].color[2]
          data[22].color[3] = data[20].color[4]
          data[22].color[5] = data[20].color[3]

          data[20].color[2] = data[18].color[2]
          data[20].color[4] = data[18].color[1]
          data[20].color[3] = data[18].color[4]

          data[18].color[2] = data[24].color[2]
          data[18].color[1] = data[24].color[5]
          data[18].color[4] = data[24].color[1]

          data[24].color[2] = a
          data[24].color[5] = b
          data[24].color[1] = c

          d = data[21].color[2] 
          e = data[21].color[3]

          data[21].color[2] = data[19].color[2]
          data[21].color[3] = data[19].color[4]

          data[19].color[2] = data[25].color[2]
          data[19].color[4] = data[25].color[1]

          data[25].color[2] = data[23].color[2]
          data[25].color[1] = data[23].color[5]

          data[23].color[2] = d
          data[23].color[5] = e
          break
        case 90:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[24].color[2]
          data[22].color[3] = data[24].color[5]
          data[22].color[5] = data[24].color[1]

          data[24].color[2] = data[18].color[2]
          data[24].color[5] = data[18].color[1]
          data[24].color[1] = data[18].color[4]

          data[18].color[2] = data[20].color[2]
          data[18].color[1] = data[20].color[4]
          data[18].color[4] = data[20].color[3]

          data[20].color[2] = a
          data[20].color[4] = b
          data[20].color[3] = c

          d = data[21].color[2] 
          e = data[21].color[3]

          data[21].color[2] = data[23].color[2]
          data[21].color[3] = data[23].color[5]

          data[23].color[2] = data[25].color[2]
          data[23].color[5] = data[25].color[1]

          data[25].color[2] = data[19].color[2]
          data[25].color[1] = data[19].color[4]

          data[19].color[2] = d
          data[19].color[4] = e
          break
        case -180:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[18].color[2]
          data[22].color[3] = data[18].color[1]
          data[22].color[5] = data[18].color[4]

          data[18].color[2] = a
          data[18].color[1] = b 
          data[18].color[4] = c

          A = data[20].color[2]
          B = data[20].color[4]
          C = data[20].color[3]

          data[20].color[2] = data[24].color[2]
          data[20].color[4] = data[24].color[5]
          data[20].color[3] = data[24].color[1]

          data[24].color[2] = A
          data[24].color[5] = B
          data[24].color[1] = C

          d = data[21].color[2] 
          e = data[21].color[3]

          data[21].color[2] = data[25].color[2]
          data[21].color[3] = data[25].color[1]

          data[25].color[2] = d
          data[25].color[1] = e

          D = data[19].color[2]
          E = data[19].color[4]

          data[19].color[2] = data[23].color[2]
          data[19].color[4] = data[23].color[5]

          data[23].color[2] = D
          data[23].color[5] = E
          break
      }
      break
    case 'r':
      switch(deg) {
        case 90:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[18].color[4]
          data[0].color[1] = data[18].color[1]
          data[0].color[4] = data[18].color[2]

          data[18].color[4] = data[24].color[2]
          data[18].color[1] = data[24].color[1]
          data[18].color[2] = data[24].color[5]

          data[24].color[2] = data[6].color[5]
          data[24].color[1] = data[6].color[1]
          data[24].color[5] = data[6].color[0]

          data[6].color[5] = a
          data[6].color[1] = b
          data[6].color[0] = c

          d = data[7].color[0]
          e = data[7].color[1]

          data[7].color[0] = data[9].color[4]
          data[7].color[1] = data[9].color[1]

          data[9].color[4] = data[25].color[2]
          data[9].color[1] = data[25].color[1]

          data[25].color[2] = data[15].color[5]
          data[25].color[1] = data[15].color[1]

          data[15].color[5] = d
          data[15].color[1] = e
          break
        case -90:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[6].color[5]
          data[0].color[1] = data[6].color[1]
          data[0].color[4] = data[6].color[0]

          data[6].color[5] = data[24].color[2]
          data[6].color[1] = data[24].color[1]
          data[6].color[0] = data[24].color[5]

          data[24].color[2] = data[18].color[4]
          data[24].color[1] = data[18].color[1]
          data[24].color[5] = data[18].color[2]

          data[18].color[4] = a
          data[18].color[1] = b
          data[18].color[2] = c

          d = data[7].color[0]
          e = data[7].color[1]

          data[7].color[0] = data[15].color[5]
          data[7].color[1] = data[15].color[1]

          data[15].color[5] = data[25].color[2]
          data[15].color[1] = data[25].color[1]

          data[25].color[2] = data[9].color[4]
          data[25].color[1] = data[9].color[1]

          data[9].color[4] = d
          data[9].color[1] = e
          break
        case 180:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[24].color[2]
          data[0].color[1] = data[24].color[1]
          data[0].color[4] = data[24].color[5]

          data[24].color[2] = a
          data[24].color[1] = b
          data[24].color[5] = c

          A = data[18].color[4]
          B = data[18].color[1]
          C = data[18].color[2]

          data[18].color[4] = data[6].color[5]
          data[18].color[1] = data[6].color[1]
          data[18].color[2] = data[6].color[0]

          data[6].color[5] = A
          data[6].color[1] = B
          data[6].color[0] = C

          d = data[7].color[0] 
          e = data[7].color[1]

          data[7].color[0] = data[25].color[2]
          data[7].color[1] = data[25].color[1]

          data[25].color[2] = d
          data[25].color[1] = e

          D = data[9].color[4]
          E = data[9].color[1]

          data[9].color[4] = data[15].color[5]
          data[9].color[1] = data[15].color[1]

          data[15].color[5] = D
          data[15].color[1] = E
          break
      }
      break
    case 'l':
      switch(deg) {
        case 90:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[4].color[5]
          data[22].color[3] = data[4].color[3]
          data[22].color[5] = data[4].color[0]

          data[4].color[5] = data[2].color[0]
          data[4].color[3] = data[2].color[3]
          data[4].color[0] = data[2].color[4]

          data[2].color[0] = data[20].color[4]
          data[2].color[3] = data[20].color[3]
          data[2].color[4] = data[20].color[2]

          data[20].color[4] = a
          data[20].color[3] = b
          data[20].color[2] = c

          d = data[21].color[2]
          e = data[21].color[3]

          data[21].color[2] = data[13].color[5]
          data[21].color[3] = data[13].color[3]

          data[13].color[5] = data[3].color[0]
          data[13].color[3] = data[3].color[3]

          data[3].color[0] = data[11].color[4]
          data[3].color[3] = data[11].color[3]

          data[11].color[4] = d
          data[11].color[3] = e
          break
        case -90:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[20].color[4]
          data[22].color[3] = data[20].color[3]
          data[22].color[5] = data[20].color[2]

          data[20].color[4] = data[2].color[0]
          data[20].color[3] = data[2].color[3]
          data[20].color[2] = data[2].color[4]

          data[2].color[0] = data[4].color[5]
          data[2].color[3] = data[4].color[3]
          data[2].color[4] = data[4].color[0]

          data[4].color[5] = a
          data[4].color[3] = b
          data[4].color[0] = c

          d = data[21].color[2] 
          e = data[21].color[3]

          data[21].color[2] = data[11].color[4]
          data[21].color[3] = data[11].color[3]

          data[11].color[4] = data[3].color[0]
          data[11].color[3] = data[3].color[3]

          data[3].color[0] = data[13].color[5]
          data[3].color[3] = data[13].color[3]

          data[13].color[5] = d
          data[13].color[3] = e
          break
        case 180:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[2].color[0]
          data[22].color[3] = data[2].color[3]
          data[22].color[5] = data[2].color[4]

          data[2].color[0] = a
          data[2].color[3] = b
          data[2].color[4] = c

          A = data[4].color[5]
          B = data[4].color[3]
          C = data[4].color[0]

          data[4].color[5] = data[20].color[4]
          data[4].color[3] = data[20].color[3]
          data[4].color[0] = data[20].color[2]

          data[20].color[4] = A
          data[20].color[3] = B
          data[20].color[2] = C

          d = data[21].color[2] 
          e = data[21].color[3]

          data[21].color[2] = data[3].color[0]
          data[21].color[3] = data[3].color[3]

          data[3].color[0] = d
          data[3].color[3] = e

          D = data[13].color[5]
          E = data[13].color[3]

          data[13].color[5]  = data[11].color[4]
          data[13].color[3]  = data[11].color[3]

          data[11].color[4] = D
          data[11].color[3] = E
          break
      }
      break
    case 'f':
      switch(deg) {
        case 90:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[2].color[3]
          data[0].color[1] = data[2].color[0]
          data[0].color[4] = data[2].color[4]

          data[2].color[3] = data[20].color[2]
          data[2].color[0] = data[20].color[3]
          data[2].color[4] = data[20].color[4]

          data[20].color[2] = data[18].color[1]
          data[20].color[3] = data[18].color[2]
          data[20].color[4] = data[18].color[4]

          data[18].color[1] = a
          data[18].color[2] = b
          data[18].color[4] = c

          d = data[1].color[0]
          e = data[1].color[4]

          data[1].color[0] = data[11].color[3]
          data[1].color[4] = data[11].color[4]

          data[11].color[3] = data[19].color[2]
          data[11].color[4] = data[19].color[4]

          data[19].color[2] = data[9].color[1]
          data[19].color[4] = data[9].color[4]

          data[9].color[1] = d
          data[9].color[4] = e
          break
        case -90:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[18].color[1]
          data[0].color[1] = data[18].color[2]
          data[0].color[4] = data[18].color[4]

          data[18].color[1] = data[20].color[2]
          data[18].color[2] = data[20].color[3]
          data[18].color[4] = data[20].color[4]

          data[20].color[2] = data[2].color[3]
          data[20].color[3] = data[2].color[0]
          data[20].color[4] = data[2].color[4]

          data[2].color[3] = a
          data[2].color[0] = b
          data[2].color[4] = c

          d = data[1].color[0]
          e = data[1].color[4]

          data[1].color[0] = data[9].color[1]
          data[1].color[4] = data[9].color[4]

          data[9].color[1] = data[19].color[2]
          data[9].color[4] = data[19].color[4]

          data[19].color[2] = data[11].color[3]
          data[19].color[4] = data[11].color[4]

          data[11].color[3] = d
          data[11].color[4] = e
          break
        case 180:
          a = data[0].color[0]
          b = data[0].color[1]
          c = data[0].color[4]

          data[0].color[0] = data[20].color[2]
          data[0].color[1] = data[20].color[3]
          data[0].color[4] = data[20].color[4]

          data[20].color[2] = a
          data[20].color[3] = b
          data[20].color[4] = c

          A = data[2].color[3]
          B = data[2].color[0]
          C = data[2].color[4]

          data[2].color[3] = data[18].color[1]
          data[2].color[0] = data[18].color[2]
          data[2].color[4] = data[18].color[4]

          data[18].color[1] = A
          data[18].color[2] = B
          data[18].color[4] = C

          d = data[1].color[0]
          e = data[1].color[4]

          data[1].color[0] = data[19].color[2]
          data[1].color[4] = data[19].color[4]

          data[19].color[2] = d
          data[19].color[4] = e

          D = data[11].color[3]
          E = data[11].color[4]

          data[11].color[3] = data[9].color[1]
          data[11].color[4] = data[9].color[4]

          data[9].color[1] = D
          data[9].color[4] = E
          break
      }
      break
    case 'b':
      switch(deg) {
        case 90:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[24].color[1]
          data[22].color[3] = data[24].color[2]
          data[22].color[5] = data[24].color[5]

          data[24].color[1] = data[6].color[0]
          data[24].color[2] = data[6].color[1]
          data[24].color[5] = data[6].color[5]

          data[6].color[0] = data[4].color[3]
          data[6].color[1] = data[4].color[0]
          data[6].color[5] = data[4].color[5]

          data[4].color[3] = a
          data[4].color[0] = b
          data[4].color[5] = c

          d = data[13].color[3] 
          e = data[13].color[5]

          data[13].color[3] = data[23].color[2]
          data[13].color[5] = data[23].color[5]

          data[23].color[2] = data[15].color[1]
          data[23].color[5] = data[15].color[5]

          data[15].color[1] = data[5].color[0]
          data[15].color[5] = data[5].color[5]

          data[5].color[0] = d
          data[5].color[5] = e
          break
        case -90:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[4].color[3]
          data[22].color[3] = data[4].color[0]
          data[22].color[5] = data[4].color[5]

          data[4].color[3] = data[6].color[0]
          data[4].color[0] = data[6].color[1]
          data[4].color[5] = data[6].color[5]

          data[6].color[0] = data[24].color[1]
          data[6].color[1] = data[24].color[2]
          data[6].color[5] = data[24].color[5]

          data[24].color[1] = a
          data[24].color[2] = b
          data[24].color[5] = c

          d = data[13].color[3]
          e = data[13].color[5]

          data[13].color[3] = data[5].color[0]
          data[13].color[5] = data[5].color[5]

          data[5].color[0] = data[15].color[1]
          data[5].color[5] = data[15].color[5]

          data[15].color[1] = data[23].color[2]
          data[15].color[5] = data[23].color[5]

          data[23].color[2] = d
          data[23].color[5] = e
          break
        case 180:
          a = data[22].color[2]
          b = data[22].color[3]
          c = data[22].color[5]

          data[22].color[2] = data[6].color[0]
          data[22].color[3] = data[6].color[1]
          data[22].color[5] = data[6].color[5]

          data[6].color[0] = a
          data[6].color[1] = b
          data[6].color[5] = c

          A = data[24].color[1]
          B = data[24].color[2]
          C = data[24].color[5]

          data[24].color[1] = data[4].color[3]
          data[24].color[2] = data[4].color[0]
          data[24].color[5] = data[4].color[5]

          data[4].color[3] = A
          data[4].color[0] = B
          data[4].color[5] = C

          d = data[13].color[3]
          e = data[13].color[5]

          data[13].color[3] = data[15].color[1]
          data[13].color[5] = data[15].color[5]

          data[15].color[1] = d
          data[15].color[5] = e

          D = data[23].color[2]
          E = data[23].color[5]

          data[23].color[2] = data[5].color[0]
          data[23].color[5] = data[5].color[5]

          data[5].color[0] = D
          data[5].color[5] = E
          break
      }
      break
  }
}