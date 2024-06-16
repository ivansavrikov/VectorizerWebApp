import {scale, transform} from "../scripts/zooming-panning.js";

export const uploadBitmapButton = document.getElementById("upload-bitmap-button");
export const vectorizeButton = document.getElementById("vectorize-button");
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
export const svgContainer = document.getElementById("svg-container");
export const bitmapContainer = document.getElementById("bitmap-container");
export const vectorContainer = document.getElementById("vector-container");
export const palettePickerToolCursor = document.getElementById("pallete-picker-tool-cursor");
export const brushSizeCursor = document.getElementById("brush-size-cursor");
// export const el = document.getElementById("");

export let colorsForTracing = {};

export let drawingIsActive = false;
export let palettePickerIsActive = false;
export const ctx = canvas.getContext('2d', { willReadFrequently: true });

export function getPixelPosition(event) {
	const element = event.currentTarget;
	const rect = element.getBoundingClientRect();
	const scaleX = element.width / rect.width;
	const scaleY = element.height / rect.height;

	const mouseX = (event.clientX - rect.left) * scaleX;
	const mouseY = (event.clientY - rect.top) * scaleY;

	const pixelX = Math.floor(mouseX);
	const pixelY = Math.floor(mouseY);
	
	console.log(scaleX, scaleY);

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

document.addEventListener("DOMContentLoaded", () => {
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

	addColorItem('#ffffff');
	addColorItem('#000000');
	addPaletteColorButton.addEventListener('click', () => addColorItem(paletteColorPicker.value));

	function toggle(state, event){
		state = state == true ? false : true;
		if(state){event.currentTarget.style.backgroundColor="whitesmoke"}
		else{event.currentTarget.style.backgroundColor="transparent"}
		return state;
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

	brushSizeSlider.addEventListener('input', () => {
		transform();
	});

	brushToolButton.addEventListener('click', (event) => {
		if(palettePickerIsActive){palettePickerToolButton.click();}
		drawingIsActive = toggle(drawingIsActive, event);
		changeCursorVisibility(brushSizeCursor, drawingIsActive);

		const rect = canvas.getBoundingClientRect();
		brushSizeCursor.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
		brushSizeCursor.style.top = rect.top + window.scrollY + rect.height / 2 + "px";
	});

	palettePickerToolButton.addEventListener('click', (event) => {
		if(drawingIsActive){brushToolButton.click();}
		palettePickerIsActive = toggle(palettePickerIsActive, event);
		changeCursorVisibility(palettePickerToolCursor, palettePickerIsActive);

		const rect = canvas.getBoundingClientRect();
		palettePickerToolCursor.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
		palettePickerToolCursor.style.top = rect.top + window.scrollY + rect.height / 2 + "px";
	});

	// canvas.addEventListener('mouseover', () => {
	// 	// changeCursorVisibility(palettePickerToolCursor, palettePickerIsActive);
	// 	// changeCursorVisibility(brushSizeCursor, drawingIsActive);
	// });

	canvas.addEventListener('mouseleave', () => {
		// brushToolButton.click();
		if(palettePickerIsActive){
			palettePickerToolButton.click();
		}
		if(drawingIsActive){
			brushToolButton.click();
		}
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
	});

	canvas.addEventListener('click', () => {
		if(palettePickerIsActive){
			addColorItem(paletteColorPicker.value);
		}
	});
});