(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name project-z.controller:someController
   * @description
   * # someController
   * Controller of the project-z
   */
  function SomeController(some) {
      var vm = this;
        
      vm.whoIsAwesome = some.whoIsAwesome();
  }

  SomeController.$inject = ['some'];

  angular.module('project-z').controller('SomeController', SomeController);

})();


