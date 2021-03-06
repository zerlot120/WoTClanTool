<?php
require(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'server' . DIRECTORY_SEPARATOR . 'global.php');

$gPageProps = array(
	"id" => "encyclopedia",
	"authenticated" => true,
	"rights" => array(),
	"blocks" => array (
		"ads" => true,
		"nav" => true,
		"footer" => true
	)
);

require(WCT_THEMES_DIR . DIRECTORY_SEPARATOR . $gThemeName . DIRECTORY_SEPARATOR . 'header.php');
?>
<div class="container-fluid">
	<div class="row">
		<div class="main"><?php
include(WCT_INC_DIR . 'ads.php');
?>
			<div class="container-fluid">
				<div class="row">
					<div class="col-md-9" role="main">
						<h1 class="page-header" data-i18n="page.encyclopedia.title"></h1>
						<h2 class="page-header" data-i18n="nav.encyclopedia.tanks" id="tankopedia"></h2>
						<h2 class="page-header" data-i18n="nav.encyclopedia.wn8.title" id="wn8"></h2>
						<div class="table-responsive" id="wn8ExpectedValsContainer">
							<table class="table table-hover header-fixed tableTanks" id="wn8ExpectedVals">
								<thead>
									<tr>
										<th class="tankcontour" data-sortable="false">&nbsp;</th>
										<th class="tanknation" data-i18n="tank.infos.nation"></th>
										<th class="tankname" data-i18n="tank.infos.name"></th>
										<th class="tanktiers" data-sorted="true" data-sorted-direction="descending" data-i18n="tank.infos.level"></th>
										<th class="tanktype" data-i18n="tank.infos.type"></th>
										<th data-i18n="nav.encyclopedia.wn8.expfrag"></th>
										<th data-i18n="nav.encyclopedia.wn8.expdmg"></th>
										<th data-i18n="nav.encyclopedia.wn8.expspot"></th>
										<th data-i18n="nav.encyclopedia.wn8.expdef"></th>
										<th data-i18n="nav.encyclopedia.wn8.expwr"></th>
									</tr>
								</thead>
								<tbody>
								</tbody>
							</table>
						</div>
						<h2 class="page-header" data-i18n="nav.encyclopedia.wn9.title" id="wn9"></h2>
						<div class="table-responsive" id="wn9ExpectedValsContainer">
							<table class="table table-hover header-fixed tableTanks" id="wn9ExpectedVals">
								<thead>
									<tr>
										<th class="tankcontour" data-sortable="false">&nbsp;</th>
										<th class="tanknation" data-i18n="tank.infos.nation"></th>
										<th class="tankname" data-i18n="tank.infos.name"></th>
										<th class="tanktiers" data-sorted="true" data-sorted-direction="descending" data-i18n="tank.infos.level"></th>
										<th class="tanktype" data-i18n="tank.infos.type"></th>
										<th data-i18n="nav.encyclopedia.wn9.mmrange"></th>
										<th data-i18n="nav.encyclopedia.wn9.wn9exp"></th>
										<th data-i18n="nav.encyclopedia.wn9.wn9scale"></th>
										<th data-i18n="nav.encyclopedia.wn9.wn9nerf"></th>
									</tr>
								</thead>
								<tbody>
								</tbody>
							</table>
						</div>
					</div>
					<div class="col-md-3" role="complementary">
						<nav class="hidden-print hidden-xs hidden-sm affix" id="pageNavbar">
							<ul class="nav nav-pills nav-stacked">
								<li role="presentation"><a href="<?php echo $gPageBaseURL; ?>#tankopedia" data-i18n="nav.encyclopedia.tanks"></a></li>
								<li role="presentation"><a href="<?php echo $gPageBaseURL; ?>#wn8" data-i18n="nav.encyclopedia.wn8.title"></a></li>
								<li role="presentation"><a href="<?php echo $gPageBaseURL; ?>#wn9" data-i18n="nav.encyclopedia.wn9.title"></a></li>
							</ul>
						</nav>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<?php
require(WCT_THEMES_DIR . DIRECTORY_SEPARATOR . $gThemeName . DIRECTORY_SEPARATOR . 'footer.php');
?>