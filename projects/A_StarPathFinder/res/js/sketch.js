/**
 * @class PathFinder
 * 
 * This class implements the A* search algorithm for finding the shortest path between two points in a grid-based map.
 * It supports both straight and diagonal movement and efficiently calculates the optimal path by minimizing the 
 * estimated total cost (f = g + h), where g is the cost from the start to the current cell, and h is the heuristic
 * estimate of the cost from the current cell to the target.
 * 
 * The algorithm utilizes a priority queue (openedSet) to explore the most promising nodes first, recalculating 
 * the cost for neighboring cells as needed. It includes functions for generating the path, resetting the grid, 
 * and drawing the map and path on an HTML5 canvas.
 * 
 * More about the A* search algorithm: 
 * https://en.wikipedia.org/wiki/A*_search_algorithm
 * 
 * @version v1.0.0
 * @author GodXero - https://github.com/GodXero33
 */

class Cell {
	constructor (x, y, value) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.neighbors = null;
		this.f = Infinity;
		this.g = Infinity;
		this.h = 0;
		this.prev = null;
	}

	static reset (cell) {
		cell.f = Infinity;
		cell.g = Infinity;
		cell.h = 0;
		cell.prev = null;
	}

	static setNeighbors (cell, grid, diagonal, cols, rows) {
		const neighbors = [];
		const x = cell.x;
		const y = cell.y;

		if (x > 0 && grid[y][x - 1].value == 0) neighbors.push(grid[y][x - 1]);
		if (x < cols - 1 && grid[y][x + 1].value == 0) neighbors.push(grid[y][x + 1]);
		if (y > 0 && grid[y - 1][x].value == 0) neighbors.push(grid[y - 1][x]);
		if (y < rows - 1 && grid[y + 1][x].value == 0) neighbors.push(grid[y + 1][x]);

		if (diagonal) {
			if (x > 0 && y > 0 && grid[y - 1][x - 1].value == 0) neighbors.push(grid[y - 1][x - 1]);
			if (x > 0 && y < rows - 1 && grid[y + 1][x - 1].value == 0) neighbors.push(grid[y + 1][x - 1]);
			if (x < cols - 1 && y > 0 && grid[y - 1][x + 1].value == 0) neighbors.push(grid[y - 1][x + 1]);
			if (x < cols - 1 && y < rows - 1 && grid[y + 1][x + 1].value == 0) neighbors.push(grid[y + 1][x + 1]);
		}

		cell.neighbors = neighbors;
	}
}

class GridMap {
	constructor (grid) {
		this.grid = grid;
		this.rows = grid.length;
		this.cols = grid[0].length;
		this.cellSize = 0;
		this.color1 = '#003306';
		this.color2 = '#86ff33';
		this.x = 0;
		this.y = 0;
	}

	draw (ctx) {
		ctx.translate(this.x, this.y);

		ctx.fillStyle = this.color1;
		ctx.fillRect(0, 0, this.cellSize * this.cols, this.cellSize * this.rows);

		ctx.fillStyle = this.color2;

		this.grid.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell == 1) ctx.fillRect(x * this.cellSize + 0.5, y * this.cellSize + 0.5, this.cellSize - 1, this.cellSize - 1);
			});
		});

		ctx.translate(-this.x, -this.y);
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

	updateMap (grid) {
		this.grid = grid;
		this.rows = grid.length;
		this.cols = grid[0].length;
	}
}

class PathFinder {
	constructor (grid) {
		this.rows = grid.length;
		this.cols = grid[0].length;
		this.diagonal = false;
		this.grid = this.generateGrid(grid);
		this.path = null;
		this.found = false;
		this.cellSize = 0;
		this.color1 = '#ff0';
		this.color2 = '#f0f';
		this.color3 = '#0ff';
		this.color4 = '#f00';
		this.color5 = '#00f';
		this.openedSet = null;
		this.start = null;
		this.end = null;
		this.x = 0;
		this.y = 0;
		this.animate = false;
		this.isReady = false;

		this.reset();
	}

	generateGrid (grid) {
		const newGird = [];

		grid.forEach((row, y) => {
			const newRow = [];
			newGird.push(newRow);

			row.forEach((cell, x) => {
				newRow.push(new Cell(x, y, cell));
			});
		});

		newGird.forEach(row => {
			row.forEach(cell => {
				if (cell.value == 0) {
					Cell.setNeighbors(cell, newGird, this.diagonal, this.cols, this.rows);
				}
			});
		});

		return newGird;
	}

	updateMap (grid) {
		this.grid = this.generateGrid(grid);
		this.rows = grid.length;
		this.cols = grid[0].length;

		this.reset();
	}

	reset () {
		this.path = [];
		this.openedSet = [];
		this.start = this.grid[0][1];
		this.end = this.grid[this.rows - 1][this.cols - 2];
		this.found = false;

		this.grid.forEach(row => {
			row.forEach(cell => {
				Cell.reset(cell);
			});
		});

		this.start.g = 0;
		this.start.f = this.heuristic(this.start, this.end);

		this.openedSet.push(this.start);
	}

	init () {
		this.reset();

		if (this.animate) {
			this.isReady = true;
		} else {
			this.find();
		}
	}

	find () {
		while (this.openedSet.length != 0) {
			let minIndex = 0;

			this.openedSet.forEach((cell, index) => {
				if (cell.f < this.openedSet[minIndex].f) {
					minIndex = index;
				}
			});

			let current = this.openedSet[minIndex];

			if (current == this.end) {
				this.generatePath(current);
				break;
			}

			this.openedSet.splice(minIndex, 1);
			
			current.neighbors.forEach(neighbor => {
				const dist = current.x == neighbor.x || current.y == neighbor.y ? 1 : 1.41;
				let tmpG = current.g + dist;

				if (tmpG < neighbor.g) {
					neighbor.prev = current;
					neighbor.g = tmpG;
					neighbor.f = tmpG + this.heuristic(neighbor, this.end);

					if (!this.openedSet.includes(neighbor)) {
						this.openedSet.push(neighbor);
					}
				}
			});
		}

		this.found = true;
	}

	drawAnimate (ctx) {
		ctx.translate(this.x, this.y);

		ctx.fillStyle = this.color4;
		ctx.fillRect(this.start.x * this.cellSize + 0.5, this.start.y * this.cellSize + 0.5, this.cellSize - 1, this.cellSize - 1);

		ctx.fillStyle = this.color4;
		ctx.fillRect(this.end.x * this.cellSize + 0.5, this.end.y * this.cellSize + 0.5, this.cellSize - 1, this.cellSize - 1);
		
		this.openedSet.forEach(cell => {
			ctx.fillStyle = this.color2;
			ctx.fillRect(cell.x * this.cellSize + 0.5, cell.y * this.cellSize + 0.5, this.cellSize - 1, this.cellSize - 1);
		});

		this.path.forEach(cell => {
			ctx.fillStyle = this.color3;
			ctx.fillRect(cell.x * this.cellSize + 0.5, cell.y * this.cellSize + 0.5, this.cellSize - 1, this.cellSize - 1);
		});

		ctx.translate(-this.x, -this.y);
	}

	drawPath (ctx) {
		ctx.translate(this.x, this.y);

		this.path.forEach(cell => {
			ctx.fillStyle = this.color3;
			ctx.fillRect(cell.x * this.cellSize + 0.5, cell.y * this.cellSize + 0.5, this.cellSize - 1, this.cellSize - 1);
		});

		ctx.translate(-this.x, -this.y);
	}

	draw (ctx) {
		if (this.animate && !this.found) {
			this.drawAnimate(ctx);
		} else {
			this.drawPath(ctx);
		}
	}

	heuristic (a, b) {
		return this.diagonal ? (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) : Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	generatePath (current) {
		this.path = [];
		let tmp = current;
		this.path.push(current);

		while (tmp.prev) {
			this.path.push(tmp.prev);
			tmp = tmp.prev;
		}
	}

	update () {
		if (!this.isReady) return;
		if (this.openedSet.length == 0) return;

		let minIndex = 0;

		this.openedSet.forEach((cell, index) => {
			if (cell.f < this.openedSet[minIndex].f) {
				minIndex = index;
			}
		});

		let current = this.openedSet[minIndex];
		this.generatePath(current);

		if (current == this.end) {
			this.isReady = false;
			this.found = true;
			return;
		}

		this.openedSet.splice(minIndex, 1);

		current.neighbors.forEach(neighbor => {
			const dist = current.x == neighbor.x || current.y == neighbor.y ? 1 : 1.41;
			let tmpG = current.g + dist;

			if (tmpG < neighbor.g) {
				neighbor.prev = current;
				neighbor.g = tmpG;
				neighbor.f = tmpG + this.heuristic(neighbor, this.end);

				if (!this.openedSet.includes(neighbor)) {
					this.openedSet.push(neighbor);
				}
			}
		});
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

	getSimplePath () {
		return this.path.map(cell => { return { x: cell.x, y: cell.y }; }).reverse();
	}

	getPath (isGridContains = false) {
		const data = {};
		const meta = {};

		meta.algorithm = 'A*';
		meta.creator = 'GodXero - https://github.com/GodXero33';
		meta.version = 'PathFinder - v1.0.0';

		data.meta = meta;
		data.path = this.getSimplePath();

		if (isGridContains) {
			data.rows = this.rows;
			data.cols = this.cols;
			data.walls = 1;
			data.spots = 0;
			data.grid = Array.from({ length: this.grid.length }, (_, i) => this.grid[i].map(cell => cell.value));
		}

		return JSON.stringify(data, (_, value) => {
			if (Array.isArray(value) && Array.isArray(value[0])) {
				return value.map(row => JSON.stringify(row));
			}

			return value;
		}, '\t').replace(/"\[/g, '[').replace(/\]"/g, ']');
	}
}
