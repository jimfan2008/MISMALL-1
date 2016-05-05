<?php
/**
 * 微信基础处理类
 *
 * @author cjli
 *
 */

class WechatBase {
	/**
	 * 帐号信息
	 * @var array
	 */
	protected $appid;
	protected $secret;

	/**
	 * 是否记录log
	 * @var boolean
	 */
	protected $debug = true;

	protected $error;
	/**
	 * 获取保存的accesstoken
	 */
	protected function getToken() {
		$cache_id = md5('wechat-token-' . $this->appid . '-' . $this->secret);
		//$accesstoken = session($cache_id);
		//if (!$accesstoken) {
		// 去微信获取最新ACCESS_TOKEN
		//$params = array('grant_type' => 'client_credential', 'appid' => $this -> account['app_id'], 'secret' => $this -> account['app_secret']);
		$params = array('grant_type' => 'client_credential', 'appid' => $this->appid, 'secret' => $this->secret);
		$url = 'https://api.weixin.qq.com/cgi-bin/token';
		$result = $this->http($url, $params);

		if ($result === false) {
			return false;
			//throw new Exception($this->getErrorInfo());
		}
		$accesstoken = $result['access_token'];

		//session($cache_id, $accesstoken);
		// 放进缓存,默认7200s
		//}
		return $accesstoken;
	}

	/**
	 * 发送HTTP请求方法，目前只支持CURL发送请求
	 *
	 * @param  string $url    请求URL
	 * @param  array  $params 请求参数
	 * @param  string $method 请求方法GET/POST
	 * @param  array  $header 请求头部信息
	 * @param  boolean $multi  判断是否传输文件
	 * @param  boolean $qyapi  企业号API
	 *
	 * @return array  $data   响应数据
	 */
	protected function http($url, $params = '', $method = 'GET', $extra = array(), $multi = false, $qyapi = false) {
		$opts = array(
			CURLOPT_TIMEOUT => 30,
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_SSL_VERIFYHOST => false,
		);

		$param = (is_array($params) && $params) ? http_build_query($params) : $params;

		/* 根据请求类型设置特定参数 */
		switch (strtoupper($method)) {
			case 'GET':
				$opts[CURLOPT_URL] = $url . ($param ? ((strpos($url, '?') ? '&' : '?') . $param) : '');
				break;
			case 'POST':
				$opts[CURLOPT_URL] = $url;
				$opts[CURLOPT_POST] = 1;
				$opts[CURLOPT_POSTFIELDS] = $multi ? $params : $param; 	//文件上传不能转义
				break;
			default:
				//throw new Exception('不支持的请求方式！');
				$this->error = 's01';
				return false;
		}
		//扩展
		if (!empty($extra) && is_array($extra)) {
			$headers = array();
			foreach ($extra as $opt => $value) {
				if (!(strpos($opt, 'CURLOPT_') === FALSE)) {
					$opts[constant($opt)] = $value;
				} elseif (is_numeric($opt)) {
					$opts[$opt] = $value;
				} else {
					$headers[] = "{$opt}: {$value}";
				}
			}
			if (!empty($headers)) {
				$opts[CURLOPT_HTTPHEADER] = $headers;
			}
		}

		/* 初始化并执行curl请求 */
		$ch = curl_init();
		curl_setopt_array($ch, $opts);
		$data = curl_exec($ch);
		$error = curl_error($ch);
		curl_close($ch);
		//if($error) throw new Exception('请求发生错误：' . $error);
		if ($error) {
			$this->error = 's02';
			return false;
		}

		$data = json_decode($data, true);
		//dump($data);exit;
		if (isset($data['errcode']) && $data['errcode']) {
			if ($qyapi) {
				$error = $this->getQyApiError($data['errcode']);
			} else {
				$error = $this->getError($data['errcode']);
			}

			if ($this->debug) {
				Log::write("HTTP请求发生错误 : \n" . $error . '\n', Log::DEBUG);
			}
			//throw new Exception($error);
			$this->error = $data['errcode'];
			return false;
		}

		return $data;
	}

	/**
	 * 企业号API http调用
	 */
	protected function qyHttp($url, $params = '', $method = 'GET', $extra = array(), $multi = false) {
		return $this->http($url, $params, $method, $extra, $multi, true);
	}

	/**
	 * 数据XML编码
	 *
	 * @param  mixed  $data 数据
	 * @param  string $item 数字索引时的节点名称
	 * @param  object $xml  XML对象
	 *
	 * @return string
	 */
	protected function data2xml($data, $item = 'item', $xml = NULL) {
		if (is_null($xml)) {
			$xml = new SimpleXMLElement('<xml></xml>');
		}
		foreach ($data as $key => $value) {
			/* 指定默认的数字key */
			is_numeric($key) && $key = $item;

			/* 添加子元素 */
			if (is_array($value) || is_object($value)) {
				$child = $xml->addChild($key);
				$this->data2xml($value, $item, $child);
			} else {
				if (is_numeric($value)) {
					$child = $xml->addChild($key, $value);
				} else {
					$child = $xml->addChild($key);
					$node = dom_import_simplexml($child);
					$node->appendChild($node->ownerDocument->createCDATASection($value));
				}
			}
		}
		return $xml->asXML();
	}

	/**
	 * 不转义中文字符和\/的 json 编码方法
	 * @param array $arr 待编码数组
	 * @return string
	 */
	protected function jsencode($arr) {
		$str = str_replace("\\/", "/", json_encode($arr));
		$search = "#\\\u([0-9a-f]+)#ie";

		if (strpos(strtoupper(PHP_OS), 'WIN') === false) {
			$replace = "iconv('UCS-2BE', 'UTF-8', pack('H4', '\\1'))";
			//LINUX
		} else {
			$replace = "iconv('UCS-2', 'UTF-8', pack('H4', '\\1'))";
			//WINDOWS
		}

		return preg_replace($search, $replace, $str);
	}

	/**
	 * 截取UTF-8编码下字符串的函数
	 * 汉字2字节英文1字节
	 *
	 * @param string $str 被截取的字符串
	 * @param int $start 从第几个开始
	 * @param int $length 截取的长度
	 * @param bool $append 是否附加省略号
	 *
	 * @return  string
	 */
	protected function str_cut($str, $start, $length, $append = false) {
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
	 * 微信消息错误类型
	 *
	 * @param int $code
	 *
	 * @return string
	 */
	protected function getError($code) {
		$errcode = array(
			"-1" => "系统繁忙",
			"40001" => "获取access_token时AppSecret错误，或者access_token无效",
			"40002" => "不合法的凭证类型",
			"40003" => "不合法的OpenID",
			"40004" => "不合法的媒体文件类型",
			"40005" => "不合法的文件类型",
			"40006" => "不合法的文件大小",
			"40007" => "不合法的媒体文件id",
			"40008" => "不合法的消息类型",
			"40009" => "不合法的图片文件大小",
			"40010" => "不合法的语音文件大小",
			"40011" => "不合法的视频文件大小",
			"40012" => "不合法的缩略图文件大小",
			"40013" => "不合法的APPID",
			"40014" => "不合法的access_token",
			"40015" => "不合法的菜单类型",
			"40016" => "不合法的按钮个数",
			"40017" => "不合法的按钮个数",
			"40018" => "不合法的按钮名字长度",
			"40019" => "不合法的按钮KEY长度",
			"40020" => "不合法的按钮URL长度",
			"40021" => "不合法的菜单版本号",
			"40022" => "不合法的子菜单级数",
			"40023" => "不合法的子菜单按钮个数",
			"40024" => "不合法的子菜单按钮类型",
			"40025" => "不合法的子菜单按钮名字长度",
			"40026" => "不合法的子菜单按钮KEY长度",
			"40027" => "不合法的子菜单按钮URL长度",
			"40028" => "不合法的自定义菜单使用用户",
			"40029" => "不合法的oauth_code",
			"40030" => "不合法的refresh_token",
			"40031" => "不合法的openid列表",
			"40032" => "不合法的openid列表长度",
			"40033" => "不合法的请求字符，不能包含\uxxxx格式的字符",
			"40035" => "不合法的参数",
			"40038" => "不合法的请求格式",
			"40039" => "不合法的URL长度",
			"40050" => "不合法的分组id",
			"40051" => "分组名字不合法",
			"41001" => "缺少access_token参数",
			"41002" => "缺少appid参数",
			"41003" => "缺少refresh_token参数",
			"41004" => "缺少secret参数",
			"41005" => "缺少多媒体文件数据",
			"41006" => "缺少media_id参数",
			"41007" => "缺少子菜单数据",
			"41008" => "缺少oauth code",
			"41009" => "缺少openid",
			"42001" => "access_token超时",
			"42002" => "refresh_token超时",
			"42003" => "oauth_code超时",
			"43001" => "需要GET请求",
			"43002" => "需要POST请求",
			"43003" => "需要HTTPS请求",
			"43004" => "需要接收者关注",
			"43005" => "需要好友关系",
			"44001" => "多媒体文件为空",
			"44002" => "POST的数据包为空",
			"44003" => "图文消息内容为空",
			"44004" => "文本消息内容为空",
			"45001" => "多媒体文件大小超过限制",
			"45002" => "消息内容超过限制",
			"45003" => "标题字段超过限制",
			"45004" => "描述字段超过限制",
			"45005" => "链接字段超过限制",
			"45006" => "图片链接字段超过限制",
			"45007" => "语音播放时间超过限制",
			"45008" => "图文消息超过限制",
			"45009" => "接口调用超过限制",
			"45010" => "创建菜单个数超过限制",
			"45015" => "回复时间超过限制",
			"45016" => "系统分组，不允许修改",
			"45017" => "分组名字过长",
			"45018" => "分组数量超过上限",
			"46001" => "不存在媒体数据",
			"46002" => "不存在的菜单版本",
			"46003" => "不存在的菜单数据",
			"46004" => "不存在的用户",
			"47001" => "解析JSON/XML内容错误",
			"48001" => "api功能未授权",
			"50001" => "用户未授权该api",

			//自定义错误
			's01' => '不支持的请求方式',
			's02' => '请求发生错误',
			's03' => '分组名称不能为空',
		);
		return $errcode[$code];
	}

	/**
	 * 微信企业号消息错误类型
	 *
	 * @param int $code
	 *
	 * @return string
	 */
	public function getQyApiError($code) {
		$errcode = array(
			"-1" => "系统繁忙",
			"0" => "请求成功",
			"40001" => "获取access_token时Secret错误，或者access_token无效",
			"40002" => "不合法的凭证类型",
			"40003" => "不合法的UserID",
			"40004" => "不合法的媒体文件类型",
			"40005" => "不合法的文件类型",
			"40006" => "不合法的文件大小",
			"40007" => "不合法的媒体文件id",
			"40008" => "不合法的消息类型",
			"40013" => "不合法的corpid",
			"40014" => "不合法的access_token",
			"40015" => "不合法的菜单类型",
			"40016" => "不合法的按钮个数",
			"40017" => "不合法的按钮类型",
			"40018" => "不合法的按钮名字长度",
			"40019" => "不合法的按钮KEY长度",
			"40020" => "不合法的按钮URL长度",
			"40021" => "不合法的菜单版本号",
			"40022" => "不合法的子菜单级数",
			"40023" => "不合法的子菜单按钮个数",
			"40024" => "不合法的子菜单按钮类型",
			"40025" => "不合法的子菜单按钮名字长度",
			"40026" => "不合法的子菜单按钮KEY长度",
			"40027" => "不合法的子菜单按钮URL长度",
			"40028" => "不合法的自定义菜单使用员工",
			"40029" => "不合法的oauth_code",
			"40031" => "不合法的UserID列表",
			"40032" => "不合法的UserID列表长度",
			"40033" => "不合法的请求字符，不能包含\uxxxx格式的字符",
			"40035" => "不合法的参数",
			"40038" => "不合法的请求格式",
			"40039" => "不合法的URL长度",
			"40040" => "不合法的插件token",
			"40041" => "不合法的插件id",
			"40042" => "不合法的插件会话",
			"40048" => "url中包含不合法domain",
			"40054" => "不合法的子菜单url域名",
			"40055" => "不合法的按钮url域名",
			"40056" => "不合法的agentid",
			"40057" => "不合法的callbackurl",
			"40058" => "不合法的红包参数",
			"40059" => "不合法的上报地理位置标志位",
			"40060" => "设置上报地理位置标志位时没有设置callbackurl",
			"40061" => "设置应用头像失败",
			"40062" => "不合法的应用模式",
			"40063" => "红包参数为空",
			"40064" => "管理组名字已存在",
			"40065" => "不合法的管理组名字长度",
			"40066" => "不合法的部门列表",
			"40067" => "标题长度不合法",
			"40068" => "不合法的标签ID",
			"40069" => "不合法的标签ID列表",
			"40070" => "列表中所有标签（用户）ID都不合法",
			"40071" => "不合法的标签名字，标签名字已经存在",
			"40072" => "不合法的标签名字长度",
			"40073" => "不合法的openid",
			"40074" => "news消息不支持指定为高保密消息",
			"41001" => "缺少access_token参数",
			"41002" => "缺少corpid参数",
			"41003" => "缺少refresh_token参数",
			"41004" => "缺少secret参数",
			"41005" => "缺少多媒体文件数据",
			"41006" => "缺少media_id参数",
			"41007" => "缺少子菜单数据",
			"41008" => "缺少oauth code",
			"41009" => "缺少UserID",
			"41010" => "缺少url",
			"41011" => "缺少agentid",
			"41012" => "缺少应用头像mediaid",
			"41013" => "缺少应用名字",
			"41014" => "缺少应用描述",
			"41015" => "缺少Content",
			"41016" => "缺少标题",
			"41017" => "缺少标签ID",
			"41018" => "缺少标签名字",
			"42001" => "access_token超时",
			"42002" => "refresh_token超时",
			"42003" => "oauth_code超时",
			"42004" => "插件token超时",
			"43001" => "需要GET请求",
			"43002" => "需要POST请求",
			"43003" => "需要HTTPS",
			"43004" => "需要接收者关注",
			"43005" => "需要好友关系",
			"43006" => "需要订阅",
			"43007" => "需要授权",
			"43008" => "需要支付授权",
			"43009" => "需要认证",
			"43010" => "需要处于回调模式",
			"43011" => "需要企业授权",
			"44001" => "多媒体文件为空",
			"44002" => "POST的数据包为空",
			"44003" => "图文消息内容为空",
			"44004" => "文本消息内容为空",
			"45001" => "多媒体文件大小超过限制",
			"45002" => "消息内容超过限制",
			"45003" => "标题字段超过限制",
			"45004" => "描述字段超过限制",
			"45005" => "链接字段超过限制",
			"45006" => "图片链接字段超过限制",
			"45007" => "语音播放时间超过限制",
			"45008" => "图文消息超过限制",
			"45009" => "接口调用超过限制",
			"45010" => "创建菜单个数超过限制",
			"45015" => "回复时间超过限制",
			"45016" => "系统分组，不允许修改",
			"45017" => "分组名字过长",
			"45018" => "分组数量超过上限",
			"46001" => "不存在媒体数据",
			"46002" => "不存在的菜单版本",
			"46003" => "不存在的菜单数据",
			"46004" => "不存在的员工",
			"47001" => "解析JSON/XML内容错误",
			"48002" => "Api禁用",
			"50001" => "redirect_uri未授权",
			"50002" => "员工不在权限范围",
			"50003" => "应用已停用",
			"50004" => "员工状态不正确（未关注状态）",
			"50005" => "企业已禁用",
			"60001" => "部门长度不符合限制",
			"60002" => "部门层级深度超过限制",
			"60003" => "部门不存在",
			"60004" => "父亲部门不存在",
			"60005" => "不允许删除有成员的部门",
			"60006" => "不允许删除有子部门的部门",
			"60007" => "不允许删除根部门",
			"60008" => "部门名称已存在",
			"60009" => "部门名称含有非法字符",
			"60010" => "部门存在循环关系",
			"60011" => "管理员权限不足，（user/department/agent）无权限",
			"60012" => "不允许删除默认应用",
			"60013" => "不允许关闭应用",
			"60014" => "不允许开启应用",
			"60015" => "不允许修改默认应用可见范围",
			"60016" => "不允许删除存在成员的标签",
			"60017" => "不允许设置企业",
			"60102" => "UserID已存在",
			"60103" => "手机号码不合法",
			"60104" => "手机号码已存在",
			"60105" => "邮箱不合法",
			"60106" => "邮箱已存在",
			"60107" => "微信号不合法",
			"60108" => "微信号已存在",
			"60109" => "QQ号已存在",
			"60110" => "部门个数超出限制",
			"60111" => "UserID不存在",
			"60112" => "成员姓名不合法",
			"60113" => "身份认证信息（微信号/手机/邮箱）不能同时为空",
			"60114" => "性别不合法 ",

			//自定义错误
			's01' => '不支持的请求方式',
			's02' => '请求发生错误',
			's03' => '分组名称不能为空',
			's04' => '请选择接收消息对象',
		);

		return $errcode[$code];
	}

	/**
	 * 获取当前错误
	 *
	 * @param boolean $qyapi 企业号API
	 */
	public function getErrorInfo($qyapi = false) {
		if ($qyapi) {
			return $this->getQyApiError($this->error);
		} else {
			return $this->getError($this->error);
		}
	}

	/**
	 * 获取网页内容
	 *
	 * @param $url URL链接
	 * @param $post 参数
	 * @param $extra  扩展
	 * @param $timeout 时间
	 *
	 * @return array
	 */
	public function http_request($url, $post = '', $extra = array(), $timeout = 60) {
		$urlset = parse_url($url);
		if (empty($urlset['path'])) {
			$urlset['path'] = '/';
		}
		if (!empty($urlset['query'])) {
			$urlset['query'] = "?{$urlset['query']}";
		}
		if (empty($urlset['port'])) {
			$urlset['port'] = $urlset['scheme'] == 'https' ? '443' : '80';
		}

		if (function_exists('curl_init') && function_exists('curl_exec')) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $urlset['scheme'] . '://' . $urlset['host'] . ($urlset['port'] == '80' ? '' : ':' . $urlset['port']) . $urlset['path'] . $urlset['query']);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_HEADER, 1);
			if ($post) {
				curl_setopt($ch, CURLOPT_POST, 1);
				if (is_array($post)) {
					$post = http_build_query($post);
				}
				curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
			}
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
			curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
			curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:9.0.1) Gecko/20100101 Firefox/9.0.1');
			if (!empty($extra) && is_array($extra)) {
				$headers = array();
				foreach ($extra as $opt => $value) {
					if (strexists($opt, 'CURLOPT_')) {
						curl_setopt($ch, constant($opt), $value);
					} elseif (is_numeric($opt)) {
						curl_setopt($ch, $opt, $value);
					} else {
						$headers[] = "{$opt}: {$value}";
					}
				}
				if (!empty($headers)) {
					curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
				}
			}
			$data = curl_exec($ch);
			$status = curl_getinfo($ch);
			$errno = curl_errno($ch);
			$error = curl_error($ch);
			curl_close($ch);
			if ($errno || empty($data)) {
				$this->error = $error;
				return false;
			} else {
				return $this->http_response_parse($data);
			}
		}
		$method = empty($post) ? 'GET' : 'POST';
		$fdata = "{$method} {$urlset['path']}{$urlset['query']} HTTP/1.1\r\n";
		$fdata .= "Host: {$urlset['host']}\r\n";
		if (function_exists('gzdecode')) {
			$fdata .= "Accept-Encoding: gzip, deflate\r\n";
		}
		$fdata .= "Connection: close\r\n";
		if (!empty($extra) && is_array($extra)) {
			foreach ($extra as $opt => $value) {
				if (!strexists($opt, 'CURLOPT_')) {
					$fdata .= "{$opt}: {$value}\r\n";
				}
			}
		}
		$body = '';
		if ($post) {
			if (is_array($post)) {
				$body = http_build_query($post);
			} else {
				$body = urlencode($post);
			}
			$fdata .= 'Content-Length: ' . strlen($body) . "\r\n\r\n{$body}";
		} else {
			$fdata .= "\r\n";
		}
		if ($urlset['scheme'] == 'https') {
			$fp = fsockopen('ssl://' . $urlset['host'], $urlset['port'], $errno, $error);
		} else {
			$fp = fsockopen($urlset['host'], $urlset['port'], $errno, $error);
		}
		stream_set_blocking($fp, true);
		stream_set_timeout($fp, $timeout);
		if (!$fp) {
			$this->error = $error;
			return false;
		} else {
			fwrite($fp, $fdata);
			$content = '';
			while (!feof($fp)) {
				$content .= fgets($fp, 512);
			}

			fclose($fp);
			return $this->http_response_parse($content, true);
		}
	}

	private function http_response_parse($data, $chunked = false) {
		$rlt = array();
		$pos = strpos($data, "\r\n\r\n");
		$split1[0] = substr($data, 0, $pos);
		$split1[1] = substr($data, $pos + 4, strlen($data));

		$split2 = explode("\r\n", $split1[0], 2);
		preg_match('/^(\S+) (\S+) (\S+)$/', $split2[0], $matches);
		$rlt['code'] = $matches[2];
		$rlt['status'] = $matches[3];
		$rlt['responseline'] = $split2[0];
		$header = explode("\r\n", $split2[1]);
		$isgzip = false;
		$ischunk = false;
		foreach ($header as $v) {
			$row = explode(':', $v);
			$key = trim($row[0]);
			$value = trim($row[1]);
			if (is_array($rlt['headers'][$key])) {
				$rlt['headers'][$key][] = $value;
			} elseif (!empty($rlt['headers'][$key])) {
				$temp = $rlt['headers'][$key];
				unset($rlt['headers'][$key]);
				$rlt['headers'][$key][] = $temp;
				$rlt['headers'][$key][] = $value;
			} else {
				$rlt['headers'][$key] = $value;
			}
			if (!$isgzip && strtolower($key) == 'content-encoding' && strtolower($value) == 'gzip') {
				$isgzip = true;
			}
			if (!$ischunk && strtolower($key) == 'transfer-encoding' && strtolower($value) == 'chunked') {
				$ischunk = true;
			}
		}
		if ($chunked && $ischunk) {
			$rlt['content'] = $this->http_response_parse_unchunk($split1[1]);
		} else {
			$rlt['content'] = $split1[1];
		}
		if ($isgzip && function_exists('gzdecode')) {
			$rlt['content'] = gzdecode($rlt['content']);
		}

		$rlt['meta'] = $data;
		if ($rlt['code'] == '100') {
			return $this->http_response_parse($rlt['content']);
		}
		return $rlt;
	}

	private function http_response_parse_unchunk($str = null) {
		if (!is_string($str) or strlen($str) < 1) {
			return false;
		}
		$eol = "\r\n";
		$add = strlen($eol);
		$tmp = $str;
		$str = '';
		do {
			$tmp = ltrim($tmp);
			$pos = strpos($tmp, $eol);
			if ($pos === false) {
				return false;
			}
			$len = hexdec(substr($tmp, 0, $pos));
			if (!is_numeric($len) or $len < 0) {
				return false;
			}
			$str .= substr($tmp, ($pos + $add), $len);
			$tmp = substr($tmp, ($len + $pos + $add));
			$check = trim($tmp);
		} while (!empty($check));
		unset($tmp);
		return $str;
	}

}
