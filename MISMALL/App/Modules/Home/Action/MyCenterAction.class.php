<?php
/**
 * 个人中心模块控制器
 * 接收个人中心中操作方法数据
 */
class MyCenterAction extends HomeAction {
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
			$this->redirect("Index/index");
		}

		if (in_array(I('session.uid'), array(28, 1, 6, 2, 128, 24))) {
			$url_dev = '<div id="btn_dev">设计者</div>';
			$this->assign("developPage", $url_dev);
		}
	}

	/**
	 * 生成 apk 应用
	 */
	public function build_app() {
		$app_id = I('get.id', 0, 'intval');

		$app_info = D('App')->getAAppInfo($app_id);

		$this->assign("app_id", $app_id);
		$this->assign("app_title", $app_info['appName']);
		$this->assign("user_name", session('uname'));
		$this->assign("app_icopath", $app_info['icoPath']);
		$this->display();
	}

	/**
	 * 获取用户订单数量
	 * @param	int		$user_id 当前登录用户ID
	 * @param	int		$order_status 订单状态
	 * @return	int 	返回用户订单数量
	 */
	public function getUserAllOrderNum($order_status) {
		//$order_status = I('post.order_status', 0, 'intval');

		$where = array('userID' => $this->user_id);

		if ($order_status) {
			$where['orderStatus'] = $order_status - 1;
		}

		return D('TradeInfo')->getUserOrderNum($where);
	}

	/**
	 * 获取用户订单信息
	 * @param	int		$user_id 当前登录用户ID
	 * @param	int		$order_status 订单状态
	 * @param	int		$page_index 当页开始记录数
	 * @return	json 	返回用户订单信息
	 */
	public function getUserAllOrderInfo($order_status, $page_index = 1) {
		//$order_status = I('post.order_status', 0, 'intval');
		//$page_index = I('post.page_index', 0, 'intval');

		$where = array('userID' => $this->user_id);

		if ($order_status) {
			$where['orderStatus'] = $order_status - 1;
		}
		$orderList = D('TradeInfo')->getUserOrderList($where, $page_index);
		return $orderList;
		//echo json_encode_cn( $orderList );
	}

	/**
	 * 删除单个订单信息
	 * @param	int		$order_id 需要删除的订单
	 * @return	int		返回订单删除状态
	 */
	public function delAUserOrderInfo() {
		$order_id = I('post.order_id', 0, 'intval');

		echo D('TradeInfo')->deleteUserOrder($order_id);
	}

	/**
	 * 获取部署应用数量
	 * @param	int		$user_id 当前用户ID
	 * @return	int		返回用户部署应用数
	 */
	public function getUserAllAppNum() {
		$user_id = session('uid');

		return count(D('App')->getUserAllAppList($user_id));
	}

	/**
	 * 获取部署应用信息
	 * @param	int		$user_id 当前用户ID
	 * @return	json	返回用户部署应用json信息
	 */
	public function getUserAllAppList() {
		$user_id = session('uid');

		return D('App')->getUserAllAppList($user_id);

		//echo json_encode_cn( D('App') -> getUserAllAppList($user_id));
	}

	/**
	 * 获取我发布的项目的总数
	 * @param	int		$user_id 当前用户ID
	 * @return	int		返回当前用户发布的项目总数
	 */
	public function getUserProjectsReleaseNum() {
		return D('MyCenter')->getUserProjectsReleaseNum($this->user_id);
	}

	/**
	 * 获取我发布的项目的信息
	 * @param	int		$user_id 当前用户ID
	 * @param	int		$page_index 当页开始记录数
	 * @return array	返回当前用户发布的项目信息
	 */
	public function getUserProjectsReleaseInfo() {
		//$page_index = I('post.page_index', 0, 'intval');

		return D('MyCenter')->getUserProjectsReleaseInfo($this->user_id);
		//echo json_encode_cn( D('MyCenter') -> getUserProjectsReleaseInfo( $this->user_id , $page_index));
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

	/**
	 * 修改用户密码
	 * @param	string	$oldpwd 旧密码
	 * @param	string	$newpwd 新密码
	 * @return	boolen	修改成功返回1，失败返回0
	 */
	public function updUserPwd() {
		$oldpwd = I('post.oldpwd', '', 'trim');
		$newpwd = I('post.newpwd', '', 'trim');

		echo D('User')->updUserPwd($this->user_id, $oldpwd, $newpwd);
	}

	/**
	 * 验证邮箱可用性
	 * @param	string	$email 邮箱
	 * @return	int	0是失败,1是成功 2是存在
	 */
	public function checkUserEmail() {
		$email = I('post.email', '', 'trim');

		//return	string	存在返回false, 可用返回true
		$isBool = D('User')->checkUserEmail($email);
		if ($isBool) {
			echo D('User')->updUserEmail($this->user_id, $email);
		} else {
			echo 2;
		}
	}

	/**
	 * 验证用户名
	 * @param	string	$userName 邮箱
	 * @return	int	0是失败,1是成功 2是存在
	 */
	public function checkUserName() {
		$userName = I('post.userName', '', 'trim');

		//return	string	存在返回false, 可用返回true
		$isBool = D('User')->checkUserNameAt($userName);

		if ($isBool === 'true') {
			echo D('User')->updUserName($this->user_id, $userName);
		} else {
			echo 2;
		}
	}

	/**
	 * 修改用户邮箱 --作废
	 * @param	int		$user_id 当前用户ID
	 * @param	string	$email 用户注册邮箱
	 * @return	boolean	修改成功返回1，失败返回0
	 */
	public function updUserEmail() {
		$email = I('post.email', '', 'trim');

		echo D('User')->updUserEmail($this->user_id, $email);
	}

	/**
	 * 获取分享模板总数
	 */
	public function getShareTemplateCount() {
		$where = array('userId' => $this->user_id, 'status' => array('gt', -1), 'isShare' => array('gt', -1));

		return D('UserSite')->getUserSiteCount($where);
	}

	/**
	 * 获取用户分享的模板
	 */
	public function getShareTemplateList() {
		$model = D('UserSite');
		$where = array('userId' => $this->user_id, 'status' => array('gt', -1), 'isShare' => array('gt', -1));

		$pageRow = 6;
		$page_index = I('post.page_index', 1, 'intval');

		$templateList = $model->getUserSiteList($where, $page_index, $pageRow);

		//dump($result);exit;
		return $templateList;
		//echo json_encode($templateList);
	}

	/**
	 * 删除模板
	 */
	public function deleteShareTemplate() {
		$tpl_id = I('post.id', 0, 'intval');
		if (!$tpl_id) {
			echo 0;
			exit;
		}

		echo D('UserSite')->deleteSite($tpl_id);
	}

	/**
	 * 获取模板信息
	 */
	public function getShareTemplateInfo() {
		$tpl_id = I('post.id', 0, 'intval');
		if (!$tpl_id) {
			echo 0;
			exit;
		}

		$model = D('UserSite');
		$template_category_list = $model->getUserSiteCategoryTree(0, 'id,parentId,nameCN,nameEN,nameTW');

		$tplInfo = $model->getSiteInfo($tpl_id, null, true);
		$tplColors = C('TEMPLATE_COLOR');

		$result = array('info' => $tplInfo, 'cate' => $template_category_list, 'color' => $tplColors);

		echo json_encode($result);
	}

	/**
	 * 编辑模板信息
	 */
	public function editShareTemplate() {
		$tpl_id = I('post.id', 0, 'intval');
		if (!$tpl_id) {
			echo 0;
			exit;
		}
		$set['siteName'] = I('post.title');
		$set['siteCategoryId'] = I('post.catid', 0);
		$set['colorId'] = I('post.color', 0);
		$set['price'] = I('post.price');

		$result = array('error' => 1, 'message' => '');

		import('ORG.Util.Validate');

		if (!Validate::check($set['price'], 'currency')) //验证格式
		{
			$result['message'] = L('price_format_error');
		} elseif ($set['siteName'] == '') {
			$result['message'] = '模板名称不能为空';
		} else {
			$status = D('userSite')->editSite($tpl_id, $set);
			if ($status) {
				$result['error'] = 0;
			} else {
				$result['message'] = '分享保存数据时失败！';
			}
		}
		echo json_encode($result);
		exit;
	}

	/**
	 * 获取站点列表
	 * @param	int	$temp_type
	 */
	public function getUserSiteList($temp_type = 0) {
		$where = array('userId' => $this->user_id, 'status' => array('gt', -1), 'siteTempType' => $temp_type);

		$siteList = D('UserSite')->getUserSiteList($where);
		$result = array('total' => count($siteList), 'list' => $siteList);
		return $result;
		//echo json_encode($result);exit;
	}
	
	/*
	 * 获取出售的站点
	 * */
	 public function getUserSalingSiteList($temp_type = 0) {
		$where = array('userId' => $this->user_id, 'status' => array('gt', -1), 'siteTempType' => $temp_type);

		$siteList = D('UserSite')->getUserSalingSiteList($where);
		$result = array('total' => count($siteList), 'list' => $siteList);
		return $result;
		//echo json_encode($result);exit;
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
							$result['info'] = '名称已经存在，请使用其他名称';
						} else {
							$result['info'] = '域名已经绑定，请使用其他域名';
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
	 * 上传用户头像
	 */
	public function uploadAvatar() {
		if (IS_POST) {
			$result = array('error' => 1, 'message' => '');
			
			$fileList = $this->_upload(C('AVATAR_UPLOAD'));

			if ($fileList['error']) {
				$result['message'] = $fileList['info']; //上传错误
			} else {
				$result['error'] = 0;
				$result['imgUrl'] = $fileList['info'][0]['url'];
			}
			echo json_encode($result);
		} else {
			$this->display();
		}
	}

	/**
	 * 上传用户头像裁剪
	 */
	function uploadAvatarSave() {
		$post = I('post.');

		$result = array('error' => 1, 'message' => '');

		$x1 = intval($post['x1']);
		$y1 = intval($post['y1']);
		$x2 = intval($post['x2']);
		$y2 = intval($post['y2']);
		$w = intval($post['w']);
		$h = intval($post['h']);

		//100*100头像
		$avatar = $post['pic'] . '@' . $x1 . '-' . $y1 . '-' . $w . '-' . $h . 'a';

		/*
		$image = basename($post['pic']);
		$picArr = explode('.', $image);
		$type = $picArr[1];
		$avatar = picArr[0] . '100_100.' . $type;
		importORG('Image');

		$srcImg = C('UPLOAD_PATH') . $image;
		$dstImg = C('UPLOAD_PATH') . $avatar;

		if (!file_exist($srcImg)) {
		$result['message'] = '图片不存在';
		echo json_encode($result);
		exit;
		} elseif (file_exist($dstImg)) {
		file_delete($dstImg);
		}

		Image::crop($srcImg, $dstImg, $w, $h, '', $x1, $y1, $w, $h);

		if (!file_exist(C('UPLOAD_PATH') . $avatar)) {
		$result['message'] = '生成图片失败';
		echo json_encode($result);
		exit;
		}*/

		//入库

		D('User')->updAUser($this->user_id, array('userPhoto' => $avatar));
		$result['error'] = 0;
		$result['imgUrl'] = $avatar;

		echo json_encode($result);
	}

	/**
	 * 基本信息
	 */
	function member_center() {
		$userInfo = $this->getUserDetailInfo();
		if ($userInfo) {
			$this->assign("userInfo", $userInfo);
		}
		$this->display();
	}

	/**
	 * 获取用户基本信息
	 */
	function getUserInfo() {
		$userInfo = $this->getUserDetailInfo();

		echo json_encode_cn($userInfo);
	}

	/**
	 * 网站作品
	 */
	function web_case() {
		$userSite = $this->getUserSiteList(0);

		if ($userSite) {
			$this->assign("siteNum", $userSite["total"]);
			$this->assign("userSite", $userSite["list"]);
		}

		$this->display();
	}

	/**
	 * 微企应用
	 */
	function web_wx() {
		$userSite = $this->getUserSiteList(1);
		
		print_r($this->getUserSiteList(1));
		if ($userSite) {
			$this->assign("siteNum", $userSite["total"]);
			$this->assign("userSite", $userSite["list"]);
		}

		$this->display();
	}

	function my_viewget() {
		$userSite = $this->getUserSiteList(3);

		if ($userSite) {
			$this->assign("siteNum", $userSite["total"]);
			$this->assign("userSite", $userSite["list"]);
		}

		$this->display();
	}

	/**
	 * 修改应用图片
	 * @param	int	$siteId
	 * @param	string	$imgData
	 * @return	boolean
	 */
	public function updateASiteImg() {
		$site_id = I('post.siteId', 0, 'intval');
		$img_data = I('post.imgData', '', 'trim');
		//D('Wechat')->updateAppIcon($site_id,$img_data);
		echo D('UserSite')->updateASiteImg($site_id, $img_data);
	}

	function buy_wq() {
		$where = array('userId' => $this->user_id, 'orderNo' => array('neq', ''), 'isShare' => -1, 'siteTempType' => 1);
		$list = D('UserSite')->getUserSiteList($where);
		//dump($list);exit;
		$this->assign('buySiteSum', count($list));
		$this->assign('list', $list);
		$this->display('buy_wq');
	}

	public function bindWechat() {
		$site_id = I('get.id', 0, 'intval');
		$pro_id = I('get.proId', 0, 'intval');

		$this->assign('site_id', $site_id);
		$this->assign('pro_id', $pro_id);
		$this->display('bind_wechat');
	}

	public function bindWechatPost() {
		$site_id = I('post.id', 0, 'intval');
		$type = I('post.type', 0, 'intval');
		$user_id = session('uid');

		$siteInfo = D('UserSite')->getSiteInfo($site_id);
		if (!$siteInfo) {
			echo '-1';exit;
		}

		switch ($type) {
			//企业号
			case 1:
				$wechat_id = session('qyWechatId');
				//create qy wechat account
				if (!$wechat_id) {
					$wechat_id = D('Apps/Wechat')->addAccount(1);
					//平台用户关联企业号
					$affect = M('Users')->where(array('ID' => $user_id))->save(array('qyWechatId' => $wechat_id));
					if (!$affect) {
						echo 'error';exit;
					}
					session('qyWechatId', $wechat_id);
				}
				//bind wechat app
				$set = array(
					'name' => $siteInfo['siteName'],
					'icon' => $siteInfo['thumbPath'],
					'appId' => $site_id,
					'description' => $siteInfo['siteDescription'],
				);
				$qyAppId = D('Apps/WechatQy')->editQyWechatApp($wechat_id, $set);
				//echo $status ? 'success' : 'error';exit;
				if (!$qyAppId) {
					echo 'error';exit;
				}
				break;
			case 2:
				$wechat_id = C('SUPPER_WECHAT_ID');
				//生成微信公众号应用
				$set = array(
					'name' => $siteInfo['siteName'],
					'icon' => $siteInfo['thumbPath'],
					'siteId' => $site_id,
					'description' => $siteInfo['siteDescription'],
				);
				$qyAppId = D('Apps/Wechat')->editWechatApp($wechat_id, $set);

				session('wechatId', $wechat_id);
				//echo $status ? 'success' : 'error';exit;
				if (!$qyAppId) {
					echo 'error';exit;
				}
				break;
			//公众号
			default:
				//$wechat_id = session('wechatId');
				//create qy wechat account
				//if ( ! $wechat_id ) {
				$wechat_id = D('Apps/Wechat')->addAccount();
				//平台用户关联公众号
				//	$affect = M('Users')-> where( array('ID' => $user_id) )-> save( array('wechatId' => $wechat_id));
				//	if( ! $affect) {
				//		echo 'error';exit;
				//	}
				session('wechatId', $wechat_id);
				//}
				//生成微信公众号应用
				$set = array(
					'name' => $siteInfo['siteName'],
					'icon' => $siteInfo['thumbPath'],
					'siteId' => $site_id,
					'description' => $siteInfo['siteDescription'],
				);
				D('Apps/Wechat')->editWechatApp($wechat_id, $set);

				$wxusername = I('post.user');
				$wxpassword = I('post.pwd');
				$verify = I('post.verify');
				if ($wxusername && $wxpassword && $verify) {
					$affect = D('Apps/Wechat')->autoBind($wechat_id, $wxusername, $wxpassword, $verify);
					if ($affect != '1') {
						echo $affect;exit;
					}
				}
				$qyAppId = 0;
				break;
		}

		//微企应用添加菜单URL到微信菜单表
		/*$action = A('Qywx/Editor');
		$content = $action->getTempaltePageContent('qyConfig', $site_id);
		if ($content) {
		$menuList = json_decode(urldecode($content));
		foreach ($menuList as $pageId => $menu) {
		$set = array(
		'url' => U('/Site/Wechat/checkUser', array('pageId' => $pageId, 'siteId' => $site_id)),
		'name' => $menu->menuName,
		'type' => isset($menu->type) ? $menu->type : 'view',
		'key' => isset($menu->key) ? $menu->key : '',
		'pid' => 0,
		'qyAppId' => $qyAppId,
		'WeId' => $wechat_id,
		);
		$pid = D('Apps/WechatMp')->editMenu($set);
		if (isset($menu->subMenu) && $menu->subMenu) {
		foreach ($menu->subMenu as $subPage => $subMenu) {
		$set = array(
		'url' => U('/Site/Wechat/checkUser', array('pageId' => $subPage, 'siteId' => $site_id)),
		'name' => $subMenu->menuName,
		'type' => isset($subMenu->type) ? $subMenu->type : 'view',
		'key' => isset($subMenu->key) ? $subMenu->key : '',
		'pid' => $pid,
		'qyAppId' => $qyAppId,
		'WeId' => $wechat_id,
		);
		D('Apps/WechatMp')->editMenu($set);
		}
		}
		}
		}*/

		$affect = D('UserSite')->editSite($site_id, array('wechatId' => $wechat_id));
		session('ez_site_id', $site_id);
		echo 'success';exit;
	}

	/**
	 * 修改密码
	 */
	function password() {
		$this->display();
	}

	/**
	 * 购买的网站
	 */
	function buy_site() {
		$where = array('userId' => $this->user_id, 'orderNo' => array('neq', ''), 'isShare' => -1, 'siteTempType' => 0);

		$buySitelist = D('UserSite')->getUserSiteList($where);

		$this->assign("buySiteSum", count($buySitelist));
		$this->assign("buySitelist", $buySitelist);

		$this->display();
	}

	/**
	 * 购买的应用--ezForm
	 */
	function buy_apply() {

		//$appNum = $this -> getUserAllAppNum();

		//应用列表
		$appList = $this->getUserAllAppList();
		//应用数量
		$this->assign("appNum", count($appList));
		$this->assign("appList", $appList);

		$this->display();
	}

	/**
	 * 发布的应用
	 */
	function publish_apply() {
		$releaseNum = $this->getUserProjectsReleaseNum();
		$releaseInfo = $this->getUserProjectsReleaseInfo();

		$this->assign("releaseNum", $releaseNum);
		$this->assign("releaseInfo", $releaseInfo);

		$this->display();
	}

	/**
	 * 出售的模板
	 */
	function sale_template() {
		//数量
		$saleNum = $this->getShareTemplateCount();
		$this->assign("saleNum", $saleNum);

		//列表
		if ($saleNum) {
			$saleList = $this->getShareTemplateList();
		}
		$this->assign("saleList", isset($saleList) ? $saleList : array());

		$this->display();
	}

	/**
	 * 我的订单
	 */
	function my_order() {
		//所有订单数量
		$orderAllNum = $this->getUserAllOrderNum(0);
		$this->assign("orderAllNum", $orderAllNum);

		//待付款数量
		$orderStayNum = $this->getUserAllOrderNum(1);
		$this->assign("orderStayNum", $orderStayNum);
		//已付款数量
		$orderHasNum = $this->getUserAllOrderNum(2);
		$this->assign("orderHasNum", $orderHasNum);
		//即将到期数量
		$orderExpireNum = $this->getUserAllOrderNum(3);
		$this->assign("orderExpireNum", $orderExpireNum);

		//所有订单
		$orderAllInfo = $this->getUserAllOrderInfo(0, 1);
		$this->assign("orderAllInfo", $orderAllInfo);
		/*
		//待付款
		$orderStayInfo = $this -> getUserAllOrderInfo(1);
		$this -> assign("orderStayInfo", $orderStayInfo);
		//已付款
		$orderHasInfo = $this -> getUserAllOrderInfo(2);
		$this -> assign("orderHasInfo", $orderHasInfo);
		//即将到期数量
		$orderExpireInfo = $this -> getUserAllOrderInfo(3);
		$this -> assign("orderExpireInfo", $orderExpireInfo);*/

		//print_r($orderAllInfo);
		$this->display();
	}

	//ajax获取订单列表
	function ajaxGetOrderList() {
		//$status = I('post.status', 0, 'intval');
		$paytype = I('post.paytype');
		switch ($paytype) {
			case 'noplay':
				$status = 1;
				break;
			case 'alplay':
				$status = 2;
				break;
			case 'expiring':
				$status = 3;
				break;
			case 'allorders':
			default:
				$status = 0;
				break;
		}
		$page = I('post.page', 1, 'intval');
		$list = $this->getUserAllOrderInfo($status, $page);
		echo json_encode($list);
	}

	//查找支付记录 ljp
	function getPayInfo() {
		$user_id = session('uid');
		$db = M('pay_record');
		$record = $db->where("userID='$user_id'")->field('payTime, payStatue, payMoney,payFrom')->select();
		echo json_encode_cn($record);
	}

	public function payrecord() {
		$this->display();
	}

	/**
	 * 流程应用
	 */
	function flow_apply() {
		$user_id = $this->user_id;
		$proType = 'ezFlow';
		$flowType = 1;

		$proList = D('FlowInterface')->getUserFlowProjectList($user_id, $proType, $flowType);

		$this->assign("proList", $proList);
		if ($proList) {
			$this->assign("proNum", count($proList));
		} else {
			$this->assign("proNum", 0);
		}

		$this->display();
	}

	/**
	 * 获取流程项目公共接口地址
	 */
	function getStayPath() {
		$proId = I("post.proId", 0, 'intval');

		if (!proId) {
			return 0;
		}

		$info = D("FlowInterface")->getStayPathByProId($proId);
		echo json_encode_cn($info);
	}

	/**
	 * 获取待审核关联标识
	 */
	function getUserInterface() {
		$userId = I("session.uid", 0, 'intval');
		$proId = I("post.proId", 0, 'intval');

		$user_pro = D("FlowInterface")->getUserInterface($userId, $proId);

		echo json_encode_cn($user_pro);
	}

	/**
	 * 使用用户已购买应用
	 * @param	int		$app_id 应用ID
	 * @return boolean
	 */
	public function useAApp() {
		$app_id = I('post.appid', 0, 'intval');
		session('pid', $app_id);
		session('front_view', 'site_app');
		$is_admin = D('User')->getUserRoleManage(session('uid'), $app_id);
		session('is_admin', $is_admin);

		echo isMobile() ? 1 : 0;
	}

	/**
	 * 生成应用二维码
	 */
	public function buildApp() {
		$app_id = I('post.app_id', 0, 'intval');
		$img_url = I('post.img_url', '', 'trim');

		echo D('Project')->updQRImg($app_id, $img_url);
	}

	/**
	 * 删除指定部署应用
	 * @param	int		$app_id 应用ID
	 * @return boolean
	 */
	public function delAUserApp() {
		$app_id = I('post.appid', 0, 'intval');

		echo D('App')->delAUserApp($app_id);
	}

	/**
	 * 删除指定发布项目
	 * @param	int		$pub_id 发布ID
	 * @return boolean
	 */
	public function delAReleaseProject() {
		$pub_id = I('post.pubid', 0, 'intval');

		echo D('Project')->delAReleaseProject($pub_id);
	}

	/*
	 * 个人中心分购买者和开发者
	 *  我卖出的订单
	 * */
	public function my_sale() {

		//$userSite = $this->getSaledOrder();
		//print_r($userSite);
		//$re = D("Project")->getSaledOrder();
		//$this->assign("re", $re);
		$this->display();
	}

	/*
	 *
	 *
	 *
	 * */
	public function my_saling() {
		$userSite = $this->getUserSalingSiteList(1);
		//$userSite = $this->getSaledOrder();
		//print_r($userSite);
		//$re = D("Project")->getSaledOrder();
		$this->assign("siteNum",$userSite['total']);
		$this->assign("userSite", $userSite["list"]);
		$this->display();
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

	/*
	 * 获取用户已经卖出的订单
	 * @p19aram u
	 *
	 *
	 * */
	public function getSaledOrder() {
		$uid = session("uid");
		return D("Project")->getSaledOrder();

	}
	
	/*
	 * 自己邀请的好友列表
	 * 
	 * */
	public function my_shares(){
		$userId = session('uid');
		$my_friends = D("User")->getMyFriends($userId);
		$friendNum  = count($my_friends);
		$result["friendNum"]  = $friendNum;
		$result["friends"] =$my_friends;  
		$this->assign("friendNum",$friendNum);
		$this->assign("friends",$my_friends);
		$this->display();
	}
}
?>