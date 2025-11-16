import {fetchFileManagerData} from "../utils/fetchFileManagerData.js";

export function searchInput() {
    jQuery(function ($) {
        const input = $("#nixfile-search-input");
        let searchTimeout;

        input.on("input", async (e) => {
            if (searchTimeout)
                clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                await fetchFileManagerData({
                    folder_id: window.currentFolderId,
                    force: true,
                    type: window.selectedTypeFilter,
                    month: window.selectedDateFilter,
                    search: e.currentTarget.value
                });
            }, 200)
        });
    });
}