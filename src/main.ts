import { getOutlinePolygon } from "./util";
import { Point } from "./type";

const canvas = document.querySelector("#draw-area") as HTMLCanvasElement;

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

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 计算交点
  // if (allPoints.length > 3) {
  const { crossPts, adjList, resultIndices, resultPoints } =
    getOutlinePolygon(allPoints);

  // fillPolygon(ctx, resultPoints);
  drawOutlinePolygon(resultPoints);

  strokePolygon(ctx, allPoints);

  for (let i = 0; i < allPoints.length; i++) {
    const p = allPoints[i];
    drawPoint(ctx, p);
    drawNumText(ctx, p, i + "");
  }

  for (let i = 0; i < crossPts.length; i++) {
    const pt = crossPts[i];
    drawPoint(ctx, pt, "#f04");
    drawNumText(ctx, pt, allPoints.length + i + "", "#f04");
  }
  document.querySelector("#outlinePoints")!.innerHTML =
    resultIndices.join(", ");
  document.querySelector("#adjListInfo")!.innerHTML = toInfoStr(adjList);
};

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  { x, y }: Point,
  color?: string
) => {
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

const drawNumText = (
  ctx: CanvasRenderingContext2D,
  p: Point,
  text: string,
  color?: string,
  offsetX = -3
) => {
  ctx.save();
  const offsetY = -10;
  if (color) {
    ctx.fillStyle = color;
  }
  ctx.font = "12px sans-serif";
  ctx.fillText(
    // `${text}(${parseFloat(p.x.toFixed(1))},${parseFloat(p.y.toFixed(1))})`,
    text,
    p.x + offsetX,
    p.y + offsetY
  );
  ctx.restore();
};

function strokePolygon(ctx: CanvasRenderingContext2D, points: Point[]) {
  // 绘制线
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function fillPolygon(ctx: CanvasRenderingContext2D, points: Point[]) {
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
}

const toInfoStr = (adjList: number[][]) => {
  return adjList
    .map((item, i) => {
      return `${i}: [${item.join(", ")}]`;
    })
    .join("<br>");
};

function drawOutlinePolygon(points: Point[]) {
  const outlineCanvas = document.querySelector("#outline") as HTMLCanvasElement;
  const ctx = outlineCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);

  fillPolygon(ctx, points);

  strokePolygon(ctx, points);

  const visited = new Set<string>();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    drawPoint(ctx, p);
    const key = `${p.x}-${p.y}`;
    if (visited.has(key)) {
      drawNumText(ctx, p, `(${i})`, undefined, 10);

      continue;
    } else {
      visited.add(key);
      drawNumText(ctx, p, i + "");
    }
  }
}

canvas.addEventListener("mousedown", onMousedown);
canvas.addEventListener("mousemove", onMousemove);
