<?php
////////////////////////////////////////////////////////
// fleetConnection.PHP
////////////////////////////////////////////////////////
ini_set('display_errors', 1); 
error_reporting(E_ALL);
$db = mysql_connect("127.0.0.1", "DB_USER", "DB_PASSWORD") or
	die("Could not connect");
@mysql_select_db("agony_fm") or die( "Unable to select database");
$task = '';
define('ADMIN_USERS', 'adminUser1;adminUser2'); // feel free to add more. Will prolly make a DB for this earlier instead of a dumb array

if ( isset($_POST['task'])){
	$task = $_POST['task'];   // Get this from Ext
}
switch($task){
	case "LISTING":              // Give the entire list
		getList();
		break;
	case "CREATEFLEET":
		createFleet();
		break;
	case "REMOVEFLEET":
		removeFleet();
		break;
	case "TRANSFEROWNERSHIP":
		transferOwnership();
		break;
	case "MAKEXO":
		makeXO();
		break;
	case "UPDATEINFO":
		updateInfo();
		break;
	case "REMOVEXO":
		removeXO();
		break;
	case "UPDATEPUBLIC":
		updatePublic();
		break;
	default:
		echo "{failure:true}";  // Simple 1-dim JSON array to tell Ext the request failed.
	break;
}

function checkSlashes($string) {
	$string = stripslashes($string);
	return addslashes($string);
}

function getList() {
	$pilot = checkSlashes($_POST['pilot']);
	$corpId = checkSlashes($_POST['hoesAmount']);
	$query = "SELECT * FROM fleets";
	$result = mysql_query($query);
	$nbrows = mysql_num_rows($result);
	$viewableFleets = 0;
	if($nbrows>0){
		while($rec = mysql_fetch_array($result, MYSQL_ASSOC)){
			// check to see if pilot is in the fleet
			$fleetId = $rec["id"];
			$query1 = "SELECT * FROM fleetComposition WHERE pilot = '$pilot' AND fleetId = $fleetId";
			//echo $query1;
			$result1 = mysql_query($query1);
			$num_rows = mysql_num_rows($result1);
			if($num_rows > 0) {
				$rec["joined"] = true;
			} else {
				$rec["joined"] = false;
			}
			if($rec["isPublic"] || $corpId == 793028819 || $num_rows > 0) {
				$arr[] = $rec;
				$viewableFleets++;
			}
		}
		$jsonresult = '';
		if($viewableFleets > 0) {
			$jsonresult = JEncode($arr);
		}
		mysql_close();
		echo '({"total":"'.$viewableFleets.'","results":'.$jsonresult.'})';
	} else {
		mysql_close();
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

function createFleet() {
	$corpId = checkSlashes($_POST['hoesAmount']);
	$fleetOwner = checkSlashes($_POST['fleetOwner']);
	$about = checkSlashes($_POST['about']);
	$now = gmdate('Y-m-d H:i:s');
	// update Fleets table
	if($corpId == 793028819) {
		$query = "INSERT INTO fleets(fleetOwner, createdOn, about, memberCount, isPublic) VALUES ('$fleetOwner', '$now', \"$about\", 1, 0)";
		$result = mysql_query($query);
		$id=mysql_insert_id();
		// automatically join FC into the fleet
		$query = "INSERT INTO fleetComposition(fleetId, shipDNA, pilot) VALUES ('$id', 'Unknown', '$fleetOwner')";
		$result = mysql_query($query);
		mysql_close();
		echo '1';
	} else {
		echo '0'; //bad
	}
}

function removeFleet() {
	$fleetId = checkSlashes($_POST['id']);
	$pilot = checkSlashes($_POST['pilot']);
	$fleetOwner = getFleetCommander($fleetId);
	$fleetOwner = checkSlashes($fleetOwner);
	$adminArray = explode(';', ADMIN_USERS);
	if($pilot == $fleetOwner || in_array($pilot, $adminArray)) {
		$query = "DELETE FROM fleets WHERE id = $fleetId";
		$result = mysql_query($query);
		// delete from fleetComposition as well
		$query = "DELETE FROM fleetComposition WHERE fleetId = $fleetId";
		$result = mysql_query($query);
		mysql_close();
		echo '1';
	} else {
		echo '0 '.$pilot.' '.$fleetOwner; //bad
	}
}
// returns the new fleet owner
function transferOwnership() {
	$id = checkSlashes($_POST['id']);
	$pilot = checkSlashes($_POST['pilot']);
	$userName = checkSlashes($_POST['userName']);
	$fleetOwner = getFleetCommander($id);
	$fleetOwner = checkSlashes($fleetOwner);
	if($userName == $fleetOwner) {
		$query = "UPDATE fleets SET fleetOwner = '$pilot' WHERE id = $id";
		$result = mysql_query($query);
		mysql_close();
		echo '1';
	} else {
		mysql_close();
		echo '0';
	}
	
}

// returns the new fleet XO
function makeXO() {
	$id = checkSlashes($_POST['id']);
	$pilot = checkSlashes($_POST['pilot']);
	$userName = checkSlashes($_POST['userName']);
	$fleetOwner = getFleetCommander($id);
	$fleetOwner = checkSlashes($fleetOwner);
	if($userName == $fleetOwner) {
		$query = "UPDATE fleets SET fleetXO = '$pilot' WHERE id = $id";
		$result = mysql_query($query);
		mysql_close();
		echo '1';
	} else {
		mysql_close();
		echo '0';
	}
}

function removeXO() {
	$id = checkSlashes($_POST['id']);
	$query = "UPDATE fleets SET fleetXO = '' WHERE id = $id";
	$result = mysql_query($query);
	mysql_close();
	echo '1';
}

function updatePublic() {
	$id = checkSlashes($_POST['id']);
	$public = checkSlashes($_POST['isPublic']);
	$corpId = checkSlashes($_POST['hoesAmount']);
	if($corpId == 793028819) {
		$query = "UPDATE fleets SET isPublic = $public WHERE id = $id";
		$result = mysql_query($query);
		mysql_close();
		echo '1';
	} else {
		mysql_close();
		echo 'fagony';
	}
}

function updateInfo() {
	$id = checkSlashes($_POST['id']);
	$about = checkSlashes($_POST['about']);
	$description = checkSlashes($_POST['description']);
	$corpId = checkSlashes($_POST['hoesAmount']);
	$userName = checkSlashes($_POST['userName']);
	$fleetOwner = getFleetCommander($id);
	$fleetXO = getFleetXO($id);
	$fleetOwner = checkSlashes($fleetOwner);
	$fleetXO = checkSlashes($fleetXO);
	if(($userName == $fleetOwner || $userName == $fleetXO) && $corpId == 793028819) {
		$query = "UPDATE fleets SET about = '$about', description = '$description' WHERE id = $id";
		$result = mysql_query($query);
		mysql_close();
		echo '1';
	} else {
		mysql_close();
		echo '0';
	}
}
?>
