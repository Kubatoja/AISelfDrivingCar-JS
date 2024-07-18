class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 1.5) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false;
    this.controlType = controlType;
    this.useBrain = controlType == "AI";

    this.distance = 0;
    this.distanceCount = 0;

    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 6, 4]);
    }

    this.controls = new Controls(controlType);

    this.carImagesLoad();
  }

  carImagesLoad() {
    this.imgPlayer = new Image();
    this.imgDUMMY = new Image();
    this.imgDamaged = new Image();
    this.imgLoaded = false;
    Promise.all([
      new Promise((resolve) => {
        this.imgPlayer.onload = resolve;
        this.imgPlayer.src = "img/porshePLAYER.png"; // Set the correct path
      }),
      new Promise((resolve) => {
        this.imgDUMMY.onload = resolve;
        this.imgDUMMY.src = "img/porsheDUMMY.png"; // Set the correct path
      }),
      new Promise((resolve) => {
        this.imgDamaged.onload = resolve;
        this.imgDamaged.src = "img/porsheDamaged.png"; // Set the correct path
      }),
    ]).then(() => {
      this.imgLoaded = true;
    });
  }
  countDistance() {
    this.distanceCount += this.speed;
    this.distance = this.distanceCount - seconds;
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    } else {
      this.speed = 1;
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
    return false;
  }
  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }
  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.01 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.01 * flip;
      }
    }
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx, drawSensor = false) {
    if (!this.polygon) return;
    if (this.sensor && drawSensor) this.sensor.draw(ctx);
    ctx.beginPath();

    if (this.imgLoaded) {
      ctx.save();

      ctx.translate(this.x, this.y);

      ctx.rotate(-this.angle);
      if (this.damaged) {
        ctx.drawImage(this.imgDamaged, -17.5, -35, 35, 70);
      } else {
        if (this.controlType != "DUMMY") {
          ctx.drawImage(this.imgPlayer, -17.5, -35, 35, 70);
        } else {
          ctx.drawImage(this.imgDUMMY, -17.5, -35, 35, 70);
        }
      }

      ctx.restore();
    }
  }
}
