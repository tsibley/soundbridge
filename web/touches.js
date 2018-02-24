// vim: set sw=2 ts=2 :
(function() {
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
    pending(start, end) {
      let dy = end.clientY - start.clientY;

      if (dy > 0)
        document.body.style.opacity = 1 - dy / 120;
    }

    commit(start, end) {
      if (end.clientY - start.clientY > 120)
        window.location.reload(true);
      else
        this.cancel();
    }

    cancel() {
      document.body.style.removeProperty("opacity");
    }
  }

  let feelItStill = new SeeMeFeelMe();

})();
