var onLoad = function() {
	checkConnected();
	progressNbSteps = 2;
	$(document).on('click', 'a.twitchstream', function(evt) {
		evt.preventDefault();
		if ($(this).hasClass('online')) {
			var player = new Twitch.Player('twitchPlayerContainer', {
				width: 854,
				height: 480,
				channel: $(this).data('channelname')
			});
			player.play();
		}
	});
	advanceProgress($.t('loading.claninfos'));
	$.post(gConfig.WG_API_URL + 'wgn/clans/info/', {
		application_id: gConfig.WG_APP_ID,
		language: gConfig.LANG,
		access_token: gConfig.ACCESS_TOKEN,
		clan_id: gPersonalInfos.clan_id
	}, function(dataClanResponse) {
		if (isDebugEnabled()) {
			logDebug('dataClanResponse=' + JSON.stringify(dataClanResponse, null, 4));
		}
		gClanInfos = dataClanResponse.data[gPersonalInfos.clan_id];
		setNavBrandWithClan();
		var membersList = '',
			isFirst = true,
			i = 0,
			tempContentHtml = '';
		for (i in gClanInfos.members) {
			if (isFirst) {
				isFirst = false;
			} else {
				membersList += ',';
			}
			membersList += gClanInfos.members[i].account_id;
		}
		// Get configured channels
		$.post('./server/player.php', {
			'action': 'getstreams',
			'account_id': membersList
		}, function(configuredChannelInfos) {
			advanceProgress($.t('loading.complete'));
			// Extract channel ids from response
			var twitchChannelIds = [],
				i = 0;
			for (i in configuredChannelInfos.streams.twitch) {
				var myTwitchChannelInfos = configuredChannelInfos.streams.twitch[i],
					myTwitchURLParts = myTwitchChannelInfos.url.split('/'),
					myTwitchChannelName = myTwitchURLParts[myTwitchURLParts.length - 1];
				if (myTwitchChannelName != '') {
					twitchChannelIds.push(myTwitchChannelName);
					myTwitchChannelInfos.channelname = myTwitchChannelName;
				}
			}
			// Retrieve status of channels
			$.ajax({
				type: 'GET',
				beforeSend: function(request) {
					request.setRequestHeader('Client-ID', gConfig.TWITCH_API_KEY);
				},
				url: 'https://api.twitch.tv/kraken/streams/',
				data: {
					'channel': twitchChannelIds.join(','),
					'limit': 100
				},
				success: function(streamsInfo) {
					var i = 0,
						j = 0,
						myTwitchHtml = '<div class="row">';
					myTwitchHtml += '<div class="col-xs-6 col-md-3">';
					for (i in configuredChannelInfos.streams.twitch) {
						myTwitchHtml += '<div class="thumbnail">';
						myTwitchHtml += '<a href="' + configuredChannelInfos.streams.twitch[i].url + '" class="thumbnail twitchstream online" data-channelname="' + configuredChannelInfos.streams.twitch[i].channelname + '"><img src="" alt="Offline" style="height:180px;width:180px" /></a>';
						myTwitchHtml += '<div class="caption">';
						myTwitchHtml += '<p>Player name</p>';
						myTwitchHtml += '</div></div>';
					}
					/*
					for (j in streamsInfo.streams) {
						if (streamsInfo.streams[j] != null) {
							var player = new Twitch.Player('twitchPlayerContainer', {
								width: 854,
								height: 480,
								channel: streamsInfo.streams[j].channel.name
							});
							player.play();
							break;
						}
					}
					*/
					myTwitchHtml += '</div></div>';
					$('.main h1').after(myTwitchHtml);
					afterLoad();
				}
			});
		}, 'json')
		.fail(function(jqXHR, textStatus) {
			logErr('Error while loading [./server/player.php]: ' + textStatus + '.');
		});
	}, 'json')
	.fail(function(jqXHR, textStatus) {
		logErr('Error while loading [' + gConfig.WG_API_URL + 'wgn/clans/info/]: ' + textStatus + '.');
	});
};