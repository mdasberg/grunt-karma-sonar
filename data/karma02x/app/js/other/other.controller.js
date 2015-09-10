(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name karma02x.controller:OtherController
   * @description
   * # OtherController
   * Controller of the karma02x
   */
  function OtherController(some) {
      var vm = this;
        
      vm.whoIsAwesome = some.whoIsAwesome();
  }

    OtherController.$inject = ['other'];

  angular.module('karma02x').controller('OtherController', OtherController);

})();


