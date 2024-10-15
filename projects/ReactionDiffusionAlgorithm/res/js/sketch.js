class ReactionDiffusion {
	constructor (w, h) {
		this.w = w;
		this.h = h;
		this.grid = null;
		this.next = null;
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
		this.feed = 0.055;
		this.k = 0.067;
		this.dt = 1;

		this.initGrid();
	}

	addBlob (cx, cy, cr) {
		for (let i = 0; i < this.h; i++) {
			for (let j = 0; j < this.w; j++) {
				const dx = cx - j;
				const dy = cy - i;
				const dis = dx * dx + dy * dy;

				if (dis < cr * cr) {
					this.grid[i][j].b = 1;
				}
			}
		}
	}

	initGrid () {
		this.grid = Array.from({ length: this.h }, () => Array.from({ length: this.w }, () => { return { a: 1, b: 0 }; }));
		this.next = Array.from({ length: this.h }, () => Array.from({ length: this.w }, () => { return { a: 0, b: 0 }; }));

		this.addBlob(300, 300, 75);
		this.addBlob(300, 450, 30);
		this.addBlob(300, 150, 30);
		this.addBlob(450, 300, 30);
		this.addBlob(150, 300, 30);
	}

	getLaplace (x, y) {
		let output = [0, 0];

		this.laplaceMap.forEach(row => {
			if (x + row[1] < 0 || x + row[1] > this.w - 1 || y + row[0] < 0 || y + row[0] > this.h - 1) return;
			
			output[0] += this.grid[y + row[0]][x + row[1]].a * row[2];
			output[1] += this.grid[y + row[0]][x + row[1]].b * row[2];
		});

		return output;
	}

	constrain (v, min, max) {
		if (v < min) return min;
		if (v > max) return max;
		return v;
	}

	draw (ctx) {
		this.grid.forEach((row, y) => {
			row.forEach((pixelData, x) => {
				const a = pixelData.a;
				const b = pixelData.b;
				const laplace = this.getLaplace(x, y);
				const ab2 = a * b * b;

				this.next[y][x].a = a + (this.da * laplace[0] - ab2 + this.feed * (1 - a)) * this.dt;
				this.next[y][x].b = b + (this.db * laplace[1] + ab2 - b * (this.k + this.feed)) * this.dt;
				this.next[y][x].a = this.constrain(this.next[y][x].a, 0, 1);
				this.next[y][x].b = this.constrain(this.next[y][x].b, 0, 1);
			});
		});
		
		const pixlesData = ctx.getImageData(0, 0, this.w, this.h);
		const pixels = pixlesData.data;

		this.grid.forEach((row, y) => {
			row.forEach((pixelData, x) => {
				const index = (y * this.w + x) * 4;
				pixels[index] = Math.floor(pixelData.a * 255);
				pixels[index + 1] = Math.floor(pixelData.a * 255);
				pixels[index + 2] = Math.floor(pixelData.a * 255);
			});
		});

		ctx.putImageData(pixlesData, 0, 0);
		
		const tmp = this.grid;
		this.grid = this.next;
		this.next = tmp;
	}

	update() {}
}
