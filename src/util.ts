type Point = { x: number; y: number };

function getLineSegIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null {
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
}

function distance(p1: Point, p2: Point) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// 去重。如果多边形相邻多个点重复，那么就只保留一个
function dedup(points: Point[]) {
  const newPoints: Point[] = [];
  const size = points.length;
  for (let i = 0; i < size; i++) {
    const p = points[i];
    const nextP = points[(i + 1) % size];
    if (p.x !== nextP.x || p.y !== nextP.y) {
      newPoints.push(p);
    }
  }
  return newPoints;
}

function replaceIdx(indices: number[], oldIdx: number, newIdx: number) {
  const idx = indices.indexOf(oldIdx);
  if (idx !== -1) {
    indices[idx] = newIdx;
  }
}

function getCrossPtsAndAdjList(points: Point[]) {
  const crossPts: Point[] = [];
  const adjList = getAdjList(points.length);

  if (points.length < 3) {
    return { crossPts, adjList };
  }

  // [某条线]: [到线起点的距离, 在 points 中的索引值]
  // 如：{ '2-3', [[0, 2], [43, 5], [92, 3]] }
  const map = new Map<string, [number, number][]>();

  const size = points.length;
  // 1. 计算交点
  for (let i = 0; i < size - 2; i++) {
    const line1Start = points[i];
    const line1End = points[i + 1];

    let j = i + 2;
    for (; j < size; j++) {
      const line2EndIdx = (j + 1) % size;
      if (i === line2EndIdx) {
        // 两个是连续的线，且其中一个位置为 0，没有计算交点的意义
        continue;
      }
      const line2Start = points[j];
      const line2End = points[line2EndIdx];
      const crossPt = getLineSegIntersection(
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      if (crossPt) {
        // console.log(`${i}-${i + 1}, ${j}-${j + 1}`);
        crossPts.push(crossPt);
        // 更新邻接表
        const crossPtAdjPoints: number[] = [];
        const crossPtIdx = size + crossPts.length - 1;

        /************ 计算 line1Dist 并更新 line1 两个点对应的邻接表 ********/
        {
          const line1Key = `${i}-${i + 1}`;
          if (!map.has(line1Key)) {
            map.set(line1Key, [
              [0, i],
              [distance(line1Start, line1End), i + 1],
            ]);
          }
          const line1Dists = map.get(line1Key)!;
          // 计算相对 line1Start 的距离
          const crossPtDist = distance(line1Start, crossPt);
          // 看看在哪两个点中间
          const [_left, _right] = getRange(
            line1Dists.map((item) => item[0]),
            crossPtDist
          );

          const left = line1Dists[_left][1];
          const right = line1Dists[_right][1];
          crossPtAdjPoints.push(left, right);

          // 更新邻接表
          const line1StartAdjPoints = adjList[left];
          replaceIdx(line1StartAdjPoints, left, crossPtIdx);
          replaceIdx(line1StartAdjPoints, right, crossPtIdx);

          const line1EndAdjPoints = adjList[right];
          replaceIdx(line1EndAdjPoints, left, crossPtIdx);
          replaceIdx(line1EndAdjPoints, right, crossPtIdx);

          // 更新 map[line1Key] 数组
          line1Dists.splice(_right, 0, [crossPtDist, crossPtIdx]);
        }
        /************ 计算 line2Dist 并更新 line2 两个点对应的邻接表 ********/
        {
          const line2Key = `${j}-${line2EndIdx}`;
          if (!map.has(line2Key)) {
            map.set(line2Key, [
              [0, j],
              [distance(line2Start, line2End), line2EndIdx],
            ]);
          }
          const line2Dists = map.get(line2Key)!;
          const crossPtDist = distance(line2Start, crossPt);
          // 看看在哪两个点中间
          const [_left, _right] = getRange(
            line2Dists.map((item) => item[0]),
            crossPtDist
          );

          const left = line2Dists[_left][1];
          const right = line2Dists[_right][1];
          crossPtAdjPoints.push(left, right);

          line2Dists.splice(_right, 0, [crossPtDist, crossPtIdx]);

          // 更新邻接表
          const line2StartAdjPoints = adjList[left];
          // 替换掉原来的点
          replaceIdx(line2StartAdjPoints, left, crossPtIdx);
          replaceIdx(line2StartAdjPoints, right, crossPtIdx);

          const line2EndAdjPoints = adjList[right];
          replaceIdx(line2EndAdjPoints, left, crossPtIdx);
          replaceIdx(line2EndAdjPoints, right, crossPtIdx);
        }

        // 更新邻接表
        adjList.push(crossPtAdjPoints);
      }
    }
  }

  // const newPoints = points.concat(crossPts);
  // console.log("新的点", newPoints);
  // console.log("新的邻接表", adjList);
  return { crossPts, adjList };
}

// // 多边形
// const points: Point[] = [
//   { x: 0, y: 0 },
//   { x: 6, y: 0 },
//   { x: 0, y: 10 },
//   { x: 6, y: 10 },
// ];

// const data = getNewPolygon(points);
// console.log(data);

/**
 * 计算 target 在 nums 中的位置区间
 */
function getRange(nums: number[], target: number) {
  // TODO: 可优化为二分查找
  let left = 0;
  let right = nums.length - 1;

  for (let m = 0; m < nums.length - 1; m++) {
    const currNum = nums[m];
    const nextNum = nums[m + 1];
    if (target >= currNum && target <= nextNum) {
      left = m;
      right = m + 1;
      break;
    }
  }

  return [left, right];
}

/**
 * 基于点集，计算邻接表
 */
function getAdjList(size: number) {
  const adjList: number[][] = [];
  for (let i = 0; i < size; i++) {
    const left = i - 1 < 0 ? size - 1 : i - 1;
    const right = (i + 1) % size;
    adjList.push([left, right]);
  }
  return adjList;
}

// console.log(
//   "测试",
//   dedup([
//     { x: 0, y: 0 },
//     { x: 1, y: 1 },
//     { x: 1, y: 1 },
//     { x: 0, y: 0 },
//   ])
// );

// 计算轮廓线
export function getOutlinePolygon(points: Point[]) {
  points = dedup(points);

  if (points.length <= 3) {
    // console.warn("点至少得 3 个");
    return {
      crossPts: [],
      adjList: [],
      resultIndices: points.map((_, i) => i),
      resultPoints: points,
    };
  }

  console.log("---------- start ----------");
  console.log("去重后的原始点", points);
  const { crossPts, adjList } = getCrossPtsAndAdjList(points);
  const allPoints = [...points, ...crossPts];

  // 1. 找到最底边的点，如果有多个 y 相同的点，取最左边的点
  let bottomPoint = points[0];
  let bottomIndex = 0;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (p.y > bottomPoint.y || (p.y === bottomPoint.y && p.x < bottomPoint.x)) {
      bottomPoint = p;
      bottomIndex = i;
    }
  }
  console.log("最底边的点", bottomPoint);

  const outlineIndices = [bottomIndex];

  // 2. 遍历，找逆时针的下一个点
  // 9999 避免死循环
  const MAX_LOOP = 9999;
  for (let i = 0; i < MAX_LOOP; i++) {
    const prevIdx = outlineIndices[i - 1];
    const currIdx = outlineIndices[i];
    const prevPt = allPoints[prevIdx];
    const currPt = allPoints[currIdx];
    const baseVector =
      i == 0
        ? { x: 1, y: 0 } // 对于起点，它没有前一个点，用向右的向量
        : {
            x: prevPt.x - currPt.x,
            y: prevPt.y - currPt.y,
          };

    const adjPtIndices = adjList[outlineIndices[i]];

    let minRad = Infinity;
    let minRadIdx = -1;
    for (const index of adjPtIndices) {
      if (index === prevIdx) {
        continue;
      }
      const p = allPoints[index];
      // FIXME: 在特殊情况下，rad 为 NaN，因为可能有重复的点。解决方法是预处理的时候做去重处理
      const rad = getVectorRadian(currPt.x, currPt.y, p.x, p.y, baseVector);
      if (rad < minRad) {
        minRad = rad;
        minRadIdx = index;
      }
    }

    if (minRadIdx === outlineIndices[0]) {
      break; // 发现又跑到了起点，结束
    }

    outlineIndices.push(minRadIdx);
  }
  if (outlineIndices.length >= MAX_LOOP) {
    console.error(`轮廓多边形计算失败，超过最大循环次数 ${MAX_LOOP}`);
  }

  console.log("---------- end ----------");

  return {
    crossPts,
    adjList,
    resultIndices: outlineIndices,
    resultPoints: outlineIndices.map((i) => allPoints[i]),
  };
}

const DOUBLE_PI = Math.PI * 2;
/**
 * 求向量到上边(y负半轴)的夹角
 * 范围在 [0, Math.PI * 2)
 */
function getVectorRadian(
  cx: number,
  cy: number,
  x: number,
  y: number,
  baseVector: Point
) {
  const a = [x - cx, y - cy];
  const b = [baseVector.x, baseVector.y];

  const dotProduct = a[0] * b[0] + a[1] * b[1];
  const d =
    Math.sqrt(a[0] * a[0] + a[1] * a[1]) * Math.sqrt(b[0] * b[0] + b[1] * b[1]);
  // Math.acos(-1.0000000000000002) 会得到 NaN，这里做一个舍入处理
  let radian = Math.acos(parseFloat((dotProduct / d).toFixed(12)));

  radian = parseFloat(radian.toFixed(10));

  // 对于顺时针的夹角，要用 360 减去
  if (crossProduct(baseVector, { x: a[0], y: a[1] }) > 0) {
    radian = DOUBLE_PI - radian;
  }

  return radian;
}

function rad2deg(rad: number) {
  return (rad * 180) / Math.PI;
}

function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v2.x * v1.y;
}
