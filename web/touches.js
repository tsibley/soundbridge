// vim: set sw=2 ts=2 :
'use strict';

class EventListener {
  handleEvent(e) {
    return this[e.type](e);
  }
}

class TouchMeHealMe extends EventListener {
  constructor() {
    super();

    this.touches = {};

    window.addEventListener("touchstart",  this, false);
    window.addEventListener("touchmove",   this, false);
    window.addEventListener("touchend",    this, false);
    window.addEventListener("touchcancel", this, false);
  }

  touchstart(e) {
    Array.from(e.changedTouches).forEach(t => {
      this.touches[t.identifier] = t;
    });
  }

  touchmove(e) {
    Array.from(e.changedTouches).forEach(t => {
      let start = this.touches[t.identifier],
          end   = t;

      if (start)
        this.pending(start, end);
    });
  }

  touchend(e) {
    Array.from(e.changedTouches).forEach(t => {
      let start = this.touches[t.identifier],
          end   = t;

      if (start)
        this.commit(start, end);

      delete this.touches[t.identifier];
    });
  }

  touchcancel(e) {
    Array.from(e.changedTouches).forEach(t => {
      let start = this.touches[t.identifier],
          end   = t;

      if (start)
        this.cancel(start, end);

      delete this.touches[t.identifier];
    });
  }
}

class SeeMeFeelMe extends TouchMeHealMe {
  constructor(scope, soundbridge) {
    super();

    this.setVolume = v => {
      scope.$apply(() => {
        soundbridge.volume = v;
      });
    };
  }

  get slidingToRefresh() {
    return Object.keys(this.touches).length > 1;
  }

  pending(start, end) {
    if (this.slidingToRefresh) {
      let dy = end.clientY - start.clientY;

      if (dy > 0)
        document.body.style.opacity = 1 - dy / 120;
    }
    else {
      let viewportHeight = document.documentElement.clientHeight,
          heightPercent  = (viewportHeight - end.clientY) / viewportHeight * 100,
          newVolume      = Math.floor(Math.min(Math.max(0, heightPercent), 100)); // int between [0, 100]

      this.setVolume( newVolume );
    }
  }

  commit(start, end) {
    if (this.slidingToRefresh) {
      if (end.clientY - start.clientY > 120)
        window.location.reload(true);
      else
        this.cancel();
    }
  }

  cancel() {
    if (this.slidingToRefresh)
      document.body.style.removeProperty("opacity");
  }
}
