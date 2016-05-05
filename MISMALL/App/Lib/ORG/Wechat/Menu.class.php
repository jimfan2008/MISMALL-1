<?php
/**
 * 自定义菜单类
 *
 * 目前自定义菜单最多包括3个一级菜单，每个一级菜单最多包含5个二级菜单。
 * 一级菜单最多4个汉字，二级菜单最多7个汉字，多出来的部分将会以“...”代替。
 * 请注意，创建自定义菜单后，由于微信客户端缓存，需要24小时微信客户端才会展现出来。
 * 建议测试时可以尝试取消关注公众账号后再次关注，则可以看到创建后的效果。
 *
 * 目前自定义菜单接口可实现两种类型按钮，如下：
 *  click：
 *  用户点击click类型按钮后，微信服务器会通过消息接口推送消息类型为event
 *  的结构给开发者（参考消息接口指南），并且带上按钮中开发者填写的key值，开发者可以通过自定义的key值与用户进行交互；
 *  view：
 *  用户点击view类型按钮后，微信客户端将会打开开发者在按钮中填写的url值	（即网页链接），达到打开网页的目的，
 *  建议与网页授权获取用户基本信息接口结合，获得用户的登入个人信息。
 *
 * @author cjli
 *
 */
class Menu extends WechatBase {

	public function __construct($appid, $secret) {
		$this->appid = $appid;
		$this->secret = $secret;
	}

	/**
	 * 菜单创建
	 * @example
	 * {
	 *    "button":[
	 *    {
	 *         "type":"click",
	 *         "name":"今日歌曲",
	 *         "key":"V1001_TODAY_MUSIC"
	 *     },
	 *     {
	 *          "type":"click",
	 *          "name":"歌手简介",
	 *          "key":"V1001_TODAY_SINGER"
	 *     },
	 *     {
	 *          "name":"菜单",
	 *          "sub_button":[
	 *          {
	 *              "type":"view",
	 *              "name":"搜索",
	 *              "url":"http://www.soso.com/"
	 *           },
	 *           {
	 *              "type":"view",
	 *              "name":"视频",
	 *              "url":"http://v.qq.com/"
	 *           },
	 *           {
	 *              "type":"click",
	 *              "name":"赞一下我们",
	 *              "key":"V1001_GOOD"
	 *           }]
	 *      }]
	 *	}
	 *
	 * 参数说明
	 *	参数 	是否必须 	说明
	 *  button 	是 	一级菜单数组，个数应为1~3个
	 *	sub_button 	否 	二级菜单数组，个数应为1~5个
	 *	type 	是 	菜单的响应动作类型，目前有click、view两种类型
	 *	name 	是 	菜单标题，不超过16个字节，子菜单不超过40个字节
	 *	key 	click类型必须 	菜单KEY值，用于消息接口推送，不超过128字节
	 *	url 	view类型必须 	网页链接，用户点击菜单可打开链接，不超过256字节
	 *
	 *
	 * @param  string $data 菜单
	 *
	 * @return boolean  返回的结果
	 */
	public function menuCreate($data) {
		if (empty($data)) {
			return false;
		}
		$param = array(
			'button' => $data,
		);
		$param = $this->jsencode($param);

		if ($this->debug) {
			Log::write('菜单创建:\n' . $param . '\n', Log::DEBUG);
		}

		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}

		//删除菜单
		$result = $this->menuDelete();
		if ($result === FAlSE) {
			return false;
		}

		//设置菜单
		$url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token={$access_token}";
		$result = $this->http($url, $param, 'POST');
		if ($this->debug) {
			Log::write('菜单创建返回的结果:\n' . $result . '\n', Log::DEBUG);
		}
		return (boolean) $result;

	}

	/**
	 * 菜单查询
	 * @return string  返回的结果；
	 */
	public function menuGet() {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}
		$url = "https://api.weixin.qq.com/cgi-bin/menu/get?access_token={$access_token}";
		$result = $this->http($url);
		if ($result === FAlSE) {
			return false;
		}
		return $result['menu']['button'];
	}

	/**
	 * 删除菜单
	 *
	 * @return boolean
	 */
	public function menuDelete() {
		$access_token = $this->getToken();
		if (!$access_token) {
			return false;
		}
		$url = "https://api.weixin.qq.com/cgi-bin/menu/delete?access_token={$access_token}";
		$result = $this->http($url);
		return (boolean) $result;
	}

}