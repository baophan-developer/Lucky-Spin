const spinAction = document.getElementById("spin-action");
const spinElement = document.getElementById("spin").getContext("2d");
const formElement = document.getElementById("form-member");
let sectors = [];
let tot = 0;
let size = 600;
const dia = size;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
let arc = TAU / sectors.length;
const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians
let spinButtonClicked = false;

const events = {
    listeners: {},
    addEventListener: function (eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);
    },
    fire: function (eventName, ...args) {
        if (this.listeners[eventName]) {
            for (let fn of this.listeners[eventName]) {
                fn(...args);
            }
        }
    },
};

function random(m, M) {
    return Math.random() * (M - m) + m;
}

function getIndex() {
    return Math.floor(tot - (ang / TAU) * tot) % tot;
}

function drawSector(sector, i) {
    const ang = arc * i;
    spinElement.save();

    // COLOR
    spinElement.beginPath();
    spinElement.fillStyle = `hsl(${(360 / sectors.length) * i},100%,75%)`;
    spinElement.moveTo(rad, rad);
    spinElement.arc(rad, rad, rad, ang, ang + arc);
    spinElement.lineTo(rad, rad);
    spinElement.fill();

    // TEXT
    spinElement.translate(rad, rad);
    spinElement.rotate(ang + arc / 2);
    spinElement.textAlign = "right";
    spinElement.fillStyle = "black";
    spinElement.font = "30px 'Fira Code', serif";
    spinElement.fillText(sector, rad - 10, 10);

    spinElement.restore();
}

function rotate() {
    const sector = sectors[getIndex()];
    spinElement.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

    spinAction.innerText = !angVel ? "Play" : sector;
    spinAction.style.background = "#6c7ee1";
    spinAction.style.color = "#fff";
}

function frame() {
    if (!angVel && spinButtonClicked) {
        const finalSector = sectors[getIndex()];
        events.fire("spinEnd", finalSector);
        spinButtonClicked = false;
        return;
    }

    angVel *= friction;

    if (angVel < 0.002) angVel = 0;

    ang += angVel;
    ang %= TAU;
    rotate();
}

function engine() {
    frame();
    requestAnimationFrame(engine);
}

function init() {
    sectors.forEach(drawSector);
    rotate();
    engine();
    spinAction.addEventListener("click", () => {
        if (!angVel) angVel = random(0.25, 0.45);
        spinButtonClicked = true;
    });
}

function setup() {
    const widthWindow = window.innerWidth;
    if (widthWindow <= 500) {
        size = 400;
    } else if (widthWindow <= 768) {
        size = 500;
    } else {
        size = 600;
    }
    spinElement.canvas.width = size;
    spinElement.canvas.height = size;
    init();
}

function handleSubmitForm(e) {
    e.preventDefault();
    sectors = [];
    const textArea = document.querySelector("#form-member textarea");
    const values = textArea.value;
    if (!values) {
        alert("Please enter your data");
        return;
    }
    const result = values.split(",");
    sectors.push(...result);
    tot = sectors.length;
    arc = TAU / sectors.length;
    init();
}

formElement.addEventListener("submit", handleSubmitForm);
window.addEventListener("resize", setup);
events.addEventListener("spinEnd", (sector) => {
    alert(`Opp, you won ${sector}`);
});

setup();
