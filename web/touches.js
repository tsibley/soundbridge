// vim: set sw=2 ts=2 :
'use strict';

class EventListener {
  handleEvent(e) {
    return this[e.type](e);
  }
}

class TouchMeHealMe extends EventListener {
  constructor(element = window) {
    super();

    this.touches = {};
    this.element = element;

    this.element.addEventListener("touchstart",  this, false);
    this.element.addEventListener("touchmove",   this, false);
    this.element.addEventListener("touchend",    this, false);
    this.element.addEventListener("touchcancel", this, false);
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
        this.pending(start, end, t);
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

  get firstTouch() {
    return Object.values(this.touches)[0];
  }
}

class SeeMeFeelMe extends TouchMeHealMe {
  constructor(element, scope, soundbridge) {
    super(element);

    this.setVolume = v => {
      scope.$apply(() => {
        soundbridge.volume = v;
      });
    };
  }

  get slidingToRefresh() {
    return Object.keys(this.touches).length > 1;
  }

  pending(start, end, touch) {
    if (this.slidingToRefresh) {
      if (touch.identifier == this.firstTouch.identifier) {
        let dy = end.clientY - start.clientY;

        if (dy > 0)
          document.body.style.opacity = 1 - dy / 120;
      }
    }
    else {
      let elementHeight = this.element.clientHeight,
          heightPercent = (elementHeight - end.clientY) / elementHeight * 100,
          newVolume     = Math.floor(Math.min(Math.max(0, heightPercent), 100)); // int between [0, 100]

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
