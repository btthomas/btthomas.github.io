(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 500 ? 500 : cWidth;
  const height = cHeight > 400 ? 400 : cHeight;

  const cx = -0.8;
  const cy = 0.156;
  let MAX = 64;
  let axis;
  const goal = {
    x: 0.2434913,
    y: -0.25,
  };
  const zoomFactor = 0.06;
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
    const startingWidth = 4;

    axis = {
      xmin: -2,
      xmax: 2,
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
        .interpolateRainbow(i / (MAX - 1))
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
    lastTime = currTime;

    let y = 0,
      x = 0,
      xn = 0,
      yn = 0,
      xi = 0,
      t = -1;

    for (; y < height; y++) {
      for (x = 0; x < width; x++) {
        xn = ((axis.xmax - axis.xmin) * x) / width + axis.xmin;
        yn = ((axis.ymax - axis.ymin) * y) / height + axis.ymin;
        t = -1;

        while (t++ < MAX) {
          if (xn * xn + yn * yn > 2) {
            break;
          }
          xi = xn * xn - yn * yn + cx;
          yn = 2 * xn * yn + cy;
          xn = xi;
        }

        data[y * width + x] = scale[t % 64];
      }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    zoom();
    if (MAX++ > 320) {
      restart();
    }

    window.requestAnimationFrame(draw);
  }

  function restart() {
    MAX = 64;
    const inputs = document.querySelector('.inputs');
    goal.x = +inputs.querySelector('.x').value;
    goal.y = 0 - +inputs.querySelector('.y').value;
    setAxis();
  }
})();
