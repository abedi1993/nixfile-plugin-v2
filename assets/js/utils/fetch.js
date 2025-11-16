import { link } from "../__apiRoutes.js";
import { fetchFileManagerData } from "./fetchFileManagerData.js";
import { nixfileAjaxData } from "./ajaxData.js";

const requestControllers = new Map();

async function makeRequest(url, options = {}) {
    const controller = new AbortController();
    const key = options.method || 'GET';

    if (requestControllers.has(key)) {
        requestControllers.get(key).abort();
    }

    requestControllers.set(key, controller);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } finally {
        requestControllers.delete(key);
    }
}

export async function get(url) {
    return makeRequest(url, { method: 'GET' });
}

export async function post(url, body) {
    const isFormData = body instanceof FormData;

    return makeRequest(url, {
        method: 'POST',
        body: isFormData ? body : JSON.stringify(body),
        headers: isFormData ? {} : {
            'Content-Type': 'application/json'
        }
    });
}

function updateProgressBar(element, percent) {
    element.style.width = `${percent}%`;
}

function handleUploadSuccess(box, response) {
    box.classList.add('uploaded');
    const slug = response.data.slug;
    const url = `${link(2)}/private/${slug}`;
    box.style.backgroundImage = `url(${url})`;
    box.innerHTML = '';

    fetchFileManagerData({
        folder_id: window.currentFolderId,
        page: 1,
        force: true,
    });
}

function handleUploadError(box) {
    const progressBar = box.querySelector('.nixfile-media-progress');
    if (progressBar) {
        progressBar.style.backgroundColor = 'red';
    }
    setTimeout(() => box.remove(), 5000);
}

export function uploadWithProgress(url, formData, box) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                const progressBar = box.querySelector('.nixfile-media-progress');
                if (progressBar) {
                    updateProgressBar(progressBar, percent);
                }
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    handleUploadSuccess(box, response);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            } else {
                handleUploadError(box);
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            handleUploadError(box);
            reject(new Error('Network error during upload'));
        });

        xhr.open('POST', url);
        xhr.send(formData);
    });
}

export async function wpRestPost(url, data) {
    return makeRequest(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nixfileAjaxData.nonce
        },
        body: JSON.stringify(data)
    });
}