<?php
namespace NixFileUploader;

use WP_REST_Request;
use WP_REST_Response;
use WP_Post;

defined('ABSPATH') || exit;

enum SettingKey: string
{
    case TOKEN = 'nixfile_uploader_token';
    case EMAIL = 'nixfile_uploader_email';
    case DAILY_BACKUP = 'nixfile_uploader_daily_backup';
    case SHOW_STATUS_NAVBAR = 'nixfile_uploader_show_status_navbar';
    case COMPRESS_UPLOAD = 'nixfile_uploader_compress_upload';
    case COMPRESS_WEBP_UPLOAD = 'nixfile_uploader_compress_webp_upload';
    case AVIF_ON_UPLOAD = 'nixfile_uploader_avif_on_upload';
    case JALALI_CONVERTER = 'nixfile_uploader_jalali_converter';
    case MODERN_TEMPLATE = 'nixfile_uploader_modern_template';
    case EXTERNAL_FEATURED_IMAGE = 'nixfile_uploader_external_featured_image';
    case DEFAULT_EXTERNAL_IMAGE = 'nixfile_uploader_default_external_image';
    case BACKUP_IN_PROGRESS = 'nixfile_backup_in_progress';
}

class Settings
{
    private string $token = '';
    private string $email = '';
    private bool $daily_backup = false;
    private bool $show_status_navbar = false;
    private bool $compress_upload = false;
    private bool $compress_webp_upload = false;
    private bool $avif_on_upload = false;
    private bool $jalali_converter = false;
    private bool $modern_template = false;
    private bool $external_featured_image_enabled = false;
    private string $default_external_image = 'https://bostak1337.ir/wp-content/uploads/2025/10/shakes-image.webp';

    public function __construct()
    {
        $this->loadSettings();
    }

    private function loadSettings(): void
    {
        $this->token = get_option(SettingKey::TOKEN->value, '');
        $this->email = get_option(SettingKey::EMAIL->value, '');
        $this->daily_backup = (bool)get_option(SettingKey::DAILY_BACKUP->value, false);
        $this->show_status_navbar = (bool)get_option(SettingKey::SHOW_STATUS_NAVBAR->value, false);
        $this->compress_upload = (bool)get_option(SettingKey::COMPRESS_UPLOAD->value, false);
        $this->compress_webp_upload = (bool)get_option(SettingKey::COMPRESS_WEBP_UPLOAD->value, false);
        $this->avif_on_upload = (bool)get_option(SettingKey::AVIF_ON_UPLOAD->value, false);
        $this->jalali_converter = (bool)get_option(SettingKey::JALALI_CONVERTER->value, false);
        $this->modern_template = (bool)get_option(SettingKey::MODERN_TEMPLATE->value, false);
        $this->external_featured_image_enabled = (bool)get_option(SettingKey::EXTERNAL_FEATURED_IMAGE->value, false);
        $this->default_external_image = get_option(SettingKey::DEFAULT_EXTERNAL_IMAGE->value, 'https://bostak1337.ir/wp-content/uploads/2025/10/shakes-image.webp');
    }

    public function updateSetting(SettingKey $key, mixed $value): void
    {
        update_option($key->value, $value);

        match ($key) {
            SettingKey::TOKEN => $this->token = $value,
            SettingKey::EMAIL => $this->email = $value,
            SettingKey::DAILY_BACKUP => $this->daily_backup = $value,
            SettingKey::SHOW_STATUS_NAVBAR => $this->show_status_navbar = $value,
            SettingKey::COMPRESS_UPLOAD => $this->compress_upload = $value,
            SettingKey::COMPRESS_WEBP_UPLOAD => $this->compress_webp_upload = $value,
            SettingKey::AVIF_ON_UPLOAD => $this->avif_on_upload = $value,
            SettingKey::JALALI_CONVERTER => $this->jalali_converter = $value,
            SettingKey::MODERN_TEMPLATE => $this->modern_template = $value,
            SettingKey::EXTERNAL_FEATURED_IMAGE => $this->external_featured_image_enabled = $value,
            SettingKey::DEFAULT_EXTERNAL_IMAGE => $this->default_external_image = $value,
        };
    }

    public function getAllSettings(): array
    {
        return [
            'token' => $this->token,
            'email' => $this->email,
            'daily_backup' => $this->daily_backup,
            'show_status_navbar' => $this->show_status_navbar,
            'compress_upload' => $this->compress_upload,
            'compress_webp_upload' => $this->compress_webp_upload,
            'avif_on_upload' => $this->avif_on_upload,
            'jalali_converter' => $this->jalali_converter,
            'modern_template' => $this->modern_template,
            'external_featured_image' => $this->external_featured_image_enabled,
            'default_external_image' => $this->default_external_image,
        ];
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function isDailyBackupEnabled(): bool
    {
        return $this->daily_backup;
    }

    public function isShowStatusNavbarEnabled(): bool
    {
        return $this->show_status_navbar;
    }

    public function isCompressUploadEnabled(): bool
    {
        return $this->compress_upload;
    }

    public function isCompressWebpUploadEnabled(): bool
    {
        return $this->compress_webp_upload;
    }

    public function isAvifOnUploadEnabled(): bool
    {
        return $this->avif_on_upload;
    }

    public function isJalaliConverterEnabled(): bool
    {
        return $this->jalali_converter;
    }

    public function isModernTemplateEnabled(): bool
    {
        return $this->modern_template;
    }

    public function isExternalFeaturedImageEnabled(): bool
    {
        return $this->external_featured_image_enabled;
    }

    public function getDefaultExternalImage(): string
    {
        return $this->default_external_image;
    }
}