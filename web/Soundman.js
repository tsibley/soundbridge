// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  class Soundman {
    constructor(Soundbridge, Plink, StereoReceiver, $http, $log) {
      this._soundbridge = Soundbridge;
      this._plink       = Plink;
      this._receiver    = StereoReceiver;
      this.$http        = $http;
      this.$log         = new PrefixedLogger("[Soundman]", $log);

      this._input = null;
      this._intuitInput();

      return this;
    }

    _intuitInput() {
      Promise.allSettled([
        this._soundbridge.sync()
          .then(state => ["soundbridge", state.power === "on"]),

        this._plink.sync()
          .then(state => ["plink", state.status === "play"]),
      ])
      .then(results => {
        this.$log.debug("Intuiting sync results", JSON.stringify(results));

        const inputs = results.flatMap(({value: v}) => v ? [v] : []);

        this.$log.debug("Intuiting input from", JSON.stringify(inputs));

        if (this.input) {
          this.$log.debug("No input intuited: input already set");
          return;
        }

        for (const [input, isActive] of inputs) {
          if (isActive) {
            this.$log.debug("Intuited input", input);
            return this.input = input;
          }
        }

        this.$log.debug("No input intuited: no active input");
      });
    }

    get input() {
      return this._input;
    }

    set input(to) {
      const from = this._input;

      if (from === to)
        to = "off"

      this.$log.debug(`Switching inputs ${from} → ${to}`);

      switch (to) {
        case "soundbridge":
          // Receiver will implicitly power on if sent an input switch.  Signal the
          // receiver (ever-so-slightly) first since it takes some time before sound
          // is pumping from a cold boot.
          this._receiver.input(2);

          // If it's already on, this is a NOP.  Otherwise, it'll play whatever was
          // playing last (if it was the radio).  Nice.
          this._soundbridge.powerOn();
          break;

        case "plink":
          this._receiver.input(1);
          this._plink.play();
          break;

        case "phono":
          this._receiver.input("phono");
          break;

        case "fm":
          this._receiver.input("fm");
          break;

        case "receiver":
          this._receiver.powerOn();
          break;

        case "off":
          // All off!
          this._receiver.powerOff();
          this._soundbridge.powerOff();
          this._plink.pause();
          break;

        default:
          this.$log.error(`Don't know how to switch to ${to}`);
          throw Error(`Don't know how to switch to ${to}`);
      }

      this._input = to;

      // Don't turn off what we switched from when switching to direct
      // receiver control; we're likely switching right back in a minute.
      if (to === "receiver")
        return;

      switch (from) {
        case "soundbridge":
          this._soundbridge.powerOff();
          break;

        case "plink":
          this._plink.pause();
          break;

        case "phono":
        case "fm":
        case "receiver":
        case "off":
        case null:
          // Nothing to do.
          break;

        default:
          this.$log.debug(`No clue how to switch from ${from}, FWIW`);
      }
    }
  }

  angular
    .module('HiFi')
    .controller('Soundman', ['Soundbridge', 'Plink', 'StereoReceiver', '$http', '$log', Soundman]);

})();
