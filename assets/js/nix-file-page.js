jQuery(async function ($) {
    const nixfileContainer = $(".nixfile-container");
    const nixfileCloseBtn = $("#nixfile-close-btn");
    const nixfileOpenerBtn = $("#nixfile-uploader-opener");
    const nixfileUploaderSection = $(".nixfile-uploader");
    const nixfileSettingToggler = $("#nixfile-setting-toggler");
    const nixfileSettingSection = $(".nixfile-setting");
    const nixfileAjaxData = nixfile_ajax_data;
    const nixfileStoreTokenBtn = $("#nixfile_store_token");
    const nixfileStoreEmailBtn = $("#nixfile_store_email");
    const apiUrl = "http://192.168.0.244:7000/v1";
    const searchInput = $("#nixfile-search-input");
    const nixfileMediaBox = $(".nixfile-media-box");
    const nixfileMediaSection = $(".nixfile-media-section");
    const nixfileUploaderLabel = $("#nixfile-uploader");
    const uploaderDir = $("#nixfile-box");
    const errorsBox = $(".nixfile-errors-box");
    const nixfileFolderFormContainer = $(".nixfile-folder-form-container");
    const nixfileFolderFormOpener = $("#nixfile-folder-opener");
    const nixfileTokenInput = $("input[name=nixfile_store_token]");
    const nixfileFolderForm = $(".nixfile-folder-form");
    const nixfileBreadcrumb = $("#breadcrumb");
    const nixfileFolderContextMenu = $(".nixfile-folder-contextmenu");
    const nixfileFolderEdit = $("#nixfile-edit-folder");
    const nixfileFolderDelete = $("#nixfile-delete-folder");
    const nixfileFolderMove = $("#nixfile-move-folder");
    const nixfileFolderDetail = $("#nixfile-detail-folder");
    const nixfileDeleteFolderContainer = $("#nixfile-delete-folder-form-container");
    const nixfileMoveFolderContainer = $("#nixfile-folder-move-container");
    const nixfileDetailBar = $(".nixfile-detail-bar");
    const cancelMoveFolderModalBtn = $(".nixfile-cancel-button");
    const nixfileCloseButton = $(".nixfile-close-button");
    const nixfileFileContextMenu = $(".nixfile-file-contextmenu");
    const nixfileFileDetail = $("#nixfile-detail-file");
    const nixfileFileCopy = $("#nixfile-copy-file");
    const nixfileFileEditNameContainer = $(".nixfile-file-edit-name-form-container");
    const nixfileEditFileName = $("#nixfile-edit-file-name");
    const nixfileCapacity = $(".nixfile-capacity");
    const nixfileExpired = $(".nixfile-expired");
    const nixfileDeleteFileContainer = $("#nixfile-delete-file-form-container");
    const nixfileDeleteFileForm = $("#nixfile-delete-file-form");
    const nixfileDeleteFile = $("#nixfile-delete-file");
    const nixfileLoader = $("#nixfile-loader");
    const nixfileCreateNewFolder = $(".nixfile-create-new-folder");
    const nixfileCreateNewFolderForm = $(".nixfile-create-new-folder-form");
    const nixfileMediaSectionContainer = $(".nixfile-media-section-container");
    const nixfileReplaceFormContainer = $("#nixfile-replace-file-form-container");
    const nixfileReplaceForm = $("#nixfile-replace-file-form");
    const nixfileReplaceFileTrigger = $("#nixfile-replace-file");
    const nixfileFolderDetailTrigger = $("#nixfile-detail-folder");
    const nixfileMultiSelectTrigger = $("#nixfile-multi-select");
    const nixfileMediaTolls = $(".nixfile-media-tools");
    const nixfileMediaSearch = $(".nixfile-search-box");
    const nixfileMultiDeleteBtn = $("#nixfile-multi-select-delete");
    const nixfileMultiCancelBtn = $("#nixfile-multi-select-cancel");
    const nixfileMultiSelectTools = $(".nixfile-multi-select-tools");
    const nixfileMoveFolderBtn = $("#nixfile-submit-move-folder");
    const nixfileFileMoveContextMenu = $("#nixfile-move-file");
    const nixfileDateFilter = $("#nixfile-file-date");
    const nixfileTypeFilter = $("#nixfile-file-type");
    const footerTanku = $("#footer-thankyou").text("سپاسگذاریم از این که از نیکس فایل استفاده میکنید.");
    const footerVersion = $("#footer-upgrade").text("نگارش 1.0.0");
    let localStorageData = localStorage.getItem('nixfilePageData') ? JSON.parse(localStorage.getItem('nixfilePageData')) : null;
    let searchTimeout;
    let folderLists;
    let nixfileMediaPage = 1;
    let nixfileMediaLastPage = localStorageData?.page ?? 1;
    let isLoading = false;
    let selectedFolderId = localStorageData?.selectedFolderId;
    let currentFolder = localStorageData?.selectedFolderId;
    let editFolder;
    let editFile;
    let capacityPercent = 0;
    let activeMultiSelect = false;
    let multiSelectedId = [];
    let selectMoveFolder = null;
    let isMoveFolder = true;
    let selectedDateFilter = null;
    let selectedTypeFilter = null;
    localStorage.removeItem('nixfilePageData');
    nixfileLoader.fadeOut(400);
    nixfileUploaderSection.hide();
    nixfileSettingSection.hide();
    nixfileFolderFormContainer.hide();
    nixfileFolderContextMenu.hide();
    nixfileDeleteFolderContainer.hide();
    nixfileMoveFolderContainer.hide();
    nixfileDetailBar.hide();
    nixfileFileContextMenu.hide();
    nixfileFileEditNameContainer.hide();
    nixfileDeleteFileContainer.hide();
    nixfileCreateNewFolderForm.hide();
    nixfileReplaceFormContainer.hide();
    nixfileMultiSelectTools.hide();

    nixfileOpenerBtn.on("click", (e) => {
        e.preventDefault();
        nixfileUploaderSection.stop().slideToggle()
    });
    nixfileCloseBtn.on("click", (e) => {
        e.preventDefault();
        nixfileUploaderSection.stop().slideUp();
    });
    nixfileSettingToggler.on('click', (e) => {
        e.preventDefault();
        nixfileSettingSection.stop().slideToggle();
    });
    nixfileStoreTokenBtn.on("click", (e) => {
        const formData = new FormData();
        const token = $("input[name=nixfile_store_token]").val();
        formData.append('token', token);
        formData.append("action", nixfileAjaxData.action.set_token);
        formData.append("security", nixfileAjaxData.nonce);
        $.ajax({
            url: nixfileAjaxData.ajax_url,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: (res) => {
                const toast = $("<span/>", {
                    class: 'nixfile-success-toast',
                    text: res.message,
                    style: "inset-inline-start:0;"
                });
                nixfileContainer.append(toast)
                setTimeout(() => {
                    toast.css("inset-inline-start", "-100%");
                }, 2500);
                setTimeout(() => {
                    toast.detach();
                }, 4000)
            },
            error: (err) => {
            }
        });
    });

    function loadMedia() {
        if (activeMultiSelect)
            nixfileMultiCancelBtn.click();
        if (isLoading) return
        isLoading = true;
        let object = {
            per_page: 50,
            page: nixfileMediaPage,
            search: searchInput.val(),
            folder_id: selectedFolderId ?? null,
        };
        if (selectedDateFilter && selectedDateFilter !== "null") {
            object = {
                per_page: 50,
                page: nixfileMediaPage,
                search: searchInput.val(),
                folder_id: selectedFolderId ?? null,
                month: selectedDateFilter,
            }
        }
        if (selectedTypeFilter && selectedTypeFilter !== "null") {
            object = {...object, type: selectedTypeFilter}
        }
        $.ajax({
            url: `${apiUrl}/domain/${nixfileTokenInput.val()}`,
            type: "GET",
            data: object,
            success: (res) => {
                const media = res.data.media.data;
                createDateFilters(res.data.date);
                createTypeFilters(res.data.type)
                nixfileMediaLastPage = res.data.media.last_page;
                media.forEach((item, index) => {
                    const box = $("<div/>", {
                        class: 'nixfile-media-box',
                        style: `background-image:url(${item.url})`,
                    })
                        .attr("data-id", item.id)
                        .on("click", function (e) {
                            if ($(".nixfile-detail-bar").length > 0) $(".nixfile-detail-bar").remove();
                            const item = JSON.parse($(this).attr('data-item'))
                            const nixfileDetailBar = $("<div/>", {
                                class: 'nixfile-detail-bar',
                            });
                            let media;
                            switch (parseInt(item.type.int)) {
                                case 0:
                                    media = $("<img/>", {
                                        src: item.url
                                    });
                                    break;
                                case 1:
                                    media = $("<video/>", {
                                        src: item.url,
                                        controls: true
                                    });
                                    break;
                                case 2:
                                    media = $("<audio/>", {
                                        src: item.url,
                                        controls: true
                                    });
                                    break;
                                default:
                                    media = $("<img/>", {
                                        src: $(`.nixfile-media-box[data-id=${item.id}]`)
                                            .find('.nixfile-folder-icon').css('background-image')
                                            .replace(/url\((['"])?(.*?)\1\)/gi, '$2')
                                    });
                                    break;
                            }
                            const hr = $("<hr/>");
                            const name = $("<p/>", {
                                text: item.title
                            });
                            const date = $("<p/>", {
                                text: item.created_at.sh_data
                            });
                            const size = $("<p/>", {
                                text: item.size + ' مگابایت. ',
                            });
                            const resolution = $("<p/>", {
                                text: `${item.width} * ${item.height} پیکسل `
                            });
                            const copyRight = $("<p/>", {
                                html: `<p>آپلود شده در <a href="https://nixfile.com">نیکس فایل</a></p>`
                            });
                            const nixfileDetailAction = $("<div/>", {
                                class: "nixfile-detail-actions",
                            });
                            const button = $("<button/>", {
                                text: "کپی لینک"
                            }).on("click", function (e) {
                                const btn = $(this);
                                navigator.clipboard.writeText(input.val()).then(() => {
                                    btn.css('background-color', 'rgb(0,170,44)');
                                    setTimeout(() => {
                                        btn.css("background-color", '#666')
                                        btn.css('color', '#fff');
                                    }, 500)
                                }).catch(err => {
                                    console.error('Clipboard copy failed:', err);
                                });
                            });
                            const input = $("<input/>", {
                                value: item.url,
                                readonly: true
                            });
                            nixfileMediaSection.css("grid-template-columns", 'repeat(8, 1fr)');
                            nixfileDetailAction.append(button);
                            nixfileDetailAction.append(input);
                            nixfileMediaSectionContainer.append(nixfileDetailBar)
                            nixfileDetailBar.append(media);
                            nixfileDetailBar.append(hr);
                            nixfileDetailBar.append(name);
                            nixfileDetailBar.append(date);
                            nixfileDetailBar.append(size);
                            nixfileDetailBar.append(resolution);
                            nixfileDetailBar.append(copyRight);
                            nixfileDetailBar.append(nixfileDetailAction);
                            nixfileDetailBar.hide();
                            nixfileDetailBar.slideDown();
                        })
                        .on('contextmenu', function (e) {
                            e.preventDefault();
                            nixfileFileContextMenu.stop().slideDown(100);
                            nixfileFolderContextMenu.stop().slideUp(100);
                            nixfileFileContextMenu.css({
                                'position': 'absolute',
                                'top': e.pageY + 'px',
                                'left': e.pageX + 'px'
                            });
                            nixfileFileContextMenu.attr({
                                'data-item': $(this).attr('data-item'),
                            })
                        });
                    box.attr('data-item', JSON.stringify(item))
                    if (parseInt(item.type.int) !== 0) {
                        const p = $('<p/>').text(item.title);
                        const icon = $('<div/>', {
                            class: "nixfile-folder-icon",
                        });
                        switch (parseInt(item.type.int)) {
                            case 1 :
                                icon.css('background-image', `url(${nixfileAjaxData.images_url}/formats/mp4.svg)`)
                                break;
                            case 2 :
                                icon.css('background-image', `url(${nixfileAjaxData.images_url}/formats/mp3.svg)`)
                                break;
                            case 3 :
                                icon.css('background-image', `url(${nixfileAjaxData.images_url}/formats/zip.svg)`)
                                break;
                        }
                        box.append(icon);
                        box.append(p);
                    }
                    if (index === media.length - 1) {
                        box.attr('data-scroll', 'true')
                        setupInfiniteScrollObserver(box);
                    }
                    nixfileMediaSection.append(box)
                });
                isLoading = false;
            },
            error: (err) => {
                isLoading = false;
            }
        });
    }

    searchInput.on("input", async (e) => {
        nixfileMediaPage = 1;
        if (searchTimeout)
            clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            nixfileMediaSection.empty()
            await loadMedia();
            if (!e.target.value)
                await loadFolders()
        }, 200)
    })

    function setupInfiniteScrollObserver(element) {
        const domElement = element instanceof jQuery ? element[0] : element;
        if (!domElement || !(domElement instanceof Element)) {
            console.error("Invalid element for observer");
            return;
        }
        if (nixfileMediaLastPage <= nixfileMediaPage)
            return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    nixfileMediaPage += 1;
                    loadMedia(nixfileMediaPage)
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });
        observer.observe(domElement);
    }

    loadMedia();

    const uploadFile = async (file) => {
        activeMultiSelect = false;
        const box = $("<div/>", {
            class: 'nixfile-media-box',
            html: `<span class="nixfile-media-progress"></span>`
        });
        nixfileMediaSection.prepend(box);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', '1');
        formData.append('expired_at', '2');
        formData.append("domain_id", nixfileTokenInput.val())
        if (selectedFolderId !== null && selectedFolderId !== undefined)
            formData.append('folder_id', selectedFolderId);
        await $.ajax({
            url: `${apiUrl}/upload`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (e) {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        box.find(".nixfile-media-progress").css("width", percent + "%")
                    }
                }, false);
                return xhr;
            },
            success: function (response) {
                box.addClass('uploaded');
                const slug = response.data.slug;
                const url = `${apiUrl}/private/${slug}`
                box.css("background-image", `url(${url})`);
                getStatistic();
                box.html('')
            },
            error: function (xhr, status, error) {
                box.find(".nixfile-media-progress").css("background-color", "red");
                setTimeout(() => {
                    box.detach();
                }, 5000);
                if (xhr.responseJSON && xhr.responseJSON.errors) {
                    const responseError = xhr.responseJSON.errors;
                    errorsBox.css("display", 'block')
                    uploaderDir.append(errorsBox)
                    Object.keys(responseError).forEach((key) => {
                        const errorText = $("<span/>", {
                            class: "nixfile-errors",
                            text: responseError[key],
                            style: "margin-inline-start: 0; transition: all .5s ease-in-out;"
                        });
                        errorsBox.append(errorText);
                        setTimeout(() => {
                            errorText.css("margin-inline-start", '-100%');
                        }, 2000)
                        setTimeout(() => {
                            errorText.detach();
                            nixfileMediaSection.empty();
                            nixfileMediaPage = 1;
                            loadMedia();
                            loadFolders();
                        }, 3000)
                    });

                } else {
                }
            }
        });
    }

    nixfileUploaderLabel.find("input").on("change", async function (e) {
        const files = e.target.files;
        if (files.length > 0) {
            for (const file of files) {
                await uploadFile(file)
            }
        }
        nixfileMediaSection.empty();
        nixfileMediaPage = 1;
        await loadMedia();
        await loadFolders();
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
                    await uploadFile(file);
                }
                nixfileUploaderLabel.removeClass("active");
                nixfileMediaSection.empty();
                nixfileMediaPage = 1;
                loadMedia();
                await loadFolders()
            }
        });
    nixfileFolderFormContainer.on("click", (e) => {
        $(e.currentTarget).stop().fadeOut();
    });
    nixfileFolderFormOpener.on('click', (e) => {
        nixfileFolderFormContainer.stop().fadeIn();
        nixfileFolderFormContainer.find('button').text('ثبت');
        $("#nixfile-edit-folder-name").remove();
        nixfileFolderFormContainer.find('label input').attr('placeholder', 'مثلا: نمونه کار');
    })
    nixfileFolderForm
        .on('click', (e) => {
            e.stopPropagation();
        })
        .on('submit', function (e) {
            e.preventDefault();
            let url = `${apiUrl}/upload/folder`;
            const form = $(e.currentTarget);
            const formData = new FormData(e.currentTarget);
            if (editFolder) {
                url += `/${editFolder.id}`;
                type = editFolder.type;
                formData.append('_method', 'PUT');
            }
            formData.append('domain_id', nixfileTokenInput.val());
            if (selectedFolderId !== null && selectedFolderId !== undefined)
                formData.append('parent_id', selectedFolderId);
            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: async function (res) {
                    editFolder = null;
                    nixfileFolderFormContainer.stop().fadeOut();
                    const nixfileFolderBox = $(".nixfile-folder");
                    if (nixfileFolderBox)
                        nixfileFolderBox.remove()
                    await loadFolders()
                    const toast = $("<span/>", {
                        class: 'nixfile-success-toast',
                        text: res.message,
                        style: "inset-inline-start:0;"
                    });
                    form.find('input').val("");
                    nixfileContainer.append(toast)
                    setTimeout(() => {
                        toast.css("inset-inline-start", "-100%");
                    }, 2500);
                    setTimeout(() => {
                        toast.detach();
                    }, 4000)
                },
                error: (error) => {
                    editFolder = null;
                    if (error.responseJSON && error.responseJSON.errors) {
                        const responseError = error.responseJSON.errors;
                        errorsBox.css("display", 'block')
                        uploaderDir.append(errorsBox)
                        Object.keys(responseError).forEach((key) => {
                            const errorText = $("<span/>", {
                                class: "nixfile-errors",
                                text: responseError[key],
                                style: "margin-inline-start: 0; transition: all .5s ease-in-out;"
                            });
                            errorsBox.append(errorText);
                            setTimeout(() => {
                                errorText.css("margin-inline-start", '-100%');
                            }, 2000)
                            setTimeout(() => {
                                errorText.detach();
                            }, 3000)
                        });

                    } else {
                    }
                }
            })
        });
    const loadFolders = async () => {
        let url = `${apiUrl}/upload/folder/${nixfileTokenInput.val()}`;
        if (selectedFolderId)
            url += `?parent_id=${selectedFolderId}`;
        if (currentFolder)
            url += selectedFolderId ? `&current_id=${currentFolder}` : `?current_id=${currentFolder}`
        await $.ajax({
            url: url,
            type: "GET",
            processData: false,
            contentType: false,
            success: (res) => {
                res.data.forEach((item) => {
                    const box = $("<div/>", {
                        class: "nixfile-folder",
                    });
                    const nixfileFolderIcon = $("<div/>", {
                        class: 'nixfile-folder-icon'
                    }).css("background-image", `url(${nixfile_ajax_data.images_url}/folder.png)`);
                    const p = $("<p/>", {
                        class: 'nixfile-folder-title',
                        text: item.title
                    })
                    box.append(nixfileFolderIcon);
                    box.append(p);
                    box.attr({
                        'data-id': item.id,
                        'data-name': item.title,
                        'data-parent-id': item.parent_id,
                        'data-item': JSON.stringify(item),
                        'data-open': false,
                    });
                    if (item.id === selectedFolderId) {
                        nixfileFolderIcon.css("background-image", `url(${nixfile_ajax_data.images_url}/back.png)`);
                        box.attr('data-open', true);
                        box.css('order', '-1')
                    }
                    box
                        .on("click", async function (e) {
                            const id = $(this).attr('data-id');
                            await nixfileMediaSection.empty();
                            if (id === selectedFolderId) {
                                selectedFolderId = item.parent_id;
                                nixfileMediaPage = 1;
                                await loadFolders();
                                await loadMedia();
                                $(`.nixfile-breadcrumb-items[data-id=${id}]`).remove();
                            } else {
                                selectedFolderId = $(this).attr('data-id');
                                nixfileMediaPage = 1;
                                await loadFolders();
                                await loadMedia();
                                breadcrumbMaker();
                            }
                        })
                        .on('contextmenu', function (e) {
                            e.preventDefault();
                            nixfileFolderContextMenu.stop().slideDown(100);
                            nixfileFileContextMenu.stop().slideUp(100);
                            nixfileFolderContextMenu.css({
                                'position': 'absolute',
                                'top': e.pageY + 'px',
                                'left': e.pageX + 'px'
                            });
                            nixfileFolderContextMenu.attr({
                                'data-id': $(this).attr('data-id'),
                                'data-name': $(this).attr("data-name")
                            })
                        });
                    nixfileMediaSection.prepend(box)
                })
            },
            error: (error) => {
            }
        });
    }

    async function loadFolderRequest(parent = true) {
        let url = `${apiUrl}/upload/folder/${nixfileTokenInput.val()}`;
        if (selectedFolderId && parent)
            url += `?parent_id=${selectedFolderId}`;
        if (currentFolder)
            url += selectedFolderId ? `&current_id=${currentFolder}` : `?current_id=${currentFolder}`
        await $.ajax({
            url: url,
            type: "GET",
            processData: false,
            contentType: false,
            success: (res) => {
                if (!parent)
                    folderLists = res.data;
            },
            error: (error) => {
            }
        });

    }

    await loadFolders();

    function breadcrumbMaker(e) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="#888888" d="m6.05 19l5-7l-5-7H8.5l5 7l-5 7zM12 19l5-7l-5-7h2.45l5 7l-5 7z"/></svg>`;
        if (!localStorageData) {
            let folder;
            if (selectedFolderId)
                folder = $(`.nixfile-folder[data-id=${selectedFolderId}]`);
            const breadcrumbItem = $("<p/>", {
                class: 'nixfile-breadcrumb-items',
                html: `${svg}
<p>${folder ? folder.attr('data-name') : 'خانه'}</p>
`
            });
            breadcrumbItem.attr('data-id', selectedFolderId ? selectedFolderId : null);
            breadcrumbItem.on("click", async function (e) {
                activeMultiSelect = false;
                selectedFolderId = $(this).attr('data-id');
                nixfileMediaSection.empty();
                removeBreadcrumb($(this).next());
                breadcrumbLink(selectedFolderId)
                nixfileMediaPage = 1;
                await loadFolders();
                await loadMedia();
            });
            nixfileBreadcrumb.append(breadcrumbItem);
            breadcrumbLink(selectedFolderId);
        } else {
            nixfileBreadcrumb.empty();
            JSON.parse(localStorageData.breadcrumbs).forEach((item) => {
                const breadcrumbItem = $("<p/>", {
                    class: 'nixfile-breadcrumb-items',
                    html: `${svg}
                        <p>${item.name}</p>`
                });
                breadcrumbItem.attr('data-id', item.id);
                breadcrumbItem.on("click", async function (e) {
                    selectedFolderId = $(this).attr('data-id');
                    nixfileMediaSection.empty();
                    removeBreadcrumb($(this).next());
                    breadcrumbLink(selectedFolderId)
                    nixfileMediaPage = 1;
                    await loadFolders();
                    await loadMedia();
                });
                nixfileBreadcrumb.append(breadcrumbItem);
            });
            localStorage.removeItem("nixfilePageData");
            breadcrumbLink(localStorageData.selectedFolderId);
            localStorageData = null;
        }
    }

    const removeBreadcrumb = (element) => {
        if (element.next().length > 0)
            removeBreadcrumb(element.next());
        element.remove();
    }

    function breadcrumbLink(elementId) {
        $(`.nixfile-breadcrumb-items[data-id=${elementId}]`).prevAll().css("color", '#2d77b0');

    }

    breadcrumbMaker();

    $(document).on('click', function (e) {
        nixfileFolderContextMenu.stop().slideUp(100);
        nixfileFileContextMenu.stop().slideUp(100);
    });

    nixfileFolderEdit
        .on("click", function (e) {
            activeMultiSelect = false;
            nixfileFolderFormContainer.stop().fadeIn();
            editFolder = {
                'name': nixfileFolderContextMenu.attr('data-name'),
                'id': nixfileFolderContextMenu.attr('data-id'),
                'type': 'PUT',
            }
            nixfileFolderFormContainer.find("label input").attr('placeholder', editFolder.name);
            nixfileFolderFormContainer.find('button').text("ویرایش نام");
        });
    nixfileDeleteFolderContainer.on('click', function (e) {
        $(this).fadeOut();
    });
    nixfileFolderDelete
        .on('click', function (e) {
            nixfileDeleteFolderContainer.fadeIn();
            nixfileDeleteFolderContainer.find('input[type=text]').attr('value', nixfileFolderContextMenu.attr('data-id'));
        });
    nixfileDeleteFolderContainer
        .find('form')
        .on("submit", function (e) {
            e.preventDefault();
            const url = `${apiUrl}/upload/folder/${nixfileFolderContextMenu.attr('data-id')}?domain_id=${nixfileTokenInput.val()}`
            $.ajax({
                url: url,
                type: "DELETE",
                processData: false,
                contentType: false,
                success: async function (res) {
                    nixfileDeleteFolderContainer.stop().fadeOut();
                    const nixfileFolderBox = $(".nixfile-folder");
                    selectedFolderId = null;
                    currentFolder = null;
                    if (nixfileFolderBox)
                        nixfileFolderBox.remove();
                    getStatistic();
                    nixfileMediaPage = 1;
                    location.reload();
                    const toast = $("<span/>", {
                        class: 'nixfile-success-toast',
                        text: res.message,
                        style: "inset-inline-start:0;"
                    });
                    nixfileContainer.append(toast);
                    setTimeout(() => {
                        toast.css("inset-inline-start", "-100%");
                    }, 2500);
                    setTimeout(() => {
                        toast.detach();
                    }, 4000);
                },
                error: (error) => {
                    if (error.responseJSON && error.responseJSON.errors) {
                        const responseError = error.responseJSON.errors;
                        errorsBox.css("display", 'block')
                        uploaderDir.append(errorsBox)
                        Object.keys(responseError).forEach((key) => {
                            const errorText = $("<span/>", {
                                class: "nixfile-errors",
                                text: responseError[key],
                                style: "margin-inline-start: 0; transition: all .5s ease-in-out;"
                            });
                            errorsBox.append(errorText);
                            setTimeout(() => {
                                errorText.css("margin-inline-start", '-100%');
                            }, 2000)
                            setTimeout(() => {
                                errorText.detach();
                            }, 3000)
                        });

                    } else {
                    }
                }
            });
        })
        .on('click', function (e) {
            e.stopPropagation();
        });
    nixfileDeleteFolderContainer
        .find('button')
        .on('click', function (e) {
            nixfileDeleteFolderContainer.fadeOut();
        });
    nixfileMoveFolderContainer.on('click', function (e) {
        $(this).fadeOut();
    });
    nixfileMoveFolderContainer
        .find('.nixfile-folder-move-content')
        .on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        })
    nixfileFolderMove.on("click", async function (e) {
        nixfileMoveFolderContainer.fadeIn();
        isMoveFolder = true;
        await loadFolderRequest(false);
        const divider = nixfileMoveFolderContainer.find('.nixfile-divider');
        divider.empty();
        divider.append(createFolder({
            id: 'home',
            title: 'خانه',
            folders: [],
        }));
        if (folderLists.length > 0) {
            folderLists.reverse().forEach((data) => {
                if (nixfileFolderContextMenu.attr('data-id') !== data.id)
                    divider.append(createFolder(data))
            });
        }
    });
    nixfileMoveFolderBtn.on('click', async function () {
        if (!selectMoveFolder) return;
        const formData = new FormData();
        formData.append('domain_id', nixfileTokenInput.val());
        formData.append('_method', 'PUT');
        let url;
        if (isMoveFolder) {
            formData.append('parent_id', selectMoveFolder);
            url = `${apiUrl}/upload/folder/${nixfileFolderContextMenu.attr('data-id')}`;
        } else {
            const id = JSON.parse(nixfileFileContextMenu.attr('data-item')).id;
            url = `${apiUrl}/upload/${id}`
            formData.append('folder_id', selectMoveFolder);
        }
        await $.ajax({
            url: url,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: async function (response) {
                getStatistic();
                nixfileMediaPage = 1;
                await nixfileMediaSection.empty();
                await loadFolders();
                await loadMedia();
                selectMoveFolder = null;
                nixfileMoveFolderContainer.fadeOut();
            },
            error: function (error) {
            }
        });
    })

    function createFolder(data) {
        const container = $("<div/>", {
            class: `${data.folders.length > 0 ? 'nixfile-folder-item-dropdown-container' : 'nixfile-move-folder-container'}`,
        })
            .attr('data-id', data.id);
        container.on('click', function (e) {
            e.stopPropagation();
            const id = $(this).attr('data-id');
            if (selectMoveFolder === id) selectMoveFolder = null;
            else selectMoveFolder = id;
            const divider = $('.nixfile-divider');
            divider.find('.selected').not(this).removeClass('selected');
            divider.find(`div[data-id=${id}]`).toggleClass('selected');
        });
        const item = $("<div/>", {
            class: "nixfile-folder-item"
        });
        const icon = $("<span/>", {
            class: "nixfile-folder-move-icon",
        })
            .css("background-image", `url(${nixfileAjaxData.images_url}/folder.png)`);
        const text = $("<p/>", {
            text: data.title
        });
        container.append(item);
        item.append(icon);
        item.append(text);
        if (data.folders && data.folders.length > 0) {
            const dropDownSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 stroke-width="1.5" stroke="currentColor" class="nixfile-size-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                            </svg>`;
            const dropDownTrigger = $("<button/>", {
                html: dropDownSvg,
            })
                .on('click', function (e) {
                    e.stopPropagation();
                    $(`.nixfile-divider div[parent-id=${data.id}]`).stop().slideToggle()
                    $(this).toggleClass('active')
                });
            dropDownTrigger.attr('data-id', data.id);
            item.append(dropDownTrigger);
            data.folders.forEach(async (subFolder) => {
                await container.append(createFolder(subFolder).attr('parent-id', subFolder.parent_id).hide());
            });
        }
        return container;
    }

    cancelMoveFolderModalBtn.on("click", function (e) {
        e.preventDefault();
        nixfileMoveFolderContainer.fadeOut();
    })
    nixfileCloseButton.click(function () {
        let content = $(this).closest('.nixfile-dropdown-item').next('.nixfile-content');
        let svg = $(this).find('svg');
        content.slideToggle();
        svg.toggleClass('rotated');
    });
    nixfileFileDetail.on('click', function (e) {
        const id = JSON.parse(nixfileFileContextMenu.attr('data-item')).id;
        $(`.nixfile-media-box[data-id=${id}]`).click();
    });
    nixfileFileCopy.on('click', function () {
        const item = JSON.parse(nixfileFileContextMenu.attr('data-item'))
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
    nixfileEditFileName.on('click', function () {
        nixfileFileEditNameContainer.fadeIn();
        const item = JSON.parse(nixfileFileContextMenu.attr('data-item'));
        nixfileFileEditNameContainer.find('form input[type=text]').attr('placeholder', item.title);
    });
    nixfileFileEditNameContainer.on("click", function (e) {
        $(this).fadeOut()
    })
        .find('form')
        .on('click', function (e) {
            e.stopPropagation();
        })
        .on('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(e.currentTarget)
            editFile = {
                'domain_id': nixfileTokenInput.val(),
                '_method': 'PUT',
                'title': formData.get("title"),
                'id': JSON.parse(nixfileFileContextMenu.attr('data-item')).id
            }
            await updateFolderTitle(editFile);
            e.currentTarget.reset();
            nixfileMediaPage = 1;
        });

    function updateFolderTitle(formData) {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('domain_id', formData.domain_id);
        data.append('_method', 'PUT');
        $.ajax({
            url: `${apiUrl}/upload/${formData.id}`,
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
            success: async function (res) {
                nixfileFileEditNameContainer.stop().fadeOut();
                const toast = $("<span/>", {
                    class: 'nixfile-success-toast',
                    text: res.message,
                    style: "inset-inline-start:0;"
                });
                nixfileMediaSection.empty();
                nixfileMediaPage = 1;
                await loadFolders();
                loadMedia();
                getStatistic();
                nixfileContainer.append(toast);
                editFile = null;
                setTimeout(() => {
                    toast.css("inset-inline-start", "-100%");
                }, 2500);
                setTimeout(() => {
                    toast.detach();
                }, 4000);
            },
            error: (error) => {
                nixfileMediaSection.empty();
                nixfileMediaPage = 1;
                loadFolders();
                loadMedia();
                getStatistic();
                editFile = null;
            }
        });
    }

    let capacity = new ProgressBar.Circle(nixfileCapacity.find('div')[0], {
        color: '#00b894',
        strokeWidth: 6,
        trailWidth: 4,
        duration: 1400,
        easing: 'bounce',
        text: {
            autoStyleContainer: false
        },
        from: {color: '#00cec9', width: 8},
        to: {color: '#fecd28', width: 8},
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);
            const value = circle.value() * 100;
            nixfileCapacity.find('div p').text(parseFloat(value).toFixed(1) + '%')
        }
    });
    let expired = new ProgressBar.Circle(nixfileExpired.find('div')[0], {
        color: '#00b894',
        strokeWidth: 6,
        trailWidth: 4,
        duration: 1400,
        easing: 'bounce',
        text: {
            autoStyleContainer: false
        },
        from: {color: '#00cec9', width: 8},
        to: {color: '#fecd28', width: 8},
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);
            const value = Math.round(circle.value() * 100);
            nixfileExpired.find('div p').text(value + '%')
        }
    });
    expired.animate(0.35);
    nixfileDeleteFileContainer.find('form').on('click', function (e) {
        e.stopPropagation();
    });
    nixfileDeleteFileContainer.on('click', function () {
        $(this).fadeOut();
    });
    nixfileDeleteFile.on('click', function (e) {
        nixfileDeleteFileContainer.fadeIn();
    });
    nixfileDeleteFileForm.find("button").on('click', function () {
        nixfileDeleteFileContainer.fadeOut();
    });
    nixfileDeleteFileForm.find('input[type=submit]').on('click', function (e) {
        e.preventDefault();
        $.ajax({
            url: `${apiUrl}/upload/${JSON.parse(nixfileFileContextMenu.attr('data-item')).slug}?domain_id=${nixfileTokenInput.val()}`,
            type: "DELETE",
            processData: false,
            contentType: false,
            success: (res) => {
                const toast = $("<span/>", {
                    class: 'nixfile-success-toast',
                    text: res.message,
                    style: "inset-inline-start:0;"
                });
                nixfileMediaSection.empty();
                nixfileMediaPage = 1;
                loadFolders();
                loadMedia();
                getStatistic();
                nixfileContainer.append(toast)
                nixfileDeleteFileContainer.fadeOut();
                setTimeout(() => {
                    toast.css("inset-inline-start", "-100%");
                }, 2500);
                setTimeout(() => {
                    toast.detach();
                }, 4000)
            },
            error: (err) => {
            }
        });
    });

    function getStatistic() {
        $.ajax({
            url: `${apiUrl}/upload-stats/?domain_id=${nixfileTokenInput.val()}`,
            type: "GET",
            processData: false,
            contentType: false,
            success: (res) => {
                const toast = $("<span/>", {
                    class: 'nixfile-success-toast',
                    text: res.message,
                    style: "inset-inline-start:0;"
                });
                nixfileContainer.append(toast);
                capacityPercent = (res.data.uploaded * 100) / res.data.capacity;
                setTimeout(() => {
                    toast.css("inset-inline-start", "-100%");
                }, 2500);
                setTimeout(() => {
                    toast.detach();
                }, 4000)
                capacity.animate(capacityPercent / 100);
            },
            error: (err) => {
            }
        });
    }

    getStatistic();
    nixfileCreateNewFolder
        .on('click', function (e) {
            nixfileCreateNewFolderForm.stop().slideToggle()
        });
    nixfileCreateNewFolderForm.find('button[type=submit]').on('click', function (e) {
        const formData = new FormData();
        formData.append('title', nixfileCreateNewFolderForm.find('input[type=text]').val());
        formData.append('domain_id', nixfileTokenInput.val());
        $.ajax({
            url: `${apiUrl}/upload/folder/`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: async function (response) {
                nixfileMediaPage = 1;
                nixfileMediaSection.empty();
                await loadMedia();
                await loadFolders();
                await loadFolderRequest(false);
                if (folderLists.length > 0) {
                    const divider = nixfileMoveFolderContainer.find('.nixfile-divider');
                    divider.empty();
                    divider.append(createFolder({
                        'id': 'home',
                        'title': 'خانه',
                        'folders': [],
                    }))
                    folderLists.reverse().forEach((data) => {
                        if (nixfileFolderContextMenu.attr('data-id') !== data.id)
                            divider.append(createFolder(data))
                    });
                }
                nixfileCreateNewFolderForm[0].reset();
            },
            error: function (error) {
                nixfileCreateNewFolderForm[0].reset();
                loadFolderRequest(false);
            }
        });
    })

    nixfileReplaceFileTrigger.on('click', function () {
        nixfileReplaceFormContainer.fadeIn();
    });
    nixfileReplaceFormContainer.on('click', function () {
        $(this).fadeOut();
    });
    nixfileReplaceForm
        .on('click', function (e) {
            e.stopPropagation();
        })
        .find('input[type=file]')
        .on('change', async function (e) {
            const [file] = e.target.files;
            const data = new FormData();
            data.append('domain_id', nixfileTokenInput.val());
            data.append('_method', 'PUT');
            data.append('file', file);
            const item = JSON.parse(nixfileFileContextMenu.attr('data-item'));
            await $(`.nixfile-media-box[data-id=${item.id}]`).remove()
            await $.ajax({
                url: `${apiUrl}/upload/${item.id}`,
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                xhr: function () {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function (e) {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            nixfileReplaceForm.find("label.nixfile-upload-file span").css({
                                "width": (percent - 20) + "%",
                                "opacity": '1',
                            }).text(percent + "%");
                        }
                    }, false);
                    return xhr;
                },
                success: async function (response) {
                    getStatistic();
                    nixfileMediaPage = 1;
                    nixfileReplaceForm[0].reset();
                    nixfileReplaceForm.find("label.nixfile-upload-file span").css({
                        "width": 0,
                        "opacity": '0',
                    }).text('0' + "%");
                    nixfileReplaceFormContainer.fadeOut();
                },
                error: function (xhr, status, error) {
                    nixfileReplaceForm.find("label.nixfile-upload-file span").css("background-color", "red");
                    setTimeout(() => {
                        nixfileReplaceForm.find("label.nixfile-upload-file span").detach();
                    }, 5000);
                    if (xhr.responseJSON && xhr.responseJSON.errors) {
                        const responseError = xhr.responseJSON.errors;
                        errorsBox.css("display", 'block')
                        uploaderDir.append(errorsBox)
                        Object.keys(responseError).forEach((key) => {
                            const errorText = $("<span/>", {
                                class: "nixfile-errors",
                                text: responseError[key],
                                style: "margin-inline-start: 0; transition: all .5s ease-in-out;"
                            });
                            errorsBox.append(errorText);
                            setTimeout(() => {
                                errorText.css("margin-inline-start", '-100%');
                            }, 2000)
                            setTimeout(async () => {
                                errorText.detach();
                                nixfileMediaPage = 1;
                                nixfileMediaSection.empty();
                                await loadMedia();
                                await loadFolders();
                            }, 3000)
                        });

                    } else {
                    }
                }
            });
            const nixfilePageData = {
                page: 1,
                selectedFolderId,
                breadcrumbs: JSON.stringify($(".nixfile-breadcrumb-items").map((index, item) => {
                    return {
                        name: $(item).text(),
                        id: $(item).attr('data-id')
                    }
                }).get()),
            }
            localStorage.setItem("nixfilePageData", JSON.stringify(nixfilePageData))
            location.reload();
        });
    nixfileFolderDetailTrigger.on('click', function () {
        if ($(".nixfile-detail-bar").length > 0) $(".nixfile-detail-bar").remove();
        const item = JSON.parse($(`.nixfile-folder[data-id=${nixfileFolderContextMenu.attr('data-id')}]`).attr('data-item'));
        const nixfileDetailBar = $("<div/>", {
            class: 'nixfile-detail-bar',
        });
        const media = $("<img/>", {
            src: $(`.nixfile-folder[data-id=${item.id}]`).find('.nixfile-folder-icon').css('background-image').replace(/url\((['"])?(.*?)\1\)/gi, '$2')
        });
        const hr = $("<hr/>");
        const name = $("<p/>", {
            text: item.title
        });
        const size = $("<p/>", {
            text: item.files_size + ' مگابایت. ',
        });
        const fileCount = $("<p/>", {
            text: `تعداد فایل ها :${item.files_count}`
        });
        const copyRight = $("<p/>", {
            html: `<p>آپلود شده در <a href="https://nixfile.com">نیکس فایل</a></p>`
        });
        const folderCount = $("<p/>", {
            text: `تعداد پوشه ها : ${item.folders_count}`
        });
        nixfileMediaSection.css("grid-template-columns", 'repeat(8, 1fr)');
        nixfileMediaSectionContainer.append(nixfileDetailBar)
        nixfileDetailBar.append(media);
        nixfileDetailBar.append(hr);
        nixfileDetailBar.append(name);
        nixfileDetailBar.append(size);
        nixfileDetailBar.append(fileCount);
        nixfileDetailBar.append(folderCount);
        nixfileDetailBar.append(copyRight);
        nixfileDetailBar.hide();
        nixfileDetailBar.slideDown();
    });
    nixfileMultiSelectTrigger.on('click', function () {
        activeMultiSelect = true;
        if ($(".nixfile-multi-select-label").length > 0)
            $(".nixfile-multi-select-label").remove();
        if (activeMultiSelect) {
            nixfileMediaTolls.hide();
            nixfileMediaSearch.hide();
            nixfileMultiSelectTools.show();
            const mediaBox = $(".nixfile-media-box");
            mediaBox.css({
                'opacity': "0.7"
            });
            $(".nixfile-folder").remove();
            mediaBox.get().forEach((item) => {
                const checkBox = $("<input/>", {
                    type: "checkbox",
                })
                    .css({
                        'position': 'absolute',
                        "top": 0,
                        "right": 0,
                        "z-index": 9999999
                    })
                    .on('click', function (e) {
                        e.stopPropagation();
                    });
                const label = $("<label/>", {
                    class: 'nixfile-multi-select-label'
                })
                    .on('click', function (e) {
                        e.stopPropagation();
                        $(this).toggleClass("active");
                        $(item).toggleClass('active');
                        const itemId = $(item).attr('data-id');
                        if (multiSelectedId && multiSelectedId.length > 0 && multiSelectedId.includes(itemId)) {
                            multiSelectedId = multiSelectedId.filter(id => id !== itemId);
                        } else {
                            multiSelectedId.push(itemId);
                        }
                        if (multiSelectedId.length > 0) {
                            nixfileMultiDeleteBtn.removeClass('disabled');
                        } else {
                            nixfileMultiDeleteBtn.addClass('disabled');
                        }
                    })
                    .append(checkBox);
                $(item).append(label);
            })
        }
    });
    nixfileMultiCancelBtn.on('click', async function () {
        if ($(".nixfile-multi-select-label").length > 0)
            $(".nixfile-multi-select-label").remove();
        await nixfileMultiSelectTools.hide();
        await nixfileMediaTolls.show();
        await nixfileMediaSearch.show();
        $(".nixfile-folder").remove();
        await loadFolders();
        const mediaBox = $(".nixfile-media-box");
        mediaBox.css({
            'opacity': "1"
        });
        activeMultiSelect = false;
    });
    nixfileMultiDeleteBtn.on('click', function () {
        if (multiSelectedId.length > 0) {
            const formData = new FormData();
            formData.append('domain_id', nixfileTokenInput.val());
            multiSelectedId.forEach((item, index) => {
                formData.append(`ids[` + index + ']', item);
            });
            $.ajax({
                url: `${apiUrl}/upload/multi-delete`,
                type: "POST",
                processData: false,
                contentType: false,
                data: formData,
                success: async (res) => {
                    nixfileMediaPage = 1;
                    nixfileMediaSection.empty();
                    await loadMedia();
                    multiSelectedId = [];
                },
                error: async (err) => {
                    nixfileMultiCancelBtn.click();
                    multiSelectedId = [];
                }
            })
        }
    });
    nixfileFileMoveContextMenu.on('click', async function () {
        nixfileMoveFolderContainer.fadeIn();
        isMoveFolder = false;
        await loadFolderRequest(false);
        const divider = nixfileMoveFolderContainer.find('.nixfile-divider');
        divider.empty();
        divider.append(createFolder({
            id: 'home',
            title: 'خانه',
            folders: [],
        }));
        if (folderLists.length > 0) {
            folderLists.reverse().forEach((data) => {
                if (nixfileFolderContextMenu.attr('data-id') !== data.id)
                    divider.append(createFolder(data))
            });
        }
    });

    function createDateFilters(date) {
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
            })
        }
    }

    nixfileDateFilter.on('change', function (e) {
        nixfileMediaPage = 1;
        selectedDateFilter = e.target.value;
        $(e.currentTarget).attr('selected');
        nixfileMediaSection.empty()
        loadMedia();
        loadFolders();
    })

    function createTypeFilters(type) {
        nixfileTypeFilter.empty();
        const options = $("<option/>", {
            value: "null",
            text: 'همه موارد رسانه ای',
            selected: selectedTypeFilter === "null"
        });
        nixfileTypeFilter.append(options);
        if (type.length > 0) {
            type.forEach((item) => {
                const options = $("<option/>", {
                    value: item.int,
                    text: item.fa,
                    selected: parseInt(selectedTypeFilter) === item.int
                });
                nixfileTypeFilter.append(options)
            })
        }
    }

    nixfileTypeFilter.on('change', function (e) {
        nixfileMediaPage = 1;
        selectedTypeFilter = e.target.value;
        nixfileMediaSection.empty()
        loadMedia();
        loadFolders();
    })

});