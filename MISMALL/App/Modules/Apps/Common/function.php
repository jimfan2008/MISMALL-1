<?php

/**
 * 获取微信头
 * @param $url 地址
 * @param $size 正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像）
 */
function get_headimg($url, $size = '46') {
	if (empty($url)) {
		return C('PUBLIC_URL') . '/App/Home/Home/images/photo.gif';
		//return false;
	}
	if (substr($url, -2) == '/0') {
		$url = substr($url, 0, -2);
	}
	return $url . '/' . $size;
}

/**
 * 友好的时间显示
 *
 * @param int    $sTime 待显示的时间
 * @param string $type  类型. normal | mohu | full | ymd | other
 * @param string $alt   已失效
 * @return string
 */
function friendlyDate($sTime, $type = 'normal', $alt = 'false') {
	if (!$sTime) {
		return '';
	}

	//sTime=源时间，cTime=当前时间，dTime=时间差
	$cTime = time();
	$dTime = $cTime - $sTime;
	$dDay = intval(date("z", $cTime)) - intval(date("z", $sTime));
	//$dDay     =   intval($dTime/3600/24);
	$dYear = intval(date("Y", $cTime)) - intval(date("Y", $sTime));
	//normal：n秒前，n分钟前，n小时前，日期
	if ($type == 'normal') {
		if ($dTime < 60) {
			if ($dTime < 10) {
				return '刚刚'; //by yangjs
			} else {
				return intval(floor($dTime / 10) * 10) . "秒前";
			}
		} elseif ($dTime < 3600) {
			return intval($dTime / 60) . "分钟前";
			//今天的数据.年份相同.日期相同.
		} elseif ($dYear == 0 && $dDay == 0) {
			//return intval($dTime/3600)."小时前";
			return '今天' . date('H:i', $sTime);
		} elseif ($dYear == 0) {
			return date("m月d日 H:i", $sTime);
		} else {
			return date("Y-m-d H:i", $sTime);
		}
	} elseif ($type == 'mohu') {
		if ($dTime < 60) {
			return $dTime . "秒前";
		} elseif ($dTime < 3600) {
			return intval($dTime / 60) . "分钟前";
		} elseif ($dTime >= 3600 && $dDay == 0) {
			return intval($dTime / 3600) . "小时前";
		} elseif ($dDay > 0 && $dDay <= 7) {
			return intval($dDay) . "天前";
		} elseif ($dDay > 7 && $dDay <= 30) {
			return intval($dDay / 7) . '周前';
		} elseif ($dDay > 30) {
			return intval($dDay / 30) . '个月前';
		}
		//full: Y-m-d , H:i:s
	} elseif ($type == 'full') {
		return date("Y-m-d , H:i:s", $sTime);
	} elseif ($type == 'ymd') {
		return date("Y-m-d", $sTime);
	} else {
		if ($dTime < 60) {
			return $dTime . "秒前";
		} elseif ($dTime < 3600) {
			return intval($dTime / 60) . "分钟前";
		} elseif ($dTime >= 3600 && $dDay == 0) {
			return intval($dTime / 3600) . "小时前";
		} elseif ($dYear == 0) {
			return date("Y-m-d H:i:s", $sTime);
		} else {
			return date("Y-m-d H:i:s", $sTime);
		}
	}
}

function emoji($str) {
	$s = '{"微笑":"0","撇嘴":"1","色":"2","发呆":"3","得意":"4","流泪":"5","害羞":"6","闭嘴":"7","睡":"8","大哭":"9","尴尬":"10","发怒":"11","调皮":"12","呲牙":"13","惊讶":"14","难过":"15","酷":"16","冷汗":"17","抓狂":"18","吐":"19","偷笑":"20","可爱":"21","白眼":"22","傲慢":"23","饥饿":"24","困":"25","惊恐":"26","流汗":"27","憨笑":"28","大兵":"29","奋斗":"30","咒骂":"31","疑问":"32","嘘":"33","晕":"34","折磨":"35","衰":"36","骷髅":"37","敲打":"38","再见":"39","擦汗":"40","抠鼻":"41","鼓掌":"42","糗大了":"43","坏笑":"44","左哼哼":"45","右哼哼":"46","哈欠":"47","鄙视":"48","委屈":"49","快哭了":"50","阴险":"51","亲亲":"52","吓":"53","可怜":"54","菜刀":"55","西瓜":"56","啤酒":"57","篮球":"58","乒乓":"59","咖啡":"60","饭":"61","猪头":"62","玫瑰":"63","凋谢":"64","示爱":"65","爱心":"66","心碎":"67","蛋糕":"68","闪电":"69","炸弹":"70","刀":"71","足球":"72","瓢虫":"73","便便":"74","月亮":"75","太阳":"76","礼物":"77","拥抱":"78","强":"79","弱":"80","握手":"81","胜利":"82","抱拳":"83","勾引":"84","拳头":"85","差劲":"86","爱你":"87","NO":"88","OK":"89","爱情":"90","飞吻":"91","跳跳":"92","发抖":"93","怄火":"94","转圈":"95","磕头":"96","回头":"97","跳绳":"98","挥手":"99","激动":"100","街舞":"101","献吻":"102","左太极":"103","右太极":"104"}';
	$f = '{"/::)":"0","/::~":"1","/::B":"2","/::|":"3","/:8-)":"4","/::<":"5","/::$":"6","/::X":"7","/::Z":"8","/::(":"9","/::\'(":"9","/::-|":"10","/::@":"11","/::P":"12","/::D":"13","/::O":"14","/::(":"15","/::+":"16","/:--b":"17","/::Q":"18","/::T":"19","/:,@P":"20","/:,@-D":"21","/::d":"22","/:,@o":"23","/::g":"24","/:|-)":"25","/::!":"26","/::L":"27","/::>":"28","/::,@":"29","/:,@f":"30","/::-S":"31","/:?":"32","/:,@x":"33","/:,@@":"34","/::8":"35","/:,@!":"36","/:!!!":"37","/:xx":"38","/:bye":"39","/:wipe":"40","/:dig":"41","/:handclap":"42","/:&-(":"43","/:B-)":"44","/:<@":"45","/:@>":"46","/::-O":"47","/:>-|":"48","/:P-(":"49","/::\'|":"50","/:X-)":"51","/::*":"52","/:@x":"53","/:8*":"54","/:pd":"55","/:<W>":"56","/:beer":"57","/:basketb":"58","/:oo":"59","/:coffee":"60","/:eat":"61","/:pig":"62","/:rose":"63","/:fade":"64","/:showlove":"65","/:heart":"66","/:break":"67","/:cake":"68","/:li":"69","/:bome":"70","/:kn":"71","/:footb":"72","/:ladybug":"73","/:shit":"74","/:moon":"75","/:sun":"76","/:gift":"77","/:hug":"78","/:strong":"79","/:weak":"80","/:share":"81","/:v":"82","/:@)":"83","/:jj":"84","/:@@":"85","/:bad":"86","/:lvu":"87","/:no":"88","/:ok":"89","/:love":"90","/:<L>":"91","/:jump":"92","/:shake":"93","/:<O>":"94","/:circle":"95","/:kotow":"96","/:turn":"97","/:skip":"98","/:oY":"99","/:#-0":"100","/:hiphot":"101","/:kiss":"102","/:<&":"103","/:&>":"104"}';
	$a_start = '<img style="vertical-align:bottom" src="http://cache.soso.com/img/img/e';
	$a_end = '.gif">';
	$s = json_decode($s);
	$f = json_decode($f);
	foreach ($s as $key => $value) {
		$str = str_replace('[' . $key . ']', $a_start . ($value + 100) . $a_end, $str);
	}
	foreach ($f as $key => $value) {
		$str = str_replace('/' . $key, $a_start . ($value + 100) . $a_end, $str);
	}
	return $str;
}

require_once APP_PATH . 'Modules/Forum/Common/pagination.php';