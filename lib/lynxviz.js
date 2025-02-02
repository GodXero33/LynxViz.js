(function (exports) {
	const EPSILON_THRESHOLD = 1e-15;
	const DELTA_THRESHOLD = 1e-5;
	const TAU = 6.2831853071;
	
	const librarySave = {
		isLoaded: false
	};
	const libraryWeakMap = new WeakMap();

	// Initiate the library

	// Get the current time elapsed since the start of the window, measured in milliseconds
	function getNow () {
		return (typeof performance === 'undefined' ? Date : performance).now();
	}

	function hypot2 (x, y) {
		/*
		x = Math.abs(x);
		y = Math.abs(y);

		if (x < exports.LARGE_THRESHOLD && y < exports.LARGE_THRESHOLD) {
			return Math.sqrt(x ** 2 + y ** 2);
		}

		if (x < y) {
			[x, y] = [y, x / y];
		} else {
			y /= x;
		}

		return x * Math.sqrt(1 + y ** 2);
		*/

		// Optimization and testing not done yet, so using the simpler approach
		return Math.sqrt(x ** 2 + y ** 2);
	}

	function clamp (value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function map (value, inputMin, inputMax, outputMin, outputMax) {
		return outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (value - inputMin);
	}


	function degree (angle) {
		return angle * 180 / Math.PI;
	}

	function radian (angle) {
		return angle * Math.PI / 180;
	}

	function distance (x1, y1, x2, y2) {
		return hypot2(x1 - x2, y1 - y2);
	}

	function lerp (factor, min, max) {
		return min + (max - min) * factor;
	}

	function inverseLerp (value, min, max) {
		if (min == max) {
			return 0;
		}

		return (value - min) / (max - min);
	}

	function factorial (val) {
		if (val == 0 || val == 1) return 1;
		if (val == -1) return -1;
	
		const sign = Math.sign(val);
		val = Math.abs(val);
		let fact = val;
	
		for (let i = val - 1; i > 1; i--) {
			fact *= i;
		}
	
		return fact * sign;
	}

	function getIntersectionOfTwoLines (x1, y1, x2, y2, x3, y3, x4, y4, returnAnyway = false) {
		//  x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4
		// a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y
		// Calculate the top parts of t and u in the parametric equations
		const tTop = (y1 - y3) * (x4 - x3) - (y4 - y3) * (x1 - x3);
		const uTop = (y3 - y1) * (x1 - x2) - (x3 - x1) * (y1 - y2);

		// Calculate the denominator of the parametric equations
		const denominator = (x2 - x1) * (y4 - y3) - (x4 - x3) * (y2 - y1);

		let t, u;

		// Check if the lines are not parallel
		if (Math.abs(denominator) > DELTA_THRESHOLD) {
			t = tTop / denominator;
			u = uTop / denominator;

			// Check if the intersection point lies within both line segments
			if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
				// Calculate and return the intersection point along with t and u values
				return [lerp(t, x1, x2), lerp(t, y1, y2), t, u];
			}
		}

		// Calculate and return the intersection point along with t and u values even lines are parallel
		if (returnAnyway) {
			return [lerp(t, x1, x2), lerp(t, y1, y2), t, u];
		}

		return undefined;
	}

	function getIntersectionOfTwoLinesFromVectors (a, b, c, d, returnAnyway = false) {
		return getIntersectionOfTwoLines(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y, returnAnyway);
	}

	function isPointInsidePolygon (x, y, polygonBounds) {
		let isInside = false;

		for (let i = 0; i < polygonBounds.length - 2; i += 2) {
			const xi = polygonBounds[i];
			const yi = polygonBounds[i + 1];
			const xj = polygonBounds[i + 2];
			const yj = polygonBounds[i + 3];

			// Check if the point intersects with the polygon's edges
			const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

			// Toggle isInside based on the intersection
			isInside = intersect ? !isInside : isInside;
			j = i;
		}

		return isInside;
	}

	function is2PolygonsIntersect (polygon1, polygon2) {
		// Loop through the edges of the first polygon
		for (let i = 0; i < polygon1.length - 2; i += 2) {
			// Extract coordinates of the first edge's endpoints
			const p1x1 = polygon1[i];
			const p1y1 = polygon1[i + 1];
			const p1x2 = polygon1[i + 2];
			const p1y2 = polygon1[i + 3];

			// Loop through the edges of the second polygon
			for (let j = 0; j < polygon2.length - 2; j += 2) {
				// Extract coordinates of the second edge's endpoints
				const p2x1 = polygon2[j];
				const p2y1 = polygon2[j + 1];
				const p2x2 = polygon2[j + 2];
				const p2y2 = polygon2[j + 3];

				// Calculate the intersection point of the two edges
				const intersection = getIntersectionOfTwoLines(
					p1x1, p1y1,
					p1x2, p1y2,
					p2x1, p2y1,
					p2x2, p2y2
				);

				// If there is an intersection, return true
				if (intersection) {
					return true;
				}
			}
		}

		// If no intersection is found, return false
		return false;
	}

	function nearestPointOnSegmentHelper (px, py, segStrtX, segStrtY, segEndX, segEndY, outputType) {
		// Calculate vectors and projections to find the nearest point
		const ax = px - segStrtX;
		const ay = py - segStrtY;
		const bx = segEndX - segStrtX;
		const by = segEndY - segStrtY;
		const lenB = Math.sqrt(bx ** 2 + by ** 2);
		const normBx = bx / lenB;
		const normBy = by / lenB;
		const scalar = ax * normBx + ay * normBy;
		const projPointx = segStrtX + normBx * scalar;
		const projPointy = segStrtY + normBy * scalar;
		const projOffset = scalar / lenB;

		// If the nearest point is within the segment, return it
		if (projOffset > 0 && projOffset < 1) {
			if (outputType) {
				return [projPointx, projPointy];
			}

			return Math.sqrt((px - projPointx) ** 2 + (py - projPointy) ** 2);
		}

		// Otherwise, return the nearest endpoint
		let dx = px - segStrtX;
		let dy = py - segStrtY;
		const distance2Point1 = Math.sqrt(dx * dx + dy * dy);

		dx = px - segEndX;
		dy = py - segEndY;
		const distance2Point2 = Math.sqrt(dx * dx + dy * dy);

		if (outputType) {
			return distance2Point1 > distance2Point2 ? [segEndX, segEndY] : [segStrtX, segStrtY];
		}

		return Math.min(distance2Point1, distance2Point2);
	}

	function getNearestPointOnSegment (px, py, segStrtX, segStrtY, segEndX, segEndY) {
		return nearestPointOnSegmentHelper(px, py, segStrtX, segStrtY, segEndX, segEndY, true);
	}

	function getDistanceToPointFromSegment (px, py, segStrtX, segStrtY, segEndX, segEndY) {
		return nearestPointOnSegmentHelper(px, py, segStrtX, segStrtY, segEndX, segEndY, false);
	}

	// Vector 2D
	class Vector2 {
		constructor (x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		add (vec) {
			this.x += vec.x;
			this.y += vec.y;
			return this;
		}

		addScalar (scalar) {
			this.x += scalar;
			this.y += scalar;
			return this;
		}

		addScalarX (scalar) {
			this.x += scalar;
			return this;
		}

		addScalarY (scalar) {
			this.y += scalar;
			return this;
		}

		addScaledVector (vec, scalar) {
			this.x += vec.x * scalar;
			this.y += vec.y * scalar;
			return this;
		}

		angle () {
			return Math.atan2(-this.y, -this.x) + Math.PI;
		}

		angleBetween (vec) {
			return (Math.abs(this.angle() - vec.angle()) + 2 * Math.PI) % (2 * Math.PI);
		}

		ceil () {
			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			return this;
		}

		clamp (min, max) {
			this.x = clamp(this.x, min.x, max.x);
			this.y = clamp(this.y, min.y, max.y);
			return this;
		}

		clampScalar (min, max) {
			this.x = clamp(this.x, min, max);
			this.y = clamp(this.y, min, max);
			return this;
		}

		clone () {
			return new this.constructor(this.x, this.y);
		}

		copy (vec) {
			this.x = vec.x;
			this.y = vec.y;
			return this;
		}

		cross (vec) {
			return this.x * vec.y - vec.x * this.y;
		}

		dirAngle () {
			const angle = this.angle();
			return angle > Math.PI ? angle - TAU : angle;
		}

		distanceToSQRT (vec) {
			return (this.x - vec.x) * (this.x - vec.x) + (this.y - vec.y) * (this.y - vec.y);
		}

		distanceTo (vec) {
			return Math.sqrt(this.distanceToSQRT(vec));
		}

		divide (vec) {
			this.x = Math.abs(vec.x) < DELTA_THRESHOLD ? 0 : this.x / vec.x;
			this.y = Math.abs(vec.y) < DELTA_THRESHOLD ? 0 : this.y / vec.y;
			return this;
		}

		divideScalar (scalar) {
			if (Math.abs(scalar) < DELTA_THRESHOLD) {
				this.x = 0;
				this.y = 0;
			} else {
				this.x /= scalar;
				this.y /= scalar;
			}

			return this;
		}

		divideScalarX (scalar) {
			this.x = Math.abs(scalar) < EPSILON_THRESHOLD ? 0 : this.x / scalar;
			return this;
		}

		divideScalarY (scalar) {
			this.y = Math.abs(scalar) < EPSILON_THRESHOLD ? 0 : this.y / scalar;
			return this;
		}

		dot (vec) {
			return this.x * this.y + vec.x * vec.y;
		}

		equals (vec) {
			return Math.abs(this.x - vec.x) < EPSILON_THRESHOLD && Math.abs(this.y - vec.y) < EPSILON_THRESHOLD;
		}

		floor () {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			return this;
		}
		
		fromArray (arr, offset = 0) {
			this.x = arr[offset];
			this.y = arr[offset + 1];
			return this;
		}

		fromString (string) {
			const vec = JSON.parse(string);
			this.x = vec.x;
			this.y = vec.y;
			return this;
		}

		isInvalid () {
			return !Number.isFinite(this.x) || !Number.isFinite(this.y);
		}

		isParallel (vec) {
			return this.cross(vec) === 0;
		}

		isUndefined () {
			return this.x === undefined || this.y === undefined;
		}

		isZero () {
			return Math.abs(this.x) < EPSILON_THRESHOLD && Math.abs(this.y) < EPSILON_THRESHOLD;
		}

		lengthSQRT () {
			return this.x * this.x + this.y * this.y;
		}

		length () {
			return Math.sqrt(this.lengthSQRT());
		}

		lerp (vec, fact) {
			this.x = lerp(fact, this.x, vec.x);
			this.y = lerp(fact, this.y, vec.y);
			return this;
		}

		limit (limiter) {
			const mag = this.length();

			if (mag > limiter) {
				const ratio = limiter / mag;
				this.x *= ratio;
				this.y *= ratio;
			}

			return this;
		}

		inverseLerp (vec, target) {
			this.x = inverseLerp(target, this.x, vec.x);
			this.y = inverseLerp(target, this.y, vec.y);
			return this;
		}

		manhattanDistanceTo (vec) {
			return Math.abs(this.x - vec.x) + Math.abs(this.y - vec.y);
		}

		manhattanLength () {
			return Math.abs(this.x) + Math.abs(this.y);
		}

		max (vec) {
			this.x = Math.max(this.x, vec.x);
			this.y = Math.max(this.y, vec.y);
			return this;
		}

		mid (vec) {
			return this.lerp(vec, 0.5);
		}

		min (vec) {
			this.x = Math.min(this.x, vec.x);
			this.y = Math.min(this.y, vec.y);
			return this;
		}

		multiply (vec) {
			this.x *= vec.x;
			this.y *= vec.y;
			return this;
		}

		multiplyScalar (scalar) {
			this.x *= scalar;
			this.y *= scalar;
			return this;
		}

		multiplyScalarX (scalar) {
			this.x *= scalar;
			return this;
		}

		multiplyScalarY (scalar) {
			this.y *= scalar;
			return this;
		}

		negate () {
			return this.multiplyScalar(-1);
		}

		normalize () {
			return this.divideScalar(this.length() || 1);
		}

		perpendicular () {
			this.x = -this.x;
			return this;
		}

		project (vec) {
			const len = vec.lengthSQRT();
			const dot = this.dot(vec);
			const normalizedVector = vec.clone().normalize().multiplyScalar(dot / len);
			return this.copy(normalizedVector);
		}

		randomize (min, max) {
			this.x = Math.random() * (max.x - min.x) + min.x;
			this.y = Math.random() * (max.y - min.y) + min.y;
			return this;
		}

		randomizeScaler (min, max) {
			this.x = Math.random() * (max - min) + min;
			this.y = Math.random() * (max - min) + min;
			return this;
		}

		reflect (normal) {
			const dot = this.dot(normal);
			const scaledNormal = normal.clone().multiplyScalar(2 * dot);
			return this.sub(scaledNormal);
		}

		rotate (angle) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const x = this.x;
			const y = this.y;
			this.x = x * cos - y * sin;
			this.y = x * sin + y * cos;
			return this;
		}

		rotateAround (center, angle) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const x = this.x - center.x;
			const y = this.y - center.y;
			this.x = x * cos - y * sin + center.x;
			this.y = x * sin + y * cos + center.y;
			return vec;
		}

		rotateTowards (vec, maxStep) {
			const currentAngle = this.angle();
			return this.setAngle(currentAngle + Math.sign(this.cross(vec1)) * Math.min(maxStep, Math.abs(vec.angle() - currentAngle)));
		}

		round (vec) {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			return this;
		}

		set (x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		setAngle (angle) {
			const length = this.length();
			this.x = Math.cos(angle) * length;
			this.y = Math.sin(angle) * length;
			return this;
		}

		setLength (length) {
			return this.normalize().multiplyScalar(length);
		}

		setScalar (scalar) {
			this.x = scalar;
			this.y = scalar;
			return this;
		}

		setX (x) {
			this.x = x;
			return this;
		}

		setY (y) {
			this.y = y;
			return this;
		}

		setZero () {
			this.x = 0;
			this.y = 0;
			return this;
		}

		sub (vec) {
			this.x -= vec.x;
			this.y -= vec.y;
			return this;
		}

		subScalar (scalar) {
			this.x -= scalar;
			this.y -= scalar;
			return this;
		}

		subScalarX (scalar) {
			this.x -= scalar;
			return this;
		}

		subScalarY (scalar) {
			this.y -= scalar;
			return this;
		}

		subScaledVector (vec, scalar) {
			this.x -= vec.x * scalar;
			this.y -= vec.y * scalar;
			return this;
		}

		toArray (arr, offset = 0) {
			arr[offset] = this.x;
			arr[offset + 1] = this.y;
			return arr;
		}

		toString () {
			return JSON.stringify(this, null, '\t');
		}

		toUndefined () {
			this.x = undefined;
			this.y = undefined;
			return this;
		}

		transformByMatrix (matrix) {
			this.x = matrix.a * this.x + matrix.c * this.y + matrix.e;
			this.y = matrix.b * this.x + matrix.d * this.y + matrix.f;
			return this;
		}

		applyFullTransform (angle, tx, ty, sx, sy) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const x = this.x;
			const y = this.y;
			this.x = sx * (x * cos - y * sin) + tx;
			this.y = sy * (x * sin + y * cos) + ty;
			return this;
		}

		static create (x, y) {
			return new Vector2(x, y);
		}

		static add (vec1, vec2) {
			return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
		}

		static addScalar (vec, scalar) {
			return new Vector2(vec.x + scalar, vec.y + scalar);
		}

		static addScalarX (vec, scalar) {
			return new Vector2(vec.x + scalar, vec.y);
		}

		static addScalarY (vec, scalar) {
			return new Vector2(vec.x, vec.y + scalar);
		}

		static addScaledVector (vec1, vec2, scalar) {
			return new Vector2(vec1.x + vec2.x * scalar, vec1.y + vec2.y * scalar);
		}

		static angle (vec) {
			return Math.atan2(-vec.y, -vec.x) + Math.PI;
		}

		static angleBetween (vec1, vec2) {
			return (Math.abs(vec1.angle() - vec2.angle()) + 2 * Math.PI) % (2 * Math.PI);
		}

		static ceil (vec) {
			return new Vector2(Math.ceil(vec.x), Math.ceil(vec.y));
		}

		static clamp (vec, min, max) {
			return new Vector2(clamp(vec.x, min.x, max.x), clamp(vec.y, min.y, max.y));
		}

		static clampScalar (vec, min, max) {
			return new Vector2(clamp(vec.x, min, max), clamp(vec.y, min, max));
		}

		static copy (vec) {
			return new Vector2(vec.x, vec.y);
		}

		static cross (vec1, vec2) {
			return vec1.x * vec2.y - vec2.x * vec1.y;
		}

		static dirAngle (vec) {
			const angle = vec.angle();
			return angle > Math.PI ? angle - TAU : angle;
		}

		static distanceToSQRT (vec1, vec2) {
			return (vec1.x - vec2.x) * (vec1.x - vec2.x) + (vec1.y - vec2.y) * (vec1.y - vec2.y);
		}

		static distanceTo (vec1, vec2) {
			return Math.sqrt(vec1.distanceToSQRT(vec2));
		}

		static divide (vec1, vec2) {
			return new Vector2(Math.abs(vec2.x) < DELTA_THRESHOLD ? 0 : vec1.x / vec.x, Math.abs(vec2.y) < DELTA_THRESHOLD ? 0 : vec1.y / vec2.y);
		}

		static divideScalar (vec, scalar) {
			if (Math.abs(scalar) < DELTA_THRESHOLD) {
				return new Vector2();
			} else {
				this.x /= scalar;
				this.y /= scalar;
				return new Vector2(vec.x / scalar, vec.y / scalar);
			}
		}

		static divideScalarX (vec, scalar) {
			return new Vector2(Math.abs(scalar) < EPSILON_THRESHOLD ? 0 : vec.x / scalar, vec.y);
		}

		static divideScalarY (vec, scalar) {
			return new Vector2(vec.x, Math.abs(scalar) < EPSILON_THRESHOLD ? 0 : vec.y / scalar);
		}

		static dot (vec1, vec2) {
			return vec1.x * vec1.y + vec2.x * vec2.y;
		}

		static equals (vec1, vec2) {
			return Math.abs(vec1.x - vec2.x) < EPSILON_THRESHOLD && Math.abs(vec1.y - vec2.y) < EPSILON_THRESHOLD;
		}

		static floor (vec) {
			return new Vector2(Math.floor(vec.x), Math.floor(vec.y));
		}

		static fromArray (arr, offset) {
			return new Vector2(arr[offset], arr[offset + 1]);
		}

		static fromString (string) {
			const vec = JSON.parse(string);
			return new Vector2(vec.x, vec.y);
		}

		static isInvalid (vec) {
			return !Number.isFinite(vec.x) || !Number.isFinite(vec.y);
		}

		static isParallel (vec1, vec2) {
			return vec1.cross(vec2) === 0;
		}

		static isUndefined (vec) {
			return vec.x === undefined || vec.y === undefined;
		}

		static isZero (vec) {
			return Math.abs(vec.x) < EPSILON_THRESHOLD && Math.abs(vec.y) < EPSILON_THRESHOLD;
		}

		static lengthSQRT (vec) {
			return vec.x * vec.x + vec.y * vec.y;
		}

		static length (vec) {
			return Math.sqrt(vec.lengthSQRT());
		}

		static lerp (vec1, vec2, fact) {
			return new Vector2(lerp(fact, vec1.x, vec2.x), lerp(fact, vec1.y, vec2.y));
		}

		static limit (vec, limiter) {
			const mag = vec.length();
			vec = vec.clone();

			if (mag > limiter) {
				const ratio = limiter / mag;
				vec.x *= ratio;
				vec.y *= ratio;
			}

			return vec;
		}

		static inverseLerp (vec1, vec2, target) {
			return new Vector2(inverseLerp(target, vec1.x, vec2.x), inverseLerp(target, vec1.y, vec2.y));
		}

		static manhattanDistanceTo (vec1, vec2) {
			return Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);
		}

		static manhattanLength (vec) {
			return Math.abs(vec.x) + Math.abs(vec.y);
		}

		static max (vec1, vec2) {
			return new Vector2(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y));
		}

		static mid (vec1, vec2) {
			return vec1.clone().lerp(vec2, 0.5);
		}

		static min (vec1, vec2) {
			return new Vector2(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y));
		}

		static multiply (vec1, vec2) {
			return new Vector2(vec1.x * vec2.x, vec1.y * vec2.y);
		}

		static multiplyScalar (vec, scalar) {
			return new Vector2(vec.x * scalar, vec.y * scalar);
		}

		static multiplyScalarX (vec, scalar) {
			return new Vector2(vec.x * scalar, vec.y);
		}

		static multiplyScalarY (vec, scalar) {
			return new Vector2(vec.x, vec.y * scalar);
		}

		static negate (vec) {
			return new Vector2(-vec.x, -vec.y);
		}

		static perpendicular (vec) {
			return new Vector2(-vec.x, vec.y);
		}

		static project (vec1, vec2) {
			const len = vec2.lengthSQRT();
			const dot = vec1.dot(vec2);
			return vec1.clone().normalize().multiplyScalar(dot / len);
		}

		static reflect (vec, normal) {
			const dot = vec.dot(normal);
			const scaledNormal = normal.clone().multiplyScalar(2 * dot);
			return Vector2.sub(vec, scaledNormal);
		}

		static rotate (vec, angle) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const x = vec.x;
			const y = vec.y;
			return new Vector2(x * cos - y * sin, x * sin + y * cos);
		}

		static rotateAround (vec, center, angle) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const x = vec.x - center.x;
			const y = vec.y - center.y;
			return new Vector2(x * cos - y * sin + center.x, x * sin + y * cos + center.y);
		}

		static round (vec) {
			return new Vector2(Math.round(vec.x), Math.round(vec.y));
		}

		static sub (vec1, vec2) {
			return new Vector2(vec1.x - vec2.x, vec1.y - vec2.y);
		}

		static subScalar (vec, scalar) {
			return new Vector2(vec.x - scalar, vec.y - scalar);
		}

		static subScalarX (vec, scalar) {
			return new Vector2(vec.x - scalar, vec.y);
		}

		static subScalarY (vec, scalar) {
			return new Vector2(vec.x, vec.y - scalar);
		}

		static subScaledVector (vec1, vec2, scalar) {
			return new Vector2(vec1.x - vec2.x * scalar, vec1.y - vec2.y * scalar);
		}

		static transformByMatrix (vec, matrix) {
			return new Vector2(matrix.a * vec.x + matrix.c * vec.y + matrix.e, matrix.b * vec.x + matrix.d * vec.y + matrix.f);
		}
	}

	class LibraryObject {
		constructor () {
			const id = `${(Math.floor(Math.random() * 2000)).toString().padStart(4, '0')}${Math.floor(getNow() * 100).toString(16)}`;
			libraryWeakMap.set(this, id);
		}

		get id () {
			return libraryWeakMap.get(this);
		}

		inspect () {
			return JSON.stringify(this, (key, value) => (typeof value === 'function' ? '[Function]' : value), 2);
		}

		logState () {
			console.log(this.inspect());
		}
	}

	class Animation extends LibraryObject {
		#fpsData;
		#playing;
		#prevTS;
		#animID;
		#canvasPool;
		#loopMethod;

		constructor (fps) {
			super();
			this.#fpsData = { max: fps, val: 0 };
			this.#loopMethod = null;
			this.#playing = false;
			this.#prevTS = 0;
			this.#animID = null;
			this.#canvasPool = [];
		}

		get fps () {
			return this.#fpsData.val;
		}

		get isPaused () {
			return !this.#playing;
		}

		set loop (func) {
			if (typeof func == 'function') {
				this.#loopMethod = func;
			} else {
				throw new TypeError('Invalid argument: loop must be a function.');
			}
		}

		#animationLoop (ts) {
			const dt = ts - this.#prevTS;
			this.#fpsData.val = 1000 / dt;

			try {
				this.#loopMethod(dt);

				this.#canvasPool.forEach(canvas => {
					canvas.draw();
				});
			} catch (error) {
				throw error;
			}
			
			this.#prevTS = ts;
			this.#animID = window.requestAnimationFrame(this.#animationLoop.bind(this));
		}

		play () {
			if (this.#playing) {
				console.warn('Animation is already playing. Multiple play requests are not allowed.');
				return;
			}

			if (typeof this.#loopMethod != 'function') {
				console.warn('No valid loop method provided. Please define a callback function before starting the animation.');
				return;
			}

			this.#playing = true;
			this.#prevTS = getNow();

			this.#animationLoop(0);
		}

		pause () {
			if (!this.#playing) {
				console.warn('Animation is already paused. No further pause actions can be performed.');
				return;
			}

			this.#playing = false;

			if (this.#animID) {
				window.cancelAnimationFrame(this.#animID);
				this.#animID = null;
			}
		}

		append (canvas) {
			if (canvas instanceof Canvas) {
				this.#canvasPool.push(canvas);
			} else {
				throw new Error('Expected an instance of Canvas. Please provide a valid Canvas object to append.');
			}
		}
	}

	class Canvas extends LibraryObject {
		#canvas;
		#context;
		#maxPixelArea;
		#drawMethod;

		constructor (canvas) {
			super();
			this.#canvas = canvas;
			this.#context = canvas.getContext('2d');
			this.#maxPixelArea = 2000000;
			this.#drawMethod = null;
			this.clearColor = null;
			this.width = canvas.width;
			this.height = canvas.height;
		}

		setParent (parent = null) {
			parent = getValidParent(parent);

			if (parent) {
				parent.style.overflow = 'hidden';
				parent.appendChild(this.#canvas);
			}
		}

		get domElement () {
			return this.#canvas;
		}

		get renderingContext () {
			return this.#context;
		}

		set maxPixelArea (newMax) {
			if (isNaN(newMax) || newMax <= 0) {
				console.warn('Invalid value: The maximum pixel area must be a positive number.');
				return;
			}

			this.#maxPixelArea = newMax;
		}

		set renderer (func) {
			if (typeof func == 'function') {
				this.#drawMethod = func;
			} else {
				throw new TypeError('Invalid argument: loop must be a function.');
			}
		}

		resize (w, h) {
			if (isNaN(w) || isNaN(h)) {
				console.warn('Invalid dimensions: Width and height must be numeric values.');
				return;
			}

			if (w < 0) {
				console.warn('Invalid width: Width must be a positive value.');
				return;
			}

			if (h < 0) {
				console.warn('Invalid height: Height must be a positive value.');
				return;
			}

			if (w * h > this.#maxPixelArea) {
				console.warn(`Invalid size: The canvas area exceeds the allowed maximum of ${this.#maxPixelArea} pixels.`);
				return;
			}

			this.#canvas.width = w;
			this.#canvas.height = h;
			this.width = w;
			this.height = h;
		}

		clear () {
			if (this.clearColor) {
				this.#context.fillStyle = this.clearColor;
				this.#context.fillRect(0, 0, this.width, this.height);
			} else {
				this.#context.clearRect(0, 0, this.width, this.height);
			}
		}

		addEventListener (eventType, listener, options) {
			try {
				this.canvas.addEventListener(eventType, listener, options);
			} catch (error) {
				console.error(`Failed to add event listener: ${error.message}`);
			}
		}

		removeEventListener (eventType, listener, options) {
			try {
				this.canvas.removeEventListener(eventType, listener, options);
			} catch (error) {
				console.error(`Failed to remove event listener: ${error.message}`);
			}
		}

		draw () {
			if (this.#drawMethod) {
				this.#drawMethod(this.#context);
			}
		}
	}

	function getValidParent (parent) {
		let voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'canvas'];

		if (parent instanceof HTMLElement) {
			if (voidElements.includes(parent.tagName)) {
				console.warn(`The <${parent.tagName.toLowerCase()}> element cannot contain child elements, and therefore cannot be used as a parent for the canvas.`);
			} else {
				return parent;
			}
		} else if (parent != null) {
			console.warn('The specified parent is not a valid HTML element.');
		}

		voidElements = null;
		return null;
	}

	function createAnimation ({ fps = 60 } = {}) {
		if (!(Number.isInteger(fps) && fps > 0 && fps < 201)) {
			throw new RangeError(`Invalid FPS value: ${fps}. The FPS value must be an integer between 1 and 200.`);
		}

		return new Animation(fps);
	}

	function createCanvas (parent = null) {
		if (!librarySave.isLoaded) {
			console.warn('The document is not fully loaded or still in interactive mode. Creating an instance of Animation may lead to unexpected errors or bugs.');
		}

		const canvas = document.createElement('canvas');
		canvas.style = `position: absolute;top: 0;left: 0;`;
		parent = getValidParent(parent);

		if (parent) {
			parent.style.overflow = 'hidden';
			parent.appendChild(canvas);
		}
		
		return new Canvas(canvas);
	}

	function createVector2 (x, y) {
		return new Vector2(x, y);
	}

	if (document.readyState == 'complete') {
		librarySave.isLoaded = true;
	} else {
		let loadMethod = function () {
			librarySave.isLoaded = true;
			window.removeEventListener('load', loadMethod);
			loadMethod = null;
		}

		window.addEventListener('load', loadMethod);
	}

	exports.Vector2 = Vector2;

	exports.TAU = TAU;

	exports.clamp = clamp;
	exports.createAnimation = createAnimation;
	exports.createCanvas = createCanvas;
	exports.createVector2 = createVector2;
	exports.degree = degree;
	exports.distance = distance;
	exports.factorial = factorial;
	exports.getDistanceToPointFromSegment = getDistanceToPointFromSegment;
	exports.getIntersectionOfTwoLines = getIntersectionOfTwoLines;
	exports.getIntersectionOfTwoLinesFromVectors = getIntersectionOfTwoLinesFromVectors;
	exports.getNearestPointOnSegment = getNearestPointOnSegment;
	exports.hypot2 = hypot2;
	exports.inverseLerp = inverseLerp;
	exports.is2PolygonsIntersect = is2PolygonsIntersect;
	exports.isPointInsidePolygon = isPointInsidePolygon;
	exports.lerp = lerp;
	exports.map = map;
	exports.radian = radian;
})(LynxViz = {});
