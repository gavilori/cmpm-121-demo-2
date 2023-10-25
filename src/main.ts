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
canvas.style.cursor = "none";
app.append(canvas);

const ctx = canvas.getContext("2d");

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];

let toolCommand: ToolCommand | null = null;

const bus = new EventTarget();

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

function redraw() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  commands.forEach((cmd) => cmd.display(ctx!));
}

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("tool-moved", redraw);

interface Point {
  x: number;
  y: number;
}

function tick() {
  redraw();
  requestAnimationFrame(tick);

  if (toolCommand) {
    toolCommand.draw(ctx!);
  }
}
tick();

const thicknessThin = 1;
const thicknessThick = 4;
let markerThickness: number = thicknessThin;

class LineCommand {
  points: Point[] = [];
  thickness: number = thicknessThin;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

const toolThinOffsetX = -5;
const toolThinOffsetY = 0;
const toolThickOffsetX = -10;
const toolThickOffsetY = 3;

class ToolCommand {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (markerThickness == thicknessThin) {
      ctx.font = "16px monospace";
      ctx.fillText(".", this.x + toolThinOffsetX, this.y + toolThinOffsetY);
    } else if (markerThickness == thicknessThick) {
      ctx.font = "32px monospace";
      ctx.fillText(".", this.x + toolThickOffsetX, this.y + toolThickOffsetY);
    }
  }
}

let currentLineCommand: LineCommand | null = null;

canvas.addEventListener("mouseout", () => {
  toolCommand = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  toolCommand = new ToolCommand(e.offsetX, e.offsetY);
  notify("tool-moved");
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(e.offsetX, e.offsetY, markerThickness);
  commands.push(currentLineCommand);
  redoCommands.splice(0, redoCommands.length);
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  toolCommand = new ToolCommand(e.offsetX, e.offsetY);
  notify("tool-moved");

  if (e.buttons == 1) {
    currentLineCommand!.points.push({ x: e.offsetX, y: e.offsetY });
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  notify("drawing-changed");
});

const br1 = document.createElement("br");
app.append(br1);

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
thinButton.style.filter = "drop-shadow(6px 6px black)";
thinButton.style.backgroundColor = "#375d45";
app.append(thinButton);
thinButton.addEventListener("click", () => {
  markerThickness = thicknessThin;
  thinButton.style.backgroundColor = "#375d45";
  thickButton.style.backgroundColor = ``;
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
thickButton.style.filter = "drop-shadow(6px 6px black)";
app.append(thickButton);
thickButton.addEventListener("click", () => {
  markerThickness = thicknessThick;
  thickButton.style.backgroundColor = "#375d45";
  thinButton.style.backgroundColor = "";
});

const br2 = document.createElement("br");
app.append(br2);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.style.filter = "drop-shadow(6px 6px black)";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  commands.splice(0, commands.length);
  notify("drawing-changed");
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.style.filter = "drop-shadow(6px 6px black)";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    notify("drawing-changed");
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.style.filter = "drop-shadow(6px 6px black)";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    notify("drawing-changed");
  }
});
