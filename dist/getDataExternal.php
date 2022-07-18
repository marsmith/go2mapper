<?php
//Created 04/06/2021 by Martyn Smith USGS NY WSC
//This file should be copied to a public face natweb location (same path as main web page)
//Its function is to strip PII from the SPOT API feed response

//stash $token in config file
include('config.php');
$jsonurl = "https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/".$feedID."/latest.json?feedPassword=".$feedPassword;
$json = file_get_contents($jsonurl);
//print_r($json);
$result = json_decode($json, true);

$messages = [];

//DEBUG THIS - for some reason we dont get a list if there is only one message
if (count($result["response"]["feedMessageResponse"]["messages"]["message"]) == 1) {
	//echo "count is 1";
	array_push($messages, $result["response"]["feedMessageResponse"]["messages"]);
}
else {
	//echo "count is NOT 1";
	$messages = $result["response"]["feedMessageResponse"]["messages"]["message"];
}

$output = [];

if (count($messages) > 0) {
	foreach($messages as $message) {

		$new_message = (object)[];
		$new_message->id = $message["id"];
		$new_message->messengerId = $message["messengerId"];
		$new_message->dateTime = $message["dateTime"];
		$new_message->latitude = $message["latitude"];
		$new_message->longitude = $message["longitude"];
		$new_message->batteryState = $message["batteryState"];
		$new_message->messageType = $message["messageType"];

		//strip out message content
		$new_message->messageContent = "n/a";

		//strip out name
		$group = explode("_", $message["messengerName"]);
		$new_message->messengerName = $group[0]."_".$group[1];
	
		array_push($output, $new_message);

	}
}
echo json_encode($output);
?>