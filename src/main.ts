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

// const ctx = canvas.getContext("2d");
