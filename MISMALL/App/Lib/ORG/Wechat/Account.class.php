<?php
/**
 * 微信账号管理
 *
 * @author cjli
 *
 */
class Account extends WechatBase {
	public function __construct() {
		$this->appid = '';
		$this->secret = '';
	}

	public function login($username, $password, $imgcode) {
		if (empty($username) || empty($password)) {
			return false;
		}
		$loginurl = 'https://mp.weixin.qq.com/cgi-bin/login?lang=zh_CN';
		$post = array(
			'username' => $username,
			'pwd' => md5($password),
			'imgcode' => $imgcode,
			'f' => 'json',
		);
		$response = $this->http_request($loginurl, $post, array('CURLOPT_REFERER' => 'https://mp.weixin.qq.com/cgi-bin/loginpage?t=wxm2-login&lang=zh_CN'));

		if ($this->debug) {
			Log::write("微信login response: \n" . var_export($response, true) . '\n', Log::DEBUG);
		}

		if (empty($response) || !is_array($response)) {
			return false;
		}

		$data = json_decode($response['content'], true);
		if ($data['base_resp']['ret'] == 0) {
			preg_match('/token=([0-9]+)/', $data['redirect_url'], $match);
			//缓存token
			session('wechat-token', $match[1], 7200);
			session('wechat-cookies', implode('; ', $response['headers']['Set-Cookie']));
		} else {
			switch ($data['base_resp']['ret']) {
				case "-1":
					$msg = "系统错误，请稍候再试。";
					break;
				case "-2":
					$msg = "微信公众帐号或密码错误。";
					break;
				case "-3":
					$msg = "微信公众帐号密码错误，请重新输入。";
					break;
				case "-4":
					$msg = "不存在该微信公众帐户。";
					break;
				case "-5":
					$msg = "您的微信公众号目前处于访问受限状态。";
					break;
				case "-6":
					$msg = "登录受限制，需要输入验证码，稍后再试！";
					break;
				case "-7":
					$msg = "此微信公众号已绑定私人微信号，不可用于公众平台登录。";
					break;
				case "-8":
					$msg = "微信公众帐号登录邮箱已存在。";
					break;
				case "-200":
					$msg = "因您的微信公众号频繁提交虚假资料，该帐号被拒绝登录。";
					break;
				case "-94":
					$msg = "请使用微信公众帐号邮箱登陆。";
					break;
				case "10":
					$msg = "该公众会议号已经过期，无法再登录使用。";
					break;
				default:
					$msg = "未知的返回。";
			}

			if ($this->debug) {
				Log::write("微信login Error : \n" . $msg . '\n');
			}
			return false;
		}
		return true;
	}

	/**
	 * 帐号基本信息
	 *
	 * @param string $username 微信账户名称
	 *
	 * @return array
	 */
	public function basic() {
		$access_token = session('wechat-token');
		if (!$access_token) {
			return false;
		}
		$cookie = session('wechat-cookies');
		$post_data = array(
			'action' => 'dev',
			't' => 'advanced/dev',
			'token' => $access_token,
			'lang' => 'zh_CN',
			'f' => 'json',
		);
		$response = $this->http("https://mp.weixin.qq.com/advanced/advanced", $post_data, 'GET', array('CURLOPT_COOKIE' => $cookie, 'CURLOPT_REFERER' => 'https://mp.weixin.qq.com/advanced/advanced?action=edit&t=advanced/edit&token=' . $access_token));

		if ($this->debug) {
			Log::write("帐号基本信息 response: \n" . print_r($response) . '\n', Log::DEBUG);
		}

		if ($response === false) {
			return false;
		}

		$userInfo = $response['user_info'];

		$info = array(
			'name' => $userInfo['nick_name'],
			'account' => $userInfo['alias'],
			'original' => $userInfo['user_name'],
			'signature' => '',
			'country' => '',
			'province' => '',
			'city' => '',
			'key' => $response['advanced_info']['dev_info']['app_id'],
			'secret' => $response['advanced_info']['dev_info']['app_key'],
			'is_wx_verify' => $userInfo['is_wx_verify'], //0未认证, 1认证已
			'service_type' => $userInfo['service_type'], //1订阅号，2服务号
		);

		$fakeid = $userInfo['fake_id'];

		/*$image = $this->account_http('https://mp.weixin.qq.com/misc/getheadimg?fakeid='.$fakeid);
		if ($image && !empty($image['content'])) {
		$info['headimg'] = $image['content'];
		}*/
		$image = $this->account_http('https://mp.weixin.qq.com/misc/getqrcode?fakeid=' . $fakeid . '&style=1&action=download');
		if ($image && !empty($image['content'])) {
			$info['qrcode'] = $image['content'];
		}
		return $info;

	}

	/**
	 * 账号接口，自动开启开发者模式
	 *
	 * @param string $username 账号名称
	 * @param string $hash hash码
	 * @param string $token 生成的token
	 * @param  string $aeskey 生成的EncodingAESKey(消息加解密密钥)
	 *
	 * @return boolean
	 */
	function account_interface($username, $hash = '', $token = '', $aeskey = '') {
		//验证是否开启开发者服务器配置
		$response = $this->account_http('https://mp.weixin.qq.com/misc/skeyform?form=advancedswitchform&lang=zh_CN', array('flag' => '1', 'type' => '2'));
		if (empty($response) || !is_array($response)) {
			return false;
		}
		$response = json_decode($response['content'], true);
		if (!empty($response['base_resp']) && $response['base_resp']['ret']) {
			return $response['base_resp']['ret'];
		}
		//服务器配置
		$post_data = array(
			'url' => U('/api.php', '', false, false, true) . '?type=weChat&hash=' . $hash,
			'callback_token' => $token,
			'encoding_aeskey' => $aeskey,
			'callback_encrypt_mode' => 0,
		);
		$response = $this->account_http('https://mp.weixin.qq.com/advanced/callbackprofile?t=ajax-response&lang=zh_CN', $post_data);
		if (empty($response) || !is_array($response)) {
			return false;
		}
		$response = json_decode($response['content'], true);
		if ($response['base_resp']['ret'] < 0) {
			return false;
			//return $response['ret'];
		}
		return true;
	}

	private function account_http($url, $post = '') {
		$access_token = session('wechat-token');
		if (!$access_token) {
			return false;
		}
		$cookie = session('wechat-cookies');
		return $this->http_request($url . '&token=' . $access_token, $post, array('CURLOPT_COOKIE' => $cookie, 'CURLOPT_REFERER' => 'https://mp.weixin.qq.com/advanced/advanced?action=edit&t=advanced/edit&token=' . $access_token));
	}

}