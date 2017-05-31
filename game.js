Monsters = [];
Traps = [];
Treasures = [];
Hero = null;

CanvasWidth = 0;
CanvasHeight = 0;
CellWidth = 0;
CellHeight = 0;
UnitWidth = 0;
UnitHeight = 0;
Ctx = null;

_unit = {};

_survival_log_element = null;

_seed = 1;
_init_seed = 1;

_game_running = false;

Score = 0;

_grid = null;

_loop = null;

_game_grid = [];

_score_board = null;

function add_score(score) {
    if (!_score_board) _score_board = document.getElementById("game_score");
    Score += score;
    _score_board.value = "score : " + Score;
}

function log(str) {
    if (!_survival_log_element)
        _survival_log_element = document.getElementById("survival_log");
    _survival_log_element.value = str + "\n";
}

function set_random_seed(seed) {
    _init_seed = seed;
    reset_random();
}

function reset_random() {
    _seed = _init_seed;
}

function random() {
    var x = Math.sin(_seed++) * 10000;
    return x - Math.floor(x);
}

function random_between(a, b) {
    return ~~((random() / 1) * (b - a) + a);
}

function random_coin() {
    return ~~(random() * 10) % 2 == 0;
}

function create_grid() {
    var w, h;
    Ctx.setStart();
    for (i = 0; i < 11; i++) {
        w = i * CellWidth;
        h = i * CellHeight;
        Ctx.path("M0," + w + "L" + CanvasWidth + "," + w + "Z");
        Ctx.path("M" + h + ",0L" + h + "," + CanvasHeight + "Z");
    }
    var grid = Ctx.setFinish();
    grid.attr({ stroke: "gray" });
    return grid;
}

function create_unit(src) {
    if (!_unit[src]) {
        _unit[src] = Ctx.image(src, -UnitWidth, -UnitHeight, UnitWidth, UnitHeight);
        _unit[src].hide();
    }
    return _unit[src].clone();
}

function create_monster() {
    return create_unit("img/monster.png");
}

function create_traps() {
    return create_unit("img/trap.png");
}

function create_treasure() {
    return create_unit("img/treasure.png");
}

function create_hero() {
    return create_unit("img/hero.png");
}

function _X(x) { return x * CellWidth; }
function _Y(y) { return y * CellHeight; }

function unit_transform(unit, dx, dy) {
    var cx = -CellWidth / 2, cy = -CellHeight / 2;
    var tstr = unit.trans + ["t" + dx, dy] + ["r" + unit.rotation, cx, cy];
    if (unit.scale != 1) {
        tstr += ['s' + unit.scale, unit.scale];
    }
    //console.log(tstr);
    //console.log(unit.dir);
    return tstr;
}

function unit_move(unit, rx, ry, cb) {
    var bb = unit.u.getBBox();
    var cx = unit.x + rx,
        cy = unit.y + ry;
    if (cx > 10 || cx < 1 || cy < 1 || cy > 10) return;
    var elem = unit.u;
    var tx = _X(cx - 1);
    var ty = _Y(cy - 1);
    elem.animate({
        transform: unit_transform(unit, tx, ty)
    }, 200, "linear", cb);
    unit.x = cx;
    unit.y = cy;
}

function unit_dir(unit) {
    return (Math.abs((unit.rotation + 360) / 90) % 4) + 1;
}

function nextpos(dir) {
    // 1: downward, 2: left, 3: upward, 4: right
    switch (dir) {
        case 1: return [0, 1];
        case 2: return [-1, 0];
        case 3: return [0, -1];
        case 4: return [1, 0];
    }
    return [0, 0];
}

function Unit(t, element, px, py, collision_cb) {
    var __unit = {
        type: t,
        u: element, x: px, y: py,
        trans: element.attr('transform'),
        rotation: 0, scale: 1,
        blocker: null,
        life: 3,
        initialized: false,
        on_collision: collision_cb,
        is_dead: false,
        init: function () {
            _game_grid[this.y][this.x] = this;
            this.initialized = true;
        },
        forward: function (cb) {
            var dir = unit_dir(this);
            var np = nextpos(dir);
            var c = true;
            var self = this;
            if (this.initialized) {
                var d = this.detect(function (type, block) {
                    if (!self.on_collision || self.on_collision(type, block)) {
                        _game_grid[self.y][self.x] = null;
                        unit_move(self, np[0], np[1], cb);
                        _game_grid[self.y][self.x] = self;
                    }
                });
            }
            else {
                unit_move(this, np[0], np[1]);
            }

            this.blocker = null;
        },
        turn_right: function (cb) {
            this.rotation += 90;
            unit_move(this, 0, 0, cb);
            this.blocker = null;
        },
        turn_left: function (cb) {
            this.rotation -= 90;
            unit_move(this, 0, 0, cb);
            this.blocker = null;
        },
        detect: function (cb) {
            var ret = null;
            var dir = unit_dir(this);
            var np = nextpos(dir);
            var tx = this.x + np[0], ty = this.y + np[1];
            var b = null;
            if (tx < 1 || tx > 10 || ty < 1 || ty > 10) {
                ret = "wall";
            }
            else {
                b = _game_grid[ty][tx];
                if (b) ret = b.type;
            }
            if (cb) cb(ret, b);

            return ret;
        },
        dead: function (cb) {
            this.scale = 1.2;
            unit_move(this, 0, 0);
            this.scale = 0.1;
            var self = this;
            unit_move(this, 0, 0, function () {
                self.u.remove();
                _game_grid[self.y][self.x] = null;
                self.is_dead = true;
            });
        }
    };

    __unit.init();

    return __unit;
}

function game_run() {
    Monsters.forEach(function (unit, index, arr) {
        unit.forward();
    });
}

function game_init() {
    var i = 0, p = 0;

    if (!_grid) _grid = create_grid();

    _game_grid = [];
    for (i = 0; i < 11; i++) _game_grid.push(new Array(11).fill(null));

    var units = [];
    var monster_count = random_between(3, 6);
    var monsters = [], monster = null;
    for (i = 0; i < monster_count; i++) {
        monster = null;
        do {
            monster = [random_between(1, 10), random_between(1, 10)];
        }
        while (units.some(function (x) { return x[0] == monster[0] && x[1] == monster[1]; }))
        monsters.push(monster);
        units.push(monster);
    }
    var trap_count = random_between(3, 6);
    var traps = [], trap = null;
    for (i = 0; i < trap_count; i++) {
        trap = null;
        do {
            trap = [random_between(1, 10), random_between(1, 10)];
        }
        while (units.some(function (x) { return x[0] == trap[0] && x[1] == trap[1]; }))
        traps.push(trap);
        units.push(trap);
    }
    var treasure_count = random_between(3, 6);
    var treasures = [], treasure = null;
    for (i = 0; i < treasure_count; i++) {
        treasure = null;
        do {
            treasure = [random_between(1, 10), random_between(1, 10)];
        }
        while (units.some(function (x) { return x[0] == treasure[0] && x[1] == treasure[1]; }))
        treasures.push(treasure);
        units.push(treasure);
    }

    traps.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var t = create_traps();
        t.translate(_X(x), _Y(y));
        //t.show();
        var unit = Unit('trap', t, x, y);
        Traps.push(unit);
    });

    monsters.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var m = create_monster();
        m.translate(_X(1), _Y(1));
        m.show();
        var unit = Unit('monster', m, 1, 1);
        unit.initialized = false;

        for (i = 0; i < y; i++) {
            unit.forward();
        }
        unit.turn_left();
        for (i = 0; i < x; i++) {
            unit.forward();
        }
        unit.initialized = true;

        unit.on_collision = function (type, b) {
            if (type == "wall") {
                this.turn_right();
                this.turn_right();
                return false;
            }
            else if (type == "monster" || type == "treasure") {
                if (random_coin()) unit.turn_left();
                else unit.turn_right();
                return false;
            }
            else if (type == "hero") {
                b.life--;
                if (b.life < 1) {
                    b.dead();
                    game_stop();
                }
                return false;
            }
            return true;
        }

        Monsters.push(unit);
    });

    treasures.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var u = create_treasure();
        u.translate(_X(x), _Y(y));
        u.show();
        var unit = Unit('treasure', u, x, y);
        Treasures.push(unit);
    });

    var hero = create_hero();
    hero.translate(_X(1), _Y(1));
    hero.show();
    Hero = Unit('hero', hero, 1, 1);
    Hero.on_collision = function (type, block) {
        var act = true;
        if (type) {
            act = false;
        }

        if (type == "trap") {
            block.u.show();
            Hero.dead();
            game_stop();
        }
        else if (type == "monster") {
            Hero.life--;
            if (Hero.life < 1) {
                Hero.dead();
                game_stop();
            }
        }
        else if (type == "treasure") {
            add_score(10);
            block.dead();
        }

        return act;
    };
}

function game_main(canvas) {
    Raphael(
        function () {
            var canvasElement = document.getElementById(canvas);
            Ctx = Raphael(canvas);
            CanvasWidth = Ctx.width;
            CanvasHeight = Ctx.height;
            CellWidth = CanvasWidth / 10;
            CellHeight = CanvasHeight / 10;
            UnitWidth = CellWidth - 4;
            UnitHeight = CellHeight - 4;
            game_init();
        });
}

function game_start(code) {
    console.log(code);

    reset_random();

    if (_loop) {
        clearTimeout(_loop);
        _loop = null;
    }

    var remover = function (m) { m.u.remove(); };
    Monsters.forEach(remover);
    Traps.forEach(remover);
    Treasures.forEach(remover);
    Monsters = [];
    Traps = [];
    Treasures = [];
    if (Hero != null) Hero.u.remove();
    Hero = null;
    Score = 0;

    game_init();

    var runner = function () {
        game_run();
        eval(code);
        log(__debug());

        if (Hero.is_dead) {
            _game_running = false;
        }
        else {
            add_score(1);
        }
        if (_game_running)
            _loop = setTimeout(runner, 300);

    };
    _game_running = true;
    runner();
    log(__debug());
}

function game_stop() {
    _game_running = false;
}

function __debug() {
    var i = 0, j = 0, str = "";
    for (i = 1; i < 11; i++) {
        for (j = 1; j < 11; j++) {
            if (_game_grid[i][j]) {
                var t = _game_grid[i][j].type;
                if (t == "monster") str += '1 ';
                else if (t == "trap") str += 't ';
                else if (t == "treasure") str += 'w ';
                else if (t == "hero") str += '* ';
                else str += 'x ';
            }
            else str += '0 ';
        }
        str += "\n";
    }
    return str;
}