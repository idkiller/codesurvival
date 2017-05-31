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

function unit_move(unit, rx, ry) {
    var bb = unit.u.getBBox();
    var cx = unit.x + rx,
        cy = unit.y + ry;
    if (cx > 10 || cx < 1 || cy < 1 || cy > 10) return;
    var elem = unit.u;
    var tx = _X(cx - 1);
    var ty = _Y(cy - 1);
    elem.animate({
        transform: unit_transform(unit, tx, ty)
    }, 200, "linear", null);
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

function unit_collision(a, x, y) {
    if (!a.on_collision) return true;
    var tx = a.x + x, ty = a.y + y;
    if (tx < 1 || tx > 10 || ty < 1 || ty > 10) {
        return a.on_collision("wall", null);
    }
    var b = _game_grid[ty][tx];
    if (b) {
        console.log(b);
        return a.on_collision(b.type, b);
    }
    return true;
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
        forward: function () {
            var dir = unit_dir(this);
            var np = nextpos(dir);
            var c = true;
            if (this.initialized) {
                c = unit_collision(this, np[0], np[1]);
            }

            if (c) {
                _game_grid[this.y][this.x] = null;
                unit_move(this, np[0], np[1]);
                _game_grid[this.y][this.x] = this;
            }

            this.blocker = null;
        },
        turn_right: function () {
            this.rotation += 90;
            unit_move(this, 0, 0);
            this.blocker = null;
        },
        turn_left: function () {
            this.rotation -= 90;
            unit_move(this, 0, 0);
            this.blocker = null;
        },
        detect: function () {
            var somthing = this.blocker;
            if (somthing != null) return somthing;

            var np = nextpos(unit_dir(this));
            var tx = np[0] + this.x;
            var ty = np[1] + this.y;

            Monsters.every(function (unit) {
                if (unit.x == tx && unit.y == ty) {
                    somthing = "monster";
                    return false;
                }
                return true;
            });
            if (somthing != null) return somthing;

            Traps.every(function (unit) {
                if (unit.x == tx && unit.y == ty) {
                    somthing = "trap";
                    return false;
                }
                return true;
            });
            if (somthing != null) return somthing;

            if (tx > 10 || tx < 1 || ty < 1 || ty > 10)
                somthing = "wall";
            if (somthing != null) return somthing;

            Treasures.every(function (unit) {
                if (unit.x == tx && unit.y == ty) {
                    somthing = "treasure";
                    return false;
                }
                return true;
            });

            this.blocker = somthing;

            return somthing;
        },
        dead: function () {
            this.scale = 1.2;
            unit_move(this, 0, 0);
            this.scale = 0.1;
            unit_move(this, 0, 0);

            this.u.remove();
            _game_grid[this.y][this.x] = null;
            this.is_dead = true;
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
    for (i = 0; i < 11; i++) _game_grid.push(new Array(11));

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
        t.show();
        var trap = Unit('trap', t, x, y);
        Traps.push(trap);
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
            else if (type == "trap" || type == "monster" || type == "treasure") {
                if (random_coin()) unit.turn_left();
                else unit.turn_right();
                return false;
            }
            else if (type == "hero") {
                if (b.life-- < 1) {
                    b.dead();
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

    game_init();

    var runner = function () {
        game_run();
        eval(code);
        if (Hero.is_dead) {
            _game_running = false;
        }
        if (_game_running)
            _loop = setTimeout(runner, 300);

        log(__debug());
    };
    _game_running = true;
    runner();
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