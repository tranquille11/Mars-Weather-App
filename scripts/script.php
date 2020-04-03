<?php

declare(strict_types=1);
session_start();

$API_KEY = 'DEMO_KEY';
$URL = "https://api.nasa.gov/insight_weather/?api_key=$API_KEY&feedtype=json&ver=1.0";

// options must be associative array    ->    key = option, value = option value;

function getMarsWeather(string $url, array $options = null)
{
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    if (!is_null($options)) {
        foreach ($options as $option => $value) {
            curl_setopt($curl, $option, $value);
        }
    }

    $output = json_decode(curl_exec($curl));
    $sols = $output->sol_keys;

    $result = [];

    foreach ($output as $k => $sol) {
        if (in_array($k, $sols)) {
            $result[$k]['max_temp'] = round($sol->AT->mx);
            $result[$k]['min_temp'] = round($sol->AT->mn);
            $result[$k]['wind_speed'] = round($sol->HWS->av, 2);
            $result[$k]['wind_dir_deg'] = $sol->WD->most_common->compass_degrees;
            $result[$k]['wind_dir_card'] = $sol->WD->most_common->compass_point;
            $result[$k]['date'] = date('F d', strtotime($sol->First_UTC));
        }
    }

    curl_close($curl);

    return $result;
}

function getSolData(string $sol, string $metric = 'true')
{

    if ($metric === 'true') {
        return json_encode($_SESSION['weather'][$sol]);
    }

    $arr = [];

    foreach ($_SESSION['weather'] as $day => $val) {
        foreach ($val as $k => $v) {
            if ($day == $sol) {
                if ($k == 'wind_speed') {
                    $v = round(floatval($v) / 1.609, 2);
                } elseif ($k == 'max_temp' || $k == 'min_temp') {
                    $v = round((intval($v) - 32) * (5 / 9));
                }
                $arr[$k] = $v;
            }
        }

    }

    return json_encode($arr);
}


if (isset($_GET['doc'])) {
    $weather = getMarsWeather($URL);
    $_SESSION['weather'] = $weather;
    echo json_encode($weather);
}

if (isset($_GET['metric'])) {
    if ($_GET['metric'] === 'true') {
        echo getSolData($_GET['sol']);

    } else {
        echo getSolData($_GET['sol'], $_GET['metric']);
    }
}






