PINF.bundle("", function(__require) {
	__require.memoize("/main.js", function (_require, _exports, _module) {
var bundle = { require: _require, exports: _exports, module: _module };
var exports = undefined;
var module = undefined;
var define = function (deps, init) {
_module.exports = init();
}; define.amd = true;
       var pmodule = bundle.module;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

PINF.bundle("", function (__require) {
  __require.memoize("/main.js", function (_require, _exports, _module) {
    var bundle = {
      require: _require,
      exports: _exports,
      module: _module
    };
    var exports = undefined;
    var module = undefined;

    var define = function define(deps, init) {
      _module.exports = init();
    };

    define.amd = true;
    var pmodule = bundle.module;

    (function (f) {
      if (_typeof(exports) === "object" && typeof module !== "undefined") {
        module.exports = f();
      } else if (typeof define === "function" && define.amd) {
        define([], f);
      } else {
        var g;

        if (typeof window !== "undefined") {
          g = window;
        } else if (typeof global !== "undefined") {
          g = global;
        } else if (typeof self !== "undefined") {
          g = self;
        } else {
          g = this;
        }

        g.mainModule = f();
      }
    })(function () {
      var define, module, exports;
      return function () {
        function r(e, n, t) {
          function o(i, f) {
            if (!n[i]) {
              if (!e[i]) {
                var c = "function" == typeof require && require;
                if (!f && c) return c(i, !0);
                if (u) return u(i, !0);
                var a = new Error("Cannot find module '" + i + "'");
                throw a.code = "MODULE_NOT_FOUND", a;
              }

              var p = n[i] = {
                exports: {}
              };
              e[i][0].call(p.exports, function (r) {
                var n = e[i][1][r];
                return o(n || r);
              }, p, p.exports, r, e, n, t);
            }

            return n[i].exports;
          }

          for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
            o(t[i]);
          }

          return o;
        }

        return r;
      }()({
        1: [function (require, module, exports) {
          "use strict";

          describe('Array!!', function () {
            describe('#indexOf()', function () {
              it('should return -1 when the value is not present', function () {
                chai.assert.equal(-1, [1, 2, 3].indexOf(4));
              });
            });
          });
        }, {}]
      }, {}, [1])(1);
    });
  });
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});

	});
});