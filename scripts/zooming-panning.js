import {
	canvas,
	canvasVectorLayer,
	svgContainer,
	bitmapContainer,
	vectorContainer,
	drawingIsActive,
	brushSizeCursor,
	palettePickerIsActive,
	cropToolIsActive,
} from "../scripts/workspace.js";

let isDragging = false;
	
let minScale = 0.15;
let maxScale = 50;
const zoomSpeed = 0.2;
let offsetX = 0;
let offsetY = 0;
let startX = 0;
let startY = 0;

export function transfromReset(){
	scale = 1;
	offsetX = 0;
	offsetY = 0;
	transform();
}

export function transform() {
	const scaledBrushSize = brushSizeSlider.value * scale;
	brushSizeCursor.style.width = `${scaledBrushSize}px`;
	brushSizeCursor.style.height = `${scaledBrushSize}px`;

	canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
	svgContainer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
	canvasVectorLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

export let scale = 1;

export function calcStartScale(container, element){
	scale = Math.min(
		container.clientWidth / element.width,
		container.clientHeight / element.height
	);

	offsetX = (container.clientWidth - element.width * scale) / 2;
    offsetY = (container.clientHeight - element.height * scale) / 2;

	transform();
}

document.addEventListener('DOMContentLoaded', () => {

	bitmapContainer.addEventListener("wheel", handleZoom);
	bitmapContainer.addEventListener("mousedown", startDrag);
	bitmapContainer.addEventListener("mousemove", handleDrag);
	bitmapContainer.addEventListener("mouseup", stopDrag);
	bitmapContainer.addEventListener("mouseleave", stopDrag);

	vectorContainer.addEventListener("wheel", handleZoom);
	vectorContainer.addEventListener("mousedown", startDrag);
	vectorContainer.addEventListener("mousemove", handleDrag);
	vectorContainer.addEventListener("mouseup", stopDrag);
	vectorContainer.addEventListener("mouseleave", stopDrag);

	function getMousePosition(event){
		const element = event.currentTarget;
		const rect = element.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		return {x: x, y: y};
	}

	function handleZoom(event){
		event.preventDefault();
		const prevScale = scale;

		scale += event.deltaY > 0 ? -zoomSpeed*scale : zoomSpeed*scale;
		scale = Math.min(Math.max(minScale, scale), maxScale);

		const mouse = getMousePosition(event);

		offsetX = mouse.x - (mouse.x - offsetX) * (scale / prevScale);
		offsetY = mouse.y - (mouse.y - offsetY) * (scale / prevScale);

		transform();
	}

	function startDrag(event){
		if(drawingIsActive || palettePickerIsActive || cropToolIsActive){
			isDragging = false; 
			return;
		}

		isDragging = true;

		const mouse = getMousePosition(event);
		startX = mouse.x;
		startY = mouse.y;

		event.currentTarget.style.cursor = "grab";
	}

	function handleDrag(event){
		if (!isDragging) return;

		const mouse = getMousePosition(event);
		offsetX += (mouse.x - startX) * (1 / scale) * scale;
		offsetY += (mouse.y - startY) * (1 / scale) * scale;
	  
		startX = mouse.x;
		startY = mouse.y;

		transform();
	}

	function stopDrag(event){
		isDragging = false
		event.currentTarget.style.cursor = 'pointer';
	}
})