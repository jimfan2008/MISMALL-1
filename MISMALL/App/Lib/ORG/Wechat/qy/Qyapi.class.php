<?php
/**
 * 微信企业号开发接口
 * 
 * @author cjli
 */

class Qyapi extends WechatBase
{
	private $token;

	public function __construct( $appid, $secret)
	{
		$this->appid  = $appid;
		$this->secret = $secret;

		$this->token = $this->getQyToken();
		if( ! $this->token ) {
			return false;
		}
	}

	/**
	 * 获取菜单列表
	 * @param  string $agentid 企业应用的id，可在应用的设置页面查看
	 * @return string  返回的结果；
	 */
	public function menuGet($agentid) {
		$url = "https://qyapi.weixin.qq.com/cgi-bin/menu/get?access_token={$this->token}&agentid={$agentid}";

		$result = $this -> qyHttp($url);
		if ($result === FAlSE) {
			return false;
		}
		return $result['menu']['button'];
	}

	/**
	 * 菜单创建
	 * @param string $agentid 企业应用的id
	 * @param  string $data 菜单
	 *
	 * @return boolean  返回的结果
	 */
	public function menuCreate($agentid, $data) {
		if (empty($data)) {
			return false;
		}

		$param = '{"button":' . $data . '}';
		$this -> menuDelete($agentid);
		//设置菜单
		$url = "https://qyapi.weixin.qq.com/cgi-bin/menu/create?access_token={$this->token}&agentid={$agentid}";
		$result = $this -> qyHttp($url, $param, 'POST');

		return (boolean)$result;

	}

	/**
	 * 删除菜单
	 *
	 * @return boolean
	 */
	public function menuDelete($agentid) {
		$url = "https://qyapi.weixin.qq.com/cgi-bin/menu/delete?access_token={$this->token}&agentid={$agentid}";
		$result = $this -> qyHttp($url);

		return (boolean)$result;
	}

	/**
	 * 获取部门列表
	 *
	 * @return array
	 */
	public function departmentList() {
		$url = "https://qyapi.weixin.qq.com/cgi-bin/department/list?access_token={$this->token}";
		$result = $this -> qyHttp($url);
		if ($result === FAlSE) {
			return false;
		}
		return $result['department'];
	}

	/**
	 * 添加部门信息
	 *
	 * @param int $parentid	上级部门ID
	 * @param string $name	部门名称
	 *
	 * @return int 部门ID
	 */
	public function departmentCreate($parentid, $name) {
		$url = "https://qyapi.weixin.qq.com/cgi-bin/department/create?access_token={$this->token}";
		$params = array('name' => $name, 'parentid' => $parentid, );
		$param = $this -> jsencode($params);
		$result = $this -> qyHttp($url, $param, 'POST');
		if ($result === FAlSE) {
			return false;
		}
		return $result['id'];
	}

	/**
	 * 更新部门信息
	 *
	 * @param int $id	部门ID
	 * @param string $name	部门名称
	 *
	 * @return boolean
	 */
	public function departmentUpdate($id, $name) {
		$url = "https://qyapi.weixin.qq.com/cgi-bin/department/update?access_token={$this->token}";
		$params = array('name' => $name, 'id' => $id, );
		$param = $this -> jsencode($params);
		$result = $this -> qyHttp($url, $param, 'POST');
		return (boolean)$result;
	}

	/**
	 * TODO 不能删除根部门；不能删除含有子部门、成员的部门
	 * 删除部门
	 *
	 * @param array $ids
	 */
	public function departmentDelete($ids) {
		$param = '';
		if (empty($ids)) {
			return false;
		}
		if (is_array($ids)) {
			foreach ($ids as $id) {
				$param .= '&id=' . $id;
			}
		} else {
			$param .= '&id='.$ids;
		}
		
		
		$url="https://qyapi.weixin.qq.com/cgi-bin/department/delete?access_token={$this->token}".$param;
		$result = $this->qyHttp($url);
		return (boolean) $result;
	}

	/**
	 * 获取部门成员
	 *
	 * @param int $department_id  	获取的部门id
	 * @param int $fetch_child=0    1/0：是否递归获取子部门下面的成员
	 * @param int $status           0获取全部员工，1获取已关注成员列表，2获取禁用成员列表，4获取未关注成员列表。status可叠加
	 * 
	 * @return array
	 */
	public function userListByDepartment($department_id, $fetch_child=0, $status=0)
	{
		$params = array(
			'department_id' => $department_id,
			'fetch_child'	=> $fetch_child,
			'status'		=> $status,
		);
		$url = "https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?access_token={$this->token}";
		$result = $this -> qyHttp($url, $params);
		if ($result === FAlSE) {
			return false;
		}
		
		return $result['userlist'];
		/*
		  "userlist": [
     		{
     	          "userid": "zhangsan",
     	           "name": "李四"
     	    }
     	]
		*/
	}

	/**
	 * 获取成员
	 *
	 * @param  string $userid 员工UserID
	 *
	 * @return array 成员详细信息
	 */
	public function userGet($userid)
	{
		$url="https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token={$this->token}&userid={$userid}";
		$result = $this->qyHttp($url);
		return $result;
		/*
		{
		   "errcode": 0,
		   "errmsg": "ok",
		   "userid": "zhangsan",
		   "name": "李四",
		   "department": [1, 2],
		   "position": "后台工程师",
		   "mobile": "15913215421",
		   "gender": 1,
		   "tel": "62394",
		   "email": "zhangsan@gzdev.com",
		   "weixinid": "lisifordev",  
		   "avatar": "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
		   "status": 1,
		   "extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
		}
		 */
	}

	/**
	 * 创建成员
	 *
	 * @param  array $post	成员信息数组
	 *
	 * @return boolean
	 */
	public function userCreate($post)
	{
		$set = array(
			"userid" => $post['userid'] ? $post['userid'] : '',
			"name"	 => $post['name'] ? $post['name'] : '',
			"department" => $post['department'] ? $post['department'] : '',
			"position" => $post['position'] ? $post['position'] : '',
			"mobile" => $post['mobile'] ? $post['mobile'] : '',
			"gender" => $post['gender'] ? $post['gender'] : '',
			"tel" => $post['tel'] ? $post['tel'] : '',
			"email" => $post['email'] ? $post['email'] : '',
			"weixinid" => $post['weixinid'] ? $post['weixinid'] : ''
		);

		//缺少UserID
		if (!$set['userid']) {
			$this -> error = '41009';
			return false;
		}
		// 	成员姓名不合法
		if (!$set['name']) {
			$this -> error = '60112';
			return false;
		}

		foreach ($set as $key => $value) {
			if (empty($value)) {
				unset($set[$key]);
			}
		}
		$param = $this -> jsencode($set);

		$url = "https://qyapi.weixin.qq.com/cgi-bin/user/create?access_token={$this->token}";
		$result = $this -> qyHttp($url, $param, 'POST');
		return (boolean)$result;
	}

	/**
	 * 更新成员
	 *
	 * @param  array $post 成员信息数组
	 *
	 * @return boolean
	 */
	public function userUpdate($post)
	{
		$set = array(
			"userid" => $post['userid'] ? $post['userid'] : '',
			"name"	 => $post['name'] ? $post['name'] : '',
			"department" => $post['department'] ? $post['department'] : '',
			"position" => $post['position'] ? $post['position'] : '',
			"mobile" => $post['mobile'] ? $post['mobile'] : '',
			"gender" => $post['gender'] ? $post['gender'] : '',
			"tel" => $post['tel'] ? $post['tel'] : '',
			"email" => $post['email'] ? $post['email'] : '',
			"weixinid" => $post['weixinid'] ? $post['weixinid'] : '',
			"enable" => isset($post['enable']) ? $post['enable'] : '',
		);

		//缺少UserID
		if (!$set['userid']) {
			$this -> error = '41009';
			return false;
		}
		foreach ($set as $key => $val) {
			if(empty($val) && !is_numeric($val)){
				unset($set[$key]);
			}
		}
		$param = $this -> jsencode($set);

		//为-1时删除通讯录信息
		if ($set['enable'] && $set['enable'] == -1) {
			return $this -> userDelete($set['userid']);
		}

		$url = "https://qyapi.weixin.qq.com/cgi-bin/user/update?access_token={$this->token}";
		$result = $this -> qyHttp($url, $param, 'POST');
		return (boolean)$result;
	}

	/**
	 * 删除成员
	 *
	 * @param  string $userid 员工UserID
	 *
	 * @return boolean
	 */
	public function userDelete($userid)
	{
		$url = "https://qyapi.weixin.qq.com/cgi-bin/user/delete?access_token={$this->token}&userid={$userid}";
		$result = $this -> qyHttp($url);
		return (boolean)$result;
	}

	/**
	 * 获取企业号accesstoken
	 */
	public function getQyToken()
	{
		echo $this->appid . '-' . $this->secret;exit;
		//TODO
		$cache_id = md5('wechat-token-' . $this->appid . '-' . $this->secret);

		$accesstoken = S($cache_id);

		if (!$accesstoken) {
			// 去微信获取最新ACCESS_TOKEN
			$params = array('corpid' => $this->appid, 'corpsecret' => $this->secret );

			$url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
			$result = $this -> qyHttp($url, $params);

			if ($result === false) {
				return false;
			}
			$accesstoken = $result['access_token'];
			
			//TODO 兼容Qywx项目
				S($cache_id, $accesstoken, array('expire' => $result['expires_in']));
				// 放进缓存,默认7200s
			//}
		}

		return $accesstoken;
	}

	/**
	 * 企业获取code
	 * @param	string 	授权后重定向的回调链接地址，请使用urlencode对链接进行处理
	 * @param	string	重定向后会带上state参数，企业可以填写a-zA-Z0-9的参数值
	 */
	public function getQyCode($redirect_uri, $state = '1')
	{
		$app_id = $this->appid;
		$redirect_uri = urlencode($redirect_uri);
		$url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={$app_id}&redirect_uri={$redirect_uri}&response_type=code&scope=snsapi_base&state={$state}#wechat_redirect";
		
		//$this -> qyHttp($url);
		header("location:" . $url);
	}
	
	/**
	 * code获取成员信息
	 * @param	string	员工授权获取到的code
	 * @param	int		跳转链接时所在的企业应用ID
	 * @return
	 */
	public function getQyMemberInfo($code, $app_id)
	{
		$url = "https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token={$this->token}&code={$code}&agentid={$app_id}";				
		$result = $this -> qyHttp($url);
		return $result;
	}

	/**
	 * 获取媒体文件
	 * 通过media_id获取图片、语音、视频等文件。
	 * 
	 * @param string $media_id  媒体文件上传后获取的唯一标识
	 * 
	 * @return object
	 */
	public function getMediaInfo($media_id)
	{
		$url = "https://qyapi.weixin.qq.com/cgi-bin/media/get?access_token={$this->token}&media_id={$media_id}";

		$response = $this->http_request($url, '', array ( "Content-type: text/html; charset=utf-8" ));
		
		preg_match('/"errcode":([0-9]+)/', $response['content'], $match);
		
		if ( isset($match[1]) ) {
			$this->error = $match[1];
			return false;
		}
		$result = array(
			'type' => $response['headers']['Content-Type'],
			'name' => substr($response['headers']['Content-disposition'], 22, -1),
			'length' => $response['headers']['Content-Length'],
			'content' => $response['content']
		);
		return $result;

		/*
		{
		   HTTP/1.1 200 OK
		   Connection: close
		   Content-Type: image/jpeg 
		   Content-disposition: attachment; filename="MEDIA_ID.jpg"
		   Date: Sun, 06 Jan 2013 10:20:18 GMT
		   Cache-Control: no-cache, must-revalidate
		   Content-Length: 339721
		   
		   Xxxx
		}
		 */
	}

	/**
	 * 上传媒体文件
	 * 
     * 上传的媒体文件限制
	 * 图片（image）:1MB，支持JPG格式
	 * 语音（voice）：2MB，播放长度不超过60s，支持AMR格式
	 * 视频（video）：10MB，支持MP4格式
	 * 普通文件（file）：10MB
	 *
	 * @param string $type 媒体文件类型，分别有图片（image）、语音（voice）、视频（video），普通文件(file)
	 * @param  array $media form-data中媒体文件标识，有filename、filelength、content-type等信息
	 * 
	 * @return array
	 */
	public function uploadMedia($media)
	{
		//多媒体文件为空
		if (! is_file($media) ) {
			$this->error = 44001;
			return false;
		}
		//媒体文件类型
		$pathinfo = pathinfo($media);
		switch ( strtolower($pathinfo['extension'])) {
			case 'jpeg':
			case 'jpg':
				$type = 'image';
				break;
			case 'amr':
				$type = 'voice';
				break;
			case 'mp4':
				$type = 'video';
				break;
			default:
				$type = 'file';
				break;
		}
		
		$param = array(
			'media' => '@'.$media //文件上传必须带@符号
		);

		$url = "https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token={$this->token}&type={$type}";

		$result = $this->qyHttp($url, $param, 'POST', '', true);
		return $result;
		/*
		{
		   "type": "image",
		   "media_id": "0000001",  	媒体文件上传后获取的唯一标识
		   "created_at": "1380000000" 媒体文件上传时间戳
		}
		 */
	}

	/**
	 * 群发送消息
	 * 
	 * @param  int    $agentid 企业应用的id，整型。可在应用的设置页面查看 
	 * @param  string $type    消息类型，此时固定为：text
	 * @param  string $content 消息内容
	 * @param  int    $safe    表示是否是保密消息，0表示否，1表示是，默认0
	 * @param  string $touser  UserID列表（消息接收者，多个接收者用‘|’分隔）。特殊情况：指定为@all，则向关注该企业应用的全部成员发送
	 * @param  string $toparty PartyID列表，多个接受者用‘|’分隔。当touser为@all时忽略本参数
	 * @param  string $totag   TagID列表，多个接受者用‘|’分隔。当touser为@all时忽略本参数
	 * 
	 * @return boolean
	 */
	public function sendMessage($agentid, $type = 'text', $content = '', $safe = 0, $touser = '', $toparty = '', $totag = '')
	{
		//不合法的agentid 
		$agentid = intval($agentid);
		/*if (! $agentid) {
			$this->error = '40056';
			return false;
		}*/

		if ( empty($touser) && empty($toparty) && empty($totag)) {
			$this->error = 's04';
			return false;
		}

		$data = array(
			'agentid' => $agentid,
			'touser'  => $touser,
			'toparty' => $toparty,
			'totag'	  => $totag,
			'msgtype' => $type,
			'safe'	  => $safe ? 1 : 0,
		);


		// 添加类型数据
		switch($type)
		{
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
			//file消息
			case 'file':
				$data['file']['media_id'] = $content;
				break;
			//图文信息
			case 'news':
				$articles = array();
				foreach ($content as $key => $value) {
					list(
						$articles[$key]['title'],
						$articles[$key]['description'],
						$articles[$key]['url'],
						$articles[$key]['picurl']
					) = $value;
					if($key >= 9) { break; } //最多只允许10调新闻
				}
				$data['news']['articles'] = $articles;
				break;
			//mpnews消息
			case 'mpnews':
				$articles = array();
				foreach ($content as $key => $value) {
					list(
						$articles[$key]['title'],
						$articles[$key]['thumb_media_id'],
						$articles[$key]['author'],
						$articles[$key]['content_source_url'],
						$articles[$key]['content'],
						$articles[$key]['digest'],
						$articles[$key]['url'],
						$articles[$key]['show_cover_pic']
					) = $value;
					if($key >= 9) { break; } //最多只允许10调新闻
				}
				$data['mpnews']['articles'] = $articles;
				break;
			//文本信息
			case 'text':
			default:
				$data['text']['content'] = $content;
		}
			
		//发送
		$param = $this->jsencode ( $data );
		$url = "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={$this->token}";
		$result = $this->qyHttp($url, $param, 'POST');

		if ($result['errcode']) {
			$this->error = $result['errcode'];
			return false;
		}
		return $result;
	}

}
