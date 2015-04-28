<?php
require(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'wct.eventType.inc');

class wctEvent {
	var $id;
	var $title;
	var $description;
	var $type;
	var $dateStart;
	var $dateEnd;
	var $isPrivate;
	var $owner;
	var $dateCreation;
	var $dateModification;
	var $isRecurrent;
	var $participants;

	/**
	 * Get a list of files used in an interval.
	 *
	 * @param pStartDate
	 *     Start date of the interval
	 * @param pEndDate
	 *     End date of the interval
	 * @return An <code>array</code> containing the list of the files path.
	 */
	public static function getFilesFromRange($pStartDate, $pEndDate) {
		$listFiles = array();
		$tmpFile = '';
		// Add first file
		array_push($listFiles, self::getFileFromDate($pStartDate));
		// Add files between start and end date
		// Files are stored by month
		$interval = new DateInterval('P1M');
		// Initialize date object
		$date = new DateTime('@' . $pStartDate);
		// Add first interval
		$date->add($interval);
		// Loop until end date
		while ($date->getTimeStamp() < $pEndDate) {
			$tmpFile = self::getFileFromDate($date->getTimeStamp());
			if (!in_array($tmpFile, $listFiles)) {
				array_push($listFiles, $tmpFile);
			}
			$date->add($interval);
		}
		// Add last file if needed
		$tmpFile = self::getFileFromDate($pEndDate);
		if (!in_array($tmpFile, $listFiles)) {
			array_push($listFiles, $tmpFile);
		}
		return $listFiles;
	}

	/**
	 * Get the file path from a timestamp. The directory structure and file are created if they don't exists.
	 *
	 * @param pDate
	 *     Timestamp to get the file for.
	 * @return A file path.
	 */
	public static function getFileFromDate($pDate) {
		$filePath = WCT_BASE_EVENT_DIR . DIRECTORY_SEPARATOR . date(addslashes('Y' . DIRECTORY_SEPARATOR . 'm'), $pDate) . '.json';
		// Create file if it doesn't exist
		$fileDir = dirname($filePath);
		if (!is_dir($fileDir)) {
			mkdir($fileDir, 0755, true);
		}
		if (!file_exists($filePath)) {
			file_put_contents($filePath, json_encode(array()));
		}
		return $filePath;
	}

	public static function computeBaseId($pDate) {
		return date(addslashes('Y-m-'), $pDate);
	}

	public static function fromId($pEventId) {
		$idParts = explode('-', $pEventId);
		$eventDate = mktime(12, 0, 0, $idParts[1], 1, $idParts[0]);
		$eventsFile = self::getFileFromDate($eventDate);
		$fileContents = json_decode(file_get_contents($eventsFile), true);
		$returnVal = new self();
		foreach ($fileContents as $eventData) {
			if ($eventData['id'] == $pEventId) {
				$returnVal = self::fromJson($eventData);
				break;
			}
		}
		return $returnVal;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id = '';
		$this->title = '';
		$this->description = '';
		$this->dateStart = -1;
		$this->dateEnd = -1;
		$this->owner = '';
		$this->isPrivate = false;
		$this->dateCreation = -1;
		$this->dateModification = -1;
		$this->isRecurrent = false;
		$this->participants = array();
	}

	public static function fromJson($json) {
		$instance = new self();
		$instance->id = $json['id'];
		$instance->title = $json['title'];
		$instance->description = $json['description'];
		$instance->dateStart = $json['start'];
		$instance->dateEnd = $json['end'];
		$instance->type = $json['type'];
		$instance->owner = $json['owner'];
		$instance->participants = $json['participants'];
		return $instance;
	}

	public function toCalendarArray($pForStorage = false) {
		$result = array();
		$result['id'] = $this->id;
		$result['title'] = $this->title;
		$result['description'] = $this->description;
		$result['start'] = $this->dateStart . (!$pForStorage?'000':'');
		$result['end'] = $this->dateEnd . (!$pForStorage?'000':'');
		$result['owner'] = $this->owner;
		$result['participants'] = $this->participants;
		$result['type'] = $this->type;
		if (!$pForStorage) {
			$result['class'] = 'event-type-' . $this->type;
			$result['url'] = './server/calendar.php?a=get&id=' . $this->id;
		}
		return $result;
	}

	public function getBaseId() {
		$returnVal = '';
		$idParts = explode('-', $this->id);
		$returnVal = $idParts[0] + '-' + $idParts[1] + '-';
		return $returnVal;
	}

	public function getLocalId() {
		$returnVal = '';
		$idParts = explode('-', $this->id);
		$returnVal = intval($idParts[2]);
		return $returnVal;
	}

	public function getId() {
		return $this->id;
	}

	public function setId($id) {
		$this->id = $id;
	}

	public function getTitle() {
		return $this->title;
	}

	public function setTitle($title) {
		$this->title = $title;
	}

	public function getDescription() {
		return $this->description;
	}

	public function setDescription($description) {
		$this->description = $description;
	}

	public function getType() {
		return $this->type;
	}

	public function setType($type) {
		$this->type = $type;
	}

	public function getDateStart() {
		return $this->dateStart;
	}

	public function setDateStart($dateStart) {
		$this->dateStart = $dateStart;
	}

	public function getDateEnd() {
		return $this->dateEnd;
	}

	public function setDateEnd($dateEnd) {
		$this->dateEnd = $dateEnd;
	}

	public function getDateCreation() {
		return $this->dateCreation;
	}

	public function setDateCreation($dateCreation) {
		$this->dateCreation = $dateCreation;
	}

	public function getDateModification() {
		return $this->dateModification;
	}

	public function setDateModification($dateModification) {
		$this->dateModification = $dateModification;
	}

	public function getOwner() {
		return $this->owner;
	}

	public function setOwner($pOwner) {
		$this->owner = $pOwner;
	}

	public function getParticipants() {
		return $this->participants;
	}

	public function setParticipants($pParticipants) {
		$this->participants = $pParticipants;
	}

	public function isPrivate() {
		return $this->isPrivate;
	}

	public function setPrivate($isPrivate) {
		$this->isPrivate = $isPrivate;
	}

	public function isRecurrent() {
		return $this->isRecurrent;
	}

	public function setReccurent($isRecurrent) {
		$this->isRecurrent = $isRecurrent;
	}
}
?>