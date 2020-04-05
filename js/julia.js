(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 800 ? 800 : cWidth;
  const height = cHeight > 600 ? 600 : cHeight;

  let CX = -0.775;
  let CY = 0.1625;
  const CR = 0.02;
  const omega = 0.005;
  const MAX = 128;
  const COLORS = 127;
  const PI = Math.PI;
  const MAX_SPEED = 75;
  let lastTime;
  let axis;
  let scale = [];
  let cx, cy;
  let theta = 0;

  document.querySelector('#restart').addEventListener('click', restart);

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  const imageData = ctx.createImageData(width, height);
  const buf = new ArrayBuffer(imageData.data.length);
  const buf8 = new Uint8ClampedArray(buf);
  const data = new Uint32Array(buf);

  setAxis();

  setScale();

  rotate();

  window.requestAnimationFrame(draw);

  function setAxis() {
    const aspectRatio = height / width;
    const maxStartingWidth = 2;
    const maxStartingHeight = 2;

    if (aspectRatio < 1) {
      axis = {
        xmin: -1,
        xmax: -1 + maxStartingWidth,
        ymin: (-aspectRatio * maxStartingWidth) / 2,
        ymax: (aspectRatio * maxStartingWidth) / 2,
      };
    } else {
      axis = {
        xmin: -maxStartingHeight / (2 * aspectRatio),
        xmax: maxStartingHeight / (2 * aspectRatio),
        ymin: -1,
        ymax: -1 + maxStartingHeight,
      };
    }
  }

  function setScale() {
    let i = 0;
    while (i <= COLORS) {
      const rbg = d3
        .interpolateCubehelixDefault(i / COLORS)
        .slice(4, -1)
        .split(',')
        .map((d) => +d);

      scale.push((255 << 24) | (rbg[2] << 16) | (rbg[1] << 8) | rbg[0]);
      i++;
    }
  }

  function rotate() {
    cx = Math.cos(theta * 2 * PI) * CR + CX;
    cy = Math.sin(theta * 2 * PI) * CR + CY;
    theta += omega;
  }

  function draw(currTime) {
    if (lastTime && currTime - lastTime < MAX_SPEED) {
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
          if (xn * xn + yn * yn > 3) {
            break;
          }
          xi = xn * xn - yn * yn + cx;
          yn = 2 * xn * yn + cy;
          xn = xi;
        }

        data[y * width + x] = scale[t % (COLORS + 1)];
      }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    rotate();
    window.requestAnimationFrame(draw);
  }

  function restart() {
    const inputs = document.querySelector('.inputs');
    CX = +inputs.querySelector('.x').value;
    CY = +inputs.querySelector('.y').value;
    theta = 0;
    rotate();
  }
})();
