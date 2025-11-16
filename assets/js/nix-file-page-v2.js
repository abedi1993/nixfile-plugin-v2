import {fetchFileManagerData} from "./utils/fetchFileManagerData.js";
import {postFolder} from "./actions/postFolder.js";
import {uploaderInput} from "./ui/uploaderInput.js";
import {setting} from "./ui/setting.js";
import {statistics} from "./utils/statistics.js";

jQuery(async function ($) {
    const elements = {
        loader: $("#nixfile-loader"),
        uploaderSection: $(".nixfile-uploader"),
        settingSection: $(".nixfile-setting"),
        folderFormContainer: $(".nixfile-folder-form-container"),
        folderContextMenu: $(".nixfile-folder-contextmenu"),
        deleteFolderContainer: $("#nixfile-delete-folder-form-container"),
        moveFolderContainer: $("#nixfile-folder-move-container"),
        detailBar: $(".nixfile-detail-bar"),
        fileContextMenu: $(".nixfile-file-contextmenu"),
        fileEditNameContainer: $(".nixfile-file-edit-name-form-container"),
        deleteFileContainer: $("#nixfile-delete-file-form-container"),
        createNewFolderForm: $(".nixfile-create-new-folder-form"),
        replaceFormContainer: $("#nixfile-replace-file-form-container"),
        multiSelectTools: $(".nixfile-multi-select-tools")
    };

    Object.values(elements).forEach($el => $el.hide());
    elements.loader.fadeOut(400);

    window.nixfileMediaPage = 1;
    window.nixfileMediaLoading = false;
    window.nixfileMediaReachedEnd = false;
    window.nixfileMediaRequest = null;
    window.selectedTypeFilter = null;
    window.selectedDateFilter = null;
    window.$ = jQuery
    setting();
    await fetchFileManagerData({force: true});
    postFolder();
    uploaderInput();
    statistics();
});