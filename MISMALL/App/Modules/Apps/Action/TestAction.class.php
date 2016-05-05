<?php
class TestAction extends BaseAction {
	public function index() {
		/*$arr = array(
		'0' => array(
		'openid' => 'asdfasdf',
		),
		'1' => array(
		'openid' => 'asdfasdf',
		),
		);
		$res = array_value_recursive('openid', $arr);
		dump($res);
		 */
		echo '<img src="http://localhost/mismall/Apps/Test/qrcode" />';exit;
		$push = array(
			'ToUserName' => 'gh_d4c57590a59a',
			'FromUserName' => 'o4eQQs4-aQZOi6y9JCbZOuiIWccc',
			'CreateTime' => '1432798885',
			'MsgType' => 'event',
			'Event' => 'SCAN',
			'EventKey' => '0',
			'Ticket' => 'gQF27zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL1NFaUY0Z2psaUpmeHJZNTBTbVFsAAIEc2T2VAMEAAAAAA==',
		);
		$scene_id = $push['EventKey'];
		echo $scene_id;
		if (is_numeric($scene_id)) {
			echo 'number : ' . $scene_id;
		}

		exit;

		$weId = 1;
		$data = array(
			'FromUserName' => 'osGGTt5oGs49lxeMsphmTOgeU1Ps',
			'PicUrl' => 'http://mmbiz.qpic.cn/mmbiz/l6BoIvArjIt81LIT5lywQXflqNa4BHlzemVcjP5pQ6OBEATGlC5Hq6lkdlJ82dXPLmJIYePu2fPWiajHQ2DcuHg/0',
			'CreateTime' => '1419413026',
		);
		$img_set = array(
			'WeId' => $weId,
			'FromUserName' => $data['FromUserName'],
			'CreateTime' => $data['CreateTime'],
			'PicUrl' => $data['PicUrl'],
		);
		M('WechatMessageImage')->add($img_set);
		echo M('WechatMessageImage')->getLastSql();
	}

	public function sysuser() {
		$user = M('users');
		$we_id = 45;
		$list = $user->where('userType = 5')->field('id,openid')->group('openid')->select();
		echo $user->getLastSql();
		importORG('Wechat.WechatBase');
		//exit;
		foreach ($list as $u) {
			$info = D('WechatMp')->getSyncMemberInfo($we_id, $u['openid']);
			//dump($info);exit;
			if ($info['userPhoto']) {
				$user->where('id=' . $u['id'])->save(array('userPhoto' => $info['userPhoto']));
				echo $user->getLastSql();
			}
		}
	}

	public function wechatTpl() {
		importORG('Wechat.WechatBase');
		importORG('Wechat.Template');
		$appid = 'wxe112124524913fc1';
		$secret = '0939ae0635954356e3e36f53c51dd7ac';

		//qjwd
		$appid = 'wx457341e4f5cead31';
		$secret = '7842c57833137fdbb6d6c49505a975c8';

		$weTpl = new Template($appid, $secret);
		//$res = $weTpl->setIndustry(1, 2);
		//$res = $weTpl->getTemplateId('TM00001');
		//$template_id = 'f4UZ-h1thlPHEKIe8G_T1nFqxjsAVsDCGIp5A1TnrYw';
		//$touser = 'o9RSsjrwrc_roUsTQ24qchcgkYxg';
		//$touser = 'osGGTt5oGs49lxeMsphmTOgeU1Ps';
		//$touser = 'o9RSsji91TMiS3Ot5IKdITigQSqM';
		//
		//qjwd
		$tpl = 'TM00015';
		$tplId = $weTpl->getTemplateId($tpl);

		//dump($tplId);exit;

		//$template_id = 'qzo28nVV2DUjPkZAxwOQhVPaJwu-9ZtSIPc-HyRjAyg';
		//$template_id = 'Fca8ItoeQvHrFybMrce5Xh0cA6jmwd_RDCwRyqN5i-w';
		//$touser = 'o4eQQsxfGmPy0bLUlPoVyeJ0KfvI';
		$touser = 'o4eQQs4-aQZOi6y9JCbZOuiIWccc';
		$data = array(
			'first' => array(
				"value" => "您好，您有新的待处理事项!",
				"color" => "#173177",
			),
			'keyword1' => array(
				'value' => '50米内类型的窗帘不足10米，请及时进货',
			),
			'keyword2' => array(
				'value' => 'qjwd',
			),
			'keyword3' => array(
				'value' => date('Y-m-d H:i', time()),
			),
			'remark' => array(
				'value' => '<a href="http://www.baidu.com">请点击详情进行处理</a>',
			),
		);
		$url = '';
		//dump($data);exit;
		$url = 'mp.weixin.qq.com/wiki/17/304c1885ea66dbedf7dc170d84999a9d.html';
		$res = $weTpl->templateSend($touser, $template_id, $data, $url);
		echo $weTpl->getErrorInfo();
		dump($res);
	}

	public function qrcode() {
		//$url = 'https://qy.weixin.qq.com/cgi-bin/redirect?url=http://mmbiz.qpic.cn/mmbiz/KPAjcmDDOyILRbZoWYjwib3iaQZnE7QF9Kib3QicDDABDDLnnYHvZuOJf0CyRPL5djbexQsUs89ACbibLwicfn1Ob76Q/0';
		//$url='http://weixin.qq.com/r/MHUjO0DE-B2DrQRY9yAi';
		//$url="https://qy.weixin.qq.com/cgi-bin/home?lang=zh_CN&token=629473723#setting";
		/*importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi();
		$corpId = 'wxd0a57529180b761f';
		$secret = 'mntte7CvGiJorrTPVtKuENXCNUk3gD7onetM6IurbhPlWmUQZpmPSSD8dANwndn1';
		$qyapi->setToken($secret);

		$res =  $qyapi->userListByDepartment(1,1);*/
		importORG('Wechat.WechatBase');
		importORG('Wechat.Qrcode');
		$appid = 'wx9d247b526c24b923';
		$secret = 'fd4ca847c4ab4ac29533ee5fa6423f67';
		$qrcode = new Qrcode($appid, $secret);
		//Array ( [ticket] => gQF27zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL1NFaUY0Z2psaUpmeHJZNTBTbVFsAAIEc2T2VAMEAAAAAA== [url] => http://weixin.qq.com/q/SEiF4gjliJfxrY50SmQl )
		//Array ( [ticket] => gQFX8DoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL0xrek4tS1hscmJMVWhwSGNoV1I5AAIEx7ZnVQMEAAAAAA== [url] => http://weixin.qq.com/q/LkzN-KXlrbLUhpHchWR9 )
		//$res = $qrcode->create('234_PlWmUQZpmPSSD8dANwndn1', true);
		//print_r($res);exit;*/
		//$ticket = $res['ticket'];
		$ticket = 'gQEx8DoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2prelVRckhsdDdMT2pERmhuR1I5AAIE6rlnVQMEAAAAAA==';
		$res = $qrcode->show($ticket);
		//echo $qrcode->getErrorInfo();
		Header("Content-type: image/jpeg");
		exit($res['content']);
	}

	public function loglist() {
		$destination = C('LOG_PATH') . date('y_m_d') . '.log';
		if (isset($_GET['_URL_'][3]) && $_GET['_URL_'][3] == 'del') {
			file_delete($destination);
			exit;
		}
		echo '<pre>';
		echo file_get($destination);
		echo '</pre>';
		exit;
	}

	public function message() {
		$list = M('WechatMessage')->select();
		foreach ($list as $m) {
			$data = explode(':', $m['data']);
			$set['data'] = serialize(array($data[0] => $data[1]));
			//M('WechatMessage')->where('id='.$m['id'])->save($set);
		}
	}

	public function upload() {
		if (IS_POST) {
			$type = I('get.type', '');
			$Picture = D('Admin/Picture');
			$info = $Picture->upload(
				C('WECHAT_UPLOAD')
			);
			dump($info);
		}

		echo '<form enctype="multipart/form-data" method="post" action="" >';
		echo '<input type="file" name="img">';
		echo '<input type="submit" value="submit">';
		echo '</form>';
	}

	public function xmldata() {
		$xml = <<<EOF
<xml>
	<URL><![CDATA[http://v.cycc.biz/Weixin/index?hash=549bb]]></URL>
	<ToUserName><![CDATA[weiyiyun2014]]></ToUserName>
	<FromUserName><![CDATA[FormUserName]]></FromUserName>
	<CreateTime>123434545645</CreateTime>
	<MsgType><![CDATA[event]]></MsgType>
	<Event><![CDATA[subscribe]]></Event>
	<Latitude></Latitude>
	<Longitude></Longitude>
	<Precision></Precision>
	<MsgId>1234567890123456</MsgId>
</xml>
EOF;
		$data = new SimpleXMLElement($xml);
		dump($data);
		$data = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
		dump($data);
	}

	public function media() {
		$weid = 1;
		$media_id = '5P0nWPF4PKyUMNmhGzUnsytvRhf4-fLcqiTN-om-uHF4Tx_9kbHQYvWraMwSZi9t';
		$model = D('WechatMessage');
		$res = $model->getMediaInfo($weid, $media_id);
		echo $model->getError();
		dump($res);
		exit;

		//if(IS_POST){
		//$file = ROOT_PATH . '/public/App/Home/Home/images/logo.png';
		$file = '/home/cjli/images/baby/7.jpeg';
		$file = '/home/cjli/images/102383747.png';
		$file = '/home/cjli/www/cycc/uploads/2014/10/24/5449aec5b60eb.jpg';
		//$file = '/home/cjli/doc/李常军－2013年个人总结.doc';
		//$file = '/home/cjli/doc/开放存储服务OSS-API手册.pdf';

		echo '@' . $file . '<br/>';
		$pathinfo = pathinfo($file);
		dump($pathinfo);

		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi();
		$secret = '6FbbFGQa3G2reXGYTc5Ozxo4pjkmgzwuwi2uPI4JfG9Pf2h6qvi_LaaGpnG-3uZI';
		$qyapi->setToken($secret);
		$res = $qyapi->uploadMedia($file);
		if ($res === false) {
			echo $qyapi->getErrorInfo();
		}
		/*
		array(3) {
		["type"] => string(4) "file"
		["media_id"] => string(87) "10lRUYmzivKsYilLWRT59hAqtxhJBSFOSfyNquwysCFLo1uZOCg6XBo0ai0-qogZdGPH-HW1DVhA1aDHYWSbnAg"
		["created_at"] => int(1414114471)
		}

		 */
		dump($res);exit;

		$media_id = '10KxteJJprAYgs12_9hVUv9f15eCCqW0PlsJLI_hMslm7My-JnMoR1vlHDPl9ZYDD'; //img
		$media_id = '1WexN7jq8Ht6RtWB562zjblTyHdDfoL_OkPFZc2-1DcMkb-t7TS1jcJFll58gjz3y'; //doc
		$media_id = '1zdJiX25dafvQutqwzoX7t-5hWUatouM5kkG1hO00a6Q_3-ta5DbOHM3jVeqXsSxb4gBiGr0zUgAMFUHmg4Dhlg'; //pdf
		$res = $qyapi->getMediaInfo($media_id);
		if ($res === false) {
			echo $qyapi->getErrorInfo();
		}
		dump($res);

		$filepath = ROOT_PATH . '/uploads/Wechat/';
		echo $filepath . $res['name'];

		file_write($filepath . $res['name'], $res['content']);
		//}
		/*echo '<form enctype="multipart/form-data" method="post" action="" >';
	echo '<input type="file" name="img">';
	echo '<input type="submit" value="submit">';
	echo '</form>';*/
	}

	public function send() {
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi();
		$secret = '6FbbFGQa3G2reXGYTc5Ozxo4pjkmgzwuwi2uPI4JfG9Pf2h6qvi_LaaGpnG-3uZI';
		$qyapi->setToken($secret);
		$agentid = 0;
		$type = 'text';
		$content = 'api test';
		$safe = 0;
		$touser = '10031|10011';
		$res = $qyapi->sendMessage($agentid, $type, $content, $safe, $touser);
		if ($res === false) {
			echo $qyapi->getErrorInfo(true);
		}
		dump($res);
	}
}