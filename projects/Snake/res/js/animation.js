console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#486';
animation.append(canvas);

console.log(animation, canvas);

function showFPS (ctx, fps) {
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#000';
	ctx.fillRect(0, 0, 42, 22);
	ctx.strokeRect(0, 0, 42, 22);

	ctx.font = '18px Arial';
	ctx.textAlign = 'left';
	ctx.textBasline = 'hanging';
	ctx.fillStyle = '#000';
	ctx.fillText((Math.round(fps * 10) / 10).toFixed(1), 3, 18);
}

function draw (ctx) {
	const transform = ctx.getTransform();

	canvas.clear();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	//
	ctx.setTransform(transform);
	showFPS(ctx, animation.fps);
}

function update (dt) {
	
}

animation.loop = update;
canvas.renderer = draw;

function resize () {
	const parent = canvas.domElement.parentElement;
	canvas.resize(parent.offsetWidth, parent.offsetHeight);
	canvas.draw();
}

window.addEventListener('load', () => {
	resize();
	animation.play();
});
window.addEventListener('resize', resize);
window.addEventListener('keydown', (event) => {
	if (event.code == 'Space') {
		if (animation.isPaused) {
			animation.play();
		} else {
			animation.pause();
		}
	} else if (event.code == 'ArrowUp' && game.dir != 2) {
		game.dir = 0;
	} else if (event.code == 'ArrowDown' && game.dir != 0) {
		game.dir = 2;
	} else if (event.code == 'ArrowRight' && game.dir != 1) {
		game.dir = 3;
	} else if (event.code == 'ArrowLeft' && game.dir != 3) {
		game.dir = 1;
	}
});
