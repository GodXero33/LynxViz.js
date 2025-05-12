class Point {
	constructor (x, y) {
		this.x = x;
		this.y = y;

		if (this.x > this.y) {
			this.lable = 1;
		} else {
			this.lable = -1;
		}
	}

	draw (ctx) {
		ctx.strokeStyle = '#000';
		ctx.fillStyle = this.lable == 1 ? '#f00' : '#0f0';
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.arc(this.x, this.y * -1, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}

	static draw (ctx, point, lable) {
		ctx.strokeStyle = '#000';
		ctx.fillStyle = lable == 1 ? '#f00' : '#0f0';
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.arc(point.x, point.y * -1, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

class Perceptron {
	constructor () {
		this.weights = [Math.random() * 2 - 1, Math.random() * 2 - 1];
		this.learningRate = 0.1;
	}

	guess (inputs) {
		let sum = 0;

		for (let i = 0; i < this.weights.length; i++) {
			sum += inputs[i] * this.weights[i];
		}

		let output = Math.sign(sum);
		return output;
	}

	train (inputs, target) {
		let guess = this.guess(inputs);
		let error = target - guess;

		for (let i = 0; i < this.weights.length; i++) {
			this.weights[i] += error * inputs[i] * this.learningRate;
		}
	}
}
