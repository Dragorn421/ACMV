// manipulate classes
function addClassTo(element, className)
{
	if(element.classList)
		element.classList.add(className);
	else if(element.className == '')
		element.className = className;
	else
	{
		var classes = element.className.split(' ');
		if(classes.indexOf(className) == -1)
			element.className += ' ' + className;
	}
}

function removeClassFrom(element, className)
{
	if(element.classList)
		element.classList.remove(className);
	else if(element.className != '')
	{
		var classes = element.className.split(' ');
		var i = classes.indexOf(className);
		if(i != -1)
		{
			classes.splice(i, 1);
			element.className = classes.join(' ');
		}
	}
}

// spread children of element across the lines
function spreadElements(parent, maxParentWidth, childWidth)
{
	var maxPerLine = Math.max(1, Math.floor(maxParentWidth / childWidth));
	var lines = Math.ceil(parent.children.length / maxPerLine);
	var perLine = Math.ceil(parent.children.length / lines);
	parent.style.width = Math.min(maxParentWidth, childWidth * perLine + childWidth - 1) + 'px';
}

// spread all elements in all groups
function spreadGroups()
{
	for(var i=0;i<ACMV.spreadGroups.length;i++)
		spreadElements(ACMV.spreadGroups[i], document.body.clientWidth, 100);
}

// get current time as milliseconds
function time()
{
	return new Date().getTime();
}

// convert string to boolean
function toBool(str)
{
	return str === 'true'?true:(str === 'false'?false:null);
}

// rounds n to the lower nearest multiple of to
function floorTo(n, to)
{
	return n - (n % to);
}

// toggles visibility of element
function toggleVisibility(id)
{
	var e = document.getElementById(id);
	if(!('display' in e.style) || e.style.display == '')
		e.style.display = 'none';
	else
		e.style.display = '';
}

// set input to be a date input
function setDateInput(input, filter)
{
	parent = input.parentNode;
	rome(input, {
			autoClose:false,
			appendTo:parent
		});
	input.onchange = function(){
		updateSearchFilterInput(filter,
								input,
								function(str){
									var d = new Date(str);
									return isNaN(d.getTime())?null:d;
								});
	}
	input.addEventListener('change', input.onchange);
	parent.addEventListener('click', function(ev){
		input.onchange();
	});
}

// set loading animation state
function setLoading(loading)
{
	var loadingElem = document.getElementById('loading');
	if(loading)
		addClassTo(loadingElem, 'loading');
	else
		removeClassFrom(loadingElem, 'loading');
}

// content editing
function getContentDiv()
{
	return document.getElementById('content');
}

function setContent(html)
{
	getContentDiv().innerHTML = html;
}

// load masteries
function getMasteries(name, region, successCallback, errorCallback)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == XMLHttpRequest.DONE)
		{
			if(xhr.status == 200)
				successCallback(xhr.responseText);
			else
				errorCallback(xhr.status, xhr.responseText);
		}
	};
	xhr.open('GET', 'getmasteries.php?name=' + encodeURIComponent(name) + '&region=' + region, true);
	xhr.send();
}

function resetMasteries(newMasteries)
{
	ACMV.masteries = newMasteries;
	// adding all champions which have no mastery
	championsWithMastery = [];
	for(var i=0;i<ACMV.masteries.length;i++)
		championsWithMastery.push(ACMV.masteries[i].championId);
	for(var id in Champions.names)
	{
		if(championsWithMastery.indexOf(parseInt(id)) == -1)//even if id is sumeric, keys are strings
		{
			ACMV.masteries.push({championId:id,championLevel:0,championPoints:0,lastPlayTime:0,championPointsSinceLastLevel:0,championPointsUntilNextLevel:0,chestGranted:false});
		}
	}
	updateMasteries();
}

// filter
function updateSearchFilterInput(filter, input, converter)
{
	ACMV.search.filter[filter] = converter != null?converter(input.value):input.value;
	updateMasteries();
}

function updateSearchFilterSelectOne(filter, select, converter)
{
	var v = null;
	for(var i=0;i<select.length;i++)
	{
		if(select[i].selected)
		{
			v = converter != null?converter(select[i].value):select[i].value;
			break;
		}
	}
	ACMV.search.filter[filter] = v;
	updateMasteries();
}

function updateSearchFilterSelectMultiple(filter, select, converter)
{
	var selected = [];
	for(var i=0;i<select.length;i++)
	{
		if(select[i].selected)
			selected.push(converter != null?converter(select[i].value):select[i].value);
	}
	ACMV.search.filter[filter] = selected;
	updateMasteries();
}

function isFiltered(mastery)
{
	for(var k in ACMV.search.filter)
	{
		var f = ACMV.search.filter[k];
		if(f !== null)
		{
			if(f === true || f === false)
			{
				if(ACMV.sorting.filter[k](mastery) !== f)
					return true;
			}
			else if(!ACMV.sorting.filter[k](mastery, f))
				return true;
		}
	}
	return false;
}

// sort
function sortMasteries(masteries)
{
	masteries.sort(function(a,b){
		for(var i=0;i<ACMV.search.order.length;i++)
		{
			var order = ACMV.search.order[i];
			var res = ACMV.sorting.order[order.criteria](a, b) * (order.asc?1:-1);
			if(res != 0)
				return res;
		}
		return b.championPoints - a.championPoints;
	});
	return masteries;
}

function updateSorter()
{
	var criteriaNames = {
		name: 'Name',
		free: 'Free',
		chest: 'Chest granted',
		customList: 'Custom list',
		lastPlayed: 'Last played',
		level: 'Level',
		role: 'Role',
		grade: 'Best grade'
	};
	var criteriaStack = document.getElementById('search-sort-stack');
	while(criteriaStack.firstChild)
		criteriaStack.firstChild.remove();
	var unusedCriteriaList = document.getElementById('search-sort-unused-criteria');
	while(unusedCriteriaList.firstChild)
		unusedCriteriaList.firstChild.remove();
	var unused = [];
	for(var k in ACMV.sorting.order)
		unused.push(k);
	for(var k=0;k<ACMV.search.order.length;k++)
	{
		var order = ACMV.search.order[k];
		var criteria = document.createElement('div');
		criteria.appendChild(document.createTextNode('- ' + criteriaNames[order.criteria]));
		var ordering = document.createElement('span');
		ordering.appendChild(document.createTextNode(' (' + (order.asc?'ascendant':'descendant') + ')'));
		ordering.addEventListener('click', function(ev){
			var k = parseInt(ev.currentTarget.parentNode.getAttribute('data-sort-order-key'));
			ACMV.search.order[k].asc = !ACMV.search.order[k].asc;
			updateSorter();
			ev.stopPropagation();
		});
		criteria.appendChild(ordering);
		criteria.setAttribute('data-sort-order-key', k);
		criteria.addEventListener('click', function(ev){
			var k = parseInt(ev.currentTarget.getAttribute('data-sort-order-key'));
			ACMV.search.order.splice(k, 1);
			updateSorter();
		});
		criteriaStack.appendChild(criteria);
		var i = unused.indexOf(order.criteria);
		if(i != -1)
			unused.splice(i, 1);
	}
	for(var i=0;i<unused.length;i++)
	{
		var k = unused[i];
		var criteria = document.createElement('div');
		criteria.appendChild(document.createTextNode(criteriaNames[k] + ' +'));
		criteria.setAttribute('data-sort-criteria-name', k);
		criteria.addEventListener('click', function(ev){
			ACMV.search.order.push({
				criteria: ev.currentTarget.getAttribute('data-sort-criteria-name'),
				asc: true
			});
			updateSorter();
		});
		unusedCriteriaList.appendChild(criteria);
	}
	updateMasteries();
}

// group
function updateSearchGroup(select)
{
	for(var i=0;i<select.length;i++)
	{
		if(select[i].selected)
		{
			ACMV.search.group = select[i].value;
			break;
		}
	}
	updateMasteries();
}

function groupMasteries(masteries)
{
	if(ACMV.search.group == '')
		return [{name:'',masteries:masteries}];
	var groups = {};
	for(var i=0;i<masteries.length;i++)
	{
		var k = ACMV.sorting.group[ACMV.search.group](masteries[i]);
		if(typeof(groups[k.id]) === 'undefined')
			groups[k.id] = {name:k.name,masteries:[]};
		groups[k.id].masteries.push(masteries[i]);
	}
	return groups;
}

// masteries display
function buildMastery(mastery)
{
	var container = document.createElement('div');
	addClassTo(container, 'mastery-element');
	// champion
	var champion = document.createElement('div');
	addClassTo(champion, 'champion');
	if(Champions.isFree(mastery.championId))
	addClassTo(champion, 'free-champion');
	container.appendChild(champion);
	// champion icon
	var iconContainer = document.createElement('div');
	addClassTo(iconContainer, 'champion-icon');
	champion.appendChild(iconContainer);
	var icon = document.createElement('img');
	iconContainer.appendChild(icon);
	icon.src = 'http://ddragon.leagueoflegends.com/cdn/6.7.1/img/champion/' + Champions.keys[mastery.championId] + '.png';
	icon.alt = Champions.names[mastery.championId] + ' icon';
	// mastery icon
	var masteryIcon = document.createElement('img');
	addClassTo(masteryIcon, 'mastery-icon');
	champion.appendChild(masteryIcon);
	masteryIcon.src = '/lol/mastery/img/mastery_' + mastery.championLevel + '.png';
	masteryIcon.alt = 'Mastery level ' + mastery.championLevel;
	// champion name
	var championName = document.createElement('div');
	addClassTo(championName, 'champion-name');
	champion.appendChild(championName);
	championName.appendChild(document.createTextNode(Champions.names[mastery.championId]));
	// mastery info
	var masteryInfo = document.createElement('div');
	addClassTo(masteryInfo, 'mastery-info');
	container.appendChild(masteryInfo);
	// xp
	var xp = document.createElement('div');
	addClassTo(xp, 'mastery-xp');
	masteryInfo.appendChild(xp);
	var neededXp = ACMV.xpNeededCumulated[mastery.championLevel];
	xp.appendChild(document.createTextNode(mastery.championPoints + (neededXp!=0?('/' + neededXp):'')));
	// highestGrade
	if('highestGrade' in mastery)
	{
		var highestGrade = document.createElement('div');
		addClassTo(highestGrade, 'mastery-highest-grade');
		masteryInfo.appendChild(highestGrade);
		highestGrade.appendChild(document.createTextNode(mastery.highestGrade));
	}
	// level progress
	var levelProgress = document.createElement('div');
	addClassTo(levelProgress, 'mastery-level-progress');
	masteryInfo.appendChild(levelProgress);
	neededXp = ACMV.xpNeeded[mastery.championLevel];
	levelProgress.appendChild(document.createTextNode(neededXp==0?'100%':Math.round(mastery.championPointsSinceLastLevel / neededXp * 100) + '%'));
	/*
	championId
	championLevel
	championPoints
	championPointsSinceLastLevel
	championPointsUntilNextLevel
	chestGranted
	highestGrade
	lastPlayTime
	*/
	return container;
}

function updateMasteries()
{
	ACMV.spreadGroups = [];
	if(ACMV.masteries.length == 0)
		return;
	var out = getContentDiv();
	while(out.firstChild)
		out.removeChild(out.firstChild);
	var masteries = [];
	for(var i=0;i<ACMV.masteries.length;i++)
	{
		var m = ACMV.masteries[i];
		if(!isFiltered(m))
			masteries.push(m);
	}
	var groups = groupMasteries(masteries);
	for(var k in groups)
	{
		if(groups[k].name != '')
		{
			var groupName = document.createElement('div');
			addClassTo(groupName, 'subtitle');
			groupName.appendChild(document.createTextNode(groups[k].name));
			out.appendChild(groupName);
			out.appendChild(document.createElement('br'));//line break because subtitles are not blocks
			groupName.setAttribute('data-corresponding-group-id', 'group-' + k);
			groupName.addEventListener('click', function(ev){
				toggleVisibility(ev.currentTarget.getAttribute('data-corresponding-group-id'));
			});
		}
		var group = document.createElement('div');
		addClassTo(group, 'group');
		group.id = 'group-' + k;
		ACMV.spreadGroups.push(group);
		out.appendChild(group);
		masteries = sortMasteries(groups[k].masteries);
		for(var i=0;i<masteries.length;i++)
			group.appendChild(buildMastery(masteries[i]));
	}
	spreadGroups();
}

function showMasteries(name, region)
{
	if(name == '' || name.length < 4)
		return;
	setLoading(true);
	getMasteries(name, region, function(result){
		resetMasteries(JSON.parse(result));
		setLoading(false);
	}, function(code, result){
		setContent('Error ' + code + ', got message:<br>' + result);
		setLoading(false);
	});
}

function submitSummoner()
{
	var name = document.getElementById('name-input').value,
		regionPicker = document.getElementById('region-picker'),
		region = '';
	for(var i=0;i<regionPicker.length;i++)
		if(regionPicker[i].selected)
		{
			region = regionPicker[i].value;
			break;
		}
	//console.log('Getting masteries of ' + name + ' from ' + region);
	showMasteries(name, region);
}

ACMV = {
	masteries:[],
	search:{
		filter:{},
		order:[],
		group:''
	},
	customList:[],
	grades:['S+','S','S-','A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','Ø'],
	roles:['Assassin','Fighter','Mage','Marksman','Melee','Support','Tank'],
	xpNeeded:[0,1800,4200,6600,9000,0],
	xpNeededCumulated:[0,1800,6000,12600,21600,0],
	spreadGroups:[],
	sorting:{
		filter:{
			free:function(m){
				return Champions.isFree(m.championId);
			},
			customList:function(m){
				return ACMV.customList.indexOf(m.championId) != -1;
			},
			level:function(m, levels){
				return levels.indexOf(m.championLevel) != -1;
			},
			role:function(m, roles){
				var championRoles = Champions.roles[m.championId];
				for(var i=0;i<championRoles.length;i++)
					if(roles.indexOf(championRoles[i]) != -1)
						return true;
				return false;
			},
			chest:function(m){
				return m.chestGranted;
			},
			notPlayedSince:function(m, time){
				return m.lastPlayTime < time;
			},
			notPlayedBefore:function(m, time){
				return m.lastPlayTime > time;
			},
			grade:function(m, grades){
				if(!('highestGrade' in m))
					return grades.indexOf('') != -1;
				return grades.indexOf(m.highestGrade) != -1;
			}
		},
		order:{
			name:function(m1, m2){
				var m1name = Champions.names[m1.championId],
					m2name = Champions.names[m2.championId];
				return m1name == m2name?0:(m1name < m2name?-1:1);
			},
			free:function(m1, m2){
				var m1free = Champions.isFree(m1.championId);
				return m1free == Champions.isFree(m2.championId)?0:(m1free?-1:1);
			},
			customList:function(m1, m2){
				return (ACMV.customList.indexOf(m1.championId)==-1?0:-1) - (ACMV.customList.indexOf(m2.championId)==-1?0:-1);
			},
			level:function(m1, m2){
				return m1.championLevel - m2.championLevel;
			},
			role:function(m1, m2){
				var m1role = Champions.roles[m1.championId][0],
					m2role = Champions.roles[m2.championId][0];
				return m1role == m2role?0:(m1role < m2role?-1:1);
			},
			chest:function(m1, m2){
				return m1.chestGranted == m2.chestGranted?0:(m1.chestGranted?-1:1);
			},
			lastPlayed:function(m1, m2){
				return m1.lastPlayTime - m2.lastPlayTime;
			},
			grade:function(m1, m2){
				if(!('highestGrade' in m1) && !('highestGrade' in m2))
					return 0;
				if(!('highestGrade' in m1) && ('highestGrade' in m2))
					return 1;
				if(('highestGrade' in m1) && !('highestGrade' in m2))
					return -1;
				return ACMV.grades.indexOf(m1.highestGrade) - ACMV.grades.indexOf(m2.highestGrade);
			}
		},
		group:{
			free:function(m){
				return Champions.isFree(m.championId)?{id:0,name:'Free'}:{id:1,name:'Not free'};
			},
			customList:function(m){
				var id = ACMV.customList.indexOf(m.championId)==-1?1:0;
				return {id:id,name:((id?'Not in':'In') + ' custom list')};//TODO
			},
			level:function(m){
				return {id:(5-m.championLevel),name:(m.championLevel==0?'No mastery':('Mastery level ' + m.championLevel))};
			},
			role:function(m){
				var role = Champions.roles[m.championId][0];
				return {id:ACMV.roles.indexOf(role),name:role};
			},
			chest:function(m){
				return ('chestGranted' in m && m.chestGranted)?{id:0,name:'Chest granted'}:{id:1,name:'Chest not granted'};
			},
			lastPlayedDay:function(m){
				var oneDayMs = 1000*60*60*24;
				var elapsed = (floorTo(time(), oneDayMs) - floorTo(m.lastPlayTime, oneDayMs)) / oneDayMs;
				var name = '';
				switch(elapsed)
				{
				case 0:
					name = 'Today';
					break;
				case 1:
					name = 'Yesterday';
					break;
				default:
					name = elapsed + ' days ago';
				}
				return {id:elapsed,name:name};
			},
			lastPlayedWeek:function(m){
				var oneWeekMs = 1000*60*60*24*7;
				var offset = 1000*60*60*24*3;//because january 1st 1970 was a thursday, we need to offset the times so weeks start on monday
				var elapsed = ((floorTo(time() + offset, oneWeekMs)) - (floorTo(m.lastPlayTime + offset, oneWeekMs))) / oneWeekMs;
				var name = '';
				switch(elapsed)
				{
				case 0:
					name = 'This week';
					break;
				case 1:
					name = 'Last week';
					break;
				default:
					name = elapsed + ' weeks ago';
				}
				return {id:elapsed,name:name};
			},
			lastPlayedMonth:function(m){
				var now = new Date();
				var lastPlayed = new Date(m.lastPlayTime);
				var elapsed = (now.getFullYear() - lastPlayed.getFullYear()) * 12 + now.getMonth() - lastPlayed.getMonth();
				var name = '';
				switch(elapsed)
				{
				case 0:
					name = 'This month';
					break;
				case 1:
					name = 'Last month';
					break;
				default:
					name = elapsed + ' months ago';
				}
				return {id:elapsed,name:name};
			},
			grade:function(m){
				if(!('highestGrade' in m))
					return {id:ACMV.grades.length,name:ACMV.grades[ACMV.grades.length-1]};
				return {id:ACMV.grades.indexOf(m.highestGrade),name:m.highestGrade};
			}
		}
	}
};

for(var k in ACMV.sorting.filter)
	ACMV.search.filter[k] = null;
ACMV.search.filter.level = [1,2,3,4,5];

Champions.isFree = function(championId){
	return Champions.free.indexOf(championId) != -1;
};

window.addEventListener('resize', spreadGroups);