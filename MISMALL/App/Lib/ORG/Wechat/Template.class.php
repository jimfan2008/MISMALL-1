<?php
class Template extends WechatBase {
	public function __construct($appid, $secret) {
		$this->appid = $appid;
		$this->secret = $secret;
	}

	/**
	 * 设置所属行业
	 * @link(http://mp.weixin.qq.com/wiki/17/304c1885ea66dbedf7dc170d84999a9d.html)
	 *
	 * @param integer $industry_id1公众号模板消息所属行业编号
	 * @param integer $industry_id2 公众号模板消息所属行业编号
	 *
	 * @return boolean
	 */
	public function setIndustry($industry_id1 = 1, $industry_id2 = 2) {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}
		$param = array(
			'industry_id1' => intval($industry_id1),
			'industry_id2' => intval($industry_id2),
		);
		$json_data = $this->jsencode($param);
		$url = "https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token={$access_token}";
		$result = $this->http($url, $json_data, 'POST');
		if ($result['errcode'] == 0) {
			return true;
		}
		return false;
	}

	/**
	 * 获得模板ID
	 *
	 * @param  string $template_id_short 模板库中模板的编号，有“TM**”和“OPENTMTM**”等形式
	 *
	 * @return string
	 */
	public function getTemplateId($template_id_short) {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}
		$param = array(
			'template_id_short' => $template_id_short,
		);
		$json_data = $this->jsencode($param);
		$url = "https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token={$access_token}";
		$result = $this->http($url, $json_data, 'POST');
		if ($result['errcode'] == 0) {
			return $result['template_id'];
		}
		return false;
	}

	/**
	 * 发送模板消息
	 *
	 * @param string $touser     消息接收者
	 * @param  string $template_id 模板ID
	 * @param  string $url        服务详情地址
	 * @param  string $topcolor   消息顶部颜色
	 * @param array $data   数据包
	 *
	 * @return NULL
	 */
	public function templateSend($touser, $template_id, $data, $url, $topcolor = '#FF0000') {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}

		$param = array(
			'touser' => $touser,
			'template_id' => $template_id,
			'url' => $url,
			'topcolor' => $topcolor,
			'data' => $data,
		);
		//记录Log
		if ($this->debug) {
			Log::write("\n发送模板消息:\n" . var_export($param, TRUE) . "\n", Log::DEBUG);
		}
		$json_data = $this->jsencode($param);
		$url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={$access_token}";
		$result = $this->http($url, $json_data, 'POST');
		return $result;
		/*
	{
	"touser":"OPENID",
	"template_id":"ngqIpbwh8bUfcSsECmogfXcV14J0tQlEpBO27izEYtY",
	"url":"http://weixin.qq.com/download",
	"topcolor":"#FF0000",
	"data":{
	"first": {
	"value":"恭喜你购买成功！",
	"color":"#173177"
	},
	"keynote1":{
	"value":"巧克力",
	"color":"#173177"
	},
	"keynote2": {
	"value":"39.8元",
	"color":"#173177"
	},
	"keynote3": {
	"value":"2014年9月16日",
	"color":"#173177"
	},
	"remark":{
	"value":"欢迎再次购买！",
	"color":"#173177"
	}
	}
	}

	 */
	}
}