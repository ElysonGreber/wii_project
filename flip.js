var app = angular.module("app", ["profileControllers"]);

angular.module("profileControllers", []);

angular.module("profileControllers").controller("profileCtrl", [
  "$rootScope",
  "$scope",
  "$timeout",
  function ($rootScope, $scope, $timeout) {
    $scope.coach = {
      first_name: "Luke",
      last_name: "Peters",
      email: "lukempeters@gmail.com"
    };

    $scope.saveProfile = function () {
      $scope.formLoading = true;

      $timeout(function () {
        $scope.formLoading = false;

        // Button Animation
        $scope.formSuccess = true;
        $timeout(function () {
          $scope.formSuccess = false;
        }, 2500);
      }, 600);
    };
  }
]);
