import {link} from "../__apiRoutes.js";
import {xhr} from "../utils/fetch.js";
import {getToken} from "../utils/getToken.js";
import {nixfileAjaxData} from "../utils/ajaxData.js";

export function uploadFile(payload) {
    const box = jQuery("<div/>",
        {class: "nixfile-media-box uploading"})
        .append(
            jQuery("<div/>", {class: "nixfile-media-progress"})
        );
    jQuery(".nixfile-media-section").prepend(box);
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("folder_id", window.currentFolderId);
    if (nixfileAjaxData.current_settings.avif_on_upload && nixfileAjaxData.current_settings.compress_upload) {
        formData.append("collection", "6");
    } else if (nixfileAjaxData.current_settings.compress_upload) {
        formData.append("collection", "3");
    } else if (nixfileAjaxData.current_settings.avif_on_upload) {
        formData.append("collection", "5");
    }
    console.log(nixfileAjaxData.current_settings);
    return xhr(`${link(2)}/domain/file-manager/${getToken}/media`, formData, box);
}