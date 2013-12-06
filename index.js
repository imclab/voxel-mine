// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, Mine, inherits;

  inherits = require('inherits');

  EventEmitter = (require('events')).EventEmitter;

  module.exports = function(game, opts) {
    return new Mine(game, opts);
  };

  Mine = function(game, opts) {
    this.game = game;
    opts = opts != null ? opts : {};
    if (opts.defaultHardness == null) {
      opts.defaultHardness = 3;
    }
    if (opts.instaMine == null) {
      opts.instaMine = false;
    }
    if (opts.reach == null) {
      throw "voxel-mine requires 'reach' option set to voxel-reach instance";
    }
    this.opts = opts;
    this.instaMine = opts.instaMine;
    this.progress = 0;
    this.reach = opts.reach;
    this.bindEvents();
    return this;
  };

  Mine.prototype.bindEvents = function() {
    var _this = this;
    return this.reach.on('mining', function(hit_voxel) {
      if (hit_voxel == null) {
        console.log("no block mined");
        return;
      }
      _this.progress += 1;
      _this.drawDamage(hit_voxel);
      if (_this.instaMine || _this.progress > _this.opts.defaultHardness) {
        _this.progress = 0;
        return _this.emit('break', hit_voxel);
      }
    });
  };

  Mine.prototype.drawDamage = function(at) {
    var cube, geometry, material, mesh, obj;
    geometry = new this.game.THREE.CubeGeometry(1, 1, 1);
    material = new this.game.THREE.MeshLambertMaterial();
    mesh = new this.game.THREE.Mesh(geometry, material);
    obj = new game.THREE.Object3D();
    obj.add(mesh);
    obj.position.set(at[0] + 0.5, at[1] + 0.5, at[2] + 0.5);
    return cube = game.addItem({
      mesh: obj,
      size: 1
    });
  };

  inherits(Mine, EventEmitter);

}).call(this);
