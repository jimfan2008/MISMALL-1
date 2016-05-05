<?php
/**
 * 微信红包接口
 */
class Redpack {
	protected $gateway = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';

	protected $config = array(
		'app_id' => '', //微信公众号AppID(应用ID)
		'app_secret' => '', //AppSecret(应用密钥)
		'mch_id' => '', //受理商ID，身份标识
		'key' => '', //商户支付密钥Key
	);

	public function __construct($config) {
		$this->config = array_merge($this->config, $config);
		if (!$this->config['app_id'] || !$this->config['app_secret'] || !$this->config['mch_id'] || !$this->config['key']) {
			E("微信红包设置有误！");
		}
		return true;
	}

	/**
	 * 发红包
	 * @param  array $param
	 * @return boolean
	 */
	public function send($param) {
		//所有的参数必须不能为空
		$parameter = array(
			'wxappid' => $this->config['app_id'], //公众账号appid
			'mch_id' => $this->config['mch_id'], //商户号
			'nonce_str' => $this->createNoncestr(), // 随机字符串
			'mch_billno' => $this->config['mch_id'] . date('Ymd') . $this->createNoncestr(10, 2), // 商户订单号(每个订单号必须唯一)组成: mch_id+yyyymmdd+10 位一天内丌能重复的数字。
			'nick_name' => $param['nick_name'], //提供方名称
			'send_name' => $param['send_name'], //红包发送者名称
			're_openid' => $param['re_openid'], //接叐收红包的用户
			'total_amount' => intval($param['total_amount'] * 100), // 付款金额,单位分
			'min_value' => intval($param['min_value'] * 100), //最小红包金额,单位分
			'max_value' => intval($param['max_value'] * 100), //最大红包金额,单位分
			'total_num' => isset($param['total_num']) ? intval($param['total_num']) : 1, //红包収放总人数
			'wishing' => $param['wishing'], //红包祝福诧
			'act_name' => $param['act_name'], //活劢名称
			'remark' => $param['remark'], //备注信息
			'client_ip' => $_SERVER['REMOTE_ADDR'], //调用接口的机器 Ip 地址

			//'logo_imgurl' => $param['logo_imgurl'],//商户logo的url(暂未开放)
			//'share_content' => $param['share_content'],//分享文案(暂未开放)
			//'share_url' => $param['share_url'],//分享链接(暂未开放)
			//'share_imgurl' => $param['share_imgurl'],//分享的图片url(暂未开放)
		);
		foreach ($parameter as $key => $value) {
			if (empty($value)) {
				return "参数 [" . $key . "] 不能为空";
			}
		}

		//生成签名
		$parameter['sign'] = $this->getSign($parameter);

		//dump($parameter);exit;

		// 转换数据为XML
		$xml = $this->arrayToXml($parameter);
		//记录Log
		if (APP_DEBUG) {
			Log::write("\n红包信息:\n" . var_export($xml, TRUE) . "\n", Log::DEBUG);
		}

		//post请求xml, 请求微信支付
		$response = $this->postXmlCurl($xml, $this->gateway, 30);

		/*
		<xml>
		<return_code><![CDATA[FAIL]]></return_code>
		<return_msg><![CDATA[帐号余额不足，请到商户平台充值后再重试]]></return_msg>
		<result_code><![CDATA[FAIL]]></result_code>
		<err_code><![CDATA[NOTENOUGH]]></err_code>
		<err_code_des><![CDATA[帐号余额不足，请到商户平台充值后再重试]]></err_code_des>
		<mch_billno><![CDATA[1232414502201504134644297939]]></mch_billno>
		<mch_id>1232414502</mch_id>
		<wxappid><![CDATA[wx457341e4f5cead31]]></wxappid>
		<re_openid><![CDATA[o4eQQsws_fBJCmXG-EW0FuEyq788]]></re_openid>
		<total_amount>100</total_amount>
		</xml>
		$response = <<<EOF
		<xml>
		<return_code><![CDATA[SUCCESS]]></return_code>
		<return_msg><![CDATA[发放成功]]></return_msg>
		<result_code><![CDATA[SUCCESS]]></result_code>
		<mch_billno><![CDATA[1232414502201504138830361632]]></mch_billno>
		<mch_id>1232414502</mch_id>
		<wxappid><![CDATA[wx457341e4f5cead31]]></wxappid>
		<re_openid><![CDATA[o4eQQsws_fBJCmXG-EW0FuEyq788]]></re_openid>
		<total_amount>100</total_amount>
		<send_listid><![CDATA[1000000000201504133108665667]]></send_listid>
		<send_time><![CDATA[20150413174322]]></send_time>
		</xml>
		EOF;*/

		if ($response === NULL) {
			return '请求微信红包错误';
		}
		$result = $this->xmlToArray($response);

		//返回参数处理流程
		if ($result["return_code"] == "FAIL") {
			return $result['return_msg'];
		} elseif ($result["result_code"] == "FAIL") {
			return "错误代码：" . $result['err_code'] . "\n错误代码描述：" . $result['err_code_des'];
		}
		return true;
	}

	/**
	 * 作用：产生随机字符串，不长于32位
	 */
	public function createNoncestr($length = 32, $type = 1) {
		if ($type == 2) {
			$chars = "0123456789";
		} else {
			$chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		}
		$str = "";
		for ($i = 0; $i < $length; $i++) {
			$str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
		}
		return $str;
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

		//以下两种方式需选择一种
		//第一种方法，cert 与 key 分别属于两个.pem文件。路径需要填写绝对路径：例如E:/www/..../apiclient_cert.pem
		$cacert_path = LIB_PATH . DS . 'ORG' . DS . 'Wechat' . DS . 'cert' . DS;
		curl_setopt($ch, CURLOPT_SSLCERT, $cacert_path . 'apiclient_cert.pem');
		curl_setopt($ch, CURLOPT_SSLKEY, $cacert_path . 'apiclient_key.pem');
		curl_setopt($ch, CURLOPT_CAINFO, $cacert_path . 'rootca.pem');

		//第二种方式，两个文件合成一个.pem文件
		//curl_setopt($ch,CURLOPT_SSLCERT,getcwd().'/all.pem');

		if (count($aHeader) >= 1) {
			curl_setopt($ch, CURLOPT_HTTPHEADER, $aHeader);
		}
		//运行curl
		$data = curl_exec($ch);
		curl_close($ch);

		if (APP_DEBUG) {
			Log::write("红包支付返回结果\n" . var_export($data, TRUE) . "\n", Log::DEBUG);
		}
		//返回结果
		if ($data) {
			curl_close($ch);
			return $data;
		} else {
			$error = curl_errno($ch);
			echo "curl出错，错误码:$error" . "<br>";
			curl_close($ch);
			return false;
		}
	}

	public function getError($code) {
		$array = array(
			'NOAUTH' => '请联系微信支付开通 api 权限',
			'PARAM_ERROR' => '参数错诨',
			'OPENID_ERROR' => 'Openid错诨',
			'NOTENOUGH' => '余额不足',
			'SYSTEMERROR' => '系统繁忙,请再试。',
			'TIME _LIMITED' => '企业红包 的収送 时间叐限',
			'SECOND_OVER_LIMITED' => '企业红包的按分钟収放叐限',
			'MONEY_LIMIT' => '红包金额収放限制',
		);
		return $array[$code];
	}
}
