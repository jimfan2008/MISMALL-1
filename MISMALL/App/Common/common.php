<?php

/**
 * 导入所需的类库 同java的Import 本函数有缓存功能
 * @param string $class 类库命名空间字符串
 * @param string $baseUrl 起始路径
 * @param string $ext 导入的文件扩展名
 * @return boolean
 */
function importORG($class) {
	return import($class, $baseUrl = LIB_PATH . 'ORG/', $ext = '.class.php');
}
function importModel($class) {
	return import($class, $baseUrl = LIB_PATH . 'Model/', $ext = '.class.php');
}

/**
 * 渲染输出Widget
 *
 * @param string $name
 *        	Widget名称
 * @param array $data
 *        	传入的参数
 * @param boolean $return
 *        	是否返回内容
 * @param string $path
 *        	Widget所在路径
 * @return void
 */
function Widget($name, $data = array(), $return = false, $path = '') {
	$class = $name . 'Widget';
	$path = empty($path) ? LIB_PATH : $path;
	require_cache($path . 'Widget/' . $class . '.class.php');
	if (!class_exists($class)) {
		throw_exception(L('_CLASS_NOT_EXIST_') . ':' . $class);
	}

	$widget = Think::instance($class);
	$content = $widget->render($data);
	if ($return) {
		return $content;
	} else {
		echo $content;
	}
}

/**
 * 截取UTF-8编码下字符串的函数
 * 汉字2字节英文1字节
 *
 * @param string $str
 *        	被截取的字符串
 * @param int $start
 *        	从第几个开始
 * @param int $length
 *        	截取的长度
 * @param bool $append
 *        	是否附加省略号
 *
 * @return string
 */
function sub_str($str, $start, $length, $append = true) {
	$newstr = "";
	$len = $start + $length;
	$strIdx = $start;
	for ($i = $start; $i < $len; $i++) {
		if (mb_substr($str, $strIdx, 1, "utf-8") == "") {
			break;
		}
		if (ord(mb_substr($str, $strIdx, 1, "utf-8")) > 128) {
			if ($i + 2 > $len) {
				break;
			}
			$newstr .= mb_substr($str, $strIdx, 1, "utf-8");
			$i++;
		} else {
			$newstr .= mb_substr($str, $strIdx, 1, "utf-8");
		}
		$strIdx++;
	}

	if ($append && $str != $newstr) {
		$newstr .= '...';
	}
	return $newstr;
}

/**
 * 转换汉字编码
 *
 * @param String $str
 * @return String
 */
function iconvCN($str) {
	return preg_replace("/\\\u([0-9a-f]{4})/ie", "iconv('UCS-2BE', 'UTF-8', pack('H4', '$1'))", $str);
}

/**
 * 不转义中文字符和\/的 json 编码方法
 * @param array $arr 待编码数组
 * @return string
 */
function json_encode_cn($arr) {
	$str = str_replace("\\/", "/", json_encode($arr));
	$search = "/\\\u([0-9a-f]{4})/ie";

	if (strpos(strtoupper(PHP_OS), 'WIN') === false) {
		$replace = "iconv('UCS-2BE', 'UTF-8', pack('H4', '\\1'))"; //LINUX
	} else {
		$replace = "iconv('UCS-2', 'UTF-8', pack('H4', '\\1'))"; //WINDOWS
	}

	return preg_replace($search, $replace, $str);
}

/**
 * 处理json数据在传递过程中的转义情况
 *
 * @param string $json_data
 * @return string $json_data
 */
function json_addslashes($json_data) {
	return str_replace('\\"', '"', $json_data);
}

/**
 * 检测提交的值是不是含有SQL注射的字符，防止注射，保护服务器安全
 *
 * @param $sql_str: 提交的变量
 * @return 返回检测结果，ture or false
 */
function inject_check($sql_str) {
	return eregi('select|insert|and|or|update|delete|\'|\/\*|\*|\.\.\/|\.\/|union|into|load_file|outfile', $sql_str); // 进行过滤
}

/**
 * 校验提交的ID类值是否合法
 *
 * @param $id: 提交的ID值
 * @return 返回处理后的ID
 */
function verify_id($id = null) {
	if (!$id) {
		exit('没有提交参数！'); // 是否为空判断
	} elseif (inject_check($id)) {
		exit('提交的参数非法！'); // 注射判断
	} elseif (!is_numeric($id)) {
		exit('提交的参数非法！'); // 数字判断
	}
	$id = intval($id); // 整型化

	return $id;
}

/**
 * 对提交的字符串进行过滤
 *
 * @param $var: 要处理的字符串
 * @return 返回过滤后的字符串
 */
function str_check($str) {
	if (!get_magic_quotes_gpc()) { // 判断magic_quotes_gpc是否打开
		$str = addslashes($str); // 进行过滤
	}
	$str = str_replace("_", "\_", $str); // 把 '_'过滤掉
	$str = str_replace("%", "\%", $str); // 把 '%'过滤掉

	return $str;
}

/**
 * 对提交的编辑内容进行处理
 *
 * @param $post: 要提交的内容
 * @return $post: 返回过滤后的内容
 */
function post_check($post) {
	if (!get_magic_quotes_gpc()) { // 判断magic_quotes_gpc是否为打开
		$post = addslashes($post); // 进行magic_quotes_gpc没有打开的情况对提交数据的过滤
	}
	$post = str_replace("_", "\_", $post); // 把 '_'过滤掉
	$post = str_replace("%", "\%", $post); // 把 '%'过滤掉
	$post = nl2br($post); // 回车转换
	$post = htmlspecialchars($post); // html标记转换

	return $post;
}

/**
 * Email地址验证代码
 *
 * @param string $email
 *        	需要验证的email地址
 * @return bool 返回验证成功标识
 */
function validEmail($email) {
	$isValid = true;
	$atIndex = strrpos($email, "@");
	if (is_bool($atIndex) && !$atIndex) {
		$isValid = false;
	} else {
		$domain = substr($email, $atIndex + 1);
		$local = substr($email, 0, $atIndex);
		$localLen = strlen($local);
		$domainLen = strlen($domain);
		if ($localLen < 1 || $localLen > 64) {
			// local part length exceeded
			$isValid = false;
		} else if ($domainLen < 1 || $domainLen > 255) {
			// domain part length exceeded
			$isValid = false;
		} else if ($local[0] == '.' || $local[$localLen - 1] == '.') {
			// local part starts or ends with '.'
			$isValid = false;
		} else if (preg_match('/\\.\\./', $local)) {
			// local part has two consecutive dots
			$isValid = false;
		} else if (!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain)) {
			// character not valid in domain part
			$isValid = false;
		} else if (preg_match('/\\.\\./', $domain)) {
			// domain part has two consecutive dots
			$isValid = false;
		} else if (!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/', str_replace("\\\\", "", $local))) {
			// character not valid in local part unless
			// local part is quoted
			if (!preg_match('/^"(\\\\"|[^"])+"$/', str_replace("\\\\", "", $local))) {
				$isValid = false;
			}
		}
		/*
	 * //5.3.0 This function is now available on Windows platforms.
	 * if ($isValid && !(checkdnsrr($domain, "MX") || checkdnsrr($domain, "A"))) {
	 * // domain not found in DNS
	 * $isValid = false;
	 * }
	 */
	}

	return $isValid;
}

/**
 * 发送邮件公共函数
 *
 * @param string $sendto_email
 *        	发送目标email地址
 * @param string $subject
 *        	邮件标题
 * @param string $body
 *        	邮件正文
 * @return bool 邮件发送成功标识
 */
function sendEmail($sendto_email, $subject, $body) {
	$SMTP_HOST = 'smtp.163.com';
	$SMTP_PORT = '25';
	$SMTP_USER = 'skyflash';
	$SMTP_PASS = '19820825';
	$FROM_EMAIL = 'skyflash@163.com';
	$FROM_NAME = '巧捷万端';
	$REPLY_EMAIL = 'skyflash@163.com';
	$REPLY_NAME = 'vecloud';

	vendor('PHPMailer.class#phpmailer'); // 从PHPMailer目录导class.phpmailer.php类文件
	$mail = new PHPMailer();
	$mail->IsSMTP(); // send via SMTP
	$mail->Host = $SMTP_HOST; // SMTP servers

	$mail->SMTPAuth = true; // turn on SMTP authentication
	$mail->Port = $SMTP_PORT; // SMTP服务器的端口号
	$mail->Username = $SMTP_USER; // SMTP username 注意：普通邮件认证不需要加 @域名
	$mail->Password = $SMTP_PASS; // SMTP password
	$mail->From = $FROM_EMAIL; // 发件人邮箱
	$mail->FromName = $FROM_NAME; // 发件人

	$mail->CharSet = "utf-8"; // 这里指定字符集！
	$mail->Encoding = "base64";
	$mail->AddAddress($sendto_email, $sendto_email); // 收件人邮箱和姓名
	$replyEmail = $REPLY_EMAIL ? $REPLY_EMAIL : $FROM_EMAIL;
	$replyName = $REPLY_EMAIL ? $REPLY_EMAIL : $FROM_EMAIL;
	$mail->AddReplyTo($replyEmail, $replyName);

	// 添加附件
	if (is_array($attachment)) {
		foreach ($attachment as $file) {
			is_file($file) && $mail->AddAttachment($file);
		}
	} else {
		is_file($attachment) && $mail->AddAttachment($attachment);
	}
	// send as HTML
	$mail->IsHTML(true);
	// 邮件主题
	$mail->Subject = $subject;
	// 邮件内容
	$mail->Body = $body;
	$mail->AltBody = "text/html";

	return $mail->Send() ? true : false;
}

/**
 * 生成唯一随机数
 */
function unquire_rand($num = 11, $type = 5) {
	/* 选择一个随机的方案 */
	// mt_srand((double) microtime() * 1000000);
	// return str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
	import('ORG.Util.String');
	return String::randString($num, $type);
}

/**
 * t函数用于过滤标签，输出没有html的干净的文本
 *
 * @param
 *        	string text 文本内容
 * @return string 处理后内容
 */
function text($text) {
	$text = nl2br($text);
	$text = real_strip_tags($text);
	$text = addslashes($text);
	$text = trim($text);
	return $text;
}

/**
 * h函数用于过滤不安全的html标签，输出安全的html
 *
 * @param string $text
 *        	待过滤的字符串
 * @param string $type
 *        	保留的标签格式
 * @return string 处理后内容
 */
function h($text, $type = 'html') {
	// 无标签格式
	$text_tags = '';
	// 只保留链接
	$link_tags = '<a>';
	// 只保留图片
	$image_tags = '<img>';
	// 只存在字体样式
	$font_tags = '<i><b><u><s><em><strong><font><big><small><sup><sub><bdo><h1><h2><h3><h4><h5><h6>';
	// 标题摘要基本格式
	$base_tags = $font_tags . '<p><br><hr><a><img><map><area><pre><code><q><blockquote><acronym><cite><ins><del><center><strike>';
	// 兼容Form格式
	$form_tags = $base_tags . '<form><input><textarea><button><select><optgroup><option><label><fieldset><legend>';
	// 内容等允许HTML的格式
	$html_tags = $base_tags . '<meta><ul><ol><li><dl><dd><dt><table><caption><td><th><tr><thead><tbody><tfoot><col><colgroup><div><span><object><embed><param>';
	// 专题等全HTML格式
	$all_tags = $form_tags . $html_tags . '<!DOCTYPE><html><head><title><body><base><basefont><script><noscript><applet><object><param><style><frame><frameset><noframes><iframe>';
	// 过滤标签
	$text = real_strip_tags($text, ${$type . '_tags'});
	// 过滤攻击代码
	if ($type != 'all') {
		// 过滤危险的属性，如：过滤on事件lang js
		while (preg_match('/(<[^><]+)(ondblclick|onclick|onload|onerror|unload|onmouseover|onmouseup|onmouseout|onmousedown|onkeydown|onkeypress|onkeyup|onblur|onchange|onfocus|action|background|codebase|dynsrc|lowsrc)([^><]*)/i', $text, $mat)) {
			$text = str_ireplace($mat[0], $mat[1] . $mat[3], $text);
		}
		while (preg_match('/(<[^><]+)(window\.|javascript:|js:|about:|file:|document\.|vbs:|cookie)([^><]*)/i', $text, $mat)) {
			$text = str_ireplace($mat[0], $mat[1] . $mat[3], $text);
		}
	}
	return $text;
}

/**
 * 获取缩略图
 *
 * @param string $filename
 *        	原图路劲、url
 * @param int $width
 *        	宽度
 * @param int $height
 *        	高
 * @param boolean $cut
 *        	是否切割 默认不切割
 * @param boolean $replace
 *        	是否替换原图片　默认不替换
 * @return string
 */
function getThumbImage($filename, $width = 100, $height = 'auto', $cut = false, $replace = false) {

	//TODO oss no thumb
	return $filename;
	$thumb_ext = '@';
	if (is_numeric($width)) {
		$thumb_ext .= $width . 'w';
	}
	if (is_numeric($height)) {
		$thumb_ext .= '_' . $height . 'h';
	}
	if ($cut) {
		$thumb_ext .= '_1c';
	}
	return $filename . $thumb_ext;

	$domain = C('UPLOAD_PATH'); // 上传目录

	$filename = str_ireplace(C('UPLOAD_URL'), '', $filename); // 将URL转化为本地地址
	$filename = str_replace(ltrim($domain, '.'), '', $filename);
	// $filename = C('UPLOAD_PATH').$filename;
	$info = pathinfo($filename);
	$image_ext_array = array(
		'jpg',
		'jpeg',
		'png',
		'gif',
		'bmp',
	);

	// 如果不是图片直接返回
	if (!in_array($info['extension'], $image_ext_array)) {
		return $info;
	}

	$oldFile = $info['dirname'] . '/' . $info['filename'] . '.' . $info['extension'];
	$thumbFile = $info['dirname'] . '/' . $info['filename'] . '_' . $width . '_' . $height . '.' . $info['extension'];

	$oldFile = ltrim($domain . str_replace('\\', '/', $oldFile), '/');
	$thumbFile = ltrim($domain . str_replace('\\', '/', $thumbFile), '/');

	// 原图不存在直接返回
	if (!file_exist($oldFile)) {
		return $oldFile;
		// 缩图已存在并且 replace替换为false
	} elseif ((!$replace) && file_exist($thumbFile)) {
		return $thumbFile;
	}

	/*
	 * //获取图片属性
	 * $imgAttr = getimagesize(getImageUrl($oldFile));
	 *
	 * //如果原图片比缩略图小直接返回原图
	 * if( $imgAttr === false && $imgAttr[0] <= $width && $imgAttr[1] <= $height) {
	 * return $oldFile;
	 * }
	 */

	// 生成缩略图
	importORG('Image');
	if ($cut) {
		$res = Image::thumb2($oldFile, $thumbFile, '', $width, $height);
	} else {
		$res = Image::thumb($oldFile, $thumbFile, '', $width, $height);
	}

	// 返回缩图
	return $res ? $thumbFile : $oldFile;
}

/**
 * 获取图片地址 - 兼容云
 *
 * @param String $file
 *        	图片文件
 * @param int $width
 *        	图片宽度
 * @param int $height
 *        	图片高度
 * @param boolean $cut
 *        	是否裁切
 * @param boolean $replace
 *        	是否重新生成替换
 * @return String
 */
function getImageUrl($file, $width = '0', $height = 'auto', $cut = false, $replace = false) {
	if (!$file) {
		return false;
	}

	if ($width > 0) {
		$thumbInfo = getThumbImage($file, $width, $height, $cut, $replace);
		return $thumbInfo;
		//$imageUrl = get_file_url($thumbInfo);
	} else {
		$domain = C('UPLOAD_PATH'); // 上传目录
		$file = str_replace($domain, '', $file);
		$file = str_replace(ltrim($domain, '.'), '', $file);
		return $file;
	}
}

/**
 * 获取图片路径 - 兼容云
 *
 * @param String $file
 *        	图片文件
 * @param int $width
 *        	图片宽度
 * @param int $height
 *        	图片高度
 * @param boolean $cut
 *        	是否裁切
 * @param boolean $replace
 *        	是否重新生成替换
 * @return String
 */
function getImagePath($file, $width = '0', $height = 'auto', $cut = false, $replace = false) {
	if (!$file) {
		return false;
	}
	if ($width > 0) {
		$thumbInfo = getThumbImage($file, $width, $height, $cut, $replace);
		//$imagePath = get_file_path($thumbInfo);
		return $thumbInfo;
	} else {
		$domain = C('UPLOAD_PATH'); // 上传目录
		$file = str_replace($domain, '', $file);
		$file = str_replace(ltrim($domain, '.'), '', $file);
		return $file;
		//$imagePath = get_file_path($domain . $file);
	}
	return $imagePath;
}

if (!function_exists('array_column')) {
	function array_column(array $input, $columnKey, $indexKey = null) {
		$result = array();
		if (null === $indexKey) {
			if (null === $columnKey) {
				$result = array_values($input);
			} else {
				foreach ($input as $row) {
					$result[] = $row[$columnKey];
				}
			}
		} else {
			if (null === $columnKey) {
				foreach ($input as $row) {
					$result[$row[$indexKey]] = $row;
				}
			} else {
				foreach ($input as $row) {
					$result[$row[$indexKey]] = $row[$columnKey];
				}
			}
		}
		return $result;
	}
}

/**
 * 把返回的数据集转换成Tree
 *
 * @param array $list
 *        	要转换的数据集
 * @param string $pid
 *        	parent标记字段
 * @param string $level
 *        	level标记字段
 * @return array
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
function list_to_tree($list, $pk = 'id', $pid = 'pid', $child = '_child', $root = 0) {
	// 创建Tree
	$tree = array();
	if (is_array($list)) {
		// 创建基于主键的数组引用
		$refer = array();
		foreach ($list as $key => $data) {
			$refer[$data[$pk]] = &$list[$key];
		}
		foreach ($list as $key => $data) {
			// 判断是否存在parent
			$parentId = $data[$pid];
			if ($root == $parentId) {
				$tree[] = &$list[$key];
			} else {
				if (isset($refer[$parentId])) {
					$parent = &$refer[$parentId];
					$parent[$child][] = &$list[$key];
				}
			}
		}
	}
	return $tree;
}

/**
 * 将list_to_tree的树还原成列表
 *
 * @param array $tree
 *        	原来的树
 * @param string $child
 *        	孩子节点的键
 * @param string $order
 *        	排序显示的键，一般是主键 升序排列
 * @param array $list
 *        	过渡用的中间数组，
 * @return array 返回排过序的列表数组
 * @author yangweijie <yangweijiester@gmail.com>
 */
function tree_to_list($tree, $child = '_child', $order = 'id', &$list = array()) {
	if (is_array($tree)) {
		$refer = array();
		foreach ($tree as $key => $value) {
			$reffer = $value;
			if (isset($reffer[$child])) {
				unset($reffer[$child]);
				tree_to_list($value[$child], $child, $order, $list);
			}
			$list[] = $reffer;
		}
		$list = list_sort_by($list, $order, $sortby = 'asc');
	}
	return $list;
}

/**
 * 对列表数组进行排序
 *
 * @param array $list
 *        	列表数组
 * @param string $field
 *        	排序的字段名
 *        	例：$list 为二维时 $field='["field_name"]' $list为三维时 $field='["field_name"]['field_name']';
 * @param array $sortby
 *        	排序类型
 *        	asc正向排序 desc逆向排序 nat自然排序
 *
 * @return array
 */
function list_sort_by($list, $field, $sortby = 'asc') {
	if (is_array($list)) {
		$refer = $resultSet = array();
		foreach ($list as $i => $data) {
			eval('$refer[$i]=&$data' . $field . ';');
		}

		switch ($sortby) {
			case 'asc':	// 正向排序
				asort($refer);
				break;
			case 'desc':	// 逆向排序
				arsort($refer);
				break;
			case 'nat':	// 自然排序
				natcasesort($refer);
				break;
		}
		foreach ($refer as $key => $val)
		// $resultSet[] = &$list[$key];
		{
			$resultSet[$key] = &$list[$key];
		}
		// 维持原来索引
		return $resultSet;
	}
	return false;
}

/**
 * 格式化字节大小
 *
 * @param number $size
 *        	字节数
 * @param string $delimiter
 *        	数字和单位分隔符
 * @return string 格式化后的带单位的大小
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
function format_bytes($size, $delimiter = '') {
	$units = array(
		'B',
		'KB',
		'MB',
		'GB',
		'TB',
		'PB',
	);
	for ($i = 0; $size >= 1024 && $i < 5; $i++) {
		$size /= 1024;
	}

	return round($size, 2) . $delimiter . $units[$i];
}

/**
 * 字符串转换为数组，主要用于把分隔符调整到第二个参数
 *
 * @param string $str
 *        	要分割的字符串
 * @param string $glue
 *        	分割符
 * @return array
 */
function str2arr($str, $glue = ',') {
	return explode($glue, $str);
}

/**
 * 数组转换为字符串，主要用于把分隔符调整到第二个参数
 *
 * @param array $arr
 *        	要连接的数组
 * @param string $glue
 *        	分割符
 * @return string
 */
function arr2str($arr, $glue = ',') {
	return implode($glue, $arr);
}

// 不区分大小写的in_array实现
function in_array_case($value, $array) {
	return in_array(strtolower($value), array_map('strtolower', $array));
}

/**
 * 格式化商品价格
 *
 * @access public
 * @param float $price
 *        	商品价格
 * @return string
 */
function currency($price, $change_price = true) {
	if ($price === '') {
		$price = 0;
	}
	if ($price === 0 || $price === '0.00') {
		return L('free_price');
	}
	if ($change_price) {
		switch (C('PRICE_FORMAT')) {
			case 0:
				$price = number_format($price, 2, '.', '');
				break;
			case 1:	// 保留不为 0 的尾数
				$price = preg_replace('/(.*)(\\.)([0-9]*?)0+$/', '\1\2\3', number_format($price, 2, '.', ''));

				if (substr($price, -1) == '.') {
					$price = substr($price, 0, -1);
				}
				break;
			case 2:	// 不四舍五入，保留1位
				$price = substr(number_format($price, 2, '.', ''), 0, -1);
				break;
			case 3:	// 直接取整
				$price = intval($price);
				break;
			case 4:	// 四舍五入，保留 1 位
				$price = number_format($price, 1, '.', '');
				break;
			case 5:	// 先四舍五入，不保留小数
				$price = round($price);
				break;
		}
	} else {
		$price = number_format($price, 2, '.', '');
	}

	return sprintf(C('CURRENCY_FORMAT'), $price);
}

/**
 * 生成用户文件夹名称
 */
function get_user_dir($site_path, $user_id = NULL, $siteType = 0) {
	if (is_null($user_id)) {
		$user_id = session('uid');
	}

	$dir = $user_id ? 'user_' . $user_id : 'Template';

	switch ($siteType) {
		case 0:
			$site_dir = C('WEB_SITE_PATH');
			break;
		case 1:
		case 3:
			$site_dir = C('WX_SITE_PATH');
			break;
		case 2:
			$site_dir = C('APP_SITE_PATH');
			break;
		default:
			$site_dir = C('WEB_SITE_PATH');
			break;
	}

	return $site_dir . $dir . DS . $site_path;
}

/**
 * 获取网站域名
 */
function get_host_url($url = '') {
	return U($url, '', false, false, true);
}

/**
 * 处理文件下载
 */
function downloadFile($file_path, $file_name) {
	if (!file_exists($file_path)) {
		header("Content-type: text/html; charset=utf-8");
		return "File not found!";
		exit();
	} else {
		$file = fopen($file_path, "r");
		header("Content-type: application/octet-stream");
		header("Accept-Ranges: bytes");
		header("Accept-Length: " . filesize($file_path));
		header("Content-Disposition: attachment; filename=" . $file_name);

		while (!feof($file)) {
			return fread($file, filesize($file_path));
		}
		fclose($file);
	}
}

/**
 * *********Action行为日志****************
 */

/**
 */
function get_user_nickname($uid) {
	$userName = M('Users')->where(array(
		'ID' => $uid,
	))->getField('userName');
	return $userName ? $userName : false;
}

/**
 * 记录行为日志，并执行该行为的规则
 *
 * @param string $action
 *        	行为标识
 * @param string $model
 *        	触发行为的模型名
 * @param int $record_id
 *        	触发行为的记录id
 * @param int $user_id
 *        	执行行为的用户id
 * @return boolean
 * @author huajie <banhuajie@163.com>
 */
function action_log($action = null, $model = null, $record_id = null, $user_id = null) {
	// 参数检查
	if (empty($action) || empty($model) || empty($record_id)) {
		return '参数不能为空';
	}
	if (empty($user_id)) {
		$user_id = is_login();
	}

	// 查询行为,判断是否执行
	$action_info = M('Action')->getByName($action);
	if ($action_info['status'] != 1) {
		return '该行为被禁用或删除';
	}

	// 插入行为日志
	$data['action_id'] = $action_info['id'];
	$data['user_id'] = $user_id;
	$data['action_ip'] = ip2long(get_client_ip());
	$data['model'] = $model;
	$data['record_id'] = $record_id;
	$data['create_time'] = NOW_TIME;
	$data['type'] = $action_info['type'];

	// 解析日志规则,生成日志备注
	if (!empty($action_info['log'])) {
		if (preg_match_all('/\[(\S+?)\]/', $action_info['log'], $match)) {
			$log['user'] = $user_id;
			$log['record'] = $record_id;
			$log['model'] = $model;
			$log['time'] = NOW_TIME;
			$log['data'] = array(
				'user' => $user_id,
				'model' => $model,
				'record' => $record_id,
				'time' => NOW_TIME,
			);
			foreach ($match[1] as $value) {
				$param = explode('|', $value);
				if (isset($param[1])) {
					$replace[] = call_user_func($param[1], $log[$param[0]]);
				} else {
					$replace[] = $log[$param[0]];
				}
			}
			$data['remark'] = str_replace($match[0], $replace, $action_info['log']);
		} else {
			$data['remark'] = $action_info['log'];
		}
	} else {
		// 未定义日志规则，记录操作url
		$data['remark'] = '操作url：' . $_SERVER['REQUEST_URI'];
	}

	M('ActionLog')->add($data);

	if (!empty($action_info['rule'])) {
		// 解析行为
		$rules = parse_action($action, $user_id);

		// 执行行为
		$res = execute_action($rules, $action_info['id'], $user_id);
	}
}

/**
 * 解析行为规则
 * 规则定义 table:$table|field:$field|condition:$condition|rule:$rule[|cycle:$cycle|max:$max][;......]
 * 规则字段解释：table->要操作的数据表，不需要加表前缀；
 * field->要操作的字段；
 * condition->操作的条件，目前支持字符串，默认变量{$self}为执行行为的用户
 * rule->对字段进行的具体操作，目前支持四则混合运算，如：1+score*2/2-3
 * cycle->执行周期，单位（小时），表示$cycle小时内最多执行$max次
 * max->单个周期内的最大执行次数（$cycle和$max必须同时定义，否则无效）
 * 单个行为后可加 ； 连接其他规则
 *
 * @param string $action
 *        	行为id或者name
 * @param int $self
 *        	替换规则里的变量为执行用户的id
 * @return boolean|array: false解析出错 ， 成功返回规则数组
 * @author huajie <banhuajie@163.com>
 */
function parse_action($action = null, $self) {
	if (empty($action)) {
		return false;
	}

	// 参数支持id或者name
	if (is_numeric($action)) {
		$map = array(
			'id' => $action,
		);
	} else {
		$map = array(
			'name' => $action,
		);
	}

	// 查询行为信息
	$info = M('Action')->where($map)->find();
	if (!$info || $info['status'] != 1) {
		return false;
	}

	// 解析规则:table:$table|field:$field|condition:$condition|rule:$rule[|cycle:$cycle|max:$max][;......]
	$rules = $info['rule'];
	$rules = str_replace('{$self}', $self, $rules);
	$rules = explode(';', $rules);
	$return = array();
	foreach ($rules as $key => &$rule) {
		$rule = explode('|', $rule);
		foreach ($rule as $k => $fields) {
			$field = empty($fields) ? array() : explode(':', $fields);
			if (!empty($field)) {
				$return[$key][$field[0]] = $field[1];
			}
		}
		// cycle(检查周期)和max(周期内最大执行次数)必须同时存在，否则去掉这两个条件
		if (!array_key_exists('cycle', $return[$key]) || !array_key_exists('max', $return[$key])) {
			unset($return[$key]['cycle'], $return[$key]['max']);
		}
	}

	return $return;
}

/**
 * 执行行为
 *
 * @param array $rules
 *        	解析后的规则数组
 * @param int $action_id
 *        	行为id
 * @param array $user_id
 *        	执行的用户id
 * @return boolean false 失败 ， true 成功
 * @author huajie <banhuajie@163.com>
 */
function execute_action($rules = false, $action_id = null, $user_id = null) {
	if (!$rules || empty($action_id) || empty($user_id)) {
		return false;
	}

	$return = true;
	foreach ($rules as $rule) {

		// 检查执行周期
		$map = array(
			'action_id' => $action_id,
			'user_id' => $user_id,
		);
		$map['create_time'] = array(
			'gt',
			NOW_TIME - intval($rule['cycle']) * 3600,
		);
		$exec_count = M('ActionLog')->where($map)->count();
		if ($exec_count > $rule['max']) {
			continue;
		}

		// 执行数据库操作
		$Model = M(ucfirst($rule['table']));
		$field = $rule['field'];
		$res = $Model->where($rule['condition'])->setField($field, array(
			'exp',
			$rule['rule'],
		));

		if (!$res) {
			$return = false;
		}
	}
	return $return;
}

/**
 * 获取文档封面图片
 *
 * @param int $cover_id
 * @param string $field
 *
 * @return 完整的数据 或者 指定的$field字段值
 */
function get_cover($cover_id, $field = null) {
	if (empty($cover_id)) {
		return false;
	}
	$picture = M('Picture')->where(array(
		'status' => 1,
	))->getById($cover_id);
	return empty($field) ? $picture : $picture[$field];
}

/**
 * 判断是否是通过手机访问
 */
function isMobile() {

	importORG('MobileDetect');
	$mb = new MobileDetect();
	return $mb->isMobile();

	// 如果有HTTP_X_WAP_PROFILE则一定是移动设备
	if (isset($_SERVER['HTTP_X_WAP_PROFILE'])) {
		return true;
	}
	// 如果via信息含有wap则一定是移动设备,部分服务商会屏蔽该信息
	if (isset($_SERVER['HTTP_VIA'])) {
		// 找不到为flase,否则为true
		return stristr($_SERVER['HTTP_VIA'], "wap") ? true : false;
	}
	// 判断手机发送的客户端标志,兼容性有待提高
	if (isset($_SERVER['HTTP_USER_AGENT'])) {
		$clientkeywords = array(
			'nokia',
			'sony',
			'ericsson',
			'mot',
			'samsung',
			'htc',
			'sgh',
			'lg',
			'sharp',
			'sie-',
			'philips',
			'panasonic',
			'alcatel',
			'lenovo',
			'iphone',
			'ipod',
			'ipad',
			'blackberry',
			'meizu',
			'android',
			'netfront',
			'symbian',
			'ucweb',
			'windowsce',
			'palm',
			'operamini',
			'operamobi',
			'openwave',
			'nexusone',
			'cldc',
			'midp',
			'wap',
			'mobile',
		);
		// 从HTTP_USER_AGENT中查找手机浏览器的关键字
		if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT']))) {
			return true;
		}
	}
	// 协议法，因为有可能不准确，放到最后判断
	if (isset($_SERVER['HTTP_ACCEPT'])) {
		// 如果只支持wml并且不支持html那一定是移动设备
		// 如果支持wml和html但是wml在html之前则是移动设备
		if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html')))) {
			return true;
		}
	}
	return false;
}

/**
 * 笛卡尔积组合数组;数组中的每个元素取一个重新组合新数组；
 * eg:假设集合A={a,b}，集合B={0,1,2}，
 * 则两个集合的笛卡尔积为{(a,0),(a,1),(a,2),(b,0),(b,1), (b,2)}
 */
function Descartes() {
	$t = func_get_args();
	if (func_num_args() == 1) {
		return call_user_func_array(__FUNCTION__, $t[0]);
	}

	$a = array_shift($t);
	if (!is_array($a)) {
		$a = array(
			$a,
		);
	}

	$a = array_chunk($a, 1);
	do {
		$r = array();
		$b = array_shift($t);
		if (!is_array($b)) {
			$b = array(
				$b,
			);
		}

		foreach ($a as $p) {
			foreach (array_chunk($b, 1) as $q) {
				$r[] = array_merge($p, $q);
			}
		}

		$a = $r;
	} while ($t);
	return $r;
}

/**
 * 把对象转成数组
 *
 * @param $d 要转的对象$d
 */
function objectToArray($d) {
	if (is_object($d)) {
		// Gets the properties of the given object
		// with get_object_vars function
		$d = get_object_vars($d);
	}

	if (is_array($d)) {
		/*
		 * Return array converted to object
		 * Using __FUNCTION__ (Magic constant)
		 * for recursive call
		 */
		return array_map(__FUNCTION__, $d);
	} else {
		// Return array
		return $d;
	}
}

/**
 * 把数组转成对象
 *
 * @param $d 要转的数组$d
 */
function arrayToObject($d) {
	if (is_array($d)) {
		/*
		 * Return array converted to object
		 * Using __FUNCTION__ (Magic constant)
		 * for recursive call
		 */
		return (object) array_map(__FUNCTION__, $d);
	} else {
		// Return object
		return $d;
	}
}

/**
 * 获取多维数组的特定键的所有值
 * @url http://cn2.php.net/array_values
 *
 * @param $key string
 * @param $arr array
 * @return null|string|array
 */
function array_value_recursive($key, array $arr) {
	$val = array();
	array_walk_recursive($arr, function ($v, $k) use ($key, &$val) {
		if ($k == $key) {
			array_push($val, $v);
		}
	});
	return count($val) > 1 ? $val : array_pop($val);
}

/**
 * firebug输出信息
 *
 * @param mixed $str
 *        	数据
 * @return null
 */
function writeLog($str) {
	echo '<script>console.log(' . json_encode_cn($str) . ');</script>';
}

// PHP中对汉字进行UNICODE编码和解码的实现
// 将内容进行UNICODE编码
function unicode_encode($name) {
	$name = iconv('UTF-8', 'UCS-2', $name);
	$len = strlen($name);
	$str = '';
	for ($i = 0; $i < $len - 1; $i = $i + 2) {
		$c = $name[$i];
		$c2 = $name[$i + 1];
		if (ord($c) > 0) {
			// 两个字节的文字
			$str .= '\u' . base_convert(ord($c), 10, 16) . base_convert(ord($c2), 10, 16);
		} else {
			$str .= $c2;
		}
	}
	return $str;
}

// 将UNICODE编码后的内容进行解码
function unicode_decode($name) {
	// 转换编码，将Unicode编码转换成可以浏览的utf-8编码
	$pattern = '/([\w]+)|(\\\u([\w]{4}))/i';
	preg_match_all($pattern, $name, $matches);
	if (!empty($matches)) {
		$name = '';
		for ($j = 0; $j < count($matches[0]); $j++) {
			$str = $matches[0][$j];
			if (strpos($str, '\\u') === 0) {
				$code = base_convert(substr($str, 2, 2), 16, 10);
				$code2 = base_convert(substr($str, 4), 16, 10);
				$c = chr($code) . chr($code2);
				$c = iconv('UCS-2', 'UTF-8', $c);
				$name .= $c;
			} else {
				$name .= $str;
			}
		}
	}
	return $name;
}

/**
 * 抛出异常处理
 *
 * @param string $msg
 *        	异常消息
 * @param integer $code
 *        	异常代码 默认为0
 * @return void
 */
function E($msg, $code = 0) {
	throw_exception($msg, 'ThinkException', $code);
}

/**
 * 根据经纬度获取地址
 *
 * @param floatval $latitude
 *        	经度
 * @param floatval $longitude
 *        	纬度
 * @return array
 */
function geocode($latitude, $longitude) {
	if (empty($latitude) || empty($longitude)) {
		return array();
	}
	importORG("Curl");
	$url = "http://maps.google.cn/maps/api/geocode/json?latlng={$latitude},{$longitude}&sensor=true&language=zh-CN";
	$json = Curl::get($url);
	$json = json_decode($json);
	$political = array();
	if ($json->status == 'OK') {
		$result = $json->results[0];
		$address = explode(' ', $result->formatted_address);
		$political['address'] = $address[0];
		$address_components = $result->address_components;
		foreach ($address_components as $com) {
			switch ($com->types[0]) {
				case 'administrative_area_level_1':
					$political['province'] = $com->long_name;
					break;
				case 'locality':
					$political['city'] = $com->long_name;
					break;
				case 'sublocality_level_1':
					$political['district'] = $com->long_name;
					break;
				case 'route':
					$political['route'] = $com->long_name;
					break;
				case 'postal_code':
					$political['postalcode'] = $com->long_name;
					break;
				default:
					break;
			}
		}
		// dump($political);
		// dump($result);
	}
	return $political;
	// dump($json);exit;
}

/**
 * 是否包含子串
 */

function strexists($string, $find) {
	return !(strpos($string, $find) === FALSE);
}

/**
 * 生成随机字符串
 *
 * @param int $length 字符数
 * @param boolean $numeric 是否全数字
 *
 * @return string
 */
function random($length, $numeric = false) {
	$seed = base_convert(md5(microtime() . $_SERVER['DOCUMENT_ROOT']), 16, $numeric ? 10 : 35);
	$seed = $numeric ? (str_replace('0', '', $seed) . '012340567890') : ($seed . 'zZ' . strtoupper($seed));
	if ($numeric) {
		$hash = '';
	} else {
		$hash = chr(rand(1, 26) + rand(0, 1) * 32 + 64);
		$length--;
	}
	$max = strlen($seed) - 1;
	for ($i = 0; $i < $length; $i++) {
		$hash .= $seed{mt_rand(0, $max)};
	}
	return $hash;
}

/**
 * 生成带时间的字符串
 * 
 * 
 */
 function getTimeStr($y=1,$m=1,$d=1,$h=1,$i=1,$s=1){
 	$timeStr = "";
 	if($y){
 		$timeStr .=date("Y");
 	}
	if($m){
 		$timeStr .=date("m");
 	}
	if($d){
 		$timeStr .=date("d");
 	}
	if($h){
 		$timeStr .=date("H");
 	}
	if($i){
 		$timeStr .=date("i");
 	}
	if($s){
 		$timeStr .=date("s");
 	}
	
	return $timeStr;
 }
