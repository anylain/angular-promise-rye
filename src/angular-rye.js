/**
 * Angular promise rye v0.3.0 https://github.com/anylain/angular-promise-rye
 * -----------------------------------------------------------------------------
 * Copyright 2014 PanYing <anylain@gmail.com> Released under the MIT License
 */

(function(window, angular, undefined) {
  'use strict';

  var tryGetFun = function(fun, promise) {
    if (!promise) {
      return;
    }
    if (promise.denodeify) {
      return $q.when(promise)[fun];
    }
    return promise[fun] || promise['$' + fun] ||
      (promise.$promise && promise.$promise[fun]);
  };

  var getThen = function(promise) {
    return tryGetFun('then', promise) || angular.noop;
  };


  var onFinally = function(promise, callback) {
    (tryGetFun('then', promise) || angular.noop)(callback, callback);
  };

  var handler = function(callback) {
    return function(promise) {
      if (promise && !angular.isString(promise)) {
        callback(promise);
      }
    }
  };

  function disableElement(element, isDisabled) {
    var ignore = element.attr('rye-ignore') || element.attr('ryeIgnore');
    if (ignore !== undefined && ignore !== 'false') {
      return;
    }
    var tag = element[0].tagName;
    if (tag === 'INPUT' || tag === 'BUTTON') {
      element.prop({'disabled': isDisabled});
    } else {
      element[(isDisabled ? 'addClass' : 'removeClass')]('disabled');
      angular.forEach(element.children(), function(child) {
        disableElement(angular.element(child), isDisabled);
      });
    }
  }

  function hide(element) {
    element.css('display', 'none');
  }

  function show(element) {
    element.css('display', '');
  }

  angular.module('ngPromiseRye', []).

    directive('ryeShowOnFault', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$watchCollection(attrs.ryeShowOnFault, function(promise) {

            hide(element);

            getThen(promise)(null, function(reason) {
              scope.faultReason = reason;
              show(element);
            });
          }, true);

        }
      };
    }).

    directive('ryeShowOnSuccess', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$watchCollection(attrs.ryeShowOnSuccess, function(promise) {

            hide(element);

            getThen(promise)(function() {
              show(element);
            });
          }, true);

        }
      };
    }).

    directive('ryeHideOnFault', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$watchCollection(attrs.ryeHideOnFault, function(promise) {

            show(element);

            getThen(promise)(null, function() {
              hide(element);
            });
          }, true);

        }
      };
    }).

    directive('ryeHideOnSuccess', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$watchCollection(attrs.ryeHideOnSuccess, function(promise) {

            show(element);

            getThen(promise)(function() {
              hide(element);
            });
          }, true);

        }
      };
    }).

    directive('ryeShowInProcess', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          hide(element);

          scope.$watchCollection(attrs.ryeShowInProcess, handler(function(promise) {

            show(element);

            onFinally(promise, function() {
              hide(element);
            });
          }), true);

        }
      };
    }).

    directive('ryeHideInProcess', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$watchCollection(attrs.ryeHideInProcess, handler(function(promise) {

            hide(element);

            onFinally(promise, function() {
              show(element);
            });
          }), true);

        }
      };
    }).

    directive('ryeDisableInProcess', function() {

      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$watchCollection(attrs.ryeDisableInProcess, handler(function(promise) {

            disableElement(element, true);

            onFinally(promise, function() {
              disableElement(element, false);
            });

          }), true);

        }
      };
    });

})(window, window.angular);