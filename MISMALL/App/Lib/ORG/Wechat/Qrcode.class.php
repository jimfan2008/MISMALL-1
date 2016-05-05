<?php
/**
 * 生成带参数的二维码
 *
 * @author cjli
 *
 */
class Qrcode extends WechatBase {
	public function __construct($appid, $secret) {
		$this->appid = $appid;
		$this->secret = $secret;
	}

	/**
	 * 创建二维码ticket
	 *
	 * @param int	 $scene_id 使用场景 场景值ID，临时二维码时为32位非0整型，永久二维码时最大值为100000（目前参数只支持1--100000）
	 * @param int	 $expire 过期时间 不设置默认为永久有效 以秒为单位。 最大不超过1800
	 * @param boolean $is_str  true 字符串形式的ID
	 * {"expire_seconds": 1800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}
	 *
	 * @return  array(ticket, url)
	 * @return ticket正确情况下，http 返回码是200，是一张图片，可以直接展示或者下载
	 */
	public function create($scene_id = 1, $is_string = false, $expire = '') {
		if ($is_string) {
			$params = array(
				'action_info' => array(
					'scene' => array(
						'scene_str' => $scene_id,
					),
				),
			);
		} else {
			$params = array(
				'action_info' => array(
					'scene' => array(
						'scene_id' => intval($scene_id),
					),
				),
			);
		}
		//临时二维码
		if ($expire) {
			$params['expire_seconds'] = $expire;
			$params['action_name'] = 'QR_SCENE';
		}
		//永久二维码
		else {
			$params['action_name'] = $is_string ? 'QR_LIMIT_STR_SCENE' : 'QR_LIMIT_SCENE';
		}

		$params = $this->jsencode($params);

		if ($this->debug) {
			Log::write('创建二维码参数:\n' . var_export($params, TRUE) . '\n', Log::DEBUG);
		}

		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}
		$url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token={$access_token}";
		$result = $this->http($url, $params, 'POST');

		if ($this->debug) {
			Log::write('创建二维码结果:\n' . var_export($result, TRUE) . '\n', Log::DEBUG);
		}
		/*
		{"ticket":"gQH47joAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2taZ2Z3TVRtNzJXV1Brb3ZhYmJJAAIEZ23sUwMEmm3sUw==","expire_seconds":60,"url":"http:\/\/weixin.qq.com\/q\/kZgfwMTm72WWPkovabbI"}
		 */
		if ($result === FALSE) {
			return false;
		}
		return $result;
	}

	/**
	 * 通过ticket换取二维码
	 *
	 * @param string $ticket 通过ticket换取二维码
	 *
	 * @return ticket正确情况下，http 返回码是200，是一张图片，可以直接展示或者下载
	 */
	public function show($ticket = '') {
		//通过ticket换取二维码
		$url = "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket={$ticket}";
		$response = $this->http_request($url, '', array("Content-type: text/html; charset=utf-8"));

		preg_match('/"errcode":([0-9]+)/', $response['content'], $match);

		if (isset($match[1])) {
			$this->error = $match[1];
			return false;
		}
		$result = array(
			'type' => $response['headers']['Content-Type'],
			'name' => substr($response['headers']['Content-disposition'], 22, -1),
			'length' => $response['headers']['Content-Length'],
			'content' => $response['content'],
		);
		return $result;
	}
}