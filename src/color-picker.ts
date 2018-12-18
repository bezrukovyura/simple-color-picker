class ColorPicker {

  _changeFunctions: Array<(event: any) => void> = [];
  _gradientBlack: HTMLElement;
  _lastValue: string;
  textInput: HTMLElement;
  _value: string;
  _height: number;
  _mouseY: number;
  _mouseX: number;
  _gradientColor: HTMLElement;
  _rightBarPicker: HTMLElement;
  _gradientCircle: HTMLElement;
  _rightBar: HTMLElement;
  _isDisplay: boolean = false;

  addClassName = (node: HTMLElement, str: string) => {
    if (node.className.split(' ').filter(s => s === str).length === 0) {
      node.className += ` ${str}`
    }
  }

  removeClassName = (node: HTMLElement, str: string) => {
    node.className = node.className
      .split(' ')
      .filter(s => s !== str)
      .join(' ')
  }

  numberBorder = (num: number, max: number, min: number) => Math.max(Math.min(num, max), min)

  rgbToHsb = (hex: any) => {
    const hsb = { h: 0, s: 0, b: 0 }
    if (hex.indexOf('#') === 0)
      hex = hex.substring(1);

    if (hex.length === 3)
      hex = hex.split('').map((s: number) => s + s).join('');

    if (hex.length !== 6)
      return false

    hex = [hex.substr(0, 2), hex.substr(2, 2), hex.substr(4, 2)].map(s => parseInt(s, 16));
    const rgb = {
      r: hex[0],
      g: hex[1],
      b: hex[2]
    }

    const MAX = Math.max(...hex)
    const MIN = Math.min(...hex)
    //H start
    if (MAX === MIN) {
      hsb.h = 0
    } else if (MAX === rgb.r && rgb.g >= rgb.b) {
      hsb.h = (60 * (rgb.g - rgb.b)) / (MAX - MIN) + 0
    } else if (MAX === rgb.r && rgb.g < rgb.b) {
      hsb.h = (60 * (rgb.g - rgb.b)) / (MAX - MIN) + 360
    } else if (MAX === rgb.g) {
      hsb.h = (60 * (rgb.b - rgb.r)) / (MAX - MIN) + 120
    } else if (MAX === rgb.b) {
      hsb.h = (60 * (rgb.r - rgb.g)) / (MAX - MIN) + 240
    }
    //H end
    if (MAX === 0) {
      hsb.s = 0
    } else {
      hsb.s = 1 - MIN / MAX
    }
    hsb.b = MAX / 255
    return hsb
  }

  heightToRgb = (heightPercent: number) => {
    heightPercent = 1 - heightPercent
    let rgb: { r: number, g: number, b: number } = { r: undefined, g: undefined, b: undefined };
    const percentInEach = heightPercent * 6
    return (<any>Object).entries(rgb).reduce(
      (lastObj: HTMLElement, nowArr: number[], index: number) =>
        Object.assign(lastObj, {
          [nowArr[0]]: Math.floor(
            (function () {
              const left = ((index + 1) % 3) * 2
              const right = left + 2
              const differenceL = percentInEach - left
              const differenceR = right - percentInEach
              if (differenceL >= 0 && differenceR >= 0) {
                return 0
              }
              const distance = Math.min(
                Math.abs(differenceL),
                Math.abs(differenceR),
                Math.abs(6 - differenceL),
                Math.abs(6 - differenceR)
              )
              return Math.min(255, 255 * distance)
            })()
          )
        }),
      {}
    )
  }

  heightAddLAndT_ToRGB = (height: number, left: number, top: number) => {
    const rgb = this.heightToRgb(height)
    for (const key in rgb) {
      rgb[key] = (255 - rgb[key]) * (1 - left) + rgb[key]
      rgb[key] = rgb[key] * (1 - top)
    }
    return rgb
  }

  rgbToHex = (rgb: { r: number, g: number, b: number }) => {
    const { r, g, b } = rgb
    return (
      (<any>Math.floor(r)
        .toString(16))
        .padStart(2, '0') +
      (<any>Math.floor(g)
        .toString(16))
        .padStart(2, '0') +
      (<any>Math.floor(b)
        .toString(16))
        .padStart(2, '0')
    )
  }

  hexToRgb = (hex: string): { r: number, b: number, g: number } => {
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    }
  }

  cE = (str: string) => document.createElement(str)

  addPallet(pallet: string[]) {
    if (!pallet || !pallet.length || pallet.length == 0)
      return

    pallet.forEach((color, i) => {
      let item = this.cE('div')
      item.className = 'color-picker-pallet color-picker-pallet' + i;
      item.style.background = color;
      item.style.left = "" + i * 22;
      item.onclick = () => {
        this.value = color;
        this.onchange();
      };
      this.conteiner.appendChild(item);
    })
  }

  private wrapper: HTMLElement;
  private conteiner: HTMLElement;

  constructor(wrapper: string, value: string = "fff", pallet: string[] = []) {

    this.wrapper = document.querySelector(wrapper);
    let input = this.cE('input');
    this.wrapper.appendChild(input)

    this.conteiner = this.cE('div');
    this.conteiner.style.display = "none";
    this.conteiner.style.height = "215px";
    this.conteiner.style.width = "215px";
    this.addClassName(this.conteiner, 'conteiner');
    this.wrapper.appendChild(this.conteiner)

    const thisClass = this

    this.addClassName(this.conteiner, 'color-picker');

    const rightBar = this.cE('div');
    rightBar.className = 'color-picker-right-bar';
    const rightBarPicker = this.cE('div');
    rightBarPicker.className = 'color-picker-right-bar-picker';

    rightBar.appendChild(rightBarPicker)

    const gradientColor = this.cE('div');
    gradientColor.className = 'color-picker-gradients color-picker-gradient-color';
    const gradientBlack = this.cE('div');
    gradientBlack.className = 'color-picker-gradients color-picker-gradient-black';
    gradientColor.style.background = 'linear-gradient(to right,#FFFFFF,#FF0000)';
    const gradientCircle = this.cE('div');
    gradientCircle.className = 'color-picker-circle';
    gradientBlack.appendChild(gradientCircle);
    const textInput = this.cE('input');
    (<any>textInput).maxLength = 6;
    textInput.style.width = '100%';
    textInput.style.height = '100%';
    (<HTMLInputElement>textInput).type = 'text';
    this.conteiner.appendChild(rightBar);
    this.conteiner.appendChild(gradientColor);
    this.conteiner.appendChild(gradientBlack);
    this.addPallet(pallet);
    textInput.addEventListener('change', () => {
      this.setValue((<any>textInput).value, true)
      this.onchange()
      this.updatePicker()
    })

    this.textInput = textInput;
    this._gradientBlack = gradientBlack;
    this._gradientColor = gradientColor;
    this._rightBar = rightBar;
    this._rightBarPicker = rightBarPicker;

    this._gradientCircle = gradientCircle;

    this._height = 0
    this._mouseX = 0
    this._mouseY = 0

    this.setValue(value, true)
    this._lastValue = this.value
    this.updatePicker()


    const mouseMoveFun = (e: MouseEvent) => {
      window.addEventListener('mouseup', function mouseUpFun() {
        thisClass.conteiner.style.userSelect = 'text';
        window.removeEventListener('mousemove', mouseMoveFun);
        window.removeEventListener('mouseup', mouseUpFun);
      })
      const bbox = thisClass._gradientBlack.getBoundingClientRect();
      this._mouseX = e.clientX - bbox.left;
      this._mouseY = e.clientY - bbox.top;
      this.mouseBorder()
      this.setValue(
        this.heightAddLAndT_ToRGB(this.height, this.position.x, this.position.y)
      )
      this.updatePicker()
    }
    const mouseMoveFunBar = (e: MouseEvent) => {
      window.addEventListener('mouseup', function mouseUpFunBar() {
        thisClass.conteiner.style.userSelect = 'text'
        window.removeEventListener('mousemove', mouseMoveFunBar)
        window.removeEventListener('mouseup', mouseUpFunBar)
      })
      const bbox = thisClass._rightBar.getBoundingClientRect()
      this._height = e.clientY - bbox.top;
      this.mouseBorderBar()
      this.setValue(
        this.heightAddLAndT_ToRGB(this.height, this.position.x, this.position.y)
      )
      this.updatePicker()
    }
    this._gradientBlack.addEventListener('mousedown', e => {
      this.conteiner.style.userSelect = 'none'
      mouseMoveFun(e)
      window.addEventListener('mousemove', mouseMoveFun)
    })
    this._rightBar.addEventListener('mousedown', e => {
      this.conteiner.style.userSelect = 'none'
      mouseMoveFunBar(e)
      window.addEventListener('mousemove', mouseMoveFunBar)
    })

    if ('ontouchstart' in window) {
      const touchFun = (e: MouseEvent) => {
        e.preventDefault();
        e = (<any>e).touches[0];
        const bbox = thisClass._gradientBlack.getBoundingClientRect()
        this._mouseX = e.clientX - bbox.left;
        this._mouseY = e.clientY - bbox.top;
        this.mouseBorder()
        this.setValue(
          this.heightAddLAndT_ToRGB(this.height, this.position.x, this.position.y)
        )
        this.updatePicker()
      }
      const touchFunBar = (e: MouseEvent) => {
        e.preventDefault();
        e = (<any>e).touches[0];
        const bbox = this._rightBar.getBoundingClientRect()
        this._height = e.clientY - bbox.top;
        this.mouseBorderBar()
        this.setValue(
          this.heightAddLAndT_ToRGB(this.height, this.position.x, this.position.y)
        )
        this.updatePicker()
      }
      this._gradientBlack.addEventListener('touchmove', touchFun)
      this._gradientBlack.addEventListener('touchstart', touchFun)
      this._rightBar.addEventListener('touchmove', touchFunBar)
      this._rightBar.addEventListener('touchstart', touchFunBar)
    }

    this._changeFunctions = [];

    this.setHooks();

  }


  setHooks = ()=> {
    
    //открыть палитру
    (<HTMLElement>document.querySelector("#" + this.wrapper.id + ">input")).onclick = (e) => {
      if(!this._isDisplay){
        this._isDisplay = !this._isDisplay;
        (<HTMLElement>document.querySelector("#" + this.wrapper.id + " .conteiner")).style.display = "block";
      }
      e.stopPropagation();
      return false;
    }

    //открыть палитру
    (<HTMLElement>document.querySelector(".conteiner.color-picker")).onclick = (e) => {
      e.stopPropagation();
      return false;
    }
    

    //закрыть палитру
    document.onclick = (e) => {
      if(this._isDisplay){
        this._isDisplay = !this._isDisplay;
        (<HTMLElement>document.querySelector("#" + this.wrapper.id + " .conteiner")).style.display = "none";
      }
    }

    
    (<HTMLElement>document.querySelector("#" + this.wrapper.id + ">input")).onchange = (e) => {
      this.value = (<HTMLInputElement>document.querySelector("#" + this.wrapper.id + ">input")).value;
    };
    (<HTMLElement>document.querySelector("#" + this.wrapper.id + ">input")).onkeyup = (e) => {
      this.value = (<HTMLInputElement>document.querySelector("#" + this.wrapper.id + ">input")).value;
    };
  }

  onchange() {
    this.wrapper.style.color = this.value;
    (<any>document.querySelector("#" + this.wrapper.id + ">input")).value = this.value;;

    this._changeFunctions.forEach(fun =>
      fun({
        target: this,
        type: 'change',
        timeStamp: performance.now()
      })
    )
  }

  addEventListener(type: string, fun: (event: any) => void) {
    if (typeof fun !== 'function') {
      return
    }
    switch (type) {
      case 'change': {
        this._changeFunctions.push(fun)
        break
      }
    }
  }

  getValue(mode = 'value'): any {
    switch (mode) {
      case 'hex': {
        return this._value
      }
      case 'rgb': {
        return this.hexToRgb(this.getValue('hex'))
      }
      case 'hsb': {
        return this.rgbToHsb(this.getValue('hex'))
      }
      case 'value':
      default: {
        return '#' + this._value
      }
    }
  }

  getBrightness() {
    const { r, g, b } = this.getValue('rgb')
    return 0.299 * r + 0.587 * g + 0.114 * b
  }

  setValue(value: string, resetPosition: boolean = false): void {
    let hex = '';
    switch (typeof value) {
      case 'string': {
        if (value.indexOf('#') === 0)
          value = value.substring(1)
        if (value.length === 3)
          value = value.split('').map(s => s + s).join('');
        if (value.length !== 6)
          value = 'FFFFFF'
        hex = value
        break
      }
      case 'object': {
        hex = this.rgbToHex(value)
      }
    }
    let rgb
    try {
      rgb = this.hexToRgb(hex)
    } catch (error) {
      rgb = {
        r: 255,
        g: 255,
        b: 255
      }
    }
    const { r, g, b } = rgb
    this._value = this.rgbToHex({ r, g, b }).toUpperCase();
    (<HTMLInputElement>this.textInput).value = this._value;
    if (resetPosition) {
      let Hsb: { h: number, s: number, b: number } = <any>this.rgbToHsb(hex);
      this._height = 1 - Hsb.h / 360
      if (Hsb.h === 0) 
        this._height = 0
      this._mouseX = Hsb.s
      this._mouseY = 1 - Hsb.b
    } 
    else if (this._lastValue !== this.value) 
      this.onchange()
    
    this._lastValue = this.value
  }


  mouseBorder() {
    this._mouseX = this.numberBorder(
      this._mouseX / (this._gradientBlack.getBoundingClientRect().width - 2), 1, 0
    )
    this._mouseY = this.numberBorder(
      this._mouseY / (this._gradientBlack.getBoundingClientRect().height - 2), 1, 0
    )
  }
  mouseBorderBar() {
    this._height = this.numberBorder(
      this._height / (this._rightBar.getBoundingClientRect().height - 2), 1, 0
    )
  }
  updatePicker() {

    this.wrapper.style.color = this.value;

    const position = this.position
    const target = this._gradientCircle
    target.style.left = `${position.x * 100}%`
    target.style.top = `${position.y * 100}%`
    this._rightBarPicker.style.top = `${this.height * 100}%`
    this._gradientColor.style.background = "linear-gradient(to right,#FFFFFF,#" + this.rgbToHex(this.heightToRgb(this.height)) + ")";
    if (this.getBrightness() > 152) {
      this.addClassName(target, 'color-picker-circle-black')
      this.removeClassName(target, 'color-picker-circle-white')
    } else {
      this.removeClassName(target, 'color-picker-circle-black')
      this.addClassName(target, 'color-picker-circle-white')
    }
  }
  get position() {
    return {
      x: this._mouseX,
      y: this._mouseY
    }
  }
  get height() {
    return this._height
  }
  get value() {
    return this.getValue()
  }
  set value(value) {
    this.setValue(value, true);
    this.updatePicker();
  }



}