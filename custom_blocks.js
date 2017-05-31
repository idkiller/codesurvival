
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
    },
]);


Blockly.JavaScript['move_forward'] = function (block) {
    return 'Hero.forward();\n';
};

Blockly.JavaScript['turn_right'] = function (block) {
    return 'Hero.turn_right();\n';
};

Blockly.JavaScript['turn_left'] = function (block) {
    return 'Hero.turn_left();\n';
}

Blockly.JavaScript['detect'] = function (block) {
    return ['Hero.detect()', Blockly.JavaScript.ORDER_NONE];
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