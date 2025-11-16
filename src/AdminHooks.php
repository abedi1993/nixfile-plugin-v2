<?php

namespace NixFileUploader;

use NixFileUploader\Settings;

use WP_REST_Request;
use WP_REST_Response;
use WP_Post;

class AdminHooks
{
    private Settings $settings;
    private RestApi $restApi;
    private ExternalFeaturedImage $externalFeaturedImage;
    private JalaliConverter $jalaliConverter;
    private Backup $backupManager;
    private readonly string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = $this->getMediaBaseUrl();
        $this->settings = new Settings();
        $this->restApi = new RestApi($this->settings, $this->baseUrl);
        $this->externalFeaturedImage = new ExternalFeaturedImage($this->settings);
        $this->jalaliConverter = new JalaliConverter($this->settings);
        $this->backupManager = new Backup($this->settings, $this->baseUrl);
    }

    private function getMediaBaseUrl(): string
    {
        return "https://api.nixfile.com";
        $home = home_url();
        $parts = wp_parse_url($home);

        if (empty($parts['host'])) {
            return $home;
        }

        $scheme = $parts['scheme'] ?? 'https';
        $host = 'media.' . $parts['host'];
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        return $scheme . '://' . $host . $port;
    }

    public function registerHooks(): void
    {
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
        add_action('edit_form_after_editor', [$this, 'injectUploaderView']);
        add_action('elementor/editor/after_enqueue_scripts', [$this, 'enqueueAdminAssets']);
        add_action('admin_menu', [$this, 'nixfileUploaderMenu']);
        add_action('rest_api_init', [$this->restApi, 'registerRoutes']);
        add_action('admin_bar_menu', [$this, 'maybeAddAdminBarItem'], 100);

        $this->externalFeaturedImage->init();
        $this->jalaliConverter->init();
        $this->backupManager->init();
    }

    public function nixfileUploaderMenu(): void
    {
        add_submenu_page(
            'upload.php',
            'رسانه نیکس فایل',
            'رسانه نیکس فایل',
            'manage_options',
            'nixfile-file-manager',
            [$this, 'nixfileUploaderV2Page']
        );
    }

    public function nixfileUploaderV2Page(): void
    {
        include plugin_dir_path(__DIR__) . '/views/file-manager.php';
    }

    public function injectUploaderView(): void
    {
    }

    public function enqueueAdminAssets(string $hook): void
    {
        $screen = get_current_screen();

        if (in_array($screen->base, ['media_page_custom-media-submenu'])) {
            $this->enqueueFileManagerAssets();
        } elseif ($screen->base === "media_page_nixfile-file-manager") {
            $this->enqueueFileManagerAssets();
            wp_enqueue_script('anime-js', 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js', [], null, true);
            wp_enqueue_script('html2canvas', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', [], null, true);
        } elseif (in_array($screen->base, ['post', 'page'])) {
            $this->enqueuePostEditorAssets();
        }
    }

    private function enqueueFileManagerAssets(): void
    {
        if ($this->settings->isModernTemplateEnabled()) {
            wp_enqueue_style(
                'modern-file-manager-style',
                plugin_dir_url(__DIR__) . 'assets/css/modern-file-manager.css',
                [],
                time()
            );
        } else {
            wp_enqueue_style(
                'nixfile-uploader-page-style',
                plugin_dir_url(__DIR__) . 'assets/css/nix-file-page.css',
                [],
                time()
            );
        }

        wp_enqueue_script(
            'progressbar-js',
            'https://cdn.jsdelivr.net/npm/progressbar.js@1.1.0/dist/progressbar.min.js',
            [],
            '1.1.0',
            true
        );

        wp_enqueue_script(
            'nixfile-uploader-page-v2-script',
            plugin_dir_url(__DIR__) . 'assets/js/nix-file-page-v2.js',
            ['jquery', 'progressbar-js'],
            time(),
            true
        );

        $this->localizeScript('nixfile-uploader-page-v2-script');

        add_filter('script_loader_tag', fn($tag, $handle, $src) => ($handle === 'nixfile-uploader-page-v2-script')
            ? '<script type="module" src="' . esc_url($src) . '"></script>'
            : $tag,
            10, 3
        );
    }

    private function enqueuePostEditorAssets(): void
    {
        wp_enqueue_style(
            'nixfile-uploader-admin-style',
            plugin_dir_url(__DIR__) . 'assets/css/admin.css',
            [],
            time()
        );

        include plugin_dir_path(__DIR__) . 'views/uploader.php';

        wp_enqueue_script(
            'nixfile-uploader-admin-script',
            plugin_dir_url(__DIR__) . 'assets/js/admin.js',
            ['jquery'],
            time(),
            true
        );

        $this->localizeScript('nixfile-uploader-admin-script');
    }

    private function localizeScript(string $handle): void
    {
        wp_localize_script($handle, 'nixfile_ajax_data', [
            'rest_url' => rest_url('nixfile/v1/'),
            "url" => $this->baseUrl,
            "home" => "https://media." . parse_url(home_url(), PHP_URL_HOST),
            'nonce' => wp_create_nonce('wp_rest'),
            'current_settings' => $this->settings->getAllSettings(),
            'action' => [
                'token' => 'token',
                'email' => 'email',
                'daily_backup' => 'daily-backup',
                'show_status_navbar' => 'show-status-navbar',
                'compress_upload' => 'compress-upload',
                'compress_webp_upload' => 'compress-webp-upload',
                'avif_on_upload' => 'avif-upload',
                'jalali_converter' => 'jalali-converter',
                'modern_template' => 'modern-template',
                'external_featured_image' => 'external-featured-image',
                'all_settings' => 'settings',
            ],
            'images_url' => plugin_dir_url(__DIR__) . 'assets/images/',
        ]);
    }

    public function maybeAddAdminBarItem(): void
    {
        if (!is_admin_bar_showing() || !$this->settings->isShowStatusNavbarEnabled()) {
            return;
        }

        $response = wp_remote_get($this->baseUrl . "/v1/upload-stats/?domain_id={$this->settings->getToken()}", [
            'headers' => ['Accept' => 'application/json'],
            'timeout' => 5,
        ]);

        if (is_wp_error($response)) {
            $title = '❌ ابتدا دامنه خود را در نیکس فایل احراز کنید';
        } else {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['data']['uploaded'], $body['data']['capacity']) && $body['data']['capacity'] > 0) {
                $percent = intval(number_format((float)(($body['data']['uploaded'] * 100) / $body['data']['capacity']), 2));
                $duration = isset($body['data']['duration']) ? (int)$body['data']['duration'] : null;
                $title = " حجم مصرفی: {$percent}%" . " | ";
                if (!is_null($duration)) {
                    $title .= "انقضا: {$duration} روز";
                }
            } else {
                $title = 'ثبت دامنه در نیکس فایل';
            }
        }

        global $wp_admin_bar;

        $wp_admin_bar->add_node([
            'id' => 'nixfile_status_bar',
            'title' => $title,
            'href' => admin_url('uploader.php?page=nixfile-file-manager'),
            'style' => 'border: 1px solid red; padding: 3px 6px; border-radius: 5px; display: inline-block;',
            'meta' => [
                'class' => 'nixfile-status-item',
                'html' => '',
                'title' => 'وضعیت آپلود',
                'style' => 'border: 1px solid red; padding: 3px 6px; border-radius: 5px; display: inline-block;',
            ]
        ]);
    }
}