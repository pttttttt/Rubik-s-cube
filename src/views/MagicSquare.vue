<template>
  <div class="container">
    <div class="bg"></div>
     <!-- :style="`background: ${configInformation.tmpBgcColor};`" -->
    <!-- 魔方 -->
    <div class="box"
      :style="getBoxStyle"
      @mousedown="mouseDownHandler"
      >
      <!-- 悬浮在魔方每个面上的遮罩层 鼠标点击时传递相应的参数以控制魔方旋转 -->
      <div class="tips"
        v-show="hideTip"
        v-for="data in tips"
        :key="data.id"
        @click="clickHandler(data.id, true)"
        @contextmenu.prevent="clickHandler(data.id, false)"
        :style="`${getWholeSize} transform: ${data.deg} translateZ(${151 + configInformation.companyLength - 100}px);`"
      >
        <img src="../assets/fangxiang.png" alt="">
      </div>
      <!-- 魔方本体(旋转) -->
      <div id="cube" class="subject-one" :style="getWholeSize + revolve" @transitionend="transitionEndHandler">
        <div
          class="diamond"
          v-for="data in data"
          :key="data.id"
          :style="pieceStyle(data.deviation)"
          >
          <template v-for="angle in data.angle">
            <div
              v-if="!(settingConfig.hideInside && angle.color === 'hide')"
              @click="angle.color = 'hide'"
              :key="angle.id"
              :title="`${data.id}-${angle.id} ${data.original}`"
              :style="style(data, angle)"
              ></div>
          </template>
        </div>
      </div>
      <!-- 魔方复制体(静止) -->
      <div class="subject-two" :style="getWholeSize">
        <div
          class="diamond"
          v-for="data in datas"
          :key="data.id"
          :style="pieceStyle(data.deviation)"
          >
          <template v-for="angle in data.angle">
            <div
              v-if="!(settingConfig.hideInside && angle.color === 'hide')"
              @click="angle.color = 'hide'"
              :key="angle.id"
              :title="`${data.id}-${angle.id} ${data.original}`"
              :style="style(data, angle)"
              ></div>
              <!-- >{{ `${data.id}-${angle.id} ${data.original}` }}</div> -->
          </template>
        </div>
      </div>
    </div>
    <!-- 性能提示弹窗 -->
    <el-dialog
      title="提示"
      :visible.sync="settingConfig.dialogVisible"
      width="30%"
      :before-close="handleClose">
      <span>同时显示魔方内部细节和边框会消耗大量性能，魔方拖动旋转时可能会造成页面卡顿</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" plain @click="settingConfig.hideInside = true">隐藏内部</el-button>
        <el-button type="success" plain @click="settingConfig.hideBorder = true">隐藏边框</el-button>
        <el-button type="warning" plain @click="permanentCloseTip">无所谓并不再提示</el-button>
      </span>
    </el-dialog>
    <!-- 菜单 -->
    <drag-menu class="menu" v-show="menuMoveConfig.display">
      <div class="head">
        <ul class="nav">
          <li @click="switchFormula = true" :style="switchFormula && 'background: rgba(255, 255, 255, .5)'">还原公式</li>
          <li @click="switchFormula = false; cancelHanlder()" :style="switchFormula || 'background: rgba(255, 255, 255, .5)'">其他公式</li>
          <li
            class="move-control"
            style="flex: auto;"
            id="drag"
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
          <div @click="_restore" title="强制复原，无公式">复原</div>
          <div @click="_autoRecovery()" title="自动生成公式复原">自动</div>
          <div @click="_autoRecoveryFormula()" title="只生成公式，不复原">公式</div>
          <!-- <div @click="reversal = !reversal" :style="reversal ? 'background: white;' : ''">逆转</div> -->
          <div @click="startRecordHandler" title="开始记录步骤">开始</div>
          <div @click="closeRecordHandler" title="结束记录并在控制台输出步骤">结束</div>
          <div @click="rollBackHandler" title="撤回上一步，只能在开始记录后撤回">撤销</div>
          <div @click="_keyUpEvent({ key: ' ' })" title="复原魔方整体旋转角度">复位</div>
          <div @click="hideTip = false" title="隐藏魔方表面的遮罩层">隐藏</div>
          <div @click="hideTip = true" title="显示魔方表面的遮罩层">显示</div>
          <div @click="menuMoveConfig.display = false" title="关闭此菜单，使用'ctrl+空格键'再次打开">关闭</div>
          <div @click="settingConfig.display = !settingConfig.display" title="打开设置面板">设置</div>
        </div>
        <div class="formula" @click="pasteTextToClipboard(outputText)">{{ outputText }}</div>
      </div>
    </drag-menu>
    <!-- 设置面板 -->
    <drag-menu class="setting" top="150" left="600" v-show="settingConfig.display">
      <div class="head" id="drag">更改基本配置</div>
      <div class="body">
        <div class="speed">
          <span>单层旋转速度</span>
          <input type="text" v-model.number="configInformation.rotateTime">
        </div>
        <div class="formula">
          <span>自定义公式</span>
          <input class="text" type="text" v-model.trim="settingConfig.formula" placeholder="输入公式">
          <input class="count" type="number" v-model.number="settingConfig.count" :min="-1" max="1000" title="-1至1000">
          <button v-if="!settingConfig.isCycle" @click="implement()">执行</button>
          <button v-else @click="settingConfig.isCycle = false">停止</button>
        </div>
        <div>
          <span>隐藏内部</span>
          <el-switch v-model="settingConfig.hideInside" active-color="#13ce66"></el-switch>
        </div>
        <div>
          <span>隐藏边框</span>
          <el-switch v-model="settingConfig.hideBorder" active-color="#13ce66"></el-switch>
        </div>
        <div>
          <span>启用透明颜色</span>
          <el-switch v-model="settingConfig.enableTransparentColor" active-color="#13ce66"></el-switch>
        </div>
        <div class="spacing">
          <span>间距</span>
          <el-slider class="slider" v-model="configInformation.companyLength" :min="100" :max="300" :step="5"></el-slider>
        </div>
        <!-- <div class="bg-color">
          <span>背景颜色</span>
          <el-ColorPicker v-model="configInformation.bgcColor" @active-change="bgColorChange"></el-ColorPicker>
        </div> -->
        <el-collapse v-model="settingConfig.activeName" accordion class="collapse">
          <el-collapse-item title="颜色" name="1" class="other-color">
            <ul>
              <template v-for="(layer, key, index) in configInformation.pageColor">
                <li :key="index" v-if="key !== 'transparency'">
                  <el-ColorPicker v-model="configInformation.pageColor[key]" @active-change="colorChange($event, key)"></el-ColorPicker>
                  <span>{{ settingConfig.mapping[key] }}</span>
                </li>
              </template>
            </ul>
          </el-collapse-item>
          <el-collapse-item title="透明度" name="2" class="transparency">
            <ul>
              <li>
                <span>所有面</span>
                <el-slider v-model="configInformation.pageColor.transparency.whole" :disabled="!settingConfig.enableTransparentColor" :min="0" :max="1" :step="0.01"></el-slider>
              </li>
              <template v-for="(name, key, index) in settingConfig.mapping">
                <li :key="index" v-if="key !== 'border'">
                  <span>{{ name }}</span>
                  <el-slider v-model="configInformation.pageColor.transparency[key]" :disabled="!settingConfig.enableTransparentColor" :min="0" :max="1" :step="0.01"></el-slider>
                </li>
              </template>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </div>
    </drag-menu>
    <!-- 公式解析错误弹窗 -->
    <drag-menu class="error" top="150" left="1000" bgcColor="white" v-show="errorConfig.display">
      <div class="head" id="drag">公式解析出错</div>
      <div class="body">
        <div class="formula-str">
          <span
            v-for="(value, index) in errorConfig.errorData"
            :key="index"
            :style="{ color: value.error ? 'red' : 'black' }"
          >{{ value.str }}</span>
        </div>
        <div class="rewrite">
          <textarea cols="30" rows="5" v-model="errorConfig.formula" placeholder="请修改公式"></textarea>
          <button @click="reExecute()">{{ errorConfig.formula ? '重新执行' : '关闭' }}</button>
        </div>
      </div>
    </drag-menu>
  </div>
</template>

<script>
import { deepCopy, throttle, pasteTextToClipboard } from '../utils/util.js'
import { degToSuffixMap, layerToAxisMap, keyUpEventMap, keyDownEventMap } from '../utils/map.js'
import { operation, formula, otherFormula, formulaButton, otherFormulaButton } from '../utils/formula.js'
import { pageColor, bgcColor, rotateTime, initialAngle, companyLength, tips } from '../utils/configInformation.js'
import colorExchange from '../utils/colorExchange.js'
import DragMenu from '../components/DragMenu.vue'

export default {
  name: 'MagicSquare',
  components: { DragMenu },
  data() {
    /*
    * 魔方每个块基本位置信息
    * up down right left front back 取首字母作为当前块的位置信息   例：urf 处在顶层，右层，前层相交的角块， uf 处在顶层，前层相交的棱块 u 处在顶层的中心块
    * center为魔方内部的中心块
    * 该位置是以魔方的白色面朝下，蓝色面朝前定义 脱离此前提无实际意义
    */
    let basicPositioInfo = [
      'urf', 'uf', 'ulf', 'ul', 'ulb', 'ub', 'urb', 'ur', 'u',
      'rf', 'f', 'lf', 'l', 'lb', 'b', 'br', 'r', 'center',
      'drf', 'df', 'dlf', 'dl', 'dlb', 'db', 'drb', 'dr', 'd'
    ]
    let allColor = [] // 初始魔方的所有块每个面的颜色 复原时使用
    const data = _optimizationDataHandler(basicPositioInfo)
    const datas = deepCopy(data)
    function _optimizationDataHandler(arr) { // 基于魔方基础位置信息做进一步处理 方便后续控制dom元素
      const tmpData = []
      let color, x, y, z, layer, rgba = 'hide'
      arr.forEach((v, i) => {
        x = 1 // 记录当前块的偏移量
        y = 1
        z = 0
        color = {top: rgba, down: rgba, right: rgba, left: rgba, front: rgba, after: rgba} // 当前块每个面的颜色
        layer = {u: false, d: false, r: false, l: false, f: false, b: false} // 当前块的位置 用布尔值代替字符串方便后续操作
        let td = true, rl = true, fb = true // 用于判断当前代码块在当前循环体是否已被执行过
        for (let j = 0; j < 3; j++) { // 遍历字符串 v
          if (td) { // 当前代码块执行一次后在本循环体就不再执行
            if (v[j] === 'u') {
              y = 0
              color.top = 'u' // u
              layer.u = true
              td = false
              continue
            } else if (v[j] === 'd') {
              y = 2
              color.down = 'd' // d
              layer.d = true
              td = false
              continue
            } else {
              y = 1
            }
          }
          if (rl) {
            if (v[j] === 'r') {
              x = 2
              color.right = 'r' // r
              color.left = rgba
              layer.r = true
              rl = false
              continue
            } else if (v[j] === 'l') {
              x = 0
              color.left = 'l' // l
              layer.l = true
              rl = false
              continue
            } else {
              x = 1
            }
          }
          if (fb) {
            if (v[j] === 'f') {
              z = 1
              color.front = 'f' // f
              layer.f = true
              fb = false
              continue
            } else if (v[j] === 'b') {
              z = -1
              color.after = 'b' // b
              layer.b = true
              fb = false
              continue
            } else {
              z = 0
            }
          }
        }
        tmpData[i] = { // 单个块的配置信息
          // deviation: judge ? `${companyLength}px, ${companyLength}px, 0` : `${x}px, ${y}px, ${z}px`, // 偏移量
          deviation: [x, y, z],
          layer, // 位置信息 （布尔值）
          display: true, // 是否显示 （在魔方旋转时使用）
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
      selectedFormula: false, // 当前是否选中公式
      isImplementFormula: false, // 当前是否正在执行公式
      isAutoRecovery: false, // 是否正在自动复原
      isAutoRecoveryFormula: false, // 是否正在生成复原公式
      reversal: false, // 是否逆转公式
      formulaName: '', // 当前选中公式的名称
      record: false, // 是否开始记录
      step: [], // 当前已经执行过的步骤
      outputText: '', // 文本形式输出的公式
      revolve: '', // 旋转时给本体加的样式
      intercept: true, // 单层旋转时的节流阀 有延时
      rotateOrNot: false, // 判断是否正在旋转 无延时
      clickIsInPage: false, // 判断是否在魔方的某一个面上按下鼠标
      hideTip: true, // 隐藏提示层
      transitionTime: 0.2, // 魔方整体旋转的过渡时间
      prohibitRotate: true, // 整体旋转的节流阀
      switchFormula: true, // 公式 or 其他
      layer: '', // 当前旋转层
      deg: '', // 当前旋转度数
      resolve: null,
      tmpFormula: null,
      // 配置信息
      rubikSCubeRotateConfig: { // 魔方旋转配置信息
        x: 0, // 魔方整体旋转角度
        y: 0,
        downX: 0, // 记录鼠标按下时的坐标
        downY: 0,
        tmpX: 0, // 记录鼠标按下之前的旋转角度
        tmpY: 0,
        isThrottled: false // 魔方整体旋转节流阀
      },
      configInformation: { // 魔方基础配置
        bgcColor, // 背景颜色
        pageColor, // 页面颜色
        companyLength,
        rotateTime // 魔方单层旋转所需的时间
      },
      menuMoveConfig: { // 菜单配置信息
        display: true
      },
      settingConfig: { // 设置配置信息
        display: false,
        formula: '', // 自定义公式
        count: 1, // 自定义公式执行次数
        isCycle: false, // 是否循环执行
        hideInside: true, // 是否隐藏魔方内部的元素
        hideBorder: false, // 是否隐藏边框 
        enableTransparentColor: false, // 是否开启透明颜色
        activeName: 1, // 控制折叠面板
        dialogVisible: false, // 控制对话框
        permanentClose: localStorage.getItem('closeTip') === '1',
        mapping: Object.freeze({ u: '顶面', d: '底面', f: '正面', b: '背面', r: '右侧', l: '左侧', hide: '内部', border: '边框' }) // 魔方各层对应中文的映射
      },
      errorConfig: { // 公式转字符串错误配置信息
        errorData: [],
        formula: '',
        display: false
      }
    }
  },
  computed: {
    getWholeSize () {
      const companyLength = this.configInformation.companyLength
      const size = `width: ${300 + (companyLength - 100) * 2}px; height: ${300 + (companyLength - 100) * 2}px;`
      return size
    },
    getBoxStyle () {
      const { rubikSCubeRotateConfig, transitionTime } = this
      const transform = `transform: translate(-50%, -50%) rotateX(${initialAngle.x + rubikSCubeRotateConfig.x}deg) rotateY(${initialAngle.y + rubikSCubeRotateConfig.y}deg);`
      const transition = `transition: all ${transitionTime}s;`
      return transform + transition + this.getWholeSize
    }
  },
  watch: {
    'settingConfig.hideInside' (newValue) {
      this.settingConfig.dialogVisible = this.settingConfig.permanentClose ? false : !newValue && !this.settingConfig.hideBorder
    },
    'settingConfig.hideBorder' (newValue) {
      this.settingConfig.dialogVisible = this.settingConfig.permanentClose ? false : !newValue && !this.settingConfig.hideInside
    },
    'configInformation.rotateTime' (newValue) {
      if (typeof newValue !== 'number') {
        this.configInformation.rotateTime = 0
      }
    }
  },
  methods: {
    controlRotateHandler (layer, deg) { // 控制魔方单层旋转 核心逻辑
      const time = this.configInformation.rotateTime * (Math.abs(deg) / 90)
      const tmpFormula = [layer, deg, time] // 保存传入的初始值 为后续的记录做准备
      return new Promise(resolve => {
        if (!(this.intercept && (this.prohibitRotate || this.isImplementFormula))) return
        this.record && this._record(tmpFormula) // 记录
        const axis = layerToAxisMap[layer][0] // 根据目标层调整旋转的轴以及方向
        deg *= layerToAxisMap[layer][1]
        this.intercept = false // 开启节流阀
        if (time === 0) { // 为了节省性能 当旋转时间为0时直接切换色块颜色
          colorExchange(this.data, layer, deg) // 根据点击的面以及方式对两个魔方体的颜色进行变换
          this.isAutoRecoveryFormula || colorExchange(this.datas, layer, deg) // 生成公式时不对复制体进行颜色变换
          this.intercept = true // 关闭节流阀
          resolve(tmpFormula)
          return
        }
        this.rotateOrNot = true
        this._displaySwitch(false, layer) // 隐藏复制体被点击的层 隐藏本体未被点击的层
        this.revolve = `transition: all ${time / 1000}s; transform: rotate${axis}(${deg}deg);` // 通过过渡和3d转换来做出旋转的动画效果
        this.layer = layer
        this.deg = deg
        this.resolve = resolve
        this.tmpFormula = tmpFormula
      })
    },
    transitionEndHandler (e) { // 监听旋转过渡样式结束
      if (e.propertyName !== 'transform') return
      if (e.target.id !== 'cube') return
      colorExchange(this.data, this.layer, this.deg) // 根据点击的面以及方式对两个魔方的颜色进行变换
      colorExchange(this.datas, this.layer, this.deg)
      this.revolve = '' // 清除过渡和3d旋转的样式 这样就可以在肉眼看不出来的情况下把本体复原到原本的旋转角度
      this._displaySwitch(true, this.layer) // 恢复旋转之前被隐藏的层
      this.rotateOrNot = false
      setTimeout(() => { // 等待dom树更新完毕再关闭节流阀，防止上一次的过渡效果还未移除就再次触发旋转
        this.intercept = true // 关闭节流阀
        this.resolve(this.tmpFormula)
      }, 0)
    },
    clickHandler (id, leftOrRight) { // 鼠标点击魔方的面
      if (this.isImplementFormula) return
      if (!this.prohibitRotate && !this.isAutoRecovery) return // 魔方整体旋转时禁止单层旋转
      if (this.selectedFormula) {
        this.implementFormulaHanlder(this.formula[this.formulaName][id], !leftOrRight)
      } else {
        this.controlRotateHandler(id, leftOrRight ? -90 : 90)
      }
    },
    choiceFormulaHanlder (formulaName, data) { // 选中某一个公式
      this.selectedFormula = true
      this.formulaName = formulaName
      this.formulaButton.forEach(v => v.active = false)
      data.active = true
    },
    cancelHanlder () { // 取消选中公式
      this.selectedFormula = false
      this.formulaButton.forEach(v => v.active = false)
    },
    implementFormulaHanlder (formula, isNeedReversal = this.reversal) { // 通过选择的公式和点击的层选择公式并交给递归函数执行
      if (isNeedReversal) {
        formula = this._reversal(deepCopy(formula))
      }
      this._recursion(formula)
    },
    disruptionHanlder () { // 打乱
      if (!this.intercept) return // 单层旋转时退出逻辑
      const keys = ['r', 'l', 'f', 'b', 'u', 'd']
      const disruptionFormula = [] // 公式
      const disruptionFormulaKeys = [] // 公式对应字符
      let preKey = '', key = ''
      for (let i = 0; i < 20; i++) {
        do { key = keys[Math.floor(Math.random() * 6)] } while (key === preKey) // 防止两次生成同一个步骤
        preKey = key
        disruptionFormulaKeys.push(key)
        disruptionFormula.push(this.operation[key])
      }
      this._recursion(disruptionFormula).then(() => { // 执行打乱公式
        if (!this.record) this.outputText = disruptionFormulaKeys.join('')
      })
    },
    startRecordHandler () { // 开始记录
      this.outputText = ''
      this.record = true
    },
    closeRecordHandler () { // 结束记录
      this.step = []
      const formula = this._strToFormula(this.outputText) // 将记录的字符串转换为公式
      const simplifyFormula = this._simplifyStepsHanlder(formula) // 简化公式
      const simplifyStr = this._formulaToStr(simplifyFormula) // 公式转字符串
      this.pasteTextToClipboard(simplifyStr) // 将公式粘贴到剪贴板
      console.log('原始公式：' + this.outputText) // 控制台输出原始公式
      console.log('简化公式：' + simplifyStr) // 控制台输出简化公式
      console.log('公式数组：' + this._formulaToStr(simplifyFormula, true)) // 公式转为适用于程序识别的字符串
      this.record = false
    },
    rollBackHandler () { // 撤销
      if (!this.intercept) return
      if (!this.step.length) return
      this.record = false // 撤销时关闭记录功能
      this.outputText = this.outputText.replace(/([a-z]|[a-z]('|2))$/, '')
      this.controlRotateHandler(...this._reversal([this.step.pop()])[0])
        .then(() => this.record = true) // 撤销完成时再次打开记录
    },
    _record (formula) { // 记录
      this.step.push([...formula])
      this.outputText += this._formulaToStr([formula])
    },
    _reversal (formulaArr) { // 逆转传入的步骤
      const dstArr = []
      for (let i = formulaArr.length - 1; i >= 0; i--) {
        const item = [...formulaArr[i]]
        item[1] !== 180 && item[1] !== -180 && (item[1] = -item[1])
        dstArr.push(item)
      }
      return dstArr
    },
    _recursion (formula) { // 递归执行传入的公式
      const that = this
      return new Promise(res => {
        let count = 0
        that.isImplementFormula = true // 打开执行公式的节流阀
        const fn = () => { // 递归函数
          if (count >= formula.length) {
            that.isImplementFormula = false
            return res()
          }
          that.controlRotateHandler(...formula[count++]).then(fn)
        }
        fn()
      })
    },
    _displaySwitch (boolean, layer) { // 旋转时控制魔方显示部分
      this.data.forEach((v, i) => v.layer[layer] ? this.datas[i].display = boolean : v.display = boolean)
    },
    _restore () { // 通过重置各个色块颜色复原
      for (let i = 0, n = this.data.length; i < n; i++) {
        const itemAngle = this.data[i].angle
        for (let j = 0, n = itemAngle.length; j < n; j++) {
          const color = this.allColor[i][j]
          itemAngle[j].color = color
          this.datas[i].angle[j].color = color
        }
      }
    },
    _autoRecovery (data = this.data) { // 以层先法逻辑自动生成公式并复原
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
        if (!positionError([19, 21, 23, 25])) {
          if (data[19].angle[2].color !== 'd') formula.push(...allFormula.a['f'])
          if (data[21].angle[2].color !== 'd') formula.push(...allFormula.a['l'])
          if (data[23].angle[2].color !== 'd') formula.push(...allFormula.a['b'])
          if (data[25].angle[2].color !== 'd') formula.push(...allFormula.a['r'])
          that._recursion(formula).then(() => res())
          return
        }
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
            case 'f':
              return res()
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
            that.closeRecordHandler()
            that.$message.success('完成')
            res()
            return
          }
          // const step = [ '底层十字架复原', '底层十字架复原', '底层角块', '底层角块', '中间层棱块', '中间层棱块', '顶层十字架', '顶面复原', '顶层角块', '顶层棱块' ]
          const task = tasks.shift()
          simulateAsyncTask(task).then(() => {
            runTasksSequentially(tasks)
          })
        }
        runTasksSequentially(tasks)
      })
    },
    _autoRecoveryFormula () { // 仅生成复原公式 不复原
      const that = this
      that.isAutoRecoveryFormula = true // 节流阀
      const tmpTime = that.configInformation.rotateTime // 保存正常状态下的单层旋转时间
      that.configInformation.rotateTime = 0 // 将单层旋转时间更改为零 降低生成公式耗时
      that._autoRecovery().then(() => { // 调用自动复原的函数来生成复原公式
        that.configInformation.rotateTime = tmpTime // 恢复初始时间
        that.data = deepCopy(that.datas) // 将已复原的数据还原成初始的状态
        that.isAutoRecoveryFormula = false
      })
    },
    _keyUpEvent (e) { // 键盘弹起事件
      const action = keyUpEventMap[e.key]
      if (!action) return
      if (e.ctrlKey && action.ctrl) return action.ctrl(this)
      if (e.shiftKey && action.shift) return action.shift(this)
      if (action.normal) return action.normal(this)
    },
    _keyDownEvent (e) { // 键盘按下事件
      const action = keyDownEventMap[e.key]
      action && action(this)
    },
    _recovery (axis, callback, value = 0) { // 魔方回正
      this.transitionTime = 0
      this.rubikSCubeRotateConfig[axis] = value
      setTimeout(() => {
        this.transitionTime = 0.2
        callback && callback()
      }, 0)
    },
    mouseDownHandler (e) { // 鼠标在某个面上按下时触发
      const config = this.rubikSCubeRotateConfig // 魔方拖动旋转所需的配置
      this.clickIsInPage = true
      config.downX = e.pageX // 记录鼠标按下时的坐标
      config.downY = e.pageY
      config.tmpX = config.x // 记录当前旋转的角度
      config.tmpY = config.y
      addEventListener('mousemove', this._mouseMove) // 监听鼠标移动事件
    },
    _mouseMove (e) { // 鼠标移动时的回调
      const config = this.rubikSCubeRotateConfig // 魔方拖动旋转所需的配置
      this.prohibitRotate = false // 节流阀 控制魔方整体旋转时阻止单层旋转和执行公式
      let diffX = Math.floor((e.pageX - config.downX) / 2) // 记录鼠标移动后与按下时的坐标差值
      let diffY = Math.floor(-(e.pageY - config.downY) / 2)
      let tmpAndX = diffY + config.tmpX // 原始x轴旋转角度
      if (!(diffY < 2 && diffY > -2)) { // 如果旋转角度过小则不旋转
        config.x = tmpAndX < -45 ? -45 : tmpAndX > 45 ? 45 : tmpAndX // 限制x轴旋转的角度范围 -45到45之间
      }
      if (!(diffX < 2 && diffX > -2)) {
        config.y = diffX + config.tmpY
      }
    },
    _strToFormula (originStr) { // 字符串转公式
      let str = originStr.replace(/'/g, '1')
      const formula = []
      const errorStrIndex = new Map()
      for (let l = 0, r = 1, len = str.length; r <= len; r++) {
        if (!(/[a-z]/.test(str[r]) || r === len)) continue
        const formulaItem = operation[str.slice(l, r)]
        if (formulaItem) formula.push(formulaItem)
        else while (l < r) errorStrIndex.set(l++, true)
        l = r
      }
      if (errorStrIndex.size) {
        this._strToFormulaErrorHandler(originStr, errorStrIndex)
        return []
      }
      return formula
    },
    _formulaToStr (formula, isSplicingArrForm = false) { // 公式转字符串
      const strArr = formula.map(([layer, deg]) => layer + degToSuffixMap[deg])
      return isSplicingArrForm ? '[' + strArr.join(', ') + ']' : strArr.join('').replace(/1/g, '\'')
    },
    _strToFormulaErrorHandler (str, errorStrIndex) { // 转换错误处理程序
      const errorData = []
      for (let i = 0; i < str.length; i++) {
        const item = { str: str[i], error: false }
        if (errorStrIndex.has(i)) item.error = true
        errorData.push(item)
      }
      const config = this.errorConfig
      config.errorData = errorData
      config.formula = ''
      config.display = true
    },
    reExecute () { // 重新执行公式
      const config = this.errorConfig
      config.display = false
      if (config.formula) {
        this.settingConfig.formula = config.formula
        this._recursion(this._strToFormula(config.formula))
      }
    },
    _simplifyStepsHanlder(originaFlormula) { // 简化公式
      const simplifyFormula = []
      for(let i = 0, n = originaFlormula.length; i < n; i++) {
        const preStep = simplifyFormula[simplifyFormula.length - 1]
        const curStep = originaFlormula[i]
        if (!preStep || curStep[0] !== preStep[0]) { // 没有前一步或前后步骤层级不一致则不做处理
          simplifyFormula.push(curStep)
          continue
        }
        simplifyFormula.pop() // 删除上一步
        const sum = curStep[1] + preStep[1] // 两步旋转角度叠加
        if (sum === 0) continue
        const map = { '270': -90, '-270': 90, '-180': 180 }
        simplifyFormula.push([curStep[0], map[sum] || sum])
      }
      return simplifyFormula
    },
    colorChange (color, layer) { // 魔方面颜色更改
      this.configInformation.pageColor[layer] = color
    },
    bgColorChange (newColor) { // 背景颜色更改
      this.configInformation.bgcColor = newColor
    },
    implement () { // 执行输入的公式
      const count = this.settingConfig.count
      const formula = this._strToFormula(this.settingConfig.formula)
      if (formula.length === 0) return
      if (count > 1000) {
        this.settingConfig.count = 1000
        this.$message.warning('执行次数不能超过1000')
        return
      }
      if (count === -1) { // 逆向执行
        this._recursion(this._reversal(formula))
        return
      }
      if (count === 0) { // 无限循环执行
        const fn = () => {
          if (!this.settingConfig.isCycle) return this.$message.success('停止循环，执行次数为' + this.settingConfig.count)
          this.settingConfig.count++
          this._recursion(formula).then(() => this.configInformation.rotateTime ? fn() : setTimeout(fn, 50))
        }
        this.$message.success('开始循环执行')
        this.settingConfig.isCycle = true
        fn()
      } else { // 根据输入次数循环执行
        const fn = () => {
          if (this.settingConfig.count <= 0) return
          this.settingConfig.count--
          this._recursion(formula).then(() => this.configInformation.rotateTime ? fn() : setTimeout(fn, 50))
        }
        fn()
      }
    },
    pieceStyle (deviation) { // 每个块的样式
      const companyLength = this.configInformation.companyLength
      const str = deviation[0] * companyLength + 'px,' + deviation[1] * companyLength + 'px,' + deviation[2] * companyLength + 'px'
      return `transform: translate3d(${str}); transition: 0.2s;`
    },
    style (data, angle) { // 每个面的样式
      const transform = `transform: ${angle.deg} translateZ(50px);`
      const pageColor = this.configInformation.pageColor
      const backgroundColor = `background: ${data.display ? pageColor[angle.color] : 'transparent'};`
      const key = this.rotateOrNot ? 'Overlap' : ''
      const opacity = this.settingConfig.enableTransparentColor ? `opacity: ${pageColor.transparency ? pageColor.transparency[angle.color + key] : '1'};` : ''
      const border = this.settingConfig.hideBorder ? '' : `border: 1px solid ${data.display ? pageColor.border : 'transparent'};`
      return transform + backgroundColor + opacity + border
    },
    handleClose () { // 关闭提示
      this.settingConfig.dialogVisible = false
    },
    permanentCloseTip () { // 永久关闭提示
      localStorage.setItem('closeTip', 1)
      this.settingConfig.dialogVisible = false
      this.settingConfig.permanentClose = true
    },
    pasteTextToClipboard // 将传入的文本复制到剪贴板
  },
  created () {
    this._mouseMove = throttle(this._mouseMove, 50)
  },
  mounted () {
    addEventListener('keyup', e => this._keyUpEvent(e))
    addEventListener('keydown', e => this._keyDownEvent(e))
    addEventListener('mouseup', () => { // 鼠标弹起时触发
      if (!this.clickIsInPage) return
      removeEventListener('mousemove', this._mouseMove) // 注销鼠标移动的监听事件 节约性能以及防止不可预料的bug
      let yValue = this.rubikSCubeRotateConfig.y
      this._recovery('y', () => {
        this.prohibitRotate = true
        this.clickIsInPage = false
      }, yValue >= 360 ? yValue % 360 : yValue <= -360 ? yValue % -360 : yValue) // 旋转角度超过360后自动回正 避免出现不可预期的bug
    })
    const config = this.settingConfig
    if (!config.hideInside && !config.hideBorder) config.dialogVisible = !config.permanentClose
  }
}
</script>

<style scoped lang="scss">
.container {
  position: relative;
}
.bg {
  position: fixed;
  width: 100%;
  height: 100%;
  background: #134E5E;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #71B280, #134E5E);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #71B280, #134E5E); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
.box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
}
.tips {
  position: absolute;
  top: -0;
  left: 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100px;
    height: 100px;
    opacity: 0;
    transition: all .4s;
  }
  &:hover img {
    opacity: .3;
  }
}
/* 魔方主体 */
.subject-one,
.subject-two {
  position: absolute;
  transform-style: preserve-3d;
  .diamond {
    transform-style: preserve-3d;
    position: absolute;
    width: 100px;
    height: 100px;
    &>div {
      position: absolute;
      width: 100px;
      height: 100px;
      box-sizing: border-box;
    }
  }
}
/* 菜单 */
.menu {
  width: 400px;
  position: absolute;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, .2);
  .head {
    border-bottom: 1px solid white;
    &>ul {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      &>li {
        height: 40px;
        padding: 0 10px;
        font-size: 14px;
        text-align: center;
        line-height: 40px;
        transition: all .2s;
        &:not(.move-control:hover):hover {
          background-color: rgba(255, 255, 255, .3);
        }
      }
    }
  }
  .body {
    padding: 10px;
    &>ul {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      justify-content: space-around;
      &>li {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        width: 80px;
        height: 80px;
        margin: 10px 0 0 0;
        font-size: 12px;
        transition: all .2s;
        &:hover {
          background-color: rgba(255, 255, 255, .5);
        }
        &>img {
          display: block;
          width: 70%;
          height: 70%;
          margin: auto;
        }
      }
      .cancel {
        font-size: 20px;
        justify-content: space-evenly;
      }
    }
  }
  .footer {
    padding: 10px;
    border-top: 1px solid white;
    .control {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      justify-content: space-around;
      &>div {
        width: 60px;
        height: 30px;
        margin-top: 10px;
        text-align: center;
        font-size: 14px;
        line-height: 30px;
        transition: all .2s;
        background: #40b6b7;
        &:hover {
          background-color: rgba(255, 255, 255, .5);
        }
      }
    }
    .formula {
      word-wrap: break-word;
      &:hover {
        background-color: rgba(0, 0, 0, .1);
      }
    }
  }
}
/* 设置 */
.setting {
  .head {
    height: 40px;
    line-height: 40px;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
  }
  .body {
    display: flex;
    flex-flow: column nowrap;
    gap: 5px;
    &>div {
      &:not(.collapse) {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 10px;
      }
      &>span {
        display: block;
        width: 100px;
        text-align: right;
        font-size: 16px;
      }
      &.formula {
        .text {
          width: 110px;
        }
        .count {
          width: 41px;
        }
      }
      &.spacing {
        .slider {
          margin-left: 10px;
          width: 200px;
        }
      }
    }

    .other-color ul {
      display: flex;
      flex-flow: row wrap;
      justify-content: center;
      align-items: center;
      gap: 20px;
      &>li {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
      }
    }
    .transparency ul {
      display: flex;
      flex-flow: column nowrap;
      &>li {
        display: flex;
        flex-flow: row nowrap;
        gap: 12px;
        line-height: 38px;
        &>span {
          width: 48px;
        }
        &>div {
          width: 250px;
        }
      }
    }
  }
}
.error {
  .head {
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
  .body {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    gap: 10px;
    align-items: flex-start;
    .formula-str {
      width: 100%;
      word-wrap: break-word;
    }
    .rewrite {
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
  }
}
.collapse {
  border: none;
}
:deep(.el-collapse-item__header),
:deep(.el-collapse-item__wrap) {
  background-color: transparent;
  color: black;
  font-size: 16px;
}
</style>
