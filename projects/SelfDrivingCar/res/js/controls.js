class CarControls {
	constructor (car, enableKeyControls = false) {
		this.car = car;
		this.forward = false;
		this.backward = false;
		this.turnLeft = false;
		this.turnRight = false;

		if (enableKeyControls) {
			CarControls.addKeyEvents(this);
		}
	}

	static addKeyEvents (controls) {
		window.addEventListener('keydown', (event) => {
			if (event.code == 'ArrowUp') controls.forward = true;
			if (event.code == 'ArrowDown') controls.backward = true;
			if (event.code == 'ArrowLeft') controls.turnLeft = true;
			if (event.code == 'ArrowRight') controls.turnRight = true;
		});

		window.addEventListener('keyup', (event) => {
			if (event.code == 'ArrowUp') controls.forward = false;
			if (event.code == 'ArrowDown') controls.backward = false;
			if (event.code == 'ArrowLeft') controls.turnLeft = false;
			if (event.code == 'ArrowRight') controls.turnRight = false;
		});
	}

	update () {
		const car = this.car;

		if (this.forward) {
			if (car.speed > 0) {
				car.speed += car.acc;
			} else {
				car.speed += car.break;
			}

			if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
		}

		if (this.backward) {
			if (car.speed > 0) {
				car.speed -= car.break;
			} else {
				car.speed -= car.acc;
			}
			
			if (car.speed < -car.maxSpeed * 0.2) car.speed = -car.maxSpeed * 0.2;
		}

		if (!this.forward && !this.backward) {
			car.speed *= 0.99;
		}

		if (Math.abs(car.speed) > 0.5) {
			if (this.turnLeft) car.angle -= car.steering;
			if (this.turnRight) car.angle += car.steering;
		}
		
		car.x += Math.sin(car.angle) * car.speed;
		car.y -= Math.cos(car.angle) * car.speed;
	}
}
