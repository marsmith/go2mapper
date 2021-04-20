<?php
//Created 04/06/2021 by Martyn Smith USGS NY WSC
//This file should be copied to an internal-only natweb location
//Its function is to pass through the entire SPOT API feed when requested from within the USGS Network

//stash $token in config file
include('config.php');
$jsonurl = "https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/".$feedID."/latest.json?feedPassword=".$feedPassword;
$json = file_get_contents($jsonurl);
//print_r($json);
$result = json_decode($json, true);

$output = $result["response"]["feedMessageResponse"]["messages"]["message"];
echo json_encode($output);
?>