import {post} from "../utils/fetch.js";
import {link} from "../__apiRoutes.js";
import {getToken} from "../utils/getToken.js";

export function replaceMedia() {
    jQuery(function ($) {
        const nixfileReplaceFileTrigger = $("#nixfile-replace-file");
        const nixfileReplaceFormContainer = $("#nixfile-replace-file-form-container");
        const nixfileReplaceForm = $("#nixfile-replace-file-form");
        const nixfileFileContextMenu = $(".nixfile-file-contextmenu");

        nixfileReplaceFileTrigger.on('click', function () {
            nixfileReplaceFormContainer.fadeIn();
        });
        nixfileReplaceFormContainer.on('click', function () {
            $(this).fadeOut();
        });
        nixfileReplaceForm
            .on('click', function (e) {
                e.stopPropagation();
            })
            .find('input[type=file]')
            .on('change', async function (e) {
                const item = JSON.parse(nixfileFileContextMenu.attr('data-item'));
                const [file] = e.target.files;
                const formData = new FormData();
                formData.append("_method", 'PUT');
                formData.append("file", file);
                const box = $(`.nixfile-media-box[data-id='${item.id}']`);
                nixfileReplaceFormContainer.fadeOut();
                const response = await post(`${link(2)}/domain/file-manager/${getToken}/replace/${item.id}`, formData);
                box.css("background-image", `url(${response.url})`);
                location.reload();
                console.log(response);
            });
    })
}