import { describe, expect, it } from 'vitest';
import { OctaGrid } from './octagrid';

describe('Test index_to_xy', () => {
	it('Get location of octagonal tiles', () => {
		const grid = new OctaGrid(4, 3, false);
		const expected = new Map([
			[0, [0, 0]],
			[1, [1, 0]],
			[3, [3, 0]],
			[6, [2, 1]],
			[7, [3, 1]],
			[11, [3, 2]]
		]);
		for (let [index, xy] of expected.entries()) {
			const [x, y] = grid.index_to_xy(index);
			expect(x).toBe(xy[0]);
			expect(y).toBe(xy[1]);
		}
	});

	it('Get location of square tiles', () => {
		const grid = new OctaGrid(4, 3, false);
		const expected = new Map([
			[12, [0.5, 0.5]],
			[13, [1.5, 0.5]],
			[15, [3.5, 0.5]],
			[18, [2.5, 1.5]],
			[19, [3.5, 1.5]],
			[23, [3.5, 2.5]]
		]);
		for (let [index, xy] of expected.entries()) {
			const [x, y] = grid.index_to_xy(index);
			expect(x).toBe(xy[0]);
			expect(y).toBe(xy[1]);
		}
	});
});

describe('Test rc_to_index', () => {
	it('Get index of tiles, non-wrapping grid', () => {
		const grid = new OctaGrid(4, 3, false);
		const expected = new Map([
			[[0, 0], 0],
			[[0, 1], 1],
			[[1, 1], 5],
			[[2, 3], 11],
			[[0.5, 0.5], 12],
			[[0.5, 1.5], 13],
			[[1.5, 1.5], 17],
			[[3.5, 3.5], -1]
		]);
		for (let [rc, index_expected] of expected.entries()) {
			const index_actual = grid.rc_to_index(rc[0], rc[1]);
			expect(index_actual).toBe(index_expected);
		}
	});

	it('Get index of tiles, wrapping grid', () => {
		const grid = new OctaGrid(4, 3, true);
		const expected = new Map([
			[[0, 0], 0],
			[[0, 1], 1],
			[[1, 1], 5],
			[[2, 3], 11],
			[[0.5, 0.5], 12],
			[[0.5, 1.5], 13],
			[[1.5, 1.5], 17],
			[[2.5, 3.5], 23],
			[[3, 0], 0],
			[[-1, 0], 8],
			[[0, 4], 0],
			[[0, -1], 3],
			[[2.5, 0.5], 20],
			[[-0.5, 0.5], 20],
			[[2.5, -0.5], 23]
		]);
		for (let [rc, index_expected] of expected.entries()) {
			const index_actual = grid.rc_to_index(rc[0], rc[1]);
			expect(index_actual).toBe(index_expected);
		}
	});
});

describe('Test which_tile_at', () => {
	it('Get index of tiles, non-wrapping grid', () => {
		const grid = new OctaGrid(4, 3, false);
		const expected = new Map([
			[[0.1, -0.1], 0],
			[[1.49, 0.1], 1],
			[[1.51, 0.1], 2],
			[[0.5, 0.2], 12],
			[[0.5, 0.8], 12],
			[[0.2, 0.5], 12],
			[[0.8, 0.5], 12],
			[[0.8, 0.8], 5]
		]);
		for (let [xy, index_expected] of expected.entries()) {
			const index_actual = grid.which_tile_at(xy[0], xy[1]).index;
			expect(index_actual).toBe(index_expected);
		}
	});
	it('Get index of tiles, wrapping grid', () => {
		const grid = new OctaGrid(4, 3, true);
		const expected = new Map([
			[[0.5, -0.2], 20],
			[[0.49, -0.9], 8],
			[[0.51, -0.9], 9]
		]);
		for (let [xy, index_expected] of expected.entries()) {
			const index_actual = grid.which_tile_at(xy[0], xy[1]).index;
			expect(index_actual).toBe(index_expected);
		}
	});
});

describe('Test find neighbour', () => {
	it('Find neighbours in a regular puzzle', () => {
		const grid = new OctaGrid(4, 3, false);
		const expected = new Map([
			// octagonal tiles
			[0, [1, -1, -1, -1, -1, -1, 4, 12]],
			[1, [2, -1, -1, -1, 0, 12, 5, 13]],
			[3, [-1, -1, -1, -1, 2, 14, 7, 15]],
			[6, [7, 14, 2, 13, 5, 17, 10, 18]],
			// square tiles
			[12, [-1, 1, -1, 0, -1, 4, -1, 5]],
			[20, [-1, 9, -1, 8, -1, -1, -1, -1]]
		]);
		for (let [index, neighbours] of expected.entries()) {
			for (let i = 0; i < 8; i++) {
				const neighbourExpected = neighbours[i];
				const direction = grid.DIRECTIONS[i];
				const { neighbour, empty } = grid.find_neighbour(index, direction);
				const msg = `Index ${index}, direction ${direction} => neighbour ${neighbour} empty ${empty}`;
				expect(empty, msg).toBe(neighbourExpected === -1 || grid.emptyCells.has(neighbour));
				expect(neighbour, msg).toBe(neighbourExpected);
			}
		}
	});

	it('Find neighbours in a wrap puzzle', () => {
		const grid = new OctaGrid(4, 3, true);
		const expected = new Map([
			// octagonal tiles
			[0, [1, 20, 8, 23, 3, 15, 4, 12]],
			[1, [2, 21, 9, 20, 0, 12, 5, 13]],
			[3, [0, 23, 11, 22, 2, 14, 7, 15]],
			[6, [7, 14, 2, 13, 5, 17, 10, 18]],
			// square tiles
			[12, [-1, 1, -1, 0, -1, 4, -1, 5]],
			[15, [-1, 0, -1, 3, -1, 7, -1, 4]],
			[20, [-1, 9, -1, 8, -1, 0, -1, 1]]
		]);
		for (let [index, neighbours] of expected.entries()) {
			for (let i = 0; i < 8; i++) {
				const neighbourExpected = neighbours[i];
				const direction = grid.DIRECTIONS[i];
				const { neighbour, empty } = grid.find_neighbour(index, direction);
				const msg = `Index ${index}, direction ${direction} => neighbour ${neighbour} empty ${empty}`;
				expect(empty, msg).toBe(neighbourExpected === -1 || grid.emptyCells.has(neighbour));
				expect(neighbour, msg).toBe(neighbourExpected);
			}
		}
	});
});
