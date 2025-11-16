<?php

namespace NixFileUploader;

use WP_REST_Request;
use WP_REST_Response;
use WP_Post;

class ExternalFeaturedImage
{
    private Settings $settings;
    private int $current_post_id = 0;

    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
    }

    public function init(): void
    {
        if (!$this->settings->isExternalFeaturedImageEnabled()) {
            return;
        }

        add_action('add_meta_boxes', [$this, 'addMetaBox']);
        add_action('save_post', [$this, 'saveExternalUrl']);
        add_filter('post_thumbnail_html', [$this, 'replaceFeaturedImage'], 10, 5);
        add_filter('get_post_metadata', [$this, 'fakeThumbnailId'], 10, 4);
        add_filter('wp_get_attachment_image_src', [$this, 'fakeAttachmentImageSrc'], 10, 4);
        add_filter('wp_get_attachment_image_attributes', [$this, 'fakeAttachmentImageAttributes'], 10, 3);
        add_action('wp_head', [$this, 'addSocialMediaMetaTags'], 5);
        add_filter('rank_math/opengraph/facebook/image', [$this, 'rankMathImageOverride']);
        add_filter('rank_math/opengraph/twitter/image', [$this, 'rankMathImageOverride']);
        add_filter('wpseo_opengraph_image', [$this, 'yoastSeoImageOverride']);
        add_filter('wpseo_twitter_image', [$this, 'yoastSeoImageOverride']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueScript']);
        add_action('rest_api_init', [$this, 'addToRestApi']);
        add_action('the_post', [$this, 'trackCurrentPost']);
    }

    public function trackCurrentPost(WP_Post $post): void
    {
        $this->current_post_id = $post->ID;
    }

    public function addToRestApi(): void
    {
        register_rest_field(
                ['post', 'page'],
                'external_featured_image',
                [
                        'get_callback' => [$this, 'getForRest'],
                        'update_callback' => null,
                        'schema' => [
                                'description' => __('External featured image URL', 'nixfile-uploader'),
                                'type' => 'string',
                                'format' => 'uri',
                        ],
                ]
        );
    }

    public function getForRest(array $post): ?string
    {
        if (!$this->settings->isExternalFeaturedImageEnabled()) {
            return null;
        }

        $external_url = get_post_meta($post['id'], '_external_featured_image_url', true);
        return $external_url ?: null;
    }

    public function addMetaBox(): void
    {
        add_meta_box(
                'external_featured_image',
                __('تصویر شاخص خارجی', 'nixfile-uploader'),
                [$this, 'renderMetaBox'],
                ['post', 'page'],
                'side',
                'low'
        );
    }

    public function renderMetaBox(WP_Post $post): void
    {
        $external_url = get_post_meta($post->ID, '_external_featured_image_url', true);

        if (empty($external_url)) {
            $external_url = $this->settings->getDefaultExternalImage();
        }
        ?>
        <div class="external-featured-image-wrapper">
            <p>
                <label for="external_featured_image_url"><?php _e('آدرس تصویر خارجی', 'nixfile-uploader'); ?></label>
            </p>
            <input type="url" id="external_featured_image_url" name="external_featured_image_url"
                   value="<?php echo esc_attr($external_url); ?>"
                   placeholder="https://example.com/image.jpg"
                   style="width: 100%; margin-bottom: 10px;"/>
            <div id="external-image-preview"
                 style="display: <?php echo !empty($external_url) ? 'block' : 'none'; ?>; border: 1px solid #ddd; padding: 8px; border-radius: 4px; background: #f9f9f9;">
                <img src="<?php echo esc_url($external_url); ?>" alt="<?php _e('پیش‌نمایش', 'nixfile-uploader'); ?>"
                     style="max-width: 100%; height: auto; display: block;"/>
            </div>
            <p class="description"><?php _e('آدرس تصویر خارجی را برای استفاده به عنوان تصویر شاخص وارد کنید.', 'nixfile-uploader'); ?></p>
        </div>
        <?php
    }

    public function saveExternalUrl(int $post_id): void
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ||
                wp_is_post_revision($post_id) ||
                !current_user_can('edit_post', $post_id)) {
            return;
        }

        $url = sanitize_text_field($_POST['external_featured_image_url'] ?? '');

        if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
            update_post_meta($post_id, '_external_featured_image_url', esc_url_raw($url));
        } else {
            delete_post_meta($post_id, '_external_featured_image_url');
        }
    }

    public function enqueueScript(string $hook): void
    {
        if (!in_array($hook, ['post.php', 'post-new.php'])) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || !in_array($screen->base, ['post', 'page'])) {
            return;
        }

        $script = <<<JS
        (function($) {
            $(document).ready(function() {
                var input = $('#external_featured_image_url');
                var preview = $('#external-image-preview');
                var previewImg = preview.find('img');
                
                function updatePreview() {
                    var url = input.val().trim();
                    if (url) {
                        previewImg.attr('src', url);
                        preview.show();
                    } else {
                        preview.hide();
                    }
                }

                input.on('input', updatePreview);
                updatePreview();
            });
        })(jQuery);
        JS;

        wp_add_inline_script('jquery', $script);
    }

    public function replaceFeaturedImage(string $html, int $post_id, int $post_thumbnail_id, string|array $size, array $attr): string
    {
        if (!$this->settings->isExternalFeaturedImageEnabled()) {
            return $html;
        }

        $external_url = get_post_meta($post_id, '_external_featured_image_url', true);

        if (empty($external_url)) {
            return $html;
        }

        $dimensions = $this->getImageDimensions($size);

        $default_attr = [
                'class' => 'attachment-' . $size . ' size-' . $size . ' external-featured-image wp-post-image',
                'alt' => get_the_title($post_id),
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
        ];

        $attr = wp_parse_args($attr, $default_attr);

        return sprintf(
                '<img src="%s"%s />',
                esc_url($external_url),
                $this->getAttrHtml($attr)
        );
    }

    private function getImageDimensions(string|array $size): array
    {
        global $_wp_additional_image_sizes;

        $width = 0;
        $height = 0;

        if (is_array($size)) {
            $width = $size[0];
            $height = $size[1];
        } elseif (in_array($size, ['thumbnail', 'medium', 'large'])) {
            $width = get_option($size . '_size_w');
            $height = get_option($size . '_size_h');
        } elseif (isset($_wp_additional_image_sizes[$size])) {
            $width = $_wp_additional_image_sizes[$size]['width'];
            $height = $_wp_additional_image_sizes[$size]['height'];
        }

        return ['width' => $width, 'height' => $height];
    }

    private function getAttrHtml(array $attr): string
    {
        $html = '';
        foreach ($attr as $name => $value) {
            $html .= ' ' . esc_attr($name) . '="' . esc_attr($value) . '"';
        }
        return $html;
    }

    public function fakeThumbnailId(mixed $value, int $object_id, string $meta_key, bool $single): mixed
    {
        if (!$this->settings->isExternalFeaturedImageEnabled() || $meta_key !== '_thumbnail_id') {
            return $value;
        }

        $external_url = get_post_meta($object_id, '_external_featured_image_url', true);
        if (!empty($external_url)) {
            return $single ? -1 : [-1];
        }

        return $value;
    }

    public function fakeAttachmentImageSrc(array|false $image, int $attachment_id, string|array $size, bool $icon): array|false
    {
        if (!$this->settings->isExternalFeaturedImageEnabled() || $attachment_id !== -1) {
            return $image;
        }

        if (empty($this->current_post_id)) {
            return $image;
        }

        $external_url = get_post_meta($this->current_post_id, '_external_featured_image_url', true);
        if (!empty($external_url)) {
            $dimensions = $this->getImageDimensions($size);
            return [$external_url, $dimensions['width'], $dimensions['height'], false];
        }

        return $image;
    }

    public function fakeAttachmentImageAttributes(array $attr, ?WP_Post $attachment, string|array $size): array
    {
        if (
                !$this->settings->isExternalFeaturedImageEnabled() ||
                !$attachment ||
                $attachment->ID !== -1
        ) {
            return $attr;
        }

        if (empty($this->current_post_id)) {
            return $attr;
        }

        $external_url = get_post_meta($this->current_post_id, '_external_featured_image_url', true);
        if (!empty($external_url)) {
            $attr['src'] = $external_url;
            $attr['class'] .= ' external-featured-image';
        }

        return $attr;
    }

    public function addSocialMediaMetaTags(): void
    {
        if (!is_singular() || !$this->settings->isExternalFeaturedImageEnabled()) {
            return;
        }

        $post_id = get_queried_object_id();
        $external_url = get_post_meta($post_id, '_external_featured_image_url', true);

        if (!empty($external_url)) {
            echo '<meta property="og:image" content="' . esc_url($external_url) . '" />' . "\n";
            echo '<meta name="twitter:image" content="' . esc_url($external_url) . '" />' . "\n";
            echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
        }
    }

    public function rankMathImageOverride(string $image): string
    {
        if (!is_singular() || !$this->settings->isExternalFeaturedImageEnabled()) {
            return $image;
        }

        $post_id = get_queried_object_id();
        $external_url = get_post_meta($post_id, '_external_featured_image_url', true);

        return !empty($external_url) ? $external_url : $image;
    }

    public function yoastSeoImageOverride(string $image): string
    {
        if (!is_singular() || !$this->settings->isExternalFeaturedImageEnabled()) {
            return $image;
        }

        $post_id = get_queried_object_id();
        $external_url = get_post_meta($post_id, '_external_featured_image_url', true);

        return !empty($external_url) ? $external_url : $image;
    }
}
