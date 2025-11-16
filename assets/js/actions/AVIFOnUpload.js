import {wpRestPost} from "../utils/fetch.js";
import {nixfileAjaxData} from "../utils/ajaxData.js";

export function avifOnUpload() {
    jQuery(function ($) {
        const btn = $("#avif-on-upload");
        btn
            .on('click', async function () {
                await wpRestPost(`${nixfileAjaxData.rest_url + nixfileAjaxData.action.avif_on_upload}`)
                location.reload();
            });
    })
}