console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#fff';
animation.append(canvas);

const diff = new ReactionDiffusion(600, 600);

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
	canvas.clear();
	diff.draw(ctx);
	//showFPS(ctx, animation.fps);
}

function update (dt) {
	diff.update();
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
