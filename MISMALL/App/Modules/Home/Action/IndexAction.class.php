<?php
/**
 * 首页控制器
 *
 */
importORG('Wechat.WechatBase');
importORG('Wechat.qy.Qyapi');
class IndexAction extends HomeAction {

	public function _initialize() {
		parent::_initialize();
		if (in_array(I('session.uid'), array(28, 1, 6, 2, 128, 24))) {
			$url_dev = '<div id="btn_dev">设计者</div>';
			$this->assign("developPage", $url_dev);
		}
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
	 * grabzit生成网页快照
	 * grabzit的handler.php
	 */
	public function grabzitHandler() {
		vendor('grabzit.lib.GrabzItClient', '', '.class.php');
		include THINK_PATH . 'Extend/Vendor/grabzit/config.php';

		//This PHP file handles the GrabzIt callback
		$message = $_GET["message"];
		$customId = $_GET["customid"];
		$id = $_GET["id"];
		$filename = $_GET["filename"];
		$format = $_GET["format"];

		//Custom id can be used to store user ids or whatever is needed for the later processing of the
		//resulting screenshot
		$grabzIt = new GrabzItClient($grabzItApplicationKey, $grabzItApplicationSecret);
		$result = $grabzIt->GetResult($id);

		if (!$result) {
			return;
		}

		//Ensure that the application has the correct rights for this directory.

		file_write(C('UPLOAD_PATH') . $customId, $result);

		return $_GET;
	}

	/**
	 * 简历上传
	 */

	public function resume() {
		$resumeRUL1 = $_GET['resumeURL'];
		$title = "收到新简历,请查收! ";
		//收件人列表

		$mailArray = array('15280@qq.com', '824933554@qq.com', '760661087@qq.com', '627829480@qq.com');
		//$mailArray = array('710624813@qq.com');
		$resume = M("Resume");
		if ($resumeRUL1 != null) {
			$data['resume_addr'] = $resumeRUL1;
			$resume->create($data);
			$resume->add();
			echo $msg = "恭喜, 简历成功投递 ! ";

			$lCcontent = "<body><span>简历地址:<a href='" . $resumeRUL1 . "'>" . $resumeRUL1 . "</a></span></body>";

			$this->resumeMailMsg($mailArray, $title, $lCcontent);

		} else {

			$upload = $this->_upload(C('RESUME_UPLOAD'));

			if ($upload['error']) {
				$return = array('error' => 1, 'message' => $upload['info']);
				echo json_encode($return);
				echo $msg = "简历投递失败，请重新投递!";
			} else {
				$fileInfo = $upload['info'][0];
				$mailContent = "<body><span>简历地址:<a href='" . $fileInfo['url'] . "'>" . $fileInfo['name'] . "</a></span></body>";
				$this->resumeMailMsg($mailArray, $title, $mailContent);

				$data = array(
					'saveName' => $fileInfo['url'],
					'realName' => $fileInfo['name'],
					'resume_addr' => '',
					'upLoadDate' => date("Y-m-d H:m:s"),
				);
				$resume->create($data);
				$resume->add();

				echo $msg = "恭喜, 简历成功投递  ";
			}
		}
	}

	/**
	 * 发送邮件
	 */
	public function resumeMailMsg($mailArray, $title, $content) {
		for ($i = 0; $i < count($mailArray); $i++) {
			sendEmail($mailArray[$i], $title, $content);
		}
	}

	public function buyOrder() {
		$order_sn = I('get.sn');
		$orderInfo = D('TradeInfo')->getOrderInfoBySN($order_sn);
		if (!$orderInfo) {
			throw new Exception("order sn error", 1);

		}

		$set = array(
			'orderStatus' => 1,
			'payTime' => time(),
		);

		D('TradeInfo')->where(array('orderNo' => $order_sn))->save($set);

		$user_site_model = D('UserSite');
		//拷贝站点
		$site_id = $user_site_model->copyUserSite($orderInfo['releaseID']);
		if (!$site_id) {
			//TODO　拷贝不成功
			throw new Exception("应用拷贝不成功", 1);
		} else {
			//更新订单号到网站记录
			$user_site_model->editSite($site_id, array('orderNo' => $order_sn));

			redirect(U('Editor/index', array('siteId' => $site_id)));
		}
	}

	/**
	 * 生成二维码
	 */
	public function qrcode() {
		$url = I('param.url', '', 'trim');
		$logo = I('param.logo', '', 'trim');
		if (empty($url)) {
			echo '';
		}

		if (substr($url, 0, 4) !== 'http') {
			$url = U($url, false, false, false, true);
		}
		ob_clean();
		// 生成的文件名
		$filename = C('UPLOAD_PATH') . 'qrcode/' . md5($url) . '.png';
		/*if (is_file($filename)) {
		echo getImageUrl($filename);exit;
		}*/

		Vendor('phpqrcode');

		// 纠错级别：L、M、Q、H
		$level = 'L';
		// 点的大小：1到10
		$size = 4;

		$margin = 2;
		/*
		参数$text表示生成二位的的信息文本；
		参数$filename表示是否输出二维码图片 文件，默认否；
		参数$level表示容错率，也就是有被覆盖的区域还能识别，分别是 L（QR_ECLEVEL_L，7%），M（QR_ECLEVEL_M，15%），Q（QR_ECLEVEL_Q，25%），H（QR_ECLEVEL_H，30%）；
		参数$size表示生成图片大小，默认是3；
		参数$margin表示二维码周围边框空白区域间距值；
		参数$saveandprint表示是否保存二维码并 显示
		 */
		QRcode::png($url, false, $level, $size, $margin);
		/*if ($logo !== FALSE) {
	$filename = imagecreatefromstring(file_get_contents($filename));
	$logo = imagecreatefromstring(file_get_contents($logo));
	$QR_width = imagesx($filename); //二维码图片宽度
	$QR_height = imagesy($filename); //二维码图片高度
	$logo_width = imagesx($logo); //logo图片宽度
	$logo_height = imagesy($logo); //logo图片高度
	$logo_qr_width = $QR_width / 5;
	$scale = $logo_width / $logo_qr_width;
	$logo_qr_height = $logo_height / $scale;
	$from_width = ($QR_width - $logo_qr_width) / 2;
	//重新组合图片并调整大小
	imagecopyresampled($filename, $logo, $from_width, $from_width, 0, 0, $logo_qr_width,
	$logo_qr_height, $logo_width, $logo_height);
	}
	//输出图片
	imagepng($filename, $filename);*/
	}

	/*
	 * 保存发布的需求
	 * */
	public function savePublishRequest() {
		$data['type'] = I("type", "", "trim");
		$data['title'] = I("title", "", "trim");
		$data['tel'] = I("tel", "", "trim");
		$data['content'] = I("content", "", "trim");
		$data["money"] = I("money", '', "trim");
		$data['date'] = I('date', "", "trim");
		$data["addTime"] = time();

		$db = M("publish_request");
		$re = $db->add($data);
		echo $re;

	}

	/*
	 * 获取发布的需求
	 * @param $id  需求ID
	 * */
	public function getPublishRequest() {
		$id = I("id", "", "trim");
		$db = M("publish_request");
		if ($id) {
			$re = $db->where("id = '$id'")->find();
		} else {
			$re = $db->select();
		}
		echo json_encode_cn($re);
	}

	/*
	 * 数据采集程序
	 * @param $url
	 * */
	public function dataQuery() {
		header("Content-type:text/html;charset=utf-8");
		$url = I("post.url", "", "trim");
		$stockId = I("post.stockId", "", "trim");
		$openid = I("post.stockId", "", "trim");
		/*if($openid)
		$getViewPower = D("Project")->getViewPower($openid);//返回1 付费用户今天免费看 2 免费用户不到3骗 0 免费已经看完3篇
		if($getViewPower == 0){
		return 0;
		}
		 */
		$time = time();
		$len = strlen($time);
		$url1 = "http://gpys.emoney.cn/WebSD/Handlers/SDHisHandlers.ashx?callback=jQuery16109002827551630881_" . $time . "&Type=S&Code=" . $stockId . "&Key=first&_=" . $time;
		$url2 = "http://gpys.emoney.cn/WebSD/Handlers/SDHisHandlers.ashx?callback=jQuery161007187865881542754_" . $time . "&Type=S&Code=" . $stockId . "&Key=ggzs&_=" . $time;
		//$url3 = "http://gpys.emoney.cn/WebSD/Handlers/SDHqHandlers.ashx?callback=jQuery16103595257976740798_".$time."&F=Qu&Type=S&Code=sz".$stockId."&Key=LHQ&_=".$time;
		$content1 = file_get_contents($url1);
		$content2 = file_get_contents($url2);
		//$content3 = file_get_contents($url3);
		$time = time();
		$len = strlen($time);
		$len1 = 44 + $len;
		$len2 = 45 + $len;
		//$len3 = 45+$len;
		//$content["first"] = substr($content1,$len1,-3);
		//$content["second"] = substr($content2,$len2,-3);
		echo '{"first":' . substr($content1, $len1, -3) . ',"second":' . substr($content2, $len2, -3) . '}';

	}

	/**
	 * 注册
	 */
	 public function register(){
	 	
	 	if($_POST){
	 				$email  = I("post.email");
			print_r($_POST);
				 exit;		
	 	}else{
			$sharecode = I("param.sharecode");
			if($sharecode){
				$shareNum = M("users")->where("sharecode='$sharecode'")->getField("ID");
		 		$this->assign("shareNum",$shareNum*C("shareCode"));
			}
			if(isMobile()){
				$this->display("h5_register");				
			}else{
			 	$this->display();
			}
	 	}
	 }

	 
	 /**
	  * 
	  */
	public function h5_register(){
		if($_POST){
	 				$email  = I("post.email");
			print_r($_POST);
				 exit;		
	 	}else{
 			$sharecode = I("param.sharecode");
			if($sharecode){
				$shareNum = M("users")->where("sharecode='$sharecode'")->getField("ID");
		 		$this->assign("shareNum",$shareNum*C("shareCode"));
			}
		 	$this->display();
	 	}
	}
}
?>