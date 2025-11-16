export function editFolderTitle() {
    jQuery(function ($) {
        const nixfileFolderEdit = $("#nixfile-edit-folder");
        const contextMenu = $(".nixfile-folder-contextmenu");
        const formContainer = $(".nixfile-folder-form-container");
        const form = $(".nixfile-folder-form");
        nixfileFolderEdit
            .off('click')
            .on("click", function (e) {
                formContainer.stop().fadeIn();
                const item = JSON.parse(contextMenu.attr('data-item'));
                formContainer.find("label input").attr('placeholder', item.title);
                formContainer.find('button').text("ویرایش نام");
                form
                    .attr({
                        'data-mode': "edit",
                        'data-folder-id': item.id
                    });
            });
    })
}