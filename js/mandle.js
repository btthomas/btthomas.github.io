(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 500 ? 500 : cWidth;
  const height = cHeight > 400 ? 400 : cHeight;

  let MAX = 64;
  let axis;
  const goal = {
    x: -0.7900105002101,
    y: -0.165003159937,
  };
  const zoomFactor = 0.1;
  let scale = [];
  let lastTime;

  document.querySelector('#restart').addEventListener('click', restart);

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  setAxis();

  setScale();

  const imageData = ctx.createImageData(width, height);
  const buf = new ArrayBuffer(imageData.data.length);
  const buf8 = new Uint8ClampedArray(buf);
  const data = new Uint32Array(buf);

  window.requestAnimationFrame(draw);

  function setAxis() {
    const aspectRatio = height / width;
    const startingWidth = 3.5;

    axis = {
      xmin: -2.5,
      xmax: 1,
      ymin: (-aspectRatio * startingWidth) / 2,
      ymax: (aspectRatio * startingWidth) / 2,
    };
  }

  function zoom() {
    axis = {
      xmin: (1 - zoomFactor) * axis.xmin + zoomFactor * goal.x,
      xmax: (1 - zoomFactor) * axis.xmax + zoomFactor * goal.x,
      ymin: (1 - zoomFactor) * axis.ymin + zoomFactor * goal.y,
      ymax: (1 - zoomFactor) * axis.ymax + zoomFactor * goal.y,
    };
  }

  function setScale() {
    let i = 0;
    while (i < MAX) {
      const rbg = d3
        .interpolateTurbo(i / (MAX - 1))
        .slice(4, -1)
        .split(',')
        .map((d) => +d);

      scale.push((255 << 24) | (rbg[2] << 16) | (rbg[1] << 8) | rbg[0]);
      i++;
    }
  }

  function draw(currTime) {
    if (lastTime && currTime - lastTime < 50) {
      return window.requestAnimationFrame(draw);
    }
    // const s = MAX;
    // console.time(s);
    lastTime = currTime;

    let y = 0,
      x = 0,
      xx = 0,
      yy = 0,
      xn = 0,
      yn = 0,
      xi = 0,
      yi = 0,
      t = -1;

    for (; y < height; y++) {
      for (x = 0; x < width; x++) {
        xx = ((axis.xmax - axis.xmin) * x) / width + axis.xmin;
        yy = ((axis.ymax - axis.ymin) * y) / height + axis.ymin;

        xn = xx;
        yn = yy;
        xi = 0;
        yi = 0;
        t = -1;

        while (t++ < MAX) {
          if (xn * xn + yn * yn > 3) {
            break;
          }
          xi = xn * xn - yn * yn + xx;
          yi = 2 * xn * yn + yy;
          xn = xi;
          yn = yi;
        }

        data[y * width + x] = scale[t % 64];
      }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    zoom();
    if (MAX++ > 380) {
      restart();
    }

    // console.timeEnd(s);
    window.requestAnimationFrame(draw);
  }

  function restart() {
    MAX = 64;
    setAxis();
  }
})();
