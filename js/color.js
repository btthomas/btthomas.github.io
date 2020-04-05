(function () {
  const COLOR_LIST = [
    'interpolateBrBG',
    'interpolatePRGn',
    'interpolatePiYG',
    'interpolatePuOr',
    'interpolateRdBu',
    'interpolateRdGy',
    'interpolateRdYlBu',
    'interpolateRdYlGn',
    'interpolateSpectral',
    'interpolateBlues',
    'interpolateGreens',
    'interpolateGreys',
    'interpolateOranges',
    'interpolatePurples',
    'interpolateReds',
    'interpolateTurbo',
    'interpolateViridis',
    'interpolateInferno',
    'interpolateMagma',
    'interpolatePlasma',
    'interpolateCividis',
    'interpolateWarm',
    'interpolateCool',
    'interpolateCubehelixDefault',
    'interpolateBuGn',
    'interpolateBuPu',
    'interpolateGnBu',
    'interpolateOrRd',
    'interpolatePuBuGn',
    'interpolatePuBu',
    'interpolatePuRd',
    'interpolateRdPu',
    'interpolateYlGnBu',
    'interpolateYlGn',
    'interpolateYlOrBr',
    'interpolateYlOrRd',
    'interpolateRainbow',
    'interpolateSinebow',
  ];

  select = document.getElementById('color');
  select.innerHTML = COLOR_LIST.map(
    (c) => `<option value="${c}">${c}</option>`
  ).join('');
  select.value = 'interpolateCubehelixDefault';

  select.addEventListener('change', changeColor);

  function changeColor(e) {
    window.handleChangeColor && window.handleChangeColor(e.target.value);
  }
})();
