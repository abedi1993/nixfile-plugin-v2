import {post, get} from "./fetch.js";
import {link} from "../__apiRoutes.js";
import {fetchFileManagerData} from "./fetchFileManagerData.js";
import {nixfileAjaxData} from "./ajaxData.js";
import {getToken} from "./getToken.js";

/**
 * Initializes move UI for folder or file
 */
export function initMoveDialog({
                                   contextSelector,
                                   moveTriggerSelector,
                                   moveUrlSuffix,
                               }) {
    jQuery(function ($) {
        const container = $("#nixfile-folder-move-container");
        const moveBtn = $("#nixfile-submit-move-folder");
        const triggerBtn = $(moveTriggerSelector);
        const createNewFolderToggleBtn = $(".nixfile-create-new-folder");
        const createNewFolderForm = $(".nixfile-create-new-folder-form");
        const divider = container.find(".nixfile-divider");

        let selected = null;
        let currentItem = null; // used instead of relying on DOM after re-render

        triggerBtn.on("click", async () => {
            const selectedContext = $(contextSelector);
            try {
                currentItem = JSON.parse(selectedContext.attr("data-item"));
            } catch (e) {
                console.warn("Invalid or missing data-item", selectedContext.attr("data-item"));
                return;
            }
            container.fadeIn();
            await loadFolderList();
        });

        container.on("click", () => {
            container.fadeOut();
            selected = null;
        });

        container.find(".nixfile-folder-move-content").on("click", (e) => e.stopPropagation());

        $(".nixfile-cancel-button").on("click", () => {
            container.fadeOut();
            selected = null;
        });

        moveBtn.on("click", async () => {
            if (!currentItem || !selected) return;

            const formData = new FormData();
            if (moveUrlSuffix === "move-file/") {
                formData.append("file_id", currentItem.id);
                formData.append("folder_id", selected);
            } else {
                formData.append("folder_id", currentItem.id);
                formData.append("parent_id", selected);
            }
            formData.append("_method", "PUT");

            await post(`${link(2)}/domain/file-manager/${getToken}/${moveUrlSuffix}`, formData);
            await fetchFileManagerData({folder_id: window.currentFolderId, force: true, page: 1});
            container.fadeOut();
            selected = null;
        });

        let open = false;
        createNewFolderToggleBtn.on("click", function (e) {
            e.stopPropagation();
            if (open) {
                createNewFolderForm.stop().slideUp();
            } else {
                createNewFolderForm.stop().slideDown();
            }
            open = !open;
        });

        createNewFolderForm.find("button[type=submit]").off("click").on("click", async (e) => {
            e.preventDefault();
            const title = createNewFolderForm.find("input[type=text]").val().trim();
            if (!title) return;

            const formData = new FormData();
            formData.append("title", title);
            formData.append("parent_id", window.currentFolderId);

            await post(`${link(2)}/domain/file-manager/${getToken}/folder`, formData);
            await fetchFileManagerData({folder_id: window.currentFolderId, force: true, page: 1});
            await loadFolderList();
            createNewFolderForm.trigger("reset");
        });

        async function loadFolderList() {
            divider.empty();
            const response = await get(`${link(2)}/domain/file-manager/${getToken}/move-list`);
            const folderList = response.data;

            divider.append(
                createFolder({
                    title: folderList.title,
                    id: folderList.id,
                    children: [],
                })
            );
            folderList.children?.forEach((folder) => divider.append(createFolder(folder)));
        }

        function createFolder(folder) {
            const selectedId = currentItem?.id;

            const folderContainer = $("<div/>", {
                class: folder.children?.length
                    ? "nixfile-folder-item-dropdown-container"
                    : "nixfile-move-folder-container",
                "data-id": folder.id,
            }).on("click", function (e) {
                e.stopPropagation();
                selected = selected === folder.id ? null : folder.id;
                divider.find(".selected").not(this).removeClass("selected");
                $(this).toggleClass("selected");
            });

            const item = $("<div/>", {class: "nixfile-folder-item"});
            const icon = $("<span/>", {class: "nixfile-folder-move-icon"}).css(
                "background-image",
                `url(${nixfileAjaxData.images_url}/folder.png)`
            );

            item.append(icon).append($("<p/>", {text: folder.title}));
            folderContainer.append(item);

            if (folder.children?.length) {
                const dropDownTrigger = $("<button/>", {
                    html:
                        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nixfile-size-4"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>',
                }).on("click", (e) => {
                    e.stopPropagation();
                    divider.find(`div[parent-id=${folder.id}]`).stop().slideToggle();
                    dropDownTrigger.toggleClass("active");
                });

                item.append(dropDownTrigger);

                folder.children.forEach((subFolder) => {
                    if (subFolder.id !== selectedId) {
                        folderContainer
                            .append(createFolder(subFolder).attr("parent-id", folder.id).hide());
                    }
                });
            }

            return folderContainer;
        }
    });
}
