import {post} from "../utils/fetch.js";
import {link} from "../__apiRoutes.js";
import {getToken} from "../utils/getToken.js";
import {pixelExplode} from "../animate/pixelExplode.js";

export function multiMediaSelect() {
    jQuery(function ($) {
        const nixfileMultiSelectTrigger = $("#nixfile-multi-select");
        const nixfileMediaTolls = $(".nixfile-media-tools");
        const nixfileMediaSearch = $(".nixfile-search-box");
        const nixfileMultiSelectTools = $(".nixfile-multi-select-tools");
        const nixfileMultiDeleteBtn = $("#nixfile-multi-select-delete");
        const nixfileMultiCancelBtn = $("#nixfile-multi-select-cancel");

        let activeMultiSelect = false;
        let multiSelectedId = [];

        nixfileMultiSelectTrigger.on('click', function () {
            activeMultiSelect = true;
            if ($(".nixfile-multi-select-label").length > 0)
                $(".nixfile-multi-select-label").remove();
            if (activeMultiSelect) {
                nixfileMediaTolls.hide();
                nixfileMediaSearch.hide();
                nixfileMultiSelectTools.show();
                const mediaBox = $(".nixfile-media-box");
                mediaBox.css({
                    'opacity': "0.7"
                });
                $(".nixfile-folder").hide();
                mediaBox.get().forEach((item) => {
                    const checkBox = $("<input/>", {
                        type: "checkbox",
                    })
                        .css({
                            'position': 'absolute',
                            "top": 0,
                            "right": 0,
                            "z-index": 9999999
                        })
                        .on('click', function (e) {
                            e.stopPropagation();
                        });
                    const label = $("<label/>", {
                        class: 'nixfile-multi-select-label'
                    })
                        .on('click', function (e) {
                            e.stopPropagation();
                            $(this).toggleClass("active");
                            $(item).toggleClass('active');
                            const itemId = $(item).attr('data-id');
                            if (multiSelectedId && multiSelectedId.length > 0 && multiSelectedId.includes(itemId)) {
                                multiSelectedId = multiSelectedId.filter(id => id !== itemId);
                            } else {
                                multiSelectedId.push(itemId);
                            }
                            console.log(multiSelectedId.length);
                            if (multiSelectedId.length > 0) {
                                nixfileMultiDeleteBtn.removeClass('disabled');
                            } else {
                                nixfileMultiDeleteBtn.addClass('disabled');
                            }
                        })
                        .append(checkBox);
                    $(item).append(label);
                });
            }
        });
        nixfileMultiCancelBtn.on('click', async function () {
            if ($(".nixfile-multi-select-label").length > 0)
                $(".nixfile-multi-select-label").remove();
            await nixfileMultiSelectTools.hide();
            await nixfileMediaTolls.show();
            await nixfileMediaSearch.show();
            $(".nixfile-folder").show();
            const mediaBox = $(".nixfile-media-box");
            mediaBox
                .css({
                    'opacity': "1"
                })
                .removeClass('active');
            activeMultiSelect = false;
            multiSelectedId = [];
        });
        nixfileMultiDeleteBtn.on('click', async function () {
            if (multiSelectedId.length > 0) {
                const formData = new FormData();
                formData.append("_method", "DELETE");
                await multiSelectedId.forEach((item, index) => {
                    post(`${link(2)}/domain/file-manager/${getToken}/media/${item}`, formData);
                    const mediaBox = document.querySelector(`.nixfile-media-box[data-id='${item}']`);
                    console.log(mediaBox);
                    if (mediaBox)
                        pixelExplode(mediaBox);
                });
                nixfileMultiCancelBtn.click();
            }
        });
    });
}