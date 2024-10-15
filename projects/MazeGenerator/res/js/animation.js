console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#000';
animation.append(canvas);

let map = new MazeMap(10, 10);
let frames = 0;
let frameSpeed = 2;
let drawMode = 'maze';
let gridSizeInputBlurByKeyDown = false;

console.log(animation, canvas, map);

function draw (ctx) {
	const transform = ctx.getTransform();

	canvas.clear();

	if (drawMode == 'maze') {
		map.draw(ctx);
	} else {
		map.drawGridMap(ctx);
	}

	ctx.setTransform(transform);
}

function update (dt) {
	map.update();
}

animation.loop = update;
canvas.renderer = draw;

function resize () {
	const parent = canvas.domElement.parentElement;
	canvas.resize(parent.offsetWidth, parent.offsetHeight);
	map.resize(parent.offsetWidth, parent.offsetHeight);
	canvas.draw();
}

function changeMazeSize (size) {
	if (size < 2 || size > 50) {
		console.warn('size is not match: ', size);
		return;
	}

	map = new MazeMap(size, size);
	resize();
}

window.addEventListener('load', () => {
	resize();
	animation.play();
	
	document.getElementById('map-mode-btn').addEventListener('click', (event) => {
		if (drawMode == 'grid') {
			event.target.textContent = 'Change Map Mode To Grid';
			drawMode = 'maze';
		} else {
			event.target.textContent = 'Change Map Mode To Maze';
			drawMode = 'grid';
		}
	});

	document.getElementById('mode-btn').addEventListener('click', (event) => {
		map.animate = !map.animate;

		if (map.animate) {
			event.target.textContent = 'Change Generator Mode To Normal';
		} else {
			event.target.textContent = 'Change Generator Mode To Animate';
		}
	});
	
	document.getElementById('gen-btn').addEventListener('click', () => {
		map.start();
	});

	document.getElementById('save-btn').addEventListener('click', () => {
		if (map.generated) {
			const w = map.cellSize * map.cols;
			const h = map.cellSize * map.rows;

			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = w;
			tempCanvas.height = h;
			const tempCtx = tempCanvas.getContext('2d');

			tempCtx.drawImage(canvas.domElement, map.x, map.y, w, h, 0, 0, w, h);

			const croppedImage = tempCanvas.toDataURL('image/png');

			const link = document.createElement('a');
			link.href = croppedImage;
			link.download = drawMode + '.png';
			link.click();
		} else {
			alert('The Maze is still generating or hasn\'t started to generate yet!');
		}
	});

	document.getElementById('get-data-btn').addEventListener('click', () => {
		const viewer = document.getElementById('data-viewer');
		const codeCont = viewer.querySelector('.code');
		viewer.classList.remove('hide');
		
		const pre = document.createElement('pre');
		const code = document.createElement('code');

		code.textContent = map.getData(drawMode);

		pre.appendChild(code);
		
		codeCont.innerHTML = '';
		codeCont.appendChild(pre);
	});

	document.getElementById('viewer-close-btn').addEventListener('click', () => {
		document.getElementById('data-viewer').classList.add('hide');
	});

	document.getElementById('grid-size-input').addEventListener('blur', (event) => {
		if (gridSizeInputBlurByKeyDown) {
			gridSizeInputBlurByKeyDown = false;
			return;
		}

		changeMazeSize(event.target.value * 1);
	});

	document.getElementById('grid-size-input').addEventListener('keydown', (event) => {
		if (event.code == 'Enter') {
			changeMazeSize(event.target.value * 1);
			gridSizeInputBlurByKeyDown = true;
			event.target.blur();
		}
	});
});
window.addEventListener('resize', resize);
window.addEventListener('keydown', (event) => {
	if (event.code == 'Space') {
		if (animation.isPaused) {
			animation.play();
		} else {
			animation.pause();
		}
	}
});
