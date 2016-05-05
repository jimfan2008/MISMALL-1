<?php
/**
 * 用户管理
 * 
 * @author cjli
 *
 */
class User extends WechatBase
{
	public function __construct( $appid, $secret)
	{
		$this->appid  = $appid;
		$this->secret = $secret;
	}



	
	//cc测试获取所有用户 start
	public function getGroupbycc(){
		$token = $this->getToken();
		
		
		$url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token={$token}";
		$result = $this->http($url);
		return $result;
	}
	
	public function getUserInfobycc(){
		$token = $this->getToken();
		$url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token={$token}&&openid=o4eQQs1aDttQHOT2gyHHipoGnDuc&lang=zh_CN";
		$result = $this->http($url);
		return $result;
	}
	
	
	
	//end 
	/**
	 * 创建分组
	 * 一个公众账号，最多支持创建500个分组
	 * 
	 * @param string $name 分组名字（30个字符以内)
	 * 
	 * @return array
	 */
	public function groupCreate($name)
	{
		$name = stripcslashes($name);
		if( empty($name) ) {
			$this->error = 's03';
			return false;
		}
		$name = $this->str_cut($name, 0, 30);
		
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		
		$param = array(
			'group' => array(
				'name' => $name
			)
		);
		$param = $this->jsencode($param);
		$url = "https://api.weixin.qq.com/cgi-bin/groups/create?access_token={$access_token}";
		$result = $this->http($url, $param, 'POST');
		
		return isset($result['group']) ? $result['group'] : $result;
	}
	
	/**
	 * 查询所有分组
	 * 
	 * @return array
	 */
	public function groupGet()
	{
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		$url = "https://api.weixin.qq.com/cgi-bin/groups/get?access_token={$access_token}";
		$result = $this->http($url);
		return isset($result['groups']) ? $result['groups'] : $result;
		/*
		 {
		    "groups": [
		        {
		            "id": 0, 分组id，由微信分配 
		            "name": "分组名称", 分组名字
		            "count": 72596 分组内用户数量
		        }
		    ]
		}
		 */
	}
	
	/**
	 * 修改分组名
	 * 
	 * @param int $group_id 分组id，由微信分配
	 * @param string $group_name 分组名字（30个字符以内）
	 * 
	 * @return 成功返回true 否则返回错误信息
	 */
	public function groupUpdate($group_id, $group_name)
	{
		$name = stripcslashes($name);
		if( ! intval($group_id) || empty($name) ) {
			return false;
		}
		$name = $this->str_cut($group_name, 0, 30);
		
		$params = array(
			'group' => array(
				'id'	=> $group_id,
				'name'	=> $name
			)
		);
		$params = $this->jsencode($params);
		
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		
		$url = "https://api.weixin.qq.com/cgi-bin/groups/update?access_token={$access_token}";
		$result = $this->http($url, $params, 'POST');
		
		return (boolean)$result;
	}
	
	/**
	 * 查询用户所在分组
	 * 通过用户的OpenID查询其所在的GroupID
	 * 
	 * @param string $openid  用户的OpenID
	 * 
	 * @return string 返回GroupID
	 */
	public function groupByUserOpenId($openid)
	{
		$param = $this->jsencode(array('openid' => $openid));
		
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		
		$url = "https://api.weixin.qq.com/cgi-bin/groups/getid?access_token={$access_token}";
		$result = $this->http($url, $param, 'POST');
		
		return isset($result['groupid']) ? $result['groupid'] : $result;
	}
	
	/**
	 * 移动用户分组
	 * 
	 * @param string $openid 用户唯一标识符
	 * @param int $to_groupid  	分组id
	 * 
	 * @return 成功返回true 否则返回错误信息
	 */
	public function groupMove($openid, $to_groupid)
	{
		$params = array(
			'openid'	=> $openid,
			'to_groupid'=> $to_groupid
		);
		$params = $this->jsencode($params);
		
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		
		$url = "https://api.weixin.qq.com/cgi-bin/groups/members/update?access_token={$access_token}";
		$result = $this->http($url, $params, 'POST');
		
		return (boolean)$result;
	}
	
	/**
	 * 获取用户基本信息
	 * 
	 * @param string $openid 普通用户的标识，对当前公众号唯一
	 * @param string $lang 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语
	 * 
	 * @return array
	 */
	public function getUserInfo( $openid, $lang = 'zh_CN' )
	{
		if( ! in_array($lang, array('zh_CN', 'zh_TW', 'en')) ) {
			$lang = 'zh_CN';
		}
		
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}

		$url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token={$access_token}";
		$params = array(
			'openid'	=> $openid,
			'lang'		=> $lang,
		);
		/*
		 {
		    "subscribe": 1, 用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。 
		    "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M", 
		    "nickname": "Band", 
		    "sex": 1, 用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
		    "language": "zh_CN", 
		    "city": "广州", 
		    "province": "广东", 
		    "country": "中国", 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空
		    "headimgurl":    "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0", 
		   "subscribe_time": 1382694957
		}
		 */
		
		$result = $this->http($url, $params);
		return $result;
	}
	
	/**
	 * 获取关注者列表
	 * 当公众号关注者数量超过10000时，可通过填写next_openid的值，从而多次拉取列表的方式来满足需求
	 * 
	 * @param string $next_openid 第一个拉取的OPENID，不填默认从头开始拉取
	 * 
	 * @return array
	 */
	public function getUserList( $next_openid = '' )
	{
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		
		$url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token={$access_token}";
		$params = array();
		if($next_openid){
			$params['next_openid'] = $next_openid;
		}
		/*
		 返回结果:(关注者列表已返回完时，返回next_openid为空)
		{
		  "total":23000,
		  "count":10000,
		  "data":{"
		     openid":[
		        "OPENID1",
		        "OPENID2",
		        ...,
		        "OPENID10000"
		     ]
		   },
		   "next_openid":"NEXT_OPENID1"
		}
		 */
		
		$result = $this->http($url, $params);
		return $result;
	}
}