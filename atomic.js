(function Atomic(w) {
  'use strict';

  var expectedTime = 0
    , vendors = ['ms', 'moz', 'webkit', 'o']
    , atom = document.getElementsByClassName('atomic')[0]
    , electrons = atom.getElementsByTagName('li')
    , text = atom.getElementsByTagName('input')[0]
    , canvas = atom.getElementsByTagName('canvas')[0]
    , ctx = canvas.getContext('2d')
    , size = getComputedStyle(canvas).getPropertyValue('width').replace('px', '')
    , color = getComputedStyle(atom).getPropertyValue('color')
    , value = +text.value
    , i = electrons.length
    , n = 100 / i
    , r = size / 2
    , π = Math.PI
    , ψ = 2 * π / 100
    , vendor;

  while(!w.requestAnimationFrame && (vendor = vendors.pop())) {
    w.requestAnimationFrame = w[vendor + 'RequestAnimationFrame'];
    w.cancelAnimationFrame = w[vendor + 'CancelAnimationFrame']
     || w[vendor+'CancelRequestAnimationFrame'];
  }

  if (!w.requestAnimationFrame) {
    w.requestAnimationFrame = function requestAnimationFrame(callback) {
      var currentTime = Date.now()
        , adjustedDelay = 16 - (currentTime - expectedTime)
        , delay = adjustedDelay > 0 ? adjustedDelay : 0;

      expectedTime = currentTime + delay;
      return setTimeout(function fps() {
        callback(expectedTime);
      }, delay);
    };
  }

  if (!w.cancelAnimationFrame) w.cancelAnimationFrame = clearTimeout;

  /**
   * Small helper function to set attributes on created elements.
   *
   * @param {Element} element
   * @param {Object} attributes
   * @returns {Element}
   * @api private
   */
  Atomic.setAttributes = function setAttributes(element, attributes) {
    for(var key in attributes) {
      element.setAttribute(key, attributes[key]);
    }

    return element;
  };

  /**
   * Initialize animate function with specified start/end.
   *
   * @param {Number} start
   * @param {Number} end
   * @returns {Element}
   * @api private
   */
  Atomic.animate = function init(start, end) {
    var cw = end > start ? 1 : -1
      , top = π / -2
      , λ = 0
      , Δ = π / 40 * cw
      , θ = Δ / 2
      , α = top + ψ * start
      , β = top + ψ * end
      , steps = Math.abs(Math.ceil((β - α) / Δ));

    /**
     * Render the slices.
     */
    function render() {
      var corr = α !== top || λ ? θ : 0
        , r1 = α + λ * Δ - corr
        , r2 = r1 + corr + Δ;

      // Limit animation, final step might be one to much.
      if (~cw && r2 > β) r2 = β;
      if (!~cw && r2 < β) r2 = β;

      // Start drawing the circle slice.
      ctx.beginPath();
      ctx.globalCompositeOperation = 'destination-' + (~cw ? 'over' : 'out');
      ctx.fillStyle = ~cw ? color : 'rgba(0, 0, 0, 1)';
      ctx.arc(r, r, r, r1, r2, !~cw);
      ctx.lineTo(r, r);
      ctx.closePath();
      ctx.fill();

      // stop calling render as soon as steps are done or if equal to end.
      if (λ++ < steps && r2 !== β) w.requestAnimationFrame(render);
    }

    w.requestAnimationFrame(render);
  };

  Atomic.update = function update(end) {
    if (end === value) return;
    Atomic.animate(value, value = end);
  };

  Atomic.listen = function listen(e) {
    Atomic.update(+(e.target || e.srcElement).value);
  };

  // Set data-n on `section` to number of `li` elements.
  atom.setAttribute('data-n', i);
  canvas.setAttribute('width', size);
  canvas.setAttribute('height', size);

  // Dynamically add radiobuttons to attach to the labels and listen to any
  // clicks on the radiobuttons.
  var element;
  while (i--) {
    element = document.createElement('input');
    element.addEventListener('click', Atomic.listen);

    atom.insertBefore(Atomic.setAttributes(
        element
        , { type: 'radio', id: 'i' + i, name: 's', value: n * i}
    ), atom.firstChild);

    electrons[i].getElementsByTagName('label')[0].setAttribute('for', 'i' + i);
  }

  // Attach onChange listeners to each input element
  text.addEventListener('change', Atomic.listen);

  // Start the animation cycle for the first time.
  Atomic.animate(0, value);
  w.Atomic = Atomic;
})(window);
