<?php
// get the api key, singleton pattern
function getApiKey()
{
	global $acmvApiKey;
	if(!isset($acmvApiKey))
	{
		$db = getDatabase();
		$req = $db->query('SELECT value FROM acmvconfig WHERE name = \'apikey\'');
		$data = $req->fetch();
		$req->closeCursor();
		$acmvApiKey = urlencode($data['value']);
	}
	return $acmvApiKey;
}

// returns database connection, singleton pattern
function getDatabase()
{
	global $db;
	if(isset($db))
		return $db;
	try {
		$db = new PDO('url', 'user', 'pass');
	} catch(Exception $e) {
		exit('Exception: ' . $e->getMessage());
	}
	return $db;
}

// get the endpoints for each region
function getEndpoints()
{
	return ['br'=>'BR1',
			'eune'=>'EUN1',
			'euw'=>'EUW1',
			'jp'=>'JP1',
			'kr'=>'KR',
			'lan'=>'LA1',
			'las'=>'LA2',
			'na'=>'NA1',
			'oce'=>'OC1',
			'ru'=>'RU',
			'tr'=>'TR1'];
}

function requestAPI($url)
{
	// wait until the rate limit allows a request
	global $db;
	if(!isset($db))
		return NULL;
	$req = $db->query('SELECT value FROM acmvconfig WHERE name = \'nextrequest\'');
	$data = $req->fetch();
	$req->closeCursor();
	$nextRequest = intval($data['value']);
	$now = time();
	if($now < $nextRequest)
		sleep($nextRequest - $now);
	// the actual request (multiple times in case of an error)
	$tryCount = 0;
	do {
		$res = file_get_contents($url);
		$responseCode = intval(explode(' ', $http_response_header[0])[1]);
		if($responseCode == 200)// ok
			return json_decode($res, TRUE);
		if($responseCode == 400 || $responseCode == 404)// bad request or not found
			return NULL;
		// 429 and other response codes (like 503) would lead to another attempt after a tiny delay
		$wait = 1;
		if($responseCode == 429)// rate limit
		{
			$wait = 10;// wait 10 seconds by default
			// search if Retry-After was set, if yes then wait that time
			foreach($http_response_header as $header)
				if(startsWith($header, 'Retry-After: '))
					$wait = intval(explode(' ', $header)[1]);
			// set the time when the rate limit will allow an other call
			$req = $db->prepare('UPDATE acmvconfig SET value = ? WHERE name = \'nextrequest\'');
			$req->execute([time() + $wait]);
		}
		sleep($wait);// will wait enough if rate limited, or 1 second if unknown error
		$tryCount++;
	} while($tryCount != 5);// no more than 5 attempts
	return NULL;
}
?>