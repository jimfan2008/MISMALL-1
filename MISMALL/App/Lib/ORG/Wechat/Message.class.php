<?php
/**
 * 微信消息处理
 *
 * @author cjli
 *
 */
class Message extends WechatBase {
	/**
	 * 微信推送过来的数据或响应数据
	 * @var array
	 */
	private $data = array();

	public function __construct($appid, $secret) {
		$this->appid = $appid;
		$this->secret = $secret;
	}

	/**
	 * 获取微信推送的数据
	 *
	 * @param  string $token 微信开放平台设置的TOKEN
	 *
	 * @return array 转换为数组后的数据
	 */
	public function request($token = '') {
		if (IS_GET) {
			$this->auth($token) || exit;
			exit($_GET['echostr']);
		} else {
			$xml_post = file_get_contents("php://input");
			//记录Log
			if ($this->debug) {
				Log::write("\n微信推送信息:\n" . $xml_post . "\n", Log::DEBUG);
			}
			$xml = simplexml_load_string($xml_post, 'SimpleXMLElement', LIBXML_NOCDATA);
			$xml || exit;

			foreach ($xml as $key => $value) {
				$this->data[$key] = strval($value);
			}
		}
		//记录Log
		if ($this->debug) {
			Log::write("\n微信推送信息:\n" . var_export($this->data, TRUE) . "\n", Log::DEBUG);
		}

		if (isset($this->data['errcode'])) {
			$error = $this->getError($this->data['errcode']);
			Log::write("\n微信消息错误 : " . $error);
			exit($error);
		}

		return $this->data;
	}

	/**
	 * 响应微信发送的信息（自动回复）
	 *
	 * @param  string $to      接收用户名
	 * @param  string $from    发送者用户名
	 * @param  array  $content 回复信息，文本信息为string类型
	 * @param  string $type    消息类型
	 * @param  string $flag    是否新标刚接受到的信息
	 *
	 * @return string          XML字符串
	 */
	public function response($content, $type = 'text', $flag = 0) {
		//TODO 可以直接回复空串，微信服务器不会对此作任何处理，并且不会发起重试。
		if (empty($content)) {
			exit('<xml></<xml>');
		}
		// 基础数据
		$data = array(
			'ToUserName' => $this->data['FromUserName'],
			'FromUserName' => $this->data['ToUserName'],
			'CreateTime' => time(),
			'MsgType' => $type == 'mpnews' ? 'news' : $type,
		);

		// 添加类型数据
		switch ($type) {
			//图片消息
			case 'image':
				$data['Image']['MediaId'] = $content;
				break;
			//语音消息
			case 'voice':
				$data['Voice']['MediaId'] = $content;
				break;
			//视频消息
			case 'video':
				list(
					$video['MediaId'],
					$video['Title'],
					$video['Description']
				) = $content;
				$data['Video'] = $video;
				break;
			//音乐信息
			case 'music':
				list(
					$music['Title'],
					$music['Description'],
					$music['MusicUrl'],
					$music['HQMusicUrl'],
					$music['ThumbMediaId']
				) = $content;
				$data['Music'] = $music;
				break;
			//单图文信息
			case 'mpnews':
				$articles = array();
				list(
					$articles['Title'],
					$articles['Description'],
					$articles['PicUrl'],
					$articles['Url']
				) = $content;
				$data['ArticleCount'] = 1;
				$data['Articles'][] = $articles;
				break;
			//图文信息
			case 'news':
				$articles = array();
				foreach ($content as $key => $value) {
					list(
						$articles[$key]['Title'],
						$articles[$key]['Description'],
						$articles[$key]['PicUrl'],
						$articles[$key]['Url']
					) = $value;
					if ($key >= 9) {break;	}	//最多只允许10调新闻
				}
				$data['ArticleCount'] = count($articles);
				$data['Articles'] = $articles;
				break;
			//文本信息
			case 'text':
			default:
				$data['Content'] = $content;
		}

		// 转换数据为XML
		$content = str_replace('<?xml version="1.0"?>' . PHP_EOL, '', $this->data2xml($data));
		//记录Log
		if ($this->debug) {
			Log::write("\n推送回复信息:\n" . var_export($content, TRUE) . "\n", Log::DEBUG);
		}
		exit($content);
	}

	/**
	 * 发送客服消息
	 *
	 * @param string $content   内容
	 * @param string $openid   	发送者用户名
	 * @param string $type   	类型
	 *
	 * @return array 返回的信息
	 */
	public function sendMessage($content, $openid = '', $type = 'text') {
		// 基础数据
		$data['touser'] = $openid;
		$data['msgtype'] = $type == 'mpnews' ? 'news' : $type;

		// 添加类型数据
		switch ($type) {
			//图片消息
			case 'image':
				$data['image']['media_id'] = $content;
				break;
			//语音消息
			case 'voice':
				$data['voice']['media_id'] = $content;
				break;
			//视频消息
			case 'video':
				list(
					$video['media_id'],
					$video['title'],
					$video['description']
				) = $content;
				$data['video'] = $video;
				break;
			//音乐信息
			case 'music':
				list(
					$music['title'],
					$music['description'],
					$music['musicurl'],
					$music['hqmusicurl'],
					$music['thumb_media_id']
				) = $content;
				$data['music'] = $music;
				break;
			//单图文信息
			case 'mpnews':
				$articles = array();
				list(
					$articles['title'],
					$articles['description'],
					$articles['picurl'],
					$articles['url']
				) = $content;
				$data['news']['articles'][] = $articles;
				break;
			//多图文信息
			case 'news':
				$articles = array();
				foreach ($content as $key => $value) {
					list(
						$articles[$key]['title'],
						$articles[$key]['description'],
						$articles[$key]['picurl'],
						$articles[$key]['url']
					) = $value;
					if ($key >= 9) {break;	}	//最多只允许10调新闻
				}
				$data['news']['articles'] = $articles;
				break;
			//文本信息
			case 'text':
			default:
				$data['text']['content'] = $content;
		}

		//发送
		$sendjson = $this->jsencode($data);

		if ($this->debug) {
			Log::write('\n发送信息:' . var_export($sendjson, TRUE) . '\n', Log::DEBUG);
		}

		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}
		$url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={$access_token}";
		$return = $this->http($url, $sendjson, 'POST', array("Content-type: text/html; charset=utf-8"));
		return $return;
	}

	/**
	 * 对数据进行签名认证，确保是微信发送的数据
	 *
	 * @param  string $token 微信开放平台设置的TOKEN
	 *
	 * @return boolean       true-签名正确，false-签名错误
	 */
	private function auth($token) {
		$signature = $_GET["signature"];
		$timestamp = $_GET["timestamp"];
		$nonce = $_GET["nonce"];
		$tmpArr = array($token, $timestamp, $nonce);
		sort($tmpArr, SORT_STRING);
		$tmpStr = implode($tmpArr);
		$tmpStr = sha1($tmpStr);
		if ($tmpStr == $signature) {
			return true;
		} else {
			return false;
		}
	}

	/**************高级群发接口**********/

	/**
	 * 上传图文消息素材【订阅号与服务号认证后均可用】
	 *
	 * @param array $content 图文消息
	 *
	 * @return JSON
	 */
	public function massUploadnews($content) {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}

		if (empty($content) || !is_array($content)) {
			//POST的数据包为空
			$this->error = '44002';
			return false;
		}

		$url = "https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token={$access_token}";
		/*
		POST数据示例如下
		{
		"articles": [
		{
		"thumb_media_id":"qI6_Ze_6PtV7svjolgs-rN6stStuHIjs9_DidOHaj0Q-mwvBelOXCFZiq2OsIU-p",
		"author":"xxx",
		"title":"Happy Day",
		"content_source_url":"www.qq.com",
		"content":"content",
		"digest":"digest",
		"show_cover_pic":"1"
		},
		{
		"thumb_media_id":"qI6_Ze_6PtV7svjolgs-rN6stStuHIjs9_DidOHaj0Q-mwvBelOXCFZiq2OsIU-p",
		"author":"xxx",
		"title":"Happy Day",
		"content_source_url":"www.qq.com",
		"content":"content",
		"digest":"digest",
		"show_cover_pic":"0"
		}
		]
		}
		 */
		if ($this->debug) {
			Log::write("\n上传图文消息素材--start---\n", Log::DEBUG);
		}

		$articles = array();
		$is_send = true;
		require_once "Media.class.php";
		$mediaClass = new Media($this->appid, $this->secret);
		foreach ($content as $key => $art) {
			//必须上传图片
			if ($art['thumbPath']) {
				$media_id = $mediaClass->upload('image', $art['thumbPath']);
				if ($media_id === false) {
					continue;
				}
			} else {
				continue;
				//不合法的媒体文件类型
				//$this->error = '40004';
				//return false;
			}
			$articles[$key] = array(
				"thumb_media_id" => $media_id,
				"author" => $art['author'],
				"title" => $art['title'],
				"content_source_url" => $art['sourceUrl'],
				"content" => $art['content'],
				"digest" => $art['description'],
				"show_cover_pic" => isset($art['isShow']) && $art['isShow'] ? intval($art['isShow']) : 1,
			);
		}

		//图文消息内容为空
		if (empty($articles)) {
			$this->error = '44003';
			return false;
		}

		//发送
		$data = array(
			'articles' => $articles,
		);
		$sendjson = $this->jsencode($data);

		if ($this->debug) {
			Log::write("\n上传图文消息素材--JSON---\n" . var_export($data, true) . "\n", Log::DEBUG);
		}
		$return = $this->http($url, $sendjson, 'POST');

		if ($this->debug) {
			Log::write("\n上传图文消息素材--end---\n" . var_export($return, true) . "\n", Log::DEBUG);
		}
		/*
		返回数据示例（正确时的JSON返回结果）：
		{
		"type":"news",
		"media_id":"CsEf3ldqkAYJAU6EJeIkStVDSvffUJ54vqbThMgplD-VJXXof6ctX5fI6-aYyUiQ",
		"created_at":1391857799
		}
		 */
		return $return;
	}

	/**
	 * 根据分组进行群发【订阅号与服务号认证后均可用】
	 *
	 * @param string $msgtype 群发的消息类型	图文消息为mpnews，文本消息为text，语音为voice，音乐为music，图片为image，视频为video
	 * @param array|string $content 消息内容
	 * @param int $group_id 用户分组ID
	 * @param boolean $is_to_all	用于设定是否向全部用户发送，值为true或false，选择true该消息群发给所有用户，选择false可根据group_id发送给指定群组的用户
	 *
	 * @return [type] [description]
	 */
	public function massSendAll($msgtype, $content, $group_id = 0, $is_to_all = false) {
		if ($this->debug) {
			Log::write("分组进行群发--start---\nmsgtype:" . $msgtype . "\ncontent:" . var_export($content, true) . '\n', Log::DEBUG);
		}
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}

		if (empty($content)) {
			//POST的数据包为空
			$this->error = '44002';
			return false;
		}

		$data = array();
		//群发的消息类型
		switch ($msgtype) {
			//文本
			case 'text':
				$data['text']['content'] = $content;
				break;
			//图文消息
			case 'mpnews':
			//语音
			case 'voice':
			//图片
			case 'image':
				$data[$msgtype]['media_id'] = $content;
				break;
			//视频
			case 'mpvideo':
				$video = array();
				list(
					$video['media_id'],
					$video['title'],
					$video['description']
				) = $content;
				//请注意，此处视频的media_id需通过POST请求到下述接口特别地得到
				$videoUrl = "https://file.api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token={$access_token}";
				$videoResult = $this->http($url, $this->jsencode($video), 'POST');
				if ($videoResult) {
					$data['mpvideo']['media_id'] = $videoResult['media_id'];
				}
				break;
		}
		$data['filter']['is_to_all'] = $is_to_all;
		$data['filter']['group_id'] = $group_id;
		$data['msgtype'] = $msgtype;
		/*
		POST数据
		{
		"filter":{
		"is_to_all":false
		"group_id":"2"
		},
		"mpnews":{
		"media_id":"W9gjHATsg16Oxjxxh8u739OC8gmXO0hX0um1udjw08WBOth8etmrS3auxOzhg0uh",
		},
		"msgtype":"mpnews"
		}
		 */
		$sendjson = $this->jsencode($data);

		if ($this->debug) {
			Log::write("\n分组进行群发--JSON---\n" . var_export($data, true) . '\n', Log::DEBUG);
		}

		$url = "https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token={$access_token}";
		$return = $this->http($url, $sendjson, 'POST');
		if ($this->debug) {
			Log::write("\n分组进行群发--返回结果---\n" . var_export($return, true) . '\n', Log::DEBUG);
		}
		if ($return && $return['errcode'] == 0) {
			return true;
		}
		/*
		返回数据示例（正确时的JSON返回结果）：
		{
		"errcode":0,
		"errmsg":"send job submission success",
		"msg_id":34182
		}
		 */
		return false;
	}

	/**
	 * 根据OpenID列表群发【订阅号不可用，服务号认证后可用】
	 *
	 * @param  array $touser   	填写图文消息的接收者，一串OpenID列表，OpenID最少个，最多10000个
	 * @param string $msgtype 群发的消息类型	图文消息为mpnews，文本消息为text，语音为voice，音乐为music，图片为image，视频为video
	 * @param array|string $content 消息内容
	 *
	 * @return boolean
	 */
	public function massSend($touser, $msgtype, $content) {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}

		if (empty($content)) {
			//POST的数据包为空
			$this->error = '44002';
			return false;
		}
		$url = "https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token={$access_token}";

		$data = array();
		//群发的消息类型
		switch ($msgtype) {
			//文本
			case 'text':
				$data['text']['content'] = $content;
				break;
			//图文消息
			case 'mpnews':
			//语音
			case 'voice':
			//图片
			case 'image':
				$data[$msgtype]['media_id'] = $content;
				break;
			//视频
			case 'voice':
				$video = array();
				list(
					$video['media_id'],
					$video['title'],
					$video['description']
				) = $content;
				//请注意，此处视频的media_id需通过POST请求到下述接口特别地得到
				$videoUrl = "https://file.api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token={$access_token}";
				$videoResult = $this->http($url, $this->jsencode($video), 'POST');
				if ($videoResult) {
					$data[$msgtype]['media_id'] = $videoResult['media_id'];
				}
				break;
		}

		$data['touser'] = $touser;
		if (is_array($touser)) {
			$openids = '';
			foreach ($touser as $user) {
				$openids .= "'" . $user . "'";
			}
			$data['touser'] = $openids;
		}
		$data['msgtype'] = $msgtype;

		$sendjson = $this->jsencode($data);

		if ($this->debug) {
			Log::write("\nOpenID列表群发--JSON---\n" . $sendjson . '\n', Log::DEBUG);
		}

		$return = $this->http($url, $sendjson, 'POST');
		if ($return && $return['errcode'] == 0) {
			return true;
		}
		/*
		返回数据示例（正确时的JSON返回结果）：
		{
		"errcode":0,
		"errmsg":"send job submission success",
		"msg_id":34182
		}
		 */
		return false;
	}
}