const SIM_SETTINGS = {
	debug_mode: true,
	camera_rotate: false
};
const SIM_ASSETS = {
	map: null,
	car_model_1: null
};

const map = [
	[200, 200, 200, -200, -200, -200, -200, 200, 20, 80]
];

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

window.addEventListener('load', () => {
	SIM_ASSETS.map = document.getElementById('map-img');
	SIM_ASSETS.car_model_1 = document.getElementById('car-model1-img');
});
