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

function log(str)
{
    _survival_log_element.value += str + "\n";
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

function unit_move(unit, rx, ry)
{
    var bb = unit.u.getBBox();
    var cx = unit.x + rx,
        cy = unit.y + ry;
    if (cx > 10 || cx < 1 || cy < 1 || cy > 10) return;
    var elem = unit.u;
    var tx = _X(cx-2);
    var ty = _Y(cy-2);
    console.log(tx + ", " + ty);
    elem.animate({
        x: tx, y: ty
    }, 200, "linear", null);
    unit.x = cx;
    unit.y = cy;
}

function Unit(element, px, py) {
    return {
        u: element, x: px, y: py, dx: 1, dy: 0, dir: 1, trans:element.attr('transform'), rotation:0,
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
        forward: function() {
            switch(this.dir)
            {
                // 1: downward, 2: left, 3: upward, 4: right
                case 1: unit_move(this, 0, 1); break;
                case 2: unit_move(this, -1, 0); break;
                case 3: unit_move(this, 0, -1); break;
                case 4: unit_move(this, 1, 0); break;
            }
        },
        turn_right: function() {
            var bb = this.u.getBBox();
            var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
            this.dir = this.dir == 4 ? 1 : this.dir+1;
            this.rotation += 90;
            this.u.animate({transform:this.trans+"R"+(this.rotation)+","+cx+","+cy}, 200, "linear", null);
        },
        turn_left: function() {
            var bb = this.u.getBBox();
            var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
            this.dir = this.dir == 1 ? 4 : this.dir-1;
            this.rotation -= 90;
            this.u.animate({transform:this.trans+"R"+(this.rotation)+","+cx+","+cy}, 200, "linear", null);
        }
    };
}

function game_run() {
    Monsters.forEach(function (unit, index, arr) {
        unit.move();
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
        Traps.push(Unit(t));
    });

    monsters.forEach(function (xy, index, arr) {
        var x = xy[0], y = xy[1];
        var m = create_monster();
        m.translate(_X(x), _Y(y));
        m.show();
        Monsters.push(Unit(m, x, y));
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

function game_start(code)
{
    console.log(code);
    var runner = function () {
        game_run();
        setTimeout(runner, 300);
    };
}

function game_hero_forward()
{
}