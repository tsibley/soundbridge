// vim: set sw=2 ts=2 :
(function() {
  'use strict';

  angular
    .module('Soundbridge')
    .component('playPreset', {
      controller: componentController,
      templateUrl: 'partial/play-preset.html',
      bindings: {
        preset: '<'
      }
    });


  // This is for convenience when using components, which force isolate scope,
  // instead of directives.  Maybe I should use directives, or design the API
  // differently… but, meh.  This is a hacky personal project, and it's
  // super-convenient to have a global singleton always available in templates
  // without needing to pass it around.

  componentController.$inject = ['Soundbridge', '$scope'];

  function componentController(Soundbridge, $scope) {
    $scope.soundbridge = Soundbridge;
  }

})();
