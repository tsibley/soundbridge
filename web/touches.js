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
      this.touches[t.identifier] = {start: t, prev: t, state: {}};
    });
  }

  touchmove(e) {
    Array.from(e.changedTouches).forEach(t => {
      let state = this.touches[t.identifier].state,
          start = this.touches[t.identifier].start,
          prev  = this.touches[t.identifier].prev,
          end   = t;

      if (start) {
        this.touches[t.identifier].state =
          this.pending(start, prev, end, state);
      }

      this.touches[t.identifier].prev = t;
    });
  }

  touchend(e) {
    Array.from(e.changedTouches).forEach(t => {
      let state = this.touches[t.identifier].state,
          start = this.touches[t.identifier].start,
          end   = t;

      if (start)
        this.commit(start, end, state);

      delete this.touches[t.identifier];
    });
  }

  touchcancel(e) {
    Array.from(e.changedTouches).forEach(t => {
      let state = this.touches[t.identifier].state,
          start = this.touches[t.identifier].start,
          end   = t;

      if (start)
        this.cancel(start, end, state);

      delete this.touches[t.identifier];
    });
  }

  get firstTouch() {
    return Object.values(this.touches)[0].start;
  }
}

class SeeMeFeelMe extends TouchMeHealMe {
  constructor(element, adjustVolume = (by) => {}) {
    super(element);
    this.adjustVolume = adjustVolume;
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
      // Change in vertical movement since the *start of this touch gesture*.
      // Positive is moving upwards, negative downwards, because increasing
      // volume is upwards.  Used for UI feedback.
      const dy = start.clientY - end.clientY;

      // Change in vertical movement since the *last event in this gesture*,
      // i.e. call to this method.  Positive is moving upwards, negative
      // downwards.
      const ddy = prev.clientY - end.clientY;

      // Calculate volume steps from accumulated ddy.
      const accumulated = ddy + (state.remainder || 0);

      const stepBy = 20;
      const steps  = Math.floor(accumulated / stepBy);

      // Send adjustments
      const newState = {
        dy,
        ddy,
        steps,
        remainder: steps ? accumulated % steps : accumulated,
      };

      console.debug("Volume slider state: ", newState);

      this.adjustSlider(dy);
      this.adjustVolume(steps);

      return newState;
    }
  }

  commit(start, end) {
    if (this.slidingToRefresh) {
      if (end.clientY - start.clientY > 120)
        window.location.reload(true);
      else
        this.cancel();
    } else {
      this.adjustSlider(null);
    }
  }

  cancel() {
    if (this.slidingToRefresh)
      document.body.style.removeProperty("opacity");
    else
      this.adjustSlider(null);
  }

  adjustSlider(dy) {
    if (dy != null) {
      const elementHeight = this.element.clientHeight,
            heightPercent = dy / elementHeight * 100,
            adjustment    = Math.floor(Math.max(-100, Math.min(100, heightPercent))); // int between [-100, 100]

      this.element.style.background = `
        linear-gradient(
          to ${adjustment > 0 ? "top" : "bottom"},
          white       50%,
          transparent 50%,
          transparent ${50 + Math.abs(adjustment)}%,
          white       ${50 + Math.abs(adjustment)}%
        ),
        linear-gradient(to top, #9198e5, #e66465 90%)
      `;
    } else {
      this.element.style.removeProperty("background");
    }
  }
}
