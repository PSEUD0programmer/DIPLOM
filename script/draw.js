//инструменты
const shapeBtns = document.querySelectorAll(".shape-btn"),
    toolBtns = document.querySelectorAll(".tools-btn"),
    sizeSlider = document.querySelector("#brash-size"),
    alphaSlider = document.querySelector("#brash-alpha"),
    layerAlpha = document.querySelector("#layer-alpha"),
    visibility = document.querySelector(".visibility"),
    colorBtns = document.querySelectorAll(".color"),
    layerBtns = document.querySelectorAll(".layer-btn"),
    pallet = document.querySelector(".pallet-color"),
    clearCanvas = document.querySelector("#delete"),
    saveImg = document.querySelector(".save-img"),
    undoBtn = document.querySelector("#undo"),
    redoBtn = document.querySelector("#redo"),
    //холсты
    workSpace = document.querySelector('.work-space'),
    canvas = document.querySelector('.canvas'),
    draw = document.querySelector('.draw'),
    layerList = document.querySelectorAll('.layer'),
    cursorLayer = document.querySelector('.cursor'),
    //контексты
    canvas_ctx = canvas.getContext('2d'),
    draw_ctx = draw.getContext('2d'),
    cursorLayer_ctx = cursorLayer.getContext('2d');

//переменные
let snapShot, lastPoint, cursorPosition, canvasPosition, canvasScale, canvasSize,
    //ключи
    isIdle = true,
    isWorkSpaceVis = false,
    //draw
    selectedTool = "brush",//инструмент
    brushWhidth = 4,//размер кисти
    brushAlpha = 1,//прозрачность кисти
    brushShape = "round",//форма кисти
    selectedColor = "#000000",//выбранный цвет
    backgroundColor = "#D9D9D9",//цвет задника
    //слои
    selectedLayer = 1,
    layerArr = [[], [], [1, 1, 1]],//[element, context, opacity]
    //undo/redo
    cPushArray = [],
    pointArray = [],
    cStep = -1,
    cLimit = 50,
    //afk
    afk, canvasAfk,
    afkTime = 300000,
    //img
    img = {
        cursor: {
            cp: new Image(),
        },
    }

//Start
window.addEventListener("load", () => {
    //загрузка изображений
    loadImg();
    //цвет палитры
    document.querySelectorAll('.color').forEach(color => {
        color.style.backgroundColor = color.id;
    })
    document.querySelector('.color-selected').style.backgroundColor = selectedColor;
    sizeSlider.value = brushWhidth;
    pallet.value = selectedColor;
    //размеры и позиции холста
    canvasSizePosition();
    canvasSize = { w: workSpace.offsetWidth, h: workSpace.offsetHeight };
    canvas.width = draw.width = cursorLayer.width = canvasSize.w;
    canvas.height = draw.height = cursorLayer.height = canvasSize.h;
    //загрузка слоев
    layerList.forEach(layer => {
        layerArr[0].push(layer);
        layerArr[1].push(layer.getContext('2d'));
        layer.width = canvasSize.w;
        layer.height = canvasSize.h;
    })
    //заливка слоя
    setCanvasBackground(canvas_ctx);
    cPush();
});

//КНОПКИ
//отмена
undoBtn.addEventListener("click", () => {
    if (undoBtn.classList.contains('active'))
        cUndo();
});

//возврат
redoBtn.addEventListener("click", () => {
    if (redoBtn.classList.contains('active'))
        cRedo();
});

//отображение слоя
visibility.addEventListener("click", () => {
    changeVisibility();
})

//выбор слоя
layerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        changeLayers(btn.id);
    });
});

//выбор цвета
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
        pallet.parentElement.style.background = selectedColor;
        pallet.value = btn.id;
    });
});

//очистка холста
clearCanvas.addEventListener("click", () => {
    if (!clearCanvas.classList.contains('active')) return;
    (layerArr[1][selectedLayer - 1]).clearRect(0, 0, canvasSize.w, canvasSize.h);
    cPushArray = [];
    cStep = -1;
    cPush();
    redoBtn.classList.remove("active");
    undoBtn.classList.remove("active");
});

//сохранение холста
saveImg.addEventListener("click", () => {
    canvas_ctx.globalAlpha = (layerArr[0][0]).style.opacity;
    canvas_ctx.drawImage((layerArr[0][0]), 0, 0);
    canvas_ctx.globalAlpha = (layerArr[0][1]).style.opacity;
    canvas_ctx.drawImage((layerArr[0][1]), 0, 0);
    canvas_ctx.globalAlpha = (layerArr[0][2]).style.opacity;
    canvas_ctx.drawImage((layerArr[0][2]), 0, 0);
    canvas_ctx.globalAlpha = 1;

    const link = document.createElement("a");
    link.download = 'Рисунок.png'
    link.href = canvas.toDataURL();
    link.click();
    setCanvasBackground(canvas_ctx);
});

//выбор инструментов
shapeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains('active')) return;
        changeActive(shapeBtns, btn.id);
        selectedTool = btn.id;
    });
});

//SLIDERS
sizeSlider.addEventListener("change", () => brushWhidth = sizeSlider.value);//слайдер толщины кисти
alphaSlider.addEventListener("change", () => brushAlpha = alphaSlider.value);//слайдер прозрачности кисти

//слайдер прозрачности слоя
layerAlpha.addEventListener("change", () => {
    if (layerAlpha.value == 0)
        visibility.classList.remove("active");
    else
        visibility.classList.add("active");
    layerArr[2][selectedLayer - 1] = Number(layerAlpha.value);
    (layerArr[0][selectedLayer - 1]).style.opacity = layerArr[2][selectedLayer - 1];
});

//ФУНКЦИИ
//загрузка изображений
function loadImg() {
    (img.cursor.cp).src = './icons/colorPicker.png';
}

//размер и позиция холста
function canvasSizePosition() {
    canvasScale = window.innerWidth / 1500;
    document.querySelector('.main-container').style.scale = canvasScale;
    canvasPosition = canvas.getBoundingClientRect();
}

//заливка холста
function setCanvasBackground(layerBack_ctx) {
    if (layerBack_ctx === canvas_ctx) {
        backgroundColor = '#D9D9D9';
    }
    layerBack_ctx.fillStyle = backgroundColor;
    layerBack_ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
    layerBack_ctx.fillStyle = selectedColor;
}

//изменение видимости слоя
function changeVisibility() {
    if (visibility.classList.contains("active")) {
        layerArr[2][selectedLayer - 1] = 0;
        (layerArr[0][selectedLayer - 1]).style.opacity = 0;
        layerAlpha.value = 0;
    }
    else {
        layerArr[2][selectedLayer - 1] = 1;
        (layerArr[0][selectedLayer - 1]).style.opacity = 1;
        layerAlpha.value = 1;
    }
    visibility.classList.toggle("active");
}

//палитра
pallet.addEventListener("input", () => {
    pallet.parentElement.style.background = pallet.value;
    selectedColor = pallet.value;
});

//смена слоя
function changeLayers(id) {
    if (selectedLayer == id) return;

    changeActive(layerBtns, id);

    selectedLayer = id;
    layerAlpha.value = layerArr[2][selectedLayer - 1];
    if (layerArr[2][selectedLayer - 1] == 0)
        visibility.classList.remove('active');
    else
        visibility.classList.add('active');

    cPushArray = [];
    cStep = -1;
    cPush();
    undoBtn.classList.remove("active");
    redoBtn.classList.remove("active");
}

//РИСОВАНИЕ
//начало
function drawStart(e) {
    lastPoint = cursorPosition;
    draw_ctx.strokeStyle = selectedColor;
    draw_ctx.fillStyle = selectedColor;
    draw_ctx.lineWidth = brushWhidth;
    draw_ctx.lineCap = brushShape;
    draw_ctx.lineJoin = brushShape;
    draw.style.opacity = brushAlpha;

    snapShot = draw_ctx.getImageData(0, 0, canvasSize.w, canvasSize.h);
    isIdle = false;
    drawMove(e);
}

//конец
function drawEnd() {
    if (isIdle) return;
    isIdle = true;
    (layerArr[1][selectedLayer - 1]).globalAlpha = brushAlpha;
    if (selectedTool === "eraser") { (layerArr[1][selectedLayer - 1]).globalCompositeOperation = "destination-out"; }
    if (selectedTool === "colorPicker") return;
    (layerArr[1][selectedLayer - 1]).drawImage(draw, 0, 0);
    draw_ctx.clearRect(0, 0, draw.width, draw.height);
    (layerArr[1][selectedLayer - 1]).globalAlpha = 1;
    (layerArr[1][selectedLayer - 1]).globalCompositeOperation = "source-over"
    cPush();
    pointArray = [];
    changeActive(toolBtns, 'undo', 'delete');
}

//процесс
function drawMove() {
    if (isIdle) return;

    if (selectedTool === "brush" || selectedTool === "eraser") {
        draw_ctx.strokeStyle = selectedTool === "eraser" ? "#D9D9D9" : selectedColor;
        smoothBrush(cursorPosition);
        lastPoint = cursorPosition;
    } else if (selectedTool === "rectangle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        rectangle();
    } else if (selectedTool === "circle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        circle();
    } else if (selectedTool === "triangle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        triangle();
    } else if (selectedTool === "line") {
        draw_ctx.putImageData(snapShot, 0, 0);
        line();
    } else if (selectedTool === "colorPicker") {
        workSpace.addEventListener('click', () => {
            selectedColor = colorPicker();
            pallet.parentElement.style.background = selectedColor;
            pallet.value = selectedColor;
            selectedTool = 'brush';
            changeActive(shapeBtns, 'brush');
            drawCursor();
            return;
        }, { once: true })
    }
}

//сглаживание
function smoothBrush(point) {
    pointArray.push(point);
    if (pointArray.length < 2) {
        draw_ctx.beginPath();
        draw_ctx.moveTo(lastPoint.x, lastPoint.y);
        draw_ctx.lineTo(lastPoint.x, lastPoint.y);
        draw_ctx.stroke();
        snapShot = draw_ctx.getImageData(0, 0, canvasSize.w, canvasSize.h);
        return;
    }
    draw_ctx.beginPath();
    draw_ctx.moveTo(pointArray[0].x, pointArray[0].y);
    draw_ctx.putImageData(snapShot, 0, 0);

    for (var i = 1; i < pointArray.length - 2; i++) {
        var xc = (pointArray[i].x + pointArray[i + 1].x) / 2;
        var yc = (pointArray[i].y + pointArray[i + 1].y) / 2;
        draw_ctx.quadraticCurveTo(pointArray[i].x, pointArray[i].y, xc, yc);
        pointArray.shift();
        pointArray[0] = { x: xc, y: yc };
    }
    draw_ctx.stroke();
    snapShot = draw_ctx.getImageData(0, 0, canvasSize.w, canvasSize.h);
}

//линия
function line() {
    draw_ctx.beginPath();
    draw_ctx.moveTo(lastPoint.x, lastPoint.y);
    draw_ctx.lineTo(cursorPosition.x, cursorPosition.y);
    draw_ctx.stroke();
}

//прямоугольник
function rectangle() {
    draw_ctx.strokeRect(
        lastPoint.x, lastPoint.y,
        cursorPosition.x - lastPoint.x, cursorPosition.y - lastPoint.y);
}

//окружность
function circle() {
    draw_ctx.beginPath();
    let radius = Math.sqrt(Math.pow((cursorPosition.x - lastPoint.x), 2) + Math.pow((cursorPosition.y - lastPoint.y), 2));
    draw_ctx.arc(lastPoint.x, lastPoint.y, radius, 0, 2 * Math.PI);
    draw_ctx.stroke();
}

//треугольник
function triangle() {
    draw_ctx.beginPath();
    draw_ctx.moveTo(lastPoint.x, lastPoint.y);
    draw_ctx.lineTo(cursorPosition.x, cursorPosition.y);
    draw_ctx.lineTo(lastPoint.x * 2 - cursorPosition.x, cursorPosition.y);
    draw_ctx.closePath();
    draw_ctx.stroke();
}

//пипетка
function colorPicker() {
    let pixel;

    for (let i = layerArr[1].length; i > 0; i--) {
        canvas_ctx.globalAlpha = layerArr[2][layerArr[2].length - i]
        canvas_ctx.drawImage(layerArr[0][layerArr[0].length - i], 0, 0);
    }

    pixel = canvas_ctx.getImageData(cursorPosition.x, cursorPosition.y, 1, 1).data;
    let hex = "#" + ("000000" + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);
    setCanvasBackground(canvas_ctx);
    return hex;
}

//конвертация RGB в HEX
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

//прогресс
function cPush() {
    cStep++;
    if (cStep < cPushArray.length)
        cPushArray.length = cStep;
    cPushArray.push((layerArr[0][selectedLayer - 1]).toDataURL());
    if (cPushArray.length > cLimit) {
        cStep = cLimit - 1;
        cPushArray = cPushArray.slice(1);
    }
}

//отмена прогресса
function cUndo() {
    if (0 < cStep) {
        cStep--;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () {
            (layerArr[1][selectedLayer - 1]).clearRect(0, 0, canvasSize.w, canvasSize.h);
            (layerArr[1][selectedLayer - 1]).drawImage(canvasPic, 0, 0);
        }
    }
    if (cPushArray.length === 1) return;
    if (cStep === 0)
        undoBtn.classList.remove('active');
    redoBtn.classList.add('active')
}

//возврат прогресса
function cRedo() {
    if (cStep < cPushArray.length - 1) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () {
            (layerArr[1][selectedLayer - 1]).clearRect(0, 0, canvasSize.w, canvasSize.h);
            (layerArr[1][selectedLayer - 1]).drawImage(canvasPic, 0, 0);
        }
    }
    if (cPushArray.length === 1) return;
    if (cStep + 1 === cPushArray.length)
        redoBtn.classList.remove('active')
    undoBtn.classList.add('active')
}

//курсор
function drawCursor() {
    cursorLayer_ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
    if (selectedTool === 'colorPicker') {
        cursorLayer_ctx.drawImage(img.cursor.cp, cursorPosition.x - 5, cursorPosition.y - 15, 20, 20);
    } else {
        cursorLayer_ctx.beginPath();
        cursorLayer_ctx.arc(cursorPosition.x, cursorPosition.y, brushWhidth / 2, 0, 2 * Math.PI);
        cursorLayer_ctx.stroke();
    }
}

//отображение рабочей области
function workSpaceVis(flag) {
    if (isWorkSpaceVis === false) return;
    if (flag === 'on') {
        workSpace.style.background = 'green';
        return;
    }
    workSpace.style.background = 'red';
}

//смена актива
function changeActive(list, id, not) {
    list.forEach(el => {
        if (el.classList.contains('active') && el.id != not) {
            el.classList.remove('active')
            return;
        }
    })
    document.getElementById(id).classList.add("active");
}

//горячие клавиши
function check(e) {
    var code = e.keyCode;
    switch (code) {
        case 67:// c
            if (selectedTool != 'colorPicker') {
                selectedTool = "colorPicker";
                drawCursor();
                changeActive(shapeBtns, 'colorPicker');
            }
            break;

        case 90: cUndo(); break;// ctr+z
        case 89: cRedo(); break;// ctr+y

        case 66:// b
            if (selectedTool != 'brush') {
                selectedTool = "brush";
                drawCursor();
                changeActive(shapeBtns, 'brush');
            }
            break;

        case 69:// e
            if (selectedTool != 'eraser') {
                selectedTool = "eraser";
                drawCursor();
                changeActive(shapeBtns, 'eraser');
            }
            break;

        case 219:// ]
            sizeSlider.value = parseFloat(sizeSlider.value) - 5;
            brushWhidth = sizeSlider.value;
            drawCursor();
            break;

        case 221:// [
            sizeSlider.value = parseFloat(sizeSlider.value) + 5;
            brushWhidth = sizeSlider.value;
            drawCursor();
            break;

        case 188:// <
            alphaSlider.value = parseFloat(alphaSlider.value) - 0.1;
            brushAlpha = alphaSlider.value;
            break;

        case 190:// >
            alphaSlider.value = parseFloat(alphaSlider.value) + 0.1;
            brushAlpha = alphaSlider.value;
            break;

        case 49: changeLayers(1); break;// 1
        case 50: changeLayers(2); break;// 2
        case 51: changeLayers(3); break;// 3
        // case 189: zoomMin(); break;
        // case 187: zoomPlus(); break;
        // default: console.log(code);
    }
}

//EVENTS
//Изменение размера страницы
window.addEventListener("resize", function () {
    canvasSizePosition();
})

window.addEventListener('keydown', this.check, false);
workSpace.addEventListener("pointerdown", drawStart, false);
workSpace.addEventListener("pointerup", drawEnd, false);
workSpace.addEventListener("pointerout", () => {
    workSpaceVis('off');
}, false);
workSpace.addEventListener("pointermove", (e) => {
    cursorPosition = {
        x: (e.clientX - canvasPosition.left) / canvasScale,
        y: (e.clientY - canvasPosition.top) / canvasScale
    };
    workSpaceVis('on');
    drawCursor();
    drawMove();

    clearTimeout(canvasAfk);
    canvasAfk = setTimeout(() => {
        workSpaceVis('off');
    }, 200)
}, false);

//АФК
document.addEventListener('pointermove', () => {
    clearTimeout(afk);
    afk = setTimeout(() => {
        alert('Тут кто-нибудь есть?');
    }, afkTime);
}, false);