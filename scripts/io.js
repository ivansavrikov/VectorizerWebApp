import {
	bitmapContainer,
	canvas,
	canvasVectorLayer,
	svgContainer,
	colorsForTracing,
	uploadBitmapButton,
	vectorizeButton,
	downloadSvgButton,
	detailLevelSlider,
	loadAnimation,
	modeIsCurve,
	modeIsLinear,
} from "../scripts/workspace.js"

import { drawImage } from "./drawning.js";

import { calcStartScale, transfromReset } from "./zooming-panning.js";

import { paletteReload } from "../scripts/workspace.js";

export async function traceOnServer(file, jsonColors, detailing, mode) {
	const formData = new FormData();
	formData.append("file", file, "image.png");
	formData.append("colors", jsonColors)
	formData.append("detailing", detailing);
	formData.append("mode", mode)

	try {
		const response = await fetch("http://127.0.0.1:8000/tracer/", {
			method: "POST",
			body: formData,
		});
		const svgData = await response.text();
		sessionStorage.setItem("svg", svgData);
		return svgData;
	} catch (error) {
		console.error("Ошибка при отправке изображения:", error);
		alert(`Извините ваше изображение слишком большое, попробуйте выделить главное`);
	}
}

const workSpaces = document.querySelectorAll(".workspace");
workSpaces.forEach((element) => {
  element.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
});

const ctx = canvas.getContext("2d");
export let inputImage = new Image();

//open and display raster image
uploadBitmapButton.addEventListener("input", function (event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.onload = function () {
      inputImage.onload = function () {
		sessionStorage.setItem("bitmap", inputImage.src);
		drawImage(inputImage);
		paletteReload();
      };

      inputImage.src = img.src;
      transfromReset();

	  svgContainer.innerHTML = "";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
});


//vectorization and display vector
vectorizeButton.addEventListener("click", () => {
	canvas.toBlob(function (blob) {
		let detailing = detailLevelSlider.value * -1;

		let colors = Object.keys(colorsForTracing);
		let jsonColors = JSON.stringify(colors);

		let mode = 1;
		if(modeIsLinear){mode=1}
		if(modeIsCurve){mode=2}

		if(colors.length <= 1){
			alert("Палитра должна содержать мимимум 2 разных цвета, используйте pick или add");
			return;
		}

		svgContainer.innerHTML = "";
		loadAnimation.style.display = 'block';

		traceOnServer(blob, jsonColors, detailing, mode)
		.then((svgData) => {
			svgContainer.innerHTML = svgData;
			loadAnimation.style.display = 'none';
		})
		.catch((error) => {
			console.error("Ошибка при получении SVG:", error);
			loadAnimation.style.display = 'none';
			alert("Палитра должна содержать мимимум 2 разных цвета, используйте pick или add");
		});;
	});
});


//saving
downloadSvgButton.addEventListener("click", () => saveSVG());
function saveSVG(file) {
  const link = document.createElement("a");
  let svgContent = sessionStorage.getItem("svg");
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  link.href = URL.createObjectURL(blob);
  link.download = "result.svg";
  link.click();
}