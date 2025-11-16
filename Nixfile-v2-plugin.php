<?php
/**
 * Plugin Name: آپلود فایل نیکس‌فایل
 * Description: فایل های شما را به صورت مستقیم، سریع و امن در فضای ابری نیکس‌ فایل ذخیره می ‌کند. (امنیت بالا، سرعت انتقال و کاربری آسان از ویژگی‌های کلیدی این ابزار است)
 * Version: 2.0.0
 * Author: نیکس فایل
 * Text Domain: nixfile-uploader
 * Plugin URI: https://www.nixfile.com
 * Author URI: https://www.nixfile.com
 * Requires PHP: 8.3
 */

declare(strict_types=1);

namespace NixFileUploader;

defined('ABSPATH') || exit;

define('NixFileUploader\VERSION', '2.0.0');
define('NixFileUploader\PLUGIN_DIR', plugin_dir_path(__FILE__));
define('NixFileUploader\PLUGIN_URL', plugin_dir_url(__FILE__));

require_once PLUGIN_DIR . 'src/Settings.php';
require_once PLUGIN_DIR . 'src/ExternalFeaturedImage.php';
require_once PLUGIN_DIR . 'src/JalaliConverter.php';
require_once PLUGIN_DIR . 'src/RestApi.php';
require_once PLUGIN_DIR . 'src/Backup.php';
require_once PLUGIN_DIR . 'src/AdminHooks.php';


enum HookName: string
{
    case DAILY_BACKUP = 'nixfile_daily_backup_event';
    case IMMEDIATE_BACKUP = 'nixfile_immediate_backup_event';
}

final class Plugin
{
    public readonly string $pluginFile;
    private readonly AdminHooks $adminHooks;

    public function __construct(string $pluginFile = __FILE__)
    {
        $this->pluginFile = $pluginFile;
        $this->adminHooks = new AdminHooks();
    }

    public function init(): void
    {
        $this->adminHooks->registerHooks();
        $this->registerPluginHooks();
    }

    private function registerPluginHooks(): void
    {
        add_filter('plugin_action_links_' . plugin_basename($this->pluginFile), $this->addPluginActionLinks(...));
        register_activation_hook($this->pluginFile, $this->activate(...));
        register_deactivation_hook($this->pluginFile, $this->deactivate(...));
    }

    private function addPluginActionLinks(array $links): array
    {
        $settingsLink = sprintf(
            '<a href="%1$s">%2$s</a>',
            admin_url('uploader.php?page=nixfile-file-manager'),
            esc_html__('Settings', 'nixfile-uploader')
        );
        array_unshift($links, $settingsLink);

        $goProText = esc_html__("خرید سرویس", 'nixfile-uploader');
        $links['go_pro'] = sprintf(
            '<a href="%1$s" target="_blank" class="elementor-plugins-gopro">%2$s</a>',
            'https://nixfile.com/',
            $goProText
        );

        return $links;
    }

    private function activate(): void
    {
        if (get_option('nixfile_uploader_daily_backup', false)) {
            if (!wp_next_scheduled(HookName::DAILY_BACKUP->value)) {
                wp_schedule_event(time(), 'daily', HookName::DAILY_BACKUP->value);
            }
            wp_schedule_single_event(time(), HookName::IMMEDIATE_BACKUP->value);
        }
    }

    private function deactivate(): void
    {
        $this->unscheduleEvent(HookName::DAILY_BACKUP->value);
        $this->unscheduleEvent(HookName::IMMEDIATE_BACKUP->value);
    }

    private function unscheduleEvent(string $hookName): void
    {
        $timestamp = wp_next_scheduled($hookName);
        if ($timestamp) {
            wp_unschedule_event($timestamp, $hookName);
        }
    }
}

add_action('plugins_loaded', fn() => (new Plugin())->init());