
<?php
class UnregisteredAction extends HomeAction {

	
		/**
	 * 获取首页最热门5个应用
	 * @return  json
	 */
	public function index() {
		$uid = session("uid");
			if(!empty($uid)){
				$lastStatus = M("users")->where("ID=$uid")->getField("lastStatus");
				if($lastStatus==1){
					$this->redirect("Developer/index");
				}else{
					$this->redirect("Client/index");
				}
			}
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
	
	//注册
	public function registered(){
		$sharecode = I("param.sharecode");
		if($sharecode){
			$shareNum = M("users")->where("sharecode='$sharecode'")->getField("ID");
	 		$this->assign("shareNum",$shareNum*C("shareCode"));
		}
		$this->display();
		
	}
	
	public function shop_detail(){
		$id = I("param.id");
		$this->assign("id",$id);
		$this->display();
	}
	
	//生成二维码
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

		ob_clean();
		Header("Content-type: image/jpeg");
		exit($res['content']);
	}
	 

}