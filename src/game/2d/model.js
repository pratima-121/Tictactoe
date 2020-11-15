export const reset2DModel = (model) => {
    // turn        : playerO,
    // boxes       : (new Array(9)).fill(null),
    // active      : true,
    // cutscene    : false,
    // end         : false,
    // winPos      : [],

    // in updateModel()
    // model.cutscene = 'sink'

    // CUTSCENE: model.cutscene = rise
    // RESET MODEL: mode.boxes = reset
    // ACTIVATE: model.cutscene = false

    // GOAL: RESET BOARD

    var newModel = model;
    if (newModel.gameDim === "2d") {
        newModel.turn        = playerO
        newModel.boxes       = (new Array(9)).fill(null)
        newModel.active      = true
        newModel.cutscene    = false
        newModel.end         = false
        newModel.winPos      = []
    }
    return newModel;
}
