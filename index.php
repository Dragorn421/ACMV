<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Champion Mastery - brallos.tk</title>
<link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
<link rel="stylesheet" type="text/css" href="style.css">
<link rel="stylesheet" type="text/css" href="rome/rome.css">
<link rel="icon" type="image/png" href="/img/defaulticon.png">
<script type="text/javascript" src="rome/rome.js"></script>
<script type="text/javascript" src="static/euw_en_US_champions.js"></script>
<script type="text/javascript" src="js.js"></script>
</head>
<body>
<h1 id="main-title">Advanced Champion Mastery Viewer</h1>
<noscript id="no-script">JavaScript must be enabled to use this page.</noscript>
<form id="pick-name-form" onsubmit="submitSummoner();return false;">
	<input id="name-input" type="text" placeholder="Enter summoner name" autocomplete="off"/>
	<select id="region-picker">
		<option value="br">BR</option>
		<option value="eune">EUNE</option>
		<option value="euw" selected="1">EUW</option>
		<option value="jp">JP</option>
		<option value="kr">KR</option>
		<option value="lan">LAN</option>
		<option value="las">LAS</option>
		<option value="na">NA</option>
		<option value="oce">OCE</option>
		<option value="ru">RU</option>
		<option value="tr">TR</option>
	</select>
	<input id="submit-name" type="submit"/>
</form>
<div id="loading">
	<div>
		<div class="square square-1"></div>
		<div class="square square-2"></div>
		<div class="square square-3"></div>
		<div class="square square-4"></div>
	</div>
</div>
<div id="search-form">
	<div class="subtitle" onclick="toggleVisibility('search-filter')">Filter</div><br>
	<div id="search-filter">
		<div id="search-filter-free">
			<select onchange="updateSearchFilterSelectOne('free', this, toBool)">
				<option value="null" selected="1">Ignore free</option>
				<option value="true">Free</option>
				<option value="false">Not free</option>
			</select>
		</div>
		<div id="search-filter-chest">
			<select onchange="updateSearchFilterSelectOne('chest', this, toBool)">
				<option value="null" selected="1">Ignore chest</option>
				<option value="true">Chest granted</option>
				<option value="false">Chest not granted</option>
			</select>
		</div>
		<div id="search-filter-custom-list">
			<select onchange="updateSearchFilterSelectOne('customList', this, toBool)">
				<option value="null" selected="1">Ignore custom list</option>
				<option value="true">In custom list</option>
				<option value="false">Not in custom list</option>
			</select>
		</div><br>
		<div id="search-filter-not-played-before">
			Played after <input/>
		</div>
		<script style="display:none;">
			setDateInput(document.getElementById('search-filter-not-played-before').firstElementChild, 'notPlayedBefore');
		</script>
		<div id="search-filter-not-played-since">
			Played before <input/>
		</div><br>
		<script style="display:none;">
			setDateInput(document.getElementById('search-filter-not-played-since').firstElementChild, 'notPlayedSince');
		</script>
		<div id="search-filter-level">
			Mastery levels
			<select multiple="1" onchange="updateSearchFilterSelectMultiple('level', this, parseInt)">
				<option value="5" selected="1">5</option>
				<option value="4" selected="1">4</option>
				<option value="3" selected="1">3</option>
				<option value="2" selected="1">2</option>
				<option value="1" selected="1">1</option>
			</select>
		</div>
		<div id="search-filter-role">
			Roles
			<select multiple="1" onchange="updateSearchFilterSelectMultiple('role', this, null)">
				<option value="Assassin" selected="1">Assassin</option>
				<option value="Fighter" selected="1">Fighter</option>
				<option value="Mage" selected="1">Mage</option>
				<option value="Marksman" selected="1">Marksman</option>
				<option value="Melee" selected="1">Melee</option>
				<option value="Support" selected="1">Support</option>
				<option value="Tank" selected="1">Tank</option>
			</select>
		</div><br>
		<div id="search-filter-grade">
			Grades
			<select multiple="1" onchange="updateSearchFilterSelectMultiple('grade', this, null)">
				<option value="S+" selected="1">S+</option>
				<option value="S" selected="1">S</option>
				<option value="S-" selected="1">S-</option>
				<option value="A+" selected="1">A+</option>
				<option value="A" selected="1">A</option>
				<option value="A-" selected="1">A-</option>
				<option value="B+" selected="1">B+</option>
				<option value="B" selected="1">B</option>
				<option value="B-" selected="1">B-</option>
				<option value="C+" selected="1">C+</option>
				<option value="C" selected="1">C</option>
				<option value="C-" selected="1">C-</option>
				<option value="D+" selected="1">D+</option>
				<option value="D" selected="1">D</option>
				<option value="D-" selected="1">D-</option>
				<option value="" selected="1">Ø</option>
			</select>
		</div>
	</div>
	<div class="subtitle" onclick="toggleVisibility('search-sort')">Sort</div><br>
	<div id="search-sort">
		<div id="search-sort-stack"></div>
		<div id="search-sort-unused-criteria"></div>
	</div>
	<script style="display:none;">
		updateSorter();
	</script>
	<div class="subtitle" onclick="toggleVisibility('search-group')">Group</div><br>
	<div id="search-group">
		Group by
		<select onchange="updateSearchGroup(this)">
			<option value="" selected="1">None</option>
			<option value="free">Free</option>
			<option value="chest">Chest granted</option>
			<option value="customList">Custom list</option>
			<option value="lastPlayedDay">Last played (day)</option>
			<option value="lastPlayedWeek">Last played (week)</option>
			<option value="lastPlayedMonth">Last played (month)</option>
			<option value="level">Level</option>
			<option value="role">Role</option>
			<option value="grade">Best grade</option>
		</select>
	</div>
</div>
<div id="content"></div>
<footer id="footer"><a href="/lol/privacypolicy/en.txt">Privacy Policy</a> - <a href="/lol/privacypolicy/fr.txt">Politique de confidentialité</a><br>
brallos.tk isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially
involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered
trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.<br>
Date pickers from <a href="https://github.com/bevacqua/rome">Rome</a> which is under the <a href="https://opensource.org/licenses/MIT">MIT license</a></footer>
</body>
</html>