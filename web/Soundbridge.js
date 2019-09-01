// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  class Soundbridge {
    constructor($http, $interval, debounce, $log) {
      if (Soundbridge.$instance)
        return Soundbridge.$instance;

      this.$http     = $http;
      this.$interval = $interval;
      this.$debounce = debounce;
      this.$log      = $log;

      $log.debug("Soundbridge — Let the music play!");
      this.sync();
      this.fetchPresets();

      return Soundbridge.$instance = this;
    }

    sync() {
      this.$log.debug("Syncing");
      this.fetchState().then(
        state => {
          switch (state.power) {
            case 'off':
              if (this.sync._interval) {
                this.$interval.cancel(this.sync._interval);
                this.sync._interval = null;
                this.$log.debug("Stopped periodic sync");
              }
              break;

            default:
              if (!this.sync._interval) {
                this.sync._interval = this.$interval(() => this.sync(), 5000);
                this.$log.debug("Started periodic sync");
              }
          }
        }
      );
    }

    newState(newState) {
      return angular.extend({}, this.state, newState);
    }

    updateStateFromResponse(property, transform = (x) => x) {
      // Update a single state field…
      if (property) {
        return response => {
          this.state = this.newState({
            [property]: transform(response.data)
          });
          this.$log.debug(property + " =", this.state[property]);
          return this.state[property];
        };
      }

      // …or the entire state object
      else {
        return response => {
          this.state = transform(response.data);
          this.$log.debug("state =", this.state);
          return this.state;
        };
      }
    }

    fetchState() {
      this.$log.debug("Fetching state");

      return this.$http.get("/state")
        .then( this.updateStateFromResponse() );
    }

    fetchPresets() {
      this.$log.debug("Fetching presets");

      return this.$http.get("/presets").then(
        response => this.presets = response.data,
        error => { this.$log.error("Failed to fetch presets:", error) }
      );
    }

    // This getter/setter combo is a little wonky still with fetchState, but
    // I'll fix it later.
    get volume() {
      if (this._pendingVolume != null)
        return this._pendingVolume;

      else if (this.state)
        return this.state.volume;

      else
        return undefined;
    }

    set volume(vol) {
      // First time through, create our debounced setter.
      if (!this._setVolume) {
        this._setVolume = this.$debounce(
          500,
          function(vol) {
            this.setVolume(vol)
              .finally( () => delete this._pendingVolume )
          }
        );
      }

      this.$log.debug("Pending volume change =", vol);
      this._pendingVolume = vol;
      this._setVolume.call(this, vol);
    }

    setVolume(vol) {
      this.$log.debug("Setting volume");

      return this.$http.post("/volume/" + window.encodeURIComponent(vol))
        .then( this.updateStateFromResponse("volume", Number) );
    }

    togglePower() {
      this.$log.debug("⚡ Power!");
      return this.$http.post("/ir/power")
        .finally( () => this.sync() );
    }

    playPreset(index) {
      this.$log.debug("Playing preset " + index);
      return this.$http.post("/play/preset/" + window.encodeURIComponent(index))
        .finally( () => this.sync() );
    }

    pause() {
      this.$log.debug("Pause");
      return this.$http.post("/pause");
    }
  }

  angular
    .module('Soundbridge')
    .service('Soundbridge', ['$http', '$interval', 'debounce', '$log', Soundbridge]);

})();
