
Blockly.defineBlocksWithJsonArray([
    {
        "type": "move_forward",
        "message0": "Forward",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 225,
        "tooltip": "move hero to forward"
    },
    {
        "type": "turn_right",
        "message0": "Turn Right",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 225,
        "tooltip": "turn right to hero"
    },

    {
        "type": "turn_left",
        "message0": "Turn Left",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 225,
        "tooltip": "turn left to hero"
    },
]);


Blockly.JavaScript['move_forward'] = function(block) {
  return 'game_hero_forward();\n';
};