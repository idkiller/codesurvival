var TypeHero = 0,
    TypeMonster = 1,
    TypeTrap = 2,
    TypeTreasure = 3,
    DirNorth = 1,
    DirEast = 2,
    DirSouth = 3,
    DirWest = 4;

var Game = {
    View: null,
    Cell: null,
    Rows: 10,
    Cols: 10,
    Background: null,
    GridColor: 'gray',
    Fog: null,
    Sight: null,
    RandomSeed: 1,

    UnitMap: null,
    Hero: null,

    MovableUnits: [],
    AllUnits: [],

    Quantity: {
        TypeMonster: 0,
        TypeTrap: 0,
        TypeTreasure: 0
    }

};

Game.SetRandomSeed = function (x) {
    this.RandomSeed = x;
    this.resetRandom();
}
Game.resetRandom = function () {
    this._seed = this.RandomSeed;
}
Game.Random = function () {
    var x = Math.sin(this._seed++) * 10000;
    return x - Math.floor(x);
}

Game.Random2 = function (a, b) {
    return ~~((this.Random() / 1) * (b - a) + a);
}

Game.RandomCoin = function () {
    return ~~(this.Random() * 10) % 2 == 0;
}

Game.Initialize = function () {
    var i;
    this.View = view.getBounds();
    this.Cell = new Size(this.View.width / this.Cols, this.View.height / this.Rows);
    this.Background = this.drawGrid();

    this.Reset();
}
Game.batchUnit = function (img_id, type) {
    var i, unit, ux, uy, units = [];
    this.UnitMap[type] = [];
    for (i = 0; i < this.Rows + 1; i++) this.UnitMap[type].push(new Array(this.Cols + 1).fill(null));
    this.Quantity[type] = this.Random2(3, 6);
    for (i = 0; i < this.Quantity[type]; i++) {
        do {
            ux = this.Random2(2, 10);
            uy = this.Random2(2, 10);
        }
        while (this._map[uy][ux] != 0);
        this._map[uy][ux] = 1;
        unit = this.CreateUnit(img_id, type, ux, uy);
        this.UnitMap[type][uy][ux] = unit;
        units.push(unit);
    }
    return units;
}

Game.Reset = function () {
    var i;
    for (i = 0; i < this.AllUnits.length; i++) {
        if (this.AllUnits[i]) this.AllUnits[i].obj.remove();
    }
    this.resetRandom();

    this.UnitMap = [];

    this._map = [];
    for (i = 0; i < this.Rows + 1; i++) this._map.push(new Array(this.Cols + 1).fill(0));

    this.MovableUnits = [];
    this.AllUnits = [];

    var traps = this.batchUnit('img_trap', TypeTrap);
    var treasures = this.batchUnit('img_treasure', TypeTreasure);
    var monsters = this.batchUnit('img_monster', TypeMonster);
    this.MovableUnits = this.MovableUnits.concat(monsters);
    this.AllUnits = traps.concat(treasures).concat(monsters);
    this._map = null;

    this.Hero = this.CreateUnit('img_hero', TypeHero, 1, 1);
    this.MovableUnits.push(this.Hero);
    this.AllUnits.push(this.Hero);
}

Game.drawGrid = function () {
    var i, path, group = new Group();
    for (i = 0; i < 11; i++) {
        path = new Path();
        path.strokeColor = this.GridColor;
        y = this.View.top + this.Cell.height * i;
        path.moveTo(this.View.left, y);
        path.lineTo(this.View.right, y);
        group.addChild(path);

        path = new Path();
        path.strokeColor = this.GridColor;
        x = this.View.left + this.Cell.width * i;
        path.moveTo(x, this.View.top);
        path.lineTo(x, this.View.bottom);
        group.addChild(path);
    }
    return group;
}

Game.X = function (x) { return Game.Cell.width * (x - 1); }
Game.Y = function (y) { return Game.Cell.height * (y - 1); }

Game.CreateUnit = function (id, t, x, y) {
    if (!this._defs) this._defs = {};
    if (!this._defs[id]) {
        var comp = new CompoundPath({ children: [new Raster(id)] });
        this._defs[id] = new SymbolDefinition(comp);
    }

    var _unit = {
        obj: new SymbolItem(this._defs[id]),
        type: t,
        dest: null,
        dir: DirSouth,
        gx: x,
        gy: y,

        Move: function (x, y) {
            Game.UnitMap[this.type][this.gy][this.gx] = null;
            this.gx += x;
            this.gy += y;
            this.dest.x += Game.X(x + 1);
            this.dest.y += Game.Y(y + 1);
            Game.UnitMap[this.type][this.gy][this.gx] = this;
        },
        nextDifference: function () {
            switch (this.dir) {
                case DirSouth: return { x: 0, y: 1 };
                case DirEast: return { x: 1, y: 0 };
                case DirWest: return { x: -1, y: 0 };
                case DirNorth: return { x: 0, y: -1 };
            }
        },
        Next: function () {
            var diff = this.nextDifference()
            diff.x += this.gx;
            diff.y += this.gy;
            return diff;
        },
        Forward: function () {
            var next = this.nextDifference();
            this.Move(next.x, next.y);
        },
        TurnRight: function () {
            if (this.dir == DirSouth) this.dir = DirWest;
            else if (this.dir == DirWest) this.dir = DirNorth;
            else if (this.dir == DirNorth) this.dir = DirEast;
            else if (this.dir == DirEast) this.dir = DirSouth;
            else console.log("Exceptional direction");
        },
        TurnLeft: function () {
            if (this.dir == DirSouth) this.dir = DirEast;
            else if (this.dir == DirEast) this.dir = DirNorth;
            else if (this.dir == DirNorth) this.dir = DirWest;
            else if (this.dir == DirWest) this.dir = DirSouth;
            else console.log("Exceptional direction");
        },
        TurnBack: function () {
            if (this.dir == DirSouth) this.dir = DirNorth;
            else if (this.dir == DirWest) this.dir = DirEast;
            else if (this.dir == DirNorth) this.dir = DirSouth;
            else if (this.dir == DirEast) this.dir = DirWest;
            else console.log("Exceptional direction");
        }
    };
    _unit.obj.bounds = new Rectangle(new Point(this.X(x), this.Y(y)), new Size(this.Cell.width, this.Cell.height))
    _unit.dest = _unit.obj.position.clone();
    return _unit;
}

Game.Start = function () {
    this._running = true;
    this.Reset();
    onTurn();
}

Game.Stop = function () {
    clearTimeout(this._turnId);
    this._running = false;
}

Game.IsRunning = function () {
    return this._running;
}

Game.SetHeroScript = function (script) {
    this._script = script;
}

function onFrame(event) {
    Game.MovableUnits.forEach(function (unit) {
        var vector = unit.dest - unit.obj.position;
        unit.obj.position += vector / 12;
    });
}

function onTurn() {
    Game.MovableUnits.forEach(function (unit) {
        var next;
        if (unit.type == TypeMonster) {
            next = unit.Next();
            if (next.x < 1 || next.y < 1 || next.x > 10 || next.y > 10) {
                unit.TurnBack();
            }
            else if (Game.UnitMap[TypeMonster][next.y][next.x]) {
                if (Game.RandomCoin()) unit.TurnRight();
                else unit.TurnLeft();
            }
            else if (Game.UnitMap[TypeTrap][next.y][next.x]) {
                if (Game.RandomCoin()) unit.TurnRight();
                else unit.TurnLeft();
            }
            else if (Game.UnitMap[TypeTreasure][next.y][next.x]) {
                if (Game.RandomCoin()) unit.TurnRight();
                else unit.TurnLeft();
            }
            unit.Forward();
        }
    });

    if (Game.IsRunning()) {
        Game._turnId = setTimeout(onTurn, 400);
    }
}

onTurn();

paper.Game = Game;

Game.Initialize();