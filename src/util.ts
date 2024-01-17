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

function getNewPolygon(points: Point[]) {
  const crossPts: Point[] = [];
  const adjList = getAdjList(points.length);

  if (points.length < 3) {
    return { crossPts, adjList };
  }

  /**
   * {
   *  [某条线]: [到线起点的距离, 在 points 中的索引值]
   *  '2-3', [[0, 2], [43, 5], [92, 3]
   * }
   */
  const map = new Map<string, [number, number][]>();

  const size = points.length;
  // 1. 计算交点
  for (let i = 0; i < size - 1; i++) {
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
        const newVertexes: number[] = [];

        // 计算相对 line1Start 的距离
        const crossPtIdx = size + crossPts.length - 1;
        // console.log("crossPtIdx", crossPtIdx);

        /************ 更新 line1Dist 和 line2 对应的邻接表 ********/
        {
          const line1Key = `${i}-${i + 1}`;
          if (!map.has(line1Key)) {
            map.set(line1Key, [
              [0, i],
              [distance(line1Start, line1End), i + 1],
            ]);
          }
          const line1Dists = map.get(line1Key)!;
          const crossPtDist = distance(line1Start, crossPt);
          // 看看在哪两个点中间
          const [_left, _right] = getRange(
            line1Dists.map((item) => item[0]),
            crossPtDist
          );

          const left = line1Dists[_left][1];
          const right = line1Dists[_right][1];
          newVertexes.push(left, right);

          line1Dists.splice(_right, 0, [crossPtDist, crossPtIdx]);

          // 更新邻接表
          const adjLine1Start = adjList[left];
          // 如果这个相交点靠近起点，替换掉原来的点
          if (adjLine1Start.indexOf(left) !== -1) {
            adjLine1Start[adjLine1Start.indexOf(left)] = crossPtIdx;
          }
          if (adjLine1Start.indexOf(right) !== -1) {
            adjLine1Start[adjLine1Start.indexOf(right)] = crossPtIdx;
          }

          const adjLine1End = adjList[right];
          if (adjLine1End.indexOf(left) !== -1) {
            adjLine1End[adjLine1End.indexOf(left)] = crossPtIdx;
          }
          if (adjLine1End.indexOf(right) !== -1) {
            adjLine1End[adjLine1End.indexOf(right)] = crossPtIdx;
          }
        }
        /************ 更新 line2Dist 和 line1 对应的邻接表 ********/
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
          newVertexes.push(left, right);

          line2Dists.splice(_right, 0, [crossPtDist, crossPtIdx]);

          // 更新邻接表
          const adjLine2Start = adjList[left];
          // 替换掉原来的点
          if (adjLine2Start.indexOf(left) !== -1) {
            adjLine2Start[adjLine2Start.indexOf(left)] = crossPtIdx;
          }
          if (adjLine2Start.indexOf(right) !== -1) {
            adjLine2Start[adjLine2Start.indexOf(right)] = crossPtIdx;
          }

          const adjLine2End = adjList[right];
          if (adjLine2End.indexOf(left) !== -1) {
            adjLine2End[adjLine2End.indexOf(left)] = crossPtIdx;
          }
          if (adjLine2End.indexOf(right) !== -1) {
            adjLine2End[adjLine2End.indexOf(right)] = crossPtIdx;
          }
        }

        // 更新邻接表
        adjList.push(newVertexes);
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

  const { crossPts, adjList } = getNewPolygon(points);
  const allPoints = [...points, ...crossPts];
  if (points.length <= 3) {
    // console.warn("点至少得 3 个");
    return {
      crossPts,
      adjList,
      resultIndices: points.map((_, i) => i),
      resultPoints: points,
    };
  }

  // 1. 找到最底边的点，如果有多个 y 相同的点，取最左边的点
  let bottomPoint = points[0];
  let bottomIndex = 0;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (p.y > bottomPoint.y) {
      bottomPoint = p;
      bottomIndex = i;
    } else if (p.y === bottomPoint.y && p.x < bottomPoint.x) {
      bottomPoint = p;
      bottomIndex = i;
    }
  }
  console.log("最底边的点", bottomPoint);

  const resultIndices = [bottomIndex];

  // 2. 找轮廓线的第一条边
  // TODO: 这段代码和下面的代码有点重复了，可以放一起
  {
    const adjPtIndices = adjList[bottomIndex];

    let minRad = Infinity;
    let minRadIndex = -1;
    for (const index of adjPtIndices) {
      const p = allPoints[index];
      const rad = getVectorRadian(bottomPoint.x, bottomPoint.y, p.x, p.y, {
        x: -1,
        y: 0,
      });
      // console.log("rad" + index, rad2deg(rad));
      if (rad < minRad) {
        minRad = rad;
        minRadIndex = index;
      }
    }
    // console.log("逆时针的下一个点", { minRadIndex, minDeg: rad2deg(minRad) });
    resultIndices.push(minRadIndex);
  }

  // 3. 遍历，找逆时针的下一个点
  // 9999 避免死循环
  for (let i = 1; i < 9999; i++) {
    const prevIdx = resultIndices[i - 1];
    const currIdx = resultIndices[i];
    const prevPt = allPoints[prevIdx];
    const currPt = allPoints[currIdx];
    const baseVector = {
      x: prevPt.x - currPt.x,
      y: prevPt.y - currPt.y,
    };

    const adjPtIndices = adjList[resultIndices[i]];

    let minRad = Infinity;
    let minRadIndex = -1;
    for (const index of adjPtIndices) {
      if (index === prevIdx) {
        continue;
      }
      const p = allPoints[index];
      const rad = getVectorRadian(currPt.x, currPt.y, p.x, p.y, baseVector);
      if (rad < minRad) {
        minRad = rad;
        minRadIndex = index;
      }
    }

    if (minRadIndex === resultIndices[0]) {
      console.log("完成，最终轮廓多边形为", resultIndices);
      break; // 发现又跑到了起点，结束
    }

    resultIndices.push(minRadIndex);
  }

  console.log("轮廓多边形的点", resultIndices);

  return {
    crossPts,
    adjList,
    resultIndices,
    resultPoints: resultIndices.map((i) => allPoints[i]),
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
  let radian = Math.acos(dotProduct / d);

  if (crossProduct(baseVector, { x: a[0], y: a[1] }) > 0) {
    radian = DOUBLE_PI - radian;
  }

  return radian;
}

// function rad2deg(rad: number) {
//   return (rad * 180) / Math.PI;
// }

function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v2.x * v1.y;
}
