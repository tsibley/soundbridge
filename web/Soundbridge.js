// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  class Soundbridge {
    constructor($http, $interval, $log) {
      if (Soundbridge.$instance)
        return Soundbridge.$instance;

      this.$http     = $http;
      this.$interval = $interval;
      this.$log      = $log;

      $log.debug("Soundbridge — Let the music play!");
      this.sync();

      return Soundbridge.$instance = this;
    }

    sync() {
      // XXX TODO: use a single state endpoint to avoid multiple requests
      //
      this.$log.debug("Syncing");
      this.fetchPowerState().then(
        state => {
          switch (state) {
            case 'off':
              this.volume = 0;
              this.currentSong = null;
              if (this.sync._interval) {
                this.$interval.cancel(this.sync._interval);
                this.sync._interval = null;
              }
              break;

            default:
              this.fetchVolume();
              this.fetchCurrentSong();
              if (!this.sync._interval)
                this.sync._interval = this.$interval(() => this.sync(), 5000);
          }
        }
      );
    }

    setFromResponse(property, transform = (x) => x) {
      return response => {
        this[property] = transform(response.data);
        this.$log.debug(property + " =", this[property]);
        return this[property];
      };
    }

    fetchPowerState() {
      this.$log.debug("Fetching power state");

      return this.$http.get("/power")
        .then( this.setFromResponse('powerState') );
    }

    fetchVolume() {
      this.$log.debug("Fetching volume");

      return this.$http.get("/volume")
        .then( this.setFromResponse('volume', Number) );
    }

    fetchCurrentSong() {
      this.$log.debug("Fetching current song");

      return this.$http.get("/current-song")
        .then( this.setFromResponse('currentSong') );
    }

    setVolume(vol) {
      this.$log.debug("Setting volume");

      return this.$http.post("/volume/" + window.encodeURIComponent(vol))
        .then( this.setFromResponse('volume', Number) );
    }

    togglePower() {
      this.$log.debug("⚡ Power!");
      return this.$http.post("/ir/power")
        .finally( () => this.sync() );
    }

    playPreset(name) {
      this.$log.debug("Playing preset " + name);
      return this.$http.post("/play/preset/" + window.encodeURIComponent(name))
        .finally( () => this.sync() );
    }

    pause() {
      this.$log.debug("Pause");
      return this.$http.post("/pause");
    }
  }

  angular
    .module('Soundbridge')
    .service('Soundbridge', ['$http', '$interval', '$log', Soundbridge]);

})();
