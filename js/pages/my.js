var gIMAGE_PARAMS = {
		offsetElem: 180,
		offsetLine: 25,
		nbTanksByLine: 3
	};
	//gTankTiersAllowedForResume = [4, 6, 7, 8, 10];

var applyTableTanksFilters = function(filter) {
	var myElems = $('.tank'),
		myFilteredElems = myElems;
	// Reduce elements by filter
	if (filter.isfull) {
		myFilteredElems = myFilteredElems.filter('.isfull');
	}
	if (filter.isready) {
		myFilteredElems = myFilteredElems.filter('.isready');
	}
	if (filter.ingarage) {
		myFilteredElems = myFilteredElems.filter('.ingarage');
	}
	if (filter.tanklevel != 'all') {
		myFilteredElems = myFilteredElems.filter('.tanklevel' + filter.tanklevel);
	}
	if (filter.tanktype != 'all') {
		myFilteredElems = myFilteredElems.filter('.tanktype' + filter.tanktype);
	}
	// Hide all elements
	myElems.addClass('hidden');
	// And show filtered elements
	myFilteredElems.removeClass('hidden');
};

var getTankAdditionalInfos = function(pTankID, pTanksAdditionalInfos) {
	var i = 0;
	for (i=0; i<pTanksAdditionalInfos.length; i++) {
		if (pTanksAdditionalInfos[i].tank_id == pTankID) {
			return pTanksAdditionalInfos[i];
		}
	}
};

var onLoad = function() {
	checkConnected();
	progressNbSteps = 5;
	advanceProgress($.t('loading.claninfos'));
	setNavBrandWithClan(function() {
		var membersList = '',
			isFirst = true;
		for (var i in gClanInfos.members) {
			if (isFirst) {
				isFirst = false;
			} else {
				membersList += ',';
			}
			membersList += gClanInfos.members[i].account_id;
		}
		advanceProgress($.t('loading.membersinfos'));
		$.post(gConfig.WG_API_URL + 'wot/account/info/', {
			application_id: gConfig.WG_APP_ID,
			language: gConfig.G_API_LANG,
			access_token: gConfig.ACCESS_TOKEN,
			account_id: membersList
		}, function(dataPlayersResponse) {
			advanceProgress($.t('loading.generating'));
			gDataPlayers = dataPlayersResponse.data;
		}, 'json');
	});
	advanceProgress($.t('loading.tanksinfos'));
	var myTanksTable = $('#tableMyTanks'),
		myTanksSmallContainer = $('#myTanksContainerSmall'),
		myTanksBigContainer = $('#myTanksContainerBig');
	$('#btnShowTanksTable').on('click', function(evt) {
		var myButton = $(this);
		myButton.siblings().removeClass('active');
		myButton.addClass('active');
		myTanksTable.removeClass('hidden');
		myTanksSmallContainer.addClass('hidden');
		myTanksBigContainer.addClass('hidden');
	});
	$('#btnShowTanksListSmall').on('click', function(evt) {
		var myButton = $(this);
		myButton.siblings().removeClass('active');
		myButton.addClass('active');
		myTanksTable.addClass('hidden');
		myTanksSmallContainer.removeClass('hidden');
		myTanksBigContainer.addClass('hidden');
	});
	$('#btnShowTanksListLarge').on('click', function(evt) {
		var myButton = $(this);
		myButton.siblings().removeClass('active');
		myButton.addClass('active');
		myTanksTable.addClass('hidden');
		myTanksSmallContainer.addClass('hidden');
		myTanksBigContainer.removeClass('hidden');
	});
	var now = moment();
	// Get events on 6 days (because of 12 columns grid system of bootstrap)
	$.post('./server/calendar.php', {
		a: 'list',
		from: now.valueOf(),
		to: moment(now).add(6, 'days').valueOf()
	}, function(calendarDataResponse) {
		if (isDebugEnabled()) {
			logDebug('calendarDataResponse=' + JSON.stringify(calendarDataResponse, null, 4));
		}
		var myEvents = calendarDataResponse.result;
		$('#myCalendar .placeholder').each(function(idx, elem) {
			var myElem = $(elem),
				myDayEventsHtml = '',
				myEvent = {},
				startOfDay = moment(now).add(idx, 'days').startOf('day'),
				endOfDay = moment(startOfDay).endOf('day');
			if (idx != 0) {
				myElem.find('h3').text(startOfDay.format('LL'));
			}
			for (var i=0; i<myEvents.length; i++) {
				myEvent = myEvents[i];
				var myEventStartDate = moment(myEvent.start * 1),
					myEventEndDate = moment(myEvent.end * 1);
				if (myEventStartDate.isBetween(startOfDay, endOfDay)) {
					myDayEventsHtml += '<div data-event-id="' + myEvent.id + '" data-participants="' + Object.keys(myEvent.participants).length + '">';
					myDayEventsHtml += '<h4><span class="label label-default">' + myEventStartDate.format('LT') + '</span> <a href="#" class="lnkShowEvent" data-target="#events-modal" data-toggle="modal" data-event-id="' +  myEvent.id + '">' + myEvent.title + '</a></h4>';
					myDayEventsHtml += '<p>' + myEvent.description + '</p>';
					myDayEventsHtml += '<p>' + $.t('event.participants', { count: Object.keys(myEvent.participants).length }) + '</p>';
					myDayEventsHtml += '</div>';
				}
			}
			if (myDayEventsHtml == '') {
				// No events for this day.
				myDayEventsHtml = '<p>' + $.t('event.noevent') + '</p>';
			}
			myElem.find('h3').after(myDayEventsHtml);
			myElem.find('.lnkShowEvent').on('click', function(evt) {
				evt.preventDefault();
				var myEventId = $(this).data('event-id');
				// Fill modal window
				$.get('./server/calendar.php', {
					a: 'get',
					id: myEventId
				}, function(getEventData) {
					var myDialog = $('#events-modal');
					for (var i=0; i<myEvents.length; i++) {
						if (myEvents[i].id == myEventId) {
							myDialog.find('.modal-header h3').html('<span class="eventTitle">' + myEvents[i].title + '</span> <span class="label label-default eventStartDate" data-date="' + myEvents[i].start + '">' + moment(myEvents[i].start * 1).format('LT') + '</span> - <span class="label label-default eventEndDate" data-date="' + myEvents[i].end + '">' + moment(myEvents[i].end * 1).format('LT') + '</span>');
							break;
						}
					}
					myDialog.find('.modal-body').html(getEventData);
					fillEventDialog(myDialog);
				}, 'html');
			});
		});
		$('#myCalendar').on('click', '.btnEnrol', function(evt) {
			evt.preventDefault();
			var myButton = $(this);
			$.post('./server/calendar.php', {
				a: 'enrol',
				eventId: myButton.closest('div').data('event-id'),
				attendance: myButton.data('attendance')
			}, function(enrolResponse) {
				if (isDebugEnabled()) {
					logDebug('enrolResponse=' + JSON.stringify(enrolResponse, null, 4));
				}
				if (enrolResponse.result == 'ok') {
					var myEventContainer = myButton.closest('div');
					myEventContainer.data('participants', (myEventContainer.data('participants') * 1) + 1);
					myEventContainer.append('<p>' + $.t('event.participants', { count: myEventContainer.data('participants') }) + '</p>');
					myEventContainer.find('.btnEnrol').remove();
				}
			}, 'json')
			.fail(function(jqXHR, textStatus) {
				logErr('Error while loading [./server/calendar.php]: ' + textStatus + '.');
			});
		});
	}, 'json')
	.fail(function(jqXHR, textStatus) {
		logErr('Error while loading [./server/calendar.php]: ' + textStatus + '.');
	});
	$.post(gConfig.WG_API_URL + 'wot/encyclopedia/vehicles/', {
		application_id: gConfig.WG_APP_ID,
		access_token: gConfig.ACCESS_TOKEN,
		language: gConfig.LANG
	}, function(dataTankopediaResponse) {
		if (isDebugEnabled()) {
			logDebug('dataTankopediaResponse=' + JSON.stringify(dataTankopediaResponse, null, 4));
		}
		gTankopedia = dataTankopediaResponse.data;
		advanceProgress($.t('loading.mytanksinfos'));
		$.post(gConfig.WG_API_URL + 'wot/tanks/stats/', {
			application_id: gConfig.WG_APP_ID,
			language: gConfig.LANG,
			access_token: gConfig.ACCESS_TOKEN,
			account_id: gConfig.PLAYER_ID
		}, function(dataMyTanksResponse) {
			var dataMyTanks = dataMyTanksResponse.data,
				myTanksTable = $('#tableMyTanks'),
				myTanksSmallContainer = $('#myTanksContainerSmall'),
				myTanksBigContainer = $('#myTanksContainerBig'),
				tableContent = '',
				listContent = '',
				listLargeContent = '',
				myTank = null,
				tankInfos = null,
				tankAdditionalInfos = null,
				winRatio = 0,
				chkInGarage = $('#chkInGarage'),
				chkIsFull = $('#chkIsFull'),
				selTankLevelTS = $('#tankFilterLevelTS'),
				selTankLevel = $('#tankFilterLevel'),
				selTankType = $('#tankFilterType'),
				slideTankStatus = $('#slideTankStatus');
			// Save tanks infos
			$.post('./server/player.php', {
				'action': 'gettanksstats',
				'data': JSON.stringify(dataMyTanks)
			}, function(dataMyTanksResponse) {
				if (isDebugEnabled()) {
					logDebug('dataMyTanksResponse=' + JSON.stringify(dataMyTanksResponse, null, 4));
				}
				advanceProgress($.t('loading.getvacancies'));
				$.post('./server/player.php', {
					'action': 'getvacancies'
				}, function(dataMyVacanciesResponse) {
					if (isDebugEnabled()) {
						logDebug('dataMyVacanciesResponse=' + JSON.stringify(dataMyVacanciesResponse, null, 4));
					}
					var dataMyVacancies = dataMyVacanciesResponse.data[gConfig.PLAYER_ID],
						myVacanciesTable = $('#myVacanciesTableContainer'),
						myNoVacancy = $('#noVacancy');
					if (dataMyVacancies == null || dataMyVacancies.length == 0) {
						myVacanciesTable.hide();
						myNoVacancy.show();
					} else {
						myNoVacancy.hide();
						var myVacanciesContent = '',
							myCurrentTime = moment().unix(),
							myVacancy = null,
							additionalClass = '';
						for (var myVacancyIndex in dataMyVacancies) {
							myVacancy = dataMyVacancies[myVacancyIndex];
							additionalClass = '';
							if (myCurrentTime > myVacancy.enddate) {
								additionalClass = ' class="past warning hidden"';
							} else if (myCurrentTime < myVacancy.startdate) {
								additionalClass = ' class="future"';
							} else {
								additionalClass = ' class="present success"';
							}
							myVacanciesContent += '<tr' + additionalClass + '>';
							myVacanciesContent += '<td class="startdate" data-value="' + myVacancy.startdate + '">' + moment.unix(myVacancy.startdate).format('LL') + '</td>';
							myVacanciesContent += '<td class="enddate" data-value="' + myVacancy.enddate + '">' + moment.unix(myVacancy.enddate).format('LL') + '</td>';
							myVacanciesContent += '<td>' + myVacancy.reason + '</td>';
							myVacanciesContent += '<td><a href="/vacancy/' + myVacancy.startdate + '/' + myVacancy.enddate + '/delete" class="btn btn-danger btn-xs btnRemoveVacancy"><span class="glyphicon glyphicon-remove"></span></a></td>';
							myVacanciesContent += '</tr>';
						}
						myVacanciesTable.find("tbody").append(myVacanciesContent);
						myVacanciesTable.show();
					}
					$('.eventDatePicker').datetimepicker({
						locale: gConfig.LANG,
						format: 'LL',
						minDate: moment()
					});
					// Handle min and max dates
					$('#vacancyStartDate').on('dp.change', function(e) {
						if ($(this).val() == '') {
							$('#vacancyEndDate').data('DateTimePicker').minDate($(this).data('DateTimePicker').date());
						} else {
							$('#vacancyEndDate').data('DateTimePicker').minDate(e.date);
						}
					}).trigger('dp.change');
					$('#vacancyEndDate').on('dp.change', function(e) {
						if ($(this).val() == '') {
							$('#vacancyStartDate').data('DateTimePicker').maxDate(false);
						} else {
							$('#vacancyStartDate').data('DateTimePicker').maxDate(e.date);
						}
					}).trigger('dp.change');
					$('#vacancyStartDate input, #vacancyEndDate input').on('focus', function(evt) {
						$(this).closest('.date').data('DateTimePicker').show();
					});
					$('#chkPastVacancies').on('change', function(e) {
						if ($(this).is(':checked')) {
							myVacanciesTable.find('.past').removeClass('hidden');
						} else {
							myVacanciesTable.find('.past').addClass('hidden');
						}
					});
					$('#btnVacancyOk').on('click', function(e) {
						e.preventDefault();
						myNoVacancy.hide();
						var myVacanciesContent = '',
							myCurrentTime = moment().unix(),
							additionalClass = '',
							myVacancyStartDate = $('#vacancyStartDate').data('DateTimePicker').date().startOf('day'),
							myVacancyEndDate = $('#vacancyEndDate').data('DateTimePicker').date().endOf('day'),
							myVacancyReason = $('#vacancyReason').val();
						$.post('./server/player.php', {
							'action': 'addvacancy',
							'startdate': myVacancyStartDate.unix(),
							'enddate': myVacancyEndDate.unix(),
							'reason': myVacancyReason
						}, function(addVacancyResult) {
							if (isDebugEnabled()) {
								logDebug('addVacancyResult=' + JSON.stringify(addVacancyResult, null, 4));
							}
							additionalClass = '';
							if (myCurrentTime > myVacancyEndDate.unix()) {
								additionalClass = ' class="past warning hidden"';
							} else if (myCurrentTime < myVacancyStartDate.unix()) {
								additionalClass = ' class="future"';
							} else {
								additionalClass = ' class="present success"';
							}
							myVacanciesContent += '<tr' + additionalClass + '>';
							myVacanciesContent += '<td class="startdate" data-value="' + myVacancyStartDate.unix() + '">' + myVacancyStartDate.format('LL') + '</td>';
							myVacanciesContent += '<td class="enddate" data-value="' + myVacancyEndDate.unix() + '">' + myVacancyEndDate.format('LL') + '</td>';
							myVacanciesContent += '<td>' + myVacancyReason + '</td>';
							myVacanciesContent += '<td><a href="/vacancy/' + myVacancyStartDate.unix() + '/' + myVacancyEndDate.unix() + '/delete" class="btn btn-danger btn-xs btnRemoveVacancy"><span class="glyphicon glyphicon-remove"></span></a></td>';
							myVacanciesContent += '</tr>';
							myVacanciesTable.find('tbody').append(myVacanciesContent);
							$('#chkPastVacancies').trigger('change');
							myVacanciesTable.show();
							$('#vacancy-dialog').modal('hide');
						}, 'json');
					});
					myVacanciesTable.on('click', '.btnRemoveVacancy', function(e) {
						var myBtn = $(this),
							myLine = myBtn.closest('tr'),
							myVacancyStartDate = myLine.find('td.startdate').data('value'),
							myVacancyEndDate = myLine.find('td.enddate').data('value');
						e.preventDefault();
						$.post('./server/player.php', {
							'action': 'delvacancy',
							'startdate': myVacancyStartDate,
							'enddate': myVacancyEndDate
						}, function(delVacancyResponse) {
							if (isDebugEnabled()) {
								logDebug('delVacancyResponse=' + JSON.stringify(delVacancyResponse, null, 4));
							}
							myBtn.closest('tr').remove();
							if (myVacanciesTable.find('tbody tr').length == 0) {
								myVacanciesTable.hide();
								myNoVacancy.show();
							}
						}, 'json');
					});
					advanceProgress($.t('loading.complete'));
					afterLoad();
				}, 'json');
				var dataMyTanksAdditionalInfos = dataMyTanksResponse.data[gConfig.PLAYER_ID],
					statsTanksByType = [],
					statsTanksByLevel = [],
					statsTanksByNation = [],
					isStatFound = false,
					index = 0;
				dataMyTanks = dataMyTanks[gConfig.PLAYER_ID];
				advanceProgress($.t('loading.generating'));
				// Sort tanks by tiers
				dataMyTanks.sort(function(a, b) {
					var tankInfosA = gTankopedia[a.tank_id],
						tankInfosB = gTankopedia[b.tank_id];
					// Sort by tiers
					if (tankInfosA == null) {
						return 1;
					}
					if (tankInfosB == null) {
						return -1;
					}
					if (tankInfosA.tier > tankInfosB.tier) {
						return -1;
					}
					if (tankInfosA.tier < tankInfosB.tier) {
						return 1;
					}
					// Then by type
					if (gTANKS_TYPES[tankInfosA.type] < gTANKS_TYPES[tankInfosB.type]) {
						return -1;
					}
					if (gTANKS_TYPES[tankInfosA.type] > gTANKS_TYPES[tankInfosB.type]) {
						return 1;
					}
					return 0;
				});
				for (var i=0; i<dataMyTanks.length; i++) {
					myTank = dataMyTanks[i];
					tankInfos = gTankopedia[myTank.tank_id];
					if (tankInfos != null) {
						tankAdditionalInfos = getTankAdditionalInfos(myTank.tank_id, dataMyTanksAdditionalInfos);
						winRatio = -1;
						isStatFound = false;
						for (var j=0; j<statsTanksByType.length; j++) {
							if (statsTanksByType[j].type == tankInfos.type) {
								isStatFound = true;
								index = j;
								break;
							}
						}
						if (!isStatFound) {
							statsTanksByType.push({
								label: $.t('tank.type.' + tankInfos.type),
								type: tankInfos.type,
								battles: 0,
								wins: 0,
								losses: 0,
								draws: 0
							});
							index = statsTanksByType.length - 1;
						}
						statsTanksByType[index].battles += myTank.all.battles;
						statsTanksByType[index].wins += myTank.all.wins;
						statsTanksByType[index].losses += myTank.all.losses;
						statsTanksByType[index].draws += myTank.all.draws;
						isStatFound = false;
						for (var j=0; j<statsTanksByLevel.length; j++) {
							if (statsTanksByLevel[j].level == tankInfos.tier) {
								isStatFound = true;
								index = j;
								break;
							}
						}
						if (!isStatFound) {
							statsTanksByLevel.push({
								label: $.t('tank.level.' + (tankInfos.tier - 1)),
								level: tankInfos.tier,
								battles: 0,
								wins: 0,
								losses: 0,
								draws: 0
							});
							index = statsTanksByLevel.length - 1;
						}
						statsTanksByLevel[index].battles += myTank.all.battles;
						statsTanksByLevel[index].wins += myTank.all.wins;
						statsTanksByLevel[index].losses += myTank.all.losses;
						statsTanksByLevel[index].draws += myTank.all.draws;
						isStatFound = false;
						for (var j=0; j<statsTanksByNation.length; j++) {
							if (statsTanksByNation[j].nation == tankInfos.nation) {
								isStatFound = true;
								index = j;
								break;
							}
						}
						if (!isStatFound) {
							statsTanksByNation.push({
								label: $.t('tank.nation.' + tankInfos.nation),
								nation: tankInfos.nation,
								battles: 0,
								wins: 0,
								losses: 0,
								draws: 0
							});
							index = statsTanksByNation.length - 1;
						}
						statsTanksByNation[index].battles += myTank.all.battles;
						statsTanksByNation[index].wins += myTank.all.wins;
						statsTanksByNation[index].losses += myTank.all.losses;
						statsTanksByNation[index].draws += myTank.all.draws;
						if (myTank.all.battles > 0) {
							winRatio = myTank.all.wins * 100 / myTank.all.battles;
						}
						tableContent += '<tr data-tankid="' + myTank.tank_id + '" class="tank'
							+ (tankAdditionalInfos.in_garage?' ingarage':' hidden')
							+ (tankInfos.is_premium?' ispremium':'')
							+ (tankInfos.is_premium||tankAdditionalInfos.is_full?' isfull':'')
							+ (tankAdditionalInfos.is_ready?' isready':'')
							+ ' tanklevel' + tankInfos.tier
							+ ' tanktype' + tankInfos.type + '">';
						tableContent += '<td><img src="' + tankInfos.images.contour_icon + '" /></td>';
						tableContent += '<td data-value="' + myTank.mark_of_mastery + '" class="tankmastery' + myTank.mark_of_mastery + '">&nbsp;</td>';
						tableContent += '<td data-value="' + tankInfos.nation + '"><img src="./themes/' + gConfig.THEME + '/style/images/nation_' + tankInfos.nation + '.png" alt="' + tankInfos.nation + '" title="' + $.t('tank.nation.' + tankInfos.nation) + '" width="24" height="24" /></td>';
						tableContent += '<td class="tankname">' + tankInfos.short_name + '</td>';
						tableContent += '<td data-value="' + tankInfos.tier + '"><img src="./themes/' + gConfig.THEME + '/style/images/Tier_' + tankInfos.tier + '_icon.png" alt="' + gTANKS_LEVEL[tankInfos.tier - 1] + '" title="' + tankInfos.tier + '" /></td>';
						tableContent += '<td data-value="' + gTANKS_TYPES[tankInfos.type] + '"><img src="./themes/' + gConfig.THEME + '/style/images/type-' + tankInfos.type + '.png" alt="' + tankInfos.type + '" title="' + $.t('tank.type.' + tankInfos.type) + '" /></td>';
						tableContent += '<td>' + myTank.all.battles + '</td>';
						tableContent += '<td><span class="label label-' + getScaleClass('wn8', tankAdditionalInfos.wn8) + '">' + (Math.round(tankAdditionalInfos.wn8 * 100) / 100) + '</span></td>';
						tableContent += '<td><span class="label label-' + getScaleClass('wn9', tankAdditionalInfos.wn9) + '">' + (Math.round(tankAdditionalInfos.wn9 * 100) / 100) + '</span></td>';
						tableContent += '<td data-value="' + winRatio + '"><span class="label label-' + getScaleClass('wr', winRatio) + '">' + (winRatio > -1?(Math.round(winRatio * 100) / 100) + ' %':'-') + '</span></td>';
						tableContent += '<td><div data-toggle="tooltip" data-placement="top" class="slider shor slider-info" title="' + (tankAdditionalInfos.is_ready?$.t('tank.status.2'):tankAdditionalInfos.is_full||tankInfos.is_premium?$.t('tank.status.1'):$.t('tank.status.0')) + '"></div></td>';
						tableContent += '</tr>';
						listContent += '<div class="small tank tankcontainer tankmastery' + myTank.mark_of_mastery +  (tankAdditionalInfos.in_garage?' ingarage':' hidden') + (tankInfos.is_premium?' ispremium':'') + (tankInfos.is_premium||tankAdditionalInfos.is_full?' isfull':'') + ' tanklevel' + tankInfos.tier + ' tanktype' + tankInfos.type + '">';
						listContent += '<div><img src="' + tankInfos.images.small_icon  + '" /></div>';
						listContent += '<p class="tankname">' + tankInfos.short_name + '</p>';
						listContent += '</div>';
						listLargeContent += '<div class="big tank tankcontainer tankmastery' + myTank.mark_of_mastery + (tankAdditionalInfos.in_garage?' ingarage':' hidden') + (tankInfos.is_premium?' ispremium':'') + (tankInfos.is_premium||tankAdditionalInfos.is_full?' isfull':'') + ' tanklevel' + tankInfos.tier + ' tanktype' + tankInfos.type + '">';
						listLargeContent += '<div><img src="' + tankInfos.images.big_icon + '" /></div>';
						listLargeContent += '<p class="tankname">' + tankInfos.short_name + '</p>';
						listLargeContent += '</div>';
					}
				}
				myTanksTable.attr('data-sortable', 'true');
				myTanksTable.find('tbody').append(tableContent);
				myTanksSmallContainer.html(listContent);
				myTanksBigContainer.html(listLargeContent);
				Sortable.initTable(myTanksTable[0]);
				// Compute WR
				for (var i in statsTanksByType) {
					statsTanksByType[i]['wr'] = Math.round((statsTanksByType[i].wins / statsTanksByType[i].battles) * 10000) / 100;
				}
				for (var i in statsTanksByLevel) {
					statsTanksByLevel[i]['wr'] = Math.round((statsTanksByLevel[i].wins / statsTanksByLevel[i].battles) * 10000) / 100;
				}
				for (var i in statsTanksByNation) {
					statsTanksByNation[i]['wr'] = Math.round((statsTanksByNation[i].wins / statsTanksByNation[i].battles) * 10000) / 100;
				}
				// Sort stats
				statsTanksByType.sort(function(a, b) {
					return gTANKS_TYPES[a.type] - gTANKS_TYPES[b.type];
				});
				statsTanksByLevel.sort(function(a, b) {
					return a.level - b.level;
				});
				statsTanksByNation.sort(function(a, b) {
					return a.label.localeCompare(b.label);
				});
				// Display charts
				new Morris.Bar({
					element: 'chartTanksType',
					data: statsTanksByType,
					xkey: 'label',
					ykeys: [ 'battles' ],
					labels: [ $.t('stats.global.battles') ],
					barColors: [ '#9e9e9e' ],
					xLabelMargin: 0,
					hideHover: true
				});
				new Morris.Bar({
					element: 'chartTanksTiers',
					data: statsTanksByLevel,
					xkey: 'label',
					ykeys: [ 'battles' ],
					labels: [ $.t('stats.global.battles') ],
					barColors: [ '#9e9e9e' ],
					xLabelMargin: 0,
					hideHover: true
				});
				new Morris.Bar({
					element: 'chartTanksNation',
					data: statsTanksByNation,
					xkey: 'label',
					ykeys: [ 'battles' ],
					labels: [ $.t('stats.global.battles') ],
					barColors: [ '#9e9e9e' ],
					xLabelMargin: 0,
					hideHover: true
				});
				new Morris.Bar({
					element: 'chartWRType',
					data: statsTanksByType,
					xkey: 'label',
					ykeys: [ 'wr' ],
					labels: [ $.t('stats.global.winratio') ],
					barColors: [ '#9e9e9e' ],
					xLabelMargin: 0,
					hideHover: true
				});
				new Morris.Bar({
					element: 'chartWRTiers',
					data: statsTanksByLevel,
					xkey: 'label',
					ykeys: [ 'wr' ],
					labels: [ $.t('stats.global.winratio') ],
					barColors: [ '#9e9e9e' ],
					xLabelMargin: 0,
					hideHover: true
				});
				new Morris.Bar({
					element: 'chartWRNation',
					data: statsTanksByNation,
					xkey: 'label',
					ykeys: [ 'wr' ],
					labels: [ $.t('stats.global.winratio') ],
					barColors: [ '#9e9e9e' ],
					xLabelMargin: 0,
					hideHover: true
				});
				myTanksTable.find('.shor').each(function(index, el) {
					var myElem = $(this),
						myElemSilderOptions = {
							start: 0,
							step: 1,
							range: {
								min: 0,
								max: 2
							}
						},
						myTankId = myElem.closest('tr').data('tankid'),
						myTankAdditionalInfos = getTankAdditionalInfos(myTankId, dataMyTanksAdditionalInfos),
						myTankInfos = gTankopedia[myTankId];
					if (myTankInfos != null) {
						if (myTankInfos.is_premium) {
							myElem.removeClass('slider-info').addClass('slider-material-yellow');
						}
						if (myTankAdditionalInfos.is_ready) {
							myElemSilderOptions.start = 2;
						} else if (myTankAdditionalInfos.is_full || myTankInfos.is_premium) {
							myElemSilderOptions.start = 1;
						} 
						myElem.noUiSlider(myElemSilderOptions);
						myElem.on({
							set: function(evt) {
								var isFull = false,
									isReady = false,
									myLine = myElem.closest('tr');
								switch (parseInt(myElem.val())) {
									case 0:
										// Prevent change or premium tanks
										if (myLine.hasClass('ispremium')) {
											isFull = true;
											isReady = false;
											myElem.val(1);
										} else {
											isFull = false;
											isReady = false;
											myLine.removeClass('isfull').removeClass('isready');
										}
										break;
									case 1:
										isFull = true;
										isReady = false;
										myLine.addClass('isfull').removeClass('isready');
										break;
									case 2:
										isFull = true;
										isReady = true;
										myLine.addClass('isfull').addClass('isready');
										break;
								}
								myElem.tooltip('hide')
									.attr('data-original-title', $.t('tank.status.' + parseInt(myElem.val())))
									.tooltip('fixTitle')
									.tooltip('show');
								$.post('./server/player.php', {
									'action': 'settankprops',
									'tank_id': myTankId,
									'is_full': isFull,
									'is_ready': isReady
								}, function(dataSaveTanksResponse) {
									tankAdditionalInfos = getTankAdditionalInfos(myTankId, dataMyTanksAdditionalInfos);
									tankAdditionalInfos.is_full = isFull;
									tankAdditionalInfos.is_ready = isReady;
								}, 'json');
							}
						});
					}
				});
				$('#chkContourIcons').on('change', function(evt) {
					var myCheckBox = $(this),
						isResumeWithContourIcons = myCheckBox.is(':checked');
					var myCanvas = $('#canvasRecapPlayer'),
						canvasRealHeight = 0,
						basePosX = 0,
						basePosY = 0,
						textColor = '#000';
						curTankLevel = 0,
						curTankType = '',
						nbTanksOnLine = 0,
						commentText = '',
						generationDate = moment().format('LLL'),
						i = 0,
						j = 0;
					// Prepare data
					var dataToDisplay = {},
						listTankTypes = {},
						selectedLevelsForResume = selTankLevelTS.data('value');
					// Prepare tank types
					if (selectedLevelsForResume.length == 0) {
						// All levels are selected
						selectedLevelsForResume = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
					}
					for (i = selectedLevelsForResume.length - 1; i >= 0; i--) {
						listTankTypes = {};
						for (tankTypeName in gTANKS_TYPES) {
							listTankTypes[tankTypeName] = [];
						}
						dataToDisplay[gTANKS_LEVEL[selectedLevelsForResume[i] - 1]] = listTankTypes;
					}
					for (i=0; i<dataMyTanks.length; i++) {
						myTank = dataMyTanks[i];
						tankInfos = gTankopedia[myTank.tank_id];
						tankAdditionalInfos = getTankAdditionalInfos(myTank.tank_id, dataMyTanksAdditionalInfos);
						if (tankInfos != null
								&& tankAdditionalInfos.in_garage
								&& tankAdditionalInfos.is_ready
								&& ($.inArray(tankInfos.tier, selectedLevelsForResume) >= 0)) {
							dataToDisplay[gTANKS_LEVEL[tankInfos.tier - 1]][tankInfos.type].push({
								name: tankInfos.short_name,
								wn8: tankAdditionalInfos.wn8,
								contour: tankInfos.images.contour_icon,
								is_premium: tankInfos.is_premium,
								is_full: tankAdditionalInfos.is_full
							});
						}
					}
					// Compute canvas real height
					for (tankTiersName in dataToDisplay) {
						var tankTiersDetails = dataToDisplay[tankTiersName],
							nbTanksInTIers = 0;
						for (tankTypeName in tankTiersDetails) {
							var tankTypeDetails = tankTiersDetails[tankTypeName];
							nbTanksInTIers += tankTypeDetails.length;
							canvasRealHeight += Math.ceil(tankTypeDetails.length / gIMAGE_PARAMS.nbTanksByLine) * gIMAGE_PARAMS.offsetLine;
						}
						if (nbTanksInTIers > 0) {
							canvasRealHeight += gIMAGE_PARAMS.offsetLine;
						}
					}
					// Draw canvas and compute resume text
					commentText = '<p style="color:#666;font-size:0.75em;text-align:center">' + generationDate + '</p>';
					if (canvasRealHeight == 0) {
						// We have no tanks ta display
						myCanvas.clearCanvas();
						myCanvas.attr('height', gIMAGE_PARAMS.offsetLine);
						myCanvas.attr('width', gIMAGE_PARAMS.nbTanksByLine * gIMAGE_PARAMS.offsetElem);
						myCanvas.drawText({
							fillStyle: '#666',
							fontStyle: 'normal',
							fontSize: 10,
							fontFamily: 'RobotoDraft, Roboto, Verdana, sans-serif',
							text: generationDate,
							//fromCenter: false,
							x: myCanvas.attr('width'), y: 15,
							respectAlign: true,
							align: 'right'
						});
					} else {
						// We have some tanks to display
						commentText += '<table border="1"><thead><tr><th>&nbsp;</th><th>' + $.t('tank.type.lightTank')
							+ '</th><th>' + $.t('tank.type.mediumTank')
							+ '</th><th>'+ $.t('tank.type.heavyTank')
							+ '</th><th>' + $.t('tank.type.AT-SPG')
							+ '</th><th>' + $.t('tank.type.SPG')
							+ '</th></tr></thead><tbody>\n';
						myCanvas.clearCanvas();
						myCanvas.attr('height', canvasRealHeight);
						myCanvas.attr('width', gIMAGE_PARAMS.nbTanksByLine * gIMAGE_PARAMS.offsetElem);
						myCanvas.drawText({
							fillStyle: '#666',
							fontStyle: 'normal',
							fontSize: 10,
							fontFamily: 'RobotoDraft, Roboto, Verdana, sans-serif',
							text: generationDate,
							//fromCenter: false,
							x: myCanvas.attr('width'), y: 15,
							respectAlign: true,
							align: 'right'
						});
						for (tankTiersName in dataToDisplay) {
							var tankTiersDetails = dataToDisplay[tankTiersName],
								nbTanksInTIers = 0;
							// Draw tiers header
							commentText += '<tr><th>' + tankTiersName + '</th>';
							// Draw image for tiers only if we have tanks in this tiers
							for (tankTypeName in tankTiersDetails) {
								nbTanksInTIers += tankTiersDetails[tankTypeName].length;
							}
							if (nbTanksInTIers == 0) {
								commentText += '<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>';
							} else {
								myCanvas.drawImage({
									source: './themes/' + gConfig.THEME + '/style/images/Tier_' + ($.inArray(tankTiersName, gTANKS_LEVEL) + 1) + '_icon.png',
									fromCenter: false,
									x: 10, y: basePosY + 5
								});
								myCanvas.drawLine({
									strokeStyle: '#333',
									strokeWidth: 1,
									x1: 0, y1: basePosY + gIMAGE_PARAMS.offsetLine - 3,
									x2: myCanvas.attr('width'), y2: basePosY + gIMAGE_PARAMS.offsetLine - 3
								});
								basePosY += gIMAGE_PARAMS.offsetLine;
								// Draw tanks details
								for (tankTypeName in tankTiersDetails) {
									var tankTypeDetails = tankTiersDetails[tankTypeName];
									commentText += '<td>';
									if (tankTypeDetails.length == 0) {
										// No tanks for this type
										commentText += '&nbsp;';
									} else {
										var countTanksInType = 0;
										nbTanksOnLine = 0;
										basePosX = 0;
										for (var i=0; i<tankTypeDetails.length; i++) {
											var aTank = tankTypeDetails[i];
											if (aTank.is_premium) {
												textColor = '#ffc107';
											} else if (aTank.is_full) {
												textColor = '#000';
											} else {
												textColor = '#666';
											}
											if (countTanksInType > 0) {
												commentText += ', ';
											}
											commentText += '<span style="color:' + getScaleColor('wn8', aTank.wn8) + '">&#9646;</span><span style="color:' + textColor + '">' + aTank.name + '</span>';
											if (nbTanksOnLine >= gIMAGE_PARAMS.nbTanksByLine) {
												nbTanksOnLine = 0;
												basePosX = 0;
												basePosY += gIMAGE_PARAMS.offsetLine;
											}
											// Draw tank contour
											if (isResumeWithContourIcons) {
												myCanvas.drawImage({
													source: aTank.contour,
													fromCenter: false,
													x: basePosX, y: basePosY
												});
											}
											// Draw tank type
											myCanvas.drawImage({
												source: './themes/' + gConfig.THEME + '/style/images/type-' + tankTypeName + '.png',
												x: basePosX + 10, y: basePosY + (isResumeWithContourIcons?5:10)
											});
											// Draw tank user skill (WN8)
											myCanvas.drawRect({
												fillStyle: getScaleColor('wn8', aTank.wn8),
												x: basePosX + (isResumeWithContourIcons?70:25), y: basePosY + 10,
												width: 10, height: 10
											});
											// Draw tank name
											myCanvas.drawText({
												fillStyle: textColor,
												x: basePosX + (isResumeWithContourIcons?79:34), y: basePosY + 5,
												fromCenter: false,
												fontSize: 12,
												fontFamily: 'RobotoDraft, Roboto, Verdana, sans-serif',
												text: aTank.name
											});
											basePosX += gIMAGE_PARAMS.offsetElem;
											countTanksInType++;
											nbTanksOnLine++;
										}
										basePosY += gIMAGE_PARAMS.offsetLine;
									}
									commentText += '</td>';
								}
							}
							commentText += '</tr>\n';
						}
						commentText += '</tbody></table>';
					}
					$('#textResumePlayer').text(commentText);
				});
				$('#btnShowTanksResume').on('click', function(evt) {
					$('#chkContourIcons').change();
				});
				// init tank levels
				var selTankLevelTSDefaultValue = selTankLevelTS.data('value'),
					btnTexts = [];
				for (var levelIndex in selTankLevelTSDefaultValue) {
					btnTexts.push($.t('tank.level.' + ((selTankLevelTSDefaultValue[levelIndex] * 1) - 1)));
				}
				if (selTankLevelTSDefaultValue.length == gTANKS_LEVEL.length) {
					// All levels are selected
					selTankLevelTS.find('.btnVal').text($.t('tank.alllevels'));
				} else {
					selTankLevelTS.find('.btnVal').text(btnTexts.join(', '));
				}
				selTankLevelTS.parent().on('click', 'a', function(evt) {
					evt.preventDefault();
					var myLink = $(this),
						selectedLevels = myLink.parent().parent().prev().data('value'),
						myChoice = myLink.parent().data('value');
					if (!$.isArray(selectedLevels)) {
						selectedLevels = [];
					}
					if (selectedLevels.indexOf(myChoice) < 0) {
						selectedLevels.push(myChoice);
					} else {
						selectedLevels.splice(selectedLevels.indexOf(myChoice), 1);
					}
					selectedLevels.sort(function(a, b) {
						if (a < b) {
							return -1;
						}
						if (a > b) {
							return 1;
						}
						return 0;
					});
					// Compute text
					var btnTexts = [];
					for (var levelIndex in selectedLevels) {
						btnTexts.push($.t('tank.level.' + ((selectedLevels[levelIndex] * 1) - 1)));
					}
					if (myChoice == 'all' || selectedLevels.length == gTANKS_LEVEL.length) {
						// All levels are selected
						myLink.parent().parent().prev().data('value', []).find('.btnVal').text($.t('tank.alllevels'));
					} else {
						myLink.parent().parent().prev().data('value', selectedLevels).find('.btnVal').text(btnTexts.join(', '));
					}
					$('#chkContourIcons').change();
				});
				selTankLevel.add(selTankType).parent().on('click', 'a', function(evt) {
					evt.preventDefault();
					var myLink = $(this);
					myLink.parent().parent().prev().data('value', myLink.parent().data('value')).find('.btnVal').text(myLink.text());
				});
				selTankLevel.parent().on('hide.bs.dropdown', function(evt) {
					applyTableTanksFilters({
						isfull: parseInt(slideTankStatus.val()) > 0,
						isready: parseInt(slideTankStatus.val()) > 1,
						ingarage: chkInGarage.is(':checked'),
						tanklevel: selTankLevel.data('value'),
						tanktype: selTankType.data('value')
					});
				});
				selTankType.parent().on('hide.bs.dropdown', function(evt) {
					applyTableTanksFilters({
						isfull: parseInt(slideTankStatus.val()) > 0,
						isready: parseInt(slideTankStatus.val()) > 1,
						ingarage: chkInGarage.is(':checked'),
						tanklevel: selTankLevel.data('value'),
						tanktype: selTankType.data('value')
					});
				});
				chkInGarage.on('change', function(evt) {
					applyTableTanksFilters({
						isfull: parseInt(slideTankStatus.val()) > 0,
						isready: parseInt(slideTankStatus.val()) > 1,
						ingarage: chkInGarage.is(':checked'),
						tanklevel: selTankLevel.data('value'),
						tanktype: selTankType.data('value')
					});
				});
				slideTankStatus.noUiSlider({
					start: 0,
					step: 1,
					range: {
						min: 0,
						max: 2
					}
				});
				slideTankStatus.on({
					'set': function(evt) {
						slideTankStatus.tooltip('hide')
							.attr('data-original-title', $.t('tank.status.' + parseInt(slideTankStatus.val())))
							.tooltip('fixTitle')
							.tooltip('show');
						applyTableTanksFilters({
							isfull: parseInt(slideTankStatus.val()) > 0,
							isready: parseInt(slideTankStatus.val()) > 1,
							ingarage: chkInGarage.is(':checked'),
							tanklevel: selTankLevel.data('value'),
							tanktype: selTankType.data('value')
						});
					}
				});
				new ZeroClipboard($('#copy-button'));
			}, 'json')
			.fail(function(jqXHR, textStatus) {
				logErr('Error while loading [./server/player.php]: ' + textStatus + '.');
			});
		}, 'json')
		.fail(function(jqXHR, textStatus) {
			logErr('Error while loading [' + gConfig.WG_API_URL + 'wot/tanks/stats/]: ' + textStatus + '.');
		});
	}, 'json')
	.fail(function(jqXHR, textStatus) {
		logErr('Error while loading [' + gConfig.WG_API_URL + 'wot/encyclopedia/vehicles/]: ' + textStatus + '.');
	});
};