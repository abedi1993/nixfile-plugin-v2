import {nixfileAjaxData} from "../utils/ajaxData.js";
import {setupInfiniteScrollObserver} from "../utils/setupInfiniteScrollObserver.js";
import {copyToClipboard} from "../actions/copyToClipboard.js";
import {editMediaTitle} from "../actions/editMediaTitle.js";
import {deleteMedia} from "../actions/deleteMedia.js";
import {mediaDetail} from "../actions/mediaDetail.js";
import {replaceMedia} from "../actions/replaceMedia.js";
import {moveMedia} from "../actions/moveMedia.js";

export function createMedia(media) {
    if (!media.data.length) return;
    jQuery(async function ($) {
        const nixfileFileContextMenu = $(".nixfile-file-contextmenu");
        const nixfileFolderContextMenu = $(".nixfile-folder-contextmenu");

        const fileManagerSection = $(".nixfile-media-section");
        const nixfileMediaSectionContainer = $(".nixfile-media-section-container");
        media.data.forEach((item, index) => {
            const box = $("<div/>", {
                class: "nixfile-media-box",
                style: `background-image:url(${item.url})`
            })
                .attr({
                    'data-item': JSON.stringify(item),
                    "data-id": item.id
                })
                .on('click', function () {
                    const existedNixfileDetailBar = $(".nixfile-detail-bar");
                    if (existedNixfileDetailBar.length > 0) existedNixfileDetailBar.remove();
                    const clickedItem = JSON.parse($(this).attr('data-item'));
                    const nixfileDetailBar = $("<div/>", {
                        class: "nixfile-detail-bar"
                    });
                    let media;
                    switch (parseInt(clickedItem.type.int)) {
                        case 0:
                            media = $("<img/>", {
                                src: item.url
                            });
                            break;
                        case 1:
                            media = $("<video/>", {
                                src: item.url,
                                controls: true
                            });
                            break;
                        case 2:
                            media = $("<audio/>", {
                                src: item.url,
                                controls: true
                            });
                            break;
                        default:
                            const $folderBox = $(`.nixfile-media-box[data-id=${clickedItem.id}]`).find('.nixfile-folder-icon');
                            if ($folderBox.length) {
                                const bgImage = $folderBox.css('background-image') || '';
                                const url = bgImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
                                media = $("<img/>", {
                                    src: url
                                });
                            } else {
                                console.warn("Folder icon not found for data-id:", clickedItem.id);
                            }
                            break;
                    }
                    const hr = $("<hr/>");
                    const name = $("<p/>", {
                        text: clickedItem.title,
                    });
                    const date = $("<p/>", {
                        text: item.created_at.sh_date
                    });
                    const size = $("<p/>", {
                        text: item.size + ' مگابایت. ',
                    });
                    const resolution = $("<p/>", {
                        text: `${item.width} * ${item.height} پیکسل `
                    });
                    const copyRight = $("<p/>", {
                        html: `<p>آپلود شده در <a target="_blank" href="https://nixfile.com">نیکس فایل</a></p>`
                    });
                    const nixfileDetailAction = $("<div/>", {
                        class: "nixfile-detail-actions",
                    });
                    const input = $("<input/>", {
                        value: clickedItem.url,
                        readonly: true
                    });
                    const button = $("<button/>", {
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="#ffffff" d="M15 20H5V7c0-.55-.45-1-1-1s-1 .45-1 1v13c0 1.1.9 2 2 2h10c.55 0 1-.45 1-1s-.45-1-1-1m5-4V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2m-2 0H9V4h9z"/></svg>`
                    }).on("click", function (e) {
                        const btn = $(this);
                        navigator.clipboard.writeText(input.val()).then(() => {
                            btn.css('background-color', 'rgb(0,170,44)');
                            setTimeout(() => {
                                btn.css("background-color", '#666')
                                btn.css('color', '#fff');
                            }, 500)
                        }).catch(err => {
                            console.error('Clipboard copy failed:', err);
                        });
                    });
                    fileManagerSection.css("grid-template-columns", 'repeat(8, 1fr)')
                    nixfileMediaSectionContainer.append(nixfileDetailBar)
                    nixfileDetailAction.append(button).append(input);
                    nixfileDetailBar
                        .append(media)
                        .append(hr)
                        .append(name)
                        .append(date)
                        .append(size)
                        .append(resolution)
                        .append(copyRight)
                        .append(nixfileDetailAction)
                    nixfileDetailBar.hide();
                    nixfileDetailBar.slideDown();
                })
                .on('contextmenu', function (e) {
                    e.preventDefault();
                    moveMedia();
                    nixfileFileContextMenu.stop().slideDown(100);
                    if (nixfileFolderContextMenu) nixfileFolderContextMenu.stop().slideUp(100);
                    nixfileFileContextMenu.css({
                        'position': 'absolute',
                        'top': e.pageY + 'px',
                        'left': e.pageX + 'px'
                    });
                    nixfileFileContextMenu.attr({
                        'data-item': $(this).attr('data-item'),
                    })
                });
            if (parseInt(item.type.int) !== 0) {
                const title = $("<p/>", {
                    text: item.title
                });
                const icon = $("<div/>", {
                    class: "nixfile-folder-icon"
                });
                switch (parseInt(item.type.int)) {
                    case 1:
                        icon.css('background-image', `url(${nixfileAjaxData.images_url}/formats/mp4.svg)`)
                        break;
                    case 2 :
                        icon.css('background-image', `url(${nixfileAjaxData.images_url}/formats/mp3.svg)`)
                        break;
                    case 3 :
                        icon.css('background-image', `url(${nixfileAjaxData.images_url}/formats/zip.svg)`)
                        break;
                }
                box
                    .append(icon)
                    .append(title);
            }
            fileManagerSection.append(box);
            if (index === media.data.length - 1) {
                setupInfiniteScrollObserver(box);
            }
        });
        $(document).on('click', function (e) {
            nixfileFolderContextMenu.stop().slideUp(100);
            nixfileFileContextMenu.stop().slideUp(100);
        });
        copyToClipboard();
        editMediaTitle();
        deleteMedia();
        mediaDetail();
        replaceMedia();
    });
}