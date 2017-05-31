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

_survival_log_element = document.getElementById("survival_log");

_seed = 1;

_game_running = false;

function log(str) {
    _survival_log_element.value += str + "\n";
}

function random_seed(seed) {
    _seed = seed;
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
    var tstr = unit.trans + ["t", dx, dy] + ["r" + unit.rotation, cx, cy];
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

function Unit(element, px, py) {
    return {
        u: element, x: px, y: py, dx: 1, dy: 0,
        trans: element.attr('transform'),
        rotation: 0, tx: 0, ty: 0,
        move: function () {

            if (this.x + this.dx > 10) {
                this.dx = -1;
            }
            if (this.x < 2) {
                this.dx = 1;
            }

            this.u.translate(_X(this.dx), 0);
            this.x += this.dx;
        },
        forward: function () {
            var dir = unit_dir(this);
            var np = nextpos(dir)
            unit_move(this, np[0], np[1]);
            //console.log(this.rotation);
            //console.log(dir);
        },
        turn_right: function () {
            this.rotation += 90;
            unit_move(this, 0, 0);
        },
        turn_left: function () {
            this.rotation -= 90;
            unit_move(this, 0, 0);
        },
        detect: function () {
            var somthing = null;
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
                    somthing = "traps";
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

            return somthing;
        }
    };
}

function game_run() {
    Monsters.forEach(function (unit, index, arr) {
        var blocker = unit.detect();
        if (blocker == null) {
            unit.forward();
        }
        else if (blocker == "wall") {
            unit.turn_right();
            unit.turn_right();
        }
        else if (blocker == "traps") {
            if (random_coin()) unit.turn_left();
            else unit.turn_right();
        }
        else if (blocker == "monster") {
            if (random_coin()) unit.turn_left();
            else unit.turn_right();
        }
        else if (blocker == "treasure") {
            if (random_coin()) unit.turn_left();
            else unit.turn_right();
        }
    });
}

function game_init(monsters, traps, treasures) {
    var i = 0, p = 0;

    create_grid();

    traps.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var t = create_traps();
        t.translate(_X(x), _Y(y));
        t.show();
        Traps.push(Unit(t, x, y));
    });

    monsters.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var m = create_monster();
        m.translate(_X(1), _Y(1));
        m.show();
        var unit = Unit(m, 1, 1);

        for (i = 0; i < y; i++) {
            unit.forward();
        }
        unit.turn_left();
        for (i = 0; i < x; i++) {
            unit.forward();
        }
        Monsters.push(unit);
    });

    treasures.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var u = create_treasure();
        u.translate(_X(x), _Y(y));
        u.show();
        Treasures.push(Unit(u, x, y));
    });

    var hero = create_hero();
    hero.translate(_X(1), _Y(1));
    hero.show();
    Hero = Unit(hero, 1, 1);
}

function game_main(canvas, monsters, traps, treasures) {
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
            game_init(monsters, traps, treasures);
        });
}

function game_start(code) {
    console.log(code);
    var runner = function () {
        game_run();
        if (_game_running)
            setTimeout(runner, 300);
    };
    _game_running = true;
    runner();
}

function game_stop() {
    _game_running = false;
}

function game_hero_forward() {
}