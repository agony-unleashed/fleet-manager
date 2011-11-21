<?php
	// Figuring out if user is in game, he trusts the website, and his pilotname
$debug = false;
$websiteRoot = "http://www.agony-unleashed.com/fleet-manager/";

// log user info
$myFile = "/home/agony/tmp/siteVisits_fm.txt";
if (!file_exists($myFile)) {
	`touch $myFile`;
}

$cannotOpenTextFile = 0;
$fh = fopen($myFile, 'a') or $cannotOpenTextFile = 1;
if($cannotOpenTextFile == 0) {
	
	$stringData = date("Y-M-j G:i:s T")." IP:".$_SERVER['REMOTE_ADDR']."  Browser:".$_SERVER['HTTP_USER_AGENT']."\n";
	fwrite($fh, $stringData);
	fclose($fh);
}

$browser = $_SERVER['HTTP_USER_AGENT'];
// temp pilotname
$pilotname = "NON-IGB-".rand(0,999);
//$pilotname = "NeoFriend";
$corpId = "0";
$ingame = false;
$trusted = false;
// if EVE client
if(stristr($browser, 'EVE-IGB')) {
	$ingame = true;
	if ($_SERVER['HTTP_EVE_TRUSTED']=='no' || $_SERVER['HTTP_EVE_TRUSTED']=='No') {
		$trusted = false;
	} else {
		$trusted = true;
		$pilotname = $_SERVER['HTTP_EVE_CHARNAME'];
		$corpId = $_SERVER['HTTP_EVE_CORPID'];		
	}
}

if($debug) {
	foreach($_SERVER as $h=>$v)
		if(ereg('HTTP_(.+)',$h,$hp))
			print "$h : $v<br>";
	print "Browser: $browser <BR>";
	print "Ingame: $ingame <BR>";
	print "Trusted: $trusted <BR>";
	print "Trusted2: ".$_SERVER['HTTP_EVE_TRUSTED']."<BR>";
	print "Pilot: $pilotname <BR>";
	print "CorpID: $corpId <BR>";
}
?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Neo's Fleet Manager Tool</title>

    <!-- ** CSS ** -->
    <!-- base library -->
    <link rel="stylesheet" type="text/css" href="ext-3.1.0/resources/css/ext-all.css" />
    

    <!-- overrides to base library -->

    <!-- page specific -->
    <link rel="stylesheet" type="text/css" href="ext-3.1.0/examples/shared/examples.css" />
    <link rel="stylesheet" type="text/css" href="fleetSummary.css" />
    <link rel="stylesheet" href="Ext.ux.grid.GridSummary.css"/>

    <style type=text/css>
        /* style rows on mouseover */
        .x-grid3-row-over .x-grid3-cell-inner {
            font-weight: bold;
        }
    </style>
    

    <!-- ** Javascript ** -->
<?php
	// setting pilotname
	//fix pilotname apostrophe
$jsSafePilotName = str_replace("'", "\'", $pilotname);
print "    <script type=\"text/javascript\"> var pilotName = '$jsSafePilotName'; var hoesAmount = $corpId;</script>\n";
?>

    <!-- ExtJS library: base/adapter -->
    <script type="text/javascript" src="ext-3.1.0/adapter/ext/ext-base.js"></script>

    <!-- ExtJS library: all widgets -->
    <!-- <script type="text/javascript" src="ext-3.1.0/ext-all.js"></script> -->
    <script type="text/javascript" src="http://extjs.cachefly.net/ext-3.1.0/ext-all.js"></script>

    <!-- User Extensions -->
	<script type="text/javascript" src='Ext.ux.grid.GridSummary.js?rnd=100'></script>
	
    <!-- page specific -->
    <script type="text/javascript" src="FleetManagementEntry.js?rnd=100"></script>
    <script type="text/javascript" src="FleetsGrid.js?rnd=100"></script>
    <script type="text/javascript" src="FleetCompositionGrid.js?rnd=100"></script>
    <script type="text/javascript" src="FleetCompositionMotherPanel.js?rnd=100"></script>
    <script type="text/javascript" src="FleetSummaryPanel.js?rnd=102"></script>
    <script type="text/javascript">
    	// this function asks for trust
		var getTrust = function(website) {
			var trustMe = CCPEVE.requestTrust(website);			
		};
		var instructionPrompt = '1. Open Fitting<br>2. Drag the name of your ship into chat<br>3. Right click on it, and select "Open Link In New Tab"<br>4. A new tab will open in In-Game-Browser. Copy it\'s address and paste here:';
    </script>
<?php
    
// showFitting CCP function. Only works when ingame
if($ingame) {
	print "<script type=\"text/javascript\">
		var showFitting = function(shipDNA) {
			var dnaString = new String(shipDNA);
			
			if(dnaString.match(/(\d+\u003A\d+\u003B[0-9\u003A\u003B]+\u003A\u003A)/)) {
				CCPEVE.showFitting(RegExp.$1);	
			}	
		};
	</script>";
} else {
    print "<script type=\"text/javascript\">
		var showFitting = function(shipDNA) {
			alert('Hey, why did you click me?', 'Hi');	
		};
	</script>";
}

?>

</head>

<?php
	// print body to get trust
if($trusted || !$ingame) {
	print "<body>\n";
} else {
	print "<body onload=\"getTrust('$websiteRoot')\">\n";
}
// error messages
if(!$trusted && $ingame) {
	print "<h1><span style='color: #ff0000;'> >>> REFRESH THIS PAGE AFTER YOU GRANT TRUST <<<<</span><br></h1>\n";
} elseif(!$ingame) {
	print "<h1><span style='color: #ff0000;'> THIS WEBSITE DOESNT WORK CORRECTLY WHEN NOT USING EVE BROWSER.<br>This is why you don't have any permissions and your name was randomly generated.<br> Your name is: $pilotname</span><br></h1>";
}

?>
    <div id="neoDiv"></div>
</body>
</html>
