console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#000';
animation.append(canvas);

let gridMap, pathFinder;

console.log(animation, canvas);

function draw (ctx) {
	canvas.clear();

	if (!gridMap) return;

	gridMap.draw(ctx);
	pathFinder.draw(ctx);
}

function update (dt) {
	if (!pathFinder) return;

	pathFinder.update();
}

animation.loop = update;
canvas.renderer = draw;

function resize () {
	const parent = canvas.domElement.parentElement;
	canvas.resize(parent.offsetWidth, parent.offsetHeight);
	
	if (gridMap) {
		gridMap.resize(parent.offsetWidth, parent.offsetHeight);
		pathFinder.resize(parent.offsetWidth, parent.offsetHeight);
	}

	canvas.draw();
}

window.addEventListener('load', () => {
	resize();
	animation.play();
	
	document.getElementById('add-data-btn').addEventListener('click', () => {
		document.getElementById('data-viewer').classList.remove('hide');
	});

	document.getElementById('viewer-close-btn').addEventListener('click', () => {
		let data = document.getElementById('data-input').value;
		document.getElementById('data-viewer').classList.add('hide');

		data = JSON.parse(data);

		if (!data || data.meta.mode != 'grid-map') {
			console.error('Invalid map data');
			return;
		}

		const grid = data.grid;

		if (gridMap) {
			gridMap.updateMap(grid);
			pathFinder.updateMap(grid);
		} else {
			gridMap = new GridMap(grid);
			pathFinder = new PathFinder(grid);
		}

		console.log(gridMap, pathFinder);
		resize();
	});

	document.getElementById('mode-btn').addEventListener('click', (event) => {
		if (!pathFinder) return;

		pathFinder.animate = !pathFinder.animate;

		if (pathFinder.animate) {
			event.target.textContent = 'Change Finder Mode To Normal';
		} else {
			event.target.textContent = 'Change Finder Mode To Animate';
		}
	});

	document.getElementById('find-btn').addEventListener('click', () => {
		if (pathFinder) {
			pathFinder.init();
		}
	});

	document.getElementById('save-btn').addEventListener('click', () => {
		if (!pathFinder) return;

		if (pathFinder.found) {
			const data = pathFinder.getPath(true);
			const blob = new Blob([data], { type: 'application/json' });
			const link = document.createElement('a');

			link.href = URL.createObjectURL(blob);
			link.download = 'path_data.json';
			link.click();
		} else {
			alert('The path is still finding or hasn\'t started to find yet!');
		}
	});

	document.getElementById('img-save-btn').addEventListener('click', () => {
		if (!pathFinder) return;

		if (pathFinder.found) {
			const w = gridMap.cellSize * gridMap.cols;
			const h = gridMap.cellSize * gridMap.rows;

			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = w;
			tempCanvas.height = h;
			const tempCtx = tempCanvas.getContext('2d');

			tempCtx.drawImage(canvas.domElement, gridMap.x, gridMap.y, w, h, 0, 0, w, h);

			const croppedImage = tempCanvas.toDataURL('image/png');

			const link = document.createElement('a');
			link.href = croppedImage;
			link.download = 'path.png';
			link.click();
		} else {
			alert('The path is still finding or hasn\'t started to find yet!');
		}
	});

	document.getElementById('diagonal-btn').addEventListener('click', (event) => {
		pathFinder.diagonal = !pathFinder.diagonal;

		if (pathFinder.diagonal) {
			event.target.textContent = 'Diagonal Off';
		} else {
			event.target.textContent = 'Diagonal On';
		}

		pathFinder.updateMap(gridMap.grid);
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
