import {post} from "../utils/fetch.js";
import {link} from "../__apiRoutes.js";
import {getToken} from "../utils/getToken.js";
import {fetchFileManagerData} from "../utils/fetchFileManagerData.js";

export function postFolder() {
    jQuery(function ($) {
        const opener = $("#nixfile-folder-opener");
        const formContainer = $(".nixfile-folder-form-container");
        const form = $(".nixfile-folder-form");

        formContainer.on("click", (e) => {
            $(e.currentTarget).fadeOut();
        });
        opener.on("click", () => {
            formContainer.fadeIn();
            formContainer.find("button").text("ثبت");
            $("#nixfile-edit-folder-name").remove();
            formContainer.find("label input").attr("placeholder", "مثلا: نمونه کار");
            form.attr({
                'data-mode': "create",
            });
        });


        form.on("click", (e) => e.stopPropagation());
        form.on("submit", async function (e) {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("parent_id", window.currentFolderId);
            const mode = form.attr('data-mode');
            if (mode === "create") {
                try {
                    await post(`${link(2)}/domain/file-manager/${getToken}/folder`, formData);
                } catch (error) {
                    console.error("Folder submit failed:", error);
                }
            } else {
                formData.append("_method", "PUT");
                const folderId = form.attr('data-folder-id');
                formData.append("folder_id", folderId);
                try {
                    await post(`${link(2)}/domain/file-manager/${getToken}/folder-title/${folderId}`, formData);
                } catch (error) {
                    console.error("Folder submit failed:", error);
                }
            }
            e.currentTarget.reset();
            formContainer.fadeOut();
            await fetchFileManagerData({
                folder_id: window.currentFolderId,
                force: true,
                page: 1,
            });
        });
    });
}
