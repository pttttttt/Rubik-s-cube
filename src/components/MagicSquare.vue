<template>
  <div class="container">
    <div class="bg" :style="`background: ${configInformation.bgcColor};`"></div>
    <!-- 魔方 -->
    <div
      class="box"
      :style="`transform: rotateX(${configInformation.initialAngle.x + x}deg) rotateY(${configInformation.initialAngle.y + y}deg); transition: all ${transitionTime}s;`"
      @mousedown="mouseDownHandler"
      >
      <!-- 悬浮在魔方每个面上的遮罩层 鼠标点击时传递相应的参数以控制魔方旋转 -->
      <div
        class="tips"
        v-show="hideTip"
        v-for="data in tips"
        :key="data.id"
        @click="!isImplementFormula && (SelectedFormula ? implementFormulaHanlder(data.id, formulaName) : controlRotateHandler(data.id, -90))"
        @contextmenu.prevent="controlRotateHandler(data.id, 90)"
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
            @click="angle.color = '#cdcbce'"
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
            @click="angle.color = '#cdcbce'"
            :key="angle.id" :title="`${data.id}-${angle.id} ${data.original}`"
            :style="`transform: ${angle.deg} translateZ(50px); background: ${data.display ? angle.color : 'transparent'};`"
          ></div>
        </div>
      </div>
    </div>
    <div class="menu">
      <div class="head">
        <ul class="nav">
          <li>公式</li>
          <li>其他</li>
        </ul>
      </div>
      <div class="body">
        <ul>
          <li
            v-for="item in formulaButton"
            :key="item.key"
            @click="choiceFormulaHanlder(item.key, item)"
            :style="`background: ${item.active ? 'white' : ''};`"
          >
            <img :src="require('../assets/formulaImg/' + item.key + '.png')" alt="寄">
            <span>{{ item.name }}</span>
          </li>
          <li class="cancel" @click="cancelHanlder">
            <span>取 消</span><span>选 中</span>
          </li>
        </ul>
      </div>
      <div class="footer">
        <div class="control">
          <div @click="disruptionHanlder">打乱</div>
          <div @click="reversal = !reversal" :style="reversal ? 'background: white;' : ''">逆转</div>
          <div @click="startRecordHandler">开始</div>
          <div @click="closeRecordHandler">结束</div>
          <div @click="rollBackHandler">撤销</div>
          <div @click="_keyUpEvent({ key: ' ' })">复位</div>
          <div @click="_restore">复原</div>
          <div @click="hideTip = false">隐藏</div>
          <div @click="hideTip = true">显示</div>
        </div>
        <div class="formula">{{ outputText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { operation, formula, formulaButton } from '../utils/formula.js'
import deepCopy from '../utils/deepCopy.js'
import { pageColor, bgcColor, rotateTime, initialAngle } from '../utils/configInformation.js'

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
    let allColor = [] // 初始魔方的所有块每个面的颜色 复原时使用
    let companyLength = 100 // 偏移的单位长度
    const data = _optimizationDataHandler(basicPositioInfo)
    const datas = deepCopy(data, [])
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
      let color, judge, x, y, z, layer, rgba = pageColor.hide
      arr.forEach((v, i) => {
        x = '' // 记录当前块的偏移量
        y = ''
        z = ''
        color = {top: rgba, down: rgba, right: rgba, left: rgba, front: rgba, after: rgba} // 当前块每个面的颜色
        layer = {u: false, d: false, r: false, l: false, f: false, b: false} // 当前块的位置 用布尔值代替字符串方便后续操作
        judge = true // 判断是否为整体中心块
        let td = true, rl = true, fb = true // 用于判断当前代码块在当前循环体是否已被执行过
        for (let j = 0; j < 3; j++) { // 遍历字符串 v
          if (td) { // 当前代码块执行一次后在本循环体就不再执行
            if (v[j] === 'u') {
              y = 0
              color.top = pageColor.t // u
              layer.u = true
              judge = false
              td = false
              continue
            } else if (v[j] === 'd') {
              y = companyLength * 2
              color.down = pageColor.d // d
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
              color.right = pageColor.r // r
              color.left = rgba
              layer.r = true
              judge = false
              rl = false
              continue
            } else if (v[j] === 'l') {
              x = 0
              color.left = pageColor.l // l
              layer.l = true
              judge = false
              rl = false
              continue
            } else {
              x = companyLength
            }
          }
          if (fb) {
            if (v[j] === 'f') {
              z = companyLength
              color.front = pageColor.f // f
              layer.f = true
              judge = false
              fb = false
              continue
            } else if (v[j] === 'b') {
              z = -companyLength
              color.after = pageColor.b // b
              layer.b = true
              judge = false
              fb = false
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
    return {
      data,
      datas,
      tips,
      allColor,
      companyLength,
      operation: Object.freeze(operation), // 魔方所有操作方法
      formula: Object.freeze(formula), // 魔方公式
      formulaButton, // 魔方公式所对应的按钮
      SelectedFormula: false, // 当前是否选中公式
      isImplementFormula: false, // 当前是否正在执行公式
      reversal: false, // 是否逆转公式
      formulaName: '', // 当前选中公式的名称
      record: false, // 是否开始记录
      step: [], // 当前已经执行过的步骤
      stepStr: [], // 字符串形式的步骤
      outputText: '', // 文本形式输出的公式
      revolve: '', // 旋转时给旋转体加的样式
      intercept: true, // 单层旋转时的节流阀
      x: 0, // 魔方整体旋转角度
      y: 0,
      downX: 0, // 记录鼠标按下时的坐标
      downY: 0,
      tmpX: 0, // 记录鼠标按下之前的旋转角度
      tmpY: 0,
      clickIsInPage: false, // 判断是否在魔方的某一个面上按下鼠标
      hideTip: true, // 隐藏提示层
      transitionTime: 0.2, // 魔方整体旋转的过渡时间
      prohibitRotate: true, // 整体旋转的节流阀
      // 配置信息
      configInformation: {
        initialAngle, // 初始角度
        bgcColor, // 背景颜色
        rotateTime // 魔方单层旋转所需的时间
      }
    }
  },
  methods: {
    controlRotateHandler (str, deg, time = this.configInformation.rotateTime) { // 控制魔方旋转
      const tmpFormula = [str, deg, time]
      return new Promise(resolve => {
        if (this.intercept && (this.prohibitRotate || this.isImplementFormula)) {
          let axis
          switch (str) { // 根据点击的的层调整旋转的轴以及方向
            case 'r':
              axis = 'x'
              break
            case 'l':
              axis = 'x'
              deg = -deg
              break
            case 'u':
              axis = 'y'
              deg = -deg
              break
            case 'd':
              axis = 'y'
              break
            case 'f':
              axis = 'z'
              break
            case 'b':
              axis = 'z'
              deg = -deg
              break
          }
          this.intercept = false // 开启节流阀
          this._displaySwitch(false, str) // 隐藏非旋转体被点击的层 隐藏旋转体未被点击的层
          this.revolve = `transition: all ${time / 1000}s; transform: rotate${axis}(${deg}deg);` // 通过过渡和3d转换来做出旋转的动画效果
          setTimeout(() => { // 此代码块会在旋转的动画效果结束后执行
            this._colorExchange(this.data, str, deg) // 根据点击的层以及方式对两个魔方体的颜色进行变换
            this._colorExchange(this.datas, str, deg)
            this.revolve = `` // 清除过渡和3d旋转的样式 这样就可以在肉眼看不出来的情况下把旋转体复原到原本的旋转角度
            this._displaySwitch(true, str) // 恢复旋转之前被隐藏的层
            if (this.record) { // 记录
              this.step.push([...tmpFormula])
              this.outputText += tmpFormula[0] + (tmpFormula[2] === this.configInformation.rotateTime ? tmpFormula[1] > 0 ? '' : '\'' : '2')
              tmpFormula[0] = '\'' + str + '\''
              if (tmpFormula[2] === this.configInformation.rotateTime * 2) {
                this.stepStr.push(', [' + tmpFormula.join(', ') + ']')
              } else {
                this.stepStr.push(', [' + tmpFormula[0] + ', ' + tmpFormula[1] + ']')
              }
            }
            setTimeout(() => {
              this.intercept = true // 关闭节流阀
              resolve(tmpFormula) // 执行完等一会后再告诉promise已经完成，防止无法预料的bug
            }, 100);
          }, time + 5)
        }
      })
    },
    choiceFormulaHanlder (formulaName, data) { // 选中某一个公式
      this.SelectedFormula = true
      this.formulaName = formulaName
      this.formulaButton.forEach(v => v.active = false)
      data.active = true
    },
    cancelHanlder () { // 取消选中公式
      this.SelectedFormula = false
      this.formulaButton.forEach(v => v.active = false)
    },
    implementFormulaHanlder (layer, formulaName = 'centerLayerLeft') { // 通过选择的公式和点击的层选择公式并交给递归函数执行
      let formula = this.formula[formulaName][layer]
      if (this.reversal) {
        formula = this._reversal(deepCopy(formula, []))
      }
      this._recursion(formula)
    },
    disruptionHanlder () { // 随机生成打乱公式
      const keys = ['r', 'l', 'f', 'b', 'u', 'd']
      const disruptionFormula = []
      const disruptionFormulaKeys = []
      let key = ''
      for (let i = 0; i < 20; i++) {
        for (let judge = true; judge;) {
          let tmpKey = keys[Math.floor(Math.random() * 6)]
          if (tmpKey !== key) {
            key = tmpKey
            disruptionFormulaKeys.push(tmpKey)
            judge = false
          }
        }
        if (!this.record) this.outputText = disruptionFormulaKeys.join('')
        disruptionFormula.push(this.operation[key][0])
      }
      this._recursion(disruptionFormula)
    },
    startRecordHandler () { // 开始记录
      this.stepStr = []
      this.outputText = ''
      this.record = true
    },
    closeRecordHandler () { // 结束记录
      console.log(this.stepStr.join(''))
      this.record = false
    },
    rollBackHandler () { // 点击撤销按钮触发
      if (!this.intercept) return
      if (!this.step.length) return
      this.record = false
      this.stepStr.pop()
      this.outputText = this.outputText.replace(/([a-z]|[a-z]('|2))$/, '')
      this.controlRotateHandler(...this._reversal([this.step.pop()])[0]).then(() => this.record = true)
    },
    _reversal (formulaArr) { // 逆转传入的步骤
      const dstArr = []
      formulaArr.forEach(v => {
        if (v[1] === 180 || v[1] === -180) {
          dstArr.unshift(v)
          return
        } else {
          v[1] = -v[1]
          dstArr.unshift(v)
        }
      })
      return dstArr
    },
    _recursion (tmpFormula) { // 递归执行传入的公式
      if (!this.prohibitRotate) return
      if (!tmpFormula) return
      this.isImplementFormula = true
      const formula = [...tmpFormula]
      const fn = promise => {
        promise.then(() => {
          const next = this.controlRotateHandler(...formula.shift())
          if (formula.length) fn(next)
          else {
            next.then(() => this.isImplementFormula = false)
            return next
          }
        })
      }
      return fn(this.controlRotateHandler(...formula.shift()), formula)
    },
    _displaySwitch (boolean, str) { // 旋转时控制魔方显示部分
      this.data.forEach((v, i) => v.layer[str] ? this.datas[i].display = boolean : v.display = boolean)
    },
    _colorExchange (data, str, deg) { // 旋转后的颜色变换函数
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
    _restore () { // 复原
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
    _keyUpEvent (e) { // 键盘弹起事件
      switch(e.key) {
        case ' ':
          this.x = this.y = 0
          break
        case 'Escape':
          this._restore()
          break
        case 'Enter':
          // this.disruptionHanlder()
          this._recursion([['b', 90], ['u', 90], ['b', -90], ['u', -90], ['b', 90], ['u', 90], ['b', -90], ['l', 90], ['u', 180, 400], ['l', -90], ['u', -90], ['f', 90], ['u', 180, 400], ['f', -90], ['u', -90], ['f', 90], ['u', 90], ['f', -90], ['u', 180, 400], ['r', 90], ['u', -90], ['r', -90], ['u', 180, 400], ['r', 90], ['u', 90], ['r', -90], ['u', -90], ['l', -90], ['u', 90], ['l', 90], ['u', 90], ['f', 90], ['u', -90], ['f', -90], ['u', -90], ['b', -90], ['u', 90], ['b', 90], ['u', 90], ['l', 90], ['u', -90], ['l', -90], ['r', -90], ['u', 90], ['r', 90], ['u', 90], ['b', 90], ['u', -90], ['b', -90], ['u', 90], ['f', -90], ['u', 90], ['f', 90], ['u', 90], ['r', 90], ['u', -90], ['r', -90], ['b', -90], ['r', 90], ['b', 90], ['r', -90], ['u', -90], ['r', -90], ['u', 90], ['r', 180, 400], ['b', 90], ['u', 90], ['b', -90], ['u', -90], ['r', -90], ['f', -90], ['u', 180, 400], ['f', 90], ['u', 90], ['f', -90], ['u', 90], ['f', 90], ['r', -90], ['u', -90], ['r', 90], ['u', -90], ['r', -90], ['u', 180, 400], ['r', 90], ['u', 90], ['r', 180, 400], ['u', 90], ['r', 90], ['u', 90], ['r', -90], ['u', -90], ['r', -90], ['u', -90], ['r', -90], ['u', 90], ['r', -90]])
          break
      }
    },
    _keyDownEvent (e) { // 键盘按下事件
      switch(e.key) {
        case 'ArrowUp':
          this.x >= 45 || this.x++
          break
        case 'ArrowDown':
          this.x <= -45 || this.x--
          break
        case 'ArrowLeft':
          this.y <= -360 && this._recovery('y')
          this.y--
          break
        case 'ArrowRight':
          this.y >= 360 && this._recovery('y')
          this.y++
          break
      }
    },
    _recovery (axis, callback, value = 0) { // 魔方回正
      this.transitionTime = 0
      this[axis] = value
      setTimeout(() => {
        this.transitionTime = 0.2
        callback && callback()
      }, 0);
    },
    mouseDownHandler (e) { // 鼠标在某个面上按下时触发
      this.clickIsInPage = true
      this.downX = e.pageX // 记录鼠标按下时的坐标
      this.downY = e.pageY
      this.tmpX = this.x // 记录当前旋转的角度
      this.tmpY = this.y
      addEventListener('mousemove', this._mouseMove) // 监听鼠标移动事件
    },
    _mouseMove (e) { // 鼠标移动时的回调
      this.prohibitRotate = false // 节流阀 控制魔方整体旋转时阻止单层旋转和执行公式
      let diffX = Math.floor((e.pageX - this.downX) / 2) // 记录鼠标移动后与按下时的坐标差值
      let diffY = Math.floor(-(e.pageY - this.downY) / 2)
      let tmpAndX = diffY + this.tmpX // 原始x轴旋转角度
      this.x = tmpAndX < -45 ? -45 : tmpAndX > 45 ? 45 : tmpAndX // 限制x轴旋转的角度范围 -45到45之间
      this.y = diffX + this.tmpY
    }
  },
  mounted () {
    addEventListener('keyup', e => this._keyUpEvent(e))
    addEventListener('keydown', e => this._keyDownEvent(e))
    addEventListener('mouseup', () => { // 鼠标弹起时触发
      if (!this.clickIsInPage) return
      removeEventListener('mousemove', this._mouseMove) // 注销鼠标移动的监听事件 节约性能以及防止不可预料的bug
      let yValue = this.y
      this._recovery('y', () => { this.prohibitRotate = true; this.clickIsInPage = false }, yValue >= 360 ? yValue % 360 : yValue <= -360 ? yValue % -360 : yValue) // 旋转角度超过360后自动回正 避免出现不可预期的bug
    })
  }
}
</script>

<style scoped>
.container {
  border: 1px solid transparent;
  position: relative;
}
.bg {
  position: fixed;
  width: 100%;
  height: 100%;
}
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
/* 菜单 */
.menu {
  /* display: none; */
  width: 400px;
  position: absolute;
  top: 100px;
  left: 100px;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, .2);
  transition: all .2s;
}
.head {
  border-bottom: 1px solid white;
}
.head>ul {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
.head>ul>li {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  text-align: center;
  line-height: 40px;
  transition: all .2s;
}
.head>ul>li:hover {
  background-color: rgba(255, 255, 255, .5);
}
.body {
  padding: 10px;
}
.body>ul {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-around;
}
.body>ul>li {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 80px;
  height: 80px;
  margin: 10px 0 0 0;
  font-size: 12px;
  transition: all .2s;
}
.body>ul>li:hover {
  background-color: rgba(255, 255, 255, .5);
}
.body>ul .cancel {
  font-size: 20px;
  justify-content: space-evenly;
}
.body>ul>li>img {
  display: block;
  width: 70%;
  height: 70%;
  margin: auto;
}
.footer {
  padding: 10px;
  border-top: 1px solid white;
}
.footer .control {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-around;
}
.footer .control>div {
  width: 60px;
  height: 30px;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  transition: all .2s;
  background: #40b6b7;
}
.footer .control>div:hover {
  background-color: rgba(255, 255, 255, .5);
}
.footer .formula {
  /* display: inline-block;
  width: 100%; */
  word-wrap: break-word;
  /* height: 20px; */
}
</style>
