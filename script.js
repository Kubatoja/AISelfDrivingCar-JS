const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.1);
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(1), -100, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(0), -300, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -300, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(0), -500, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(1), -500, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(1), -700, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -700, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(0), -900, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -900, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -1100, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(1), -1100, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(1), -1300, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(0), -1300, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(0), -1500, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -1500, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(1), -1700, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -1700, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(1), -1900, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -1900, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(0), -2100, 35, 70, "DUMMY", 1),
  new Car(road.getLaneCenter(2), -2100, 35, 70, "DUMMY", 1),
];

// function randomInt(min, max) {
//   // min and max included
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }
// const traffic = [];
// for (let i = 1; i <= 40; i = i + 2) {
//   console.log(i);
//   for (let j = 0; j < 2; j++) {
//     traffic.push(
//       new Car(road.getLaneCenter(randomInt(0, 2)), i * -100, 35, 70, "DUMMY", 1)
//     );
//   }
// }

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 35, 70, "AI"));
  }
  return cars;
}
var seconds = 0;
setInterval(() => {
  seconds++;
  document.getElementById("seconds").innerText = seconds;

  bestCar = cars.find(
    (car) => car.distance == Math.max(...cars.map((car) => car.distance))
  );
  let deadCars = 0;
  cars.forEach((car) => {
    car.countDistance();
    if (
      car.damaged == true ||
      (car.distance < 10 && seconds > 50) ||
      (car.speed < 1.2 && seconds > 100)
    ) {
      deadCars++;
    }
    if (deadCars == cars.length) {
      save();
      window.location.reload();
    }
  });
  // console.log(bestCar.distance);
}, 100);

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic, seconds);
  }

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
  carCtx.save();

  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx);
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx);
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
