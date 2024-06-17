import {
	canvas,
	canvasVectorLayer,
	ctx,
	cropToolIsActive,
	cropToolButton,
	svgContainer,
} from "../scripts/workspace.js"
import { calcStartScale } from "./zooming-panning.js";

let lassoPoints = [];
let polygonPoints = [];
const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
polygon.setAttribute('stroke', 'blue');
polygon.setAttribute('stroke-width', '2');
polygon.setAttribute('stroke-opacity', '0.5');
polygon.setAttribute('fill', 'blue');
polygon.setAttribute('fill-opacity', '0')
polygon.setAttribute('pointer-events', 'none');
canvasVectorLayer.appendChild(polygon);

canvas.addEventListener('mousedown', (event) => {
	if (cropToolIsActive){
		const x = event.offsetX;
		const y = event.offsetY;
		lassoPoints.push({ x, y });
        if (lassoPoints.length >= 2){
			drawLine(lassoPoints[lassoPoints.length - 2], lassoPoints[lassoPoints.length - 1]);
		}
	}
});

cropToolButton.addEventListener('click', () => {
	if(cropToolIsActive){
		croppingReset();
	}
});

export function croppingReset() {
	polygonPoints = [];
	lassoPoints = [];
	polygon.setAttribute('points', "");
}

function drawLine(start, end) {
	if (polygonPoints.length === 0) {
		polygonPoints.push(`${start.x},${start.y}`);
	}
	polygonPoints.push(`${end.x},${end.y}`);
	polygon.setAttribute('points', polygonPoints.join(' '));

	if (Math.abs(lassoPoints[0].x - end.x) <= 2 && Math.abs(lassoPoints[0].y - end.y) <= 2){
		if (lassoPoints.length > 2) {
			crop();
			cropToolButton.click();
			croppingReset();
		}
		polygon.setAttribute('fill-opacity', '0.5');
	} else {
		polygon.setAttribute('fill-opacity', '0');
	}
}

//FIXME: остаются следы от предыдщуего выделения
export function crop() {
    let minX = lassoPoints[0].x;
    let minY = lassoPoints[0].y;
    let maxX = lassoPoints[0].x;
    let maxY = lassoPoints[0].y;

    for (let i = 1; i < lassoPoints.length; i++) {
        let point = lassoPoints[i];
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
    }

    let rectWidth = maxX - minX;
    let rectHeight = maxY - minY;

    let selectionRectangle = {
        x: minX,
        y: minY,
        width: rectWidth,
        height: rectHeight,
        imageData: null
    };

	const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
        ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(tempCanvas, 0, 0);

    selectionRectangle.imageData = ctx.getImageData(minX, minY, rectWidth, rectHeight);

    tempCanvas.width = rectWidth;
    tempCanvas.height = rectHeight;

    tempCtx.translate(-minX, -minY);
    tempCtx.drawImage(canvas, minX, minY, rectWidth, rectHeight, 0, 0, rectWidth, rectHeight);

    canvas.width = rectWidth;
    canvas.height = rectHeight;
	canvasVectorLayer.setAttribute('width', canvas.width);
	canvasVectorLayer.setAttribute('height', canvas.height);
    ctx.putImageData(selectionRectangle.imageData, 0, 0);
	calcStartScale(canvas.parentElement, canvas);
	
	//TODO: решить с местом хранением svg
	svgContainer.innerHTML = "";
}