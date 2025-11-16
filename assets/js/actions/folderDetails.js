export function folderDetails() {
    jQuery(function ($) {
        const folderDetailTrigger = $("#nixfile-detail-folder");
        const folderContextMenu = $(".nixfile-folder-contextmenu");
        const mediaSection = $(".nixfile-media-section");
        const mediaSectionContainer = $(".nixfile-media-section-container");

        folderDetailTrigger.on('click', function () {
            $(".nixfile-detail-bar").remove();

            const itemData = folderContextMenu.attr('data-item');
            if (!itemData) {
                console.error('Folder context menu data-item attribute missing');
                return;
            }
            const item = JSON.parse(itemData);
            const folderElement = $(`.nixfile-folder[data-id="${item.id}"]`);
            const folderIcon = folderElement.find('.nixfile-folder-icon');
            console.log(folderIcon);
            const bgImage = folderIcon.css('background-image');
            if (!bgImage || bgImage === 'none') {
                console.error('Background image not found');
                return;
            }
            const imageUrlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
            if (!imageUrlMatch || !imageUrlMatch[1]) {
                console.error('Unable to parse background image URL');
                return;
            }
            const imageUrl = imageUrlMatch[1];
            const detailBar = $("<div/>", { class: 'nixfile-detail-bar' }).hide();
            const media = $("<img/>", { src: imageUrl, alt: item.title });
            const hr = $("<hr/>");
            const name = $("<p/>", { text: item.title });
            const size = $("<p/>", { text: `${parseFloat(item.files_size).toFixed(2)} مگابایت` });
            const fileCount = $("<p/>", { text: `تعداد فایل‌ها: ${item.files_count}` });
            const folderCount = $("<p/>", { text: `تعداد پوشه‌ها: ${item.folders_count}` });
            const copyRight = $("<p/>").html('آپلود شده در <a href="https://nixfile.com">نیکس فایل</a>');
            detailBar
                .append(media, hr, name, size, fileCount, folderCount, copyRight);
            mediaSection.css("grid-template-columns", 'repeat(8, 1fr)');
            mediaSectionContainer.append(detailBar);
            detailBar.slideDown();
        });
    });
}