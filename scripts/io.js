import {
	bitmapContainer,
	canvas,
	svgContainer,
	colorsForTracing,
	uploadBitmapButton,
	vectorizeButton,
	downloadSvgButton,
	detailLevelSlider,
} from "../scripts/workspace.js"

import { calcStartScale, transfromReset } from "./zooming-panning.js";

export async function traceOnServer(file, jsonColors, detailing) {
	const formData = new FormData();
	formData.append("file", file, "image.png");
	formData.append("colors", jsonColors)
	formData.append("detailing", detailing);

	try {
		const response = await fetch("http://127.0.0.1:8000/tracer/", {
			method: "POST",
			body: formData,
		});
		const svgData = await response.text();
		sessionStorage.setItem("svgOutput", svgData);
		return svgData;
	} catch (error) {
		console.error("Ошибка при отправке изображения:", error);
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
        canvas.width = inputImage.width;
        canvas.height = inputImage.height;
        ctx.drawImage(inputImage, 0, 0);
        calcStartScale(bitmapContainer, canvas);
      };

      inputImage.src = img.src;
      transfromReset();

	  svgContainer.innerHTML = "";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});


//vectorization and display vector
vectorizeButton.addEventListener("click", () => {
  canvas.toBlob(function (blob) {
	let detailing = detailLevelSlider.value * -1;

	let colors = Object.keys(colorsForTracing);
	let jsonColors = JSON.stringify(colors);

	if(colors.length == 0){
		alert("Палитра не может быть пустой, добавьте цветов");
		return;
	}

    traceOnServer(blob, jsonColors, detailing)
    .then((svgData) => {
        // vectorViewer.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
		svgContainer.innerHTML = svgData;
      })
      .catch((error) => {
        console.error("Ошибка при получении SVG:", error);
      });;
  });
});


//saving
downloadSvgButton.addEventListener("click", () => saveSVG());
function saveSVG(file) {
  const link = document.createElement("a");
//   const svg = vectorViewer.src;

//   const svgContent = svgContainer.innerHTML;
  let svgContent = sessionStorage.getItem("svgOutput");
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  link.href = URL.createObjectURL(blob);
  link.download = "result.svg";
  link.click();
}

// const colorPicker = document.getElementById('colorPicker');
// colorPicker?.addEventListener('input', function(event) {
//   const selectedColor = event.target.value;
//   svgContainer.style.backgroundColor = selectedColor;
// });

// svgInput?.addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     if (file && file.type === 'image/svg+xml') {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const svgContent = e.target.result;
//             svgContainer.innerHTML = svgContent;
// 			sessionStorage.setItem("svgOutput", svgContent)
//         };
//         reader.readAsText(file);
//     } else {
//         alert('Please upload a valid SVG file.');
//     }
// });