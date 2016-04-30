<?php
function getApiKey()
{
	return 'stuff';
}

function getDatabase()
{
	global $db;
	if(isset($db))
		return $db;
	try {
		$db = new PDO('stuff', 'stuff', 'stuff');
	} catch(Exception $e) {
		exit('Exception: ' . $e->getMessage());
	}
	return $db;
}

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
	$tryCount = 0;
	do {
		$res = file_get_contents($url);
		$responseCode = intval(explode(' ', $http_response_header[0])[1]);
		if($responseCode == 200)
			return json_decode($res, TRUE);
		if($responseCode == 400 || $responseCode == 404)
			return NULL;
		if($responseCode == 429)
		{
			$wait = 10;
			foreach($http_response_header as $header)
				if(startsWith($header, 'Retry-After: '))
					$wait = intval(explode(' ', $header)[1]);
			sleep($wait);
		}
		$tryCount++;
	} while($tryCount != 5);
	return NULL;
}
?>