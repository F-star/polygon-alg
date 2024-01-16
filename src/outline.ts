// 计算轮廓线

import { Point } from "./type";
import { getNewPolygon } from "./util";

export const getOutlinePolygon = (points: Point[]) => {
  const { crossPts, adjList } = getNewPolygon(points);
  const allPoints = [...points, ...crossPts];

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

  // 2. 找顺时针的下一个点
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
      console.log("rad" + index, rad2deg(rad));
      if (rad < minRad) {
        minRad = rad;
        minRadIndex = index;
      }
    }
    console.log("顺时针的下一个点", { minRadIndex, minDeg: rad2deg(minRad) });
    resultIndices.push(minRadIndex);
  }

  for (let i = 1; i < 999; i++) {
    const prevIdx = resultIndices[i - 1];
    const currIdx = resultIndices[i];
    const prevPt = allPoints[prevIdx];
    const currPt = allPoints[currIdx];
    const baseVector = {
      x: prevPt.x - currPt.x,
      y: prevPt.y - currPt.y,
    };

    const adjPtIndices = adjList[resultIndices[i]];

    // 2 个临接点，一个一定是 preIndex，另一个就是 nextIndex
    // 理论上可以删除，后面的代码处理了这种情况
    // if (adjPtIndices.length === 2) {
    //   const nextIndex = adjPtIndices.find((idx) => idx !== prevIdx)!;
    //   resultIndices.push(nextIndex);
    //   continue;
    // }

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
      break;
    }

    resultIndices.push(minRadIndex);
  }

  console.log("轮廓多边形的点", resultIndices);

  return {
    crossPts,
    adjList,
    resultIndices,
  };
};

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

function rad2deg(rad: number) {
  return (rad * 180) / Math.PI;
}

// function crossProduct(p1: Point, p2: Point, p3: Point): number {
//   const x1 = p2.x - p1.x;
//   const y1 = p2.y - p1.y;
//   const x2 = p3.x - p1.x;
//   const y2 = p3.y - p1.y;
//   return x1 * y2 - x2 * y1;
// }

function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v2.x * v1.y;
}
