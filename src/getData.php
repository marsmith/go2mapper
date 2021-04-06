<?php
//Created 04/06/2021 by Martyn Smith USGS NY WSC
//The purpose of this file is to strip PII from the SPOT API feed response

//stash $token in config file
include('config.php');
$jsonurl = "https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/".$token."/latest.json";
$json = file_get_contents($jsonurl);
$result = json_decode($json, true);
$messages = $result["response"]["feedMessageResponse"]["messages"]["message"];
$output = [];
if (count($messages) > 0) {
	foreach($messages as $i => $message) {
		
		//we only want 'UNLIMITED-TRACK' messages
		if ($message["messageType"] = "UNLIMITED-TRACK") {
			$new_message = (object)[];
			$new_message->id = $message["id"];
			$new_message->messengerId = $message["messengerId"];
			$new_message->dateTime = $message["dateTime"];
			$new_message->latitude = $message["latitude"];
			$new_message->longitude = $message["longitude"];
			$new_message->batteryState = $message["batteryState"];
			
			//strip out name
			$group = explode("_", $message["messengerName"]);
			$new_message->groupId = $group[0]."_".$group[1];
		
			array_push($output, $new_message);
		}
	}
}
echo json_encode($output);
?>