class SesnorRay {
	constructor () {
		this.x = 0;
		this.y = 0;
		this.ex = 0;
		this.ey = 0;
		this.tx = 0;
		this.ty = 0;
		this.fact = 0;
	}
}

class Sensor {
	constructor (car, raysData) {
		this.car = car;
		this.raysData = raysData;
		this.rays = Array.from({ length: raysData.length }, () => new SesnorRay());

		this.calculateRays();
	}

	calculateRays () {
		const x1 = this.car.x;
		const y1 = this.car.y;
		const carAngle = this.car.angle - Math.PI / 2;

		this.raysData.forEach((rayData, index) => {
			const ray = this.rays[index];
			const x2 = x1 + Math.cos(rayData.angle + carAngle) * rayData.range;
			const y2 = y1 + Math.sin(rayData.angle + carAngle) * rayData.range;

			ray.x = x1;
			ray.y = y1;
			ray.ex = x2;
			ray.ey = y2;
			ray.tx = x2;
			ray.ty = y2;
		});
	}

	testRayIntersection (ray, map) {
		let minDis = Infinity;
		let tx = 0;
		let ty = 0;
		let isIntersected = false;

		map.forEach(bound => {
			for (let i = 0; i < bound.length - 2; i += 2) {
				const x1 = bound[i];
				const y1 = bound[i + 1];
				const x2 = bound[i + 2];
				const y2 = bound[i + 3];

				const intersection = LynxViz.getIntersectionOfTwoLines(x1, y1, x2, y2, ray.x, ray.y, ray.ex, ray.ey);

				if (intersection) {
					if (intersection[3] < minDis) {
						minDis = intersection[3];
						tx = intersection[0];
						ty = intersection[1];
						isIntersected = true;
					}
				}
			}
		});

		if (isIntersected) {
			ray.tx = tx;
			ray.ty = ty;
			ray.fact = 1 - minDis;
		} else {
			ray.fact = 0;
		}
	}

	update (map) {
		this.calculateRays();

		this.rays.forEach(ray => {
			this.testRayIntersection(ray, map);
		});
	}

	draw (ctx) {
		ctx.strokeStyle = '#f0f';
		ctx.lineWidth = 2;
		ctx.beginPath();

		this.rays.forEach(ray => {
			ctx.moveTo(ray.x, ray.y);
			ctx.lineTo(ray.ex, ray.ey);
		});

		ctx.stroke();

		ctx.strokeStyle = '#0ff';
		ctx.lineWidth = 2;
		ctx.beginPath();

		this.rays.forEach(ray => {
			ctx.moveTo(ray.x, ray.y);
			ctx.lineTo(ray.tx, ray.ty);
		});

		ctx.stroke();

		ctx.font = '16px Arial';
		ctx.fillStyle = '#000';

		this.rays.forEach((ray, index) => {
			ctx.fillText(`(${index})`, ray.ex - 20, ray.ey);

			if (ray.fact != 0) ctx.fillText(ray.fact.toFixed(2), ray.ex, ray.ey);
		});
	}
}
