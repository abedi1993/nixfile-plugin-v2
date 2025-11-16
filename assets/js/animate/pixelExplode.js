export async function pixelExplode(element, fragmentCount = 64, distance = 15, duration = 500) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const rows = Math.sqrt(fragmentCount);
    const cols = rows;
    const fragWidth = Math.floor(rect.width / cols);
    const fragHeight = Math.floor(rect.height / rows);

    if (fragWidth === 0 || fragHeight === 0) {
        console.warn('Invalid fragment size');
        element.remove();
        return;
    }

    const fallbackExplode = () => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.top = `${rect.top + window.scrollY}px`;
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;
        container.style.pointerEvents = 'none';
        container.style.zIndex = 9999;
        document.body.appendChild(container);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const fragment = document.createElement('div');
                fragment.style.width = `${fragWidth}px`;
                fragment.style.height = `${fragHeight}px`;
                fragment.style.position = 'absolute';
                fragment.style.left = `${x * fragWidth}px`;
                fragment.style.top = `${y * fragHeight}px`;
                fragment.style.background = window.getComputedStyle(element).backgroundColor || '#ccc';
                container.appendChild(fragment);

                anime({
                    targets: fragment,
                    translateX: anime.random(-distance, distance),
                    translateY: anime.random(-distance, distance),
                    opacity: [1, 0],
                    delay: anime.random(0, 100),
                    duration,
                    easing: 'easeOutQuad',
                    complete: () => fragment.remove()
                });
            }
        }

        element.remove();
    };

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: null,
            useCORS: true,
            scale: 1,
        });

        if (!canvas || canvas.height === 0 || canvas.width === 0) {
            console.warn('Canvas failed or returned empty — using fallback animation');
            fallbackExplode();
            return;
        }

        const fullData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.top = `${rect.top + window.scrollY}px`;
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;
        container.style.pointerEvents = 'none';
        container.style.zIndex = 9999;
        document.body.appendChild(container);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const fragCanvas = document.createElement('canvas');
                fragCanvas.width = fragWidth;
                fragCanvas.height = fragHeight;

                const fragCtx = fragCanvas.getContext('2d');
                fragCtx.putImageData(fullData, -x * fragWidth, -y * fragHeight);

                fragCanvas.style.position = 'absolute';
                fragCanvas.style.left = `${x * fragWidth}px`;
                fragCanvas.style.top = `${y * fragHeight}px`;

                container.appendChild(fragCanvas);
                anime({
                    targets: fragCanvas,
                    translateX: anime.random(-distance, distance),
                    translateY: anime.random(-distance, distance),
                    opacity: [1, 0],
                    delay: anime.random(0, 100),
                    duration,
                    easing: 'easeOutQuad',
                    complete: () => fragCanvas.remove()
                });
            }
        }

        element.remove();
    } catch (err) {
        console.warn('html2canvas failed:', err);
        fallbackExplode();
    }
}
