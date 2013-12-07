// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, Mine, inherits;

  inherits = require('inherits');

  EventEmitter = (require('events')).EventEmitter;

  module.exports = function(game, opts) {
    return new Mine(game, opts);
  };

  Mine = function(game, opts) {
    var _this = this;
    this.game = game;
    opts = opts != null ? opts : {};
    if (opts.defaultHardness == null) {
      opts.defaultHardness = 8;
    }
    if (opts.instaMine == null) {
      opts.instaMine = false;
    }
    if (opts.progressTexturesBase == null) {
      opts.progressTexturesBase = "ProgrammerArt/textures/blocks/destroy_stage_";
    }
    if (opts.progressTexturesExt == null) {
      opts.progressTexturesExt = ".png";
    }
    if (opts.progressTexturesCount == null) {
      opts.progressTexturesCount = 8;
    }
    if (opts.applyTextureParams == null) {
      opts.applyTextureParams = function(texture) {
        texture.magFilter = _this.game.THREE.NearestFilter;
        texture.minFilter = _this.game.THREE.LinearMipMapLinearFilter;
        texture.wrapT = _this.game.THREE.RepeatWrapping;
        return texture.wrapS = _this.game.THREE.RepeatWrapping;
      };
    }
    if (opts.reach == null) {
      throw "voxel-mine requires 'reach' option set to voxel-reach instance";
    }
    this.opts = opts;
    this.instaMine = opts.instaMine;
    this.progress = 0;
    this.reach = opts.reach;
    this.overlay = null;
    this.setupTextures();
    this.bindEvents();
    return this;
  };

  Mine.prototype.setupTextures = function() {
    var i, path, _i, _ref, _results;
    this.progressTextures = [];
    _results = [];
    for (i = _i = 0, _ref = this.opts.progressTexturesCount; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      path = this.opts.progressTexturesBase + i + this.opts.progressTexturesExt;
      console.log("path", i, path);
      _results.push(this.progressTextures.push(this.game.THREE.ImageUtils.loadTexture(path)));
    }
    return _results;
  };

  Mine.prototype.bindEvents = function() {
    var _this = this;
    this.reach.on('mining', function(target) {
      if (!target) {
        console.log("no block mined");
        return;
      }
      _this.progress += 1;
      _this.updateForStage();
      if (_this.instaMine || _this.progress > _this.opts.defaultHardness) {
        _this.progress = 0;
        return _this.emit('break', target.voxel);
      }
    });
    this.reach.on('start mining', function(target) {
      if (!target) {
        return;
      }
      return _this.createOverlay(target);
    });
    return this.reach.on('stop mining', function(target) {
      if (!target) {
        return;
      }
      return _this.destroyOverlay();
    });
  };

  Mine.prototype.createOverlay = function(target) {
    var geometry, material, mesh, obj, offset;
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
        ]
      ]
    ];
    material = new this.game.THREE.MeshLambertMaterial();
    material.map = this.progressTextures[0];
    this.opts.applyTextureParams(material.map);
    material.side = this.game.THREE.FrontSide;
    material.transparent = true;
    material.depthWrite = false;
    material.depthTest = false;
    mesh = new this.game.THREE.Mesh(geometry, material);
    obj = new this.game.THREE.Object3D();
    obj.add(mesh);
    obj.position.set(target.voxel[0] + offset[0], target.voxel[1] + offset[1], target.voxel[2] + offset[2]);
    this.overlay = this.game.addItem({
      mesh: obj,
      size: 1
    });
    return this.overlay;
  };

  Mine.prototype.updateForStage = function() {
    var index, texture;
    index = this.progress % this.progressTextures.length;
    texture = this.progressTextures[index];
    return this.setOverlayTexture(texture);
  };

  Mine.prototype.setOverlayTexture = function(texture) {
    if (!this.overlay) {
      return;
    }
    this.opts.applyTextureParams(texture);
    this.overlay.mesh.children[0].material.map = texture;
    return this.overlay.mesh.children[0].material.needsUpdate = true;
  };

  Mine.prototype.destroyOverlay = function() {
    if (!this.overlay) {
      return;
    }
    this.game.removeItem(this.overlay);
    return this.overlay = null;
  };

  inherits(Mine, EventEmitter);

}).call(this);
