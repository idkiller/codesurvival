
Blockly.defineBlocksWithJsonArray([
    {
        "type": "move_forward",
        "message0": "Forward",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 330,
        "tooltip": "move hero to forward"
    },
    {
        "type": "turn_right",
        "message0": "Turn Right",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 330,
        "tooltip": "turn right to hero"
    },

    {
        "type": "turn_left",
        "message0": "Turn Left",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 330,
        "tooltip": "turn left to hero"
    },

    {
        "type": "detect",
        "message0": "Detect",
        "colour": 120,
        "output": "String",
        "tooltip": "detect what is front of hero"
    },
    {
        "type": "blocker_wall",
        "message0": "Wall",
        "colour": 120,
        "output": "String",
        "tooltip": "Wall"
    },
    {
        "type": "blocker_monster",
        "message0": "Monster",
        "colour": 120,
        "output": "String",
        "tooltip": "Monster"
    },
    {
        "type": "blocker_trap",
        "message0": "Trap",
        "colour": 120,
        "output": "String",
        "tooltip": "Trap"
    },
    {
        "type": "blocker_treasure",
        "message0": "Treasure",
        "colour": 120,
        "output": "String",
        "tooltip": "Treasure"
    }
]);


Blockly.JavaScript['move_forward'] = function (block) {
    return 'Game.HeroForward();\n';
};

Blockly.JavaScript['turn_right'] = function (block) {
    return 'Game.Hero.TurnRight();\n';
};

Blockly.JavaScript['turn_left'] = function (block) {
    return 'Game.Hero.TurnLeft();\n';
}

Blockly.JavaScript['detect'] = function (block) {
    return ['Game.Hero.See()', Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['blocker_wall'] = function (block) {
    return ["\'wall\'", Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['blocker_monster'] = function (block) {
    return ["\'monster\'", Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['blocker_trap'] = function (block) {
    return ["\'trap\'", Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['blocker_treasure'] = function (block) {
    return ["\'treasure\'", Blockly.JavaScript.ORDER_NONE];
}

var GameWorkspace = null;

var unique_step_number = false;

var step_number_block = {
    "message0": "Set  %1 Step in a turn",
    "args0": [
        {
            "type": "input_value",
            "name": "count",
            "check": "Number"
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 330
};

Blockly.Blocks['step_number'] = {
    init: function () {
        this.jsonInit(step_number_block);
        var self = this;
        this.setTooltip(function () {
            return "Set " + self.getFieldValue('count') + " in a thrun"
        });
    }
};

Blockly.JavaScript['step_number'] = function (block) {
    var value_count = Blockly.JavaScript.valueToCode(block, 'count', Blockly.JavaScript.ORDER_ATOMIC);

    if (value_count == "" || value_count == null) {
        block.setWarningText("step can not be empty.");
        return "// step can not be empty\n";
    }

    var code = 'StepInATurn = ' + value_count + ';\n';

    var blocks = GameWorkspace.getAllBlocks();
    var b = null, i = 0;
    for (; i < blocks.length; i++) {
        b = blocks[i];
        if (b.type == "step_number") {
            block.setWarningText("Count is set twice.");
        }
    }

    return code;
};