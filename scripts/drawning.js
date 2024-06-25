import { 
	canvas,
	ctx,
	canvasVectorLayer,
	bitmapContainer,
	svgContainer,
	brushColorPicker,
	brushToolButton,
	brushSizeSlider,
	getPixelPosition, 
	hexToRGBA,
	drawingIsActive,
} from "../scripts/workspace.js";

import { calcStartScale } from "./zooming-panning.js";

export function drawImage(image){
	sessionStorage.setItem('bitmap', image.src);

	canvas.width = image.width;
	canvas.height = image.height;
	ctx.drawImage(image, 0, 0);
	canvasVectorLayer.setAttribute('width', canvas.width);
	canvasVectorLayer.setAttribute('height', canvas.height);

	calcStartScale(bitmapContainer, canvas);
}

document.addEventListener("DOMContentLoaded", () => {
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	let drawingIsStart = false;
	let selectedColor = hexToRGBA(brushColorPicker.value);

	canvas.addEventListener('mousedown', (event) => {
		drawingIsStart = true;
		draw(event);
	});

	canvas.addEventListener('mousemove', (event) => {
		if(drawingIsStart){
			draw(event);
		}
	});

	canvas.addEventListener('mouseup', () => drawingIsStart = false)

	brushColorPicker.addEventListener('input', () => {
		selectedColor = hexToRGBA(brushColorPicker.value);
	});

	function draw(event){
        if (drawingIsActive) {
            const pixelPosition = getPixelPosition(event);
            const imageData = ctx.createImageData(brushSizeSlider.value, brushSizeSlider.value);
			fillImageData(imageData, selectedColor)

			pixelPosition.x = pixelPosition.x - brushSizeSlider.value/2 + 1;
			pixelPosition.y = pixelPosition.y - brushSizeSlider.value/2 + 1;
            ctx.putImageData(imageData, pixelPosition.x, pixelPosition.y);
        }
	}
	
	function fillImageData(imageData, color) {
		// Проходим по всем пикселям изображения и устанавливаем им цвет
		for (let i = 0; i < imageData.data.length; i += 4) {
			imageData.data[i] = color[0];     // Красный
			imageData.data[i + 1] = color[1]; // Зеленый
			imageData.data[i + 2] = color[2]; // Синий
			imageData.data[i + 3] = color[3]; // Альфа
		}
	}
})