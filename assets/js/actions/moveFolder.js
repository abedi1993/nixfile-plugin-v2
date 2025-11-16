import {initMoveDialog} from "../utils/moveCommon.js";

export function moveFolder() {
    initMoveDialog({
        contextSelector: ".nixfile-folder-contextmenu",
        moveTriggerSelector: "#nixfile-move-folder",
        moveUrlSuffix: "move-folder/",
    });
}
