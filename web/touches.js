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
      this.touches[t.identifier] = {start: t, prev: t};
    });
  }

  touchmove(e) {
    Array.from(e.changedTouches).forEach(t => {
      let start = this.touches[t.identifier].start,
          prev  = this.touches[t.identifier].prev,
          end   = t;

      if (start)
        this.pending(start, prev, end);

      this.touches[t.identifier].prev = t;
    });
  }

  touchend(e) {
    Array.from(e.changedTouches).forEach(t => {
      let start = this.touches[t.identifier].start,
          end   = t;

      if (start)
        this.commit(start, end);

      delete this.touches[t.identifier];
    });
  }

  touchcancel(e) {
    Array.from(e.changedTouches).forEach(t => {
      let start = this.touches[t.identifier].start,
          end   = t;

      if (start)
        this.cancel(start, end);

      delete this.touches[t.identifier];
    });
  }

  get firstTouch() {
    return Object.values(this.touches)[0].start;
  }
}

class SeeMeFeelMe extends TouchMeHealMe {
  constructor(element, setVolume = () => {}) {
    super(element);
    this.setVolume = setVolume;
  }

  get slidingToRefresh() {
    // Two (or more) fingers (checked here), sliding down (checked in pending())
    return Object.keys(this.touches).length > 1;
  }

  pending(start, prev, end, state) {
    if (this.slidingToRefresh) {
      // Only use one touch (first contact) out of the multi-touch gesture,
      // otherwise each touch will drive conflicting changes in opacity.
      if (end.identifier === this.firstTouch.identifier) {
        // Change in vertical movement since the *start of this touch gesture*.
        // Positive is moving downwards, negative upwards, because we expect
        // this to be a "pull down" gesture.
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
