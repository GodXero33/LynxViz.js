class StringPoint {
	constructor (x, y) {
		this.x = x;
		this.y = y;
		this.pinned = false;
	}
}

class String {
	constructor (x, y, w, h, quality) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.quality = quality;
		this.points = [];

		String.generateString(this);
	}

	static generateString (string) {
		const y = 0;
		const dx = string.w / (string.quality - 1);

		for (let i = 0; i < string.quality; i++) {
			const x = dx * i;
			string.points.push(new StringPoint(x, y + string.h / 2));
		}

		string.points[0].pinned = true;
		string.points[string.quality - 1].pinned = true;
	}

	draw (ctx) {
		ctx.fillStyle = '#f00';
		ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);

		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 2;
		ctx.beginPath();

		this.points.forEach((point, index) => {
			if (index == 0) {
				ctx.moveTo(point.x - this.w / 2, point.y - this.h / 2);
				return;
			}

			ctx.lineTo(point.x - this.w / 2, point.y - this.h / 2);
		});

		ctx.stroke();

		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		ctx.beginPath();

		this.points.forEach((point, index) => {
			ctx.moveTo(point.x - this.w / 2, point.y - this.h / 2);
			ctx.lineTo(point.x - this.w / 2, point.y - this.h / 2);
		});

		ctx.stroke();
	}

	update () {

	}
}
