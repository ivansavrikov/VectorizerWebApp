import {
	canvas,
	canvasVectorLayer,
	ctx,
	cropToolIsActive,
	cropToolButton,
	svgContainer,
} from "../scripts/workspace.js"
import { drawImage } from "./drawning.js";
import { calcStartScale } from "./zooming-panning.js";

let lassoPoints = [];
let polygonPoints = [];
export const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
polyline.setAttribute('stroke', 'blue');
polyline.setAttribute('stroke-width', '0.5');
polyline.setAttribute('stroke-opacity', '1');
polyline.setAttribute('fill', 'blue');
polyline.setAttribute('fill-opacity', '0')
polyline.setAttribute('pointer-events', 'none');
canvasVectorLayer.appendChild(polyline);

const previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
previewLine.setAttribute('stroke', 'blue');
previewLine.setAttribute('stroke-width', '0.5');
canvasVectorLayer.appendChild(previewLine);

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

canvas.addEventListener('mousemove', (event) => {
	if (cropToolIsActive && lassoPoints.length > 0){
		const lastPoint = lassoPoints[lassoPoints.length - 1];
		const x = event.offsetX;
		const y = event.offsetY;

		previewLine.setAttribute('x1', lastPoint.x);
		previewLine.setAttribute('y1', lastPoint.y);
		previewLine.setAttribute('x2', x);
		previewLine.setAttribute('y2', y);
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
	polyline.setAttribute('points', "");
	previewLine.setAttribute('x1', 0);
	previewLine.setAttribute('y1', 0);
	previewLine.setAttribute('x2', 0);
	previewLine.setAttribute('y2', 0);
}

function drawLine(start, end) {
	if (polygonPoints.length === 0) {
		polygonPoints.push(`${start.x},${start.y}`);
	}
	polygonPoints.push(`${end.x},${end.y}`);
	polyline.setAttribute('points', polygonPoints.join(' '));

	if (Math.abs(lassoPoints[0].x - end.x) <= 2 && Math.abs(lassoPoints[0].y - end.y) <= 2){
		if (lassoPoints.length > 2) {
			crop();
			cropToolButton.click();
			croppingReset();
		}
		polyline.setAttribute('fill-opacity', '0.5');
	} else {
		polyline.setAttribute('fill-opacity', '0');
	}
}

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
	
	const dataURL = canvas.toDataURL('image/png');
	const image = new Image();
	image.src = dataURL;
	image.onload = () => {
		sessionStorage.setItem("svg", "");
		drawImage(image);
	};

	svgContainer.innerHTML = "";
}