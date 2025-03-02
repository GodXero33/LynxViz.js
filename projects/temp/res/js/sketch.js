const ball = {
	t: 0,
	x: 0,
	y: 0,
	r: 20
};

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

function drawBall (ctx) {
	ctx.fillStyle = '#f00';
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.r, 0, LynxViz.TAU);
	ctx.fill();
}

function updateBall (dt) {
	ball.t += 0.001 * dt;
	ball.x = Math.sin(ball.t) * 100;
	ball.y = Math.cos(ball.t) * 100;
}
