<?php

//模拟当前登录用户 后续会从外面传递进来
//$userName="tanglj";

/*
 * ezApp入口方法,进行页面跳转
 */
class EditorAction extends HomeAction {

	private $_site_id;
	private $_project_id;
	/**
	 * 回调方法 初始化
	 */
	protected function _initialize() {
		//获取用户信息
		if (!session('uid')) {
			$this->redirect("/Unregistered/index?relogin=1");
		}

		parent::_initialize();

		$tpl_id = isset($_GET['tplId']) ? intval($_GET['tplId']) : 0;
		if (!$tpl_id) {
			$this->_site_id = I('siteId', 0, "intval");
			if (!$this->_site_id) {
				$this->ajaxError("siteId参数错误");
			}
			$this->_project_id = D('UserSite')->getSiteInfo($this->_site_id, 'userProjectId');
			if (!$this->_project_id) {
				$this->ajaxError("项目不存在！");
			}
		}

	}

	public function index() {
		$tpl_id = isset($_GET['tplId']) ? intval($_GET['tplId']) : 0;
		$site_id = isset($_GET['siteId']) ? intval($_GET['siteId']) : 0;
		$order_sn = isset($_GET['order_sn']) ? trim($_GET['order_sn']) : '';
		$site_name = isset($_GET['siteName']) ? trim($_GET['siteName']) : '';
		$img_scr = isset($_GET['imgSrc']) ? trim($_GET['imgSrc']) : '';
		$user_id = session('uid');

		$redirect_url = U('Home/Client/appStore');

		$user_site_model = D('UserSite');
		if ($site_id) {
			$siteInfo = $user_site_model->getSiteInfo($site_id);
			session('pid', $siteInfo['userProjectId']);
			if (!$siteInfo) {
				redirect($redirect_url, 3, '站点不存在');
			} elseif ($siteInfo['userId'] != $user_id) {
				redirect($redirect_url, 3, '非法编辑站点');
			}
			//虚拟号无发布按钮
			$$isSupperWechat = 0;
			$wechat = D('Apps/Wechat')->getInfoById($siteInfo['wechatId']);
			if ($wechat) {
				$cache_id = 'supper_wechat_' . $site_id;
				if (is_bool(S($cache_id))) {
					if ($Wechat['wechatType']) {
						S($cache_id, 1);
						$isSupperWechat = 1;
					} else {
						$appInfo = D('Apps/Wechat')->getAppInfoBySiteId($siteInfo['wechatId'], $site_id);
						if (C('SUPPER_WECHAT_ID') == $siteInfo['wechatId'] && $appInfo['agentId'] > 0) {
							S($cache_id, 0);
						} else {
							S($cache_id, 1);
							$isSupperWechat = 1;
						}
					}
				} else {
					$isSupperWechat = S($cache_id);
				}
			}
			$this->assign("siteId", $site_id);
			$this->assign("siteWechatId", $siteInfo['wechatId']);
			$this->assign("isSupperWechat", $isSupperWechat);
			$this->assign("siteName", urlencode($siteInfo['siteName']));
			$this->display();
			//订单过来的
		} elseif ($order_sn) {
			$order = D('TradeInfo')->getOrderInfoBySN($order_sn);
			//已经支付创建站点
			if ($order['orderStatus']) {
				//拷贝站点
				$site_id = $user_site_model->copyUserSite($order['releaseID'], $site_name);
				if (!$site_id) {
					//TODO　拷贝不成功
					redirect(U('AppStore/index', array('type' => 5)), 3, '应用拷贝不成功');
				} else {
					//更新订单号到网站记录
					$user_site_model->editSite($site_id, array('orderNo' => $order_sn));

					redirect(U('Editor/index', array('siteId' => $site_id)));
				}
				//未支付
			} else {
				redirect(U('/Template/order_flow', array('tplId' => $order['releaseID'])));
			}
		} else if ($tpl_id) {
			$templateInfo = $user_site_model->getSiteInfo($tpl_id);

			if (!$templateInfo) {
				redirect($redirect_url, 3, '非法编辑站点');
			}

			//如果模板要收费
			if (floatval($templateInfo['price']) && $templateInfo['userId'] != $user_id) {
				redirect(U('/Template/order_flow', array('tplId' => $tpl_id)));
			}

			//拷贝站点
			$site_id = $user_site_model->copyUserSite($tpl_id, $site_name, $img_scr);
			if (!$site_id) {
				//TODO　拷贝不成功
				redirect($redirect_url, 3, '站点拷贝不成功');
			} else {
				// 拷贝成功，建立后台
				$project_id = D('UserSite')->getSiteInfo($site_id, 'userProjectId');
				session('pid', $project_id);

				//更新订单号到网站记录
				if ($templateInfo['isShare'] == 3) {
					$orderNo = date('YmdHis') . rand(1000, 9999);
					$user_site_model->editSite($site_id, array('orderNo' => $orderNo));
				} else {
					$user_site_model->editSite($site_id, array('orderNo' => ''));
				}

				redirect(U('Qywx/Editor/index', array('siteId' => $site_id)));
			}

		} else {
			//redirect(U('/Template/index'));
		}

	}


	/**
	 * 将内容添加到指定页中
	 */
	public function savePage() {
		$page = I('page', '', 'trim');
		$component = I('component', 0, 'intval');
		$content = str_replace("\\\"", "\"", trim($_POST["content"]));
		$title = I('title', '', 'trim');
		$data = I('data');
		$site_id = I('siteId', 0, 'intval');
		$comp_type = I('type', 0, 'intval');

		//组件入库
		if ($component) {
			$update = array('name' => $page, 'title' => $title, 'data' => $data, 'type' => $comp_type);
			D("Project")->changeDB($this->_project_id);
			D('Project')->saveComponent($update);
		}
		if ($page && $content && $site_id) {
			$siteInfo = D('UserSite')->getSiteInfo($site_id);
			//自动绑定虚拟公众号应用
			if (!$siteInfo['wechatId'] && $page == 'config') {
				$wechat_id = C('SUPPER_WECHAT_ID');
				//生成微信公众号应用
				$set = array('name' => $siteInfo['siteName'], 'icon' => $siteInfo['thumbPath'], 'siteId' => $site_id, 'description' => $siteInfo['siteDescription']);
				D('Apps/Wechat')->editWechatApp($wechat_id, $set);
				D('UserSite')->editSite($site_id, array('wechatId' => $wechat_id));
				session('wechatId', $wechat_id);
			}
			
			//存储文件
			$filePath = "./data/".$site_id."/".$page;
			file_write($filePath, $content);
			
			$data = $this->savePageToDatabase($page, $content, $site_id, $comp_type);

			if($data){
				$this->ajaxSuccess($data);
			} else {
				$this->ajaxError('无数据');
			}
		}
	}

	//模板保存
	public function saveTplForUse() {
		$uid = session("uid");
		S($uid."tempList","");//缓存清空
		$page = I('page', '', 'trim');
		$title = I("title", '', 'trim');
		$isSysTpl  = I("post.isSysTpl","","intval");
		print_r($isSysTpl);
		$jsonData = I("jsonData", '', 'trim');
		//$jsonData = str_replace("\\\"", "#yinhao#", trim($_POST["jsonData"]));
		//var_dump(trim($_POST["jsonData"]));
		//$component = I('component', 0, 'intval');
		$content = str_replace("\"", "\"", trim($_POST["content"]));
		
		//print_r(trim($_POST["content"]));
		$content = str_replace("\n", "", $content);
		//$title = I('title', '', 'trim');
		//$data = I('data');
		$site_id = I('siteId', 0, 'intval');
		//$comp_type = I('type', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$formInfo = D("Project")->getFormInfo($jsonData);

		$jsonData = $formInfo['formData'];
		
		$jsonData = json_decode($jsonData);
		//print_r($jsonData->controlLists);
		$actionArrs = array();
		foreach ($jsonData->controlLists as $key => $value) {
			if(isset($value->operations)){
				foreach ($value->operations as $n => $m) {
					D("Project")->changeDB($this->_project_id);
					$actionData = D("Project")->getActionDataById($m);
					$actionId = "action".time().random(5);
					$actionArrs["$actionId"] = $actionData;
					$jsonData->controlLists->$key->operations->$n=$actionId;
				}
			}
		}
	//	print_r($actionArrs);
		$actionArrs = json_encode_cn($actionArrs);
		$jsonData = json_encode_cn($jsonData);

		//组件入库
		if ($component) {
			$update = array('name' => $page, 'title' => $title, 'data' => $data, 'type' => $comp_type);
			D('Project')->saveComponent($update);
		}
		if ($page && $content && $site_id && $content) {
			$result = D("Project")->savePageTpl($page, $content, $site_id, 1);
			$data = array("name" => $page,"siteId"=>$site_id, "title" => $title, "userID" => $_SESSION['uid'], "type" => $isSysTpl, 'jsonData' => $jsonData, "actionData"=>$actionArrs,"addTime" => date("Y-m-d H:i:s", time()), "content"=>$content);
			$re = M("wx_muban")->add($data);
			$this->ajaxSuccess($result);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 获取网站组件列表
	 */
	public function getComponentList() {
		$site_id = I('siteId', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$list = D('Project')->getComponentList($site_id);
		if($list){
			$this->ajaxSuccess($list);
		}else{
			$this->ajaxError('无数据');
		}
	}


	/**
	 * 添加内容到模板
	 * @param string $page　模板名称
	 * @param string $content　写入内容
	 * @param int $site_id	站点ＩＤ
	 * @param string $suffix 模板后缀
	 * @param string $type  新增保存0和已经建的保存1
	 * @return string
	 */
	public function savePageToDatabase($page, $content, $site_id, $type = 2) {
		if ($page && $site_id) {
			if ($page == "config") {
				return D("UserSite")->saveMenuConfig($page, $content, $site_id);
			} else {
				D("Project")->changeDB($this->_project_id);
				return D("Project")->savePageTpl($page, $content, $site_id, $type);
			}

		}
		return false;
	}

	/**
	 * 根据模板ID，返回模板路径及body内容
	 * @return 文件内容
	 */
	public function loadPage() {
		$page = I('page', '', 'trim');
		$site_id = I('siteId', 0, 'intval');
		$component = I('component', 0, 'intval');
		if ($page && $site_id) {
			//获取站点模板路径
			//合并config和qyconfig配置到config文件
			/*if ($page === 'config' || $page === 'qyConfig') {
				$pageContent = '';
				$pageContent = $this->loadPageByDatabase('config', $site_id);
				$pageContent = json_decode($pageContent);
				if (!isset($pageContent->pageMenu)) {
					$qyContent = $this->loadPageByDatabase('qyConfig', $site_id);
					$pageContent->pageMenu = json_decode($qyContent);
				}
			} else {
				$pageContent = $this->loadPageByDatabase($page, $site_id);
			}*/

			if ($page == "config" || $page == "qyConfig") {
				$pageContent = file_get('./data/'.$site_id."/".$page);
				if($pageContent===false){
					$pageContent = M('userSite')->where("id='$site_id'")->getField("config");
				}
			} else {
				$pageContent = file_get('./data/'.$site_id."/".$page);
				if($pageContent===false){
					D("Project")->changeDB($this->_project_id);
					$pageContent = D("Project")->getPageContent($page, $site_id);
				}
				
				
			}

			$result['pageContent'] = $pageContent;

			//获取组件
			if ($component) {
				D("Project")->changeDB($this->_project_id);
				$result['componentInfo'] = D('Project')->getComponentInfo($page, $site_id);
			}
			
			$this->ajaxSuccess($result);
		} else {
			$this->ajaxError('参数错误');
		}
	}



	/**
	 * 保存表单基本信息
	 * @param	array 	$post 接收ajax对象
	 * @return	bool 	返回保存成功标识
	 */
	public function saveFormInfo() {
		$flow_id = I('post.flow_id', '', 'intval');
		$form_id = I('post.form_id', 0, 'intval');
		$form_title = I('post.form_title', '', 'trim');
		$json_data = I('post.json_data', '', 'trim');

		D("Project")->changeDB($this->_project_id);
		$data = D('Project')->saveFormInfo($flow_id, $form_id, $form_title, $json_data);
		if($data){
			$this->ajaxSuccess($data);
		} else {
			$this->ajaxError('无数据');
		}
		
	}

	/**
	 * 获取表单xml数据信息
	 * @param	int		$fid 表单ID
	 * @return xml	返回表单的详细xml数据
	 */
	public function getFormJson() {
		$id = I('post.id', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$frm_info = D('Project')->getFormInfo($id);

		$data = $frm_info['formData'];
		if($data){
			$this->ajaxSuccess($data);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 获取当前应用的绑定微信信息
	 * @param	int		$site_id
	 * @return	json
	 */
	public function getAppWechatInfo() {

		$data = D('PlatForm')->getAppWechatInfo($this->_site_id);

		if($data){
			$this->ajaxSuccess($data);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 同步发布微信公众号菜单
	 *
	 * @return JSON
	 */
	public function syncWechatMenu() {

		$siteInfo = D('UserSite')->getSiteInfo($this->_site_id);
		if (!$siteInfo) {
			$this->ajaxError('站点信息不存在');
		}

		if (!$siteInfo['wechatId']) {
			$this->ajaxError('应用没有绑定微信公众号');
		}

		$appInfo = D('Apps/Wechat')->getAppInfoBySiteId($siteInfo['wechatId'], $this->_site_id);
		if (C('SUPPER_WECHAT_ID') == $siteInfo['wechatId'] && $appInfo['agentId'] > 0) {
			$this->ajaxError('虚拟号禁止绑定公众号菜单');
		}

		$wechat = D('Apps/Wechat')->getInfoById($siteInfo['wechatId']);
		if (!$wechat) {
			$this->ajaxError('应用没有绑定微信公众号');
		}

		if (!($wechat['app_id'] && $wechat['app_secret'])) {
			$this->ajaxError('微信没有认证不能同步菜单');
		}

		//微企应用添加菜单URL到微信菜单表
		$content = $this->getTempaltePageContent('config', $this->_site_id);
		if (!$content) {
			$this->ajaxError('请先设置应用菜单');
		}

		//菜单组装
		$config_content = objectToArray(json_decode(urldecode($content)));
		$menuList = $config_content['pageMenu'];

		$data = array();
		$key = 0;
		//print_r($menuList);
		foreach ($menuList as $pageId => $menu) {
			$data[$key] = array('name' => $menu['menuName']);
			if (isset($menu['subMenu']) && $menu['subMenu']) {
				$count = count($menu['subMenu']) - 1;
				foreach ($menu['subMenu'] as $subPage => $subMenu) {
					$m = 0;
					if ($m > 4) {
						break;
					}

					$data[$key]["sub_button"][$count] = array('url' => U('/Site/Wechat/checkUser', array('pageId' => $subPage, 'siteId' => $site_id), false, false, true), 'name' => $subMenu['menuName'], 'type' => isset($subMenu['type']) ? $subMenu['type'] : 'view', 'key' => isset($subMenu['key']) ? $subMenu['key'] : '');
					$count--;
					$m++;
				}
				ksort($data[$key]["sub_button"]);

			} else {
				$data[$key]['type'] = isset($menu['type']) ? $menu['type'] : 'view';
				$data[$key]['url'] = U('/Site/Wechat/checkUser', array('pageId' => $pageId, 'siteId' => $site_id), false, false, true);
				$data[$key]['key'] = isset($menu['key']) ? $menu['key'] : '';
			}
			$key++;
		}

		//推送菜单到微信公众号
		importORG('Wechat.WechatBase');
		importORG('Wechat.Menu');
		$weMenu = new Menu($wechat['app_id'], $wechat['app_secret']);
		$res = $weMenu->menuCreate($data);
		if ($res) {
			$this->ajaxSuccess('','菜单同步到微信成功！');
		} else {
			$this->ajaxError('同步失败:' . $weMenu->getErrorInfo());
		}

	}

	/**
	 * 验证站点是否存在
	 * @return bool 站点存在返回true 不存在返回false
	 */
	public function isUserSite() {
		if ($this->_site_id) {
			$userSiteModel = D("UserSite");
			$list = $userSiteModel->getSiteInfo($this->_site_id, 'sitePath');
			if ($list) {
				echo true;
			} else {
				echo false;
			}
		} else {
			echo false;
		}
	}

	/**
	 * 根据用户ID获取图片分类信息
	 */
	public function userImgType() {
		$user_id = session('uid');
		$fileType = isset($_POST["type"]) ? trim($_POST["type"]) : '';
		//ljp  2014.1.2
		$imgModel = D('UserImage');
		//获取图片类型分类
		$imgTyepList = $imgModel->getUserImageTypeList($user_id, $fileType);
		//lip
		if ($imgTyepList) {
			foreach ($imgTyepList as &$type) {
				$map = array('userId' => $user_id, 'imgTypeId' => $type['id'], 'fileType' => $fileType, 'siteId' => $this->_site_id);
				$type['imgNum'] = $imgModel->getUserImageCount($map);
				//图片总数
				$type['imgTypeId'] = $type['id'];
			}
			unset($type);
		}
		$this->ajaxSuccess($imgTyepList);

	}

	/**
	 * 根据用户ID获取该用户所有图片
	 */
	public function userAllImg() {
		$imgModel = D('UserImage');

		$where['userId'] = session('uid');
		$where['siteId'] = $this->_site_id;
		//用户ID
		$imageList = $imgModel->getUserImageList($where);
		if($imageList){
			$this->ajaxSuccess($imageList);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 根据用户ID及分类ID获取该分类的图片
	 */
	public function userTypeImg() {
		$imgTypeId = isset($_POST['imgTypeId']) ? intval($_POST['imgTypeId']) : 0;
		//图片分类ID
		// $page = isset($_POST['pageIndex']) ? intval($_POST['pageIndex']) : 1;   //当前页
		// $pageSize = isset($_POST['pageSize']) ? intval($_POST['pageSize']) : 10;    //每页显示数量
		$fileType = isset($_POST["type"]) ? trim($_POST["type"]) : '';
		//判断文件类型   ljp

		$imgModel = D('UserImage');

		$where['userId'] = session('uid');
		$where['siteId'] = $this->_site_id;
		//用户ID
		$where['fileType'] = $fileType;
		//ljp
		if ($imgTypeId) {
			$where['imgTypeId'] = $imgTypeId;
		}

		$imgCount = $imgModel->getUserImageCount($where);
		//图片总数
		$imageList = $imgModel->getUserImageList($where);
		//, $page, $pageSize);
		//返回结果
		$result = array('total' => $imgCount, 'imgList' => $imageList ? $imageList : array());
		// echo $result;
		$this->ajaxSuccess($result);
	}

	/**
	 * 根据用户ID、图片分类ID添加用户图片，返回图片信息
	 */
	public function uploadUserImg() {
		$fileType = isset($_POST["type"]) ? trim($_POST["type"]) : '';
		$user_id = session('uid');
		//用户ID
		$imgTypeId = isset($_POST['imgTypeId']) ? intval($_POST['imgTypeId']) : 0;
		$fileList = $this->_upload(C('PICTURE_UPLOAD'));
		if ($fileList['error']) {
			$this->ajaxError($fileList['info']);
			//上传错误
		} else {
			$imgInfo = $fileList['info'];
			$imgList = array();
			$user_img_model = D('UserImage');
			//图片循环入库
			foreach ($imgInfo as $file) {
				$set = array('imgUrl' => $file['url'], 'imgName' => $file['name'], 'imgTypeId' => $imgTypeId, 'fileType' => $fileType, 'userId' => $user_id, 'siteId' => $this->_site_id);
				//入库
				$img_id = $user_img_model->addUserImage($set);
				if ($img_id) {
					$set['id'] = $img_id;
					if (!$fileType) {
						$set['imgThumb'] = getImageUrl($set['imgUrl'], 150, 150, true);
					}
					if(C("UPLOAD_URL")=="/uploads/"){
						$set['imgUrl'] = $set['imgUrl'];
					}else{
						$set['imgUrl'] = getImageUrl($set['imgUrl']);
					}
				}
				$imgList[] = $set;
			}
			$result = array('total' => count($imgInfo), 'imgList' => $imgList);
		}
		unset($imgList, $fileList, $imgInfo, $set);
		$this->ajaxSuccess($result);
	}

	/**
	 * 根据用户图片ID删除用户图片
	 */
	public function delUserImg() {
		$img_id = isset($_POST['imgId']) ? intval($_POST['imgId']) : 0;
		if ($img_id) {
			$user_image_type_model = D('UserImage');
			$res = $user_image_type_model->deleteUserImage($img_id);
			$this->ajaxSuccess($res);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 添加图片分类，返回分类ID
	 */
	public function addUserImgType() {
		$imgTypeName = trim($_POST['typeName']);
		//图片分类名称
		$fileType = isset($_POST["type"]) ? trim($_POST["type"]) : '';
		if (!empty($imgTypeName)) {
			$user_image_type_model = D('UserImage');
			$userImgTypeId = $user_image_type_model->addUserImageType(session('uid'), $imgTypeName, $fileType);
			$this->ajaxSuccess($userImgTypeId);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 根据用户图片分类ID，修改分类名称
	 */
	public function modifyUserImgType() {
		$imgTypeId = isset($_POST['imgTypeId']) ? intval($_POST['imgTypeId']) : 0;
		$imgTypeName = isset($_POST['imgTypeName']) ? trim($_POST['imgTypeName']) : '';
		if ($imgTypeId && $imgTypeName) {
			$user_image_type_model = D('UserImage');
			$result = $user_image_type_model->editUserImageType(session('uid'), $imgTypeId, $imgTypeName);
			$this->ajaxSuccess($result);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/**
	 * 根据用户ID、图片分类ID，删除该图片分类，并将该分类下所有图片的图片分类ID设为0
	 */
	public function delUserImgType() {
		$imgTypeId = isset($_POST['imgTypeId']) ? intval($_POST['imgTypeId']) : 0;
		if ($imgTypeId) {
			$user_image_type_model = D('UserImage');
			$result = $user_image_type_model->deleteUserImageType(session('uid'), $imgTypeId);
			$this->ajaxSuccess($result);
		} else {
			$this->ajaxError('无数据');
		}
	}

	/*
	 * 获取浏览层模板信息
	 */
	public function getLayoutTpl() {
		$tplId = I("post.tplid", "", "intval");
		$type = I("post.type",  "", "intval");
		if ($tplId == 0) {
			$this->ajaxError('无数据');
		}
		//$info  = S("layoutTpl".$tplId);
		if (empty($info)) {
			if($type==1){
				$info = M("wx_muban")->where("ID=$tplId")->find();
				
				//处理动作json
				$jsonData = json_decode($info['jsonData']);
				$actionArr = json_decode($info['actionData']);
				//print_r($actionArr);
				//exit;
				//print_r($jsonData->controlLists);
				foreach ($jsonData->controlLists as $key => $value) {
					if(isset($value->operations)){
						foreach ($value->operations as $n => $m) {
							$actionJson = $actionArr->$m->actionData;
							D("Project")->changeDB($this->_project_id);
							$action_id = D("Project")->saveFormActionData(0,$actionJson);
							$jsonData->controlLists->$key->operations->$n=$action_id;
						}
					}
				}
				$info['jsonData'] = json_encode_cn($jsonData);
				
				
				
			}else{
				$info = M("wx_muban")->where("id='$tplId'")->find();
			}
			//S("layoutTpl" . $tplId, $info);
		}
		echo json_encode($info);
		exit;
		$this->ajaxSuccess("info");
		
	}
	

	/*
	 * 获取微观模板列表的
	 * 
	 * */
	 public function getLayoutTplList(){
	 	$type = I("post.type","","intval");
	 	
	 		$where =array('type'=>$type);
	 	
	 	$db=M("wx_muban");
	 	$re = $db->field("id,title,imgurl")->where($where)->select();
	 	unset($db);
		$this->ajaxSuccess($re);
	 }
	 
	 	/**
	 * 删除一个表单
	 * @param	int		$id 表单ID
	 * @param  string $pageId
	 * @return	boolean
	 */
	public function delAForm() {
		$form_id = I('post.form_id', 0, 'intval');
		$page_id = I('post.pageId', "", "trim");

		D("Project")->changeDB($this->_project_id);
		echo D('Project')->delAForm($form_id, $page_id);
	}
	
	//获取自己保存的模板
	public function  getMyTempList(){
		$uid = session("uid");
		$source = S($uid."tempList");
		
			$re = M("wx_muban")->where("userID=$uid")->field("ID,title")->select();
			S($uid."tempList",$re);
			
			echo json_encode_cn($re);
		
		
	}
		//获取自己保存的模板
	public function getMyTempContent(){
		$tplId = I("tplId", "", "intval");
		$siteId = I("siteId","","intval");
		$result = M("wx_muban")->where("ID=$tplId")->find();
		if($result){
			echo json_encode_cn($result);
		}else{
			echo "0";
		}
	}	
	

}
