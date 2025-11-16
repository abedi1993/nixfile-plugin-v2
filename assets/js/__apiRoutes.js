const api = {
    url: nixfile_ajax_data.url,
    version: ["v1", "v2"]
}

export function link($version = 1) {
    return `${api.url}/${api.version[$version - 1]}`
}