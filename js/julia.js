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
  const PI = Math.PI;
  const MAX_SPEED = 75;
  let lastTime;
  let axis;
  let scale = [];
  let cx, cy;
  let theta = 0;
  let currentColorScale = d3.interpolateCubehelixDefault;

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

  window.handleChangeColor = function (str) {
    currentColorScale = d3[str];
    setScale();
  };

  function setScale() {
    scale = [];
    let i = 0;
    let rbg = [];

    while (i < MAX) {
      const color = currentColorScale(i / (MAX - 1));

      if (color[0] === '#') {
        // hex string
        rbg = [
          +`0x${color.slice(1, 3)}`,
          +`0x${color.slice(3, 5)}`,
          +`0x${color.slice(5)}`,
        ];
      } else {
        // rgb string
        rbg = color
          .slice(4, -1)
          .split(',')
          .map((d) => +d);
      }
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

        data[y * width + x] = scale[t % MAX];
      }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    rotate();
    window.requestAnimationFrame(draw);
  }

  function restart() {
    const inputs = document.getElementById('inputs');
    CX = +inputs.querySelector('.x').value;
    CY = +inputs.querySelector('.y').value;
    theta = 0;
    rotate();
  }
})();