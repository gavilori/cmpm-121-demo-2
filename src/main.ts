import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Gyle's Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
header.style.filter = "drop-shadow(6px 6px black)";
app.append(header);

const canvas = document.createElement("canvas");
canvas.height = 256;
canvas.width = 256;
canvas.style.border = "solid 2pt black";
canvas.style.backgroundColor = "white";
canvas.style.borderRadius = "15px";
canvas.style.filter = "drop-shadow(6px 6px black)";
app.append(canvas);

const ctx = canvas.getContext("2d");

const cursor = { active: false, x: 0, y: 0 };

const evt = new Event("drawing-changed");

const lines: Point[][] = [];

interface Point {
  x: number;
  y: number;
}

let currentLine: Point[];

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: cursor.x, y: cursor.y });
  canvas.dispatchEvent(evt);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: cursor.x, y: cursor.y });
    canvas.dispatchEvent(evt);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = [];

  canvas.dispatchEvent(evt);
});

canvas.addEventListener("drawing-changed", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx?.beginPath();
      const { x, y } = line[0];
      ctx?.moveTo(x, y);
      for (const { x, y } of line) {
        ctx?.lineTo(x, y);
      }
      ctx?.stroke();
    }
  }
});

const br = document.createElement("br");
app.append(br);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.style.filter = "drop-shadow(6px 6px black)";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  canvas.dispatchEvent(evt);
});
