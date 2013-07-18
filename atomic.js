(function initAtomic(w) {
  'use strict';

  /**
   * Polyfill for cancel & requestAnimationFrame for smooth and fast animations.
   *
   * @api private
   */
  (function polyfill() {
    var expectedTime = 0
      , vendors = ['ms', 'moz', 'webkit', 'o']
      , vendor;

    while(!w.requestAnimationFrame && (vendor = vendors.pop())) {
      w.requestAnimationFrame = w[vendor + 'RequestAnimationFrame'];
      w.cancelAnimationFrame = w[vendor + 'CancelAnimationFrame']
       || w[vendor+'CancelRequestAnimationFrame'];
    }

    if (!w.cancelAnimationFrame) w.cancelAnimationFrame = clearTimeout;
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
  })();

  /**
   * Constructor of Atomic, called only if the progress bar is in the page.
   *
   * @Constructor
   * @param {Element} atom
   * @api public
   */
  function Atomic(atom) {
    var electrons = atom.getElementsByTagName('li')
      , text = atom.getElementsByTagName('input')[0]
      , canvas = atom.getElementsByTagName('canvas')[0]
      , size = getComputedStyle(canvas).getPropertyValue('width')
      , i = electrons.length
      , n = 100 / i
      , π = Math.PI
      , element;

    // Set some properties for the canvas to work with.
    this.ctx = canvas.getContext('2d');
    this.color = getComputedStyle(atom).getPropertyValue('color');
    this.value = +text.value;

    // Some defaults required for the animations
    this.r = +size.replace('px', '') / 2;
    this.ψ = π / 50;
    this.top = π / -2;

    // Attach onChange listeners to each input element
    text.addEventListener('change', this.listen.bind(this));

    // Set data-n on section to #list items.
    atom.setAttribute('data-n', i);

    // Add radiobuttons and listen to any clicks on the labels
    while (i--) {
      element = document.createElement('input');
      element.addEventListener('click', this.listen.bind(this));

      atom.insertBefore(this.setAttributes(
          element
        , { type: 'radio', id: 'i' + i, name: 's', value: n * i}
      ), atom.firstChild);

      electrons[i].getElementsByTagName('label')[0].setAttribute('for', 'i' + i);
    }

    // Set height and width on the canvas.
    canvas.setAttribute('width', size);
    canvas.setAttribute('height', size);

    // Start the animation cycle for the first time.
    this.animate(0, this.value);
  }

  /**
   * Small helper function to set attributes on created elements.
   *
   * @param {Element} element
   * @param {Object} attributes
   * @returns {Element}
   * @api private
   */
  Atomic.prototype.setAttributes = function setAttributes(element, attributes) {
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
  Atomic.prototype.animate = function animate(start, end) {
    var self = this
      , cw = end > start ? 1 : -1
      , π = Math.PI
      , Δ = π / 40 * cw
      , θ = Δ / 2
      , α = this.top + this.ψ * start
      , β = this.top + this.ψ * end
      , steps = Math.abs(Math.ceil((β - α) / Δ))
      , ctx = this.ctx
      , r = this.r
      , λ = 0;

    /**
     * Render each slice
     *
     * @api private
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
      ctx.fillStyle = ~cw ? self.color : 'rgba(0, 0, 0, 1)';
      ctx.arc(r, r, r, r1, r2, !~cw);
      ctx.lineTo(r, r);
      ctx.closePath();
      ctx.fill();

      // stop calling render as soon as steps are done or if equal to end.
      if (λ++ < steps && r2 !== β) self.id = w.requestAnimationFrame(render);
    }

    this.id = w.requestAnimationFrame(render);
  };

  /**
   * Change the current value of the progress bar
   *
   * @param {Number} end
   * @returns {Atomic} fluent interface
   * @api public
   */
  Atomic.prototype.update = function update(end) {
    if (end === this.value || end > 100) return this;

    // Stop running animations and start fresh one.
    w.cancelAnimationFrame(this.id);
    this.animate(this.value, this.value = end);

    return this;
  };

  /**
   * Event listener for any changes on the inputs.
   *
   * @param {Event} e
   * @returns {Atomic} fluent interface
   * @api private
   */
  Atomic.prototype.listen = function listen(e) {
    this.update(+(e.target || e.srcElement).value);

    return this;
  };

  // Initialize each progress bar on the page.
  var atoms = document.getElementsByClassName('atomic');
  for (var k = 0; k < atoms.length; k++) {
    initAtomic[k] = new Atomic(atoms[k]);
  }
})(window);
