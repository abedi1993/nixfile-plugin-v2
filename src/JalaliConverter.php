<?php

namespace NixFileUploader;

use WP_REST_Request;
use WP_REST_Response;
use WP_Post;

class JalaliConverter
{
    private Settings $settings;

    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
    }

    public function init(): void
    {
        if (!$this->settings->isJalaliConverterEnabled()) {
            return;
        }

        add_filter('get_the_date', [$this, 'convertToJalali'], 10, 3);
        add_filter('get_the_time', [$this, 'convertToJalali'], 10, 3);
        add_filter('get_comment_date', [$this, 'convertToJalali'], 10, 3);
        //add_filter('get_post_time', [$this, 'convertToJalali'], 10, 3);
    }

    public function convertToJalali($date, $format = '', $timestamp = null, $gmt = false): string
    {
        if (!$this->settings->isJalaliConverterEnabled()) {
            return is_string($date) ? $date : '';
        }
        if ($format === 'U' || $format === 'G') {
            return $date;
        }
        if (is_numeric($date)) {
            return $date;
        }
        if (is_numeric($timestamp)) {
            return $date;
        }
        if ($date instanceof \WP_Post || is_object($date)) {
            return '';
        }
        if (!is_string($date)) {
            $date = (string)$date;
        }
        if ($timestamp instanceof \WP_Post) {
            $timestamp = strtotime($timestamp->post_date_gmt ?: $timestamp->post_date);
        }
        $parsed = strtotime($date);
        if ($parsed !== false) {
            $timestamp = $parsed;
        }
        if (!is_int($timestamp)) {
            return $date;
        }
        $persian_months = [
            'ژانویه' => 'January', 'فوریه' => 'February', 'مارس' => 'March', 'آوریل' => 'April',
            'مه' => 'May', 'می' => 'May', 'ژوئن' => 'June', 'ژوئیه' => 'July', 'جولای' => 'July',
            'اوت' => 'August', 'سپتامبر' => 'September', 'اکتبر' => 'October', 'نوامبر' => 'November',
            'دسامبر' => 'December',
        ];
        foreach ($persian_months as $fa => $en) {
            if (strpos($date, $fa) !== false) {
                $date = str_replace($fa, $en, $date);
                break;
            }
        }
        try {
            if (class_exists('Morilog\\Jalali\\Jalalian')) {
                return \Morilog\Jalali\Jalalian::forge($timestamp)->format('%A، %d %B %Y');
            }
            return $this->simpleJalaliConversion($timestamp);
        } catch (\Throwable $e) {
            return $date;
        }
    }


    private function simpleJalaliConversion(int $timestamp): string
    {
        $g_d = date('j', $timestamp);
        $g_m = date('n', $timestamp);
        $g_y = date('Y', $timestamp);

        $g_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
        $j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

        $gy = $g_y - 1600;
        $gm = $g_m - 1;
        $gd = $g_d - 1;

        $g_day_no = 365 * $gy + intval(($gy + 3) / 4) - intval(($gy + 99) / 100) + intval(($gy + 399) / 400);

        for ($i = 0; $i < $gm; ++$i) {
            $g_day_no += $g_days_in_month[$i];
        }

        $g_day_no += $gd;

        $j_day_no = $g_day_no - 79;

        $j_np = intval($j_day_no / 12053);
        $j_day_no %= 12053;

        $jy = 979 + 33 * $j_np + 4 * intval($j_day_no / 1461);
        $j_day_no %= 1461;

        if ($j_day_no >= 366) {
            $jy += intval(($j_day_no - 1) / 365);
            $j_day_no = ($j_day_no - 1) % 365;
        }

        for ($i = 0; $i < 11 && $j_day_no >= $j_days_in_month[$i]; ++$i) {
            $j_day_no -= $j_days_in_month[$i];
        }

        $jm = $i + 1;
        $jd = $j_day_no + 1;

        $j_month_name = [
            '',
            'فروردین',
            'اردیبهشت',
            'خرداد',
            'تیر',
            'مرداد',
            'شهریور',
            'مهر',
            'آبان',
            'آذر',
            'دی',
            'بهمن',
            'اسفند'
        ];
        $j_day_name = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
        $day_of_week = date('w', $timestamp);

        return $j_day_name[$day_of_week] . '، ' . $jd . ' ' . $j_month_name[$jm] . ' ' . $jy;
    }
}
