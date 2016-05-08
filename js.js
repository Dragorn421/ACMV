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

// get GET parameters
// from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url)
{
	if(!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if(!results)
		return null;
	if(!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// set a new get query
function setGetQuery(query)
{
	var url = 'http://' + window.location.host + window.location.pathname + query;
	if(window.location.href.toLowerCase() != url.toLowerCase())// so there aren't multiple times the same summoner in a row
		window.history.pushState(null, '', url);
}

// IE is the worst
// from http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery/21712356#21712356
function detectIE()
{
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if(msie > 0)
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    var trident = ua.indexOf('Trident/');
    if(trident > 0)
	{
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }
    var edge = ua.indexOf('Edge/');
    if(edge > 0)
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    return false;
}

function removeElement(e)
{
	if('remove' in e)
		e.remove();
	else
		e.parentNode.removeChild(e);
}

// change static data origin
function setStaticData(region, language)
{
	// if data already loaded
	if((language in ACMV.champions) && (region in ACMV.champions[language]))
	{
		Champions = ACMV.champions[language][region];
		return;
	}
	var scriptSrc = 'static/' + region + '_' + language + '_champions.js';
	// http://stackoverflow.com/questions/8586446/dynamically-load-external-javascript-file-and-wait-for-it-to-load-without-usi
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.onreadystatechange = script.onload = function() {
		if(!script.readyState || /loaded|complete/.test(script.readyState))
		{
			// script has been executed, champions data has been updated
			Champions.isFree = function(championId){
				return Champions.free.indexOf(championId) != -1;
			};
			ACMV.champions[language][region] = Champions;
			updateMasteries();
		}
	};
	script.src = scriptSrc;
	document.getElementsByTagName('head')[0].appendChild(script);
}

// get scrolling
function getScrollX()
{
	if('pageXOffset' in window)
		return window.pageXOffset;
	else if('scrollX' in window)
		return window.scrollX;
	else if('scrollLeft' in document.body)
		return document.body.scrollLeft;
	return 0;
}

function getScrollY()
{
	if('pageYOffset' in window)
		return window.pageYOffset;
	else if('scrollY' in window)
		return window.scrollY;
	else if('scrollTop' in document.body)
		return document.body.scrollTop;
	return 0;
}

// scroll to content
function scrollToContent()
{
	var content = getContentDiv();
	// setting scroll animation parameters
	ACMV.scroll = {};
	ACMV.scroll.start = time();
	ACMV.scroll.fromY = getScrollY();
	// -50 because if the loading animation is shown it will move the page after disappearing
	ACMV.scroll.offsetY = content.getBoundingClientRect().top - 50;
	// wanted scroll speed: 2000 px/s -> v = d/t -> 2000 = offsetY/duration
	// -> duration = offsetY/2000
	// but duration should be mesured in milliseconds
	// -> duration = offsetY/2000*1000 -> duration = offsetY/2
	ACMV.scroll.duration = ACMV.scroll.offsetY / 2;
	ACMV.scroll.intervalId = setInterval(function(){
		// get elapsed time, check if animation should end
		var elapsed = time() - ACMV.scroll.start;
		if(elapsed > ACMV.scroll.duration)
		{
			clearInterval(ACMV.scroll.intervalId);
			ACMV.scroll.intervalId = null;
			return;
		}
		// change the new scroll height depending on elapsed time and previously set parameters
		var y = ACMV.scroll.fromY + elapsed / ACMV.scroll.duration * ACMV.scroll.offsetY;
		if('scrollTop' in document.body)
			document.body.scrollTop = y;
		else
			window.scroll(getScrollX(), y);
	},1000/60);// 60 fps
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

// integrated help
function setShowHelp(help)
{
	if(help)
	{
		// add the help elements
		var helpElements = ACMV.help.elements;
		for(var i=0;i<helpElements.length;i++)
		{
			var h = helpElements[i];
			var helpContainer = document.createElement('div');
			helpContainer.id = 'help-for-' + h.attachTo + (('n' in h)?h.n:'');
			addClassTo(helpContainer, 'integrated-help');
			document.body.appendChild(helpContainer);
			helpContainer.appendChild(document.createTextNode(h.text));
			if('textAlign' in h)
				helpContainer.style.textAlign = h.textAlign;
			if('maxWidth' in h)
				helpContainer.style.maxWidth = h.maxWidth + ((typeof h.maxWidth == 'number')?'px':'');
		}
		// put some spaces for the help elements
		var putSpace = ACMV.help.putSpace;
		for(var i=0;i<putSpace.length;i++)
		{
			for(var j=0;j<putSpace[i].elements.length;j++)
				document.getElementById(putSpace[i].elements[j]).style['margin-' + putSpace[i].side] = putSpace[i].space + 'px';
		}
		// make the positions update
		window.addEventListener('resize', function(){
			updateIntegratedHelpPositions();
		});
		updateIntegratedHelpPositions();
	}
	else
	{
		window.removeEventListener('resize', updateIntegratedHelpPositions);
		// remove all help
		var helpElements = document.getElementsByClassName('integrated-help');
		while(helpElements.length != 0)// helpElements is a HTMLCollection, not an array
			removeElement(helpElements[0]);
		// remove spaces for the help elements
		var putSpace = ACMV.help.putSpace;
		for(var i=0;i<putSpace.length;i++)
		{
			for(var j=0;j<putSpace[i].elements.length;j++)
				document.getElementById(putSpace[i].elements[j]).style['margin-' + putSpace[i].side] = '';
		}
	}
}

function updateIntegratedHelpPositions()
{
	var helpElements = ACMV.help.elements;
	// get scrolling
	var scrollX = getScrollX(), scrollY = getScrollY();
	for(var i=0;i<helpElements.length;i++)
	{
		var h = helpElements[i];
		var attach = document.getElementById(h.attachTo),
			helpContainer = document.getElementById('help-for-' + h.attachTo + (('n' in h)?h.n:''));
		// if attached element exists
		if(attach)
		{
			for(var j=0;j<2;j++)// do it two times because moving the element changes its size
			{
				var attachPosition = attach.getBoundingClientRect(),
					helpContainerPosition = helpContainer.getBoundingClientRect();
				var x = 0, y = 0;
				// horizontal align
				switch(h.align)
				{
				case 'left':
					x = attachPosition.left;
					break;
				case 'center':
					x = attachPosition.left + (attachPosition.width - helpContainerPosition.width) / 2;
					break;
				case 'right':
					x = attachPosition.right - helpContainerPosition.width;
					break;
				}
				// vertical align
				switch(h.verticalAlign)
				{
				case 'top':
					y = attachPosition.top - helpContainerPosition.height - 5;
					break;
				case 'middle':
					y = attachPosition.top + (attachPosition.height - helpContainerPosition.height) / 2;
					break;
				case 'bottom':
					y = attachPosition.bottom + 5;
					break;
				}
				x += scrollX;
				y += scrollY;
				// set coordinates of div
				helpContainer.style.left = x + 'px';
				helpContainer.style.right = '';
				helpContainer.style.top = y + 'px';
				helpContainer.style.bottom = '';
			}
		}
		// if attached element is not present, hide help
		else
		{
			helpContainer.style.left = '';
			helpContainer.style.right = '0';
			helpContainer.style.top = '';
			helpContainer.style.bottom = '0';
		}
	}
}

// custom list
function setEnableCustomList(enable)
{
	ACMV.enableCustomList = enable;
	if(enable)
	{
		document.getElementById('search-filter-customList').style.display = '';
		var groupSelect = document.getElementById('search-group').firstElementChild;
		for(var i=0;i<groupSelect.length;i++)
		{
			if(groupSelect[i].value == 'customList')
			{
				groupSelect[i].disabled = false;
				break;
			}
		}
	}
	else
	{
		document.getElementById('search-filter-customList').style.display = 'none';
		var groupSelect = document.getElementById('search-group').firstElementChild;
		for(var i=0;i<groupSelect.length;i++)
		{
			if(groupSelect[i].value == 'customList')
			{
				groupSelect[i].disabled = true;
				break;
			}
		}
	}
	updateSorter();
	updateMasteries();
}

function loadCustomList()
{
	if(ACMV.enableCustomList)
	{
		ACMV.customList = JSON.parse(localStorage.getItem('customlist'));
		if(!ACMV.customList)
			ACMV.customList = [];
	}
	else
		ACMV.customList = [];
}

function saveCustomList()
{
	if(ACMV.enableCustomList)
	{
		if(ACMV.customList == [])
			localStorage.removeItem('customlist');
		else
			localStorage.setItem('customlist', JSON.stringify(ACMV.customList));
	}
}

// set input to be a date input
function setDateInput(input, filter)
{
	parent = input.parentNode;
	input.rome = rome(input, {
			autoClose:false,
			appendTo:parent,
			inputFormat:'MMMM D, YYYY - HH:mm'
		});
	input.onchange = function(){
		updateSearchFilterInput(filter,
								input,
								function(str){
									return input.rome.getDate();
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
	// using v parameter as a version number i can change as i want,
	// so i can force the client cache to "forget" in case something happens
	xhr.open('GET', 'getmasteries.php?v=1&name=' + encodeURIComponent(name) + '&region=' + region, true);
	xhr.send();
}

function resetMasteries(newMasteries)
{
	ACMV.masteries = newMasteries;
	// adding all champions which have no mastery
	championsWithMastery = [];
	for(var i=0;i<ACMV.masteries.length;i++)
	{
		championsWithMastery.push(ACMV.masteries[i].championId);
	}
	for(var id in Champions.names)
	{
		id = parseInt(id);//even if id is numeric, keys are strings
		if(championsWithMastery.indexOf(id) == -1)
		{
			ACMV.masteries.push({championId:id,championLevel:0,championPoints:0,lastPlayTime:0,championPointsSinceLastLevel:0,championPointsUntilNextLevel:0,chestGranted:false});
		}
	}
	updateMasteries();
}

// search saver
function restoreSearch(search)
{
	var updateExisting = !search;
	if(updateExisting)
		search = ACMV.search;
	else
		ACMV.search = search;
	// filter
	for(var k in ACMV.sorting.filter)
	{
		var filter = k in search.filter?search.filter[k]:null;
		var input = document.getElementById('search-filter-' + k).firstElementChild;
		if(input.tagName == 'INPUT')
		{
			if(filter === null)
				input.value = '';
			else
			{
				if('rome' in input)
				{
					var date = new Date(filter);
					input.rome.setValue(date);
					input.rome.emitValues();
					//newest	input.value = date.toString().split(' ')[1] + ' ' + date.getDay() + ', ' + date.getFullYear() + ' - ' + (date.getHours()>9?'':'0') + date.getHours() + ':' + (date.getMinutes()>9?'':'0') + date.getMinutes();
					//default	input.value = date.getFullYear() + '-' + (date.getMonth()>8?'':'0') + (date.getMonth() + 1) + '-' + (date.getDate()>9?'':'0') + date.getDate() + ' ' + (date.getHours()>9?'':'0') + date.getHours() + ':' + (date.getMinutes()>9?'':'0') + date.getMinutes();
				}
				else
					input.value = filter;
			}
		}
		else if(input.tagName == 'SELECT')
		{
			if(filter === null)
			{
				// select none
				for(var i=0;i<input.length;i++)
					input[i].selected = false;
				// if not multiple, select the first
				if(!input.multiple)
					input[0].selected = true;
			}
			else
			{
				// slice(0) clones the array (needed so in the end numbers don't become strings)
				var select = input.multiple?filter.slice(0):[filter];
				if(!select)
					select = [];
				// convert values to string to allow comparison with option values later
				for(var i=0;i<select.length;i++)
					select[i] += '';
				for(var i=0;i<input.length;i++)
					input[i].selected = select.indexOf(input[i].value) != -1;//set selected if in select list
			}
		}
	}
	// sort
	updateSorter();
	// group
	var groupSelect = document.getElementById('search-group').firstElementChild;
	for(var i=0;i<groupSelect.length;i++)
		groupSelect[i].selected = groupSelect[i].value == search.group;
	if(!updateExisting)
		updateMasteries();
}

// filter
function updateSearchFilterInput(filter, input, converter)
{
	ACMV.search.filter[filter] = converter != null?converter(input.value):input.value;
	// do not keep null values
	if(ACMV.search.filter[filter] === null)
		delete(ACMV.search.filter[filter]);
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
	// do not keep null values
	if(ACMV.search.filter[filter] === null)
		delete(ACMV.search.filter[filter]);
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
	// do not keep null values
	if(ACMV.search.filter[filter] === null)
		delete(ACMV.search.filter[filter]);
	updateMasteries();
}

function isFiltered(mastery)
{
	for(var k in ACMV.search.filter)
	{
		// if filter is set (not ignored)
		if(k in ACMV.search.filter)
		{
			var f = ACMV.search.filter[k];
			// if filter value is boolean
			if(f === true || f === false)
			{
				// can't return the output of the function directly, we want to return false only at the end if the mastery didn't get filtered at all
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
		removeElement(criteriaStack.firstChild);
	var unusedCriteriaList = document.getElementById('search-sort-unused-criteria');
	while(unusedCriteriaList.firstChild)
		removeElement(unusedCriteriaList.firstChild);
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
			updateMasteries();
			ev.stopPropagation();
		});
		criteria.appendChild(ordering);
		criteria.setAttribute('data-sort-order-key', k);
		criteria.addEventListener('click', function(ev){
			var k = parseInt(ev.currentTarget.getAttribute('data-sort-order-key'));
			ACMV.search.order.splice(k, 1);
			updateSorter();
			updateMasteries();
		});
		criteriaStack.appendChild(criteria);
		var i = unused.indexOf(order.criteria);
		if(i != -1)
			unused.splice(i, 1);
	}
	for(var i=0;i<unused.length;i++)
	{
		var k = unused[i];
		if(!ACMV.enableCustomList && k == 'customList')// do not show custom list if disabled
			continue;
		var criteria = document.createElement('div');
		criteria.appendChild(document.createTextNode(criteriaNames[k] + ' +'));
		criteria.setAttribute('data-sort-criteria-name', k);
		criteria.addEventListener('click', function(ev){
			ACMV.search.order.push({
				criteria: ev.currentTarget.getAttribute('data-sort-criteria-name'),
				asc: true
			});
			updateSorter();
			updateMasteries();
		});
		unusedCriteriaList.appendChild(criteria);
	}
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
	// if no grouping needed, return all masteries in the same group
	if(ACMV.search.group == '')
		return [{	name: masteries.length + ' champion' + (masteries.length==1?'':'s'),
					masteries: masteries}];
	// group masteries
	var groups = {};
	for(var i=0;i<masteries.length;i++)
	{
		var k = ACMV.sorting.group[ACMV.search.group](masteries[i]);
		// if group doesn't already exist, create it
		if(typeof(groups[k.id]) === 'undefined')
			groups[k.id] = {name: k.name, masteries: []};
		// add the mastery to the group
		groups[k.id].masteries.push(masteries[i]);
	}
	// append champions amount for each group
	for(var k in groups)
		groups[k].name += ' (' + groups[k].masteries.length + ')';
	return groups;
}

// masteries display
function getCircularProgress(percentage)
{
	var width = 90, height = 90;
	if(percentage == 0)
	{
		var elem = document.createElement('div');
		addClassTo(elem, 'progress-circular');
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		return elem;
	}
	var canvas = document.createElement('canvas');
	addClassTo(canvas, 'progress-circular');
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.strokeStyle = "#2e9fd1";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(width/2, height/2, 18, -Math.PI / 2, Math.PI * (2 * percentage / 100 - 0.5));
	ctx.stroke();
	ctx.closePath();
	return canvas;
}

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
	icon.src = 'http://ddragon.leagueoflegends.com/cdn/' + ACMV.currentPatch + '/img/champion/' + Champions.keys[mastery.championId] + '.png';
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
	xp.appendChild(document.createTextNode(mastery.championLevel==0?'':(mastery.championPoints + (neededXp!=0?('/' + neededXp):''))));
	// level progress percentage
	var levelProgress = document.createElement('div');
	addClassTo(levelProgress, 'mastery-level-progress');
	masteryInfo.appendChild(levelProgress);
	neededXp = ACMV.xpNeeded[mastery.championLevel];
	// if mastery 0 -> 0%, if highest mastery level -> 100%, otherwise level progress percentage
	var progressPercentage = mastery.championLevel==0?0:(neededXp==0?100:Math.round(mastery.championPointsSinceLastLevel / neededXp * 100));
	levelProgress.appendChild(document.createTextNode(mastery.championLevel==0?'No mastery':(progressPercentage + '%')));
	// highestGrade
	var highestGrade = document.createElement('div');
	addClassTo(highestGrade, 'mastery-highest-grade');
	masteryInfo.appendChild(highestGrade);
	highestGrade.appendChild(document.createTextNode('highestGrade' in mastery?mastery.highestGrade:''));
	// add or remove to/from custom list
	if(ACMV.enableCustomList)
	{
		var customListEdit = document.createElement('div');
		addClassTo(customListEdit, 'custom-list-edit');
		masteryInfo.appendChild(customListEdit);
		customListEdit.appendChild(document.createTextNode(ACMV.customList.indexOf(mastery.championId)==-1?'+':'−'));
		customListEdit.addEventListener('click', function(){
			var i = ACMV.customList.indexOf(mastery.championId);
			if(i == -1)
				ACMV.customList.push(mastery.championId);
			else
				ACMV.customList.splice(i, 1);
			saveCustomList();
			updateMasteries();
		});
	}
	// level progress circular
	var levelProgressCircular = getCircularProgress(progressPercentage);
	masteryInfo.appendChild(levelProgressCircular);
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
	setStaticData(region, 'en_US');
	getMasteries(name, region, function(result){
		resetMasteries(JSON.parse(result));
		setLoading(false);
		scrollToContent();
	}, function(code, result){
		setContent('Error ' + code + ', got message:<br>' + result);
		setLoading(false);
		scrollToContent();
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
	setGetQuery('?s=' + encodeURIComponent(name.toLowerCase()) + (region=='euw'?'':'&r=' + encodeURIComponent(region)));
	showMasteries(name, region);
}

function onBodyLoaded()
{
	//TODO maybe rework inputs
	if(detectIE() !== false)
		alert('You seem to be using Internet Explorer or Edge. These navigators don\'t work too well with ACMV. You have been warned!');
	// when the cursor leaves a select before releasing click masteries do not update, this will at least rollback user changes to show him it didnt work
	window.addEventListener('mouseup', function(ev){
		// use setTimeout() so restoreSearch() is called after inputs process changes
		setTimeout(function(){
			restoreSearch();
		}, 0);
	});
	// make it so masteries are equally spread
	window.addEventListener('resize', spreadGroups);
	// local storage
	if('localStorage' in window)
	{
		var localStorageAllowed = localStorage.getItem('localStorageAllowed') !== null;
		if(!localStorageAllowed)
		{
			document.getElementById('for-the-cookie-law').style.display = 'block';
			document.getElementById('accept-cookies').addEventListener('click', function() {
				localStorage.setItem('localStorageAllowed', 'true');
				document.getElementById('for-the-cookie-law').style.display = '';
				setEnableCustomList(true);
			});
		}
		setEnableCustomList(localStorageAllowed);
		loadCustomList();
	}
	else
		setEnableCustomList(false);
	// 
	var toggleHelp = document.getElementById('toggle-help');
	toggleHelp.addEventListener('click', function(ev){
		ACMV.help.shown = !ACMV.help.shown;
		removeElement(ev.target.firstChild);
		ev.target.appendChild(document.createTextNode(ACMV.help.shown?'Hide help':'Show help'));
		setShowHelp(ACMV.help.shown);
	});
	// use default search
	restoreSearch();
	// enable name picker use
	var pickNameForm = document.getElementById('pick-name-form');
	pickNameForm.submit = function(){
		submitSummoner();
		return false;
	};
	pickNameForm.addEventListener('submit', pickNameForm.submit);
	// check if query contains summoner
	var summoner = getParameterByName('s');
	if(summoner)
	{
		document.getElementById('name-input').value = summoner;
		var region = getParameterByName('r');
		if(region)
			region = region.toLowerCase();
		else
			region = 'euw';
		var regionPicker = document.getElementById('region-picker');
		for(var i=0;i<regionPicker.length;i++)
			if(regionPicker[i].value == region)
			{
				regionPicker[i].selected = true;
				break;
			}
		pickNameForm.submit();
	}
}

// main object: stores all needed data
ACMV = {
	// current user data
	masteries:[],
	defaultSearch:{
		filter:{},// is set below
		order:[],
		group:''
	},
	search:{
		filter:{},
		order:[],
		group:''
	},
	enableCustomList:false,
	customList:[],
	// static data
	currentPatch:Champions.patch,// set current patch based on champion data version
	grades:['S+','S','S-','A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-',''],
	roles:['Assassin','Fighter','Mage','Marksman','Melee','Support','Tank'],
	xpNeeded:[0,1800,4200,6600,9000,0],
	xpNeededCumulated:[0,1800,6000,12600,21600,0],
	champions:{'en_US':{euw:Champions}},
	// help
	help:{
		shown:false,
		elements:[{attachTo:'name-input',					text:'1. Choose a summoner name',									align:'left',	verticalAlign:'top',						maxWidth:400},
				{attachTo:'region-picker',					text:'2. Pick a region',											align:'center',	verticalAlign:'bottom',	textAlign:'center',	maxWidth:70},
				{attachTo:'submit-name',					text:'3. Click here!',												align:'center',	verticalAlign:'top',	textAlign:'center',	maxWidth:70},
				{attachTo:'search-filter-title',			text:'Here you can choose what champions should be shown or not.',	align:'center',	verticalAlign:'bottom',	textAlign:'center'},
				{attachTo:'search-filter-free',				text:'Show only free or only not free champions.',					align:'center',	verticalAlign:'top',	textAlign:'center',	maxWidth:150},
				{attachTo:'search-filter-chest',			text:'Show only champions whose chest has been granted or not.',	align:'center',	verticalAlign:'top',	textAlign:'center',	maxWidth:150},
				{attachTo:'search-filter-customList',		text:'Show only champions who are or aren\'t in your custom list.',	align:'center',	verticalAlign:'top',	textAlign:'center',	maxWidth:150},
				{attachTo:'search-filter-notPlayedBefore',	text:'Show only champions who were last played before this date.',	align:'right',	verticalAlign:'top',	textAlign:'right',	maxWidth:300},
				{attachTo:'search-filter-notPlayedSince',	text:'Show only champions who were last played after this date.',	align:'left',	verticalAlign:'top',	textAlign:'right',	maxWidth:300},
				{attachTo:'search-filter-level', n:0,		text:'Select multiple items by holding down click and drag the cursor, or press control then click to select/unselect one.',
																																align:'left',	verticalAlign:'top',	textAlign:'left'},
				{attachTo:'search-filter-level', n:1,		text:'Show only champions whose mastery level is selected.',		align:'right',	verticalAlign:'bottom',	textAlign:'right',	maxWidth:300},
				{attachTo:'search-filter-role',				text:'Show only champions whose role is selected.',					align:'right',	verticalAlign:'bottom',	textAlign:'right',	maxWidth:300},
				{attachTo:'search-filter-grade',			text:'Show only champions whose best grade is selected.',			align:'center',	verticalAlign:'top'},
				{attachTo:'search-sort-title',				text:'Here you can choose the way the champions will be sorted. The champions are sorted using the criteria in the top-down order of the selected list. For example if you sort by Free then by Name it will put all the free champions first, ordered by name, then all the non-free champions, ordered by name too.',
																																align:'center',verticalAlign:'bottom',	textAlign:'center'},
				{attachTo:'search-group-title',				text:'Here you can group champions per criteria. Each group will be named after the criteria value, you can hide a group by clicking on the group name.',
																																align:'center',verticalAlign:'bottom',	textAlign:'center'},
				{attachTo:'content',						text:'Here are all the masteries of the summoner. When hovering a champion, you can see the mastery points earned, the current level progress, and the best grade with this champion if any. If you accepted the use of local storgae there is a + sign that will add the champion to your custom list. To remove a champion from your custom list click the - sign that appears instead of the +. This custom list is saved locally and will remain after you leave the page.',
																																align:'center',	verticalAlign:'top'}],
		putSpace:[	{elements:['search-filter-title'],	space:40,	side:'bottom'},
					{elements:['search-sort-title'],	space:85,	side:'bottom'},
					{elements:['search-group-title'],	space:65,	side:'bottom'},
					{elements:['search-filter-free', 'search-filter-customList', 'search-filter-level', 'search-filter-role', 'search-filter-chest', 'search-filter-notPlayedSince', 'search-filter-notPlayedBefore', 'search-filter-grade'],
														space:75,	side:'top'},
					{elements:['content'],				space:150,	side:'top'}]
	},
	// current groups, to be used by spreadGroups() function
	spreadGroups:[],
	// all functions that allow filter/order/group of masteries
	sorting:{
		// filter functions return true if the mastery correspond to the criteria
		// functions which criteria isn't based on true/false get a second argument representing what should be allowed
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
		// order functions are comparators for each criteria
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
		// group functions associate a mastery to a group id (one per group) and name for the group
		group:{
			free:function(m){
				return Champions.isFree(m.championId)?{id:0,name:'Free'}:{id:1,name:'Not free'};
			},
			customList:function(m){
				var id = ACMV.customList.indexOf(m.championId)==-1?1:0;
				return {id:id,name:((id?'Not in':'In') + ' custom list')};
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
				// the goal here is not to divide the time in 24 hours segment backward starting from the current time,
				// we want to make it so a day starts at midnight and lasts 24 hours. use of floorTo() rounds to nearest
				// oldest midnight, so we count the amount of midnights that passed by between the two times
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
				var offset = 1000*60*60*24*3;
				// because january 1st 1970 was a thursday, we need to offset the times so weeks start on monday
				// and we use floorTo() for the same reasons as above, to make all weeks start on monday and last 7 days.
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
				// making use of Date here, because the amount of days in a month is not regular
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
					return {id:ACMV.grades.length,name:'No grade'};
				return {id:ACMV.grades.indexOf(m.highestGrade),name:m.highestGrade};
			}
		}
	}
};

// set default search (will be applied after the body loads)
ACMV.defaultSearch.filter = {
	level:[1,2,3,4,5],
	role:ACMV.roles,
	grade:ACMV.grades
}
ACMV.search = ACMV.defaultSearch;

// add isFree()
Champions.isFree = function(championId){
	return Champions.free.indexOf(championId) != -1;
};
