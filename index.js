// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, Mine,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = (require('events')).EventEmitter;

  module.exports = function(game, opts) {
    return new Mine(game, opts);
  };

  module.exports.pluginInfo = {
    loadAfter: ['voxel-reach', 'voxel-registry', 'voxel-inventory-hotbar']
  };

  Mine = (function(_super) {
    __extends(Mine, _super);

    function Mine(game, opts) {
      var _ref, _ref1, _ref2, _ref3,
        _this = this;
      this.game = game;
      this.registry = (_ref = game.plugins) != null ? _ref.get('voxel-registry') : void 0;
      this.hotbar = (_ref1 = game.plugins) != null ? _ref1.get('voxel-inventory-hotbar') : void 0;
      this.reach = (function() {
        var _ref3;
        if ((_ref2 = (_ref3 = game.plugins) != null ? _ref3.get('voxel-reach') : void 0) != null) {
          return _ref2;
        } else {
          throw 'voxel-mine requires "voxel-reach" plugin';
        }
      })();
      opts = opts != null ? opts : {};
      if (opts.instaMine == null) {
        opts.instaMine = false;
      }
      if (opts.timeToMine == null) {
        opts.timeToMine = void 0;
      }
      if (opts.progressTexturesPrefix == null) {
        opts.progressTexturesPrefix = void 0;
      }
      if (opts.progressTexturesCount == null) {
        opts.progressTexturesCount = 10;
      }
      if (opts.applyTextureParams == null) {
        opts.applyTextureParams = function(texture) {
          texture.magFilter = _this.game.THREE.NearestFilter;
          texture.minFilter = _this.game.THREE.LinearMipMapLinearFilter;
          texture.wrapT = _this.game.THREE.RepeatWrapping;
          return texture.wrapS = _this.game.THREE.RepeatWrapping;
        };
      }
      this.defaultTextureURL = (_ref3 = opts.defaultTextureURL) != null ? _ref3 : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARElEQVQ4y62TMQoAMAgD8/9PX7cuhYLmnAQTQZMkCdkXT7Mhb5YwHkwwNOQfkOZJNDI1MncLsO5XFFA8oLhQyYGSxMs9lwAf4Z8BoD8AAAAASUVORK5CYII=';
      this.opts = opts;
      this.instaMine = opts.instaMine;
      this.progress = 0;
      if (this.game.isClient) {
        this.texturesEnabled = this.opts.progressTexturesPrefix != null;
        this.overlay = null;
        this.setupTextures();
      }
      this.enable();
    }

    return Mine;

  })(EventEmitter);

  Mine.prototype.timeToMine = function(target) {
    var blockID, blockName, finalTimeToMine, hardness, heldItem, speed, _ref, _ref1, _ref2;
    if (this.opts.timeToMine != null) {
      return this.opts.timeToMine(target);
    }
    if (!this.registry) {
      return 9;
    }
    blockID = game.getBlock(target.voxel);
    blockName = this.registry.getBlockName(blockID);
    hardness = (_ref = this.registry.getBlockProps(blockName)) != null ? _ref.hardness : void 0;
    if (hardness == null) {
      hardness = 9;
    }
    if (!this.hotbar) {
      return hardness;
    }
    heldItem = this.hotbar.held();
    speed = 1.0;
    speed = (_ref1 = (_ref2 = this.registry.getItemProps(heldItem != null ? heldItem.item : void 0)) != null ? _ref2.speed : void 0) != null ? _ref1 : 1.0;
    finalTimeToMine = Math.max(hardness / speed, 0);
    return finalTimeToMine;
  };

  Mine.prototype.enable = function() {
    var _this = this;
    this.reach.on('mining', this.onMining = function(target) {
      var hardness;
      if (!target) {
        console.log("no block mined");
        return;
      }
      _this.progress += 1;
      hardness = _this.timeToMine(target);
      if (_this.instaMine || _this.progress > hardness) {
        _this.progress = 0;
        _this.reach.emit('stop mining', target);
        _this.emit('break', target);
      }
      return _this.updateForStage(_this.progress, hardness);
    });
    this.reach.on('start mining', this.onStartMining = function(target) {
      if (!target) {
        return;
      }
      return _this.createOverlay(target);
    });
    return this.reach.on('stop mining', this.onStopMining = function(target) {
      if (!target) {
        return;
      }
      _this.destroyOverlay();
      return _this.progress = 0;
    });
  };

  Mine.prototype.disable = function() {
    this.reach.removeListener('mining', this.onMining);
    this.reach.removeListener('start mining', this.onStartMining);
    return this.reach.removeListener('stop mining', this.onStopMining);
  };

  Mine.prototype.setupTextures = function() {
    var _this = this;
    if (!this.texturesEnabled) {
      return;
    }
    this.progressTextures = [];
    return this.registry.onTexturesReady(function() {
      var i, path, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = _this.opts.progressTexturesCount; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        path = _this.registry.getTextureURL(_this.opts.progressTexturesPrefix + i);
        if (path == null) {
          if (_this.defaultTextureURL.indexOf('data:') === 0) {
            delete _this.game.THREE.ImageUtils.crossOrigin;
          }
          path = _this.defaultTextureURL;
        }
        _results.push(_this.progressTextures.push(_this.game.THREE.ImageUtils.loadTexture(path)));
      }
      return _results;
    });
  };

  Mine.prototype.createOverlay = function(target) {
    var geometry, material, mesh, offset;
    if (this.instaMine || !this.texturesEnabled) {
      return;
    }
    this.destroyOverlay();
    geometry = new this.game.THREE.Geometry();
    if (target.normal[2] === 1) {
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 1, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 1, 0));
      offset = [0, 0, 1];
    } else if (target.normal[1] === 1) {
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 1));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 0, 1));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 0, 0));
      offset = [0, 1, 0];
    } else if (target.normal[0] === 1) {
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 1, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 1, 1));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 1));
      offset = [1, 0, 0];
    } else if (target.normal[0] === -1) {
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 1));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 1, 1));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 1, 0));
      offset = [0, 0, 0];
    } else if (target.normal[1] === -1) {
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 0, 1));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 1));
      offset = [0, 0, 0];
    } else if (target.normal[2] === -1) {
      geometry.vertices.push(new this.game.THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(0, 1, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 1, 0));
      geometry.vertices.push(new this.game.THREE.Vector3(1, 0, 0));
      offset = [0, 0, 0];
    } else {
      console.log("unknown face", target.normal);
      return;
    }
    geometry.faces.push(new this.game.THREE.Face3(0, 1, 2));
    geometry.faces.push(new this.game.THREE.Face3(0, 2, 3));
    geometry.computeCentroids();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.faceVertexUvs = [
      [
        [
          {
            x: 0,
            y: 0
          }, {
            x: 1,
            y: 0
          }, {
            x: 1,
            y: 1
          }, {
            x: 0,
            y: 1
          }
        ], [
          {
            x: 0,
            y: 0
          }, {
            x: 1,
            y: 1
          }, {
            x: 0,
            y: 1
          }, {
            x: 0,
            y: 1
          }
        ]
      ]
    ];
    material = new this.game.THREE.MeshLambertMaterial();
    material.map = this.progressTextures[0];
    this.opts.applyTextureParams(material.map);
    material.side = this.game.THREE.FrontSide;
    material.transparent = true;
    material.polygonOffset = true;
    material.polygonOffsetFactor = -1.0;
    material.polygonOffsetUnits = -1.0;
    mesh = new this.game.THREE.Mesh(geometry, material);
    this.overlay = new this.game.THREE.Object3D();
    this.overlay.add(mesh);
    this.overlay.position.set(target.voxel[0] + offset[0], target.voxel[1] + offset[1], target.voxel[2] + offset[2]);
    this.game.scene.add(this.overlay);
    return this.overlay;
  };

  Mine.prototype.updateForStage = function(progress, hardness) {
    var index, texture;
    if (!this.texturesEnabled) {
      return;
    }
    index = Math.floor((progress / hardness) * (this.progressTextures.length - 1));
    texture = this.progressTextures[index];
    return this.setOverlayTexture(texture);
  };

  Mine.prototype.setOverlayTexture = function(texture) {
    if (!this.overlay || !this.texturesEnabled) {
      return;
    }
    this.opts.applyTextureParams(texture);
    this.overlay.children[0].material.map = texture;
    return this.overlay.children[0].material.needsUpdate = true;
  };

  Mine.prototype.destroyOverlay = function() {
    if (!this.overlay || !this.texturesEnabled) {
      return;
    }
    this.game.scene.remove(this.overlay);
    return this.overlay = null;
  };

}).call(this);
