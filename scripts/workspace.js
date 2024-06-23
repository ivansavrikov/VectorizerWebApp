import {calcStartScale} from "../scripts/zooming-panning.js";
import { drawImage } from "./drawning.js";
import { transform } from "../scripts/zooming-panning.js";

export const uploadBitmapButton = document.getElementById("upload-bitmap-button");
export const vectorizeButton = document.getElementById("vectorize-button");
export const linearModeButton = document.getElementById("linear-mode-button");
export const curveModeButton = document.getElementById("curve-mode-button");
export const downloadSvgButton = document.getElementById("download-svg-button");
export const brushToolButton = document.getElementById("brush-tool-button");
export const brushColorPicker = document.getElementById("brush-color-picker");
export const brushSizeSlider = document.getElementById("brush-size-slider");
export const palettePickerToolButton = document.getElementById("pallete-picker-tool-button");
export const paletteColorPicker = document.getElementById("palette-color-picker");
export const addPaletteColorButton = document.getElementById("add-color-button");
export const detailLevelSlider = document.getElementById("detail-level-slider");
export const paletteScroll = document.getElementById('color-scroll');
export const canvas = document.getElementById("bitmap-canvas");
export const canvasVectorLayer = document.getElementById("bitmap-vector-layer");
export const svgContainer = document.getElementById("svg-container");
export const bitmapContainer = document.getElementById("bitmap-container");
export const vectorContainer = document.getElementById("vector-container");
export const palettePickerToolCursor = document.getElementById("pallete-picker-tool-cursor");
export const brushSizeCursor = document.getElementById("brush-size-cursor");
export const loadAnimation = document.getElementById("load");
export const removerTool = document.getElementById("delete-shape-tool-button");
export const cropToolButton = document.getElementById("crop-tool-button");
export const cropCursor = document.getElementById("crop-cursor");
const putToCenterButton = document.getElementById("put-to-center-button");
export let ctx = canvas.getContext('2d', { willReadFrequently: true });
export let colorsForTracing = {};
export let drawingIsActive = false;
export let palettePickerIsActive = false;
export let isRotateToolActive = false;
export let cropToolIsActive = false;
export let removerToolIsActive = false;
export let modeIsLinear = false;
export let modeIsCurve = false;

export function paletteReload(){
	paletteScroll.innerHTML = '';
	colorsForTracing = {};
	addColorItem('#ffffff');
	addColorItem('#000000');
}

function updateToolCursorColor(event){
	let color = 'white'
	const position = getPixelPosition(event);
	const imageData = ctx.getImageData(position.x, position.y, 1, 1).data;

	const brightness = (imageData[0] + imageData[1] + imageData[2])/3;
	if(brightness > 128){
		color = 'black'
	}
	return color;
}

export function getPixelPosition(event) {
	const element = event.currentTarget;
	const rect = element.getBoundingClientRect();
	const scaleX = element.width / rect.width;
	const scaleY = element.height / rect.height;

	const mouseX = (event.clientX - rect.left) * scaleX;
	const mouseY = (event.clientY - rect.top) * scaleY;

	const pixelX = Math.floor(mouseX);
	const pixelY = Math.floor(mouseY);

	return {
		x: pixelX,
		y: pixelY
	};
}

export function hexToRGBA(hex){
	hex = hex.replace(/^#/, '');
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	return [r, g, b, 255];
}

function componentToHex(c) {
	const hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function addColorItem(color){
	if (color in colorsForTracing) {
		colorsForTracing[color] += 1;
	} else {
		colorsForTracing[color] = 1;
	}
	const listItem = document.createElement('li');
	const palleteItem = document.createElement('div');
	palleteItem.className = 'palette-color-item';
	palleteItem.style.backgroundColor = color
	palleteItem.addEventListener('click', () => {
		paletteScroll.removeChild(listItem);
		if (color in colorsForTracing) {
			colorsForTracing[color] -= 1;
			if(colorsForTracing[color] == 0){
				delete colorsForTracing[color];
			}
		}
	});
	listItem.appendChild(palleteItem);
	paletteScroll.appendChild(listItem);
	paletteScroll.scrollLeft += 30;
}

function toggle(state, event){
	state = state == true ? false : true;
	if(state){
		event.currentTarget.style.backgroundColor="whitesmoke"; 
		event.currentTarget.style.color="black";
	}
	else{
		event.currentTarget.style.backgroundColor="transparent"; 
		event.currentTarget.style.color="silver";
	}
	return state;
}

function toggleUI(event){
	const toggleButtons = document.querySelectorAll('.toggle-button');
	toggleButtons.forEach(button => {
		button.classList.remove('on');
	});

	event.currentTarget.classList.add('on');
}

function changeCursorVisibility(cursor, isActive){
	if(isActive){
		canvas.style.cursor = 'none';
		cursor.classList.add("active");
	}
	else{
		cursor.classList.remove("active");
		canvas.style.cursor = "inherit";
	}
}

function addPathsListener(){
	const paths = svgContainer.querySelectorAll('path');
	paths.forEach(path => {
		path.addEventListener('click', () => {
			if(removerToolIsActive){
				path.remove();
				sessionStorage.setItem('svg', svgContainer.innerHTML)
			}
		});
	});
}

document.addEventListener("DOMContentLoaded", () => {
	addPaletteColorButton.addEventListener('click', () => addColorItem(paletteColorPicker.value));

	brushSizeSlider.addEventListener('input', () => {
		transform();
	});

	brushToolButton.addEventListener('click', (event) => {
		if(palettePickerIsActive){palettePickerToolButton.click();}
		if(cropToolIsActive){cropToolButton.click();}

		drawingIsActive = toggle(drawingIsActive, event);
		changeCursorVisibility(brushSizeCursor, drawingIsActive);

		const rect = canvas.getBoundingClientRect();
		brushSizeCursor.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
		brushSizeCursor.style.top = rect.top + window.scrollY + rect.height / 2 + "px";
	});

	palettePickerToolButton.addEventListener('click', (event) => {
		if(drawingIsActive){brushToolButton.click();}
		if(cropToolIsActive){cropToolButton.click();}
		palettePickerIsActive = toggle(palettePickerIsActive, event);
		changeCursorVisibility(palettePickerToolCursor, palettePickerIsActive);

		const rect = canvas.getBoundingClientRect();
		palettePickerToolCursor.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
		palettePickerToolCursor.style.top = rect.top + window.scrollY + rect.height / 2 + "px";
	});

	canvas.addEventListener('mousemove', (event) => {
		if(palettePickerIsActive){
			const position = getPixelPosition(event);
			const imageData = ctx.getImageData(position.x, position.y, 1, 1).data;
			// const a = imageData[3] / 255;
			let hex = rgbToHex(imageData[0], imageData[1], imageData[2]);
			paletteColorPicker.value = hex;
			previewColorLabel.style.backgroundColor = previewColorPicker.value;
		}
		palettePickerToolCursor.style.left = event.clientX + "px";
		palettePickerToolCursor.style.top = event.clientY + "px";
		
		brushSizeCursor.style.left = event.clientX + "px";
		brushSizeCursor.style.top = event.clientY + "px";
		brushSizeCursor.style.border = `solid 1px ${updateToolCursorColor(event)}`;

		cropCursor.style.left = event.clientX + "px";
		cropCursor.style.top = event.clientY + "px";
	});

	canvas.addEventListener('click', () => {
		if(palettePickerIsActive){
			addColorItem(paletteColorPicker.value);
		}
	});

	cropToolButton.addEventListener('click', (event) => {
		if(drawingIsActive){brushToolButton.click();}
		if(palettePickerIsActive){palettePickerToolButton.click();}

		cropToolIsActive = toggle(cropToolIsActive, event);
		changeCursorVisibility(cropCursor, cropToolIsActive);

		const rect = canvas.getBoundingClientRect();
		cropCursor.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
		cropCursor.style.top = rect.top + window.scrollY + rect.height / 2 + "px";
	});

	removerTool.addEventListener('click', (event) => {
		removerToolIsActive = toggle(removerToolIsActive, event);
		const paths = svgContainer.querySelectorAll('path');
		paths.forEach(path => {
			if (removerToolIsActive) {
				path.classList.add('hover-enabled');
				addPathsListener();
			} else {
				path.classList.remove('hover-enabled');
			}
		});
	});
});

window.addEventListener('load', () => {
	linearModeButton.addEventListener('click', (event) => {
		modeIsLinear = true;
		modeIsCurve = false;
		toggleUI(event);
	})
	curveModeButton.addEventListener('click', (event) => {
		modeIsCurve = true;
		modeIsLinear = false;
		toggleUI(event);
	})

	curveModeButton.click();

	window.addEventListener('paste', (event) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();

                reader.onload = (event) => {
					const image = new Image();
					image.src = event.target.result;
					image.onload = () => {
						drawImage(image);
						paletteReload();
						sessionStorage.setItem('svg', "")

						svgContainer.innerHTML = "";
					};
                };

                reader.readAsDataURL(blob);
                break;
            }
        }
    });

	const image = new Image();
	image.src = sessionStorage.getItem("bitmap");
	image.onload = () => {
		if(image){
			const svgData = sessionStorage.getItem("svg");
			if (svgData) {
				svgContainer.innerHTML = svgData;
			}

			drawImage(image);
		}
	};

	putToCenterButton.addEventListener('click', () => {
		calcStartScale(bitmapContainer, canvas);
	});
});