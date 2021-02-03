// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  class Plink {
    constructor($http, $log) {
      this.$http = $http;
      this.$log  = new PrefixedLogger("[Plink]", $log);

      this.baseUrl = new URL("http://plink:3689");

      return this;
    }

    play() {
      this.$log.debug("Playing");
      return this.$http.put(this.endpoint("/api/player/play")).catch(
        error => { this.$log.error("Failed to play:", error) }
      );
    }

    pause() {
      this.$log.debug("Pausing");
      return this.$http.put(this.endpoint("/api/player/pause")).catch(
        error => { this.$log.error("Failed to pause:", error) }
      );
    }

    endpoint(path) {
      return new URL(path, this.baseUrl).toString();
    }
  }

  angular
    .module('HiFi')
    .service('Plink', ['$http', '$log', Plink]);

})();
