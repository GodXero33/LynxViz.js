console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#000';
animation.append(canvas);

const string = new String(0, 0, 490, 200, 50);

console.log(animation, canvas, string);

function draw (ctx) {
	const transform = ctx.getTransform();

	canvas.clear();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	string.draw(ctx);
	
	ctx.setTransform(transform);
	showFPS(ctx, animation.fps);
}

function update (dt) {
	string.update();
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
