<?php
function startsWith($haystack, $needle)
{
	/* http://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php */
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

function getMasteries($name, $region)
{
	$nameKey = mb_strtolower(str_replace(' ', '', $name), 'utf8');
	$db = getDatabase();
	$req = $db->prepare('SELECT masteries,time FROM lolmasteries WHERE name=? AND region=?');
	$req->execute([$nameKey, $region]);
	$cached = $req->fetch();
	$req->closeCursor();
	if($cached === FALSE || ((intval($cached['time']) + 1800) < time()))
	{
		$summonerInfo = requestAPI('https://' . $region . '.api.pvp.net/api/lol/' . $region . '/v1.4/summoner/by-name/' . str_replace('+', '%20', urlencode($name)) . '?api_key=' . getApiKey());
		if($summonerInfo === NULL || !array_key_exists($nameKey, $summonerInfo))
			$masteries = '';
		else
		{
			$summonerId = intval($summonerInfo[$nameKey]['id']);
			$masteries = requestAPI('https://' . $region . '.api.pvp.net/championmastery/location/' . getEndpoints()[$region] . '/player/' . $summonerId . '/champions?api_key=' . getApiKey());
			if($masteries === NULL)
				$masteries = '';
			else
			{
				for($i=0;$i<count($masteries);$i++)
					unset($masteries[$i]['playerId']);
				$masteries = json_encode($masteries);
			}
		}
		if($cached === FALSE)
		{
			$req = $db->prepare('INSERT INTO lolmasteries (name, region, masteries, time) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name), masteries = VALUES(masteries), time = VALUES(time)');
			$req->execute([$nameKey, $region, $masteries, time()]);
		}
		else
		{
			$req = $db->prepare('UPDATE lolmasteries SET masteries=?, time=? WHERE name=? AND region=?');
			$req->execute([$masteries, time(), $nameKey, $region]);
		}
	}
	else
		$masteries = $cached['masteries'];
	return $masteries;
}

if(!array_key_exists('name', $_GET))
{
	http_response_code(400);
	echo('No name defined');
	exit();
}
$name = $_GET['name'];

require('include/base.php');

$region = 'euw';
if(array_key_exists('region', $_GET) && array_key_exists($_GET['region'], getEndpoints()))
	$region = $_GET['region'];

$masteries = getMasteries($name, $region);
if($masteries === '')
{
	http_response_code(503);
	echo('An error occured while getting masteries');
	exit();
}
echo($masteries);
?>