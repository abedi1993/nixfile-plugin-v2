import {get} from "./fetch.js";
import {link} from "../__apiRoutes.js";
import {getToken} from "./getToken.js";
import {breadcrumb} from "../ui/breadcrumb.js";
import {createFolder} from "../ui/createFolder.js";
import {createMedia} from "../ui/createMedia.js";
import {statistics} from "./statistics.js";
import {createTypeFilters} from "../actions/createTypeFilters.js";
import {createDateFilters} from "../actions/createDateFilter.js";
import {searchInput} from "../actions/searchInput.js";

export async function fetchFileManagerData(params = {}) {
    const page = params.page || 1;
    const force = params.force || false;

    // Reset state if forced refresh
    if (force) {
        if (window.nixfileMediaAbortController) {
            window.nixfileMediaAbortController.abort();
        }
        window.nixfileMediaPage = 1;
        window.nixfileMediaReachedEnd = false;
        jQuery(".nixfile-media-section").empty();
        jQuery(".nixfile-media-section-container").scrollTop(0);
    }

    // Check if already loading or reached end
    if ((window.nixfileMediaLoading || window.nixfileMediaReachedEnd) && !force) return;

    window.nixfileMediaLoading = true;

    try {
        console.log('Fetching file manager data...');
        const response = await get(`${link(2)}/domain/file-manager/${getToken}?folder_id=${params.folder_id ?? ''}&page=${page}&month=${params.month}&type=${params.type}&search=${params.search}`);
        if (!response) {
            showErrorContainer();
            window.nixfileMediaLoading = false;
            return null;
        }

        // Process successful response
        await statistics();
        createTypeFilters(response.data.filter.type);
        createDateFilters(response.data.filter.date);
        searchInput();

        // Update state with response data
        window.currentFolderId = response.data?.current_folder?.id;
        window.nixfileMediaPage = response.data.media.current_page;
        window.nixfileMediaLastPage = response.data.media.last_page;

        if (window.nixfileMediaPage >= window.nixfileMediaLastPage) {
            window.nixfileMediaReachedEnd = true;
        }

        await breadcrumb(response.data.current_folder);
        if (page === 1) await createFolder(response.data.folders);
        await createMedia(response.data.media);

        window.nixfileMediaLoading = false;
        return response;

    } catch (error) {
        console.error('Error fetching file manager data:', error);
        showErrorContainer();
        createTypeFilters(response.data.filter.type);
        searchInput();
        window.nixfileMediaLoading = false;
        return null;
    }
}

// Helper function to show error container
function showErrorContainer() {
    const errorContainer = jQuery("<div/>", {
        class: "nixfile-error-container",
        css: {
            "text-align": "center",
            "padding": "40px 20px",
            "margin": "20px 0",
            "background": "#fff",
            "border-radius": "8px",
            "box-shadow": "0 2px 10px rgba(0,0,0,0.1)",
            "grid-column": "1 / -1",
            "display": "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center"
        }
    });

    const errorIcon = jQuery("<span/>", {
        class: "dashicons dashicons-warning",
        css: {
            "color": "#f39c12",
            "font-size": "48px",
            "display": "block",
            "margin": "20px auto",
            "width": "fit-content",
            "height": "fit-content"
        }
    });

    const errorMessage = jQuery("<p/>", {
        text: "دامنه خود را در نیکس فایل ثبت کنید",
        css: {
            "margin": "0 0 20px 0",
            "font-size": "16px",
            "color": "#333"
        }
    });

    const errorButton = jQuery("<a/>", {
        href: 'https://nixfile.com',
        text: "ثبت دامنه",
        target: "_blank",
        css: {
            "display": "inline-block",
            "padding": "10px 20px",
            "text-decoration": "none",
            "background": "#0073aa",
            "color": "#fff",
            "border-radius": "4px",
            "transition": "background 0.3s"
        },
        hover: function () {
            jQuery(this).css("background", "#005a87");
        },
        mouseleave: function () {
            jQuery(this).css("background", "#0073aa");
        }
    });

    errorContainer.append(errorIcon).append(errorMessage).append(errorButton);
    jQuery(".nixfile-media-section").html(errorContainer);
}