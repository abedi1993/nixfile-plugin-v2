import {initMoveDialog} from "../utils/moveCommon.js";

export function moveMedia() {
    initMoveDialog({
        contextSelector: ".nixfile-file-contextmenu",
        moveTriggerSelector: "#nixfile-move-file",
        moveUrlSuffix: "move-file/",
    });
}