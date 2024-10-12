class SpaceBody {
	constructor (x, y, r, m, c, vx = 0, vy = 0, isFixed = false) {
		this.position = new LynxViz.Vector2(x, y);
		this.velocity = new LynxViz.Vector2(vx, vy);
		this.acceleration = new LynxViz.Vector2(0, 0);
		this.r = r;
		this.m = m;
		this.c = c;
		this.isFixed = isFixed;
		this.isGhost = false;
	}
}

class Space2D {
	constructor () {
		this.bodies = [];
		this.gravityConstant = 40;
	}

	draw (ctx) {
		this.bodies.forEach(body => {
			if (body.isGhost) return;

			ctx.fillStyle = body.c;
			ctx.beginPath();
			ctx.arc(body.position.x, body.position.y, body.r, 0, Math.PI * 2);
			ctx.fill();
		});
	}

	checkCollision () {
		const n = this.bodies.length;

		for (let i = 0; i < n; i++) {
			const body1 = this.bodies[i];

			if (body1.isGhost) continue;

			for (let j = i + 1; j < n; j++) {
				const body2 = this.bodies[j];

				if (body2.isGhost) continue;

				const dx = body1.position.x - body2.position.x;
				const dy = body1.position.y - body2.position.y;
				const dis = dx * dx + dy * dy;
				const r = body1.r + body2.r;

				let vx = (body1.velocity.x + body2.velocity.x) / (body1.m + body2.m);
				let vy = (body1.velocity.y + body2.velocity.y) / (body1.m + body2.m);
				
				if (dis < r * r) {
					const newBody = new SpaceBody(
						(body1.position.x + body2.position.x) / 2,
						(body1.position.y + body2.position.y) / 2,
						r * 1.1,
						body1.m + body2.m,
						'#fff',
						vx,
						vy,
						body1.isFixed || body2.isFixed
					);
					this.bodies.push(newBody);
					body1.isGhost = true;
					body2.isGhost = true;
				}
			}
		}
	}

	update (dt) {
		const n = this.bodies.length;

		this.bodies.forEach((body1, i) => {
			if (body1.isGhost) return;

			for (let j = i + 1; j < n; j++) {
				const body2 = this.bodies[j];

				if (body2.isGhost) continue;

				const dx = body1.position.x - body2.position.x;
				const dy = body1.position.y - body2.position.y;
				const dis = dx * dx + dy * dy;

				const gfource1 = this.gravityConstant * body2.m / dis; // F = (G.M)/(R^2)
				const gfource2 = this.gravityConstant * body1.m / dis; // F = (G.M)/(R^2)
				const angle = Math.atan2(dy, dx);
				const cosTheta = Math.cos(angle);
				const sinTheta = Math.sin(angle);
				
				body1.acceleration.x -= gfource1 * cosTheta;
				body1.acceleration.y -= gfource1 * sinTheta;
				body2.acceleration.x += gfource2 * cosTheta;
				body2.acceleration.y += gfource2 * sinTheta;
			}
		});

		this.checkCollision();

		this.bodies.forEach(body => {
			if (body.isFixed || body.isGhost) return;
			
			body.velocity.add(body.acceleration);
			body.position.add(body.velocity);
			body.acceleration.set(0, 0);
		});
	}
}
