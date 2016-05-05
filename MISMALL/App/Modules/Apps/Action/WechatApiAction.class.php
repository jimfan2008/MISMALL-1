<?php
/**
 * 微信消息推送入口Api
 *
 * @author cjli
 *
 */
class WechatApiAction extends BaseAction {
	/**
	 * 帐号信息
	 *
	 * @var array
	 */
	protected $wechat;

	/**
	 * 账号ID
	 *
	 * @var int
	 */
	protected $weId;

	protected $postxml;

	private $token;
	private $encodingAesKey;
	private $appid; //也就是企业号的CorpID

	/**
	 * 初始化帐户信息
	 */
	protected function _initialize() {
		parent::_initialize();

		$hash = I('get.hash', '', 'stripslashes');

		if (!$hash) {
			die('信息请求错误');
		}

		$weiInfo = D('Wechat')->getInfoByHash($hash);
		if (!$weiInfo) {
			die('公众号不存在');
		}
		$this->wechat = $weiInfo;
		$this->weId = $weiInfo['id'];
	}

	/**
	 * 企业号接收消息
	 */
	public function qyRequest() {
		$ret = $this->valid();
		if (!$ret) {
			var_dump($ret);
			exit;
		}

		$this->resolveMessage($this->weId, $this->postxml);
	}

	/**
	 * 解析企业号推送消息
	 * @param  string $xml XML string
	 * @return string
	 */
	private function resolveMessage($weId, $xmlData) {
		/*$xmlData = "<xml>
		<ToUserName><![CDATA[wxd0a57529180b761f]]></ToUserName>
		<FromUserName><![CDATA[10031]]></FromUserName>
		<CreateTime>1417054358</CreateTime>
		<MsgType><![CDATA[text]]></MsgType>
		<Content><![CDATA[/::)]]></Content>
		<MsgId>4565553714571509787</MsgId>
		<AgentID>3</AgentID>
		</xml>";*/
		$xml = simplexml_load_string($xmlData, 'SimpleXMLElement', LIBXML_NOCDATA);
		$xml = objectToArray($xml);

		$userId = $xml['FromUserName'];
		$corpId = $xml['ToUserName'];
		$CreateTime = $xml['CreateTime'];
		$msgType = $xml['MsgType'];
		$agentId = $xml['AgentID'];
		//TODO
		$agentId = 0;

		$data = array();

		//消息类型
		switch ($msgType) {
			case 'text':	//text消息
				$data = array(
					'Content' => $xml['Content'], 	//文本消息内容
					'MsgId' => $xml['MsgId'], 	//消息id，64位整型
				);
				break;
			case 'image':	//image消息
				$data = array(
					'PicUrl' => $xml['PicUrl'], 	//图片链接
					'MediaId' => $xml['MediaId'], 	//图片媒体文件id
					'MsgId' => $xml['MsgId'], 	//消息id，64位整型
				);
				break;
			case 'voice':	//voice消息
				$data = array(
					'Format' => $xml['Format'], 	//语音格式，如amr，speex等
					'MediaId' => $xml['MediaId'], 	//语音媒体文件id
					'MsgId' => $xml['MsgId'], 	//消息id，64位整型
				);
				break;
			case 'video':	//video消息
				$data = array(
					'ThumbMediaId' => $xml['ThumbMediaId'], 	//视频消息缩略图的媒体id
					'MediaId' => $xml['MediaId'], 	//视频媒体文件id
					'MsgId' => $xml['MsgId'], 	//消息id，64位整型
				);
				break;
			case 'location':	//location消息
				$data = array(
					'Location_X' => $xml['Location_X'], 	//X坐标信息
					'Location_Y' => $xml['Location_Y'], 	//Y坐标信息
					'Scale' => $xml['Scale'], 	//精度，可理解为精度或者比例尺、越精细的话 scale越高
					'Label' => $xml['Label'], 	//地理位置的字符串信息
					'MsgId' => $xml['MsgId'], 	//消息id，64位整型
				);
				break;
			case 'event':	// 类型是事件的
				// 事件类型
				switch ($xml['Event']) {
				case 'subscribe':		// 订阅

						break;
				case 'unsubscribe':		//取消订阅

						break;
				case 'LOCATION':		//获取用户地理位置
						$data = array(
							'Latitude' => $xml['Latitude'], 		//地理位置纬度
							'Longitude' => $xml['Longitude'], 		//地理位置经度
							'Precision' => $xml['Precision'], 		//地理位置精度
						);
						break;
				case 'CLICK':// 点击上报菜单事件
				case 'VIEW':		//点击菜单跳转链接的事件推送
						$data = array(
							'EventKey' => $xml['EventKey'], 		//事件KEY值，设置的跳转URL
						);
						break;
				case 'scancode_push'://扫码推事件的事件推送
				case 'scancode_waitmsg':		//扫码推事件且弹出“消息接收中”提示框的事件推送
						$data = array(
							'EventKey' => $xml['EventKey'], 		//事件KEY值，由开发者在创建菜单时设定
							'ScanCodeInfo' => $xml['ScanCodeInfo'], 		//扫描信息
							'ScanType' => $xml['ScanCodeInfo']['ScanType'], 		//扫描类型，一般是qrcode
							'ScanResult' => $xml['ScanCodeInfo']['ScanResult'], 		//扫描结果，即二维码对应的字符串信息
						);
						break;
				case 'pic_sysphoto'://弹出系统拍照发图的事件推送
				case 'pic_photo_or_album'://弹出拍照或者相册发图的事件推送
				case 'pic_weixin':		//弹出微信相册发图器的事件推送
						$data = array(
							'EventKey' => $xml['EventKey'], 		//事件KEY值，由开发者在创建菜单时设定
							'SendPicsInfo' => $xml['SendPicsInfo'], 		//发送的图片信息
							//'Count' => $xml['SendPicsInfo']['Count'],		//发送的图片数量
							//'PicList' => $xml['SendPicsInfo']['PicList'], 	//图片列表
							//'PicMd5Sum' => $xml['SendPicsInfo']['PicList']['item']['PicMd5Sum']	//图片的MD5值，开发者若需要，可用于验证接收到图片
						);
						break;
				case 'location_select':		//弹出地理位置选择器的事件推送
						$data = array(
							'EventKey' => $xml['EventKey'], 		//事件KEY值，由开发者在创建菜单时设定
							'SendLocationInfo' => $xml['SendLocationInfo'], 		//发送的位置信息
							//'Location_X' => $xml['SendLocationInfo']['Location_X'],		//X坐标信息
							//'Location_Y' => $xml['SendLocationInfo']['Location_Y'], 		//Y坐标信息
							//'Scale' => $xml['SendLocationInfo']['Scale'],	//精度，可理解为精度或者比例尺、越精细的话 scale越高
							//'Label' => $xml['SendLocationInfo']['Label'],	//地理位置的字符串信息
							//'Poiname' => $xml['SendLocationInfo']['Poiname'] 	//朋友圈POI的名字，可能为空
						);
						break;
				default:
						break;
				}
				$data['Event'] = $xml['Event']; 	//事件类型
				$data['CreateTime'] = $CreateTime;

				//TODO event事件处理
				return false;
				break;
			default:
				$data = array();
				break;
		}

		$data['CreateTime'] = $CreateTime;
		//TODO insert database
		D('WechatQy')->addLocationMessage($weId, $agentId, $userId, $msgType, $data);
	}

	/**
	 * For weixin server validation
	 */
	private function checkSignature($str) {
		$signature = isset($_GET["msg_signature"]) ? $_GET["msg_signature"] : '';
		$timestamp = isset($_GET["timestamp"]) ? $_GET["timestamp"] : '';
		$nonce = isset($_GET["nonce"]) ? $_GET["nonce"] : '';
		$tmpArr = array($str, $this->wechat['token'], $timestamp, $nonce); //比普通公众平台多了一个加密的密文
		sort($tmpArr, SORT_STRING);
		$tmpStr = implode($tmpArr);
		$shaStr = sha1($tmpStr);
		if ($shaStr == $signature) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 微信验证，包括post来的xml解密
	 * @param bool $return 是否返回
	 */
	private function valid($return = false) {
		vendor('WXBizMsgCrypt', LIB_PATH . '/ORG/Wechat/qy/');

		$encryptStr = "";
		if ($_SERVER['REQUEST_METHOD'] == "POST") {
			$postStr = file_get_contents("php://input");
			$array = (array) simplexml_load_string($postStr, 'SimpleXMLElement', LIBXML_NOCDATA);

			if (isset($array['Encrypt'])) {
				$encryptStr = $array['Encrypt'];
			}
		} else {
			$encryptStr = isset($_GET["echostr"]) ? $_GET["echostr"] : '';
		}
		if ($encryptStr) {
			$ret = $this->checkSignature($encryptStr);
		}
		if (!isset($ret) || !$ret) {
			if (!$return) {
				die('no access');
			} else {
				return false;
			}
		}
		$pc = new Prpcrypt($this->wechat['encodingAESKey']);
		$array = $pc->decrypt($encryptStr, $this->wechat['app_id']);
		if (!isset($array[0]) || ($array[0] != 0)) {
			if (!$return) {
				die('解密失败！');
			} else {
				return false;
			}
		}
		if ($_SERVER['REQUEST_METHOD'] == "POST") {
			$this->postxml = $array[1];
			return ($this->postxml != "");
		} else {
			$echoStr = $array[1];
			if ($return) {
				return $echoStr;
			} else {
				die($echoStr);
			}
		}
		return false;
	}

	/**
	 * 公众号接收消息
	 * 接收微信推送过来的信息
	 */
	public function mpRequest() {
		importORG('Wechat.WechatBase');
		importORG('Wechat.Message');
		$wechatMessage = new Message($this->wechat['app_id'], $this->wechat['app_secret']);

		//分析微信推送的信息
		$data = $wechatMessage->request($this->wechat['token']);
		/*$data = array(
		'ToUserName' => 'gh_8847b990be6c',
		'FromUserName' => 'o9RSsji91TMiS3Ot5IKdITigQSqM',
		'CreateTime' => '1423728921',
		'MsgType' => 'event',
		'Event' => 'subscribe',
		'EventKey' => '',
		);*/

		//推送消息入库
		if ($data['MsgType'] != 'event') {
			//TODO
			D('WechatMp')->addMessage($this->weId, $data);
		}

		// 消息类型
		if (!empty($data['errcode'])) {
			$content = $wechatMessage->getError($data['errcode']);
			$type = 'text';
		} else {
			list($content, $type) = $this->mpReply($data);
		}

		$wechatMessage->response($content, $type);
	}

	/**
	 * 消息处理
	 *
	 * @param array $data 消息
	 *
	 * @return array
	 */
	private function mpReply($data) {
		$mp_model = D('WechatMp');

		// 消息类型
		switch ($data['MsgType']) {
			case 'text':	// 类型是文本的
				switch ($data['Content']) {
				case '绑定升级':		//
						$reply = array('升级成功', 'text');
						D('Wechat')->editAccount($this->weId, array('isBind' => 1));
						break;
				default:
						//TODO 关键字处理
						$info = $mp_model->getRuleByKeyword($this->weId, $data['Content']);
						if (!$info) {
							return array();
							//$reply = array('没有相关信息，换个试试', 'text');
						} else {
							$keywordMsg = $mp_model->getMessageSettingInfo($this->weId, $info['agentId'], $info['id']);
							return $this->splitReplyContnet($info['msgType'], $info['data']);
						}
						break;
				}
				break;
			case 'event':	// 类型是事件的
				// 事件类型
				switch ($data['Event']) {
				case 'subscribe':		// 首次关注回复
						//EventKey 	事件KEY值，qrscene_为前缀，后面为二维码的参数值
						$scene_id = 0;
						$secne_str = '';
						if ($data['EventKey']) {
							//运营二维码
							$scene_id = substr($data['EventKey'], 8);
						}
						//字符串用于虚拟号中再生成二维码
						if (!is_numeric($scene_id)) {
							$secne = explode('_', $scene_id);
							$scene_id = $secne[0];
							$secne_str = $secne[1];
						}
						//获取用户信息
						$mp_model->getMemberInfoByOpenId($this->weId, $scene_id, $data['FromUserName']);
						//回复
						//虚拟公众号
						$supper_wechat_id = C('SUPPER_WECHAT_ID');
						//
						if ($secne_str) {

						} elseif ($this->weId == $supper_wechat_id && $scene_id) {
							$info = D('Wechat')->getVirtualPushMessage($this->weId, $scene_id);
						} else {
							$info = $mp_model->getMessageSettingInfo($this->weId, $scene_id, 'subscribe');
						}

						Log::write("首次关注回复subscribe\n" . var_export($info, TRUE) . "\n", Log::DEBUG);
						if (!$info) {
							//$reply = array('你好!欢迎关注' . $this->wechat['name'], 'text');
							return array();
						} else {
							return $this->splitReplyContnet($info['msgType'], $info['data']);
						}
						break;
				case 'unsubscribe':		//取消订阅
						//EventKey 	事件KEY值，qrscene_为前缀，后面为二维码的参数值
						$scene_id = 0;
						if ($data['EventKey']) {
							//运营二维码
							$scene_id = substr($data['EventKey'], 8);
						}
						$mp_model->unsubscribe($this->weId, $scene_id, $data['FromUserName']);
						break;
				case 'SCAN':		//用户已关注时的事件推送
						//$data['EventKey'] //事件KEY值，是一个32位无符号整数，即创建二维码时的二维码scene_id
						$scene_id = $data['EventKey'] ? $data['EventKey'] : 0;

						//字符串用于虚拟号中再生成二维码
						if (!is_numeric($scene_id)) {
							$secne = explode('_', $scene_id);
							$scene_id = $secne[0];
							$secne_str = $secne[1];
						}

						//获取用户信息
						$mp_model->getMemberInfoByOpenId($this->weId, $scene_id, $data['FromUserName']);
						//回复
						//虚拟公众号
						$supper_wechat_id = C('SUPPER_WECHAT_ID');
						if ($secne_str) {

						} elseif ($this->weId == $supper_wechat_id && $scene_id) {
							$info = D('Wechat')->getVirtualPushMessage($this->weId, $scene_id);
						} else {
							$info = $mp_model->getMessageSettingInfo($this->weId, $scene_id, 'subscribe');
						}

						Log::write("用户已关注时的事件推送\n" . var_export($info, TRUE) . "\n", Log::DEBUG);
						if (!$info) {
							//$reply = array('你好!欢迎关注' . $this->wechat['name'], 'text');
							return array();
						} else {
							return $this->splitReplyContnet($info['msgType'], $info['data']);
						}
						break;
				case 'CLICK':		// 点击的事件
						$reply = array($data['EventKey'] . $data['FromUserName'], 'text');
						break;
				case 'LOCATION':		//获取用户地理位置
						$arr = array(
							'Latitude' => $data['Latitude'], 		//地理位置纬度
							'Longitude' => $data['Longitude'], 		//地理位置经度
							'Precision' => $data['Precision'], 		//地理位置精度
						);
						session('wechat_location', $arr);
						break;
				case 'VIEW':

				default:
						//$reply = array ('没有相关事件',	'text' );
						break;
				}
				break;
			default:	//自动回复
				return array();
				/*$info = $rule_model->getRuleInfo($this->weId, 'autoReply');
			if($info){
			$list = $rule_model->getMessageSettingList($info['id'], $info['msgType'], true);
			$reply = array($list, $info['msgType']);
			}*/
				break;
		}

		return $reply;
	}

	/**
	 * 分拆回复内容
	 * @param string $msgType
	 * @param  array $data
	 * @return array
	 */
	private function splitReplyContnet($msgType, $data) {
		$send_content = array();
		switch ($msgType) {
			//单图文
			case 'mpnews':
				$send_content = array(
					$data['mpnews_title'],
					$data['mpnews_content'],
					$data['cover_mpnews_path'],
					$data['mpnews_url'],
				);
				break;
			//多图文
			case 'news':

				foreach ($data as $key => $value) {
					$send_content[] = array(
						$value['title'],
						$value['description'],
						$value['url'],
						U($value['cover_news_path'], false, false, false, true),
					);
				}
				break;
			//文字类型
			case 'text':
			default:
				$send_content = $data;
		}
		return array($send_content, $msgType);
	}

}