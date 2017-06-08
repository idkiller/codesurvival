
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
        "message0": "In front of me",
        "colour": 72,
        "output": "String",
        "tooltip": "detect what is front of hero"
    },
    {
        "type": "blocker_wall",
        "message0": "Wall",
        "colour": 230,
        "output": "String",
        "tooltip": "Wall"
    },
    {
        "type": "blocker_monster",
        "message0": "Monster",
        "colour": 230,
        "output": "String",
        "tooltip": "Monster"
    },
    {
        "type": "blocker_trap",
        "message0": "Trap",
        "colour": 230,
        "output": "String",
        "tooltip": "Trap"
    },
    {
        "type": "blocker_treasure",
        "message0": "Treasure",
        "colour": 230,
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

Blockly.Blocks['limit_loop'] = {
    init: function () {
        var self = this;
        this.appendValueInput("cond")
            .setCheck("Boolean")
            .appendField("repeat")
            .appendField(new Blockly.FieldDropdown([["while", "0"], ["until", "1"]]), "mode")
            .appendField("until maximum 100 times");
        this.appendStatementInput("do")
            .setCheck(null)
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('While a value is %1, then do some statements. but under 100 times.'.replace('%1', self.getFieldValue('mode') == 0 ? 'true' : 'false'));
    }
};

var __limit_loop_count = 0;

Blockly.JavaScript['limit_loop'] = function (block) {
    var dropdown_mode = block.getFieldValue('mode');
    var value_cond = Blockly.JavaScript.valueToCode(block, 'cond', Blockly.JavaScript.ORDER_ATOMIC);
    var statements_do = Blockly.JavaScript.statementToCode(block, 'do');
    // TODO: Assemble JavaScript into code variable.

    var condition_cnt_name = 'll_cond_cnt' + __limit_loop_count;
    var code = 'var ' + condition_cnt_name + ' = 0;\n';

    code += 'while (' + condition_cnt_name + '++ < 100';
    if (value_cond) {
        code += ' && ';
        if (dropdown_mode == 1) code += '!';
        code += value_cond;
    }
    code += ') {\n';
    code += statements_do;
    code += '}\n';

    __limit_loop_count++;
    return code;
};

Blockly.Blocks['limit_count_loop'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("repeat")
            .appendField(new Blockly.FieldNumber(0, 0, 100), "count")
            .appendField("until maximum 100 times");
        this.appendStatementInput("do")
            .setCheck(null)
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('Do some statements several times under maximum 100 times.');
    }
};

var __limit_count_loop_count = 0;

Blockly.JavaScript['limit_count_loop'] = function (block) {
    var number_count = block.getFieldValue('count');
    var statements_do = Blockly.JavaScript.statementToCode(block, 'do');
    // TODO: Assemble JavaScript into code variable.
    var counter_name = 'lcl_counter' + __limit_count_loop_count;
    var code = 'var ' + counter_name + ' = 0;\n';
    code += 'while (';
    code += counter_name + '++ < (' + number_count + '%101)) {\n';
    code += statements_do;
    code += '}\n';

    __limit_count_loop_count++;
    return code;
};

Blockly.Blocks['set_to_global'] = {
    init: function () {
        this.appendValueInput("variable")
            .setCheck(null)
            .appendField("set");
        this.appendDummyInput()
            .appendField("to global")
            .appendField(new Blockly.FieldTextInput("variable"), "var_name");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('set value to global.' + this.getFieldValue('var_name'));
    }
};

var Code_variables = {};

Blockly.JavaScript['set_to_global'] = function (block) {
    var value_variable = Blockly.JavaScript.valueToCode(block, 'variable', Blockly.JavaScript.ORDER_ATOMIC);
    var text_var_name = block.getFieldValue('var_name');
    // TODO: Assemble JavaScript into code variable.
    var code = 'Code_variables["' + text_var_name + '"] = ' + value_variable + ';\n';
    return code;
};

Blockly.Blocks['get_from_global'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("get from global")
            .appendField(new Blockly.FieldTextInput("variable"), "var_name");
        this.setOutput(true, null);
        this.setColour(160);
        this.setTooltip('set value to global.' + this.getFieldValue('var_name'));
    }
};

Blockly.JavaScript['get_from_global'] = function (block) {
    var value_variable = Blockly.JavaScript.valueToCode(block, 'variable', Blockly.JavaScript.ORDER_ATOMIC);
    var text_var_name = block.getFieldValue('var_name');
    // TODO: Assemble JavaScript into code variable.
    var code = '(Code_variables["' + text_var_name + '"])';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['fixed_random_number'] = {
  init: function() {
    this.appendValueInput("min")
        .setCheck("Number")
        .appendField("random number (");
    this.appendDummyInput();
    this.appendValueInput("max")
        .setCheck("Number")
        .appendField("<= n <=");
    this.appendDummyInput()
        .appendField(")");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('Return a random integer between the two specified limits, inclusive.');
  }
};

Blockly.JavaScript['fixed_random_number'] = function(block) {
  var value_min = Blockly.JavaScript.valueToCode(block, 'min', Blockly.JavaScript.ORDER_ATOMIC);
  var value_max = Blockly.JavaScript.valueToCode(block, 'max', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'Game.Random2('+value_min+', '+value_max+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};