<?php
class DeveloperAction extends HomeAction {
	/**
	 * 会员ＩＤ
	 * @var int
	 */
	var $user_id;
	
	/**
	 * 初始化会员中心
	 */
	public function _initialize() {
		parent::_initialize();

		$this->user_id = session('uid');
		//获取用户信息
		if (!$this->user_id) {
			$redirect_url = urlencode($this->get_url());
			session("redirect_url",$redirect_url);
			$this->redirect("Unregistered/login");
		}
		
		$data['lastStatus'] = 1;
		D("User")->updAUser($this->user_id,$data);
	}
	
	
		/**
	 * 获取首页最热门5个应用
	 * @return  json
	 */
	public function index() {
		$model = D('UserSite');
		$where['siteTempType'] = 1;
		$where['isShare'] = 3;
		$where['id']  = array('in','1405,1404,1402,1391');
		$site_info = $model->where($where)->field('id, siteName, price, thumbPath,siteTempType')->order('id DESC')->limit(4)->select();
		if(count($site_info)==0){
			$site_info = $model->where("siteTempType =1 AND isShare =3")->field('id, siteName, price, thumbPath,siteTempType')->order('id DESC')->limit(4)->select();
		}
		$siteInfo = array();
		foreach ($site_info as $value) {
			$value['priceFormat'] = $value['price'] == '0.00' ? '免费' : '￥' . $value['price'] . '元';
			unset($value['price']);
			array_push($siteInfo, $value);
		}
		unset($value, $site_info);

		$this->assign("siteInfo", $siteInfo);
		$this->display();
	}

	

	
	public function developerCenter(){
		
		
		$this->display();
	}
	
	/**
	 * 获取开发者开发的应用
	 */
	public function getDeveloperCenterList() {
		//页数
		$page=I(" post.page ") ? I(" post.page ") : 1;
		//每页显示行数,默认5行
		$pageCount = 5; 
		//$temp_type = I("post.temp_type");
		$where = array();
		$sites = D('UserSite')->getDeveloperSite();
		
		$userSite = $this->getUserSiteList(1,$page,5);
		echo json_encode($userSite);
	}
	
	/**
	 * 获取开发者应用,不包括待销售与已销售
	 */
	public function getDeveloperSites(){
		//当前页
		$page = I('post.page', '1');
		//每页行数
		$pageCount = 5 ;
		$where = array('userId' => $this->user_id, 'isShare' => '-1', 'orderNo' => array('eq', ''));
		$order = array('addTime desc');
		$userSite = D('UserSite');
		//获取应用
		$sites = $userSite -> getDeveloperSites($where, $order, $page, $pageCount);
		//获取应用总数
		$count = $userSite -> getSiteCount($where);
		$result['totalCount'] = $count;
		$result['sites'] = $sites; 
		echo json_encode($result);
		
	}
	
	/**
	 * 获取开发者已销售应用 
	*/
	public function getDeveloperSitesForSaled(){
		$page = I('post.page', '1');
		$pageCount = 5;
		$where = array('userId' => $this->user_id, 'isShare' => '-1', 'orderNo' => array('neq', ''));
		$order = array('addTime desc');
		
		$userSite = D('UserSite');
		$sites = $userSite -> getDeveloperSites($where, $order, $page, $pageCount);
		$count = $userSite -> getSiteCount($where);
		
		$result['totalCount'] = $count;
		$result['sites'] = $sites;
		echo json_encode($result); 
	}
	
	/**
	 * 获取开发者待销售应用 
	*/
	public function getDeveloperSitesForSaleing(){
		$page = I('post.page', '1');
		$pageCount = 5;
		$where = array('userId' => $this->user_id, 'isShare' => '3', 'orderNo' => array('eq', ''));
		$order = array('addTime desc');
		
		$userSite = D('UserSite');
		$sites = $userSite -> getDeveloperSites($where, $order, $page, $pageCount);
		$count = $userSite -> getSiteCount($where);
		
		$result['totalCount'] = $count;
		$result['sites'] = $sites;
		echo json_encode($result); 
	}
	
	/**
	 * 获取站点列表
	 * @param	int	$temp_type
	 */
	public function getUserSiteList($temp_type = 0,$page=1,$pageRow=5) {
		$where = array('userId' => $this->user_id, 'status' => array('gt', -1), 'siteTempType' => $temp_type);

		$siteList = D('UserSite')->getUserSiteList($where,$page,$pageRow);
		$siteListAll = D('UserSite')->getUserSiteList($where);
		$result = array('total' => count($siteListAll), 'list' => $siteList);
		return $result;
		//echo json_encode($result);exit;
	}
	
		/**
	 * 编辑会员站点信息
	 */
	public function editUserSite() {
		$site_id = intval($_POST['id']);
		$field = isset($_POST['name']) ? trim($_POST['name']) : '';
		$field_value = isset($_POST['value']) ? trim($_POST['value']) : '';
		$fieldArray = array('siteName', 'siteUrlPath', 'domain');

		$result = array('error' => 1, 'info' => '');

		if ($site_id == 0 || empty($field) || empty($field_value) || !in_array($field, $fieldArray)) {
			$result['info'] = '参数错误';
		} else {
			if ($field == 'siteUrlPath') {
				if (preg_match('/^[a-zA-Z0-9]*$/gi', $field_value)) {
					$result['info'] = '名称只能使用字母和数字';
					echo json_encode($result);
					exit;
				}
			} elseif ($field == 'domain') {
				import('ORG.Util.Validate');
				if (!Validate::check($field_value, 'url')) {
					$result['info'] = '域名格式不正确';
					echo json_encode($result);
					exit;
				}
			}

			$site_model = D('UserSite');
			$siteInfo = $site_model->getSiteInfo($site_id);
			if (!$siteInfo) {
				$result['info'] = '站点不存在';
			} else {
				if ($siteInfo[$field] != $field_value) {
					$site_count = M('UserSite')->where(array($field => $field_value))->count();
					if ($site_count) {
						if ($field == 'siteUrlPath') {
							$result['info'] = '域名已经绑定，请使用其他域名';
						} else {
							$result['info'] = '名称已经存在，请使用其他名称';
							
						}
						echo json_encode($result);
						exit;
					}

					$set = array($field => $field_value);
					$status = $site_model->editSite($site_id, $set);
					if (!$status) {
						$result['info'] = '修改失败';
					} else {
						$result['error'] = 0;
						$result['info'] = '修改成功';
					}
				} else {
					$result['error'] = 0;
					$result['info'] = '修改成功';
				}
			}
		}

		echo json_encode($result);
	}
	
		/**
	 * 删除用户创建过的站点
	 */
	public function deleteUserSiteInfo() {
		$site_id = I('post.siteId', 0, 'intval');
		$flag = 0; //1成功 0出错
		$flag = D("UserSite")->deleteSite($site_id);
		if ($flag) {
			M("index_set")->where("siteId = '$site_id'")->delete();
		}
		echo $flag;
		exit;
	}
	/**
	 * 查询模板**/
	public function queryTpl() 
	{
		$post = I('post.');
		$userSite = D('UserSite');
		$tplType = trim($post['tplType']);
		switch ($tplType) 
		{
			case 'officialTpl':
				//官方模板暂时只有微信的模板
					$where['isShare'] = 1;
					$where["siteTempType"] = 1;
				break;
			case'myTpl':
				//ezSite设计者-自己的模板
					$where['isShare'] = 3;
					$where['userId'] = session('uid');
					$where["siteTempType"] = 1;
				break;
			case'tpl':
					//ezSite设计者-空白模板
					$where['isShare'] = 2;
					$where["siteTempType"] = 1;
				break;
			
			default:
					//ezSite设计者-空白模板
					$where['isShare'] = 1;
					$where["siteTempType"] = 1;
				break;
		}
		$templateList = $userSite->getUserSiteListByTplType($where);
		$result = array('TotalCount' => count($templateList), 'list' => $templateList);
		$this->ajaxReturn($result, 'JSON');
	}
	
	/**
	 * 保存名片
	 */
	public function saveBusinessCard(){
		$data = I('post.');
		$Developer =  D('Developer');
		echo $Developer->saveBusinessCard($data);
	}
	
		/**
	 * 邀请好友
	 */
	public function share_friend(){
		$userId = session('uid');
		$arr['user_id']= $userId;
		$userInfo = D("User")->getAUser($arr);
		//print_r($userInfo);
		
		//生成分享邀请码
		$share_num = $userId*C("shareCode");
		
		//邀请链接的二维码
		if($userInfo['shareCode'] == ""){
			$shareCode  = substr(md5($userId), 5, 10);
			$post['shareCode']=  $shareCode;
			$re  = D("User")->updAUser($userId,$post);
		}else{
			$shareCode = $userInfo['shareCode'];
		}
		
		//已经邀请的数量
		$shareCount = M("users")->where("parent='$userId'")->count();
		
		$this->assign("shareCount",$shareCount);
		$this->assign("serverName",$_SERVER['HTTP_HOST']);
		$this->assign("shareNum",$share_num);
		$this->assign("shareCode",$shareCode);
		
		
		//
		$this->display();
	}
	

	/**
	 * 基本信息
	 */
	function member_center() {
		$userInfo = $this->getUserDetailInfo();
		if ($userInfo) {
			$userInfo["userPhoto"] = explode("@", $userInfo["userPhoto"]);
			$userInfo["userPhoto"] =$userInfo["userPhoto"][0];
			$this->assign("userInfo", $userInfo);
		}
		$this->display();
	}
	
	/**
	 * 返回用户详细信息
	 * @return 	json	返回用户详细的信息
	 */
	public function getUserDetailInfo() {
		$condition['user_id'] = $this->user_id;

		return D('User')->getAUser($condition);
		//echo json_encode_cn( D('User') -> getAUser($condition));
	}
	public function saveBaseInfo(){
		$uid = $this->user_id;
		$post = I("post.");
		$re = D("users")->where("ID=$uid")->save($post);
		echo $re;
	}
	
	/**
	 * 保存认证信息
	 */
	  public function saveValidInfo(){
	  	$post = I("post.","","addslashes");
	  
		$uid = $this->user_id;
		
		//描述存其他的表
	  	$data['introduction'] 	= $post['describeText'];
	  	$data['experience'] = $post['experienceText'];
	  	$data['familiarlist'] = $post['familiarlist'];
		$data['create_time'] = time();
		$data["create_user"] = $uid;
	  	unset($post['describeText'],$post['experienceText'], $post['familiarlist']);
	   $re = 	D("User")->updateUserInfo($this->user_id,$post);
	  	
	  	//更新个人经验 描述等
		$re = M("business_card")->where("create_user=$uid")->getField("create_user");
	  	if($re){
			$res2 = M("business_card")->where("create_user=$uid")->save($data);
	  	}else{
	  		$res2 = M("business_card")->add($data);
	  	}

		if($re && $res2){
			echo 1;
		}else{
			echo 0;
		}
	  }
	  
	  public function baseInfo(){
	  	
		$condition['user_id'] = $this->user_id;
		$userInfo = D('User')->getAUser($condition);
		if($userInfo['isValidated']==2){
			$this->redirect("Developer/member_center");
		}
		$this->display();
	  }
	  
	  	/*
	 * 自己邀请的好友列表
	 * 
	 * */
	public function getMyShares(){
		$userId = session('uid');
		$my_friends = D("User")->getMyFriends($userId);
		$friendNum  = count($my_friends);
		$result["totalCount"]  = $friendNum;
		$result["items"] =$my_friends;  
		echo json_encode_cn($result);
	}

	//获取baes64位图片保存
	public function base64() {
		$img_data = I('param.image-data');
		$info_id = I('param.id', 0, 'intval');
		$type = I('param.type');
		$setting = C('PICTURE_UPLOAD');

		$return = array(
			'status' => 'error',
			'info' => '',
		);

/*	$file = 'C:/wamp/www/diy/logo3-03.jpg';
//取得图片的大小，类型等
$type = getimagesize($file);
$fp = fopen($file, "rb") or die("Can't open file");
$file_content = chunk_split(base64_encode(fread($fp, filesize($file))));
fclose($fp);
//base64编码
switch($type[2]) {//判读图片类型
case 1 :
$img_type = "gif";
break;
case 2 :
$img_type = "jpg";
break;
case 3 :
$img_type = "png";
break;
}
//合成图片的base64编码
$img = 'data:image/' . $img_type . ';base64,' . $file_content;
//echo $img;exit;
 */
		$config = C('PICTURE_UPLOAD');

		preg_match('/^(data:\s*image\/(\w+);base64,)/', $img_data, $result);
		$new_file = $config['rootPath'] . date('Y/m/d') . '/' . uniqid() . "." . $result[2];
		
		
		file_write($new_file, base64_decode(str_replace($result[1], '', $img_data)));
		if (!is_file($new_file)) {
			$return['info'] = '上传失败';
		} else {
			
			$tmp = ROOT_PATH . '/' . ltrim($new_file, './');
			$_FILES['img'] = array(
				'name' => $filename,
				'type' => 'image/' . $result[2],
				'tmp_name' => $tmp,
				'error' => 0,
				'size' => filesize($tmp),
			);
			dump($tmp);
			$info = $this->_upload('', false);
			dump($info);exit;
			if ($info['error']) {
				$this->ajaxError($info['info']);
			} else {
				@unlink($tmp);
				$this->ajaxSuccess($info['info'][0]);
			}
		}
	
		//echo $this->ajaxReturn($return);
	}
	  
	 
}
	