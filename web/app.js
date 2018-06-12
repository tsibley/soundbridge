// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  angular
    .module('Soundbridge', ['angular.filter', 'ui.bootstrap', 'rt.debounce'])
    .config(configure)
    .run(init);


  // Configure $location and $anchorScroll to stay out of the way of normal URL
  // and HTML anchors.  We don't use them for an app-wide link/routing
  // mechanism.

  configure.$inject = ['$compileProvider', '$locationProvider', '$anchorScrollProvider'];

  function configure($compileProvider, $locationProvider, $anchorScrollProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
      rewriteLinks: false
    });
    $anchorScrollProvider.disableAutoScrolling();
  }


  // It's super-convenient to have a global singleton always available in
  // templates without needing to pass it around.  This means the base HTML can
  // access it without adding a useless wrapper component or componentizing
  // everything unnecessarily for a project like this.

  init.$inject = ['Soundbridge', '$rootScope', '$log'];

  function init(Soundbridge, $rootScope, $log) {
    $rootScope.soundbridge = Soundbridge;

    // Easier to register this global handler here and inject necessary
    // components into it than to add directive boilerplate and add a phony
    // tag/attribute to the HTML.
    new SeeMeFeelMe($rootScope, Soundbridge);
  }

})();
