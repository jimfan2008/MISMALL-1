<?php
/**
 * 微信支付接口
 * @author jerlisen <developerlcj@gmail.com>
 * @time 2015.01.07
 */

class Wxpay extends PayBase {

	protected $gateway = "https://api.mch.weixin.qq.com/pay/unifiedorder";
	protected $config = array(
		'app_id' => '', //微信公众号AppID(应用ID)
		'app_secret' => '', //AppSecret(应用密钥)
		'mch_id' => '', //受理商ID，身份标识
		'key' => '', //商户支付密钥Key,
		'type' => 'JSAPI', //JSAPI 支付——H5 网页端调起支付接口,
		//NATIVE (Native（原生）支付模式)
	);

	/**
	 *  配置检查
	 * @return boolean
	 */
	public function check() {
		if (!$this->config['app_id'] || !$this->config['app_secret'] || !$this->config['mch_id'] || !$this->config['key']) {
			die("微信支付设置有误！");
		}
		return true;
	}

	/**
	 * 生成表单参数
	 *
	 * @param  PayVo  $vo
	 *
	 * @return html form
	 */
	public function buildRequestForm(PayVo $vo) {
		$otherParam = $vo->getParam();
		$parameter = array(
			'trade_type' => $this->config['type'], //交易类型
			'appid' => $this->config['app_id'],
			'mch_id' => $this->config['mch_id'],
			'time_stamp' => time(), // 13位时间戳
			'nonce_str' => $this->createNoncestr(), // 随机字符串
			'body' => $vo->getBody(), // 商品描述
			'out_trade_no' => $vo->getOrderNo(), // 本站订单号
			'notify_url' => $this->config['notify_url'], // 微信支付成功服务器通知，可自定义
			'spbill_create_ip' => $_SERVER['REMOTE_ADDR'], //终端ip
			'total_fee' => intval($vo->getFee() * 100), // 支付金额 单位：分
		);

		//非必填参数，商户可根据实际情况选填
		//子商户号
		if (isset($otherParam['sub_mch_id']) && $otherParam['sub_mch_id']) {
			$parameter['sub_mch_id'] = $otherParam['sub_mch_id'];
		}
		//设备号
		if (isset($otherParam['device_info']) && $otherParam['device_info']) {
			$parameter['device_info'] = $otherParam['device_info'];
		}
		//附加数据
		if (isset($otherParam['attach']) && $otherParam['attach']) {
			$parameter['attach'] = $otherParam['attach'];
		}
		//交易起始时间
		if (isset($otherParam['time_start']) && $otherParam['time_start']) {
			$parameter['time_start'] = $otherParam['time_start'];
		}
		//交易结束时间
		if (isset($otherParam['time_expire']) && $otherParam['time_expire']) {
			$parameter['time_expire'] = $otherParam['time_expire'];
		}
		//【商品标识】字段对应被扫支付接口中的参数 goods_tag,该值配置为空时,提交支付接口丌需要传 goods_tag 字段;多个批次使用相同的商品标识,则扣款时会使用有效的批次企业红包(使用企业红包金额小亍订单金额)
		if (isset($otherParam['goods_tag']) && $otherParam['goods_tag']) {
			$parameter['goods_tag'] = $otherParam['goods_tag'];
		}
		//用户标识
		if (isset($otherParam['openid']) && $otherParam['openid']) {
			$parameter['openid'] = $otherParam['openid'];
		}
		//商品ID
		if (isset($otherParam['product_id']) && $otherParam['product_id']) {
			$parameter['product_id'] = $otherParam['product_id'];
		}
		if (APP_DEBUG) {
			Log::write("微信支付表单信息\n" . var_export($parameter, TRUE) . "\n", Log::DEBUG);
		}

		//JSAPI 支付 获取支付用户openid
		if ($this->config['type'] == 'JSAPI') {
			$openid = session('wechat_openid');
			/*if (!(isset($parameter['openid']) || $parameter['openid'])) {
			//通过code获得openid
			if (!isset($_GET['code'])) {
			$js_api_url = (is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . __SELF__ . "&paytype=wxpay&out_trade_no={$vo->getOrderNo()}";
			//触发微信返回code码
			$url = $this->createOauthUrlForCode($js_api_url);
			if (APP_DEBUG) {
			Log::write("微信支付JSAPI url\n" . $url . "\n", Log::DEBUG);
			}
			Header("Location: $url");
			} else {
			//获取code码，以获取openid
			$code = $_GET['code'];
			$openid = $this->getOpenId($code);
			if (APP_DEBUG) {
			Log::write("微信支付JSAPI openid\n" . $openid . "\n", Log::DEBUG);
			}
			}
			$parameter["openid"] = $openid;
			}*/
			$parameter["openid"] = $openid;
		}
		//签名
		$parameter["sign"] = $this->getSign($parameter);
		if (APP_DEBUG) {
			Log::write("微信支付签名\n" . var_export($parameter, TRUE) . "\n", Log::DEBUG);
		}
		//生成xml
		$xml = $this->arrayToXml($parameter);
		if (APP_DEBUG) {
			Log::write("微信支付生成xml\n" . var_export($xml, TRUE) . "\n", Log::DEBUG);
		}

		//post请求xml, 请求微信支付
		$response = $this->postXmlCurl($xml, $this->gateway, 30);

		if (APP_DEBUG) {
			Log::write("微信支付请求返回\n" . var_export($response, TRUE) . "\n", Log::DEBUG);
		}
		if ($response === NULL) {
			return '请求微信支付错误';
		}
		$result = $this->xmlToArray($response);

		//返回参数处理流程
		if ($result["return_code"] == "FAIL") {
			return "通信出错：" . $result['return_msg'] . "<br>";
		} elseif ($result["result_code"] == "FAIL") {
			return "错误代码：" . $result['err_code'] . "<br>错误代码描述：" . $result['err_code_des'] . "<br>";
		}

		switch ($this->config['type']) {
			case 'JSAPI':
				//预支付 ID
				$prepay_id = $result["prepay_id"];
				return $this->_buildJsapiForm($prepay_id, $parameter, $otherParam);
				break;
			case 'NATIVE':
				if ($result["code_url"] != NULL) {
					//从统一支付接口获取到code_url
					$code_url = $result["code_url"];
					//商户自行增加处理流程
					return $this->_buildNativeForm($code_url, $parameter['out_trade_no'], $vo->getBody());
				}
				return '请求微信支付错误';
				break;
			default:
				return '请求微信支付错误';
				break;
		}

	}

	//生成JSAPI支付页
	private function _buildJsapiForm($prepay_id, $params, $otherParam) {
		$wxJsApiConfig = $otherParam['wxJsApiConfig'];
		//设置jsapi的参数
		$jsApiObj = array(
			'appId' => $this->config['app_id'],
			'timeStamp' => $wxJsApiConfig['timestamp'],
			'nonceStr' => $wxJsApiConfig['nonceStr'],
			'package' => "prepay_id=$prepay_id",
			'signType' => 'MD5',
		);
		/*$jsApiObj = array(
		'appId' => $this->config['app_id'],
		'timeStamp' => time(),
		'nonceStr' => $this->createNoncestr(),
		'package' => "prepay_id=$prepay_id",
		'signType' => 'MD5',
		);*/
		$jsApiObj['paySign'] = $this->getSign($jsApiObj);
		//$paramester = json_encode($jsApiObj);
		$form = <<<EOF
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
	<title>微信安全支付</title>
	<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
	<style type="text/css">.des{text-align: left;}.des p{border-bottom: 1px solid #efefef;  padding-bottom: 4px;}</style>
</head>
<body>
</br></br>
<div class="des">
	<p>商品名称：{$params['body']}</p>
		<p>商品价格：￥{$otherParam['totalPrice']} 元</p>
		<p>订单号：{$params['out_trade_no']}</p>
	</div>

<script type="text/javascript">
wx.config({
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，
    appId: '{$wxJsApiConfig['appId']}', // 必填，公众号的唯一标识
    timestamp: '{$wxJsApiConfig['timestamp']}', // 必填，生成签名的时间戳
    nonceStr: '{$wxJsApiConfig['nonceStr']}', // 必填，生成签名的随机串
    signature: '{$wxJsApiConfig['signature']}',// 必填，签名，见附录1
    jsApiList: ["chooseWXPay"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
});
wx.ready(function(){

	wx.error(function(res){
		alert(res);
	});
	wx.checkJsApi({
	    jsApiList: ['chooseWXPay'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
	    success: function(res) {
	        // 以键值对的形式返回，可用的api值true，不可用为false
	        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
	       }
	    });
	wx.chooseWXPay({
	    timestamp: '{$jsApiObj['timeStamp']}', // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
	    nonceStr: '{$jsApiObj['nonceStr']}', // 支付签名随机串，不长于 32 位
	    package: '{$jsApiObj['package']}', // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
	    signType: '{$jsApiObj['signType']}', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
	    paySign: '{$jsApiObj['paySign']}', // 支付签名
	    success: function (res) {
	    	if("{$wxJsApiConfig['return_url']}" != ""){
	    		window.location.href="{$wxJsApiConfig['return_url']}";
	    	}
	    	//alert(JSON.stringify(res));
	        // 支付成功后的回调函数
	    }
	});
});

</script>
</body>
</html>
EOF;
		if (APP_DEBUG) {
			Log::write("微信支付JSAPI支付页\n" . $form . "\n", Log::DEBUG);
		}
		return $form;
	}

	//生成NATIVE支付页
	private function _buildNativeForm($code_url, $out_trade_no, $body = "") {
		$form = <<<EOF
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="UTF-8">
	<title>微信安全支付</title>
</head>
<body>
	<div align="center">
		<p>{$body}</p>
	</div>
	<div align="center" id="qrcode"></div>
	<div align="center">
		<p>订单号：{$out_trade_no}</p>
	</div>
	<div align="center">
		<a href="/">返回首页</a>
	</div>
</body>
	<script src="/public/Js/jquery-1.9.1.min.js"></script>
	<script src="/public/Js/jquery-qrcode/jquery.qrcode.min.js"></script>
	<script>
		$('#qrcode').qrcode({width: 164,height: 164,text: "{$code_url}"});
	</script>
</html>
EOF;
		if (APP_DEBUG) {
			//Log::write("微信支付NATIVE支付页\n" . $form . "\n", Log::DEBUG);
		}
		return $form;
	}

	/**
	 * 针对notify_url验证消息是否是微信支付发出的合法消息
	 * 验证签名，并回应微信。
	 * 对后台通知交互时，如果微信收到商户的应答不是成功或超时，微信认为通知失败，
	 * 微信会通过一定的策略（如30分钟共8次）定期重新发起通知，
	 * 尽可能提高通知的成功率，但微信不保证通知最终能成功。
	 *
	 * @param array $notify 消息结果
	 *
	 * @return 验证结果
	 */
	public function verifyNotify($notify) {

		//存储微信的回调
		$xml = $GLOBALS['HTTP_RAW_POST_DATA'];
		$xmlArr = $this->xmlToArray($xml);
		if (APP_DEBUG) {
			Log::write("\n微信verifyNotify\n" . var_export($xmlArr, TRUE) . "\n", Log::DEBUG);
		}

		//回应微信
		echo $xmlArr;

		$sign_data = $xmlArr['sign'];
		unset($xmlArr['sign']);
		$sign = $this->getSign($xmlArr); //本地签名
		if (APP_DEBUG) {
			Log::write("\n微信verifyNotify sign\n" . var_export($sign, TRUE) . "\n", Log::DEBUG);
		}
		if ($sign_data == $sign) {
			$notify = array(
				'trade_state' => 'SUCCESS',
				'total_fee' => $xmlArr['total_fee'],
				'out_trade_no' => $xmlArr['out_trade_no'],
			);

			$this->setInfo($notify);
			return TRUE;
		}
		return FALSE;
	}
	/**
	 * 设置订单信息
	 *
	 * @param array $notify 消息结果
	 *
	 * @return mixed
	 */
	protected function setInfo($notify) {
		$info = array();
		//支付状态
		$info['status'] = ($notify['trade_state'] == 'SUCCESS') ? true : false;
		$info['money'] = $notify['total_fee'] / 100;
		$info['out_trade_no'] = $notify['out_trade_no'];
		$this->info = $info;
	}

	/*************************wechat function**********************************/
	/**
	 * 作用：产生随机字符串，不长于32位
	 */
	public function createNoncestr($length = 32) {
		$chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		$str = "";
		for ($i = 0; $i < $length; $i++) {
			$str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
		}
		return $str;
	}

	/**
	 * 作用：格式化参数，签名过程需要使用
	 */
	function formatBizQueryParaMap($paraMap, $urlencode) {
		$buff = "";
		ksort($paraMap);
		foreach ($paraMap as $k => $v) {
			if ($urlencode) {
				$v = urlencode($v);
			}
			//$buff .= strtolower($k) . "=" . $v . "&";
			$buff .= $k . "=" . $v . "&";
		}
		$reqPar;
		if (strlen($buff) > 0) {
			$reqPar = substr($buff, 0, strlen($buff) - 1);
		}
		return $reqPar;
	}

	/**
	 * 作用：生成签名
	 */
	public function getSign($Obj) {
		foreach ($Obj as $k => $v) {
			$Parameters[$k] = $v;
		}
		//签名步骤一：按字典序排序参数
		ksort($Parameters);
		$String = $this->formatBizQueryParaMap($Parameters, false);
		//echo '【string1】'.$String.'</br>';
		//签名步骤二：在string后加入KEY
		$String = $String . "&key=" . $this->config['key'];
		//echo "【string2】".$String."</br>";
		//签名步骤三：MD5加密
		$String = md5($String);
		//echo "【string3】 ".$String."</br>";
		//签名步骤四：所有字符转为大写
		$result_ = strtoupper($String);
		//echo "【result】 ".$result_."</br>";
		return $result_;
	}

	/**
	 * 	作用：array转xml
	 */
	public function arrayToXml($arr) {
		$xml = "<xml>";
		foreach ($arr as $key => $val) {
			if (is_numeric($val)) {
				$xml .= "<" . $key . ">" . $val . "</" . $key . ">";
			} else {
				$xml .= "<" . $key . "><![CDATA[" . $val . "]]></" . $key . ">";
			}

		}
		$xml .= "</xml>";
		return $xml;
	}

	/**
	 * 作用：将xml转为array
	 */
	public function xmlToArray($xml) {
		//将XML转为array
		$array_data = json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);
		return $array_data;
	}

	/**
	 * 	作用：以post方式提交xml到对应的接口url
	 */
	public function postXmlCurl($xml, $url, $second = 30) {
		//初始化curl
		$ch = curl_init();
		//设置超时
		curl_setopt($ch, CURLOP_TIMEOUT, $second);
		//这里设置代理，如果有的话
		//curl_setopt($ch,CURLOPT_PROXY, '8.8.8.8');
		//curl_setopt($ch,CURLOPT_PROXYPORT, 8080);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		//设置header
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		//要求结果为字符串且输出到屏幕上
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		//post提交方式
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
		//运行curl
		$data = curl_exec($ch);
		curl_close($ch);

		if (APP_DEBUG) {
			Log::write("post方式提交返回结果\n" . var_export($data, TRUE) . "\n", Log::DEBUG);
		}
		//返回结果
		if ($data) {
			curl_close($ch);
			return $data;
		} else {
			$error = curl_errno($ch);
			echo "curl出错，错误码:$error" . "<br>";
			echo "<a href='http://curl.haxx.se/libcurl/c/libcurl-errors.html'>错误原因查询</a></br>";
			curl_close($ch);
			return false;
		}
	}

	/**
	 * 作用：生成可以获得code的url
	 */
	function createOauthUrlForCode($redirectUrl) {
		$urlObj["appid"] = $this->config['app_id'];
		$urlObj["redirect_uri"] = "$redirectUrl";
		$urlObj["response_type"] = "code";
		$urlObj["scope"] = "snsapi_base";
		$urlObj["state"] = "1" . "#wechat_redirect";
		$bizString = $this->formatBizQueryParaMap($urlObj, false);
		return "https://open.weixin.qq.com/connect/oauth2/authorize?" . $bizString;
	}

	/**
	 * 作用：生成可以获得openid的url
	 */
	function createOauthUrlForOpenid($code) {
		$urlObj["appid"] = $this->config['app_id'];
		$urlObj["secret"] = $this->config['app_secret'];
		$urlObj["code"] = $code;
		$urlObj["grant_type"] = "authorization_code";
		$bizString = $this->formatBizQueryParaMap($urlObj, false);
		return "https://api.weixin.qq.com/sns/oauth2/access_token?" . $bizString;
	}

	/**
	 * 作用：通过curl向微信提交code，以获取openid
	 */
	function getOpenId($code) {
		$url = $this->createOauthUrlForOpenid($code);
		//初始化curl
		$ch = curl_init();
		//设置超时
		curl_setopt($ch, CURLOP_TIMEOUT, 30);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		//运行curl，结果以jason形式返回
		$res = curl_exec($ch);
		curl_close($ch);

		if (APP_DEBUG) {
			Log::write("微信支付获取openid URL:\n" . $url . "\n", Log::DEBUG);
		}
		//$res = $this->http($url);
		//取出openid
		$data = json_decode($res, true);
		$this->openid = $data['openid'];
		if (APP_DEBUG) {
			Log::write("微信支付获取openid\n" . var_export($data, TRUE) . "\n", Log::DEBUG);
		}
		return $this->openid;
	}
}
