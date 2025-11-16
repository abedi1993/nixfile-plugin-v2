<?php
declare(strict_types=1);

defined('ABSPATH') || exit;

final class NixfileUploaderComponent
{
    public function render(): void
    {
        ?>
        <div id="nixfile-box">
            <div class="nixfile-errors-box" role="alert" aria-live="polite"></div>
            <form id="nixfile-upload-form" enctype="multipart/form-data">
                <label for="nixfile-uploader-input" id="nixfile-uploader-label" class="nixfile-upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                         aria-hidden="true">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5l5 5m-5-5v12"/>
                    </svg>
                    <span class="nixfile-upload-text">Choose files or drag and drop</span>
                    <input
                            id="nixfile-uploader-input"
                            name="nixfile_files[]"
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                            aria-describedby="nixfile-upload-help"
                    >
                </label>
                <div id="nixfile-upload-help" class="screen-reader-text">
                    Select one or more files to upload. Supported formats include images, videos, audio, documents, and
                    archives.
                </div>
            </form>
        </div>
        <?php
    }
}

(new NixfileUploaderComponent())->render();