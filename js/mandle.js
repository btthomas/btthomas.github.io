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
  const zoomFactor = 0.15;
  let scale = [];

  document.querySelector('#restart').addEventListener('click', restart);

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  setAxis();

  setScale();

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
      scale.push(d3.interpolateSinebow(i / (MAX - 1)));
      i++;
    }
  }

  function color(x, y) {
    let t = -1;

    const xx = ((axis.xmax - axis.xmin) * x) / width + axis.xmin;
    const yy = ((axis.ymax - axis.ymin) * y) / height + axis.ymin;

    let xn = xx;
    let yn = yy;
    while (t++ < MAX) {
      const xi = xn * xn - yn * yn + xx;
      const yi = 2 * xn * yn + yy;
      if (xi * xi + yi * yi > 3) {
        break;
      }
      xn = xi;
      yn = yi;
    }
    return scale[t % 64];
  }

  function draw() {
    const imageData = ctx.createImageData(width, height);
    const buf = new ArrayBuffer(imageData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const data = new Uint32Array(buf);

    let colors = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        colors = color(x, y)
          .substr(4)
          .split(')')[0]
          .split(',')
          .map((d) => +d);

        data[y * width + x] =
          (255 << 24) | (colors[2] << 16) | (colors[1] << 8) | colors[0];
      }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    zoom();
    if (MAX++ > 255) {
      restart();
    }

    window.requestAnimationFrame(draw);
  }

  function restart() {
    MAX = 64;
    setAxis();
  }
})();
