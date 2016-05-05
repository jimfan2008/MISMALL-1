<?php

/**
 * 应用市场模块控制器
 * Time:20140210
 */
class AppStoreAction extends HomeAction {

	public function index() {
		$type = I('get.type', 1, 'intval');
		//$type 1:form,2:size,3:app,4:flow
		if (!in_array($type, array(1, 2, 3, 4, 5))) {
			$type = 1;
		}

		switch ($type) {
			//site
			case 2:{
					$template_category_list = D('UserSite')->getUserSiteCategoryTree(0, 'id,parentId,nameCN,nameEN,nameTW');
					$this->assign('template_category_list', $template_category_list);
					break;
				}
			//app
			case 3:{

					break;
				}
			//flow
			case 4:{

					break;
				}
			//wechat app
			case 5:{
					$this->assign('template_category_list', array());
					break;
				}

			//form
			case 1:
			default:{

				}

		}

		if (in_array(I('session.uid'), array(28, 1, 6, 2, 128, 24))) {
			$url_dev = '<div id="btn_dev">设计者</div>';
			$this->assign("developPage", $url_dev);
		}
		$this->assign('user_id', I('session.uid', 0));
		$this->assign('shop_type', $type);
		$this->display();
	}

	/**
	 * 详情页
	 */
	public function shop_detail() {
		$siteId = I('get.id', 0, 'intval');

		$tobj = new Model();
		$appUser = D('UserSite')->getSiteInfo($siteId, 'user_name');
		$userAppList = $tobj->table(C('DB_PREFIX') . 'user_site')->where("isShare=3 and siteTempType=1 and user_name='$appUser' and id<>$siteId")
		                    ->field('id, siteName, thumbPath')->order('addTime DESC')->select();

		$this->assign('id', $siteId);
		//print_r($userAppList);
		$this->assign('userAppList', $userAppList);
		$this->display();
	}

	/**
	 * 获取单个发布项目的详细信息
	 * @param	int		$id 项目的发布ID
	 * @return	json	返回单个项目的详细 json 数据
	 */
	public function getAReleaseProjectInfo() {
		$site_id = I('param.id', 0, 'intval');
		
		$siteInfo = D('AppStore')->getAReleaseProjectInfo($site_id);

		echo json_encode_cn($siteInfo);
	}

	/**
	 * 获取发布应用的评论总数
	 * @param	int		$id 发布的项目ID
	 * @param	int		$comment_display 显示评论的级别筛选
	 * @return int		返回评论信息总数
	 */
	public function getAReleaseProjectCommentNum() {
		$id = I('post.id', 0, 'intval');
		$comment_display = I('post.comment_display', 0, 'intval');

		echo D('AppStore')->getAReleaseProjectCommentNum($id, $comment_display);
	}

	/**
	 * 获取发布应用的评论信息
	 * @param	int		$id 发布的项目ID
	 * @param	int		$comment_display 显示评论的级别筛选
	 * @return json		返回评论信息的 json 数据
	 */
	public function getAReleaseProjectCommentInfo() {
		$id = I('post.id', 0, 'intval');
		$comment_display = I('post.comment_display', 0, 'intval');

		echo json_encode_cn(D('AppStore')->getAReleaseProjectCommentInfo($id, $comment_display));
	}

	/**
	 * 存储用户对发布应用的评论信息
	 * @param	string		$user_name 评论用户
	 * @param	int			$id siteId
	 * @param	int			$comment_grade	评论级别 3-差评 2-中评 1-好评
	 * @param	string		$comment_content 评论内容
	 * @return	int			返回评论成功保存标识
	 */
	public function saveUserComment() {
		$user_name = session('uname');
		$id = I('post.id', 0, 'intval');
		$comment_grade = I('post.comment_grade', 1, 'intval');
		$comment_content = I('post.comment_content', '', 'trim');

		echo D('AppStore')->saveUserComment($user_name, $id, $comment_grade, $comment_content);
	}

	/**
	 * 提交用户订单信息
	 * @param	int		$id 发布项目的ID
	 * @param	float	$app_price 购买应用单价
	 * @param	int		$user_id 购买用户的ID
	 * @param	int		$user_num 购买应用使用人数
	 * @param	int		$day_num 购买应用使用天数
	 * @return	int		返回订单保存成功标识
	 */
	public function saveUserOrderInfo() {
		$user_id = session('uid');
		$id = I('post.id', 0, 'intval');
		$app_price = I('post.app_price', '0.00', 'floatval');
		$user_num = I('post.user_num', 1, 'intval');
		$day_num = I('post.day_num', 1, 'intval');

		echo D('TradeInfo')->saveUserOrderInfo($id, $app_price, $user_id, $user_num, $day_num);
	}

	/**
	 * 获取单个订单的详细信息
	 * @param	int		$order_id 订单ID
	 * @return	json 	返回单个订单的详细json信息
	 */
	public function getAOrderDetails() {
		$order_id = I('post.tid', 0, 'intval');

		echo json_encode_cn(D('TradeInfo')->getUserOrderInfo($order_id));
	}

	/**
	 * 获取当前应用市场中销量最多的应用
	 * @return	json 	返回应用的基本json信息
	 */
	public function getHottestAppInfo() {
		echo json_encode_cn(D('AppStore')->getHottestAppInfo());
	}

	/**
	 * 部署应用程序 订单支付成功后执行方法
	 * @param	int		$user_id  部署用户
	 * @param	string	$order_no 部署的订单号
	 * @return	boolean	返回订单部署成功标识
	 */
	public function deplayAApp() {
		$order_no = I('get.orderNo', '', 'trim');
		$user_id = I('session.uid');

		$app_id = D('Project')->deplayAApp($user_id, $order_no);

		if ($app_id) {
			echo '<script>window.location="http://www.wclouds.net/MyCenter/build_app?id=' . $app_id . '";</script>';
		} else {
			echo '<script>window.location="http://www.wclouds.net/MyCenter/my_order";</script>';
		}
	}

	/**
	 * 试用应用项目
	 * @param	int		$pub_id 试用项目的发布ID
	 * @return	boolean	返回部署成功标识
	 */
	public function tryAProject() {
		$pub_id = I('post.pubid', 0, 'intval');

		echo D('Project')->tryAProject($pub_id);
	}

	/*
	 * 微观的应用市场
	 *
	 * */
	public function viewget_shop() {
		$shop_type = I("type", "", "trim");
		$viewGetList = D('UserSite')->getViewGetApp();

		$this->assign("shop_type", $shop_type);
		$this->assign("viewGetList", $viewGetList);

		$this->display("viewget_shop");
	}

	public function qrcode() {
		$site_id = I('param.siteId', 0, 'intval');

		$siteInfo = D('UserSite')->getSiteInfo($site_id);
		if (!($siteInfo && $siteInfo['wechatId'])) {
			exit;
		}

		$wechat_id = $siteInfo['wechatId'];

		//获取应用信息
		$weiInfo = D('Apps/Wechat')->getInfoById($wechat_id);
		if (!($weiInfo && $weiInfo['app_id'] && $weiInfo['app_secret'])) {
			exit;
		}

		//获取应用信息
		$appInfo = D('Apps/Wechat')->getAppInfoBySiteId($wechat_id, $site_id);
		if (!$appInfo) {
			exit;
		}

		$agentid = intval($appInfo['agentId']);
		if ($agentid === 0) {
			exit;
		}

		importORG('Wechat.WechatBase');
		importORG('Wechat.Qrcode');
		$qrcode = new Qrcode($weiInfo['app_id'], $weiInfo['app_secret']);
		//Array ( [ticket] => gQFf8ToAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xLzRVd1JPR0RtZTkwQ2g0YTJUbURPAAIEUrSnVAMEAAAAAA== [url] => http://weixin.qq.com/q/4UwROGDme90Ch4a2TmDO )
		$response = $qrcode->create($agentid);
		if ($response === FALSE) {
			echo $qrcode->getErrorInfo();
			exit;
		}

		$res = $qrcode->show($response['ticket']);
		if ($res === FALSE) {
			echo $res->getErrorInfo();
			exit;
		}

		//ob_clean();
		Header("Content-type: image/jpeg");
		exit($res['content']);
	}
	
	public function confirmorder(){
		$site_id = I('param.id', 0, 'intval');
		$uid = session("uid");
		if(empty($uid)){
			$this->redirect("Unregistered/login");
		}
		$siteInfo = D('AppStore')->getAReleaseProjectInfo($site_id);
		$this->assign("siteInfo",$siteInfo);
		$this->display();
	}
	
	public function confirmbuy(){
		if($_POST){
			$user_id = session('uid');
			$id = I('post.id', 0, 'intval');
			$app_price = I('post.app_price', '0.00', 'floatval');
			$user_num = I('post.user_num', 1, 'intval');
			$day_num = I('post.day_num', 1, 'intval');
			echo D('TradeInfo')->saveUserOrderInfo($id, $app_price, $user_id, $user_num, $day_num);
			
		}
		$order_id = I('param.id', 0, 'intval');
		$uid = session("uid");
		if(empty($uid)){
		//	$this->error("Unregistered/login");
		}
		$orderInfo = D('TradeInfo')->getUserOrderInfo($order_id,$uid);
		$this->assign("orderInfo",$orderInfo);
		$this->display();
	}
	
}
?>