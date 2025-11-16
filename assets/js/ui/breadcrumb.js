import {createFolder} from "./createFolder.js";
import {fetchFileManagerData} from "../utils/fetchFileManagerData.js";

export function breadcrumb(currentFolder) {
    jQuery(async function ($) {
        if (!currentFolder.main) {
            await createFolder([currentFolder])
        }
        const breadcrumbContainer = $("#breadcrumb");
        if (!breadcrumbContainer.length || !currentFolder?.path) return;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#888888" d="m6.05 19l5-7l-5-7H8.5l5 7l-5 7zM12 19l5-7l-5-7h2.45l5 7l-5 7z"/></svg>`;
        breadcrumbContainer.empty();
        Object
            .entries(currentFolder.path)
            .forEach(([key, label]) => {
                const $item = $("<p>", {
                    class: "nixfile-breadcrumb-items",
                    html: `${svg} ${label}`,
                })
                    .attr("data-id", key)
                    .on('click', async function () {
                        window.currentFolderId = $(this).attr('data-id');
                        await fetchFileManagerData(
                            {
                                folder_id: key,
                                force: true,
                                page: 1
                            });
                    });
                breadcrumbContainer.append($item);
            });
    });
}