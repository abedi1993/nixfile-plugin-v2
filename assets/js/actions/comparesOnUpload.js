import {wpRestPost} from "../utils/fetch.js";
import {nixfileAjaxData} from "../utils/ajaxData.js";

export function comparesOnUpload() {
    jQuery(function ($) {
        const btn = $("#compares-on-upload");
        btn
            .on('click', async function () {
                await wpRestPost(`${nixfileAjaxData.rest_url + nixfileAjaxData.action.compress_upload}`)
                location.reload();
            });
    })
}