console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#000';
animation.append(canvas);

console.log(animation, canvas);

function draw (ctx) {
	const transform = ctx.getTransform();

	canvas.clear();
	showFPS(ctx, animation.fps);

	// Draw
	ctx.translate(canvas.width / 2, canvas.height / 2);
	drawBall(ctx);

	ctx.setTransform(transform);
}

function update (dt) {
	updateBall(dt);
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
	}
});
