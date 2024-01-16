import { getOutlinePolygon } from "./outline";
import { Point } from "./type";
import "./util";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

canvas.width = 600;
canvas.height = 600;

/**
 * @type {{x:number, y:number}[]}
 */
const points: Point[] = [];

/**
 * @type {{x:number, y:number} | null}
 */
let nextPoint: Point | null = null;

/**
 *
 * @param {MouseEvent} e
 */
const onMousedown = (e: MouseEvent) => {
  // 绘制点
  const x = e.clientX;
  const y = e.clientY;
  points.push({ x, y });
  draw();
};

/**
 *
 * @param {MouseEvent} e
 */
const onMousemove = (e: MouseEvent) => {
  // 暂时不需要
  const x = e.clientX;
  const y = e.clientY;
  nextPoint = { x, y };
  draw();
};

const draw = () => {
  const allPoints = [...points];
  if (nextPoint) {
    allPoints.push(nextPoint);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 计算交点
  // if (allPoints.length > 3) {
  const { crossPts, adjList, resultIndices, resultPoints } =
    getOutlinePolygon(allPoints);
  fillPolygon(resultPoints);

  // 绘制线
  ctx.beginPath();
  for (let i = 0; i < allPoints.length; i++) {
    const p = allPoints[i];
    ctx.lineTo(p.x, p.y);
  }
  if (nextPoint) {
    ctx.lineTo(nextPoint.x, nextPoint.y);
  }
  ctx.closePath();
  ctx.stroke();

  for (let i = 0; i < allPoints.length; i++) {
    const p = allPoints[i];
    drawPoint(p);
    drawNumText(p, i);
  }

  for (let i = 0; i < crossPts.length; i++) {
    const pt = crossPts[i];
    drawPoint(pt, "#f04");
    drawNumText(pt, allPoints.length + i, "#f04");
  }
  document.querySelector("#outline")!.innerHTML = resultIndices.join();
  document.querySelector("#adjListInfo")!.innerHTML = toInfoStr(adjList);
};

const drawPoint = ({ x, y }: Point, color?: string) => {
  ctx.save();
  if (color) {
    ctx.fillStyle = color;
  }
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
};

const drawNumText = (p: Point, i: number, color?: string) => {
  ctx.save();
  const offsetX = -3;
  const offsetY = -10;
  if (color) {
    ctx.fillStyle = color;
  }
  ctx.font = "12px sans-serif";
  ctx.fillText(
    // `${i}(${parseFloat(p.x.toFixed(1))},${parseFloat(p.y.toFixed(1))})`,
    `${i}`,
    p.x + offsetX,
    p.y + offsetY
  );
  ctx.restore();
};

const fillPolygon = (points: Point[]) => {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "#dde3e9";
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const toInfoStr = (adjList: number[][]) => {
  return adjList
    .map((item, i) => {
      return `${i}: [${item.join(", ")}]`;
    })
    .join("<br>");
};

canvas.addEventListener("mousedown", onMousedown);
canvas.addEventListener("mousemove", onMousemove);
