import {wpRestPost} from "../utils/fetch.js";
import {nixfileAjaxData} from "../utils/ajaxData.js";

export function showOnNavbar() {
    $("#nixfile-show-on-navbar").on("click", async function () {
        await wpRestPost(`${nixfileAjaxData.rest_url + nixfileAjaxData.action.show_status_navbar}`);
        location.reload();
    });
}