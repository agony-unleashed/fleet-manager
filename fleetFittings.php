<?php
////////////////////////////////////////////////////////
// fleetFittings.PHP
////////////////////////////////////////////////////////
ini_set('display_errors', 1); 
error_reporting(E_ALL);
$db = mysql_connect("127.0.0.1", "agony_fm", "0ec87766") or
	die("Could not connect");
@mysql_select_db("agony_fm") or die( "Unable to select database");
$task = '';
if ( isset($_POST['task'])){
	$task = $_POST['task'];   // Get this from Ext
}
switch($task){
	case "LISTING":              // Give the entire list
		getList();
		break;
	case "JOIN":
		joinFleet();
		break;
	case "UPDATEDNA":
		updateDNA();
		break;
	case "UPDATEPILOT":
		updatePilot();
		break;
	case "REMOVEPILOT":
		removePilot();
		break;
	case "AATRACK":
		aaGroup("tracks");
		break;
	case "AADAMP":
		aaGroup("damps");
		break;
	default:
		echo "{failure:true}";  // Simple 1-dim JSON array to tell Ext the request failed.
	break;
}

function getList() 
	{
	$fleetId = checkSlashes($_POST['fleetId']);
	$fleetCommander = getFleetCommander($fleetId);
	$fleetXO = getFleetXO($fleetId);
	$fleetCommander = checkSlashes($fleetCommander);
	$fleetXO = checkSlashes($fleetXO);
	$query = "SELECT * FROM fleetComposition WHERE fleetId = $fleetId";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	$returnArray = array();
	if($nbrows>0){
		// get fleet summary
		$query2 = "SELECT * FROM fleets WHERE id=$fleetId";
		$result2 = mysql_query($query2);
		$nbrows2 = mysql_num_rows($result2);
		if($nbrows2 == 1) {
			$returnArray = mysql_fetch_array($result2, MYSQL_ASSOC);
		}
		$returnArray['composition'] = array();
		while($rec = mysql_fetch_array($result, MYSQL_ASSOC)){
			$returnArray['composition'][] = $rec;					
		}
		$jsonresult = JEncode($returnArray);
		echo '({"total":"1","results":'.$jsonresult.'})';
	} else {
		echo '({"total":"0", "results":""})';
	}
}

function getFleetCommander($fleetId) {
	// returns the fleet commander name
	$query = "SELECT * FROM fleets WHERE id = $fleetId";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	if($nbrows == 1){
		$rec = mysql_fetch_array($result, MYSQL_ASSOC);
		return($rec["fleetOwner"]);
	}
	return NULL;
}

function getFleetXO($fleetId) {
	// returns the fleet XO name
	$query = "SELECT * FROM fleets WHERE id = $fleetId";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	if($nbrows == 1){
		$rec = mysql_fetch_array($result, MYSQL_ASSOC);
		return($rec["fleetXO"]);
	}
	return NULL;
}

// Encodes a YYYY-MM-DD into a MM-DD-YYYY string
function codeDate ($date) {
	$tab = explode ("-", $date);
	$r = $tab[1]."/".$tab[2]."/".$tab[0];
	return $r;
}

function JEncode($arr){
	if (version_compare(PHP_VERSION,"5.2","<"))
	{    
		require_once("./JSON.php");   //if php<5.2 need JSON class
		$json = new Services_JSON();  //instantiate new json object
		$data=$json->encode($arr);    //encode the data in json format
	} else
	{
		$data = json_encode($arr);    //encode the data in json format
	}
	return $data;
}

function JDecode($data){
	if (version_compare(PHP_VERSION,"5.2","<"))
	{    
		require_once("./JSON.php");   //if php<5.2 need JSON class
		$json = new Services_JSON();  //instantiate new json object
		$arr=$json->decode($data);    //encode the data in json format
	} else
	{
		$arr = json_decode($data);    //encode the data in json format
	}
	return $arr;
}

function joinFleet() {
	$pilot = checkSlashes($_POST['pilot']);
	$fleetId = checkSlashes($_POST['fleetId']);
	$shipDNA = checkSlashes($_POST['shipDNA']);
	$shipDNA = filterDNA($shipDNA);
	$funcResult = parseDNA($shipDNA);
	// check to see if pilot is already in the fleet
	$query1 = "SELECT * FROM fleetComposition WHERE pilot = '$pilot' AND fleetId = $fleetId";
	$result = mysql_query($query1);
	$num_rows = mysql_num_rows($result);
	if($num_rows <= 0) {
		$query2 = "INSERT INTO fleetComposition(fleetId, shipDNA, pilot, shipName, shipType, scrams, points, webs, caldECM, minmECM, amarECM, galeECM, multECM, damps, paints, tracks, neuts, rshield, rcap, rarmor, rhull, scanner)".
		"VALUES ($fleetId, '$shipDNA', '$pilot', '".$funcResult['shipName']."', '".$funcResult['shipType']."', ".$funcResult['scrams'].",".$funcResult['points'].",".$funcResult['webs'].",".$funcResult['caldECM'].",".
		$funcResult['minmECM'].",".$funcResult['amarECM'].",".$funcResult['galeECM'].",".$funcResult['multECM'].",".$funcResult['damps'].",".$funcResult['paints'].",".$funcResult['tracks'].",".$funcResult['neuts'].",".
		$funcResult['rshield'].",".$funcResult['rcap'].",".$funcResult['rarmor'].",".$funcResult['rhull'].",".$funcResult['scanner'].")";
		$result = mysql_query($query2);
		echo $query2;
		// now we need to update the membercount of the fleet table
		$query3 = "UPDATE fleets SET memberCount=memberCount+1 WHERE id=$fleetId";
		$result = mysql_query($query3);
		mysql_close();
		echo '1';
	} else {
		mysql_close();
		echo '0';
	}
	
}

function updateDNA() {
	$pilot = checkSlashes($_POST['pilot']);
	$fleetId = checkSlashes($_POST['fleetId']);
	$shipDNA = checkSlashes($_POST['shipDNA']);
	$shipDNA = filterDNA($shipDNA);
	$funcResult = parseDNA($shipDNA);
	// check to see if pilot is already in the fleet
	$query1 = "UPDATE fleetComposition SET shipDNA = '$shipDNA', shipName = '".$funcResult['shipName']."', shipType = '".$funcResult['shipType']."', scrams = ".$funcResult['scrams'].
		", points = ".$funcResult['points']." , webs = ".$funcResult['webs']." , caldECM = ".$funcResult['caldECM'].
		", minmECM = ".$funcResult['minmECM']." , amarECM = ".$funcResult['amarECM']." , galeECM = ".$funcResult['galeECM'].", multECM = ".$funcResult['multECM'].
		", damps = ".$funcResult['damps']." , paints = ".$funcResult['paints']." , tracks = ".$funcResult['tracks'].
		", neuts = ".$funcResult['neuts']." , rshield = ".$funcResult['rshield']." , rcap = ".$funcResult['rcap'].
		", rarmor = ".$funcResult['rarmor']." , rhull = ".$funcResult['rhull']." , scanner = ".$funcResult['scanner'].
		"  WHERE pilot = '$pilot' AND fleetId = $fleetId";
	$result = mysql_query($query1);
	mysql_close();
	echo '1';
}  

function removePilot() {
	if (!isset($_POST['id'])) {
		$_POST['id'] = "unknown";
	}
	if (!isset($_POST['hoesAmount'])) {
		$_POST['hoesAmount'] = 0;
	}
	$id = checkSlashes($_POST['id']);
	$fleetId = checkSlashes($_POST['fleetId']);
	$deletedPilot = checkSlashes($_POST['deletedPilot']);
	$userName = checkSlashes($_POST['userName']);
	$corpId = checkSlashes($_POST['hoesAmount']);
	// first check if the pilot is the owner
	$fleetOwner = getFleetOwner($fleetId);
	$fleetXO = getFleetXO($fleetId);
	$fleetOwner = checkSlashes($fleetOwner);
	$fleetXO = checkSlashes($fleetXO);
	if($corpId == 793028819 || strncmp($deletedPilot, $userName, 100) == 0 || $fleetXO == $userName) {
		if($fleetOwner == $deletedPilot) {
			mysql_close();
			echo '0';
		} else {
			if(strcmp($id, "unknown") != 0) {
				$query = "DELETE FROM fleetComposition WHERE id = $id";
				$result = mysql_query($query);
			} else {
				$query = "DELETE FROM fleetComposition WHERE fleetId = $fleetId AND pilot = '$deletedPilot'";
				$result = mysql_query($query);
			}
			if($fleetXO == $deletedPilot) {
				$query = "UPDATE fleets SET fleetXO = '' WHERE id = $fleetId";
				$result = mysql_query($query);
			}
			$query2 = "UPDATE fleets SET memberCount=memberCount-1 WHERE id=$fleetId";
			$result = mysql_query($query2);
			mysql_close();
			echo '1';
		}
	} else {
		mysql_close();
		echo 'fagony';
	}
}

// returns fleet owner of a particular fleet
function getFleetOwner($id) {
	$query = "SELECT * FROM fleets WHERE id = $id";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	if($nbrows == 1){
		$rec = mysql_fetch_array($result, MYSQL_ASSOC);
		return($rec['fleetOwner']);
	}
	return NULL;
}

// returns pilot given id
function getPilotById($id) {
	$query = "SELECT * FROM fleetComposition WHERE id = $id";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	if($nbrows == 1){
		$rec = mysql_fetch_array($result, MYSQL_ASSOC);
		return($rec['pilot']);
	}
	return NULL;
}

// returns item info for an itemId
function getItemInfo($id) {
	$query = "SELECT * FROM itemList WHERE itemId = $id";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	if($nbrows == 1){
		$rec = mysql_fetch_array($result, MYSQL_ASSOC);
		return($rec);
	}
	return NULL;
}

// removes http://fitting:
// http://fitting:627:11267;1:7665;3:12052;1:11317;1:4025;1:3130;2:11103;2:2046;1:5439;1:2183;5::
function filterDNA($shipDNA) {
    $leader = stripos($shipDNA, "url=fitting");
    $cleanDNA = substr($shipDNA, ($leader !== FALSE) ? $leader+11 : 0);
    $trailer = strpos($cleanDNA, ">");
    if ($trailer === FALSE) {
        return $cleanDNA;
    } else {
        return substr($cleanDNA, 0, $trailer);
    }
}

function parseDNA($shipDNA) {
	// we are going to return this array with the number of each types of modules
	$fittingArray = array('shipName' => 'Unknown', 'shipType' => 'Unknown', 'scrams' => 0, 'points' => 0, 'webs' => 0, 'caldECM' => 0, 'minmECM' => 0, 'amarECM' => 0, 'galeECM' => 0, 'multECM' => 0, 'damps' => 0, 'paints' => 0, 
		'tracks' => 0, 'neuts' => 0, 'rshield' => 0, 'rcap' => 0, 'rarmor' => 0, 'rhull' => 0, 'scanner' => 0);
	
	$shipId = 0;
	$tokens = preg_split("/:/", $shipDNA);
	foreach ($tokens as &$token) {
		if(preg_match("/^\d+$/", $token)) {
			if($shipId > 0) {
				return;
			} else {
				$shipId = $token;
				$shipInfo = getItemInfo($shipId);
				$fittingArray['shipName'] = $shipInfo['name'];
				$fittingArray['shipType'] = $shipInfo['subGroup'];
			}
		} elseif(preg_match("/^\d+;\d+$/",$token)) {
			$indexOfSemicolon = strrpos($token, ";");
			$itemId = substr($token, 0, $indexOfSemicolon);
			$quantity = substr($token, $indexOfSemicolon+1);
			$itemInfo = getItemInfo($itemId);
			$itemGroup = $itemInfo['groupId'];
			if($itemGroup == 52) {
				if($itemInfo['subGroup'] == 1) { // DISRUPTORS
					$fittingArray['points'] = $fittingArray['points'] + $quantity;
				} else {
					$fittingArray['scrams'] = $fittingArray['scrams'] + $quantity;
				}
			} elseif($itemGroup == 65) { // WEBS
				$fittingArray['webs'] = $fittingArray['webs'] + $quantity;
			} elseif($itemGroup == 201) { // ECM
				if($itemInfo['subGroup'] == 1) {
					$fittingArray['caldECM'] = $fittingArray['caldECM'] + $quantity;
				} elseif($itemInfo['subGroup'] == 2) {
					$fittingArray['minmECM'] = $fittingArray['minmECM'] + $quantity;
				} elseif($itemInfo['subGroup'] == 3) {
					$fittingArray['amarECM'] = $fittingArray['amarECM'] + $quantity;
				} elseif($itemInfo['subGroup'] == 4) {
					$fittingArray['galeECM'] = $fittingArray['galeECM'] + $quantity;
				} else {
					$fittingArray['multECM'] = $fittingArray['multECM'] + $quantity;
				}
			} elseif($itemGroup == 208) { // DAMPENERS
				$fittingArray['damps'] = $fittingArray['damps'] + $quantity;
			} elseif($itemGroup == 379) { // TARGET PAINTERS
				$fittingArray['paints'] = $fittingArray['paints'] + $quantity;
			} elseif($itemGroup == 291) { // TRACKING DISRUPTORS
				$fittingArray['tracks'] = $fittingArray['tracks'] + $quantity;
			} elseif($itemGroup == 71 || $itemGroup == 68) { // ENERGY NEUTRALIZERS/VAMPIRES
				$fittingArray['neuts'] = $fittingArray['neuts'] + $quantity;
			} elseif($itemGroup == 41) { // SHIELD TRANSPORTER
				$fittingArray['rshield'] = $fittingArray['rshield'] + $quantity;
			} elseif($itemGroup == 67) { // ENERGY TRANSFERS
				$fittingArray['rcap'] = $fittingArray['rcap'] + $quantity;
			} elseif($itemGroup == 325) { // REMOTE ARMOR REPAIR
				$fittingArray['rarmor'] = $fittingArray['rarmor'] + $quantity;
			} elseif($itemGroup == 585) { // REMOTE HULL REPAIR
				$fittingArray['rhull'] = $fittingArray['rhull'] + $quantity;
			} elseif($itemGroup == 48) { // SHIP SCANNER
				$fittingArray['scanner'] = $fittingArray['scanner'] + $quantity;
			}
		}
	}
	//echo "shipID = $shipId\n";
	return $fittingArray;
}

function updatePilot() {
	$changedType = checkSlashes($_POST['changedType']);
	$newValue = checkSlashes($_POST['newValue']);
	$id = checkSlashes($_POST['id']);
	// update FleetComposition table
	$query = "UPDATE fleetComposition SET $changedType=$newValue WHERE id=$id";
	$result = mysql_query($query);
	mysql_close();
	echo '1';
}

function aaGroup($ewarName) {
	//$userName = checkSlashes($_POST['userName']);
	$maxTracks = checkSlashes($_POST['max']);
	$fleetId = checkSlashes($_POST['fleetId']);
	$query = "SELECT * FROM fleetComposition WHERE fleetId = $fleetId";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	$trackStorage = array();
	$groupStorage = array();
	if($nbrows > 0) {
		// create data structures
		while($rec = mysql_fetch_array($result, MYSQL_ASSOC)){
			if($rec[$ewarName] > 0) {
				$trackStorage[$rec['id']] = $rec[$ewarName];
			}
			$groupStorage[$rec['id']] = 0;		
		}
		// set groups
		arsort($trackStorage);
		$nextGroup = 0;
		while(sizeof($trackStorage) > 0) {
			$nextGroup++;
			$leftTracks = $maxTracks;
			$count = 0;
			$currMaxSize = sizeof($trackStorage);
			foreach ($trackStorage as $key => $val) {
				if($count == 0) {
					$groupStorage[$key] = $nextGroup;
					unset($trackStorage[$key]);
					$leftTracks = $leftTracks - $val;
					if($leftTracks <= 0) {
						break;
					}
				} else {
					if(($leftTracks - $val) >= 0) {
						$groupStorage[$key] = $nextGroup;
						unset($trackStorage[$key]);
						$leftTracks = $leftTracks - $val;
						if($leftTracks <= 0) {
							break;
						}
					} else {
						if($count >= ($currMaxSize-1)) {
							$groupStorage[$key] = $nextGroup;
							unset($trackStorage[$key]);
							break;
						}
					}
				}
				$count++;			
			}
		}
		// update DB
		$groupName = "";
		if($ewarName == "tracks") {
			$groupName = "trackGroup";
		} else {
			$groupName = "dampGroup";
		}
		foreach ($groupStorage as $id => $group) {
			$query = "UPDATE fleetComposition SET $groupName=$group WHERE id=$id";
			$result = mysql_query($query);
		}		
	}
	mysql_close();
	echo '1';
}

function checkSlashes($string) {
	$string = stripslashes($string);
	return addslashes($string);
}
?>
