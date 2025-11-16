import { fetchFileManagerData } from "./fetchFileManagerData.js";

export function setupInfiniteScrollObserver(element) {
    const domElement = element instanceof jQuery ? element[0] : element;
    if (!domElement || !(domElement instanceof Element)) {
        console.error("Invalid element for observer");
        return;
    }
    if (window.nixfileMediaPage >= window.nixfileMediaLastPage || window.nixfileMediaReachedEnd) return;
    const observer = new IntersectionObserver(async (entries, obs) => {
        const entry = entries[0];
        if (entry.isIntersecting && !window.nixfileMediaLoading) {
            obs.unobserve(entry.target);
            window.nixfileMediaPage++;
            const response = await fetchFileManagerData({
                page: window.nixfileMediaPage,
                folder_id: window.currentFolderId,
                append: true
            });
            const items = document.querySelectorAll(".nixfile-media-box");
            const lastItem = items[items.length - 1];
            if (lastItem) {
                setupInfiniteScrollObserver(lastItem);
            }
        }
    }, {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    });

    observer.observe(domElement);
}
