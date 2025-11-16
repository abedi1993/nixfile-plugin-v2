import {uploadFile} from "../actions/uploadFile.js";

export function uploaderInput() {
    jQuery(function ($) {
        const nixfileOpenerBtn = $("#nixfile-uploader-opener");
        const nixfileCloseBtn = $("#nixfile-close-btn");
        const nixfileUploaderSection = $(".nixfile-uploader");
        const nixfileUploaderLabel = $("#nixfile-uploader");

        nixfileOpenerBtn.on("click", (e) => {
            e.preventDefault();
            nixfileUploaderSection.stop().slideToggle()
        });
        nixfileCloseBtn.on("click", (e) => {
            e.preventDefault();
            nixfileUploaderSection.stop().slideUp();
        });

        nixfileUploaderLabel
            .find("input")
            .on("change", async function (e) {
            const files = e.target.files;
            if (files.length > 0) {
                for (const file of files) {
                    await uploadFile({
                        file,
                    });
                }
            }
        });
        nixfileUploaderLabel
            .on("dragover", (e) => {
                e.preventDefault();
                e.stopPropagation();
                nixfileUploaderLabel.addClass("active")
            })
            .on("dragleave", (e) => {
                e.preventDefault();
                e.stopPropagation();
                nixfileUploaderLabel.removeClass("active")
            })
            .on("drop", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    for (const file of files) {
                        await uploadFile({
                            file
                        });
                    }
                    nixfileUploaderLabel.removeClass("active");
                    window.nixfileMediaPage = 1;
                }
            });
    })
}