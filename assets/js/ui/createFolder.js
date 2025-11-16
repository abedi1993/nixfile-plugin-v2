import {fetchFileManagerData} from "../utils/fetchFileManagerData.js";
import {nixfileAjaxData} from "../utils/ajaxData.js";
import {editFolderTitle} from "../actions/editFolderTitle.js";
import {deleteFolder} from "../actions/deleteFolder.js";
import {moveFolder} from "../actions/moveFolder.js";
import {folderDetails} from "../actions/folderDetails.js";
import {multiMediaSelect} from "../actions/multiMediaSelect.js";

export function createFolder(folders) {
    jQuery(async function ($) {
        if (!folders.length) return;
        const fileManagerSection = $(".nixfile-media-section");
        const nixfileFolderContextMenu = $(".nixfile-folder-contextmenu");
        const nixfileFileContextMenu = $(".nixfile-file-contextmenu");
        folders.forEach(function (item) {
            const box = $("<div/>", {
                class: "nixfile-folder"
            })
                .attr({
                    'data-id': item.id,
                    'data-item': JSON.stringify(item),
                    'data-open': false,
                })
                .on('click', async function () {
                    const clickedItem = JSON.parse($(this).attr('data-item'));
                    if (window.currentFolderId === clickedItem.id) {
                        window.currentFolderId = clickedItem.parent_id;
                    } else {
                        window.currentFolderId = clickedItem.id;
                    }
                    await fetchFileManagerData({
                        folder_id: window.currentFolderId,
                        force: true
                    });
                })
                .on('contextmenu', function (e) {
                    e.preventDefault();
                    moveFolder();
                    nixfileFolderContextMenu.stop().slideDown(100);
                    nixfileFileContextMenu.stop().slideUp(100);
                    nixfileFolderContextMenu.css({
                        'position': 'absolute',
                        'top': e.pageY + 'px',
                        'left': e.pageX + 'px'
                    });
                    nixfileFolderContextMenu.attr({
                        'data-id': $(this).attr('data-id'),
                        'data-item': JSON.stringify(item)
                    })
                });
            const icon = $("<div/>", {
                class: 'nixfile-folder-icon'
            })
                .css("background-image", `url(${nixfileAjaxData.images_url}/folder.png)`);
            const title = $("<p/>", {
                class: 'nixfile-folder-title',
                text: item.title
            });
            if (item.id === window.currentFolderId) {
                icon.css("background-image", `url(${nixfileAjaxData.images_url}/back.png)`);
                box.attr('data-open', true);
                box.css('order', '-1')
            }
            box.append(icon).append(title);
            fileManagerSection.prepend(box);
        });
        $(document).on('click', function (e) {
            nixfileFolderContextMenu.stop().slideUp(100);
            nixfileFileContextMenu.stop().slideUp(100);
        });
    });
    editFolderTitle();
    deleteFolder();
    folderDetails();
    multiMediaSelect();
}