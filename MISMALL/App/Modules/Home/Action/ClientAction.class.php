<?php
class ClientAction extends HomeAction {
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
		//记录是否是开发者  下次进入判断
		$data['lastStatus'] = 2;
		D("User")->updAUser($this->user_id,$data);
		

		
	}
	public function developerCenter(){
		$this->display();
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
	/**
	 * 获取微企应用
	 */
	public function getSaleApps(){
		
		$page = I('post.page','1');
		$apptype = I('post.apptype','0');
		$userSite = D('UserSite');
		
		$count = $userSite->getSaleAppsCount($apptype);
	  	$apps = $userSite->getSaleApps($page,$apptype);
		
		$result = array('totalCount'=>$count,'saleApps'=>$apps);
		//$this->ajaxSuccess($result,'待销售应用');
		$this->ajaxReturn($result,'JSONCN');
		//print_r($apps);
	}
	
	
	/**
	 * 基本信息
	 */
	function baseMessage() {
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
	
	public function getBuySite(){
		$page = I("page",1,"intval");
		$where = array('t.userId' => $this->user_id, 't.orderNo' => array('neq', ''), 'isShare' => -1, 'siteTempType' => 1,'orderStatus'=>array('gt',0));
		$model = D('UserSite');
		$buySites = $model->getUserSiteByBuy($page,5,$where);
		
		//已支付应用总数
		$totalCount = $model->getUserSiteCountByBuy($where);
		
		$result['list'] = $buySites;
		$result['count'] = $totalCount;
		echo json_encode_cn($result);
	}
	
	
	//找服务
	public function findServicesUser(){
		$page = I("post.page",1,"intval");
	 	$re = M("business_card")->table(C("DB_PREFIX")."business_card AS B")->join(C("DB_PREFIX")."users AS U ON B.create_user = U.ID")->where("B.introduction!=''")->page($page,8)->select();
		echo json_encode_cn($re);
	 }
	
	
	
}