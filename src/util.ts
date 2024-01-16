type Point = { x: number; y: number };
type Edge = [number, number];
type Polygon = { [key: number]: { point: Point; edge: number[] } };

const getLineSegIntersection = (
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null => {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { x: x3, y: y3 } = p3;
  const { x: x4, y: y4 } = p4;

  const a = y2 - y1;
  const b = x1 - x2;
  const c = x1 * y2 - x2 * y1;

  const d = y4 - y3;
  const e = x3 - x4;
  const f = x3 * y4 - x4 * y3;

  // 计算分母
  const denominator = a * e - b * d;

  // 判断分母是否为 0（代表平行）
  if (Math.abs(denominator) < 0.000000001) {
    // 这里有个特殊的重叠但只有一个交点的情况，可以考虑处理一下
    return null;
  }

  const px = (c * e - f * b) / denominator;
  const py = (a * f - c * d) / denominator;

  // 判断交点是否在两个线段上
  if (
    px >= Math.min(x1, x2) &&
    px <= Math.max(x1, x2) &&
    py >= Math.min(y1, y2) &&
    py <= Math.max(y1, y2) &&
    px >= Math.min(x3, x4) &&
    px <= Math.max(x3, x4) &&
    py >= Math.min(y3, y4) &&
    py <= Math.max(y3, y4)
  ) {
    return { x: px, y: py };
  }

  return null;
};

export function getNewPolygon(points: Point[], adjList: number[][]) {
  if (points.length < 3) {
    console.warn("点至少得 3 个");
    return [];
  }
  // 0. 补一个点。
  // points = [...points, { ...points[0] }];

  const intersectionPoints: Point[] = [];
  const newAdjList = JSON.parse(JSON.stringify(adjList)); // 拷贝一份

  // 1. 计算交点
  for (let i = 0; i < points.length - 1; i++) {
    const line1Start = points[i];
    const line1End = points[i + 1];

    let j = i + 2;
    for (; j < points.length; j++) {
      if (i === 0 && (j + 1) % points.length === 0) {
        // 两个是连续的线，且其中一个位置为 0，没有计算交点的意义
        continue;
      }

      console.log(`${i}-${i + 1}, ${j}-${j + 1}`);
      const line2Start = points[j];
      const line2End = points[(j + 1) % points.length];
      const intersectionPoint = getLineSegIntersection(
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      if (intersectionPoint) {
        // 更新邻接表
        intersectionPoints.push(intersectionPoint);
      }
    }
  }

  return intersectionPoints;
}

// 多边形
const points: Point[] = [
  { x: 0, y: 0 },
  { x: 6, y: 0 },
  { x: 0, y: 10 },
  { x: 6, y: 10 },
];

// 邻接表
const adjList = [
  [2, 4],
  [1, 3],
  [2, 4],
  [1, 3],
];

const data = getNewPolygon(points, []);
console.log(data);
