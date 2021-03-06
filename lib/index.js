'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _imageSize = require('image-size');

var _imageSize2 = _interopRequireDefault(_imageSize);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var HIDPI_IMAGE_WIDTH_PATTERN = /hidpi-image-width\(['"]?(.+?)['"]?\)/;
var HIDPI_IMAGE_HEIGHT_PATTERN = /hidpi-image-height\(['"]?(.+?)['"]?\)/;
var IMAGE_WIDTH_PATTERN = /image-width\(['"]?(.+?)['"]?\)/;
var IMAGE_HEIGHT_PATTERN = /image-height\(['"]?(.+?)['"]?\)/;

var cachedSizes = {};

function imageExists(imagePath) {
  try {
    _fs2['default'].statSync(imagePath).toString();
    return true;
  } catch (err) {
    return false;
  }
}

function getImageSizeByPath(assetsPath, sourcePath, imagePath) {
  var resolvedImagePath = undefined;
  if (imagePath[0] == '/' || imagePath[0] == '~') {
    imagePath = imagePath.substr(1);
    if (Array.isArray(assetsPath)) {
      var tmpPath = assetsPath.find(function (p) {
        return imageExists(_path2['default'].resolve(p, imagePath));
      });
      resolvedImagePath = _path2['default'].resolve(tmpPath, imagePath);
    } else {
      resolvedImagePath = _path2['default'].resolve(assetsPath, imagePath);
    }
  } else {
    resolvedImagePath = _path2['default'].resolve(_path2['default'].dirname(sourcePath), imagePath);
  }

  cachedSizes[resolvedImagePath] = cachedSizes[resolvedImagePath] || (0, _imageSize2['default'])(resolvedImagePath);
  return cachedSizes[resolvedImagePath];
}

function applyImageHelper(css, getImageSize, helperString, helperPattern) {
  css.replaceValues(helperPattern, { fast: helperString }, function (string) {
    var imagePath = string.match(helperPattern)[1];
    var isRetinaImage = helperPattern == HIDPI_IMAGE_WIDTH_PATTERN || helperPattern == HIDPI_IMAGE_HEIGHT_PATTERN;
    var isWidthHelper = helperPattern == IMAGE_WIDTH_PATTERN || helperPattern == HIDPI_IMAGE_WIDTH_PATTERN;

    try {
      var imageSize = getImageSize(css.source.input.file, imagePath);

      if (isRetinaImage) {
        return imageSize[isWidthHelper ? 'width' : 'height'] / 2 + 'px';
      } else {
        return imageSize[isWidthHelper ? 'width' : 'height'] + 'px';
      }
    } catch (e) {
      throw css.error(e.message, { plugin: 'postcss-image-sizes' });
    }
  });
}

exports['default'] = _postcss2['default'].plugin('postcss-image-sizes', function () {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var assetsPath = opts.assetsPath;
  var getImageSize = getImageSizeByPath.bind(undefined, assetsPath);

  return function (css, result) {
    var applyImageHelperToCss = applyImageHelper.bind(undefined, css, getImageSize);

    applyImageHelperToCss('hidpi-image-width', HIDPI_IMAGE_WIDTH_PATTERN);
    applyImageHelperToCss('hidpi-image-height', HIDPI_IMAGE_HEIGHT_PATTERN);
    applyImageHelperToCss('image-width', IMAGE_WIDTH_PATTERN);
    applyImageHelperToCss('image-height', IMAGE_HEIGHT_PATTERN);
  };
});
module.exports = exports['default'];