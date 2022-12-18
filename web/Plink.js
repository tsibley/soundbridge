// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  class Plink {
    constructor($http, $interval, $log) {
      this.$http     = $http;
      this.$interval = $interval;
      this.$log      = new PrefixedLogger("[Plink]", $log);

      this.baseUrl = new URL("http://plink:3689");
      this.sync();

      return this;
    }

    sync() {
      // XXX TODO: There's a websocket this could connect to instead of
      // polling.
      this.$log.debug("Syncing");
      return this.fetchState().then(
        state => {
          switch (state.status) {
            case 'play':
              if (!this.sync._interval) {
                this.sync._interval = this.$interval(() => this.sync(), 5000);
                this.$log.debug("Started periodic sync");
              }

            default:
              if (this.sync._interval) {
                this.$interval.cancel(this.sync._interval);
                this.sync._interval = null;
                this.$log.debug("Stopped periodic sync");
              }
              break;
          }
          return state;
        }
      );
    }

    fetchState() {
      this.$log.debug("Fetching state");

      return this.$http.get(this.endpoint("/api/player"))
        .then(response => {
          this.state = response.data;
          this.state.status = this.state.state;
          delete this.state.state;

          this.$log.debug("state =", this.state);
          return this.state;
        })
        .catch(error => { this.$log.error("Failed to get state:", error) });
    }

    play() {
      this.$log.debug("Playing");
      return this.$http.put(this.endpoint("/api/player/play"))
        .catch( error => { this.$log.error("Failed to play:", error) })
        .finally( () => this.sync() );
    }

    pause() {
      this.$log.debug("Pausing");
      return this.$http.put(this.endpoint("/api/player/pause"))
        .catch( error => { this.$log.error("Failed to pause:", error) })
        .finally( () => this.sync() );
    }

    endpoint(path) {
      return new URL(path, this.baseUrl).toString();
    }
  }

  angular
    .module('HiFi')
    .service('Plink', ['$http', '$interval', '$log', Plink]);

})();
