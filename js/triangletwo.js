(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.documentElement.clientHeight - 100;
  const width = cWidth > 1200 ? 1200 : cWidth;
  const height = cHeight > 1000 ? 1000 : cHeight;

  const MAX_SPEED = 10;
  const MAX = 24;
  let iteration = 0;
  let z = 1;
  const zoomFactor = 2 ** 0.0125;
  let axis = {
    xMin: width,
    xMax: 3 * width,
    yMin: 0,
    yMax: 2 * height,
  };
  const goalX = 2 * width;

  let lastTime;
  let currentColorScale;
  let scale;
  const select = document.getElementById('color');

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  const hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.height = height * 4;
  hiddenCanvas.width = width * 4;
  const hiddenCtx = hiddenCanvas.getContext('2d', { alpha: false });

  const hiddenCanvas2 = document.createElement('canvas');
  hiddenCanvas2.height = height * 4;
  hiddenCanvas2.width = width * 4;
  const hiddenCtx2 = hiddenCanvas2.getContext('2d', { alpha: false });

  init();

  function init() {
    setScale();
    setCanvas();
    window.requestAnimationFrame(draw);
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
    scale = [];
    let i = 0;
    while (i < MAX) {
      const rbg = currentColorScale(i / (MAX - 1));
      scale.push(rbg);
      i++;
    }
  }

  function setCanvas() {
    hiddenCtx.fillStyle = scale[0];
    hiddenCtx.fillRect(0, 0, 4 * width, 4 * height);

    ctx.fillStyle = scale[iteration++];
    ctx.fillRect(0, 0, width, height);

    while (iteration < MAX) {
      iterate();
    }
  }

  function iterate() {
    // copy from canvas to hidden canvas 3 times.
    hiddenCtx.drawImage(
      canvas,
      0,
      0,
      width,
      height,
      width,
      0,
      2 * width,
      2 * height
    );
    hiddenCtx.drawImage(
      canvas,
      0,
      0,
      width,
      height,
      0,
      2 * height,
      2 * width,
      2 * height
    );
    hiddenCtx.drawImage(
      canvas,
      0,
      0,
      width,
      height,
      2 * width,
      2 * height,
      2 * width,
      2 * height
    );

    // draw new color!
    hiddenCtx.fillStyle = scale[iteration++ % MAX];

    hiddenCtx.beginPath();
    hiddenCtx.moveTo(0, 0);
    hiddenCtx.lineTo(2 * width, 0);
    hiddenCtx.lineTo(0, 4 * height);
    hiddenCtx.fill();

    hiddenCtx.beginPath();
    hiddenCtx.moveTo(4 * width, 0);
    hiddenCtx.lineTo(2 * width, 0);
    hiddenCtx.lineTo(4 * width, 4 * height);
    hiddenCtx.fill();

    // copy from hidden to canvas
    ctx.drawImage(
      hiddenCanvas,
      0,
      0,
      width * 4,
      height * 4,
      0,
      0,
      width,
      height
    );
  }

  function iterate2() {
    // copy from hidden to hidden2 canvas 3 times.
    hiddenCtx2.drawImage(hiddenCanvas, width, 0, 2 * width, 2 * height);
    hiddenCtx2.drawImage(hiddenCanvas, 0, 2 * height, 2 * width, 2 * height);
    hiddenCtx2.drawImage(
      hiddenCanvas,
      2 * width,
      2 * height,
      2 * width,
      2 * height
    );

    // draw new color!
    hiddenCtx2.fillStyle = scale[iteration++ % MAX];

    hiddenCtx2.beginPath();
    hiddenCtx2.moveTo(0, 0);
    hiddenCtx2.lineTo(2 * width, 0);
    hiddenCtx2.lineTo(0, 4 * height);
    hiddenCtx2.fill();

    hiddenCtx2.beginPath();
    hiddenCtx2.moveTo(4 * width, 0);
    hiddenCtx2.lineTo(2 * width, 0);
    hiddenCtx2.lineTo(4 * width, 4 * height);
    hiddenCtx2.fill();

    // copy from hidden2 to hidden1
    hiddenCtx.drawImage(hiddenCanvas2, 0, 0);
  }

  function zoom() {
    axis = {
      xMin: zoomFactor * axis.xMin + (1 - zoomFactor) * goalX,
      xMax: zoomFactor * axis.xMax + (1 - zoomFactor) * goalX,
      yMin: 0,
      yMax: zoomFactor * axis.yMax,
    };

    ctx.drawImage(
      hiddenCanvas,
      axis.xMin,
      0,
      axis.xMax - axis.xMin,
      axis.yMax,
      0,
      0,
      width,
      height
    );

    const t = ((iteration % MAX) + Math.log2(z)) / MAX;
    const color = currentColorScale(t);
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width / 2, 0);
    ctx.lineTo(0, height);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width / 2, 0);
    ctx.lineTo(width, height);
    ctx.fill();

    z = z * zoomFactor;
  }

  function draw(currTime) {
    if (lastTime && currTime - lastTime < MAX_SPEED) {
      return window.requestAnimationFrame(draw);
    }
    lastTime = currTime;

    if (z < 2) {
      zoom();
    } else {
      axis = {
        xMin: width,
        xMax: 3 * width,
        yMin: 0,
        yMax: 2 * height,
      };
      z = 1;
      iterate2();
      zoom();
    }
    return window.requestAnimationFrame(draw);
  }
})();
