class GridMap {
	static generate (maze) {
		//
	}
}

class Cell {
	constructor (x, y) {
		this.x = x;
		this.y = y;
		this.walls = [true, true, true, true];
		this.visited = false;
	}
	
	static clean (cell) {
		cell.walls = [true, true, true, true];
		cell.visited = false;
	}

	static drawWall (ctx, x1, y1, x2, y2) {
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
	}

	static drawWalls (ctx, cell, cellSize) {
		if (cell.walls[0]) Cell.drawWall(ctx, cell.x * cellSize, cell.y * cellSize, cell.x * cellSize + cellSize, cell.y * cellSize);
		if (cell.walls[1]) Cell.drawWall(ctx, cell.x * cellSize + cellSize, cell.y * cellSize, cell.x * cellSize + cellSize, cell.y * cellSize + cellSize);
		if (cell.walls[2]) Cell.drawWall(ctx, cell.x * cellSize + cellSize, cell.y * cellSize + cellSize, cell.x * cellSize, cell.y * cellSize + cellSize);
		if (cell.walls[3]) Cell.drawWall(ctx, cell.x * cellSize, cell.y * cellSize + cellSize, cell.x * cellSize, cell.y * cellSize);
	}

	static drawCell (ctx, cell, cellSize) {
		ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
	}

	static updateWalls (a, b) {
		if (a.x + 1 == b.x) {
			a.walls[1] = false;
			b.walls[3] = false;
			return;
		}

		if (a.x - 1 == b.x) {
			a.walls[3] = false;
			b.walls[1] = false;
			return;
		}

		if (a.y + 1 == b.y) {
			a.walls[2] = false;
			b.walls[0] = false;
			return;
		}

		if (a.y - 1 == b.y) {
			a.walls[0] = false;
			b.walls[2] = false;
		}
	}
}

class MazeMap {
	constructor (cols, rows) {
		this.grid = Array.from({ length: rows * cols }, (_, i) => {
			const x = i % cols;
			const y = Math.floor(i / cols);
			return new Cell(x, y);
		});

		this.cols = cols;
		this.rows = rows;
		this.cellSize = 20;
		this.x = 0;
		this.y = 0;
		this.current = null;
		this.stack = null;
		this.visitedCount = 0;
		this.animate = false;
		this.isReady = false;
		this.generated = false;

		this.clean();
	}

	clean () {
		this.grid.forEach(cell => {
			Cell.clean(cell);
		});

		this.stack = [];
		this.current = this.grid[0];
		this.visitedCount = 0;
		this.current.visited = true;
		this.generated = false;
	}

	start () {
		this.clean();

		if (this.animate) {
			this.isReady = true;
		} else {
			this.generate();
		}
	}

	generate () {
		while (this.visitedCount != this.grid.length - 1) {
			const next = this.checkNeighbors(this.current);

			if (next) {
				next.visited = true;
				this.stack.push(this.current);
				Cell.updateWalls(this.current, next);
				this.current = next;
				this.visitedCount++;
				continue;
			}
			
			if (this.stack.length > 0) {
				this.current = this.stack.pop();
			}
		}

		this.current = null;
		this.generated = true;
	}

	draw (ctx) {
		ctx.translate(this.x, this.y);

		ctx.strokeStyle = '#ffffff';
		ctx.fillStyle = '#3463f6';
		ctx.lineWidth = this.cellSize * 0.1;

		ctx.beginPath();

		this.grid.forEach(cell => {
			if (cell.visited && !this.generated) Cell.drawCell(ctx, cell, this.cellSize);

			Cell.drawWalls(ctx, cell, this.cellSize);
		});

		ctx.stroke();

		if (this.current && !this.generated) {
			ctx.fillStyle = '#77ff88';
			Cell.drawCell(ctx, this.current, this.cellSize);
		}

		ctx.translate(-this.x, -this.y);
	}

	update () {
		if (!this.isReady) return;

		if (this.visitedCount == this.grid.length - 1) {
			this.current = null;
			this.isReady = false;
			this.generated = true;
			return;
		}

		const next = this.checkNeighbors(this.current);

		if (next) {
			next.visited = true;
			this.stack.push(this.current);
			Cell.updateWalls(this.current, next);
			this.current = next;
			this.visitedCount++;
			return;
		}
		
		if (this.stack.length > 0) {
			this.current = this.stack.pop();
		}
	}

	resize (w, h) {
		if (w > h) {
			this.cellSize = h / this.rows;
		} else {
			this.cellSize = w / this.cols;
		}

		this.x = (w - this.cellSize * this.cols) * 0.5;
		this.y = (h - this.cellSize * this.rows) * 0.5;
	}

	getIndex (x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1) return undefined;

		return y * this.cols + x;
	}

	checkNeighbors (cell) {
		const neighbors = [];
		const top = this.grid[this.getIndex(cell.x, cell.y - 1)];
		const right = this.grid[this.getIndex(cell.x + 1, cell.y)];
		const bottom = this.grid[this.getIndex(cell.x, cell.y + 1)];
		const left = this.grid[this.getIndex(cell.x - 1, cell.y)];

		if (top && !top.visited) neighbors.push(top);
		if (right && !right.visited) neighbors.push(right);
		if (bottom && !bottom.visited) neighbors.push(bottom);
		if (left && !left.visited) neighbors.push(left);

		if (neighbors.length != 0) return neighbors[Math.floor(Math.random() * neighbors.length)];

		return null;
	}

	getData () {
		const data = {};
		const meta = {};

		meta.algorithm = 'Recursive Backtracking';
		meta.creator = 'GodXero - https://github.com/GodXero33';
		meta.version = 'MazeGenerator - v1.0.0';

		data.meta = meta;
		data.rows = this.rows;
		data.cols = this.cols;
		data.wallsOrder = ['top', 'right', 'bottom', 'left'];

		const cells = [];

		this.grid.forEach(cell => {
			const obj = {
				x: cell.x,
				y: cell.y,
				walls: cell.walls.map(wall => wall ? 1 : 0)
			};

			cells.push(obj);
		});

		data.cells = cells;

		return JSON.stringify(data, null, '\t');
	}
}
