<?php
/**
 * 编辑器调用project数据
 *
 * @author cjli
 *
 */
class ProjectAction extends HomeAction {

	private $_site_id;
	private $_project_id;
	/**
	 * 初始化
	 */
	protected function _initialize() {
		parent::_initialize();
		$this->_site_id = I('param.siteId', 0,"intval");
		if(!$this->_site_id){
			$this->ajaxError("siteId参数错误");
		}
		$this->_project_id = D('UserSite')->getSiteInfo($this->_site_id, 'userProjectId');
		if(!$this->_project_id){
			$this->ajaxError("项目不存在！");
		}
	}

	/**
	 * 获取项目名称
	 */
	public function getProjectInfo() {
		$projectInfo = D('SiteProject')->getProjectByUserProjectId($this->_project_id);
		if (!$projectInfo) {
			$this->ajaxError("项目不存在！");
		}
		$this->ajaxSuccess($projectInfo);
	}

	/**
	 * 获取模块及流程
	 */
	public function getProjectStructure() {
		$struct = D('Project')->getProjectStructure($this->_project_id);
		if($struct){
			$this->ajaxSuccess($struct);
		}else{
			$this->ajaxError("无数据");
		}
	}

	/**
	 * 获取项目选中流程下的表单
	 */
	public function getProjectFormList() {
		$flow_id = I('flowID');
		$formList = D('Project')->getFormListByFlow($flow_id);
		/**
		 * 返回结构
		 * [{"ID":"496","formID":"Frm201405061110109980","formTitle":"文章列表"},{"ID":"497","formID":"Frm201405061110115819","formTitle":"文章分类"}]
		 */
		if($formList){
			$this->ajaxSuccess($formList);
		}else{
			$this->ajaxError("无数据");
		}
	}

	/**
	 * 获取项目下所有的表单
	 *
	 * @return JSON
	 */
	public function getProjectAllFormList() {
		
		$projectInfo = D('SiteProject')->getProjectByUserProjectId($this->_project_id);
		//网站关联后台不存在
		if (!$projectInfo) {
			$this->ajaxError("项目不存在！");
		}
		$project_id = $projectInfo['ID']; //项目ID
		$struct = D('Project')->getProjectStructure($this->_project_id);
		//项目不存在模块
		if (!is_array($struct['child'])) {
			$this->ajaxError("项目不存在模块！");
		}
		$formList = array();
		//循环模块
		foreach ($struct['child'] as $model) {
			//项目不存在流程
			if (!is_array($model['child'])) {
				$this->ajaxError("项目不存在流程");
			}
			//循环流程
			foreach ($model['child'] as $flow) {
				//获取流程下表单列表
				$list = D('Project')->getFormListByFlow($flow['flowID']);
				$formList = array_merge($formList, $list);
			}
		}

		$this->ajaxSuccess($formList);
	}

	/**
	 * 获取项目选中表单下的字段列表
	 */
	public function getProjectFormFieldList() {
		$form_id = I('formId', 0, 'intval');
		$fieldList = D('Form')->getFormFieldInfo($form_id);
		/**
		 * 返回结构
		 * [{"fieldName":"CCTextBox4","fieldTitle":"标题","controlType":"CCTextBox"},{"fieldName":"CCTextBox5","fieldTitle":"名称","controlType":"CCTextBox"}]
		 */
		$this->ajaxSuccess($fieldList);
	}

	/**
	 * 获取项目中表单数据总记录数
	 */
	public function getProjectFormDataCount() {
		$form_id = I('formId', 0, 'intval');
		$form_total = D('Form')->getFormDataRecordsNum($form_id);
		echo $form_total;
	}

	/**
	 * 获取项目中单个表单指定字段数据
	 */
	public function getProjectFormDataList() {
		$form_id = I('formId', 0, 'intval');
		$fields = I("fields", '', 'trim'); //待查询字段
		$page = I('page', 1, 'intval');
		$pageRows = I('pageRows', 20, 'intval');

		$page = $page ? $page : 1;

		$formList = D('Form')->getFormDataInfo($form_id, $page, $pageRows, $fields);
		/**
		 * [{"ID":"2","CCTextBox4":"娱乐新闻","CCDropDown5":"新闻","CCRemark6":"娱乐圈的事","CCCheckBox7":"启动","CCTextBox8":"2014-05-07"}]
		 */
		$this->ajaxSuccess($formList);
	}

	/**
	 * 获取项目表单及其数据信息
	 *
	 */
	public function getAllProjectFormData() {
		$page = I('page', 1, 'intval');
		$pageRows = I('pageRows', 10, 'intval');
		$page = $page ? $page : 1;

		$projectInfo = D('SiteProject')->getProjectByUserProjectId($this->_project_id);
		if (!$projectInfo) {
			$this->ajaxError("项目不存在！");
		}

		$struct = D('Project')->getProjectStructure($this->_project_id);
		//项目不存在模块
		if (!is_array($struct['child'])) {
			$this->ajaxError("项目不存在模块！");
		}
		$formList = array();
		//循环模块
		foreach ($struct['child'] as $model) {
			//项目不存在流程
			if (!is_array($model['child'])) {
				$this->ajaxError("项目不存在流程");
			}
			//循环流程
			foreach ($model['child'] as $flow) {
				//获取流程下表单列表
				$frm_lists = D('Project')->getFormListByFlow($flow['flowID']);

				$form_list = array();
				foreach ($frm_lists as $frm_list) {
					$field_lists = D('Form')->getFormFieldInfo($frm_list['ID']);
					$frm_list['formFields'] = $field_lists;

					$data_lists = D('Form')->getFormDataInfo($frm_list['ID'], $page, $pageRows);
					$frm_list['formData'] = $data_lists;

					array_push($form_list, $frm_list);
				}
				unset($frm_list, $frm_lists);

				$formList = array_merge($formList, $form_list);
			}
		}
		unset($model);

		if($formList){
			$this->ajaxSuccess($formList);
		}else{
			$this->ajaxError("无数据");
		}
	}

	/**
	 * 获取表单单条记录信息
	 *
	 * @param int $formId 表单ID号
	 * @param int $rid	记录ID号
	 * ＠param string $fields 查询字段，默认全部
	 *
	 * @return json
	 */
	public function getFormDataInfo() {
		$form_id = I('formId', 0, 'intval');
		$record_id = I('rid', 0, 'intval');
		$fields = I("fields", '', 'trim'); //待查询字段

		$data = D('Form')->getAFormDataInfo($form_id, $record_id, $fields);

		if($data){
			$this->ajaxSuccess($data);
		}else{
			$this->ajaxError("无数据");
		}
	}

	/**
	 *处理消息推送的json
	 */
	public function getTrueValueForMessage($paramObj, $userType = false, $openid = false) {
		//print_r($paramObj->dataType);
		$type = $paramObj->dataType;
		if ($type == "dataSource") {
			$dataSetId = $paramObj->valueType;
			$valueField = $paramObj->filed;
			$getvalue = D("Query")->getAQuerierData($dataSetId);
			//print_r($getvalue['querierData']->sql);
			$sql = $getvalue['querierData']->sql;
			$val = D("Query")->execAQueryPlan($sql);
			if ($userType) {
				$count = count($val['sql']);
				$value = "";
				for ($i = 0; $i < $count; $i++) {
					$value = $value . "," . $val['sql'][$i][$valueField];
				}
				unset($count);
				$value = substr($value, 1);
			} else {
				$value = $val['sql'][0][$valueField];
			}

		} else if ($type == "systemParam") {
			$valueType = $paramObj->valueType;
			if ($openid) {
				$value = D("PlatForm")->getSysParamValue($valueType, 1);
			} else {
				$value = D("PlatForm")->getSysParamValue($valueType, 0);
			}
		} else if ($type == "constant" || $type == "form") {
			$value = $paramObj->inputVal;
		} else {
			$value = $paramObj;
		}
		return $value;
	}

	/**
	 * 推送微信模板消息
	 */
	public function sendWechatPushMessage() {
		$data = I('param.proJsonData', 0, 'trim');
		$data = json_decode($data);
		//模板编号
		$codeSn = $data->proType;
		$wechatMessage = array();
		$postParams = $data->proJson;
		foreach ($postParams as $key => $value) {
			$wechatMessage[$key] = $this->getTrueValueForMessage($value);
		}
		//接收人
		$openList = $this->getTrueValueForMessage($postParams->proReceive, true, true);//获取系统变量的真实值
		$url = $this->getTrueValueForMessage($data->proUrl);
		if ($url) {
			$url = U($url, false, false, false, true);
		}
		//print_r($openList);
		//echo $url;exit;
		$site_id = I('param.siteId', 0, 'intval');
		//print_r($wechatMessage);exit;
		if (!($wechatMessage['first'] && $openList)) {
			$this->ajaxError('请正确填写参数');
		}

		//获取网站信息
		$siteInfo = D('UserSite')->getSiteInfo($site_id);
		if (!($siteInfo && $siteInfo['wechatId'])) {
			$this->ajaxError('网站信息不存在');
		}

		$wechat_id = $siteInfo['wechatId'];

		//获取应用信息
		$weiInfo = D('Apps/Wechat')->getInfoById($wechat_id);
		if (!($weiInfo && $weiInfo['app_id'] && $weiInfo['app_secret'])) {
			$this->ajaxError('公众号没认证');
		}

		//获取应用信息
		$appInfo = D('Apps/Wechat')->getAppInfoBySiteId($wechat_id, $site_id);
		if (!$appInfo) {
			$this->ajaxError('应用信息不存在');
		}

		//获取客服列表
		/*$openList = D('Apps/WechatMp')->getcoustomerService($wechat_id, $appInfo['agentId']);
		if (!$openList) {
		echo 0;exit;
		}*/

		//微信模板信息
		$where = array(
			'codeSn' => $codeSn,
		);
		$tplInfo = M('WechatMessageTemplate')->where($where)->find();
		if (!$tplInfo) {
			$this->ajaxError('微信模板信息不存在');
		}

		//调用微信模板消息
		importORG('Wechat.WechatBase');
		importORG('Wechat.Template');

		$weTpl = new Template($weiInfo['app_id'], $weiInfo['app_secret']);
		//根据模板编号获取模板ID
		$template_id = $weTpl->getTemplateId($codeSn);
		if ($template_id === FALSE) {
			$this->ajaxError($weTpl->getErrorInfo());
		}
		preg_match_all("/{{(.*?).DATA}}/", $tplInfo['data'], $matches);
		$params = $matches[1];
		//print_r($params);
		//删除一头一尾
		//$remark_param = array_pop($params);
		//array_shift($params);
		$data = array();
		//循环参数
		foreach ($params as $param) {
			if ($param == 'remark') {
				$data['remark'] = array(
					'value' => $wechatMessage['Remark'],
				);
			} else {
				$data[$param] = array(
					'value' => $wechatMessage[$param],
				);
			}

		}
		//print_r($data);exit;
		//$template_id = 'qzo28nVV2DUjPkZAxwOQhVPaJwu-9ZtSIPc-HyRjAyg';
		//$touser = 'o9RSsjrwrc_roUsTQ24qchcgkYxg';
		/*$data = array(
		'first' => array(
		"value" => $title,
		"color" => "#173177",
		),
		'keyword1' => array(
		'value' => $content,
		),
		'keyword2' => array(
		'value' => $user,
		),
		'keyword3' => array(
		'value' => date('Y-m-d H:i', time()),
		),
		);*/

		$openList = explode(',', $openList);
		if (is_array($openList) && $openList) {
			foreach ($openList as $touser) {
				$affect = $weTpl->templateSend($touser, $template_id, $data, $url);
				if (!$affect) {
					$this->ajaxError($weTpl->getErrorInfo());
				}
			}
		}
		$this->ajaxSuccess('', '通知发送成功');
	}


	//测试同步粉丝列表
	public function getWxMember(){
		importORG("Wechat.WechatBase");
		importORG("Wechat.User");
	//	print_r(C("WX_APPID"));
		$weiInfo = D('Apps/Wechat')->getInfoById(46);
		$Users = new User($weiInfo['app_id'], $weiInfo['app_secret']);
		dump($Users->getUserInfobycc());
		echo $_SERVER["REMOTE_ADDR"];
		echo $this->getip();
	}
  function getip() {
            $unknown = 'unknown';
            if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR'] && strcasecmp($_SERVER['HTTP_X_FORWARDED_FOR'], $unknown)) {
                $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
            }
            elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], $unknown)) {
                $ip = $_SERVER['REMOTE_ADDR'];
            }
            /* 
        处理多层代理的情况 
        或者使用正则方式：$ip = preg_match("/[\d\.]{7,15}/", $ip, $matches) ? $matches[0] : $unknown; 
        */
            if (false !== strpos($ip, ',')){ $ip = reset(explode(',', $ip)); }
            return $ip;
        } 
	//获取微信通知模板列表
	public function getWechatTemplateList() {
		$where = array();
		$list = M('WechatMessageTemplate')->field('codeSn,title')->where($where)->order('codeSn')->select();
		if ($list) {
			$this->ajaxSuccess($list);
		} else {
			$this->ajaxError('无数据');
		}
	}

	//获取微信通知模板详细
	public function getWechatTemplateInfo() {
		$tplId = I('param.tplId', '', 'trim');
		$where = array(
			'codeSn' => $tplId,
			'title' => $tplId,
			'_logic' => 'OR',
		);
		$info = M('WechatMessageTemplate')->where($where)->find();
		if ($info) {
			//去掉一头一尾，前端解析时固定添加
			$info['formatData'] = trim(str_replace(array('{{first.DATA}}', '{{remark.DATA}}', '{{Remark.DATA}}'), '', $info['data']));
			$this->ajaxSuccess($info);
		} else {
			$this->ajaxError('无数据');
		}
	}

	//制作层组件编辑数据
	public function editMoreLayout() {
		$page_id = I('param.pageId', '', 'trim');
		$openid = I('param.openid', '', 'trim');
		$content = I('param.content', '', 'trim');
		$lay_id = I('param.layId', '', 'trim');
		$formId = I('param.formId', '', 'trim');
		$content = base64_encode($content);
		$compay_name = I('param.compName', '', 'trim');
		$job_name = I('param.jobName', '', 'trim');
		
		$affect = D('Project')->editMoreLayout($this->_site_id, $page_id, $openid, $content, $lay_id, $formId, $compay_name, $job_name);
		echo (int) $affect;
	}

	//复制一份制作层数据
	//TODO
	public function copyMoreLayout() {
		$lay_id = I('param.layId', '', 'trim');
		$laylist = D('Project')->getMoreLayout(array('layId' => $lay_id));
		$lay = reset($laylist);
		if (empty($lay)) {
			$this->ajaxError('制作层不存在');
		}
		$affect = D('Project')->editMoreLayout($lay['siteId'], $lay['pageId'], $lay['openid'], $lay['data'], '', $lay['extend'], $lay['compayName'], $lay['jobName']);
		$this->ajaxSuccess((int) $affect);
	}

	//获取制作层组件数据
	public function getMoreLayout() {
		$lay_id = I('param.layId', '', 'trim');
		$page_id = I('param.pageId', '', 'trim');
		$openid = I('param.openid', '', 'trim');

		$condition = array(
			'siteId' => $this->_site_id,
			'pageId' => $page_id,
		);

		if ($lay_id) {
			$condition['layId'] = $lay_id;
		} elseif ($openid) {
			$condition['openid'] = $openid;
		}

		$laylist = D('Project')->getMoreLayout($condition);
		$this->ajaxSuccess($laylist);
	}

	//应用内生成二维码
	public function makeWechatQrcode() {
		$qrcodeStr = I('param,qrcodeStr', '', 'trim');

		if (empty($qrcodeStr)) {
			$this->ajaxError('参数错误');
		}
		//获取网站信息
		$wechat_id = D('UserSite')->getSiteInfo($this->_site_id, 'wechatId');
		if (!$wechat_id) {
			$this->ajaxError('网站无关联公众号');
		}

		//获取应用信息
		$weiInfo = D('Apps/Wechat')->getInfoById($wechat_id);
		if (!($weiInfo && $weiInfo['app_id'] && $weiInfo['app_secret'])) {
			$this->ajaxError('公众号没认证');
		}

		//获取应用信息
		$appInfo = D('Apps/Wechat')->getAppInfoBySiteId($wechat_id, $this->_site_id);
		if (!$appInfo) {
			$this->ajaxError('应用信息不存在');
		}

		$agentId = $appInfo['agentId'];

		$qrcodeStr = $agentId . '_' . $qrcodeStr;
		importORG('Wechat.WechatBase');
		importORG('Wechat.Qrcode');

		$qrcode = new Qrcode($weiInfo['app_id'], $weiInfo['app_secret']);
		$res = $qrcode->create($qrcodeStr, true);
		if (!$res) {
			$this->ajaxError($qrcode->getErrorInfo());
		}
		$res = $qrcode->show($res['ticket']);
		if (!$res) {
			$this->ajaxError($qrcode->getErrorInfo());
		}
		//echo $qrcode->getErrorInfo();
		Header("Content-type: image/jpeg");
		exit($res['content']);

	}

	public function uploadZip() {
		
		/*session('pid', 175);*/
		importORG('Upload');
		$config = array(
			'mimes' => '', //允许上传的文件MiMe类型
			'maxSize' => 0, //上传的文件大小限制 (0-不做限制)
			'exts' => 'zip', //允许上传的文件后缀
			'autoSub' => false, //自动子目录保存文件
			'subName' => array('date', 'Y/m/d'), //子目录创建方式，[0]-函数名，[1]-参数，多个参数使用数组
			'rootPath' => './uploads/pdf/', //保存根路径
			'savePath' => '', //保存路径
			'saveName' => array('uniqid', ''), //上传文件命名规则，[0]-函数名，[1]-参数，多个参数使用数组
			'saveExt' => '', //文件保存后缀，空则使用原后缀
			'replace' => true, //存在同名是否覆盖
			'hash' => true, //是否生成hash编码
			'callback' => false, //检测文件是否存在回调函数，如果存在返回文件信息数组
		);
		$qiniu_config = array(
			'accessKey' => 'PcO4kLaAqFNWRV2xMXXNZ6WuuicCurf64HNTJAny', //七牛服务器
			'secrectKey' => 'NT7mf-NIne9Lnb2VSDVc02ePTIv-1CTERdD9MSY2', //七牛用户
			'domain' => '7xi40t.com2.z0.glb.qiniucdn.com', //七牛密码
			'bucket' => 'jingu',
		);

		importORG('Upload.Driver.Qiniu.QiniuStorage');
		$qiniu = new QiniuStorage($qiniu_config);

		//dump($_FILES);exit;
		/* 上传文件 */
		$upload = new Upload($config, 'local', array());
		$info = $upload->uploadOne();
		if (!$info) {
			echo $upload->getError();
			exit;
		}
		/*$info = array(
		"name" => "550f775e110dc.zip",
		"type" => "application/zip",
		"size" => 2384842,
		"key" => "img",
		"ext" => "zip",
		"md5" => "58b02b6619f2979d374e87b4ffdbf15e",
		"sha1" => "1f1a1fac37ce70f1349adff4d9de7136ad555b3c",
		"savename" => "test.zip",
		"savepath" => "",
		);*/
		//dump($info);
		$file_path = getImagePath($config['rootPath'] . $info['savepath'] . $info['savename']);
		//echo $file_path . '<br/>';
		//exit;
		if (!is_file($file_path)) {
			echo '上传文件失败';exit;
		}

		$folder_path = ROOT_PATH . '/uploads/pdf/' . $info['savepath'];

		importORG('PclZip');
		$archive = new PclZip($file_path);
		$unzipList = $archive->extract(PCLZIP_OPT_PATH, $folder_path);
		if ($unzipList == 0) {
			die("Error : " . $archive->errorInfo(true));
		}
		//print_r($unzipList);exit;

		$filecount = 0;
		$dircount = 0;
		$failfiles = array();
		set_time_limit(0);
		//修改为不限制超时时间(默认为30秒)

		foreach ($unzipList as $key => $arr) {
			if (!$arr['folder']) {
				$str_start = strrpos($arr['stored_filename'], '/');
				$folder_name = substr($arr['stored_filename'], 0, $str_start);
				$file_name = substr($arr['stored_filename'], $str_start ? $str_start + 1 : 0, -4);
				$file_name = mb_convert_encoding($file_name, 'UTF-8', 'gb2312');
				$folder_name = mb_convert_encoding($folder_name, 'UTF-8', 'gb2312');
				//echo $file_name . '<br/>';
				//echo $folder_name . '<br/>';

				//exit;
				//echo ($arr['filename']);

				$pathinfo = pathinfo($arr['filename']);

				$file = array(
					'name' => $file_name,
					'tmp_name' => $arr['filename'],
					'type' => 'application/pdf',
					'error' => 0,
					'site' => $arr['size'],
					'savepath' => date('Y-m-d', time()) . '/',
					'savename' => unquire_rand() . '.' . $pathinfo['extension'],
				);
				//dump($file);exit;

				$file_new_name = $file['savepath'] . $file['savename'];
				$key = str_replace('/', '_', $file_new_name);
				$upfile = array(
					'name' => 'file',
					'fileName' => str_replace('/', '_', $file_new_name),
					'fileBody' => file_get_contents($file['tmp_name']),
				);
				//print_r($file);
				//print_r($upfile);
				//exit;
				$result = $qiniu->upload(array(), $upfile);
				$url = $qiniu->downLink($key);
				$file['url'] = $url;
				//print_r($file);
				$json_data = array(
					'CCTextBox5' => $file_name,
					'CCDropDown1' => $folder_name,
					'CCTime4' => date('Y-m-d H:i:s'),
					'CCTextBox3' => $file['url'],
				);
				D('Project')->saveFormDataInfo('cc_tbfm201503231022362177', 0, $json_data);
				file_delete($file['tmp_name']);
			}
		}
		file_delete($file_path);
		echo '1';exit;
	}
	
}