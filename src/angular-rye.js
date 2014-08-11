'use strict';
/**
 * Created by Soul on 2014/8/9.
 */

angular.module('ngPromiseRye', []).

  factory('QUtil', function() {
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

    return {
      getThen: function(promise) {
        return tryGetFun('then', promise) || angular.noop;
      },
      onFinally: function(promise, callback) {
        (tryGetFun('then', promise) || angular.noop)(callback, callback);
      },
      handler: function(callback) {
        return function(promise) {
          if (promise && !angular.isString(promise)) {
            callback(promise);
          }
        }
      }
    };
  }).

  directive('ryeShowOnFault', ['QUtil', function(QUtil) {

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        scope.$watchCollection(attrs.ryeShowOnFault, function(promise) {

          element.css('display', 'none');

          QUtil.getThen(promise)(null, function(reason) {
            scope.faultReason = reason;
            element.css('display', '');
          });
        }, true);

      }
    };
  }]).

  directive('ryeShowInProcess', ['QUtil', function(QUtil) {

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        element.css('display', 'none');

        scope.$watchCollection(attrs.ryeShowInProcess, QUtil.handler(function(promise) {

          element.css('display', '');

          QUtil.onFinally(promise, function() {
            element.css('display', 'none');
          });
        }), true);

      }
    };
  }]).

  directive('ryeHideInProcess', ['QUtil', function(QUtil) {

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        scope.$watchCollection(attrs.ryeHideInProcess, QUtil.handler(function(promise) {

          element.css('display', 'none');

          QUtil.onFinally(promise, function() {
            element.css('display', '');
          });
        }), true);

      }
    };
  }]).

  directive('ryeDisableInProcess', ['QUtil', function(QUtil) {

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
    };

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        scope.$watchCollection(attrs.ryeDisableInProcess, QUtil.handler(function(promise) {

          disableElement(element, true);

          QUtil.onFinally(promise, function() {
            disableElement(element, false);
          });

        }), true);

      }
    };
  }]);