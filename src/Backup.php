<?php
namespace NixFileUploader;

use WP_REST_Request;
use WP_REST_Response;
use WP_Post;


class Backup {
    private Settings $settings;
    private string $baseUrl;

    public function __construct(Settings $settings, string $baseUrl) {
        $this->settings = $settings;
        $this->baseUrl = $baseUrl;
    }

    public function init(): void {
        add_action('nixfile_daily_backup_event', [$this, 'performDailyBackup']);
        add_action('nixfile_immediate_backup_event', [$this, 'performDailyBackup']);
    }

    public function isBackupRunning(): bool {
        return get_option(SettingKey::BACKUP_IN_PROGRESS->value, false);
    }

    public function performDailyBackup(): void {
        if (!$this->settings->isDailyBackupEnabled() ||
            empty($this->settings->getToken()) ||
            $this->isBackupRunning()) {
            return;
        }

        update_option(SettingKey::BACKUP_IN_PROGRESS->value, true);

        try {
            $backup_file = $this->createSiteBackup();

            if ($backup_file) {
                $this->uploadBackupToApi($backup_file);
                unlink($backup_file);
            }
        } finally {
            update_option(SettingKey::BACKUP_IN_PROGRESS->value, false);
        }
    }

    private function createSiteBackup(): ?string {
        $backup_dir = get_temp_dir() . 'nixfile_backup_' . time() . '/';
        if (!file_exists($backup_dir)) {
            wp_mkdir_p($backup_dir);
        }

        $backup_file = $backup_dir . 'backup_' . date('Y-m-d_H-i-s') . '.zip';

        global $wpdb;
        $db_backup_file = $backup_dir . 'database.sql';

        $command = "mysqldump --single-transaction -h {$wpdb->dbhost} -u {$wpdb->dbuser} -p{$wpdb->dbpassword} {$wpdb->dbname} > {$db_backup_file}";

        @exec($command, $output, $return_var);

        if ($return_var !== 0) {
            $tables = $wpdb->get_results('SHOW TABLES', ARRAY_N);
            $handle = fopen($db_backup_file, 'w');

            foreach ($tables as $table) {
                $table_name = $table[0];
                $create_table = $wpdb->get_results("SHOW CREATE TABLE `{$table_name}`", ARRAY_A);
                fwrite($handle, "DROP TABLE IF EXISTS `{$table_name}`;\n");
                fwrite($handle, $create_table[0]['Create Table'] . ";\n\n");

                $rows = $wpdb->get_results("SELECT * FROM `{$table_name}`", ARRAY_A);
                foreach ($rows as $row) {
                    $values = array_map(fn($value) => $value === null ? 'NULL' : "'" . $wpdb->_real_escape($value) . "'", $row);
                    fwrite($handle, "INSERT INTO `{$table_name}` VALUES (" . implode(', ', $values) . ");\n");
                }
                fwrite($handle, "\n");
            }

            fclose($handle);
        }

        $zip = new ZipArchive();
        if ($zip->open($backup_file, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            if (file_exists($db_backup_file)) {
                $zip->addFile($db_backup_file, 'database.sql');
            }

            $this->addFolderToZip(WP_CONTENT_DIR, $zip, 'wp-content');
            $zip->close();
        }

        $this->deleteDirectory($backup_dir);

        return $backup_file;
    }

    private function addFolderToZip(string $folder, ZipArchive &$zip, string $zip_folder = ''): void {
        if (!is_dir($folder)) {
            return;
        }

        $files = scandir($folder);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $file_path = $folder . '/' . $file;
            $zip_path = $zip_folder ? $zip_folder . '/' . $file : $file;

            if (is_dir($file_path)) {
                $this->addFolderToZip($file_path, $zip, $zip_path);
            } else {
                $zip->addFile($file_path, $zip_path);
            }
        }
    }

    private function deleteDirectory(string $dir): void {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }

    private function uploadBackupToApi(string $backup_file): bool {
        if (empty($this->settings->getToken())) {
            return false;
        }

        $file_name = basename($backup_file);
        $file_size = filesize($backup_file);

        $file = class_exists('CURLFile')
            ? new \CURLFile($backup_file, 'application/zip', $file_name)
            : '@' . $backup_file;

        $data = [
            'file' => $file,
            'token' => $this->settings->getToken(),
            'type' => 'backup'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v1/upload');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code === 200) {
            $result = json_decode($response, true);
            return isset($result['success']) && $result['success'];
        }

        return false;
    }
}
