class World {
	constructor (map) {
		this.map = map;
		this.width = 10000;
		this.height = 10000;

		this.map.push([
			-this.width / 2, -this.height / 2,
			this.width / 2, -this.height / 2,
			this.width / 2, this.height / 2,
			-this.width / 2, this.height / 2,
			-this.width / 2, -this.height / 2
		]);
	}

	drawDebugMap (ctx) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.beginPath();

		this.map.forEach(bound => {
			for (let i = 0; i < bound.length - 1; i += 2) {
				ctx.moveTo(bound[i], bound[i + 1]);
				ctx.lineTo(bound[i + 2], bound[i + 3]);
			}
		});

		ctx.stroke();
	}

	drawMap (ctx) {
		if (SIM_ASSETS.map == null) return;

		ctx.drawImage(SIM_ASSETS.map, -this.width / 2, -this.height / 2, this.width, this.height);
	}

	drawDebug (ctx) {
		ctx.fillStyle = '#8f9';
		ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
		this.drawDebugMap(ctx);
	}

	draw (ctx) {
		this.drawMap(ctx);
		this.drawDebugMap(ctx);
	}

	update () {}
}
