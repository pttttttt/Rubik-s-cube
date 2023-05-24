<template>
  <div>
    <!-- 魔方 -->
    <div
      class="box"
      :style="`transform: rotateX(${-15 + x}deg) rotateY(${-15 + y}deg); transition: all ${transitionTime}s;`"
    >
      <!-- 悬浮在魔方每个面上的遮罩层 鼠标点击时传递相应的参数以控制魔方旋转 -->
      <div
        class="tips"
        v-for="data in tips"
        :key="data.id"
        @mousedown="mouseDownHandler"
        @click="controlRotateHandler(data.id, 200, -90)"
        @contextmenu.prevent="controlRotateHandler(data.id, 200, 90)"
        :style="`width: ${companyLength * 3}px; height: ${companyLength * 3}px; transform: ${data.deg} translateZ(${151 + companyLength % 100}px);`"
      >
        <img src="../assets/fangxiang.png" alt="">
      </div>
      <!-- 魔方主体(不参与旋转) -->
      <div class="subject-one" :style="revolve">
        <div
          class="diamond"
          v-for="data in data"
          :key="data.id" :style="`transform: translate3d(${data.deviation});`"
        >
          <div
            v-for="angle in data.angle"
            :key="angle.id"
            :title="`${data.id}-${angle.id} ${data.original}`"
            :style="`transform: ${angle.deg} translateZ(50px); background: ${data.display ? angle.color : 'transparent'};`"
          ></div>
        </div>
      </div>
      <!-- 魔方主体(负责旋转) -->
      <div class="subject-two">
        <div
          class="diamond"
          v-for="data in datas"
          :key="data.id"
          :style="`transform: translate3d(${data.deviation});`"
        >
          <div
            v-for="angle in data.angle"
            :key="angle.id" :title="`${data.id}-${angle.id} ${data.original}`"
            :style="`transform: ${angle.deg} translateZ(50px); background: ${data.display ? angle.color : 'transparent'};`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MagicSquare',
  data() {
    /*
    * 魔方每个块最基本的位置信息
    * up down right left front back 取首字母作为当前块的位置信息   例：urf 处在顶层，右层，前层相交的角块， uf 处在顶层，前层相交的棱块 u 处在顶层的中心块
    * center为魔方的整体中心块 (中心块分为表面层中心块 和整体中心块)
    * 该位置是在魔方的白色面为底，蓝色面在前的前提下定义的
    */
    let basicPositioInfo = [
      'urf', 'uf', 'ulf', 'ul', 'ulb', 'ub', 'urb', 'ur', 'u',
      'rf', 'f', 'lf', 'l', 'lb', 'b', 'br', 'r', 'center',
      'drf', 'df', 'dlf', 'dl', 'dlb', 'db', 'drb', 'dr', 'd'
    ]
    const defaultColor = {
      t: '#fef12b',
      d: '#ffffff',
      r: '#ff9c13',
      l: '#dd1416',
      f: '#145dad',
      b: '#52b802',
      hide: '#efefef'
    }
    let allColor = [] // 初始魔方的所有块每个面的颜色 复原时使用
    let companyLength = 100 // 偏移的单位长度
    const data = _optimizationDataHandler(basicPositioInfo)
    const datas = _deepCopy([], data)
    const tips = [{ // 魔方表面遮罩层配置信息
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
    function _optimizationDataHandler(arr) { // 魔方光有位置信息并不能够较好地渲染 还需要进一步的处理
      const tmpData = []
      let color, judge, x, y, z, layer, rgba = defaultColor.hide
      arr.forEach((v, i) => {
        x = '' // 记录当前块的偏移量
        y = ''
        z = ''
        color = {top: rgba, down: rgba, right: rgba, left: rgba, front: rgba, after: rgba} // 当前块每个面的颜色
        layer = {u: false, d: false, r: false, l: false, f: false, b: false} // 当前块的位置 用布尔值代替字符串方便后续操作
        judge = true // 判断是否为整体中心块
        let td = true, rl = true, fa = true // 用于判断当前代码块在当前循环体是否已被执行过
        for (let j = 0; j < 3; j++) { // 遍历字符串 v
          if (td) { // 当前代码块执行一次后在本循环体就不再执行
            if (v[j] === 'u') {
              y = 0
              color.top = defaultColor.t // 黄色
              layer.u = true
              judge = false
              td = false
              continue
            } else if (v[j] === 'd') {
              y = companyLength * 2
              color.down = defaultColor.d
              layer.d = true
              judge = false
              td = false
              continue
            } else {
              y = companyLength
            }
          }
          if (rl) {
            if (v[j] === 'r') {
              x = companyLength * 2
              color.right = defaultColor.r // 橙色
              color.left = rgba
              layer.r = true
              judge = false
              rl = false
              continue
            } else if (v[j] === 'l') {
              x = 0
              color.left = defaultColor.l // 红色
              layer.l = true
              judge = false
              rl = false
              continue
            } else {
              x = companyLength
            }
          }
          if (fa) {
            if (v[j] === 'f') {
              z = companyLength
              color.front = defaultColor.f // ；蓝色
              layer.f = true
              judge = false
              fa = false
              continue
            } else if (v[j] === 'b') {
              z = -companyLength
              color.after = defaultColor.b // 绿色
              layer.b = true
              judge = false
              fa = false
              continue
            } else {
              z = 0
            }
          }
        }
        tmpData[i] = { // 单个块的配置信息
          deviation: judge ? `${companyLength}px, ${companyLength}px, 0` : `${x}px, ${y}px, ${z}px`, // 偏移量
          layer, // 位置信息 （布尔值）
          display: true, // 是否显示 （在旋转体旋转时使用）
          id: i, // 当前块在整个魔方体数组的下标
          original: v, // 原始位置信息 （目前没用上）
          angle: [{ // 当前块每个面的配置信息 按 上右下左前后 排列
            deg: 'rotateX(90deg)', // 旋转角度
            id: 0, // key
            color: color.top // 颜色
          }, {
            deg: 'rotateY(90deg)',
            id: 1,
            color: color.right
          }, {
            deg: 'rotateX(-90deg)',
            id: 2,
            color: color.down
          }, {
            deg: 'rotateY(-90deg)',
            id: 3,
            color: color.left
          }, {
            deg: '',
            id: 4,
            color: color.front
          }, {
            deg: 'rotateY(-180deg)',
            id: 5,
            color: color.after
          }]
        }
        allColor[i] = [color.top, color.right, color.down, color.left, color.front, color.after] // 存储初始颜色
      })
      return tmpData
    }
    function _deepCopy(newobj, oldobj) { // 深克隆
      for (let k in oldobj) {
        const item = oldobj[k]
        if (item instanceof Array) {
          newobj[k] = []
          _deepCopy(newobj[k], item)
        } else if (item instanceof Object) {
          newobj[k] = {};
          _deepCopy(newobj[k], item)
        } else {
          newobj[k] = item
        }
      }
      return newobj
    }
    return {
      data,
      datas,
      tips,
      allColor,
      companyLength,
      revolve: '', // 旋转时给旋转体加的样式
      intercept: true, // 单层旋转时的节流阀
      x: 0, // 魔方整体旋转角度
      y: 0,
      downX: 0, // 记录鼠标按下时的坐标
      downY: 0,
      tmpX: 0, // 记录鼠标按下之前的旋转角度
      tmpY: 0,
      transitionTime: 0.2,
      prohibitRotate: true // 整体旋转的节流阀
    }
  },
  methods: {
    controlRotateHandler(str, time, deg) { // 控制魔方旋转
      if (this.intercept && this.prohibitRotate) {
        let axis
        if (str === 'u' || str === 'd') { // 根据点击的的层调整旋转的轴以及方向
          deg = str === 'u' ? -deg : deg
          axis = 'Y'
        } else if (str === 'r' || str === 'l') {
          deg = str === 'r' ? deg : -deg
          axis = 'X'
        } else if (str === 'f' || str === 'b') {
          deg = str === 'f' ? deg : -deg
          axis = 'Z'
        }
        this.intercept = false // 开启节流阀
        this._displaySwitch(false, str) // 隐藏非旋转体被点击的层 隐藏旋转体未被点击的层
        this.revolve = `transition: all ${time / 1000}s; transform: rotate${axis}(${deg}deg);` // 通过过渡和3d转换来做出旋转的动画效果
        setTimeout(() => { // 此代码块会在旋转的动画效果结束后执行
          this._colorExchange(this.data, str, deg) // 根据点击的层以及方式对两个魔方体的颜色进行变换
          this._colorExchange(this.datas, str, deg)
          this.revolve = `` // 清除过渡和3d旋转的样式 这样就可以在肉眼看不出来的情况下把旋转体复原到原本的旋转角度
          this._displaySwitch(true, str) // 恢复旋转之前被隐藏的层
          this.intercept = true // 关闭节流阀
        }, time + 5)
      }
    },
    _displaySwitch(boolean, str) { // 旋转时控制魔方显示部分
      this.data.forEach((v, i) => v.layer[str] ? this.datas[i].display = boolean : v.display = boolean)
    },
    _colorExchange(data, str, deg) { // 旋转后的颜色变换函数
      let a, b, c, d, e, A, B, C, D, E // 中转变量
      // 通过最low的方式去实现的颜色变换(手动去调换每一个面的颜色) 暂时没找到合适的方法去简化代码
      // 外层switch区分层 内层区分旋转角度 旋转方向从上往下依次为：顺时针，逆时针，顺时针
      switch(str) {
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
    },
    restore() { // 复原
      let fn = data => {
        data.forEach((v, i) => {
          v.angle.forEach((vlue, j) => {
            vlue.color = this.allColor[i][j]
          })
        })
      }
      fn(this.data)
      fn(this.datas)
    },
    _controlWholeRotate(e) { // 魔方回正与复原
      switch(e.key) {
        case ' ':
          this.x = this.y = 0
          break
        case 'Escape':
          this.restore()
          break
      }
    },
    mouseDownHandler (e) { // 鼠标在某个面上按下时触发
      this.downX = e.pageX // 记录鼠标按下时的坐标
      this.downY = e.pageY
      this.tmpX = this.x // 记录当前旋转的角度
      this.tmpY = this.y
      addEventListener('mousemove', this._mouseMoveCallback) // 监听鼠标移动事件
    },
    _mouseMoveCallback (e) { // 鼠标移动时的回调
      this.prohibitRotate = false // 节流阀 控制魔方整体旋转时阻止单层旋转
      let diffX = Math.floor((e.pageX - this.downX) / 2) // 记录鼠标移动后与按下时的坐标差值
      let diffY = Math.floor(-(e.pageY - this.downY) / 2)
      let tmpAndX = diffY + this.tmpX // 原始x轴旋转角度
      this.x = tmpAndX < -45 ? -45 : tmpAndX > 45 ? 45 : tmpAndX // 限制x轴旋转的角度范围 -45到45之间
      this.y = diffX + this.tmpY
    }
  },
  mounted () {
    addEventListener('keyup', e => this._controlWholeRotate(e))
    addEventListener('mouseup', () => { // 鼠标弹起时触发
      removeEventListener('mousemove', this._mouseMoveCallback) // 注销鼠标移动的监听事件 节约性能以及防止不可预料的bug
      let yValue = this.y
      this.transitionTime = 0
      this.y = yValue >= 360 ? yValue % 360 : yValue <= -360 ? yValue % -360 : yValue // 旋转角度超过360后自动回正 避免出现不可预期的bug
      setTimeout(() => {
        this.transitionTime = 0.2
        this.prohibitRotate = true
      }, 100)
    })
  }
}
</script>

<style scoped>
.box {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 200px auto 0;
  transform-style: preserve-3d;
}
.tips {
  position: absolute;
  top: -0;
  left: 0;
  text-align: center;
}
.tips img {
  width: 100px;
  height: 100px;
  margin-top: 100px;
  opacity: 0;
  transition: all .4s;
}
.tips:hover img {
  opacity: .3;
}
.subject-one,
.subject-two {
  position: absolute;
  width: 300px;
  height: 300px;
  transform-style: preserve-3d;
}
.subject-one {
  display: flex;
}
.subject-two {
  display: flex;
}
.subject-one .diamond,
.subject-two .diamond {
  transform-style: preserve-3d;
  position: absolute;
  width: 100px;
  height: 100px;
}
.subject-one .diamond div,
.subject-two .diamond div {
  position: absolute;
  width: 100px;
  height: 100px;
}
</style>
