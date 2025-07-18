<template>
  <div class="container">
    <div class="bg"></div>
    <!-- :style="`background: ${configInformation.tmpBgcColor};`" -->
    <!-- 魔方 -->
    <div class="box" :style="getBoxStyle" @mousedown="mouseDownHandler">
      <!-- 悬浮在魔方每个面上的遮罩层 鼠标点击时传递相应的参数以控制魔方旋转 -->
      <div class="tips-box" :style="getWholeSize">
        <div class="tips" v-show="hideTip" v-for="data in tips" :key="data.id" @click="clickHandler(data.id, true)"
          @contextmenu.prevent="clickHandler(data.id, false)"
          :style="`transform: ${data.deg} translateZ(${151 + configInformation.companyLength - 100}px);`">
          <img src="../assets/fangxiang.png" alt="">
        </div>
      </div>
      <!-- 魔方本体(旋转) -->
      <div id="cube" class="subject-one" :style="revolve" @transitionend="transitionEndHandler">
        <div class="diamond" v-for="(data, i) in data" :key="data.id"
          :style="pieceStyle(data.deviation, dynamicData[i].display)">
          <template v-for="(color, j) in dynamicData[i].color">
            <div v-if="!(settingConfig.hideInside && color === 'hide')" :key="j" :style="style(color, j)"></div>
          </template>
        </div>
      </div>
      <!-- 魔方复制体(静止) -->
      <div class="subject-two">
        <div class="diamond" v-for="(data, i) in data" :key="data.id"
          :style="pieceStyle(data.deviation, dynamicDatas[i].display)">
          <template v-for="(color, j) in dynamicDatas[i].color">
            <div v-if="!(settingConfig.hideInside && color === 'hide')" :key="j" :style="style(color, j)"></div>
          </template>
        </div>
      </div>
    </div>
    <!-- 性能提示弹窗 -->
    <el-dialog title="提示" :visible.sync="settingConfig.dialogVisible" width="30%" :before-close="handleClose">
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
          <li @click="switchFormula = false; cancelHanlder()"
            :style="switchFormula || 'background: rgba(255, 255, 255, .5)'">其他公式</li>
          <li class="move-control" style="flex: auto;" id="drag"></li>
        </ul>
      </div>
      <div class="body">
        <ul v-if="switchFormula">
          <li v-for="item in formulaButton" :key="item.key" @click="choiceFormulaHanlder(item.key, item)"
            :style="`background: ${item.active ? 'white' : ''};`">
            <img :src="require('../assets/formulaImg/' + item.key + '.png')" alt="寄">
            <span>{{ item.name }}</span>
          </li>
          <li class="cancel" @click="cancelHanlder">
            <span>取 消</span><span>选 中</span>
          </li>
        </ul>
        <ul v-else>
          <li v-for="item in otherFormulaButton" :key="item.key"
            @click="implementFormulaHanlder(otherFormula[item.key], false)"
            @contextmenu.prevent="implementFormulaHanlder(otherFormula[item.key], true)">
            <img :src="require('../assets/otherFormulaImg/' + item.key + '.png')" alt="寄">
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <div class="footer">
        <div class="control">
          <div @click="disruptionHanlder" title="随机生成打乱公式并执行">打乱</div>
          <div @click="_restore" title="强制复原，无公式">复原</div>
          <div @click="autoRecoveryItLayer" title="以层先法复原魔方">层先</div>
          <div @click="autoRecoveryItTwoStep" title="以两阶段还原法复原魔方">二步</div>
          <div @click="startRecordHandler" title="开始记录步骤">开始</div>
          <div @click="closeRecordHandler" title="结束记录并在控制台输出步骤">结束</div>
          <div @click="rollBackHandler" title="撤回上一步，只能在开始记录后撤回">撤销</div>
          <div @click="_keyUpEvent({ key: ' ' })" title="复原魔方整体旋转角度">复位</div>
          <div @click="hideTip = false" title="隐藏魔方表面的遮罩层">隐藏</div>
          <div @click="hideTip = true" title="显示魔方表面的遮罩层">显示</div>
          <div @click="menuMoveConfig.display = false" title="关闭此菜单，使用'ctrl+空格键'再次打开">关闭</div>
          <div @click="settingConfig.display = !settingConfig.display" title="打开设置面板">设置</div>
          <!-- <div @click="strToArrHanlder" title="通过字符串设置魔方状态">逆向</div>
          <div @click="test" title="打开设置面板">测试</div> -->
        </div>
        <div class="formula" @click="pasteTextToClipboard(outputText)">{{ outputText }}</div>
      </div>
    </drag-menu>
    <!-- 设置面板 -->
    <drag-menu class="setting" top="150" left="600" v-show="settingConfig.display">
      <div class="head" id="drag">更改基本配置</div>
      <div class="body">
        <div class="speed">
          <span>单层旋转耗时</span>
          <input type="number" disabled v-model.number="configInformation.rotateTime">
          <el-slider class="slider" v-model="configInformation.grade" :min="0" :max="10" :step=".5"></el-slider>
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
          <el-slider class="slider" v-model="configInformation.companyLength" :min="100" :max="300"
            :step="5"></el-slider>
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
                  <el-ColorPicker v-model="configInformation.pageColor[key]"
                    @active-change="colorChange($event, key)"></el-ColorPicker>
                  <span>{{ settingConfig.mapping[key] }}</span>
                </li>
              </template>
            </ul>
          </el-collapse-item>
          <el-collapse-item title="透明度" name="2" class="transparency">
            <ul>
              <li>
                <span>所有面</span>
                <el-slider v-model="configInformation.pageColor.transparency.whole"
                  :disabled="!settingConfig.enableTransparentColor" :min="0" :max="1" :step="0.01"></el-slider>
              </li>
              <template v-for="(name, key, index) in settingConfig.mapping">
                <li :key="index" v-if="key !== 'border'">
                  <span>{{ name }}</span>
                  <el-slider v-model="configInformation.pageColor.transparency[key]"
                    :disabled="!settingConfig.enableTransparentColor" :min="0" :max="1" :step="0.01"></el-slider>
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
          <span v-for="(value, index) in errorConfig.errorData" :key="index"
            :style="{ color: value.error ? 'red' : 'black' }">{{ value.str }}</span>
        </div>
        <div class="rewrite">
          <textarea class="text" cols="30" rows="5" v-model="errorConfig.formula" placeholder="请修改公式"></textarea>
          <button @click="reExecute()">{{ errorConfig.formula ? '重新执行' : '关闭' }}</button>
        </div>
      </div>
    </drag-menu>
  </div>
</template>

<script>
import { deepCopy, throttle, pasteTextToClipboard, extractAsStr, strToArr } from '../utils/util.js'
import { degToSuffixMap, layerToAxisMap, keyUpEventMap, keyDownEventMap, angleMap, colorIndexToLayerMap, autoRecoveryMap } from '../utils/map.js'
import { operation, formula, otherFormula, formulaButton, otherFormulaButton, autoRecoveryFormula } from '../utils/formula.js'
import { pageColor, bgcColor, rotateTime, initialAngle, companyLength, tips } from '../utils/configInformation.js'
import colorExchange from '../utils/colorExchange.js'
import DragMenu from '../components/DragMenu.vue'
import ajax from '../utils/ajax.js'

const backupData = [] // 初始魔方所有块每个面的动态数据 复原时使用
const cloneData = [] // 魔方所有块每个面的动态数据 层先法复原时使用
const step = [] // 当前已经执行过的步骤

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
    const basicPositioInfo = [
      'urf', 'uf', 'ulf', 'ul', 'ulb', 'ub', 'urb', 'ur', 'u',
      'rf', 'f', 'lf', 'l', 'lb', 'b', 'br', 'r', 'center',
      'drf', 'df', 'dlf', 'dl', 'dlb', 'db', 'drb', 'dr', 'd'
    ]
    const map = {
      u: { cI: 0, axis: 1, num: -1 },
      r: { cI: 1, axis: 0, num: 1 },
      d: { cI: 2, axis: 1, num: 1 },
      l: { cI: 3, axis: 0, num: -1 },
      f: { cI: 4, axis: 2, num: 1 },
      b: { cI: 5, axis: 2, num: -1 },
    }
    const data = _optimizationDataHandler()
    const dynamicDatas = deepCopy(data[1])
    function _optimizationDataHandler() { // 基于魔方基础位置信息做进一步处理 方便后续控制dom元素
      const staticData = []
      const dynamicData = []
      basicPositioInfo.forEach((positioStr, index) => {
        const deviation = [0, 0, 0]
        const color = { 0: 'hide', 1: 'hide', 2: 'hide', 3: 'hide', 4: 'hide', 5: 'hide' } // 伪数组 防止vue数据劫持失效
        const layer = { u: false, d: false, r: false, l: false, f: false, b: false } // 当前块的位置 用布尔值代替字符串方便后续操作
        const colorIndex = [] // 非 hide 颜色的面的索引
        for (let i = 0; i < 3; i++) { // 遍历字符串 v
          const str = positioStr[i]
          if (!map[str]) continue // 排除 center 块
          const { axis, num, cI } = map[str]
          deviation[axis] = num
          color[cI] = str
          layer[str] = true
          colorIndex.push(cI)
        }
        staticData[index] = { // 单个块的配置信息
          deviation, // 当前块距中心偏移量
          layer, // 位置信息 （布尔值）
          id: index, // 当前块在整个魔方体数组的下标
          original: positioStr, // 原始位置信息 （自动还原时使用）
          colorIndex, // 非 hide 颜色的面的索引
        }
        dynamicData[index] = {
          display: true, // 是否显示 （在魔方旋转时使用）
          color // 魔方各个面的颜色 数组形式 顺序为 上、右、下、左、前、后
        }
        backupData[index] = deepCopy(dynamicData[index])
        cloneData[index] = deepCopy(dynamicData[index])
      })
      return [staticData, dynamicData]
    }
    return {
      data: Object.freeze(data[0]), // 只读的静态数据 两个魔方共用同一个
      dynamicData: data[1], // 动态数据
      dynamicDatas,
      tips: Object.freeze(tips),
      operation: Object.freeze(operation), // 魔方所有操作方法
      formula: Object.freeze(formula), // 魔方公式
      formulaButton, // 魔方公式所对应的按钮
      otherFormula: Object.freeze(otherFormula), // 其他魔方公式
      otherFormulaButton, // 其他魔法公式配置按钮
      selectedFormula: false, // 当前是否选中公式
      isImplementFormula: false, // 当前是否正在执行公式
      isAutoRecovery: false, // 是否正在自动复原
      isAutoRecoveryFormula: false, // 是否正在生成复原公式
      formulaName: '', // 当前选中公式的名称
      record: false, // 是否开始记录
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
        rotateTime, // 魔方单层旋转所需的时间
        grade: 5, // 魔方旋转速度的等级 0-10 0为无需时间
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
    getWholeSize() {
      const companyLength = this.configInformation.companyLength
      const size = `width: ${300 + (companyLength - 100) * 2}px; height: ${300 + (companyLength - 100) * 2}px;`
      return size
    },
    getBoxStyle() {
      const { rubikSCubeRotateConfig, transitionTime } = this
      const transform = `transform: translate(-50%, -50%) rotateX(${initialAngle.x + rubikSCubeRotateConfig.x}deg) rotateY(${initialAngle.y + rubikSCubeRotateConfig.y}deg);`
      const transition = `transition: all ${transitionTime}s;`
      return transform + transition
    }
  },
  watch: {
    'settingConfig.hideInside'(newValue) {
      this.settingConfig.dialogVisible = this.settingConfig.permanentClose ? false : !newValue && !this.settingConfig.hideBorder
    },
    'settingConfig.hideBorder'(newValue) {
      this.settingConfig.dialogVisible = this.settingConfig.permanentClose ? false : !newValue && !this.settingConfig.hideInside
    },
    'configInformation.grade'(newValue) {
      if (newValue === 0) {
        this.configInformation.rotateTime = 0
        return
      }
      this.configInformation.rotateTime = Math.round(rotateTime * Math.pow(2, newValue - 5))
    }
  },
  methods: {
    controlRotateHandler(layer, deg) { // 控制魔方单层旋转 核心逻辑
      const time = this.configInformation.rotateTime * (Math.abs(deg) / 90)
      const tmpFormula = [layer, deg, time] // 保存传入的初始值 为后续的记录做准备
      return new Promise(resolve => {
        if (!(this.intercept && (this.prohibitRotate || this.isImplementFormula))) return
        this.record && this._record(...tmpFormula) // 记录
        const axis = layerToAxisMap[layer][0] // 根据目标层调整旋转的轴以及方向
        deg *= layerToAxisMap[layer][1]
        this.intercept = false // 开启节流阀
        if (time === 0) { // 为了节省性能 当旋转时间为0时直接切换色块颜色
          colorExchange(this.dynamicData, layer, deg) // 根据点击的面以及方式对两个魔方体的颜色进行变换
          this.isAutoRecoveryFormula || colorExchange(this.dynamicDatas, layer, deg) // 生成公式时不对复制体进行颜色变换
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
    transitionEndHandler(e) { // 监听旋转过渡样式结束
      if (e.propertyName !== 'transform') return
      if (e.target.id !== 'cube') return
      colorExchange(this.dynamicData, this.layer, this.deg) // 根据点击的面以及方式对两个魔方的颜色进行变换
      colorExchange(this.dynamicDatas, this.layer, this.deg)
      this.revolve = '' // 清除过渡和3d旋转的样式 这样就可以在肉眼看不出来的情况下把本体复原到原本的旋转角度
      this._displaySwitch(true, this.layer) // 恢复旋转之前被隐藏的层
      this.rotateOrNot = false
      setTimeout(() => { // 等待dom树更新完毕再关闭节流阀，防止上一次的过渡效果还未移除就再次触发旋转
        this.intercept = true // 关闭节流阀
        this.resolve(this.tmpFormula)
      }, 0)
    },
    clickHandler(id, leftOrRight) { // 鼠标点击魔方的面
      if (this.isImplementFormula) return
      if (!this.prohibitRotate && !this.isAutoRecovery) return // 魔方整体旋转时禁止单层旋转
      if (this.selectedFormula) {
        this.implementFormulaHanlder(this.formula[this.formulaName][id], !leftOrRight)
      } else {
        this.controlRotateHandler(id, leftOrRight ? -90 : 90)
      }
    },
    choiceFormulaHanlder(formulaName, data) { // 选中某一个公式
      this.selectedFormula = true
      this.formulaName = formulaName
      this.formulaButton.forEach(v => v.active = false)
      data.active = true
    },
    cancelHanlder() { // 取消选中公式
      this.selectedFormula = false
      this.formulaButton.forEach(v => v.active = false)
    },
    implementFormulaHanlder(formula, isNeedReversal = false) { // 通过选择的公式和点击的层选择公式并交给递归函数执行
      if (isNeedReversal) {
        formula = this._reversal(deepCopy(formula))
      }
      this._recursion(formula)
    },
    disruptionHanlder() { // 打乱
      if (!this.intercept) return // 单层旋转时退出逻辑
      const faces = ['r', 'l', 'f', 'b', 'u', 'd']
      const suffixs = ['', '\'', '2']
      const disruptionFormula = [] // 公式
      const disruptionFormulaKeys = [] // 公式对应字符
      let lastFace = '', face = ''
      for (let i = 0; i < 20; i++) {
        do { face = faces[Math.floor(Math.random() * 6)] } while (face === lastFace) // 防止两次生成同一个步骤
        lastFace = face
        const suffix = Math.floor(Math.random() * 3)
        disruptionFormulaKeys.push(face + suffixs[suffix])
        const key = suffix ? face + suffix : face
        disruptionFormula.push(this.operation[key])
      }
      this._recursion(disruptionFormula).then(() => { // 执行打乱公式
        if (!this.record) this.outputText = disruptionFormulaKeys.join('')
      })
    },
    startRecordHandler() { // 开始记录
      this.outputText = ''
      this.record = true
    },
    closeRecordHandler() { // 结束记录
      step.length = 0
      const formula = this._strToFormula(this.outputText) // 将记录的字符串转换为公式
      const simplifyFormula = this._simplifyStepsHanlder(formula) // 简化公式
      const simplifyStr = this._formulaToStr(simplifyFormula) // 公式转字符串
      this.pasteTextToClipboard(simplifyStr) // 将公式粘贴到剪贴板
      console.log('原始公式：' + this.outputText) // 控制台输出原始公式
      console.log('简化公式：' + simplifyStr) // 控制台输出简化公式
      console.log('公式数组：' + this._formulaToStr(simplifyFormula, true)) // 公式转为适用于程序识别的字符串
      this.record = false
    },
    rollBackHandler() { // 撤销
      if (!this.intercept) return
      if (!step.length) return
      this.record = false // 撤销时关闭记录功能
      this.outputText = this.outputText.replace(/([a-z]|[a-z]('|2))$/, '')
      this.controlRotateHandler(...this._reversal([step.pop()])[0])
        .then(() => this.record = true) // 撤销完成时再次打开记录
    },
    _record(layer, deg, time) { // 记录
      step.push([layer, deg, time])
      this.outputText += this._formulaToStr([[layer, deg, time]])
    },
    _reversal(formulaArr) { // 逆转传入的步骤
      const dstArr = []
      for (let i = formulaArr.length - 1; i >= 0; i--) {
        const item = [...formulaArr[i]]
        if (Math.abs(item[1]) !== 180) item[1] = -item[1] // 180度旋转的步骤无需逆转
        dstArr.push(item)
      }
      return dstArr
    },
    _recursion(formula) { // 递归执行传入的公式
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
    _displaySwitch(boolean, layer) { // 旋转时控制魔方显示部分
      this.data.forEach((v, i) => v.layer[layer] ? this.dynamicDatas[i].display = boolean : this.dynamicData[i].display = boolean)
    },
    _restore(e, template = backupData) { // 通过重置各个色块颜色复原
      for (let i = 0; i < 27; i++) {
        for (let j = 0; j < 6; j++) {
          const color = template[i].color[j]
          this.dynamicData[i].color[j] = color
          this.dynamicDatas[i].color[j] = color
        }
      }
    },
    _restore2(template = this.dynamicData, target = cloneData) { // 同步数据
      for (let i = 0; i < 27; i++) {
        for (let j = 0; j < 6; j++) {
          target[i].color[j] = template[i].color[j]
        }
      }
    },
    _controlRotateHandler2(layer, deg) { // 层先法复原魔方时使用此函数 节约性能
      const time = this.configInformation.rotateTime * (Math.abs(deg) / 90)
      this._record(layer, deg, time)
      deg *= layerToAxisMap[layer][1]
      colorExchange(cloneData, layer, deg)
    },
    _recursion2(formula) { // 层先法复原魔方时使用此函数 节约性能
      for (let i = 0; i < formula.length; i++) {
        this._controlRotateHandler2(...formula[i])
      }
      return Promise.resolve()
    },
    test() {
      this._restore2()
      const formula = otherFormula.flower
      this._recursion2(formula)
      this._restore(null, cloneData)
    },
    _autoRecovery() { // 层先法生成还原公式
      const that = this
      const data = that.data
      const dyData = cloneData
      const allFormula = that.formula
      const MAP = autoRecoveryMap // 层先法复原专用map
      const FORMULA = autoRecoveryFormula // 层先法复原专用公式
      const run = that._recursion2 // 执行公式数组函数
      const { r2, l2, f2, b2, u, u1, u2 } = that.operation
      const subscript = {
        topEdge: [1, 3, 5, 7], // 顶层棱块下标
        centerEdge: [9, 11, 13, 15], // 中间层棱块下标
        bottomEdge: [19, 21, 23, 25], // 底层棱块下标
        topCorner: [0, 2, 4, 6], // 顶层角块下标
        bottomCorner: [18, 20, 22, 24], // 底层角块下标
      }
      const flags = { // 节流
        one: true,
      }

      // 为了方便写注释 以下将会默认魔方颜色为初始颜色 注释中所有面的称谓都用所对应的颜色代替
      // u: 黄色 r: 红色 d: 白色 l: 橙色 f: 蓝色 b: 绿色

      // 底层十字架复原 第一步 b1
      function bottomCrossOne(reslove) { // 从底层和中间层的棱块中寻找含白色面的块 并移动至顶层
        const formula = [] // 公式
        if (flags.one) { // 只需要判断一次
          if (positionError(subscript.bottomEdge) === -1) { // 判断底层十字架是否已复原
            if (dyData[19].color[2] !== 'd') formula.push(f2)
            if (dyData[21].color[2] !== 'd') formula.push(l2)
            if (dyData[23].color[2] !== 'd') formula.push(b2)
            if (dyData[25].color[2] !== 'd') formula.push(r2)
            run(formula).then(reslove)
            return
          }
          flags.one = false
        }
        const [layerD, layerNotD] = _findLayer(subscript.centerEdge) // 查找中间层棱块
        if (layerD) {
          const [targetId, map] = MAP.M1[layerNotD]
          const top = _top(targetId) // 将顶层空位调整至对应位置
          top && formula.push(top)
          formula.push(map[layerD])
          run(formula).then(() => bottomCrossOne(reslove))
          return
        }
        const [layerD2, layerNotD2] = _findLayer(subscript.bottomEdge) // 查找底层棱块
        if (!layerD2) return reslove() // 中底层没有任何含白色的棱块 第一步结束
        if (layerD2 === 'd') {
          const targetId = MAP.M1[layerNotD2][0]
          const tmpFormula = _top(targetId)
          tmpFormula && formula.push(tmpFormula)
          formula.push(that.operation[layerNotD2 + '2'])
        } else {
          const targetId1 = MAP.M1[layerD2][0]
          const top1 = _top(targetId1)
          top1 && formula.push(top1)
          formula.push(that.operation[layerD2])
          const [targetId2, tmpFormula1] = MAP.M2[layerD2]
          const top2 = _top(targetId2)
          top2 && formula.push(top2)
          formula.push(tmpFormula1)
        }

        run(formula).then(() => bottomCrossOne(reslove))

        function _findLayer(indexArr) { // 含有白色的块两个面所对应层
          let dCI = -1, notDCI = -1
          for (let i = 0; i < indexArr.length; i++) { // 中间层棱块
            const [cI0, cI1] = data[indexArr[i]].colorIndex
            const colors = dyData[indexArr[i]].color
            if (colors[cI0] === 'd') {
              dCI = cI0
              notDCI = cI1
              break
            } else if (colors[cI1] === 'd') {
              dCI = cI1
              notDCI = cI0
              break
            }
          }
          return [colorIndexToLayerMap[dCI], colorIndexToLayerMap[notDCI]]
        }
        function _top(index) { // 根据当前块的位置判断顶层旋转
          if (!includD(index)) return null
          for (let i = 0; i < subscript.topEdge.length; i++) {
            const index2 = subscript.topEdge[i]
            if (!includD(index2)) return topRotate(index2, index)
          }
          function includD(index) { // 判断当前块是否含白色
            const [cI0, cI1] = data[index].colorIndex
            const colors = dyData[index].color
            return colors[cI0] === 'd' || colors[cI1] === 'd'
          }
        }
      }
      // 底层十字架复原 第二步 b2
      function bottomCrossTwo(reslove) { // 将顶层翻转的棱块复原
        for (let i = 0; i < subscript.topEdge.length; i++) { // 中间层棱块
          const [cI0, cI1] = data[subscript.topEdge[i]].colorIndex
          const colors = dyData[subscript.topEdge[i]].color
          let layerD = ''
          if (colors[cI0] === 'd') layerD = colorIndexToLayerMap[cI0]
          else if (colors[cI1] === 'd') layerD = colorIndexToLayerMap[cI1]
          else continue // 当前棱块不含白色
          if (layerD === 'u') continue // 当前棱块未翻转
          run(FORMULA.F1[layerD]).then(() => bottomCrossTwo(reslove))
          return
        }
        return reslove() // 顶层所有棱块未翻转 第二步结束
      }
      // 底层十字架复原 第三步 b3
      function bottomCrossThree(reslove) { // 复原底层十字架
        for (let i = 0; i < subscript.topEdge.length; i++) {
          const { colorIndex: [cI0, cI1], id } = data[subscript.topEdge[i]]
          const colors = dyData[subscript.topEdge[i]].color
          let color = null // 顶层棱块上带白色块的另外一个面的颜色
          if (colors[cI0] === 'd') color = colors[cI1]
          else if (colors[cI1] === 'd') color = colors[cI0]
          else continue // 当前棱块不含白色
          const formula = []
          const top = topRotate(id, MAP.M1[color][0])
          top && formula.push(top)
          formula.push(that.operation[color + '2'])
          run(formula).then(() => bottomCrossThree(reslove))
          return
        }
        return reslove()
      }
      // 底层角块 第一步 b4
      function bottomCornerOne(reslove) { // 将所有位置错误的底层角块复原
        for (let i = 0; i < subscript.topCorner.length; i++) { // 找出顶层含有白色的角块 并还原
          const { colorIndex, id } = data[subscript.topCorner[i]]
          const colors = dyData[subscript.topCorner[i]].color
          const layerArr = []
          colorIndex.forEach(cI => (colors[cI] !== 'd') && layerArr.push(colors[cI]))
          if (layerArr.length !== 2) continue // 该角块不含白色
          const targetId = MAP.M3[layerArr[0]][layerArr[1]]
          const top = topRotate(id, targetId)
          run(top ? [top] : []).then(() => { // 将角块移动到目标位置的正上方
            const dir = getDir(targetId) // 角块白色面的朝向
            const [map, layer] = MAP.M4[targetId]
            run(map[dir][layer]).then(() => bottomCornerOne(reslove))
          })
          return
        }
        const errorId = positionError(subscript.bottomCorner) // 找出底层中位置错误的角块 并移到顶层
        if (errorId !== -1) {
          const layer = MAP.M5[errorId][1]
          run(FORMULA.F2[layer]).then(() => bottomCornerOne(reslove))
          return
        }
        return reslove()
      }
      // 底层角块 第二步 b5
      function bottomCornerTwo(reslove) { // 将底层朝向错误的角块复原
        for (let i = 0; i < subscript.bottomCorner.length; i++) { // 找出顶层含有白色的角块 并还原
          const id = subscript.bottomCorner[i]
          const dir = getDir(id)
          if (dir === 'd') continue // 白色面朝向正确
          const [map, layer] = MAP.M5[id]
          let formula = FORMULA.F5[layer]
          if (map[dir]) formula = that._reversal(formula)
          run(formula).then(() => bottomCornerTwo(reslove))
          return
        }
        return reslove()
      }

      // 中间层棱块 第一步 c1
      function centerEdgeOne(reslove) { // 将所有位置错误的中间层棱块复原
        for (let i = 0; i < subscript.topEdge.length; i++) { // 找出顶层中不含黄色的棱块 并还原
          const { colorIndex, id } = data[subscript.topEdge[i]]
          const colors = dyData[subscript.topEdge[i]].color
          const layerArr = []
          colorIndex.forEach(cI => (colors[cI] !== 'u') && layerArr.push(colors[cI]))
          if (layerArr.length !== 2) continue // 该棱块含有黄色
          const correctId = MAP.M6[layerArr[0]][layerArr[1]] // 此棱块正确位置的id
          const [map, layer] = MAP.M7[correctId] // layer: 公式起始层
          const [targetId, F] = map[colors[0]] // 此棱块将要去往顶层棱块的id F: 公式
          const top = topRotate(id, targetId)
          const formula = top ? [top] : []
          formula.push(...F[layer])
          run(formula).then(() => centerEdgeOne(reslove))
          return
        }
        const errorId = positionError(subscript.centerEdge) // 找出中间层位置错误的棱块 并移到顶层
        if (errorId !== -1) {
          const layer = MAP.M7[errorId][1]
          run(FORMULA.F6[layer]).then(() => centerEdgeOne(reslove))
          return
        }
        return reslove()
      }
      // 中间层棱块 第二步 c2
      function centerEdgeTwo(reslove) { // 将所有翻转的中间层棱块复原
        const formula = []
        if (dyData[9].color[4] !== 'f') formula.push(...allFormula.centerLayerFlip['f'])
        if (dyData[11].color[4] !== 'f') formula.push(...allFormula.centerLayerFlip['l'])
        if (dyData[13].color[5] !== 'b') formula.push(...allFormula.centerLayerFlip['b'])
        if (dyData[15].color[5] !== 'b') formula.push(...allFormula.centerLayerFlip['r'])
        if (formula.length === 0) return reslove()
        run(formula, false).then(() => reslove())
      }

      // 顶层十字架复原 t1
      function topCross(reslove) { // 复原顶层十字架
        const counter = []
        subscript.topEdge.forEach(id => {
          const colors = dyData[id].color
          if (colors[0] === 'u') counter.push(id)
        })
        if (counter.length === 4) return reslove() // 顶层十字架已复原
        if (counter.length === 0) { // 顶层十字架只有中心块为黄色
          run(allFormula.topLayerOne['f'])
            .then(() => run(allFormula.topLayerTwo['f']))
            .then(reslove)
          return
        }
        let layer = MAP.M8[counter[0] + counter[1]]
        if (!layer) layer = counter[0] === 3 ? 'f' : 'b'
        run(allFormula.topLayerTwo[layer]).then(() => topCross(reslove))
      }
      // 顶面复原 t2
      function topSurface(reslove) {
        const counter = []
        subscript.topCorner.forEach(id => {
          const colors = dyData[id].color
          if (colors[0] !== 'u') counter.push({ id, clockwise: colors[MAP.M9[id]] === 'u' })
        })
        let sum = 0
        counter.forEach(item => sum += item.id)
        let layer = ''
        switch (counter.length) {
          case 0:
            return reslove()
          case 2:
            if (sum === 6 || sum === 8) {
              let tmpId = counter[0].clockwise ? counter[0].id : counter[1].id
              layer = data[tmpId + 1].original[1]
              break
            }
            if (counter[0].id === 6) {
              layer = counter[0].clockwise ? 'f' : 'r'
              break
            }
            if (counter[0].clockwise) {
              layer = data[counter[1].id + 1].original[1]
            } else {
              layer = data[counter[0].id + 1].original[1]
            }
            break
          case 4:
            if (dyData[0].color[4] === 'u' && dyData[2].color[4] === 'u') layer = 'f'
            else if (dyData[2].color[3] === 'u' && dyData[4].color[3] === 'u') layer = 'l'
            else if (dyData[4].color[5] === 'u' && dyData[6].color[5] === 'u') layer = 'b'
            else layer = 'r'
            break
          case 3:
            layer = data[13 - sum].original[1]
            break
        }
        run(allFormula.topLayerFishOne[layer]).then(() => topSurface(reslove))
      }
      // 顶层角块 复位 t3
      function topCorner(reslove) {
        const counter = []
        subscript.topCorner.forEach(id => {
          const [cI, id1, layer] = MAP.M10[id]
          const colors = dyData[id].color
          const colors1 = dyData[id1].color
          if (colors[cI] === colors1[cI]) counter.push(layer)
        })
        let layer = ''
        if (counter.length === 0) layer = 'f' // 四个面角块侧面颜色都不一致
        else if (counter.length === 1) layer = counter[0]
        if (layer) {
          run(allFormula.topLayerCornerBlock[layer]).then(() => topCorner(reslove))
          return
        }
        let tmpStep = null
        const colors = dyData[0].color
        switch (colors[4]) { // 当四个面角块侧面颜色都一致时 只需旋转顶层即可
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
            return reslove()
        }
        return run([tmpStep]).then(reslove)
      }
      // 顶层棱块 复位 t4
      function topEdgePosition(reslove) {
        const counter = []
        subscript.topEdge.forEach(id => {
          const colors = dyData[id].color
          const [cI, layer] = MAP.M11[id]
          if (colors[cI] === layer) counter.push(layer)
        })
        if (counter.length > 1) return reslove()
        let layer = 'f', isReverse = false
        if (counter.length === 1) {
          const [targetLayer, id, cI] = MAP.M12[counter[0]]
          const colors = dyData[id].color
          if (colors[cI] !== targetLayer) isReverse = true
          layer = targetLayer
        }
        let formula = allFormula.topLayerEdgeBlockOne[layer]
        if (isReverse) formula = that._reversal(formula)
        run(formula).then(() => topEdgePosition(reslove))
      }

      function getDir(id) {
        const colors = dyData[id].color
        const cI = data[id].colorIndex.find(cI => colors[cI] === 'd')
        return colorIndexToLayerMap[cI]
      }
      function topRotate(id, targetId) { // 传入两个顶层棱块或角块的id 生成id -> targetId的步骤
        switch (id - targetId) {
          case 2: return u1
          case 4: return u2
          case 6: return u
          case -2: return u
          case -4: return u2
          case -6: return u1
          default: return null
        }
      }
      function positionError(arr) { // 找出不在初始位置的块的id 没有则返回-1 (不判断颜色方向是否正确)
        for (let i = 0; i < arr.length; i++) {
          const { colorIndex, layer, id } = data[arr[i]]
          const colorItem = dyData[arr[i]]
          for (let j = 0; j < colorIndex.length; j++) {
            if (!layer[colorItem.color[colorIndex[j]]]) return id
          }
        }
        return -1
      }

      return new Promise(res => {
        function simulateAsyncTask(handler) {
          return new Promise(resolve => {
            handler(resolve)
          })
        }
        const tasks = [bottomCrossOne, bottomCrossTwo, bottomCrossThree, bottomCornerOne, bottomCornerTwo, centerEdgeOne, centerEdgeTwo, topCross, topSurface, topCorner, topEdgePosition]
        function runTasksSequentially(tasks) {
          if (tasks.length === 0) return res()
          const task = tasks.shift()
          simulateAsyncTask(task).then(() => {
            runTasksSequentially(tasks)
          })
        }
        runTasksSequentially(tasks)
      })
    },
    autoRecoveryItLayer() { // 以层先法生成还原公式 并复原
      this._restore2() // 同步数据至cloneData
      this.startRecordHandler()
      this._autoRecovery().then(() => { // 生成公式
        if (this.configInformation.rotateTime === 0) {
          this._restore(null, cloneData)
        } else {
          const formula = [...step]
          this._recursion(formula)
        }
        this.closeRecordHandler()
      })
    },
    autoRecoveryItTwoStep() { // 以两步还原法生成还原公式 并复原
      const facelets = extractAsStr(this.dynamicData).toUpperCase()
      ajax.post('solveTwoPhase', { facelets }).then(res => {
        if (this.configInformation.rotateTime === 0) {
          this._restore()
          this.outputText = res.solution
        } else {
          this.startRecordHandler()
          const solution = this._strToFormula(res.solution)
          this._recursion(solution).then(() => this.closeRecordHandler())
        }
      })
    },
    strToArrHanlder() { // 字符转数组
      const str = 'FFDLUUDBRBFLURDBFDFRDDFBRLLUBURDLFDFUURDLRUUBBRRLBBLFL'
      strToArr(this.dynamicData, this.dynamicDatas, str)
    },
    _keyUpEvent(e) { // 键盘弹起事件
      const action = keyUpEventMap[e.key]
      if (!action) return
      if (e.ctrlKey && action.ctrl) return action.ctrl(this)
      if (e.shiftKey && action.shift) return action.shift(this)
      if (action.normal) return action.normal(this)
    },
    _keyDownEvent(e) { // 键盘按下事件
      const action = keyDownEventMap[e.key]
      action && action(this)
    },
    _recovery(axis, callback, value = 0) { // 魔方回正
      this.transitionTime = 0
      this.rubikSCubeRotateConfig[axis] = value
      setTimeout(() => {
        this.transitionTime = 0.2
        callback && callback()
      }, 0)
    },
    mouseDownHandler(e) { // 鼠标在某个面上按下时触发
      const config = this.rubikSCubeRotateConfig // 魔方拖动旋转所需的配置
      this.clickIsInPage = true
      config.downX = e.pageX // 记录鼠标按下时的坐标
      config.downY = e.pageY
      config.tmpX = config.x // 记录当前旋转的角度
      config.tmpY = config.y
      addEventListener('mousemove', this._mouseMove) // 监听鼠标移动事件
    },
    _mouseMove(e) { // 鼠标移动时的回调
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
    _strToFormula(originStr) { // 字符串转公式
      originStr = originStr.replace(/\s+/g, '')
      let str = originStr.replace(/'/g, '1').toLowerCase()
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
    _formulaToStr(formula, isSplicingArrForm = false) { // 公式转字符串
      const strArr = formula.map(([layer, deg]) => layer + degToSuffixMap[deg])
      return isSplicingArrForm ? '[' + strArr.join(', ') + ']' : strArr.join('').replace(/1/g, '\'')
    },
    _strToFormulaErrorHandler(str, errorStrIndex) { // 转换错误处理程序
      const errorData = []
      for (let i = 0; i < str.length; i++) {
        const item = { str: str[i], error: false }
        if (errorStrIndex.has(i)) item.error = true
        errorData.push(item)
      }
      const config = this.errorConfig
      config.errorData = errorData
      config.formula = str
      config.display = true
    },
    reExecute() { // 重新执行公式
      const config = this.errorConfig
      config.display = false
      if (config.formula) {
        this.settingConfig.formula = config.formula
        this._recursion(this._strToFormula(config.formula))
      }
    },
    _simplifyStepsHanlder(originaFlormula) { // 简化公式
      const simplifyFormula = []
      for (let i = 0, n = originaFlormula.length; i < n; i++) {
        const preStep = simplifyFormula[simplifyFormula.length - 1]
        const curStep = originaFlormula[i]
        if (!preStep || curStep[0] !== preStep[0]) { // 没有前一步或前后步骤层级不一致则不做处理
          simplifyFormula.push(curStep)
          continue
        }
        simplifyFormula.pop() // 删除上一步
        const sum = curStep[1] + preStep[1] // 两步旋转角度叠加
        if (sum === 0 || Math.abs(sum) === 360) continue // 两次旋转后角度为0则抛弃步骤
        const map = { '270': -90, '-270': 90, '-180': 180 }
        simplifyFormula.push([curStep[0], map[sum] || sum])
      }
      return simplifyFormula
    },
    colorChange(color, layer) { // 魔方面颜色更改
      this.configInformation.pageColor[layer] = color
    },
    bgColorChange(newColor) { // 背景颜色更改
      this.configInformation.bgcColor = newColor
    },
    implement() { // 执行输入的公式
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
    pieceStyle(deviation, display) { // 每个块的样式
      const companyLength = this.configInformation.companyLength
      const str = deviation[0] * companyLength + 'px,' + deviation[1] * companyLength + 'px,' + deviation[2] * companyLength + 'px'
      return `transform: translate3d(${str}); transition: all 0.2s; display: ${display ? 'block' : 'none'};`
    },
    style(color, i) { // 每个面的样式
      const transform = `transform: ${angleMap[i]} translateZ(50px);`
      const pageColor = this.configInformation.pageColor
      const backgroundColor = `background: ${pageColor[color]};`
      const key = this.rotateOrNot ? 'Overlap' : ''
      const opacity = this.settingConfig.enableTransparentColor ? `opacity: ${pageColor.transparency ? pageColor.transparency[color + key] : '1'};` : ''
      const border = this.settingConfig.hideBorder ? '' : `border: 1px solid ${pageColor.border};`
      return transform + backgroundColor + opacity + border
    },
    handleClose() { // 关闭提示
      this.settingConfig.dialogVisible = false
    },
    permanentCloseTip() { // 永久关闭提示
      localStorage.setItem('closeTip', 1)
      this.settingConfig.dialogVisible = false
      this.settingConfig.permanentClose = true
    },
    pasteTextToClipboard // 将传入的文本复制到剪贴板
  },
  created() {
    this._mouseMove = throttle(this._mouseMove, 50)
  },
  mounted() {
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
  background: #134E5E;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #71B280, #134E5E);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #71B280, #134E5E);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.box {
  width: 100px;
  height: 100px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
}

.tips-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
}

.tips {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
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
  width: 100px;
  height: 100px;
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

      &.speed {
        &>input {
          width: 62px;
        }

        .slider {
          width: 150px;
        }
      }

      &.spacing {
        .slider {
          margin-left: 10px;
          width: 220px;
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
      padding: 0 2px;
      width: 100%;
      word-wrap: break-word;
      user-select: text;
    }

    .rewrite {
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      gap: 10px;
      .text {
        font-size: 16px;
        font-family: 'Microsoft YaHei';
      }
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
