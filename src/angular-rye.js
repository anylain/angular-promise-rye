/**
 * Angular promise rye v0.4.5 https://github.com/anylain/angular-promise-rye
 * -----------------------------------------------------------------------------
 * Copyright 2014 PanYing <anylain@gmail.com> Released under the MIT License
 */

(function (window, angular, undefined) {
  'use strict';


  function callThen(promise, onFulfilled, onRejected) {
    if (promise) {
      var onFulfilledCallback = onFulfilled ? function () {
        onFulfilled(promise);
      } : null;
      var onRejectedCallback = onRejected ? function (reason) {
        onRejected(promise, reason);
      } : null;
      (promise.then || promise.$then).call(promise, onFulfilledCallback, onRejectedCallback);
    }
  }


  function watchInterceptor(value) {
    if (angular.isDefined(value) && value !== null) {
      if (value.then || value.$then) {
        return value;
      } else if (value.$promise) {
        return value.$promise;
      } else if (value.denodeify) {
        return $q.when(value);
      }
    }
  }


  function onFinally(promise, callback) {
    callThen(promise, callback, callback);
  }


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
      angular.forEach(element.children(), function (child) {
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

  angular.module('ngPromiseRye', []).directive('ryeShowOnFault', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$watchCollection($parse(attrs.ryeShowOnFault, watchInterceptor), function (promise) {

          var currPromise = promise;

          hide(element);

          callThen(promise, null, function (promise, reason) {
            if (currPromise === promise) {
              scope.faultReason = reason;
              show(element);
            }
          });
        });

      }
    };
  }]).directive('ryeShowOnSuccess', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$watchCollection($parse(attrs.ryeShowOnSuccess, watchInterceptor), function (promise) {

          var currPromise = promise;

          hide(element);

          callThen(promise, function (promise) {
            if (currPromise === promise) {
              show(element);
            }
          });
        });

      }
    };
  }]).directive('ryeHideOnFault', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$watchCollection($parse(attrs.ryeHideOnFault, watchInterceptor), function (promise) {

          var currPromise = promise;

          show(element);

          callThen(promise, null, function () {
            if (currPromise === promise) {
              hide(element);
            }
          });
        });

      }
    };
  }]).directive('ryeHideOnSuccess', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$watchCollection($parse(attrs.ryeHideOnSuccess, watchInterceptor), function (promise) {

          var currPromise = promise;

          show(element);

          callThen(promise, function (promise) {
            if (currPromise === promise) {
              hide(element);
            }
          });
        });

      }
    };
  }]).directive('ryeShowInProcess', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        hide(element);

        scope.$watchCollection($parse(attrs.ryeShowInProcess, watchInterceptor), function (promise) {

          if (promise && !angular.isString(promise)) {

            var currPromise = promise;

            show(element);

            onFinally(promise, function (promise) {
              if (currPromise === promise) {
                hide(element);
              }
            });
          } else {
            hide(element);
          }
        });

      }
    };
  }]).directive('ryeHideInProcess', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$watchCollection($parse(attrs.ryeHideInProcess, watchInterceptor), function (promise) {

          var currPromise = promise;

          if (promise && !angular.isString(promise)) {

            hide(element);

            onFinally(promise, function (promise) {
              if (currPromise === promise) {
                show(element);
              }
            });
          } else {
            show(element);
          }
        });

      }
    };
  }]).directive('ryeDisableInProcess', ['$parse', function ($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$watchCollection($parse(attrs.ryeDisableInProcess, watchInterceptor), function (promise) {

          var currPromise = promise;

          if (promise && !angular.isString(promise)) {

            disableElement(element, true);

            onFinally(promise, function (promise) {
              if (currPromise === promise) {
                disableElement(element, false);
              }
            });
          } else {
            disableElement(element, false);
          }

        });
      }
    };
  }]).directive('ryeClass', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var config = /^(\{.*\})\[(.+)\]$/.exec(attrs.ryeClass);

        var classes = scope.$eval(config[1]);
        var promiseObj = config[2];

        scope.$watchCollection($parse(promiseObj, watchInterceptor), function (promise) {

          var currPromise = promise;

          if (promise && !angular.isString(promise)) {

            element.addClass(classes['process']);
            element.removeClass([classes.success, classes.fault, classes.finally].join(" "));

            callThen(promise, function (promise) {
              if (currPromise === promise) {
                element.addClass(classes.success);
              }
            }, function (promise) {
              if (currPromise === promise) {
                element.addClass(classes.fault);
              }
            });

            onFinally(promise, function (promise) {
              if (currPromise === promise) {
                element.removeClass(classes.process);
                element.addClass(classes.finally);
              }
            });
          } else {
            element.removeClass([classes.process, classes.success, classes.fault, classes.finally].join(" "));
          }
        });

      }
    };
  }]);

})
(window, window.angular);
