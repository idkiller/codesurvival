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
    RandomSeed: 1,

    UnitMap: {
        TypeMonster: [],
        TypeTrap: [],
        TypeTreasure: []
    },
    Hero: null,

    MovableUnits: [],

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

    this.resetRandom();

    this._map = [];
    for (i = 0; i < this.Rows + 1; i++) this._map.push(new Array(this.Cols + 1).fill(0));

    this.MovableUnits = [];

    this.batchUnit('img_trap', TypeTrap);
    this.batchUnit('img_treasure', TypeTreasure);
    var monsters = this.batchUnit('img_monster', TypeMonster);
    this.MovableUnits.concat(monsters);
    this._map = null;
    
    this.Hero = this.CreateUnit('img_hero', TypeHero, 1, 1);
    this.MovableUnits.push(this.Hero);
}
Game.batchUnit = function (img_id, type) {
    var i, unit, ux, uy, units = [];
    this.UnitMap[type] = [];
    for (i=0; i<this.Rows + 1; i++) this.UnitMap[type].push(new Array(this.Cols+1).fill(null));
    this.Quantity[type] = this.Random2(3, 6);
    for (i=0; i< this.Quantity[type]; i++) {
        do {
            ux = this.Random2(2, 10);
            uy = this.Random2(2, 10);
        }
        while(this._map[uy][ux] != 0);
        this._map[uy][ux] = 1;
        unit = this.CreateUnit(img_id, type, ux, uy);
        this.UnitMap[type][uy][ux] = unit;
        units.push(unit);
    }
    return units;
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

Game.X = function (x) { return this.Cell.width * (x - 1); }
Game.Y = function (y) { return this.Cell.height * (y - 1); }

Game.CreateUnit = function (id, t, x, y) {
    if (!this._defs) this._defs = {};
    if (!this._defs[id]) {
        var comp = new CompoundPath({children: [new Raster(id)]});
        this._defs[id] = new SymbolDefinition(comp);
    }

    var _unit = {
        obj: new SymbolItem(this._defs[id]),
        type: t,
        dest: null,
        dir: DirSouth,

        Move: function (dx, dy) {
            this.dest.x = this.obj.position.x + Game.X(dx);
            this.dest.y = this.obj.position.y + Game.Y(dy);
        },
        Forward: function () {
            switch(this.dir) {
                case DirSouth: this.Move(0, 1); break;
                case DirEast: this.Move(1, 0); break;
                case DirWest: this.Move(-1, 0); break;
                case DirNorth: this.Move(0, -1); break;
            }
        }
    };
    _unit.obj.bounds = new Rectangle(new Point(this.X(x), this.Y(y)), new Size(this.Cell.width, this.Cell.height))
    _unit.dest = _unit.obj.position.clone();
    return _unit;
}

function onFrame(event) {
    Game.MovableUnits.forEach(function (unit){
        var vector = unit.dest - unit.obj.position;
        unit.obj.position += vector / 15;
    });
}

paper.Game = Game;

Game.Initialize();