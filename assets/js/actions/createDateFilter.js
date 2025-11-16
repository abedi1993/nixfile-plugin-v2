import {fetchFileManagerData} from "../utils/fetchFileManagerData.js";

export function createDateFilters(date) {
    jQuery(function ($) {
        const nixfileDateFilter = $("#nixfile-file-date");
        let selectedDateFilter = window.selectedDateFilter;

        nixfileDateFilter.empty();
        const options = $("<option/>", {
            value: "null",
            text: 'همه تاریخ ها',
            selected: selectedDateFilter === "null"
        });
        nixfileDateFilter.append(options);
        if (date.length > 0) {
            date.forEach((item) => {
                const options = $("<option/>", {
                    value: item.value,
                    text: item.key,
                    selected: selectedDateFilter === item.value
                });
                nixfileDateFilter.append(options)
            });
        }
        nixfileDateFilter.on("change", async function (e) {
            window.selectedDateFilter = e.currentTarget.value;
            await fetchFileManagerData({
                folder_id: window.currentFolderId,
                force: true,
                type: window.selectedTypeFilter,
                month: window.selectedDateFilter
            });
        })
    });
}