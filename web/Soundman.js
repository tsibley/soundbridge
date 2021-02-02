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

      return this;
    }

    get input() {
      return this._input;
    }

    set input(to) {
      const from = this._input;

      if (from !== to) {
        this.$log.debug(`Switching inputs ${from} → ${to}`);
      } else {
        this.$log.debug(`Switching inputs off`);
        to = null;
      }

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

        case "fm":
          this._receiver.input("fm");
          break;

        case null:
          // All off!
          this._receiver.powerOff();
          this._soundbridge.powerOff();
          this._plink.pause();
          break;

        default:
          this.$log.error(`Don't know how to start ${to}`);
          throw Error(`Don't know how to start ${to}`);
      }

      this._input = to;

      switch (from) {
        case "soundbridge":
          this._soundbridge.powerOff();
          break;

        case "plink":
          this._plink.pause();
          break;

        case "fm":
        case null:
          // Nothing to do.
          break;

        default:
          this.$log.debug(`No clue how to stop ${from}, FWIW`);
      }
    }
  }

  angular
    .module('HiFi')
    .controller('Soundman', ['Soundbridge', 'Plink', 'StereoReceiver', '$http', '$log', Soundman]);

})();
