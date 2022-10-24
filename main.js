import { Rect } from "./Rect.js"
import { Polygon } from "./Polygon.js"
import { createUuid, toCanvasPos } from "./utils.js"

class DrawJs {
    drawType = 1;  // 当前绘制的类型1矩形, 2多边形
    ctx = null; // canvas示例
    imageWidth = 0;
    imageHeight = 0;
    canvasWidth = 0;
    canvasHeight = 0;
    imageEl = new Image();
    printMove = { x: '', y: '' };
    markData = [];
    defaultFillStyle = 'rgba(199, 211, 132, 0.1)';
    defaultStrokeStyle = 'rgba(199, 211, 132, 1)';
    scaleStep = 0;
    imageOriginWidth = 0
    imageOriginHeight = 0
    originX = 0;
    originY = 0;

    constructor(opt = {}) {
        this.el = opt.el
        this.elRectInfo = null
        this.canvasEl = null

        this.init(opt.imgSrc)
        this.eventBindDrawJs()
        this.bindEvent()
    }
    get activeShape() {
        return this.markData.find((item) => item.active);
    }
    get scale() {
        if (this.imageOriginWidth && this.imageWidth) {
            return this.imageWidth / this.imageOriginWidth;
        }
        return 1;
    }
    // 初始化
    init(url = '') {
        this.elRectInfo = this.el.getBoundingClientRect()
        let { width, height } = this.elRectInfo

        this.canvasEl = document.createElement('canvas')
        this.canvasEl.width = width
        this.canvasEl.height = height
        this.canvasEl.style.cursor = 'crosshair';
        this.imageWidth = width
        this.imageHeight = height
        this.canvasWidth = width
        this.canvasHeight = height
        this.el.appendChild(this.canvasEl)
        this.ctx = this.canvasEl.getContext('2d')
        
        this.offlineCanvas = document.createElement('canvas');
        this.offlineCanvas.width = width;
        this.offlineCanvas.height = height;
        this.offlineCtx = this.offlineCanvas.getContext('2d');
        
        if (url != '') {
            this.imageEl.src = url;
            this.imageEl.width = width;
            this.imageEl.height = height;
            this.imageEl.onload = () => {
                this.imageOriginWidth = this.imageEl.width;
                this.imageOriginHeight = this.imageEl.height;
                this.printImage()
            }
        }
    }
    // 此处绑定的方法，内部的this指向元素---需改变为DrawJs实例
    bindEvent() {
        this.canvasEl.addEventListener('mousedown', this.canvasMouseDown)
        this.canvasEl.addEventListener('mousemove', this.canvasMouseMove)
        this.canvasEl.addEventListener('mouseup', this.canvasMouseUp)
        this.canvasEl.addEventListener('dblclick', this.canvasDblclick)
        this.canvasEl.addEventListener('mousewheel', this.canvasMouseWheel);
    }
    // 将this指向DrawJS实例
    eventBindDrawJs() {
        this.canvasMouseDown = this.canvasMouseDown.bind(this)
        this.canvasMouseMove = this.canvasMouseMove.bind(this)
        this.canvasMouseUp = this.canvasMouseUp.bind(this)
        this.canvasDblclick = this.canvasDblclick.bind(this)
        this.canvasMouseWheel = this.canvasMouseWheel.bind(this)
    }
    canvasMouseDown(e) {
        let { x, y } = toCanvasPos(e, this.canvasEl)
        const mousePoint = [e.offsetX, e.offsetY];
        
        if(e.buttons == 1){
            let oncreating = false;
            if(this.activeShape && this.activeShape.type == 2 && this.activeShape.creating){
                oncreating = true
            }
            // 是否点击到形状
            const [targetShapeIndex, targetShape] = this.clickOnShape(mousePoint);
            if(!oncreating && targetShapeIndex != -1){
                this.markData.forEach((item, i) => {
                    item.active = i === targetShapeIndex;
                })
                this.update()
                return;
            }else if(oncreating){
                // 多边形线段新增点
                if(this.activeShape.type == 2){
                    let len = this.activeShape.coor.length
                    let lastcor = this.activeShape.coor[len - 1]
                    if(x != lastcor[0] && y != lastcor[1]) {
                        this.activeShape.coor.push([x - this.originX / this.scale, y - this.originY / this.scale]);
                    }
                }
            }else if(this.drawType){
                this.markData.forEach((item, i) => {
                    item.active = false;
                })
                const crePoint = [x - this.originX / this.scale, y - this.originY / this.scale]
                console.log(crePoint)
                // 新建形状
                let newShape = null;
                if(this.drawType == 1){
                    newShape = new Rect();
                    newShape.coor.push(crePoint, crePoint);
                }else if(this.drawType == 2){
                    newShape = new Polygon();
                    newShape.coor.push(crePoint);
                }
                newShape.uuid = createUuid();
                newShape.creating = true;
                newShape.active = true;
                this.markData.push(newShape)
                console.log(this.markData,'====<')
            }else if(this.activeShape){
                this.activeShape.active = false;
            }
        }
        this.update()
    }
    canvasMouseMove(e) {
        let {x, y} = toCanvasPos(e, this.canvasEl)
        this.printMove.x = x;
        this.printMove.y = y;

        if(e.buttons === 1){
            if(this.activeShape){
                let type = this.activeShape.type;
                switch(type){
                    case 1:
                        this.activeShape.coor.splice(1, 1, [x, y]);
                        break;
                }
            }
        }
        this.update()
        this.drawSubline(x, y)
    }
    canvasMouseUp(e) {
        if(this.activeShape && this.activeShape.type == 1 && this.activeShape.creating){
            this.activeShape.creating = false;
            this.activeShape.active = false;
        }
    }
    canvasDblclick(e) {
        if(this.activeShape){
            if(this.activeShape.type === 2 && this.activeShape.creating){
                this.activeShape.creating = false;
                this.activeShape.active = false;
            }
        }
    }
    canvasMouseWheel(e) {
        e.preventDefault();
        this.setScale(e.deltaY < 0);
    }
    /**
     * 绘制图片
    */
    printImage() {
        this.ctx.drawImage(this.imageEl, 0, 0, this.imageWidth, this.imageHeight);
    }
    /**
     * 绘制矩形
     */
    drawRect(shape) {
        const [[x0, y0], [x1, y1]] = shape.coor;
        this.ctx.save()

        this.ctx.fillStyle = this.defaultFillStyle;
        this.ctx.strokeStyle = this.defaultStrokeStyle;

        let width = x1 - x0;
        let height = y1 - y0;

        this.ctx.fillRect(x0, y0, width, height);
        this.ctx.strokeRect(x0, y0, width, height);

        this.ctx.restore()
    }
    /**
     * 绘制多边形
     */
    drawRolygon(shape) {
        this.ctx.save()
        this.ctx.fillStyle = this.defaultFillStyle;
        this.ctx.strokeStyle = this.defaultStrokeStyle;

        this.ctx.beginPath()
        let coor = shape.coor;
        coor.forEach((item, i)=>{
            if(i === 0){
                this.ctx.moveTo(item[0], item[1])
            }else{
                this.ctx.lineTo(item[0], item[1])
            }
        })

        if (shape.creating) {
            this.ctx.lineTo(this.printMove.x, this.printMove.y);
        } else if (coor.length > 2) {
            this.ctx.closePath();
        }
        
        this.ctx.fill()
        this.ctx.stroke()

        this.ctx.restore()
    }
    /**
     * 绘制控制点
     * @param point 坐标
    */
    drawCtrl(point, activePt) {
        const [x, y] = point.map((a) => a);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#fff';

        // 当前有选中的标注并且有选中的控制点
        if(activePt){
            this.ctx.fillRect(x-5, y-5, 10, 10)
        }else{
            this.ctx.fillRect(x-3, y-3, 7, 7)
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    /**
     * 绘制控制点
    */
    drawCtrlList(shape) {
        if(shape && shape.ctrlsData){
            shape.ctrlsData.forEach(point => {
                this.drawCtrl(point, false);
            });
        }
    }
    /**
     * 绘制辅助线
     */
    drawSubline(x, y) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvasHeight);
        this.ctx.strokeStyle = '#FE5440';
        this.ctx.stroke();

        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvasWidth, y);
        this.ctx.strokeStyle = '#FE5440';
        this.ctx.stroke();
    }
    /**
     * 判断是非在标注实例上
     * @param mousePoint 点击位置
     * @returns 
    */
    clickOnShape(mousePoint) {
        let targetShapeIndex = -1;
        const targetShape = this.markData.find((item, index) => {
            if((item.type == 1 && this.isPointInRect(mousePoint, item.coor)) || (item.type == 2 && this.isPointInPolygon(mousePoint, item.coor))){
                targetShapeIndex = index
                return item;
            }
        })

        return [targetShapeIndex, targetShape];
    }
    /**
     * 判断是否在矩形内
     * @param point 坐标
     * @param coor 区域坐标
     * @return 布尔值
    */
    isPointInRect(point, coor) {
        const [x, y] = point;
        const [[x0, y0], [x1, y1]] = coor.map((a) => a.map((b) => b));
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }
    /**
     * 判断是否在多边形内
     * @param point 坐标
     * @param coor 区域坐标
     * @return 布尔值
    */
    isPointInPolygon(point, coor) {
        this.offlineCtx.save();
        this.offlineCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.offlineCtx.beginPath();
        this.offlineCtx.fillStyle = '#FFFFFF'
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a));
            if (i === 0) {
                this.offlineCtx.moveTo(x, y);
            } else {
                this.offlineCtx.lineTo(x, y);
            }
        });
        this.offlineCtx.closePath();
        this.offlineCtx.fill();

        const areaData = this.offlineCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const index = (point[1] - 1) * this.canvasWidth * 4 + point[0] * 4;
        console.log(areaData.data, index, '======<')
        this.offlineCtx.restore();
        return areaData.data[index + 3] !== 0;
    }
    /**
     * 缩放
     * @param type true放大，false，缩小
    */
    setScale(type) {
        if ((!type && this.imageWidth <= 20) || (type && this.imageWidth >= this.canvasWidth * 100)) return;
        if (type) { this.scaleStep++; } else { this.scaleStep--; }
        const abs = Math.abs(this.scaleStep);
        const width = this.imageWidth;
        this.imageWidth = Math.round(this.imageOriginWidth * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
        this.imageHeight = Math.round(this.imageOriginHeight * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
        this.stayPosition(this.imageWidth / width);
        this.update();
    }
    /**
    * 保持缩放中心
    * @param scale nummer
   */
    stayPosition(scale) {
        this.originX = this.canvasWidth / 2 - (this.canvasWidth / 2 - this.originX) * scale;
        this.originY = this.canvasHeight / 2 - (this.canvasHeight / 2 - this.originY) * scale;
    }
    /**
     * 更新画布操作
    */
    update() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.translate(this.originX, this.originY);
        this.printImage()
        
        this.markData.forEach(item=>{
            let { type } = item;
            switch(type) {
                case 1:
                    this.drawRect(item);
                    break;
                case 2:
                    this.drawRolygon(item);
                    break;
            }
        })

        if(this.activeShape){
            this.drawCtrlList(this.activeShape);
        }
        this.ctx.restore()
    }
}

export default DrawJs