<?php
function startsWith($haystack, $needle)
{
	/* http://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php */
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

function getMasteries($name, $region, &$cacheTime, &$error)
{
	$error = FALSE;
	// gets whatever is cached for the summoner from the given region
	$nameKey = mb_strtolower(str_replace(' ', '', $name), 'utf8');
	$db = getDatabase();
	$req = $db->prepare('SELECT masteries,time FROM lolmasteries WHERE name=? AND region=?');
	$req->execute([$nameKey, $region]);
	$cached = $req->fetch();
	$req->closeCursor();
	// if there is nothing cached or if the cached data hasn't been updated since at least 1800 seconds = 30 minutes
	if($cached === FALSE || ((($cached['time'] = intval($cached['time'])) + 1800) < time()))
	{
		// get the summoner id of the summoner
		$summonerInfo = requestAPI('https://' . $region . '.api.pvp.net/api/lol/' . $region . '/v1.4/summoner/by-name/' . str_replace('+', '%20', urlencode($name)) . '?api_key=' . getApiKey());
		// if summoner isn't found / error
		if($summonerInfo === NULL || !array_key_exists($nameKey, $summonerInfo))
		{
			$error = 'Summoner ' . htmlspecialchars($name) . ' not found.';
			$masteries = $error;// need to save the error message for the others
		}
		else
		{
			// get the masteries
			$summonerId = intval($summonerInfo[$nameKey]['id']);
			$masteries = requestAPI('https://' . $region . '.api.pvp.net/championmastery/location/' . getEndpoints()[$region] . '/player/' . $summonerId . '/champions?api_key=' . getApiKey());
			// if error (no masteries returns empty array)
			if($masteries === NULL)
			{
				$error = 'Couldn\'t get masteries of ' . htmlspecialchars($name) . '.';
				$masteries = $error;
			}
			else
			{
				// remove the summoner id from the data
				for($i=0;$i<count($masteries);$i++)
					unset($masteries[$i]['playerId']);
				$masteries = json_encode($masteries);
			}
		}
		// got masteries, let's cache the result
		$time = time();
		$cacheTime = 1800;
		// if the summoner wasn't cached
		if($cached === FALSE)
		{
			// insert masteries or update if duplicate (duplicate may happen if page is called at the exact same time)
			$req = $db->prepare('INSERT INTO lolmasteries (name, region, masteries, time) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name), masteries = VALUES(masteries), time = VALUES(time)');
			$req->execute([$nameKey, $region, $masteries, $time]);
		}
		else
		{
			// just update the row
			$req = $db->prepare('UPDATE lolmasteries SET masteries=?, time=? WHERE name=? AND region=?');
			$req->execute([$masteries, $time, $nameKey, $region]);
		}
	}
	// if there is something cached and recent enough
	else
	{
		$masteries = $cached['masteries'];
		// if saved masteries are not an array, then what is saved is an error message
		if($masteries[0] != '[')
			$error = $masteries;
		// the remaining time before an update can happen
		$cacheTime = 1800 - (time() - $cached['time']);
	}
	return $masteries;
}

// if no name 400 Bad request (in case some guy doesn't use ACMV main page and changes the query)
if(!array_key_exists('name', $_GET))
{
	http_response_code(400);
	echo('No name defined');
	exit();
}
$name = $_GET['name'];

require('include/base.php');

// default region is euw, if a region is set and that it exists it will be replaced
$region = 'euw';
if(array_key_exists('region', $_GET) && array_key_exists($_GET['region'], getEndpoints()))
	$region = $_GET['region'];

// get masteries
$masteries = getMasteries($name, $region, $cacheTime, $error);
// if an error occured
if($error)
{
	http_response_code(503);
	echo($error);
	exit();
}
// this is json
header('Content-Type: application/json');
// say the browser to cache the page for the amount of time before masteries update
header('Cache-Control: max-age=' . $cacheTime);
echo($masteries);
?>