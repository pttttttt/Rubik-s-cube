<template>
  <div class="container">
    <div class="bg" :style="`background: ${configInformation.tmpBgcColor};`"></div>
    <!-- 魔方 -->
    <div class="box"
      :style="`transform: translate(-50%, -50%) rotateX(${configInformation.initialAngle.x + rubikSCubeRotateConfig.x}deg) rotateY(${configInformation.initialAngle.y + rubikSCubeRotateConfig.y}deg); transition: all ${transitionTime}s;`"
      @mousedown="mouseDownHandler"
      >
      <!-- 悬浮在魔方每个面上的遮罩层 鼠标点击时传递相应的参数以控制魔方旋转 -->
      <div class="tips"
        v-show="hideTip"
        v-for="data in tips"
        :key="data.id"
        @click="clickHandler(data.id, true)"
        @contextmenu.prevent="clickHandler(data.id, false)"
        :style="`width: ${configInformation.companyLength * 3}px; height: ${configInformation.companyLength * 3}px; transform: ${data.deg} translateZ(${151 + configInformation.companyLength % 100}px);`"
      >
        <img src="../assets/fangxiang.png" alt="">
      </div>
      <!-- 魔方主体(静止) -->
      <div class="subject-one" :style="revolve">
        <div
          class="diamond"
          v-for="data in data"
          :key="data.id"
          :style="`transform: translate3d(${data.deviation});`"
        >
          <div
            v-for="angle in data.angle"
            @click="angle.color = '#cdcbce'"
            :key="angle.id"
            :title="`${data.id}-${angle.id} ${data.original}`"
            :style="`transform: ${angle.deg} translateZ(50px); background: ${data.display ? configInformation.pageColor[angle.color] : 'transparent'};`"
            ></div>
        </div>
      </div>
      <!-- 魔方主体(旋转) -->
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
            :key="angle.id"
            :title="`${data.id}-${angle.id} ${data.original}`"
            :style="`transform: ${angle.deg} translateZ(50px); background: ${data.display ? configInformation.pageColor[angle.color] : 'transparent'};`"
          ></div>
        </div>
      </div>
    </div>
    <div class="menu" :style="`top: ${150 + menuMoveConfig.y}px; left: ${100 + menuMoveConfig.x}px;`"
      v-show="this.menuMoveConfig.display"
    >
      <div class="head">
        <ul class="nav">
          <li @click="switchFormula = true" :style="switchFormula && 'background: rgba(255, 255, 255, .5)'">还原公式</li>
          <li @click="switchFormula = false; cancelHanlder()" :style="switchFormula || 'background: rgba(255, 255, 255, .5)'">其他公式</li>
          <li
            class="move-control"
            style="flex: auto;"
            @mousedown="startMove($event)"
          ></li>
        </ul>
      </div>
      <div class="body">
        <ul v-if="switchFormula">
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
        <ul v-else>
          <li
            v-for="item in otherFormulaButton"
            :key="item.key"
            @click="implementFormulaHanlder(otherFormula[item.key], false)"
            @contextmenu.prevent="implementFormulaHanlder(otherFormula[item.key], true)"
          >
            <img :src="require('../assets/otherFormulaImg/' + item.key + '.png')" alt="寄">
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <div class="footer">
        <div class="control">
          <div @click="disruptionHanlder" title="随机生成打乱公式并执行">打乱</div>
          <!-- <div @click="reversal = !reversal" :style="reversal ? 'background: white;' : ''">逆转</div> -->
          <div @click="startRecordHandler" title="开始记录步骤">开始</div>
          <div @click="closeRecordHandler" title="结束记录并在控制台输出步骤">结束</div>
          <div @click="rollBackHandler" title="撤回上一步，只能撤回记录过的步骤">撤销</div>
          <div @click="_keyUpEvent({ key: ' ' })" title="复原魔方整体旋转角度">复位</div>
          <div @click="_restore" title="强制复原，无公式">复原</div>
          <div @click="_autoRecovery()" title="自动生成公式复原">自动</div>
          <div @click="_autoRecoveryFormula()" title="只生成公式，不复原">公式</div>
          <div @click="hideTip = false" title="隐藏魔方表面的遮罩层">隐藏</div>
          <div @click="hideTip = true" title="显示魔方表面的遮罩层">显示</div>
        </div>
        <div class="formula" @click="pasteTextToClipboard(outputText)">{{ outputText }}</div>
      </div>
    </div>
    <div class="setting" v-show="settingConfig.display">
      <div class="head">更改基本配置</div>
      <div class="body">
        <div class="speed">
          <span>单层旋转速度</span>
          <input type="text" v-model.number="configInformation.rotateTime">
        </div>
        <div class="formula">
          <input type="text" v-model="settingConfig.formula">
          <button @click="implement">执行</button>
        </div>
        <div class="bg-color">
          <span>背景颜色</span>
          <el-ColorPicker v-model="configInformation.tmpBgcColor" @active-change="bgColorChange"></el-ColorPicker>
        </div>
        <div class="other-color">
          <ul>
            <li v-for="(layer, key, index) in configInformation.tmpPageColor" :key="index">
              <span>{{ key }}</span>
              <el-ColorPicker v-model="configInformation.tmpPageColor[key]" @active-change="colorChange($event, key)"></el-ColorPicker>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { operation, formula, otherFormula, formulaButton, otherFormulaButton } from '../utils/formula.js'
import deepCopy from '../utils/deepCopy.js'
import { pageColor, bgcColor, rotateTime, initialAngle, companyLength, tips } from '../utils/configInformation.js'
import pasteTextToClipboard from '../utils/pasteTextToClipboard.js'
import colorExchange from '../utils/colorExchange.js'
// import rgbToHexadecimal from '../utils/rgbToHexadecimal.js'

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
    const data = _optimizationDataHandler(basicPositioInfo)
    const datas = deepCopy(data)
    function _optimizationDataHandler(arr) { // 魔方光有位置信息并不能够较好地渲染 还需要进一步的处理
      const tmpData = []
      let color, judge, x, y, z, layer, rgba = 'hide'
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
              color.top = 'u' // u
              layer.u = true
              judge = false
              td = false
              continue
            } else if (v[j] === 'd') {
              y = companyLength * 2
              color.down = 'd' // d
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
              color.right = 'r' // r
              color.left = rgba
              layer.r = true
              judge = false
              rl = false
              continue
            } else if (v[j] === 'l') {
              x = 0
              color.left = 'l' // l
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
              color.front = 'f' // f
              layer.f = true
              judge = false
              fb = false
              continue
            } else if (v[j] === 'b') {
              z = -companyLength
              color.after = 'b' // b
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
          original: v, // 原始位置信息 （自动还原时使用）
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
      allColor: Object.freeze(allColor),
      operation: Object.freeze(operation), // 魔方所有操作方法
      formula: Object.freeze(formula), // 魔方公式
      formulaButton, // 魔方公式所对应的按钮
      otherFormula: Object.freeze(otherFormula), // 其他魔方公式
      otherFormulaButton,
      SelectedFormula: false, // 当前是否选中公式
      isImplementFormula: false, // 当前是否正在执行公式
      isAutoRecovery: false, // 是否正在自动复原
      isAutoRecoveryFormula: false, // 是否正在生成复原公式
      reversal: false, // 是否逆转公式
      formulaName: '', // 当前选中公式的名称
      record: false, // 是否开始记录
      step: [], // 当前已经执行过的步骤
      outputText: '', // 文本形式输出的公式
      revolve: '', // 旋转时给旋转体加的样式
      intercept: true, // 单层旋转时的节流阀
      clickIsInPage: false, // 判断是否在魔方的某一个面上按下鼠标
      hideTip: true, // 隐藏提示层
      transitionTime: 0.2, // 魔方整体旋转的过渡时间
      prohibitRotate: true, // 整体旋转的节流阀
      switchFormula: true, // 公式 or 其他
      // 配置信息
      rubikSCubeRotateConfig: { // 魔方旋转配置信息
        x: 0, // 魔方整体旋转角度
        y: 0,
        downX: 0, // 记录鼠标按下时的坐标
        downY: 0,
        tmpX: 0, // 记录鼠标按下之前的旋转角度
        tmpY: 0
      },
      configInformation: { // 魔方基础配置
        initialAngle, // 初始角度
        bgcColor, // 背景颜色
        tmpBgcColor: bgcColor,
        pageColor, // 页面颜色
        tmpPageColor: deepCopy(pageColor),
        companyLength,
        rotateTime, // 魔方单层旋转所需的时间
        tmpRotateTime: rotateTime
      },
      menuMoveConfig: { // 菜单配置信息
        display: true,
        move: false,
        x: 0,
        y: 0,
        downX: 0,
        downY: 0,
        moveX: 0,
        moveY: 0
      },
      settingConfig: { // 设置配置信息
        display: false,
        formula: 'u',
      }
    }
  },
  methods: {
    controlRotateHandler (layer, deg) { // 控制魔方单层旋转 核心逻辑
      const time = (deg === 180 || deg === -180) ? this.configInformation.rotateTime * 2 : this.configInformation.rotateTime
      const tmpFormula = [layer, deg, time] // 保存传入的初始值 为后续的记录做准备
      return new Promise(resolve => {
        if (!(this.intercept && (this.prohibitRotate || this.isImplementFormula))) return
        this.record && this._record(tmpFormula) // 记录
        let axis
        switch (layer) { // 根据点击的的面调整旋转的轴以及方向
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
        if (time === 0) {
          colorExchange(this.data, layer, deg) // 根据点击的面以及方式对两个魔方体的颜色进行变换
          if (!this.isAutoRecoveryFormula) {
            colorExchange(this.datas, layer, deg)
          }
          this.intercept = true // 关闭节流阀
          resolve(tmpFormula)
          return
        }
        this._displaySwitch(false, layer) // 隐藏非旋转体被点击的层 隐藏旋转体未被点击的层
        this.revolve = `transition: all ${time / 1000}s; transform: rotate${axis}(${deg}deg);` // 通过过渡和3d转换来做出旋转的动画效果
        setTimeout(() => { // 此代码块会在旋转的动画效果结束后执行
          colorExchange(this.data, layer, deg) // 根据点击的面以及方式对两个魔方体的颜色进行变换
          colorExchange(this.datas, layer, deg)
          this.revolve = `` // 清除过渡和3d旋转的样式 这样就可以在肉眼看不出来的情况下把旋转体复原到原本的旋转角度
          this._displaySwitch(true, layer) // 恢复旋转之前被隐藏的层
          setTimeout(() => {
            this.intercept = true // 关闭节流阀
            resolve(tmpFormula) // 执行完等一会后再告诉promise已经完成，防止无法预料的bug
          }, 50);
        }, time + 5)
      })
    },
    clickHandler (id, leftOrRight) { // 鼠标点击魔方的面
      if (this.isImplementFormula) return
      if (this.SelectedFormula) {
        this.implementFormulaHanlder(this.formula[this.formulaName][id], !leftOrRight)
      } else {
        this.controlRotateHandler(id, leftOrRight ? -90 : 90)
      }
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
    implementFormulaHanlder (formula, isNeedReversal = this.reversal) { // 通过选择的公式和点击的层选择公式并交给递归函数执行
      if (isNeedReversal) {
        formula = this._reversal(deepCopy(formula))
      }
      this._recursion(formula)
    },
    disruptionHanlder () { // 打乱
      if (!this.intercept) return
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
        disruptionFormula.push(this.operation[key])
      }
      this._recursion(disruptionFormula)
    },
    startRecordHandler () { // 开始
      this.outputText = ''
      this.record = true
    },
    closeRecordHandler (judge = false) { // 结束
      const formula = this._strToFormula(this.outputText) // 将记录的字符串转换为公式
      const simplifyFormula = this._simplifyStepsHanlder(formula) // 简化公式
      const str = this._formulaToStr(simplifyFormula, true) // 公式转字符串
      const simplifyStr = this._formulaToStr(simplifyFormula) // 公式转字符串
      this.pasteTextToClipboard(judge ? simplifyStr : str) // 将最终公式粘贴到剪贴板
      console.log('原始公式：' + this.outputText) // 控制台输出原始公式
      console.log('简化公式：' + simplifyStr) // 控制台输出简化公式
      this.record = false
    },
    rollBackHandler () { // 撤销
      if (!this.intercept) return
      if (!this.step.length) return
      this.record = false
      this.outputText = this.outputText.replace(/([a-z]|[a-z]('|2))$/, '')
      this.controlRotateHandler(...this._reversal([this.step.pop()])[0]).then(() => this.record = true)
    },
    startMove (e) { // 菜单拖拽
      this.menuMoveConfig.move = true
      this.menuMoveConfig.downX = e.pageX
      this.menuMoveConfig.downY = e.pageY
      addEventListener('mousemove', this._move)
    },
    _record (formula) { // 记录
      this.step.push([...formula])
      this.outputText += this._formulaToStr([formula])
    },
    _move (e) { // 拖拽时监听鼠标移动的回调
      const tmpX = this.menuMoveConfig.moveX + e.pageX - this.menuMoveConfig.downX
      const tmpY = this.menuMoveConfig.moveY + e.pageY - this.menuMoveConfig.downY
      this.menuMoveConfig.x = tmpX < -100 ? -100 : tmpX
      this.menuMoveConfig.y = tmpY < -150 ? -150 : tmpY
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
      if (!this.prohibitRotate && !this.isAutoRecovery) return // 魔方整体旋转时禁止单层旋转
      if (!tmpFormula.length) return // 公式不能为空
      this.isImplementFormula = true // 打开执行公式的节流阀
      const formula = [...tmpFormula]
      return new Promise(res => {
        const fn = promise => {
          promise.then(() => {
            const next = this.controlRotateHandler(...formula.shift())
            if (formula.length) fn(next)
            else {
              next.then(data => { // 当最后一个步骤执行完成后关闭节流阀
                this.isImplementFormula = false
                res(data)
              })
            }
          })
        }
        if (formula.length === 1) { // 当公式中只有一步操作时
          this.controlRotateHandler(...formula.shift()).then(data => {
            this.isImplementFormula = false
            res(data)
          })
        } else {
          fn(this.controlRotateHandler(...formula.shift()))
        }
      })
    },
    _displaySwitch (boolean, layer) { // 旋转时控制魔方显示部分
      this.data.forEach((v, i) => v.layer[layer] ? this.datas[i].display = boolean : v.display = boolean)
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
    _autoRecovery (data = this.data) { // 自动复原
      const that = this
      that.isAutoRecovery = true
      that.startRecordHandler()
      const allFormula = that.formula
      const { r2, l2, f, f1, f2, b, b1, b2, u, u1, u2 } = that.operation
      const subscript = {
        topEdge: [1, 3, 5, 7], // 顶层棱块下标
        centerEdge: [9, 11, 13, 15], // 中间层棱块下标
        bottomAndCenterEdge: [9, 11, 13, 15, 19, 21, 23, 25], // 底层和中间层棱块下标
        topCorner: [0, 2, 4, 6], // 顶层角块下标
        bottomCorner: [18, 20, 22, 24], // 底层角块下标
      }

      // 底层十字架复原 第一步
      function bottomCrossOne (res) { // 从底层和中间层的棱块中寻找有白色面的块
        let formula = [] // 需执行的公式
        for (let i = 0; i < subscript.bottomAndCenterEdge.length; i++) { // 遍历出所需棱块的下标
          if (formula.length !== 0) break // 如在之前的循环中已找到目标块，则退出循环
          let item = data[subscript.bottomAndCenterEdge[i]]
          for (let j = 0; j < item.angle.length; j++) { // 遍历每一个块的6个面
            const tmpColor = item.angle[j].color // 当前面的颜色所映射的字符
            if (tmpColor !== 'd') continue // 不是底部颜色（默认白色） 退出循环
            let str = item.original // 当前块的位置信息
            if (/f/.test(str)) {
              rightOrLeft(str, () => {
                formula = free(1, [f1])
              }, () => {
                formula = free(1, [f])
              }, () => {
                formula = free(1, [f2])
              })
            } else if (/b/.test(str)) {
              rightOrLeft(str, () => {
                formula = free(5, [b])
              }, () => {
                formula = free(5, [b1])
              }, () => {
                formula = free(5, [b2])
              })
            } else {
              rightOrLeft(str, () => {
                formula = free(7, [r2])
              }, () => {
                formula = free(3, [l2])
              })
            }
          }
        }
        if (formula.length === 0) return res()
        that._recursion(formula, false).then(() => {
          bottomCrossOne(res)
        })
      }
      function free (index, formula) {
        if (judge(index)) return formula
        let indexArr = subscript.topEdge.filter(v => v !== index)
        for (let i = 0; i < indexArr.length; i++) {
          if (judge(indexArr[i])) {
            let tmpFormula = []
            let index2 = indexArr[i]
            if (index - index2 === 2) tmpFormula = [u]
            else if (index - index2 === -2) tmpFormula = [u1]
            else tmpFormula = [u2]
            return [...tmpFormula, ...formula]
          }
        }

        function judge (index) {
          for (let i = 0; i < 6; i++) {
            let tmpColor = data[index].angle[i].color
            if (tmpColor === 'd') {
              return false
            }
          }
          return true
        }
      }
      function rightOrLeft (str, callbackRight, callbackLeft, callbackOther) {
        if (/r/.test(str)) {
          callbackRight && callbackRight()
        } else if (/l/.test(str)) {
          callbackLeft && callbackLeft()
        } else {
          callbackOther && callbackOther()
        }
      }

      // 底层十字架复原 第二步
      function bottomCrossTwo (res) {
        const formula = []
        for (let i = 0; i < subscript.topEdge.length; i++) {
          if (formula.length !== 0) break
          const item = data[subscript.topEdge[i]]
          let judge = false
          let tmpColor = ''
          let color = ''
          for (let j = 0; j < item.angle.length; j++) {
            tmpColor = item.angle[j].color
            if (tmpColor === 'd') judge = true
            if (tmpColor !== 'hide' && tmpColor !== 'd') {
              color = tmpColor
              if (judge) break
            }
          }
          if (!judge) continue
          switch (color) {
            case 'f':
              formula.push(...topRotate(item.id - 1), ...judgeInvert(item, color))
              break
            case 'r':
              formula.push(...topRotate(item.id - 7), ...judgeInvert(item, color))
              break
            case 'b':
              formula.push(...topRotate(item.id - 5), ...judgeInvert(item, color))
              break
            case 'l':
              formula.push(...topRotate(item.id - 3), ...judgeInvert(item, color))
              break
            default:
              break
          }
        }
        if (formula.length === 0) return res()
        that._recursion(formula, false).then(() => {
          bottomCrossTwo(res)
        })
      }
      function topRotate (diff) {
        switch (diff) {
          case 2:
            return [u1]
          case 4:
            return [u2]
          case 6:
            return [u]
          case -2:
            return [u]
          case -4:
            return [u2]
          case -6:
            return [u1]
          case 0:
            return []
        }
      }
      function judgeInvert (item, layer) {
        if (item.angle[0].color !== 'd') {
          return allFormula.a[layer]
        }
        return [that.operation[layer + '2']]
      }

      // 底层角块 复位
      function bottomCornerPosition (res) {
        const formula = []
        for (let i = 0; i < subscript.topCorner.length; i++) {
          if (formula.length !== 0) break
          const item = data[subscript.topCorner[i]]
          let judge = false
          let color = []
          for (let j = 0; j < item.angle.length; j++) {
            const tmpColor = item.angle[j].color
            if (tmpColor === 'd') judge = true
            if (tmpColor !== 'hide' && tmpColor !== 'd') {
              color.push(tmpColor)
            }
          }
          if (!judge) continue
          if (color.includes('f') && color.includes('r')) {
            formula.push(...topRotate(item.id - 0), ...allFormula.b['f'])
          } else if (color.includes('r') && color.includes('b')) {
            formula.push(...topRotate(item.id - 6), ...allFormula.b['r'])
          } else if (color.includes('b') && color.includes('l')) {
            formula.push(...topRotate(item.id - 4), ...allFormula.b['b'])
          } else if (color.includes('l') && color.includes('f')) {
            formula.push(...topRotate(item.id - 2), ...allFormula.b['l'])
          }
        }
        if (formula.length !== 0) {
          that._recursion(formula, false).then(() => bottomCornerPosition(res))
        } else {
          const errorPosition = positionError(subscript.bottomCorner)
          if (!errorPosition) return res()
          const id = errorPosition.id
          switch (id) {
            case 18:
              formula.push(...allFormula.b['f'])
              break
            case 20:
              formula.push(...allFormula.b['l'])
              break
            case 22:
              formula.push(...allFormula.b['b'])
              break
            case 24:
              formula.push(...allFormula.b['r'])
              break
          }
          that._recursion(formula, false).then(() => bottomCornerPosition(res))
        }
      }
      // 底层角块 复原
      function bottomCorner (res) {
        const formula = []
        if (data[18].angle[2].color !== 'd') formula.push(...allFormula.c['f'])
        if (data[20].angle[2].color !== 'd') formula.push(...allFormula.c['l'])
        if (data[22].angle[2].color !== 'd') formula.push(...allFormula.c['b'])
        if (data[24].angle[2].color !== 'd') formula.push(...allFormula.c['r'])
        if (formula.length === 0) return res()
        that._recursion(formula, false).then(() => bottomCorner(res))
      }

      // 中间层棱块 复位
      function centerEdgePosition (res) {
        const formula = []
        for (let i = 0; i < subscript.topEdge.length; i++) {
          if (formula.length !== 0) break
          const item = data[subscript.topEdge[i]]
          let judge = true
          let colorArr = []
          for (let j = 0; j < item.angle.length; j++) {
            const tmpColor = item.angle[j].color
            if (tmpColor === 'u') {
              judge = false
              break
            }
            if (tmpColor !== 'hide') colorArr.push(tmpColor)
          }
          if (!judge) continue
          if (colorArr.includes('f') && colorArr.includes('r')) {
            formula.push(...topRotate(item.id - 1), ...allFormula.centerLayerRight['f'])
          } else if (colorArr.includes('r') && colorArr.includes('b')) {
            formula.push(...topRotate(item.id - 7), ...allFormula.centerLayerRight['r'])
          } else if (colorArr.includes('b') && colorArr.includes('l')) {
            formula.push(...topRotate(item.id - 5), ...allFormula.centerLayerRight['b'])
          } else if (colorArr.includes('l') && colorArr.includes('f')) {
            formula.push(...topRotate(item.id - 3), ...allFormula.centerLayerRight['l'])
          }
        }
        if (formula.length !== 0) {
          that._recursion(formula, false).then(() => centerEdgePosition(res))
        } else {
          let errorPosition = positionError(subscript.centerEdge)
          if (!errorPosition) return res()
          const id = errorPosition.id
          switch (id) {
            case 9:
              formula.push(...allFormula.centerLayerRight['f'])
              break
            case 11:
              formula.push(...allFormula.centerLayerRight['l'])
              break
            case 13:
              formula.push(...allFormula.centerLayerRight['b'])
              break
            case 15:
              formula.push(...allFormula.centerLayerRight['r'])
              break
          }
          that._recursion(formula, false).then(() => centerEdgePosition(res))
        }
      }

      // 中间层棱块 复原
      function center (res) {
        const formula = []
        if (data[9].angle[4].color !== 'f') formula.push(...allFormula.centerLayerFlip['f'])
        if (data[11].angle[4].color !== 'f') formula.push(...allFormula.centerLayerFlip['l'])
        if (data[13].angle[5].color !== 'b') formula.push(...allFormula.centerLayerFlip['b'])
        if (data[15].angle[5].color !== 'b') formula.push(...allFormula.centerLayerFlip['r'])
        if (formula.length === 0) return res()
        that._recursion(formula, false).then(() => res())
      }

      function positionError (arr) { // 判断块是否在自己原本的位置
        for (let i = 0; i < arr.length; i++) {
          const item = data[arr[i]]
          const correctPosition = item.original.split('')
          const currentPosition = []
          for (let j = 0; j < item.angle.length; j++) {
            if (currentPosition.length >= 3) break
            const tmpColor = item.angle[j].color
            if (tmpColor !== 'hide') {
              currentPosition.push(tmpColor)
            }
          }
          const merge = new Set([...correctPosition, ...currentPosition])
          if (merge.size !== correctPosition.length) {
            return { id: item.id, color: currentPosition }
          }
        }
        return false
      }

      // 顶层十字架 复位
      function topCrossPosition (res) {
        const formula = []
        let counter = []
        if (data[1].angle[0].color === 'u') counter.push(1)
        if (data[3].angle[0].color === 'u') counter.push(3)
        if (data[5].angle[0].color === 'u') counter.push(5)
        if (data[7].angle[0].color === 'u') counter.push(7)
        let sum = 0
        switch (counter.length) {
          case 4:
            return res() // 已经复位
          case 0:
            formula.push(...allFormula.topLayerOne['f'], ...allFormula.topLayerTwo['f'])
            break
          default:
            sum = counter[0] + counter[1]
            switch (sum) {
              case 6:
                formula.push(...allFormula.topLayerTwo['r'])
                break
              case 10:
                formula.push(...allFormula.topLayerTwo['f'])
                break
              case 4:
                formula.push(...allFormula.topLayerOne['r'])
                break
              case 12:
                formula.push(...allFormula.topLayerOne['l'])
                break
              case 8:
                if (counter[0] === 3) {
                  formula.push(...allFormula.topLayerOne['f'])
                } else {
                  formula.push(...allFormula.topLayerOne['b'])
                }
              break
            }
            break
        }
        that._recursion(formula).then(() => res())
      }

      // 顶面复原
      function topSurface (res) {
        const formula = []
        const counter = []
        if (data[0].angle[0].color !== 'u') {
          counter.push({id: 0, clockwise: data[0].angle[1].color === 'u'})
        }
        if (data[2].angle[0].color !== 'u') {
          counter.push({id: 2, clockwise: data[2].angle[4].color === 'u'})
        }
        if (data[4].angle[0].color !== 'u') {
          counter.push({id: 4, clockwise: data[4].angle[3].color === 'u'})
        }
        if (data[6].angle[0].color !== 'u') {
          counter.push({id: 6, clockwise: data[6].angle[5].color === 'u'})
        }
        let sum
        switch (counter.length) {
          case 0:
            return res()
          case 2:
            sum = counter[0].id + counter[1].id
            if (sum === 6 || sum === 8) {
              let tmpId = counter[0].clockwise ? counter[0].id : counter[1].id
              formula.push(...allFormula.topLayerFishOne[data[tmpId + 1].original[1]])
            } else {
              if (counter[0].id === 6) {
                formula.push(...(counter[0].clockwise ? allFormula.topLayerFishOne['f'] : allFormula.topLayerFishOne['r']))
              } else {
                if (counter[0].clockwise) {
                  formula.push(...allFormula.topLayerFishOne[data[counter[1].id + 1].original[1]])
                } else {
                  formula.push(...allFormula.topLayerFishOne[data[counter[0].id + 1].original[1]])
                }
              }
            }
            break
          case 4:
            if (data[0].angle[4].color === 'u' && data[2].angle[4].color === 'u') formula.push(...allFormula.topLayerFishOne['f'])
            else if (data[2].angle[3].color === 'u' && data[4].angle[3].color === 'u') formula.push(...allFormula.topLayerFishOne['l'])
            else if (data[4].angle[5].color === 'u' && data[6].angle[5].color === 'u') formula.push(...allFormula.topLayerFishOne['b'])
            else formula.push(...allFormula.topLayerFishOne['r'])
            break
          case 3:
            sum = counter[0].id + counter[1].id + counter[2].id
            formula.push(...allFormula.topLayerFishOne[data[13 - sum].original[1]])
            break
        }
        that._recursion(formula).then(() => topSurface(res))
      }

      // 顶层角块 复位
      function topCorner (res) {
        const formula = []
        const counter = []
        if (data[0].angle[4].color === data[2].angle[4].color) counter.push('f')
        if (data[2].angle[3].color === data[4].angle[3].color) counter.push('l')
        if (data[4].angle[5].color === data[6].angle[5].color) counter.push('b')
        if (data[6].angle[1].color === data[0].angle[1].color) counter.push('r')
        if (counter.length === 0) formula.push(...allFormula.topLayerCornerBlock['f'])
        else if (counter.length === 1) formula.push(...allFormula.topLayerCornerBlock[counter[0]])
        else {
          let tmpStep = []
          switch (data[0].angle[4].color) {
            case 'l':
              tmpStep = u
              break
            case 'b':
              tmpStep = u2
              break
            case 'r':
              tmpStep = u1
              break
          }
          return that._recursion([tmpStep]).then(() => res())
        }
        that._recursion(formula).then(() => topCorner(res))
      }

      // 顶层棱块 复位
      function topEdgePosition (res) {
        const formula = []
        const color = [
          data[1].angle[4].color,
          data[3].angle[3].color,
          data[5].angle[5].color,
          data[7].angle[1].color
        ]
        const position = ['f', 'l', 'b', 'r']
        const counter = []
        for (let i = 0; i < position.length; i++) {
          if (position[i] === color[i]) counter.push(position[i])
          if (counter.length >= 2) return res()
        }
        if (counter.length === 1) {
          let layer
          switch (counter[0]) {
            case 'f':
              layer = 'b'
              break
            case 'l':
              layer = 'r'
              break
            case 'b':
              layer = 'f'
              break
            case 'r':
              layer = 'l'
              break
          }
          formula.push(...allFormula.topLayerEdgeBlockOne[layer])
        } else {
          formula.push(...allFormula.topLayerEdgeBlockOne['f'])
        }
        that._recursion(formula).then(() => topEdgePosition(res))
      }

      // new Promise(res => bottomCrossOne(res)).then(() => {
      //   new Promise(res => bottomCrossTwo(res)).then(() => {
      //     new Promise(res => bottomCornerPosition(res)).then(() => {
      //       new Promise(res => bottomCorner(res)).then(() => {
      //         new Promise(res => centerEdgePosition(res)).then(() => {
      //           new Promise(res => center(res)).then(() => {
      //             new Promise(res => topCrossPosition(res)).then(() => {
      //               new Promise(res => topSurface(res)).then(() => {
      //                 new Promise(res => topCorner(res)).then(() => {
      //                   new Promise(res => topEdgePosition(res)).then(() => {
      //                     that.isAutoRecovery = false
      //                     that.closeRecordHandler()
      //                     console.log('结束')
      //                   })
      //                 })
      //               })
      //             })
      //           })
      //         })
      //       })
      //     })
      //   })
      // })
      return new Promise(res => {
        function simulateAsyncTask(handler) {
          return new Promise(resolve => {
            handler(resolve)
          })
        }
        const tasks = [bottomCrossOne, bottomCrossTwo, bottomCornerPosition, bottomCorner, centerEdgePosition, center, topCrossPosition, topSurface, topCorner, topEdgePosition ]
        function runTasksSequentially(tasks) {
          if (tasks.length === 0) {
            that.isAutoRecovery = false
            that.closeRecordHandler(true)
            res()
            return
          }
          const task = tasks.shift()
          simulateAsyncTask(task).then(() => {
            runTasksSequentially(tasks)
          })
        }
        runTasksSequentially(tasks)
      })
    },
    _autoRecoveryFormula () {
      const that = this
      that.isAutoRecoveryFormula = true
      const tmpTime = that.configInformation.rotateTime
      that.configInformation.rotateTime = 0
      that._autoRecovery().then(() => {
        that.configInformation.rotateTime = tmpTime
        that.data = deepCopy(that.datas)
        that.isAutoRecoveryFormula = true
      })
    },
    _keyUpEvent (e) { // 键盘弹起事件
      switch(e.key) {
        case ' ':
          if (e.ctrlKey) this.menuMoveConfig.display = !this.menuMoveConfig.display
          else this.rubikSCubeRotateConfig.x = this.rubikSCubeRotateConfig.y = 0
          break
        case 'Escape':
          this._restore()
          break
        case 'Enter':
          this.disruptionHanlder()
          // this._recursion(this._strToFormula('bu2b1ubu2b1ur1u1r'))
          break
        case 'z':
          if (e.ctrlKey) this.rollBackHandler()
          break
        case 'i':
          if (e.ctrlKey) this.settingConfig.display = !this.settingConfig.display
          break
      }
    },
    _keyDownEvent (e) { // 键盘按下事件
      switch(e.key) {
        case 'ArrowUp':
          this.rubikSCubeRotateConfig.x >= 45 || this.rubikSCubeRotateConfig.x++
          break
        case 'ArrowDown':
          this.rubikSCubeRotateConfig.x <= -45 || this.rubikSCubeRotateConfig.x--
          break
        case 'ArrowLeft':
          this.rubikSCubeRotateConfig.y <= -360 && this._recovery('y')
          this.rubikSCubeRotateConfig.y--
          break
        case 'ArrowRight':
          this.rubikSCubeRotateConfig.y >= 360 && this._recovery('y')
          this.rubikSCubeRotateConfig.y++
          break
      }
    },
    _recovery (axis, callback, value = 0) { // 魔方回正
      this.transitionTime = 0
      this.rubikSCubeRotateConfig[axis] = value
      setTimeout(() => {
        this.transitionTime = 0.2
        callback && callback()
      }, 0);
    },
    mouseDownHandler (e) { // 鼠标在某个面上按下时触发
      this.clickIsInPage = true
      this.rubikSCubeRotateConfig.downX = e.pageX // 记录鼠标按下时的坐标
      this.rubikSCubeRotateConfig.downY = e.pageY
      this.rubikSCubeRotateConfig.tmpX = this.rubikSCubeRotateConfig.x // 记录当前旋转的角度
      this.rubikSCubeRotateConfig.tmpY = this.rubikSCubeRotateConfig.y
      addEventListener('mousemove', this._mouseMove) // 监听鼠标移动事件
    },
    _mouseMove (e) { // 鼠标移动时的回调
      this.prohibitRotate = false // 节流阀 控制魔方整体旋转时阻止单层旋转和执行公式
      let diffX = Math.floor((e.pageX - this.rubikSCubeRotateConfig.downX) / 2) // 记录鼠标移动后与按下时的坐标差值
      let diffY = Math.floor(-(e.pageY - this.rubikSCubeRotateConfig.downY) / 2)
      let tmpAndX = diffY + this.rubikSCubeRotateConfig.tmpX // 原始x轴旋转角度
      this.rubikSCubeRotateConfig.x = tmpAndX < -45 ? -45 : tmpAndX > 45 ? 45 : tmpAndX // 限制x轴旋转的角度范围 -45到45之间
      this.rubikSCubeRotateConfig.y = diffX + this.rubikSCubeRotateConfig.tmpY
    },
    _strToFormula (str) { // 字符串转公式
      str = str.replace(/1/g, '\'')
      const formula = []
      for (let i = 0, n = str.length; i < n; i++) {
        const layer = str[i]
        const angle = str[i + 1]
        if (/[a-z]/.test(angle)) {
          formula.push(operation[layer])
        } else {
          angle === '\'' ? formula.push(operation[layer + '1']) : formula.push(operation[layer + angle])
          i++
        }
      }
      return formula
    },
    _formulaToStr (formula, isSplicingArrForm = false) { // 公式转字符串
      let str = ''
      const strArr = []
      formula.forEach(value => {
        if (isSplicingArrForm) {
          if (value[1] === -90) strArr.push(value[0] + '1')
          else if (value[1] === 180 || value[1] === -180) strArr.push(value[0] + '2')
          else strArr.push(value[0])
        } else {
          str += value[0]
          if (value[1] === -90) str += "'"
          else if (value[1] === 180 || value[1] === -180) str += '2'
        }
      })
      return isSplicingArrForm ? '[' + strArr.join(', ') + ']' : str
    },
    _simplifyStepsHanlder(originaFlormula) { // 简化公式
      const simplifyFormula = []
      for(let i = 0, n = originaFlormula.length; i < n; i++) {
        let tmpStep = simplifyFormula[simplifyFormula.length - 1]
        const step = originaFlormula[i]
        if (!tmpStep) {
          simplifyFormula.push(step)
          continue
        }
        let sum 
        try {
          sum = step[1] + tmpStep[1] - 0
        } catch (err) {
          console.log(originaFlormula)
        }
        if (step[0] === tmpStep[0]) {
            simplifyFormula.pop()
            switch (sum) {
            case 270:
              simplifyFormula.push([step[0], -90])
            break
            case -270:
              simplifyFormula.push([step[0], 90])
            break
            case 180:
              simplifyFormula.push([step[0], 180])
            break
            case -180:
              simplifyFormula.push([step[0], 180])
            break
            case 90:
              simplifyFormula.push([step[0], 90])
            break
            case -90:
              simplifyFormula.push([step[0], -90])
            break
          }
        } else {
          simplifyFormula.push(step)
        }
      }
      return simplifyFormula
    },
    _updataPageColor(newColor, layer) {
      // const arr = {u: 0, r: 1, d: 2, l: 3, f: 4, b: 5}
      const oldColor = this.configInformation.tmpPageColor
      let max = 0
      const judge = layer === 'hide'
      for (let i = 0, n = this.data.length; i < n; i++) {
        for (let j = 0, n = this.data[i].angle.length; j < n; j++) {
          const value = this.data[i].angle[j]
          const values = this.datas[i].angle[j]
          if (value.color === oldColor[layer]) {
            value.color = values.color = newColor
            max++
            if (!judge) continue
          }
        }
        if (!judge) {
          if (max >= 9) {
            oldColor[layer] = newColor
            break
          }
        }
      }
      oldColor[layer] = newColor
    },
    colorChange (color, layer) {
      // console.log(color, layer)
      this.configInformation.pageColor[layer] = color
      // this._updataPageColor(color, layer)
    },
    bgColorChange (newColor) {
      this.configInformation.tmpBgcColor = newColor
    },
    implement () { // 执行输入的公式
      this._recursion(this._strToFormula(this.settingConfig.formula))
    },
    pasteTextToClipboard
  },
  mounted () {
    addEventListener('keyup', e => this._keyUpEvent(e))
    addEventListener('keydown', e => this._keyDownEvent(e))
    addEventListener('mouseup', () => { // 鼠标弹起时触发
      if (this.menuMoveConfig.move) {
        this.menuMoveConfig.move = false
        this.menuMoveConfig.moveX = this.menuMoveConfig.x
        this.menuMoveConfig.moveY = this.menuMoveConfig.y
        removeEventListener('mousemove', this._move)
      }
      if (!this.clickIsInPage) return
      removeEventListener('mousemove', this._mouseMove) // 注销鼠标移动的监听事件 节约性能以及防止不可预料的bug
      let yValue = this.rubikSCubeRotateConfig.y
      this._recovery('y', () => { this.prohibitRotate = true; this.clickIsInPage = false }, yValue >= 360 ? yValue % 360 : yValue <= -360 ? yValue % -360 : yValue) // 旋转角度超过360后自动回正 避免出现不可预期的bug
    })
  }
}
</script>

<style scoped>
.container {
  /* border: 1px solid transparent; */
  position: relative;
}
.bg {
  position: fixed;
  width: 100%;
  height: 100%;
}
.box {
  position: fixed;
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  /* transform: translate(-50%, -50%); */
  /* margin: 300px auto 0; */
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
  width: 400px;
  position: absolute;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, .2);
}
.menu .head {
  border-bottom: 1px solid white;
}
.menu .head>ul {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
.menu .head>ul>li {
  height: 40px;
  padding: 0 10px;
  font-size: 14px;
  text-align: center;
  line-height: 40px;
  transition: all .2s;
}
.menu .head>ul>li:not(.move-control:hover):hover {
  background-color: rgba(255, 255, 255, .3);
}
.menu .head>ul .move-control {
  cursor: grab;
}
.menu .body {
  padding: 10px;
}
.menu .body>ul {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-around;
}
.menu .body>ul>li {
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
.menu .body>ul>li:hover {
  background-color: rgba(255, 255, 255, .5);
}
.menu .body>ul .cancel {
  font-size: 20px;
  justify-content: space-evenly;
}
.menu .body>ul>li>img {
  display: block;
  width: 70%;
  height: 70%;
  margin: auto;
}
.menu .footer {
  padding: 10px;
  border-top: 1px solid white;
}
.menu .footer .control {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-around;
}
.menu .footer .control>div {
  width: 60px;
  height: 30px;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  transition: all .2s;
  background: #40b6b7;
}
.menu .footer .control>div:hover {
  background-color: rgba(255, 255, 255, .5);
}
.menu .footer .formula {
  word-wrap: break-word;
}
.menu .footer .formula:hover {
  background-color: rgba(0, 0, 0, .1);
}
.setting {
  position: fixed;
  top: 27%;
  left: 70%;
  z-index: 1;
}
</style>
