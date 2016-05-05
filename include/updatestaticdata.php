<?php
function updateChampionsData($region, $locale, $out)
{
	$region = urlencode($region);
	// patch
	$versions = requestAPI('https://global.api.pvp.net/api/lol/static-data/' . $region . '/v1.2/versions?api_key=' . getApiKey());
	if($versions === NULL || !is_array($versions) || count($versions) == 0)
	{
		error_log('Couldn\'t get latest patch for region ' . $region);
		return;
	}
	$patch = $versions[0];
	// champions data
	$champions = requestAPI('https://global.api.pvp.net/api/lol/static-data/' . $region . '/v1.2/champion?locale=' . urlencode($locale) . '&dataById=true&champData=all&api_key=' . getApiKey());
	if($champions === NULL || !is_array($champions) || !array_key_exists('data', $champions))
	{
		error_log('Couldn\'t get champions data for locale ' . $locale . ', region ' . $region);
		return;
	}
	$championKeys = [];
	$championNames = [];
	$championTitles = [];
	$championRoles = [];
	foreach($champions['data'] as $champ)
	{
		$id = intval($champ['id']);
		$championKeys[$id] = $champ['key'];
		$championNames[$id] = $champ['name'];
		$championTitles[$id] = $champ['title'];
		$championRoles[$id] = $champ['tags'];
	}

	// free champions
	$freeToPlay = requestAPI('https://' . $region . '.api.pvp.net/api/lol/' . $region . '/v1.2/champion?freeToPlay=true&api_key=' . getApiKey());
	if($freeToPlay === NULL || !is_array($freeToPlay) || !array_key_exists('champions', $freeToPlay))
	{
		error_log('Couldn\'t get free to play champions for locale ' . $locale . ', region ' . $region);
		return;
	}
	$freeToPlayChampions = [];
	foreach($freeToPlay['champions'] as $champ)
		array_push($freeToPlayChampions, intval($champ['id']));

	// save data
	$championsStaticData= 'Champions = {patch:' . json_encode($patch)
									. ',keys:' . json_encode($championKeys)
									. ',names:' . json_encode($championNames)
									. ',titles:' . json_encode($championTitles)
									. ',roles:' . json_encode($championRoles)
									. ',free:' . json_encode($freeToPlayChampions) . '};';
	file_put_contents($out, $championsStaticData);
}

$rootDir = '/var/www/brallos.tk/lol/acmv/';

require($rootDir . 'include/base.php');

$outputDir = $rootDir . 'static/';

$locales = ['en_US'/*,'fr_FR'*/];
$endpoints = getEndpoints();
// iterate through locales then region, may be better for rate limit
foreach($locales as $locale)
{
	foreach($endpoints as $region=>$endpoint)
	{
		updateChampionsData($region, $locale, $outputDir . $region . '_' . $locale . '_champions.js');
	}
}
?>