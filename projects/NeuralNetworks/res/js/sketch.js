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

function equation (x) {
	return x;
}

function drawEquation (ctx) {
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(-200, equation(-200) * -1);

	for (let i = -199; i < 200; i++) {
		ctx.lineTo(i, equation(i) * -1);
	}

	ctx.stroke();
}

const points = Array.from({ length: 100 }, () => {
	let x = Math.random() * 400 - 200;
	let y = Math.random() * 400 - 200;
	return new Point(x, y);
});


const perceptron = new Perceptron();

for (let i = 0; i < 100; i++) {
	points.forEach(point => {
		perceptron.train([point.x, point.y], point.lable);
	});	
}

console.log(perceptron);
