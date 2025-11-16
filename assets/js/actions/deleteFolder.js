import {post} from "../utils/fetch.js";
import {link} from "../__apiRoutes.js";
import {getToken} from "../utils/getToken.js";
import {pixelExplode} from "../animate/pixelExplode.js";

export function deleteFolder() {
    jQuery(function ($) {
        const nixfileDeleteFolderContainer = $("#nixfile-delete-folder-form-container");
        const nixfileFolderDelete = $("#nixfile-delete-folder");
        const nixfileFolderContextMenu = $(".nixfile-folder-contextmenu");

        nixfileDeleteFolderContainer
            .off("click")
            .on('click', function (e) {
                $(this).fadeOut();
            });
        nixfileFolderDelete
            .off("click")
            .on('click', function (e) {
                nixfileDeleteFolderContainer.fadeIn();
            });
        nixfileDeleteFolderContainer
            .find('form')
            .off("submit click")
            .on("submit", async function (e) {
                e.preventDefault();
                console.log(nixfileFolderContextMenu);
                const folderId = JSON.parse(nixfileFolderContextMenu.attr('data-item')).id;
                const formData = new FormData();
                formData.append('_method', "DELETE");
                await post(`${link(2)}/domain/file-manager/${getToken}/folder/${folderId}`, formData)
                const folder = document.querySelector(`.nixfile-folder[data-id='${folderId}']`);
                if (folder) {
                    await pixelExplode(folder);
                }
                nixfileDeleteFolderContainer.fadeOut();
            })
            .on('click', function (e) {
                e.stopPropagation();
            });
    });
}