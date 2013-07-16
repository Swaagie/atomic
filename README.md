# Atomic

Stepwise progress inidication.

HTML5 only.

Browser support: latest chrome, safari, firefox and IE9+

### How to use

The whole progress bar works by utilizing the `data-attributes`.
- data-n: total number of steps
- data-i: current active step
- data-v: progress in percentage from 1-100

Omit the `data-n` attribute if you want a progress bar with just one single
step. This will remove the circle/electrons at the orbital. Likewise `data-i`
should not be greater than `data-n`
