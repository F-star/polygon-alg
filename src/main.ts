import { Point } from "./type"

const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = 600
canvas.height = 600

/**
 * @type {{x:number, y:number}[]}
 */
const points: Point[] = []

/**
 * @type {{x:number, y:number} | null}
 */
let nextPoint: Point | null = null

/**
 * 
 * @param {MouseEvent} e 
 */
const onMousedown = (e: MouseEvent) =>{
  // 绘制点
  const x = e.clientX
  const y = e.clientY
  points.push({x, y})
  draw()
}

/**
 * 
 * @param {MouseEvent} e 
 */
const onMousemove = (e: MouseEvent) => {
  // 暂时不需要
  const x = e.clientX
  const y = e.clientY
  nextPoint = {x, y}
  draw()
}

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制线
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    ctx.lineTo(p.x, p.y)
  }
  if (nextPoint) {
    ctx.lineTo(nextPoint.x, nextPoint.y)
  }
  ctx.closePath()
  ctx.stroke()

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    drawPoint(p)
  }
  if (nextPoint) {
    drawPoint(nextPoint)
  }

}

const drawPoint = ({x, y}) => {
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}


canvas.addEventListener('mousedown', onMousedown)
canvas.addEventListener('mousemove', onMousemove)
