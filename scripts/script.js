const toolBtns = document.querySelectorAll(".tool"),//инструменты
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    alphaSlider = document.querySelector("#alpha-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    colorCanvas = document.querySelector(".color-canvas"),
    saveImg = document.querySelector(".save-img");

const canvas = document.getElementById('canvas'),//холсты
    draw = document.getElementById('draw'),
    layer1 = document.getElementById('layer-1'),
    layer2 = document.getElementById('layer-2'),
    layer3 = document.getElementById('layer-3');
cursorLayer = document.getElementById('cursor');
const canvas_ctx = canvas.getContext('2d'),//контексты
    draw_ctx = draw.getContext('2d'),
    layer1_ctx = layer1.getContext('2d'),
    layer2_ctx = layer2.getContext('2d'),
    layer3_ctx = layer3.getContext('2d');
cursorLayer_ctx = cursorLayer.getContext('2d');
window.addEventListener('keydown', this.check, false);//клавиши

let snapShot, lastPoint, currentPoint,//переменные
    isIdle = true,//ключ
    selectedTool = "brush",//инструмент
    brushWhidth = 10,//размер кисти
    brushAlpha = 1,//прозрачность кисти
    brushShape = "round",//форма кисти
    selectedColor = "black",//выбранный цвет
    backgroundColor = "white";//цвет задника

let selectedLayer = 1,
    layer_ctx = layer1_ctx,
    layer = layer1;

var cPushArray = [],
    pointArray = [];
var cStep = -1,
    cLimit = 50,
    levelSmoothing = 3,
    scale = 1.0;
    scaleMultiplier = 0.8;

//Размер холста
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    draw.width = draw.offsetWidth;
    draw.height = draw.offsetHeight;

    cursorLayer.width = cursorLayer.offsetWidth;
    cursorLayer.height = cursorLayer.offsetHeight;

    layer1.width = layer1.offsetWidth;
    layer1.height = layer1.offsetHeight;

    layer2.width = layer2.offsetWidth;
    layer2.height = layer2.offsetHeight;

    layer3.width = layer3.offsetWidth;
    layer3.height = layer3.offsetHeight;
    setCanvasBackground(canvas_ctx);

});

//Цвет холста
function setCanvasBackground(layerBack_ctx) {
    if (layerBack_ctx === canvas_ctx) { backgroundColor = 'white' }
    layerBack_ctx.fillStyle = backgroundColor;
    layerBack_ctx.fillRect(0, 0, layer.width, layer.height);
    layer_ctx.fillStyle = selectedColor;
    cPush();
}

sizeSlider.addEventListener("change", () => brushWhidth = sizeSlider.value);//слайдер толщины

alphaSlider.addEventListener("change", () => brushAlpha = alphaSlider.value);//слайдер прозрачности

//Выбор цвета
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

//Пипетка
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

//Очистка холста
clearCanvas.addEventListener("click", () => {
    clear(layer_ctx);
});

//Заливка холста
colorCanvas.addEventListener("click", () => {
    backgroundColor = selectedColor;
    layer_ctx.globalCompositeOperation = "source-over"
    setCanvasBackground(layer_ctx);
});

function clear(layerClear_ctx) {
    layerClear_ctx.clearRect(0, 0, layer.width, layer.height);
    if (layerClear_ctx === canvas_ctx) { setCanvasBackground(layerClear_ctx); }
    cPushArray = [];
    cStep = -1;
    cPush();

}

//Сохранение холста
saveImg.addEventListener("click", () => {
    canvas_ctx.drawImage(layer1, 0, 0);
    canvas_ctx.drawImage(layer2, 0, 0);
    canvas_ctx.drawImage(layer3, 0, 0);

    const link = document.createElement("a");
    link.download = `${Date.now()}.png`
    link.href = canvas.toDataURL();
    link.click();
    clear(canvas_ctx);
});

//Выбор инструментов
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

//Функции
function layers(selectedLayer) {
    if (selectedLayer === 'layer-3') {
        layer = layer3;
        layer_ctx = layer3_ctx;
    }
    else if (selectedLayer === 'layer-2') {
        layer = layer2;
        layer_ctx = layer2_ctx;
    }
    else if (selectedLayer === 'layer-1') {
        layer = layer1;
        layer_ctx = layer1_ctx;
    }
    cPushArray = [];
    cStep = -1;
    cPush();
    console.log(selectedLayer);
}

function drawStart(e) {
    lastPoint = { x: e.clientX - draw.offsetLeft, y: e.clientY - draw.offsetTop };
    draw_ctx.strokeStyle = selectedColor;
    draw_ctx.fillStyle = selectedColor;
    draw_ctx.lineWidth = brushWhidth;
    draw_ctx.lineCap = brushShape;
    draw_ctx.lineJoin = brushShape;
    draw.style.opacity = brushAlpha;

    snapShot = draw_ctx.getImageData(0, 0, draw.width, draw.height);
    isIdle = false;
    drawMove(e);
}

function drawEnd() {
    if (isIdle) return;
    isIdle = true;
    layer_ctx.globalAlpha = brushAlpha;
    if (selectedTool === "eraser") { layer_ctx.globalCompositeOperation = "destination-out"; }
    layer_ctx.drawImage(draw, 0, 0);
    draw_ctx.clearRect(0, 0, draw.width, draw.height);
    layer_ctx.globalAlpha = 1;
    layer_ctx.globalCompositeOperation = "source-over"
    cPush();
    pointArray = [];
}

function drawMove(e) {
    if (isIdle) return;
    currentPoint = { x: e.clientX - draw.offsetLeft, y: e.clientY - draw.offsetTop };

    if (selectedTool === "brush" || selectedTool === "eraser") {
        draw_ctx.strokeStyle = selectedTool === "eraser" ? "white" : selectedColor;
        smoothBrush(currentPoint);
        lastPoint = currentPoint;
    } else if (selectedTool === "rectangle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        rectangle(e);
    } else if (selectedTool === "circle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        circle(e);
    } else if (selectedTool === "triangle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        triangle(e);
    } else if (selectedTool === "line") {
        draw_ctx.putImageData(snapShot, 0, 0);
        line(e);
    }
}

function smoothBrush(point) {
    pointArray.push(point);
    if (pointArray.length < 2) {
        draw_ctx.beginPath();
        draw_ctx.moveTo(lastPoint.x, lastPoint.y);
        draw_ctx.lineTo(lastPoint.x, lastPoint.y);
        draw_ctx.stroke();
        snapShot = draw_ctx.getImageData(0, 0, draw.width, draw.height);
        return;
    }
    draw_ctx.beginPath();
    draw_ctx.moveTo(pointArray[0].x, pointArray[0].y);
    draw_ctx.putImageData(snapShot, 0, 0);

    for (var i = 1; i < pointArray.length - 2; i++) {
        var xc = (pointArray[i].x + pointArray[i + 1].x) / 2;
        var yc = (pointArray[i].y + pointArray[i + 1].y) / 2;
        draw_ctx.quadraticCurveTo(pointArray[i].x, pointArray[i].y, xc, yc);
    }
    draw_ctx.stroke();
}

function line() {
    draw_ctx.beginPath();
    draw_ctx.moveTo(lastPoint.x, lastPoint.y);
    draw_ctx.lineTo(currentPoint.x, currentPoint.y);
    draw_ctx.stroke();
}

//курсор
document.addEventListener('pointermove', (e) => {
    currentPoint = { x: e.clientX - cursor.offsetLeft, y: e.clientY - cursor.offsetTop };

    cursorLayer_ctx.clearRect(0, 0, cursorLayer.width, cursorLayer.height);

    cursorLayer_ctx.beginPath();
    cursorLayer_ctx.arc(currentPoint.x, currentPoint.y, brushWhidth / 2, 0, 2 * Math.PI);
    cursorLayer_ctx.stroke();
});

function rectangle() {
    fillColor.checked ? draw_ctx.fillRect(
        lastPoint.x, lastPoint.y,
        currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y) :
        draw_ctx.strokeRect(
            lastPoint.x, lastPoint.y,
            currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
}

function circle() {
    draw_ctx.beginPath();
    let radius = Math.sqrt(Math.pow((currentPoint.x - lastPoint.x), 2) + Math.pow((currentPoint.y - lastPoint.y), 2));
    draw_ctx.arc(lastPoint.x, lastPoint.y, radius, 0, 2 * Math.PI);
    fillColor.checked ? draw_ctx.fill() : draw_ctx.stroke();
}

function triangle() {
    draw_ctx.beginPath();
    draw_ctx.moveTo(lastPoint.x, lastPoint.y);
    draw_ctx.lineTo(currentPoint.x, currentPoint.y);
    draw_ctx.lineTo(lastPoint.x * 2 - currentPoint.x, currentPoint.y);
    draw_ctx.closePath();
    fillColor.checked ? draw_ctx.fill() : draw_ctx.stroke();
}

function cPush() {
    cStep++;
    if (cStep < cPushArray.length)
        cPushArray.length = cStep;
    cPushArray.push(layer.toDataURL());
    if (cStep > cLimit) {
        cStep = cLimit;
        cPushArray = cPushArray.slice(1);
    }
}


function cUndo() {
    if (0 < cStep) {
        cStep--;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () {
            layer_ctx.clearRect(0, 0, layer.width, layer.height)
            layer_ctx.drawImage(canvasPic, 0, 0);
        }
    }
}

function cRedo() {
    if (cStep < cPushArray.length - 1) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () {
            layer_ctx.clearRect(0, 0, layer.width, layer.height)
            layer_ctx.drawImage(canvasPic, 0, 0);
        }
    }
}

function zoomPlus(){
    scale /= scaleMultiplier;
    layer_ctx.scale(scale,scale);
    draw_ctx.scale(scale,scale);

}

function check(e) {
    var code = e.keyCode;
    switch (code) {
        case 90: cUndo(); break;
        case 89: cRedo(); break;
        case 66: selectedTool = "brush"
            document.querySelector(".options .active").classList.remove("active");
            document.querySelector("#brush").classList.add("active"); break;
        case 69: selectedTool = "eraser"
            document.querySelector(".options .active").classList.remove("active");
            document.querySelector("#eraser").classList.add("active"); break;
        case 219: sizeSlider.value = parseFloat(sizeSlider.value) - 5;
            brushWhidth = sizeSlider.value; break;
        case 221: sizeSlider.value = parseFloat(sizeSlider.value) + 5;
            brushWhidth = sizeSlider.value; break;
        case 188: alphaSlider.value = parseFloat(alphaSlider.value) - 0.05;
            console.log(alphaSlider.value);
            brushAlpha = alphaSlider.value; break;
        case 190: alphaSlider.value = parseFloat(alphaSlider.value) + 0.05;
            console.log(alphaSlider.value);
            brushAlpha = alphaSlider.value; break;
        case 49: layers('layer-1'); break;
        case 50: layers('layer-2'); break;
        case 51: layers('layer-3'); break;
        case 189: zoomMin(); break;
        case 187: zoomPlus(); break;
        default: console.log(code);
    }
}

draw.addEventListener("pointerdown", drawStart, false);
draw.addEventListener("pointerup", drawEnd, false);
draw.addEventListener("pointermove", drawMove, false);