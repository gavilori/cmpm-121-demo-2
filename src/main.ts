/*
Random Color Generator Code from: https://stackoverflow.com/questions/46592120/how-to-set-unchanging-transparency-on-a-random-hex-color-generator 
*/

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

const commands: (LineCommand | StickerCommand)[] = [];
const redoCommands: (LineCommand | StickerCommand)[] = [];

let toolCommand: ToolCommand | null = null;

const bus = new EventTarget();

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

function redraw(context: CanvasRenderingContext2D) {
  context?.clearRect(0, 0, canvas.width, canvas.height);

  commands.forEach((cmd) => cmd.display(context));
}

bus.addEventListener("drawing-changed", () => {
  redraw(ctx!);
});
bus.addEventListener("tool-moved", () => {
  redraw(ctx!);
});

interface Point {
  x: number;
  y: number;
}

function tick() {
  redraw(ctx!);
  requestAnimationFrame(tick);

  if (toolCommand) {
    toolCommand.draw(ctx!);
  }
}
tick();

enum Tools {
  marker,
  sticker,
}

let currentTool = Tools.marker;

const thicknessThin = 2;
const thicknessThick = 6;
let markerThickness: number = thicknessThin;
let markerColor = "black";

class LineCommand {
  points: Point[] = [];
  thickness: number = thicknessThin;
  color = "black";

  constructor(x: number, y: number, thickness: number, color?: string) {
    this.points = [{ x, y }];
    this.thickness = thickness;
    if (color) {
      this.color = color;
    }
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
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

let currentSticker: string | null = null;

class StickerCommand {
  points: Point[] = [];
  sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.points = [{ x, y }];
    this.sticker = sticker;
  }

  display(ctx: CanvasRenderingContext2D) {
    for (const { x, y } of this.points) {
      ctx.font = "24px monospace";
      ctx.fillText(this.sticker, x, y);
    }
  }
}

class ToolCommand {
  x: number;
  y: number;
  mode: Tools;
  constructor(x: number, y: number, mode: Tools) {
    this.x = x;
    this.y = y;
    this.mode = mode;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.mode == Tools.marker) {
      ctx.fillStyle = markerColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, markerThickness / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else if (this.mode == Tools.sticker && currentSticker) {
      ctx.font = "24px monospace";
      ctx.fillText(currentSticker, this.x, this.y);
    }
  }
}

let currentCommand: LineCommand | StickerCommand | null = null;

canvas.addEventListener("mouseout", () => {
  toolCommand = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  toolCommand = new ToolCommand(e.offsetX, e.offsetY, currentTool);
  notify("tool-moved");
});

canvas.addEventListener("mousedown", (e) => {
  if (currentTool == Tools.marker) {
    currentCommand = new LineCommand(
      e.offsetX,
      e.offsetY,
      markerThickness,
      markerColor
    );
  } else {
    currentCommand = new StickerCommand(e.offsetX, e.offsetY, currentSticker!);
  }
  commands.push(currentCommand);
  redoCommands.splice(0, redoCommands.length);
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  toolCommand = new ToolCommand(e.offsetX, e.offsetY, currentTool);
  notify("tool-moved");

  if (e.buttons == 1) {
    if (currentTool == Tools.marker) {
      currentCommand!.points.push({ x: e.offsetX, y: e.offsetY });
      notify("drawing-changed");
    } else if (currentTool == Tools.sticker) {
      currentCommand!.points[0] = { x: e.offsetX, y: e.offsetY };
    }
  }
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
  notify("drawing-changed");
});

app.append(document.createElement("br"));
app.append(document.createElement("br"));

interface ToolButton {
  name: string;
  tool: Tools;
  thickness?: number;
  sticker?: string;
  htmlButton?: HTMLButtonElement;
}

const toolButtons: ToolButton[] = [
  {
    name: "Thin",
    tool: Tools.marker,
    thickness: thicknessThin,
  },
  {
    name: "Thick",
    tool: Tools.marker,
    thickness: thicknessThick,
  },
  {
    name: "🤣",
    tool: Tools.sticker,
    sticker: "🤣",
  },
  {
    name: "🤷‍♂️",
    tool: Tools.sticker,
    sticker: "🤷‍♂️",
  },
  {
    name: "👀",
    tool: Tools.sticker,
    sticker: "👀",
  },
];

const toolHtmlButtons: HTMLButtonElement[] = [];

toolButtons.forEach((button) => {
  button.htmlButton = document.createElement("button");
  button.htmlButton.innerHTML = button.name;
  button.htmlButton.style.filter = "drop-shadow(6px 6px black)";
  app.append(button.htmlButton);
  toolHtmlButtons.push(button.htmlButton);

  button.htmlButton.addEventListener("click", () => {
    toolHtmlButtons.forEach((button) => {
      button.style.backgroundColor = "";
    });
    button.htmlButton!.style.backgroundColor = "green";

    currentTool = button.tool;

    if (button.thickness) {
      markerThickness = button.thickness;
    }
    if (button.sticker) {
      currentSticker = button.sticker;
    }
    const randomColor =
      Math.floor(Math.random() * 255).toString() +
      "," +
      Math.floor(Math.random() * 255).toString() +
      "," +
      Math.floor(Math.random() * 255).toString();
    markerColor = `rgba(${randomColor}, 1)`;
  });
});

app.append(document.createElement("br"));
app.append(document.createElement("br"));

const customButton = document.createElement("button");
customButton.innerHTML = "Custom Sticker";
customButton.style.filter = "drop-shadow(6px 6px black)";
app.append(customButton);
toolHtmlButtons.push(customButton);

customButton.addEventListener("click", () => {
  toolHtmlButtons.forEach((button) => {
    button.style.backgroundColor = "";
  });
  customButton.style.backgroundColor = "green";

  currentTool = Tools.sticker;
  const text = prompt("Custom sticker text", "");
  currentSticker = text;
});

app.append(document.createElement("br"));
app.append(document.createElement("br"));

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

app.append(document.createElement("br"));
app.append(document.createElement("br"));

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.style.filter = "drop-shadow(6px 6px black)";
app.append(exportButton);

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d");
  exportCtx?.scale(4, 4);
  redraw(exportCtx!);

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
