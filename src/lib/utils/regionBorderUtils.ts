// RegionBorderUtils.ts
import { Vector2, Vector3 } from 'three';
import type { ITerritory, IRegion } from '../models/TerritoryModel';

/** Region id ➜ ordered border vertices (clockwise, not closed) */
export type RegionBorders = Map<string, Vector3[]>;

/**
 * Compute outlines for every region on a square grid and
 * pull them inside by `borderInset` world-units.
 *
 * @param territoriesById  Map<territoryId, ITerritory>
 * @param regionsById      Map<regionId, IRegion>
 * @param cellSize         length of one grid cell in world units
 * @param borderInset      distance to shrink each outline (≤ cellSize ∕ 2). Default 10 % of a cell
 */
export function computeRegionBorders(
	territoriesById: Map<string, ITerritory>,
	regionsById: Map<string, IRegion>,
	cellSize: number,
	borderInset: number = cellSize * 0.1
): RegionBorders {
	const borders: RegionBorders = new Map();

	regionsById.forEach((region) => {
		const raw = buildBorder(region, territoriesById, cellSize); // ← previous code
		const inset = shrinkClockwiseOutline(raw, borderInset); // ← NEW
		inset.push(inset[0]);
		borders.set(region.id, inset);
	});

	return borders;
}
// ────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────

type XY = [number, number];
type Edge = { p1: XY; p2: XY; count: number };

const ptKey = (x: number, z: number) => `${x},${z}`;

/** Build a single region’s outline */
function buildBorder(
	region: IRegion,
	territories: Map<string, ITerritory>,
	cellSize: number
): Vector3[] {
	/* ---- 1. quick look-up of cells that belong to the region ---- */
	const cells = new Set<string>();
	for (const tid of region.territoryIds) {
		const t = territories.get(tid);
		if (t) cells.add(ptKey(t.position.x, t.position.y)); // y is grid-z
	}

	/* ---- 2. collect every edge; duplicates ⇒ internal edge ---- */
	const edges = new Map<string, Edge>();

	const addEdge = (x1: number, z1: number, x2: number, z2: number) => {
		// canonical key so A-B === B-A
		const key =
			x1 < x2 || (x1 === x2 && z1 < z2) ? `${x1},${z1}-${x2},${z2}` : `${x2},${z2}-${x1},${z1}`;
		const e = edges.get(key);
		if (e) {
			e.count += 1;
		} else {
			edges.set(key, { p1: [x1, z1], p2: [x2, z2], count: 1 });
		}
	};

	cells.forEach((s) => {
		const [xStr, zStr] = s.split(',');
		const x = +xStr;
		const z = +zStr;

		// treat every cell as a 1×1 square: [x,x+1] × [z,z+1]
		addEdge(x, z, x + 1, z); // top
		addEdge(x, z + 1, x + 1, z + 1); // bottom
		addEdge(x, z, x, z + 1); // left
		addEdge(x + 1, z, x + 1, z + 1); // right
	});

	// keep only edges that appear once → perimeter
	const borderEdges = [...edges.values()].filter((e) => e.count === 1);
	if (borderEdges.length === 0) return []; // shouldn’t happen

	/* ---- 3. build adjacency graph point ➜ neighbouring points ---- */
	const adjacency = new Map<string, string[]>();

	for (const e of borderEdges) {
		const [x1, z1] = e.p1;
		const [x2, z2] = e.p2;
		const k1 = ptKey(x1, z1);
		const k2 = ptKey(x2, z2);

		if (!adjacency.has(k1)) adjacency.set(k1, []);
		if (!adjacency.has(k2)) adjacency.set(k2, []);
		adjacency.get(k1)!.push(k2);
		adjacency.get(k2)!.push(k1);
	}

	/* ---- 4. walk the border clockwise ---- */
	// start at the bottom-left-most vertex for deterministic output
	const start = [...adjacency.keys()].sort((a, b) => {
		const [ax, az] = a.split(',').map(Number);
		const [bx, bz] = b.split(',').map(Number);
		return ax !== bx ? ax - bx : az - bz;
	})[0];

	const outlineKeys: string[] = [start];
	let prev = '';
	let curr = start;

	while (true) {
		const nextCandidates = adjacency.get(curr)!.filter((k) => k !== prev);
		if (nextCandidates.length === 0) break; // defensive

		const next =
			nextCandidates.length === 1 ? nextCandidates[0] : pickClockwise(curr, prev, nextCandidates);

		if (next === start) break; // loop closed
		outlineKeys.push(next);
		prev = curr;
		curr = next;
	}

	/* ---- 5. convert keys ➜ Vector3 (y == 1) ---- */
	const points = outlineKeys.map((k) => {
		const [x, z] = k.split(',').map(Number);
		return new Vector3(x * cellSize, 1, z * cellSize);
	});
	return points;
}

/** Choose neighbour that yields a right-turn (CW) from the incoming edge */
function pickClockwise(currKey: string, prevKey: string, options: string[]): string {
	if (!prevKey) return options[0]; // first step

	const [cx, cz] = currKey.split(',').map(Number);
	const [px, pz] = prevKey.split(',').map(Number);
	const vx = cx - px;
	const vz = cz - pz;

	// Sort neighbours by signed area (cross product) with incoming vector;
	// negative cross ⇒ right-turn (clockwise).
	return options.slice().sort((a, b) => {
		const [ax, az] = a.split(',').map(Number);
		const [bx, bz] = b.split(',').map(Number);
		const crossA = vx * (az - cz) - vz * (ax - cx);
		const crossB = vx * (bz - cz) - vz * (bx - cx);

		if (crossA >= 0 && crossB < 0) return 1;
		if (crossA < 0 && crossB >= 0) return -1;
		return crossA - crossB; // both on same side – pick tighter turn
	})[0];
}

// ────────────────────────────────────────────────────────────
//  NEW  –  polygon-offset helper
// ────────────────────────────────────────────────────────────

/**
 * Shrink a clockwise outline toward its interior by `d` world-units.
 * Result keeps the same number/order of vertices; good enough for
 * rectilinear grid shapes.
 */
function shrinkClockwiseOutline(points: Vector3[], d: number): Vector3[] {
	if (points.length < 3 || d <= 0) return points;

	// 2-D helpers (x,z plane)
	const toV2 = (p: Vector3) => new Vector2(p.x, p.z);

	const n = points.length;
	const out: Vector3[] = [];

	for (let i = 0; i < n; i++) {
		// ------------------------------------------------------------------
		// Step 0 : neighbourhood
		// ------------------------------------------------------------------
		const pPrev = toV2(points[(i - 1 + n) % n]); // previous vertex
		const pCurr = toV2(points[i]); // current vertex
		const pNext = toV2(points[(i + 1) % n]); // next vertex

		// edge direction vectors (prev→curr) and (curr→next)
		const e1 = pCurr.clone().sub(pPrev); // first incident edge
		const e2 = pNext.clone().sub(pCurr); // second incident edge

		// ------------------------------------------------------------------
		// Step 1 : normals that point **inside** (left side of each edge)
		// ------------------------------------------------------------------
		const n1 = new Vector2(-e1.y, e1.x).normalize(); // left-hand normal of e1
		const n2 = new Vector2(-e2.y, e2.x).normalize(); // left-hand normal of e2

		// ------------------------------------------------------------------
		// Step 2 : build the two *offset lines*
		//   Each has the form  (q · n = c)   with q = (x,z) a point on the line
		// ------------------------------------------------------------------
		const c1 = n1.dot(pCurr) + d; // shift inward by +d
		const c2 = n2.dot(pCurr) + d;

		// ------------------------------------------------------------------
		// Step 3 : intersection of the two offset lines
		//          Solve  q·n1 = c1  and  q·n2 = c2
		//          ⇢ 2×2 linear system  [ n1.x n1.y ] [qx] = [c1]
		//                                 n2.x n2.y   qz   c2
		// ------------------------------------------------------------------
		const det = n1.x * n2.y - n1.y * n2.x;

		// Parallel (180°) corner ⇒ just move along either normal
		let q: Vector2;
		if (Math.abs(det) < 1e-6) {
			q = pCurr.clone().add(n1.clone().multiplyScalar(d));
		} else {
			q = new Vector2((c1 * n2.y - c2 * n1.y) / det, (n1.x * c2 - n2.x * c1) / det);
		}

		// ------------------------------------------------------------------
		// Step 4 : back to Vector3 (keep original y)
		// ------------------------------------------------------------------
		out.push(new Vector3(q.x, points[i].y, q.y));
	}
	return out;
}
