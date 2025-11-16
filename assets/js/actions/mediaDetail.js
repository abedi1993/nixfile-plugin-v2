export function mediaDetail(){
    jQuery(function ($){
        const nixfileFileDetail = $("#nixfile-detail-file");
        const nixfileFileContextMenu = $(".nixfile-file-contextmenu");

        nixfileFileDetail.on('click', function (e) {
            const id = JSON.parse(nixfileFileContextMenu.attr('data-item')).id;
            $(`.nixfile-media-box[data-id=${id}]`).click();
        });
    });
}