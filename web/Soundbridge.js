// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  angular
    .module('Soundbridge', ['angular.filter', 'ui.bootstrap'])
    .service('Soundbridge', Soundbridge)
    .component('playPreset', {
      controller: componentController,
      templateUrl: 'partial/play-preset.html',
      transclude: true,
      bindings: {
        name: '<'
      }
    })
    .config(configure)
    .run(init);


  configure.$inject = ['$compileProvider', '$locationProvider', '$anchorScrollProvider'];

  function configure($compileProvider, $locationProvider, $anchorScrollProvider) {
    // Configure $location and $anchorScroll to stay out of the way of normal
    // URL and HTML anchors.  We use them only in a very limited fashion, not
    // as an app-wide link/routing mechanism.
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
      rewriteLinks: false
    });
    $anchorScrollProvider.disableAutoScrolling();
  }


  init.$inject = ['Soundbridge', '$rootScope', '$log'];

  function init(Soundbridge, $rootScope, $log) {
    $rootScope.soundbridge = Soundbridge;
  }


  // This is for convenience when using components with forced isolate scope
  // instead of directives.  Maybe I should use directives, or design the API
  // differently, but meh, this is a hacky personal project.
  componentController.$inject = ['Soundbridge', '$scope'];

  function componentController(Soundbridge, $scope) {
    $scope.soundbridge = Soundbridge;
  }


  Soundbridge.$inject = ['$http', '$interval', '$log'];

  function Soundbridge($http, $interval, $log) {
    if (Soundbridge.$instance)
      return Soundbridge.$instance;

    this.$http     = $http;
    this.$interval = $interval;
    this.$log      = $log;

    $log.debug("Soundbridge — Let the music play!");
    this.sync();

    return Soundbridge.$instance = this;
  }

  Soundbridge.prototype.sync = function() {
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
  };

  Soundbridge.prototype.setFromResponse = function(property, transform = (x) => x) {
    return response => {
      this[property] = transform(response.data);
      this.$log.debug(property + " =", this[property]);
      return this[property];
    };
  };

  Soundbridge.prototype.fetchPowerState = function() {
    this.$log.debug("Fetching power state");

    return this.$http.get("/power")
      .then( this.setFromResponse('powerState') );
  };

  Soundbridge.prototype.fetchVolume = function() {
    this.$log.debug("Fetching volume");

    return this.$http.get("/volume")
      .then( this.setFromResponse('volume', Number) );
  };

  Soundbridge.prototype.fetchCurrentSong = function() {
    this.$log.debug("Fetching current song");

    return this.$http.get("/current-song")
      .then( this.setFromResponse('currentSong') );
  };

  Soundbridge.prototype.setVolume = function(vol) {
    this.$log.debug("Setting volume");

    return this.$http.post("/volume/" + window.encodeURIComponent(vol))
      .then( this.setFromResponse('volume', Number) );
  };

  Soundbridge.prototype.togglePower = function() {
    this.$log.debug("⚡ Power!");
    return this.$http.post("/ir/power")
      .finally( () => this.sync() );
  };

  Soundbridge.prototype.playPreset = function(name) {
    this.$log.debug("Playing preset " + name);
    return this.$http.post("/play/preset/" + window.encodeURIComponent(name))
      .finally( () => this.sync() );
  };

  Soundbridge.prototype.pause = function() {
    this.$log.debug("Pause");
    return this.$http.post("/pause");
  };

  function retryDelay(attempt = 0) {
    // Don't ever delay longer than ~2 min between retries.  We calculate
    // seconds but return milliseconds, for $timeout and friends.
    return 1000 * Math.min( 2**attempt - 1, 127 );
  }

})();
