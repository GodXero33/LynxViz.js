class ReactionDiffusion {
	constructor (w, h) {
		this.w = w;
		this.h = h;
		this.len = w * h * 2;
		this.grid = null;
		this.laplaceMap = [
			[0, 0, -1],
			[-1, -1, 0.05],
			[-1, 0, 0.2],
			[-1, 1, 0.05],
			[0, 1, 0.2],
			[1, 1, 0.05],
			[1, 0, 0.2],
			[1, -1, 0.05],
			[0, -1, 0.2]
		];

		this.da = 1;
		this.db = 0.1;
		this.feed = 0.01;
		this.k = 0.03;
		this.dt = 1;

		this.initGrid();
	}

	addBlob (cx, cy, cr) {
		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < this.w; x++) {
				const dx = cx - x;
				const dy = cy - y;
				const dis = dx * dx + dy * dy;

				if (dis < cr * cr) {
					const index = y * this.w + x;
					this.grid[index * 2 + 1] = 1;
				}
			}
		}
	}

	initGrid () {
		this.grid = new Float32Array(this.len);

		for (let i = 0; i < this.len; i += 2) {
			this.grid[i] = 1;
		}

		for (let i = 0; i < 50; i++) {
			const x = Math.floor(Math.random() * this.w);
			const y = Math.floor(Math.random() * this.h);
			const r = Math.floor(Math.random() * 20) + 20;
			
			this.addBlob(x, y, r);
		}
	}

	getColor (a, b) {
		return [a * 255, b * 255, a * 255];
	}

	getLaplace (x, y) {
		let output = [0, 0];

		this.laplaceMap.forEach(row => {
			const index = (y + row[0]) * this.w + x + row[1];
			output[0] += this.grid[index * 2] * row[2];
			output[1] += this.grid[index * 2 + 1] * row[2];
		});

		return output;
	}

	constrain (v, min, max) {
		if (v < min) return min;
		if (v > max) return max;
		return v;
	}

	draw (ctx) {
		const pixlesData = ctx.getImageData(0, 0, this.w, this.h);
		const pixels = pixlesData.data;

		for (let y = 1; y < this.h - 1; y++) {
			for (let x = 1; x < this.w - 1; x++) {
				const i = y * this.w + x;
				const a = this.grid[i * 2];
				const b = this.grid[i * 2 + 1];
				const laplace = this.getLaplace(x, y);
				const ab2 = a * b * b;
				const newA = this.constrain(a + (this.da * laplace[0] - ab2 + this.feed * (1 - a)) * this.dt, 0, 1);
				const newB = this.constrain(b + (this.db * laplace[1] + ab2 - b * (this.k + this.feed)) * this.dt, 0, 1);
	
				this.grid[i * 2] = newA;
				this.grid[i * 2 + 1] = newB;

				const color = this.getColor(newA, newB);
	
				pixels[i * 4] = Math.floor(color[0]);
				pixels[i * 4 + 1] = Math.floor(color[1]);
				pixels[i * 4 + 2] = Math.floor(color[2]);
			}
		}

		ctx.putImageData(pixlesData, 0, 0);
	}

	update() {}
}
