
const textarea = document.getElementById('textarea');
const imageSvg = document.getElementById('image-svg');
const vectorViewArea = document.getElementById('vector-editor-view-area');
const vectorContainer = document.getElementById('vector-container');
const putToCenterButton = document.getElementById('put-to-center-button');

let isDragging = false;
export let scale = 1;	
let minScale = 0.15;
let maxScale = 50;
const zoomSpeed = 0.2;
let offsetX = 0;
let offsetY = 0;
let startX = 0;
let startY = 0;

window.addEventListener('load', function() {
    const svgData = sessionStorage.getItem("svg");
    if (svgData) {
        textarea.value = svgData;
        imageSvg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
		

		imageSvg.addEventListener('load', () => {
			calcStartScale(vectorViewArea, vectorContainer);
		});
    }

	putToCenterButton.addEventListener('click', () => {
		calcStartScale(vectorViewArea, vectorContainer);
	})
});

export function transfromReset(){
	scale = 1;
	offsetX = 0;
	offsetY = 0;
	transform();
}

export function transform() {
	vectorContainer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

export function calcStartScale(container, element){
	scale = Math.min(
		container.clientWidth / element.clientHeight,
		container.clientHeight / element.clientHeight
	);

	offsetX = (container.clientWidth - element.clientWidth * scale) / 2;
    offsetY = (container.clientHeight - element.clientHeight * scale) / 2;

	transform();
}

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

// textarea.value = sessionStorage.getItem("svg");
// imageSvg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sessionStorage.getItem("svg"));

textarea.addEventListener('keydown', function(e) {
	if (e.key === 'Tab') {
		e.preventDefault();
		
		const textarea = this;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const value = textarea.value;

		if (e.shiftKey) {
			if (start !== end) {
				const beforeSelection = value.substring(0, start);
				const selection = value.substring(start, end);
				const afterSelection = value.substring(end);
				
				const dedentedSelection = selection.split('\n').map(line => {
					return line.startsWith('\t') ? line.substring(1) : line;
				}).join('\n');
				
				textarea.value = beforeSelection + dedentedSelection + afterSelection;
				
				textarea.selectionStart = start;
				textarea.selectionEnd = start + dedentedSelection.length;
			} else {
				const beforeCursor = value.substring(0, start);
				const afterCursor = value.substring(start);
				
				if (beforeCursor.endsWith('\t')) {
					textarea.value = beforeCursor.slice(0, -1) + afterCursor;
					textarea.selectionStart = textarea.selectionEnd = start - 1;
				}
			}
		} else {
			if (start !== end) {
				const beforeSelection = value.substring(0, start);
				const selection = value.substring(start, end);
				const afterSelection = value.substring(end);
				
				const indentedSelection = selection.split('\n').map(line => '\t' + line).join('\n');
				
				textarea.value = beforeSelection + indentedSelection + afterSelection;
			
				textarea.selectionStart = start;
				textarea.selectionEnd = start + indentedSelection.length;
			} else {
				const beforeCursor = value.substring(0, start);
				const afterCursor = value.substring(start);
				
				textarea.value = beforeCursor + '\t' + afterCursor;
				textarea.selectionStart = textarea.selectionEnd = start + 1;
			}
		}
	}
});

textarea.addEventListener('input', () => {
	let xml = textarea.value;
	imageSvg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
	sessionStorage.setItem("svg", xml);
});

vectorViewArea.addEventListener("wheel", handleZoom);
vectorViewArea.addEventListener("mousedown", startDrag);
vectorViewArea.addEventListener("mousemove", handleDrag);
vectorViewArea.addEventListener("mouseup", stopDrag);
vectorViewArea.addEventListener("mouseleave", stopDrag);