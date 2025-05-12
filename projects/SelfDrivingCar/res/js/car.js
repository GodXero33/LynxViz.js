class Car {
	constructor (world, img) {
		this.world = world;
		this.img = img;
		this.x = 0;
		this.y = 0;
		this.angle = 0;
		this.speed = 0;
		
		this.maxSpeed = 10;
		this.acc = 0.08;
		this.break = 0.2;
		this.steering = 0.02;
		
		const w = 80;
		const h = 50;

		this.width = w;
		this.height = h;
		this.boundsOriginal = [-h / 2, -w / 2, 0, -w * 0.54, h / 2, -w / 2, h / 2, w / 2, -h / 2, w / 2, -h / 2, -w / 2];
		this.bounds = Array.from({ length: this.boundsOriginal.length }, () => 0);
		this.controls = new CarControls(this, true);

		this.sensor = new Sensor(this, [
			{ angle: LynxViz.radian(0), range: 200 },
			{ angle: LynxViz.radian(90), range: 180 },
			{ angle: LynxViz.radian(-90), range: 180 },
			{ angle: LynxViz.radian(30), range: 190 },
			{ angle: LynxViz.radian(-30), range: 190 },
			{ angle: LynxViz.radian(60), range: 180 },
			{ angle: LynxViz.radian(-60), range: 180 },
			{ angle: LynxViz.radian(15), range: 200 },
			{ angle: LynxViz.radian(-15), range: 200 },
			{ angle: LynxViz.radian(180), range: 180 },
			{ angle: LynxViz.radian(150), range: 180 },
			{ angle: LynxViz.radian(-150), range: 180 },
			{ angle: LynxViz.radian(165), range: 180 },
			{ angle: LynxViz.radian(-165), range: 180 }
		]);

		this.calculateBounds();
	}

	calculateBounds () {
		const sin = Math.sin(this.angle);
		const cos = Math.cos(this.angle);

		for (let i = 0; i < this.bounds.length; i += 2) {
			const x = this.boundsOriginal[i];
			const y = this.boundsOriginal[i + 1];

			this.bounds[i] = x * cos - y * sin + this.x;
			this.bounds[i + 1] = y * cos + x * sin + this.y;
		}
	}

	checkBounds () {
		for (let i = 0; i < this.bounds.length - 2; i += 2) {
			const x1 = this.bounds[i];
			const y1 = this.bounds[i + 1];
			const x2 = this.bounds[i + 2];
			const y2 = this.bounds[i + 3];

			for (const bound of this.world.map) {
				for (let j = 0; j < bound.length - 2; j += 2) {
					const x3 = bound[j];
					const y3 = bound[j + 1];
					const x4 = bound[j + 2];
					const y4 = bound[j + 3];
					const intersection = LynxViz.getIntersectionOfTwoLines(x1, y1, x2, y2, x3, y3, x4, y4);
					
					if (intersection) {
						const offsetX = intersection[0] - this.x;
						const offsetY = intersection[1] - this.y;
						return [offsetX, offsetY];
					}
				}
			}
		}

		return null;
	}

	drawDebug (ctx) {
		this.draw(ctx);
		this.sensor.draw(ctx);

		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2;
		ctx.beginPath();

		for (let i = 0; i < this.bounds.length - 2; i += 2) {
			ctx.moveTo(this.bounds[i], this.bounds[i + 1]);
			ctx.lineTo(this.bounds[i + 2], this.bounds[i + 3]);
		}

		ctx.stroke();
	}

	draw (ctx) {
		const img = SIM_ASSETS[this.img];

		if (img == null) return;

		const angle = this.angle - Math.PI / 2;
		ctx.translate(this.x, this.y);
		ctx.rotate(angle);
		ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.rotate(-angle);
		ctx.translate(-this.x, -this.y);
	}

	update () {
		this.controls.update();
		const boundsDirections = this.checkBounds();
		
		if (boundsDirections) {
			const x = boundsDirections[0];
			const y = boundsDirections[1];
			const dis = Math.sqrt(x * x + y * y);
			const speed = Math.abs(this.speed);

			this.x -= x * speed / dis;
			this.y -= y * speed / dis;

			car.speed -= 0.8;
		}
		
		this.calculateBounds();
		this.sensor.update(this.world.map);
	}
}
