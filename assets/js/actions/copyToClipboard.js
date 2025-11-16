export function copyToClipboard() {
    jQuery(function ($) {
        const nixfileFileCopy = $("#nixfile-copy-file");
        const nixfileFileContextMenu = $(".nixfile-file-contextmenu");
        const nixfileFileEditNameContainer = $(".nixfile-file-edit-name-form-container");

        nixfileFileCopy.on('click', function () {
            const item = JSON.parse(nixfileFileContextMenu.attr('data-item'));
            navigator.clipboard.writeText(item.url).then(() => {
                const box = $(`.nixfile-media-box[data-id=${item.id}]`);
                const copy = $("<div/>", {
                    class: 'copy',
                });
                box.append(copy);
                copy.fadeIn();
                setTimeout(() => {
                    copy.fadeOut();
                }, 1200);
                setTimeout(() => {
                    copy.remove();
                }, 1500);
            });
        });

        nixfileFileEditNameContainer
            .on("click", function (e) {
                $(this).fadeOut()
            })
            .find('form')
            .on('click', function (e) {
                e.stopPropagation();
            })
            .on('submit', async function (e) {
                e.preventDefault();
                const formData = new FormData(e.currentTarget)
                e.currentTarget.reset();
            });
    });
}