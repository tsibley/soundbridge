// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  class StereoReceiver {
    constructor($http, $log) {
      if (StereoReceiver.$instance)
        return StereoReceiver.$instance;

      this.$http = $http;
      this.$log  = $log;
      this.$log  = new PrefixedLogger("[StereoReceiver]", $log);

      this.$log.debug("Initialized");

      return StereoReceiver.$instance = this;
    }

    async adjustVolume(by) {
      this.$log.debug(`Adjusting the volume by ${by}`);

      if (by > 0) {
        while (by-- > 0)
          await this.increaseVolume();
      }
      else if (by < 0) {
        while (by++ < 0)
          await this.decreaseVolume();
      }
    }

    increaseVolume() {
      this.$log.debug("Turning up the volume");

      return this.$http.post("/receiver/volume/up").catch(
        error => { this.$log.error("Failed to turn up the volume:", error) }
      );
    }

    decreaseVolume() {
      this.$log.debug("Turning down the volume");

      return this.$http.post("/receiver/volume/down").catch(
        error => { this.$log.error("Failed to turn down the volume:", error) }
      );
    }

    input(source) {
      source = String(source).toLowerCase();

      this.$log.debug(`Switching to input ${source}`);

      return this.$http.post(`/receiver/input/${source}`).catch(
        error => { this.$log.error("Failed to switch inputs:", error) }
      );
    }

    togglePower() {
      this.$log.debug("⚡ Power!");
      return this.$http.post("/receiver/power").catch(
        error => { this.$log.error("Failed to toggle power:", error) }
      );
    }

    powerOn() {
      this.$log.debug("⚡ Power on!");
      return this.$http.post("/receiver/power/on").catch(
        error => { this.$log.error("Failed to power on:", error) }
      );
    }

    powerOff() {
      this.$log.debug("💤 Power off");
      return this.$http.post("/receiver/power/off").catch(
        error => { this.$log.error("Failed to power off:", error) }
      );
    }
  }

  angular
    .module('HiFi')
    .service('StereoReceiver', ['$http', '$log', StereoReceiver]);

})();
