(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 800 ? 800 : cWidth;
  const height = cHeight > 600 ? 600 : cHeight;

  let CX = -0.775;
  let CY = 0.1625;
  let CR = 0.02;
  const omega = 0.00125;
  const MAX = 128;
  const PI = Math.PI;
  const MAX_SPEED = 16;
  let lastTime;
  let axis;
  let scale = [];
  let cx, cy;
  let theta = 0;
  let currentColorScale;

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  const imageData = ctx.createImageData(width, height);
  const buf = new ArrayBuffer(imageData.data.length);
  const buf8 = new Uint8ClampedArray(buf);
  const data = new Uint32Array(buf);

  const select = document.getElementById('color');
  const inputs = document.getElementById('inputs');

  init();

  function init() {
    readParams();

    setScale();
    setAxis();
    rotate(omega);

    document.querySelector('#reset').addEventListener('click', reset);
    document.querySelector('#share').addEventListener('click', share);

    window.requestAnimationFrame(draw);
  }

  function readParams() {
    try {
      let params = new URL(document.location).searchParams;

      const cx = params.get('cx');
      if (cx != null) {
        CX = +cx;
        if (isNaN(CX)) {
          CX = -0.8;
        }
        inputs.querySelector('.x').value = CX;
      }

      const cy = params.get('cy');
      if (cy != null) {
        CY = +cy;
        if (isNaN(CY)) {
          CY = 0.16;
        }
        inputs.querySelector('.y').value = CY;
      }

      const cr = params.get('cr');
      if (cr != null) {
        CR = +cr;
        if (isNaN(CR)) {
          CR = 0.025;
        }
        inputs.querySelector('.r').value = CR;
      }

      const color = params.get('color');
      if (color != null && d3[color] != undefined) {
        currentColorScale = d3[color];
        select.value = color;
      }
    } catch (e) {
      console.error(e);
    }
  }

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
    setScale(str);
  };

  function setScale(d3Scale) {
    if (d3Scale == undefined && currentColorScale == undefined) {
      d3Scale = 'interpolateCubehelixDefault';
      select.value = d3Scale;
    }
    if (d3Scale) {
      currentColorScale = d3[d3Scale];
    }
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

  function rotate(angle) {
    cx = Math.cos(theta * 2 * PI) * CR + CX;
    cy = Math.sin(theta * 2 * PI) * CR + CY;
    theta += angle;
  }

  function draw(currTime) {
    if (lastTime && currTime - lastTime < MAX_SPEED) {
      return window.requestAnimationFrame(draw);
    }
    let speedUp = omega;
    if (currTime - lastTime > 2 * MAX_SPEED) {
      speedUp = Math.floor((currTime - lastTime) / MAX_SPEED) * omega;
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

    rotate(speedUp);
    window.requestAnimationFrame(draw);
  }

  function reset() {
    CX = +inputs.querySelector('.x').value;
    CY = +inputs.querySelector('.y').value;
    CR = +inputs.querySelector('.r').value;
    const url = `https://btthomas.github.io/projects/2020/04/05/julia.html?cx=${CX}&cy=${CY}&cr=${CR}&color=${select.value}`;
    window.location = url;
  }

  function share() {
    const url = `https://btthomas.github.io/projects/2020/04/05/julia.html?cx=${CX}&cy=${CY}&cr=${CR}&color=${select.value}`;
    copyToClipboard(url);
    showMessage();
  }

  function showMessage() {
    window.alert('Your URL is copied to your clipboard');
  }
})();
