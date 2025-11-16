<?php
namespace NixFileUploader;

use WP_REST_Request;
use WP_REST_Response;
use WP_Post;


class RestApi {
    private Settings $settings;
    private string $baseUrl;

    public function __construct(Settings $settings, string $baseUrl) {
        $this->settings = $settings;
        $this->baseUrl = $baseUrl;
    }

    public function registerRoutes(): void {
        $namespace = 'nixfile/v1';

        register_rest_route($namespace, '/token', [
            'methods' => 'POST',
            'callback' => [$this, 'setToken'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'token' => [
                    'required' => true,
                    'type' => 'string',
                    'validate_callback' => fn($param) => !empty(trim($param)),
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        register_rest_route($namespace, '/email', [
            'methods' => 'POST',
            'callback' => [$this, 'storeEmail'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'email' => [
                    'required' => true,
                    'type' => 'string',
                    'validate_callback' => fn($param) => is_email($param),
                    'sanitize_callback' => 'sanitize_email',
                ],
            ],
        ]);

        register_rest_route($namespace, '/daily-backup', [
            'methods' => 'POST',
            'callback' => [$this, 'setDailyBackup'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'daily_backup' => [
                    'required' => true,
                    'type' => 'boolean',
                    'validate_callback' => fn($param) => is_bool($param),
                ],
            ],
        ]);

        register_rest_route($namespace, '/show-status-navbar', [
            'methods' => 'POST',
            'callback' => [$this, 'setShowStatusNavbar'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [],
        ]);

        register_rest_route($namespace, '/compress-upload', [
            'methods' => 'POST',
            'callback' => [$this, 'setCompressUpload'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [],
        ]);

        register_rest_route($namespace, '/compress-webp-upload', [
            'methods' => 'POST',
            'callback' => [$this, 'setCompressWebpUpload'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'compress_webp_upload' => [
                    'required' => true,
                    'type' => 'boolean',
                    'validate_callback' => fn($param) => is_bool($param),
                ],
            ],
        ]);

        register_rest_route($namespace, '/avif-upload', [
            'methods' => 'POST',
            'callback' => [$this, 'setAvifUpload'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [],
        ]);

        register_rest_route($namespace, '/jalali-converter', [
            'methods' => 'POST',
            'callback' => [$this, 'setJalaliConverter'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [],
        ]);

        register_rest_route($namespace, '/modern-template', [
            'methods' => 'POST',
            'callback' => [$this, 'setModernTemplate'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [],
        ]);

        register_rest_route($namespace, '/external-featured-image', [
            'methods' => 'POST',
            'callback' => [$this, 'setExternalFeaturedImage'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [],
        ]);

        register_rest_route($namespace, '/settings', [
            'methods' => 'GET',
            'callback' => [$this, 'getAllSettings'],
            'permission_callback' => [$this, 'checkPermission'],
        ]);

        register_rest_route($namespace, '/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'updateMultipleSettings'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'token' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'email' => [
                    'type' => 'string',
                    'validate_callback' => fn($param) => empty($param) || is_email($param),
                    'sanitize_callback' => 'sanitize_email',
                ],
                'daily_backup' => ['type' => 'boolean'],
                'show_status_navbar' => ['type' => 'boolean'],
                'compress_upload' => ['type' => 'boolean'],
                'compress_webp_upload' => ['type' => 'boolean'],
                'jalali_converter' => ['type' => 'boolean'],
                'modern_template' => ['type' => 'boolean'],
                'external_featured_image' => ['type' => 'boolean'],
                'default_external_image' => [
                    'type' => 'string',
                    'sanitize_callback' => 'esc_url_raw',
                ],
            ],
        ]);
    }

    public function checkPermission(): bool {
        return current_user_can('manage_options');
    }

    public function setToken(WP_REST_Request $request): WP_REST_Response {
        $token = $request->get_param('token');
        $this->settings->updateSetting(SettingKey::TOKEN, $token);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Token set successfully.', 'nixfile-uploader'),
            'data' => ['token' => $token]
        ], 200);
    }

    public function storeEmail(WP_REST_Request $request): WP_REST_Response {
        $email = $request->get_param('email');
        $this->settings->updateSetting(SettingKey::EMAIL, $email);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Email stored successfully.', 'nixfile-uploader'),
            'data' => ['email' => $email]
        ], 200);
    }

    public function setDailyBackup(WP_REST_Request $request): WP_REST_Response {
        $daily_backup = $request->get_param('daily_backup');
        $previous_state = $this->settings->isDailyBackupEnabled();

        $this->settings->updateSetting(SettingKey::DAILY_BACKUP, $daily_backup);

        if ($daily_backup) {
            $this->scheduleDailyBackup();

            if (!$previous_state) {
                wp_schedule_single_event(time(), 'nixfile_immediate_backup_event');
            }
        } else {
            $this->unscheduleDailyBackup();
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Daily backup setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'daily_backup' => $daily_backup,
                'immediate_backup' => $daily_backup && !$previous_state
            ]
        ], 200);
    }

    public function setShowStatusNavbar(WP_REST_Request $request): WP_REST_Response {
        $status = $this->settings->isShowStatusNavbarEnabled();
        $this->settings->updateSetting(SettingKey::SHOW_STATUS_NAVBAR, !$status);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Show status navbar setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'show_status_navbar' => !$status
            ]
        ], 200);
    }

    public function setCompressUpload(WP_REST_Request $request): WP_REST_Response {
        $compress = $this->settings->isCompressUploadEnabled();
        $this->settings->updateSetting(SettingKey::COMPRESS_UPLOAD, !$compress);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Compress upload setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'compress_upload' => !$compress
            ]
        ], 200);
    }

    public function setCompressWebpUpload(WP_REST_Request $request): WP_REST_Response {
        $compress_webp = $request->get_param('compress_webp_upload');
        $this->settings->updateSetting(SettingKey::COMPRESS_WEBP_UPLOAD, $compress_webp);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Compress WebP upload setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'compress_webp_upload' => $compress_webp
            ]
        ], 200);
    }

    public function setAvifUpload(WP_REST_Request $request): WP_REST_Response {
        $avif = $this->settings->isAvifOnUploadEnabled();
        $this->settings->updateSetting(SettingKey::AVIF_ON_UPLOAD, !$avif);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Avif upload setting updated successfully.', 'nixfile-uploader'),
            'data' => []
        ], 200);
    }

    public function setJalaliConverter(WP_REST_Request $request): WP_REST_Response {
        $jalali = $this->settings->isJalaliConverterEnabled();
        $this->settings->updateSetting(SettingKey::JALALI_CONVERTER, !$jalali);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Jalali converter setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'jalali_converter' => !$jalali
            ]
        ], 200);
    }

    public function setModernTemplate(WP_REST_Request $request): WP_REST_Response {
        $modern = $this->settings->isModernTemplateEnabled();
        $this->settings->updateSetting(SettingKey::MODERN_TEMPLATE, !$modern);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Modern template setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'modern_template' => !$modern
            ]
        ], 200);
    }

    public function setExternalFeaturedImage(WP_REST_Request $request): WP_REST_Response {
        $external = $this->settings->isExternalFeaturedImageEnabled();
        $this->settings->updateSetting(SettingKey::EXTERNAL_FEATURED_IMAGE, !$external);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('External featured image setting updated successfully.', 'nixfile-uploader'),
            'data' => [
                'external_featured_image' => !$external
            ]
        ], 200);
    }

    public function getAllSettings(WP_REST_Request $request): WP_REST_Response {
        return new WP_REST_Response([
            'success' => true,
            'data' => $this->settings->getAllSettings()
        ], 200);
    }

    public function updateMultipleSettings(WP_REST_Request $request): WP_REST_Response {
        $updated_settings = [];

        if ($request->has_param('token')) {
            $token = $request->get_param('token');
            if (!empty(trim($token))) {
                $this->settings->updateSetting(SettingKey::TOKEN, $token);
                $updated_settings['token'] = $token;
            }
        }

        if ($request->has_param('email')) {
            $email = $request->get_param('email');
            if (is_email($email)) {
                $this->settings->updateSetting(SettingKey::EMAIL, $email);
                $updated_settings['email'] = $email;
            }
        }

        $boolean_settings = [
            'daily_backup' => SettingKey::DAILY_BACKUP,
            'show_status_navbar' => SettingKey::SHOW_STATUS_NAVBAR,
            'compress_upload' => SettingKey::COMPRESS_UPLOAD,
            'compress_webp_upload' => SettingKey::COMPRESS_WEBP_UPLOAD,
            'jalali_converter' => SettingKey::JALALI_CONVERTER,
            'modern_template' => SettingKey::MODERN_TEMPLATE,
            'external_featured_image' => SettingKey::EXTERNAL_FEATURED_IMAGE,
        ];

        foreach ($boolean_settings as $param_name => $setting_key) {
            if ($request->has_param($param_name)) {
                $value = $request->get_param($param_name);
                $this->settings->updateSetting($setting_key, $value);
                $updated_settings[$param_name] = $value;
            }
        }

        if ($request->has_param('default_external_image')) {
            $default_image = $request->get_param('default_external_image');
            if (!empty($default_image) && filter_var($default_image, FILTER_VALIDATE_URL)) {
                $this->settings->updateSetting(SettingKey::DEFAULT_EXTERNAL_IMAGE, $default_image);
                $updated_settings['default_external_image'] = $default_image;
            }
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Settings updated successfully.', 'nixfile-uploader'),
            'data' => [
                'updated_settings' => $updated_settings,
                'all_settings' => $this->settings->getAllSettings()
            ]
        ], 200);
    }

    private function scheduleDailyBackup(): void {
        if (!wp_next_scheduled('nixfile_daily_backup_event')) {
            wp_schedule_event(time(), 'daily', 'nixfile_daily_backup_event');
        }
    }

    private function unscheduleDailyBackup(): void {
        $timestamp = wp_next_scheduled('nixfile_daily_backup_event');
        if ($timestamp) {
            wp_unschedule_event($timestamp, 'nixfile_daily_backup_event');
        }
    }
}
