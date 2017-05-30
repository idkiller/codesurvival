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

function create_grid()
{
    var w, h;
    Ctx.setStart();
    for (i=0; i<11; i++)
    {
        w = i * CellWidth;
        h = i * CellHeight;
        Ctx.path("M0,"+w+"L"+CanvasWidth+","+w+"Z");
        Ctx.path("M"+h+",0L"+h+","+CanvasHeight+"Z");
    }
    var grid = Ctx.setFinish();
    grid.attr({stroke:"gray"});
    return grid;
}

function create_unit(src)
{
    if (!_unit[src])
    {
        _unit[src] = Ctx.image(src, -UnitWidth, -UnitHeight, UnitWidth, UnitHeight);
        _unit[src].hide();
    }
    return _unit[src].clone();
}

function create_monster()
{
    return create_unit("img/monster.png");
}

function create_traps()
{
    return create_unit("img/trap.png");
}

function create_treasure()
{
    return create_unit("img/treasure.png");
}

function create_hero()
{
    return create_unit("img/hero.png");
}

function _X(x) { return x * CellWidth; }
function _Y(y) { return y * CellHeight; }

function Unit(element, px, py)
{
    return {unit: element, x: px, y: py,
        move: function(x, y){
            this.unit.translate(_X(x), _(y));
        }
    };
}

function game_run()
{
    Monsters.forEach(function(unit, index, arr){
    });
}

function game_init(monsters, traps, treasures)
{
    var i=0, p=0;

    create_grid();

    traps.forEach(function(xy, index, arr){
        var x = xy[0], y = xy[1];
        var t = create_traps();
        t.translate(_X(x), _Y(y));
        t.show();
        Traps.push(Unit(t));
    });

    monsters.forEach(function(xy, index, arr){
        var x = xy[0], y = xy[1];
        var m = create_monster();
        m.translate(_X(x), _Y(y));
        m.show();
        Monsters.push(Unit(m, x, y));
    });

    treasures.forEach(function(xy, index, arr){
        var x = xy[0], y = xy[1];
        var u = create_treasure();
        u.translate(_X(x), _Y(y));
        u.show();
        Treasures.push(Unit(u, x, y));
    });

    Hero = create_hero();
    Hero.translate(_X(1), _Y(1));
    Hero.show();
}

function game_main(canvas, monsters, traps, treasures) {
    Raphael(
        function() {
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