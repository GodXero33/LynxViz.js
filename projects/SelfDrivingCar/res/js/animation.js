console.log(LynxViz);

const animation = LynxViz.createAnimation({ fps: 60 });
const canvas = LynxViz.createCanvas();

canvas.setParent(document.getElementById('canvas-container'));
canvas.clearColor = '#333';
animation.append(canvas);

const world = new World(map);
const car = new Car(world, 'car_model_1');

console.log(animation, canvas, world, car);

function draw (ctx) {
	const transform = ctx.getTransform();

	canvas.clear();
	ctx.translate(canvas.width / 2, canvas.height / 2);

	if (SIM_SETTINGS.camera_rotate) ctx.rotate(-car.angle);

	ctx.translate(-car.x, -car.y);

	if (SIM_SETTINGS.debug_mode) {
		world.drawDebug(ctx);
		car.drawDebug(ctx);
	} else {
		world.draw(ctx);
		car.draw(ctx);
	}
	
	ctx.setTransform(transform);
	showFPS(ctx, animation.fps);
}

function update (dt) {
	world.update();
	car.update();
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
	} else if (event.code == 'KeyD') {
		SIM_SETTINGS.debug_mode = !SIM_SETTINGS.debug_mode;
	}
});
