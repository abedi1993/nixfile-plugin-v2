import {fetchFileManagerData} from "../utils/fetchFileManagerData.js";

export function createTypeFilters(type) {
    jQuery(function ($) {
        const nixfileTypeFilter = $("#nixfile-file-type");
        let selectedTypeFilter = window.selectedTypeFilter;

        nixfileTypeFilter.empty();
        const options = $("<option/>", {
            value: "null", text: 'همه موارد رسانه ای', selected: selectedTypeFilter === "null"
        });
        nixfileTypeFilter.append(options);
        if (type.length > 0) {
            type.forEach((item) => {
                const options = $("<option/>", {
                    value: item.int, text: item.fa, selected: parseInt(selectedTypeFilter) === item.int
                });
                nixfileTypeFilter.append(options);
            });
        }
        nixfileTypeFilter.on("change", async function (e) {
            window.selectedTypeFilter = e.currentTarget.value;
            await fetchFileManagerData({
                folder_id: window.currentFolderId,
                force: true,
                type: window.selectedTypeFilter,
                month: window.selectedDateFilter
            });
        });
    });
}