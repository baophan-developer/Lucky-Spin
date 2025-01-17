const sectors = [
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets + Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "You lose" },
    { color: "#FFBC03", text: "#333333", label: "Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "Sweets" },
];

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

const random = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinAction = document.getElementById("spin-action");
const spinElement = document.getElementById("spin").getContext("2d");
const dia = spinElement.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
    const ang = arc * i;
    spinElement.save();

    // COLOR
    spinElement.beginPath();
    spinElement.fillStyle = sector.color;
    spinElement.moveTo(rad, rad);
    spinElement.arc(rad, rad, rad, ang, ang + arc);
    spinElement.lineTo(rad, rad);
    spinElement.fill();

    // TEXT
    spinElement.translate(rad, rad);
    spinElement.rotate(ang + arc / 2);
    spinElement.textAlign = "right";
    spinElement.fillStyle = sector.text;
    spinElement.font = "bold 30px 'Fira Code', serif";
    spinElement.fillText(sector.label, rad - 10, 10);

    spinElement.restore();
}

function rotate() {
    const sector = sectors[getIndex()];
    spinElement.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

    spinAction.textContext = !angVel ? "SPIN" : sector.label;
    spinAction.style.background = sector.color;
    spinAction.style.color = sector.text;
}

function frame() {
    if (!angVel && spinButtonClicked) {
        const finalSector = sectors[getIndex()];
        events.fire("spinEnd", finalSector);
        spinButtonClicked = false;
        return;
    }

    angVel *= friction;

    if (angVel < 0.002) {
        ang += angVel;
        ang %= TAU;
        rotate();
    }
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

init();

events.addEventListener("spinEnd", (sector) => {
    alert(`Opp, you won ${sector.label}`);
});
