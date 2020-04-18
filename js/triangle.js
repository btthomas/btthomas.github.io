(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 800 ? 800 : cWidth;
  const height = cHeight > 600 ? 600 : cHeight;

  const MAX_SPEED = 10;
  const MAX = 11;
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
  const scale = d3.schemeSpectral[11];

  document.querySelector('#restart').addEventListener('click', restart);

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  const hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.height = height * 4;
  hiddenCanvas.width = width * 4;
  const hiddenCtx = hiddenCanvas.getContext('2d', { alpha: false });

  setCanvas();
  window.requestAnimationFrame(draw);

  function setCanvas() {
    hiddenCtx.fillStyle = scale[11];
    hiddenCtx.fillRect(0, 0, 4 * width, 4 * height);

    ctx.fillStyle = scale[iteration++];
    ctx.fillRect(0, 0, width, height);

    while (iteration < 20) {
      iterate();
    }
  }

  function iterate() {
    // draw new color!
    hiddenCtx.fillStyle = scale[iteration++ % MAX];
    hiddenCtx.fillRect(0, 0, 4 * width, 4 * height);

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
  }

  function draw(currTime) {
    if (lastTime && currTime - lastTime < MAX_SPEED) {
      return window.requestAnimationFrame(draw);
    }
    lastTime = currTime;

    if (z <= 2) {
      zoom();
      z = z * zoomFactor;
    } else {
      // reset axis
      axis = {
        xMin: width,
        xMax: 3 * width,
        yMin: 0,
        yMax: 2 * height,
      };
      z = 1;

      // iterate once
      iterate();
    }
    return window.requestAnimationFrame(draw);
  }

  function restart() {
    const inputs = document.getElementById('inputs');
  }
})();
