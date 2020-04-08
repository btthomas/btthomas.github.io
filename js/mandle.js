(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 500 ? 500 : cWidth;
  const height = cHeight > 400 ? 400 : cHeight;

  const MAX_SPEED = 16;
  let MAX = 64;
  let axis;
  let GX = -0.7900105002101;
  let GY = -0.165003159937;

  const zoomFactor = 0.05;
  let scale = [];
  let lastTime;
  let currentColorScale;

  const select = document.getElementById('color');

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  const imageData = ctx.createImageData(width, height);
  const buf = new ArrayBuffer(imageData.data.length);
  const buf8 = new Uint8ClampedArray(buf);
  const data = new Uint32Array(buf);

  init();

  function init() {
    readParams();
    setAxis();
    setScale();

    document.getElementById('reset').addEventListener('click', reset);
    document.querySelector('#share').addEventListener('click', share);

    window.requestAnimationFrame(draw);
  }

  function readParams() {
    try {
      let params = new URL(document.location).searchParams;

      const x = params.get('x');
      if (x != null) {
        GX = +x;
        if (isNaN(GX)) {
          GX = -0.7900105002101;
        }
        inputs.querySelector('.x').value = GX;
      }

      const y = params.get('y');
      if (y != null) {
        GY = 0 - +y;
        if (isNaN(GY)) {
          GY = -0.165003159937;
        }
        inputs.querySelector('.y').value = GY;
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
      xmin: (1 - zoomFactor) * axis.xmin + zoomFactor * GX,
      xmax: (1 - zoomFactor) * axis.xmax + zoomFactor * GX,
      ymin: (1 - zoomFactor) * axis.ymin + zoomFactor * GY,
      ymax: (1 - zoomFactor) * axis.ymax + zoomFactor * GY,
    };
  }

  window.handleChangeColor = function (str) {
    setScale(str);
  };

  function setScale(d3Scale) {
    if (d3Scale == undefined && currentColorScale == undefined) {
      d3Scale = 'interpolateTurbo';
      select.value = d3Scale;
    }
    if (d3Scale) {
      currentColorScale = d3[d3Scale];
    }

    let i = 0;
    while (i < MAX) {
      const rbg = currentColorScale(i / (MAX - 1))
        .slice(4, -1)
        .split(',')
        .map((d) => +d);

      scale.push((255 << 24) | (rbg[2] << 16) | (rbg[1] << 8) | rbg[0]);
      i++;
    }
  }

  function draw(currTime) {
    if (lastTime && currTime - lastTime < MAX_SPEED) {
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
      t = -1;

    for (; y < height; y++) {
      for (x = 0; x < width; x++) {
        xx = ((axis.xmax - axis.xmin) * x) / width + axis.xmin;
        yy = ((axis.ymax - axis.ymin) * y) / height + axis.ymin;

        xn = xx;
        yn = yy;
        xi = 0;
        t = -1;

        while (t++ < MAX) {
          if (xn * xn + yn * yn > 3) {
            break;
          }
          xi = xn * xn - yn * yn + xx;
          yn = 2 * xn * yn + yy;
          xn = xi;
        }

        data[y * width + x] = scale[t % 64];
      }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    zoom();
    MAX += 0.5;
    if (MAX > 380) {
      reset();
    }

    // console.timeEnd(s);
    window.requestAnimationFrame(draw);
  }

  function reset() {
    MAX = 64;
    const inputs = document.getElementById('inputs');
    GX = +inputs.querySelector('.x').value;
    GY = 0 - +inputs.querySelector('.y').value;
    setAxis();
  }

  function share() {
    const url = `https://btthomas.github.io/projects/2020/04/04/mandlebrot.html?x=${GX}&y=${
      0 - GY
    }&color=${select.value}`;
    copyToClipboard(url);
    showMessage();
  }

  function showMessage() {
    window.alert('Your URL is copied to your clipboard');
  }
})();

// -0.791000102001;
// 0.164000949002;

// -0.7889010749955;
// 0.1614890499899;
