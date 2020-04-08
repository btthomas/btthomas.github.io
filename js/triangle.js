(function () {
  cWidth = document.body.clientWidth;
  cHeight = document.body.clientHeight;
  const width = cWidth > 800 ? 800 : cWidth;
  const height = cHeight > 600 ? 600 : cHeight;

  const MAX_SPEED = 1;
  const MAX = 11;
  let iteration = 0;
  let z = 1;
  const zoomFactor = 2 ** 0.0125;
  let axis = {
    xMin: 0,
    xMax: 2 * width,
    yMin: 0,
    yMax: 2 * height,
  };
  const goalX = 2 * width;

  let lastTime;
  let currentColorScale;
  let scale = [];

  document.querySelector('#restart').addEventListener('click', restart);

  const canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  const ctx = canvas.getContext('2d', { alpha: false });

  const hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.height = height * 4;
  hiddenCanvas.width = width * 4;
  const hiddenCtx = hiddenCanvas.getContext('2d', { alpha: false });

  setScale(d3.schemeSpectral[11]);
  setCanvas();
  window.requestAnimationFrame(draw);

  window.handleChangeColor = function (str) {
    setScale(d3[str]);
  };

  function setScale(d3Scale) {
    scale = d3Scale;
    scale = ['black', 'gray'];
  }

  function setCanvas() {
    hiddenCtx.fillStyle = scale[19];
    hiddenCtx.fillRect(0, 0, 4 * width, 4 * height);

    ctx.fillStyle = scale[iteration++];
    ctx.fillRect(0, 0, width, height);

    while (iteration < 20) {
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

    z = z * zoomFactor;

    if (z >= 0.5) {
      // zoom();
    } else {
      console.log('here');
      // reset axis
      axis = {
        xMin: 0,
        xMax: 4 * width,
        yMin: 0,
        yMax: 4 * height,
      };
      z = 1;
      // copy over perfect 16th image
      ctx.drawImage(
        hiddenCanvas,
        (3 / 2) * width,
        0,
        width,
        height,
        0,
        0,
        width,
        height
      );

      // iterate twice
      let i = 0;
      while (i < 2) {
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
        i++;
      }
    }
    return window.requestAnimationFrame(draw);
  }

  function restart() {
    const inputs = document.getElementById('inputs');
  }
})();
