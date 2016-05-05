<?php
/**
 * 前台模板控制器
 *
 * @author cjli
 *
 */
class TemplateAction extends HomeAction {
	/**
	 * 初始化会员中心
	 */
	public function _initialize() {
		parent::_initialize();

		if (in_array(I('session.uid'), array(28, 1, 6, 2, 128, 24))) {
			$url_dev = '<div id="btn_dev">设计者</div>';
			$this->assign("developPage", $url_dev);
		}
	}

	/**
	 * 模板首页
	 */
	public function index() {
		//获取用户信息
		if (!session('uid')) {
			$this->redirect("Index/index");
		}
		$template_category_list = D('UserSite')->getUserSiteCategoryTree(0, 'id,parentId,nameCN,nameEN,nameTW');

		$temp_type = I('get.type', 10, 'intval');

		if ($temp_type < 10) {
			$temp_type += 10;
		}

		//echo '--'.$temp_type;
		/** */
		if ($temp_type > 39) {
			$edit_name = "ezApp";
		} else {
			$edit_name = $temp_type > 19 ? 'ezQ微企' : 'ezSite';
		}

		$this->assign('temp_type', floor($temp_type / 10));
		$this->assign('edit_name', $edit_name);
		$this->assign('template_category_list', $template_category_list);
		$this->assign('tpl_type', $temp_type);
		$this->display('template_list');

	}

	/**
	 * 模板页搜索
	 */
	public function search() {
		$post = I('post.');
		$title = trim($post['title']);
		$color = intval($post['color']);
		$sort = trim($post['sort']);
		$cate = intval($post['cate']);
		$page = intval($post['page']);

		$model = D('UserSite');
		$pageRow = 9;
		$where = array();

		$type = intval($post['type']);
		//$type 0:me,1:official,2:back

		$where['siteTempType'] = 0;
		switch ($type) {
			case 1:{
					//官方模板
					$where['isShare'] = 1;
					break;
				}
			case 2:{
					//应用商店-模板网站
					$where['isShare'] = 3;
					break;
				}
			case 5:
				{
					//应用商店-微企应用
					$where['siteTempType'] = 1;
					$where['isShare'] = 3;
				}
				break;
			case 10:{
					//ezSite设计者-最近模板
					//$where['isShare'] = 3;
					$where['userId'] = session('uid');
					$where['isShare'] = -1;
					$where['order'] = 'addTime DESC';
					$pageRow = 6;
					break;
				}
			case 11:{
					//ezSite设计者-自己的模板
					$where['isShare'] = 3;
					$where['userId'] = session('uid');
					break;
				}
			case 12:{
					//ezSite设计者-官方模板
					$where['isShare'] = 1;
					break;
				}
			case 13:{
					//ezSite设计者-空白模板
					$where['isShare'] = 2;
					break;
				}
			case 20:{
					//ezQ设计者-最近模板
					//$where['isShare'] = 3;
					$where['userId'] = session('uid');
					$where['isShare'] = -1;
					$where['orderNo'] = '';
					$where['order'] = 'addTime DESC';
					$where['siteTempType'] = 1;
					$pageRow = 6;
					break;
				}
			case 21:{
					//ezQ设计者-自己的模板
					$where['isShare'] = 3;
					$where['userId'] = session('uid');
					$where['siteTempType'] = 1;
					break;
				}
			case 22:{
					//ezQ设计者-官方模板
					$where['isShare'] = 1;
					$where['siteTempType'] = 1;
					break;
				}
			case 23:{
					//ezQ设计者-空白模板
					$where['isShare'] = 2;
					$where['siteTempType'] = 1;
					break;
				}
			case 40:{
					//ezApp设计者-最近模板
					$where['userId'] = session('uid');
					$where['isShare'] = -1;
					$where['order'] = 'addTime DESC';
					$where['siteTempType'] = 2;
					$pageRow = 6;
					break;
				}
			case 41:{
					//ezApp设计者-自己的模板
					$where['isShare'] = 3;
					$where['userId'] = session('uid');
					$where['siteTempType'] = 2;
					break;
				}
			case 42:{
					//ezApp设计者-官方模板
					$where['isShare'] = 1;
					$where['siteTempType'] = 2;
					break;
				}
			case 43:{
					//ezApp设计者-空白模板
					$where['isShare'] = 2;
					$where['siteTempType'] = 2;
					break;
				}
			case 50:{
					//微观-最近模板
					$where['userId'] = session('uid');
					$where['isShare'] = -1;
					$where['order'] = 'addTime DESC';
					$where['siteTempType'] = 3;
					$pageRow = 6;
					break;
				}
			case 51:{
					//微观-自己的模板
					$where['isShare'] = 3;
					$where['userId'] = session('uid');
					$where['siteTempType'] = 3;
					break;
				}
			case 52:{
					//微观-官方模板
					$where['isShare'] = 1;
					$where['siteTempType'] = 3;
					break;
				}
			case 53:{
					//微观-空白模板
					$where['isShare'] = 2;
					$where['siteTempType'] = 3;
					break;
				}
			case 54:{
					//微观-会员分享
					$where['isShare'] = 3;
					$where['siteTempType'] = 3;
					break;
				}

			default:{
					$where['isShare'] = array('eq', 3);
				}
		}

		//排序种类
		$sortArray = array('new' => 'id DESC', //最新模板
			'click' => 'siteCount DESC', //最受欢迎模板
		);

		//搜索名称
		if ($title) {
			$where['siteDisplayName'] = $title;
		}
		//搜索分类
		if ($cate) {
			$where['siteCategoryId'] = $cate;
		}
		//搜索颜色
		if ($color) {
			$where['colorId'] = $color;
		}
		//搜索排序
		if ($sort && $sortArray[$sort]) {
			$where['order'] = $sortArray[$sort];
		}

		$page = $page ? $page : 1;

		//获取模板列表
		$template_count = $model->getUserSiteCount($where);

		$templateList = $model->getUserSiteList($where, $page, $pageRow);
		$pageCount = ceil($template_count / $pageRow);

		$result = array('pageCount' => $pageCount, 'list' => $templateList);

		$this->ajaxReturn($result, 'JSON');

	}

	/**
	 * 会员模板分享
	 */
	public function shareTemplate() {

		$siteId = I('siteId', 0, 'intval');
		if (!$siteId) {
			redirect('_ERROR_ACTION_', U('Account/userCenter'));
		}

		$siteInfo = D('UserSite')->getSiteInfo($siteId);
		if (!$siteInfo) {
			redirect('_ERROR_ACTION_', U('Account/userCenter'));
		}

		if (!session('uid')) {
			redirect('_ERROR_ACTION_', U('Account/userCenter'));
		}

		if (IS_POST) {

			$set['siteName'] = I('post.templateTitle');
			//$set['content'] = I('post.templateContent');
			$set['siteCategoryId'] = I('post.templateTypeId', 0);
			$set['colorId'] = I('post.templateColor', 0);
			$set['price'] = I('post.templatePrice');
			$set['user_name'] = I('post.user_name');
			$set['siteDescription'] = I('post.siteDescription', '', 'trim');

			$result = array('error' => 1, 'message' => '');

			import('ORG.Util.Validate');

			if (!Validate::check($set['price'], 'currency')) //验证格式
			{
				$result['message'] = L('price_format_error');
			} elseif ($set['siteName'] == '') {
				$result['message'] = '模板名称不能为空';
			} elseif ($set['user_name'] == '') {
				$result['message'] = '设计师名称不能为空';
			} else {
				$thumbPath = I('post.thumbPath', '', 'trim');
				$imgPreviewList = I('post.imgPreviewList', '', 'trim');

				/*if ($thumbPath) {
				$domain = C('UPLOAD_PATH');
				//上传目录
				$thumbPath = str_replace($domain, '', $thumbPath);
				$thumbPath = str_replace(ltrim($domain, '.'), '', $thumbPath);
				}*/

				$set['addTime'] = time();
				$set['isShare'] = 3;
				//会员分享
				$set['userId'] = $siteInfo['userId'];
				$set['thumbPath'] = isset($thumbPath) ? $thumbPath : '';
				$set['imgPreviewList'] = $imgPreviewList;
				$set['status'] = 1;
				$set['config'] = $siteInfo['config'];

				$tpl_id = M('UserSite')->add($set);
				if ($tpl_id) {

					$model = D('UserSite');
					//模板目录
					$tempalte_path_name = $model->marketSitePath($tpl_id);

					$user_id = session('uid');
					//模板目录全路径
					//$template_save_path = get_user_dir($tempalte_path_name, $siteInfo['userId'], $siteInfo['siteTempType']);

					//用户站点目录
					//$user_site_dir = get_user_dir($siteInfo['sitePath'], $user_id, $siteInfo['siteTempType']);

					//拷贝站点到模板目录
					//file_dir_copy($user_site_dir, $template_save_path);

					//为什么不在上面一起添加????
					$new_set = array('sitePath' => $tempalte_path_name, 'siteUrlPath' => $tempalte_path_name, 'siteTypeId' => $siteInfo['siteTypeId'], 'siteTempType' => $siteInfo['siteTempType']);
					M('userSite')->where(array('id' => $tpl_id))->save($new_set);

					//应用出售自动绑定到虚拟号
					if ($siteInfo['siteTempType'] == 1) {
						$wechat_id = C('SUPPER_WECHAT_ID');
						//生成微信公众号应用
						$set = array('name' => $siteInfo['siteName'], 'icon' => $siteInfo['thumbPath'], 'siteId' => $tpl_id, 'description' => $siteInfo['siteDescription']);

						D('Apps/Wechat')->editWechatApp($wechat_id, $set);
						D('UserSite')->editSite($tpl_id, array('wechatId' => $wechat_id));
						session('wechatId', $wechat_id);
					}

					//TODO复制后台项目ID
					$status = D('SiteProject')->copyProjectToApp($siteId, $tpl_id);
					switch ($status) {
						case -1:
							$result['message'] = '网站不存在';
							break;
						case -2:
							$result['message'] = '网站表单设计器不存在';
							break;
						case -3:
							$result['message'] = '新后台创建失败';
							break;
						case -4:
							$result['message'] = '新后台结构复制失败';
							break;
						default:
							$result['error'] = 0;
					}

				} else {
					$result['message'] = '分享保存数据时失败！';
				}
			}
			echo json_encode($result);
			exit;
		}

		$model = D('UserSite');
		$template_category_list = $model->getUserSiteCategoryTree(0, 'id,parentId,nameCN,nameEN,nameTW');

		$this->assign('template_category_list', $template_category_list);
		$this->assign('siteInfo', $siteInfo);
		$this->assign('is_free', I('param.is_free', 0, 'intval'));
		$tpl = I('get.type');
		$this->display('shareTemplate' . ($tpl ? '_' . $tpl : ''));
	}

	/**
	 * 获取用户站点名称
	 * @param	string	$site_name 站点名称
	 * @return 	boolean
	 */
	public function getUserSiteName() {
		$site_name = I('post.siteName', '', 'trim');
		$user_id = I('session.uid', 0);
		$img_data = I('post.imgData', '', 'trim');

		echo D('UserSite')->getUserSiteName($site_name, $user_id, $img_data);
	}

	/**
	 * 上传应用截图信息
	 *
	 */
	public function uploadAppPreview() {
		$extArr = array('jpg', 'jpeg', 'png', 'gif');

		if (isset($_POST) and $_SERVER['REQUEST_METHOD'] == 'POST') {
			$name = $_FILES['photoimg']['name'];
			$size = $_FILES['photoimg']['size'];

			if (empty($name)) {
				echo '请选择要上传的图片';
				exit;
			}
			$extend = pathinfo($name);
			$extend = strtolower($extend['extension']);

			if (!in_array($extend, $extArr)) {
				echo '图片格式错误！';
				exit;
			}
			if ($size > (512 * 1024)) {
				echo '图片大小不能超过512KB';
				exit;
			}

			$info = $this->_upload();
			if ($info) {
				echo '<img src="' . $info['info'][0]['url'] . '"  class="preview">';
			} else {
				echo '上传出错了！';
			}
		}
		exit;
	}

	/**
	 * 模板收费下单
	 */
	public function order_flow() {
		$tpl_id = isset($_GET['tplId']) ? intval($_GET['tplId']) : 0;
		$templateInfo = D('UserSite')->getSiteInfo($tpl_id);
		if (!$templateInfo) {
			redirect(U('Template/index'), 3, '非法编辑站点');
		}

		//如果模板要收费
		if (!floatval($templateInfo['price'])) {
			redirect(U('Qywx/Editor/edit', array('tplId' => $tpl_id)));
		}

		//if(IS_POST) {
		//下单
		$order_id = D('TradeInfo')->saveUserOrderInfo($tpl_id, $templateInfo['price'], session('uid'), 1, 1, 2);
		if (!$order_id) {
			redirect(U('Template/order_flow'), 3, '下单失败');
		}

		redirect(U('Template/order_confim', array('oid' => $order_id)));
		//}

		//$this->assign('template', $templateInfo);
		//$this->display();
	}

	/**
	 * 模板下单确认
	 */
	public function order_confim() {
		$order_id = isset($_GET['oid']) ? intval($_GET['oid']) : 0;

		$orderInfo = D('TradeInfo')->getUserOrderInfo($order_id);
		if (!$orderInfo) {
			redirect(U('Template/index'), 3, '下单失败');
		}

		$templateInfo = D('UserSite')->getSiteInfo($orderInfo['releaseID']);
		if (!$templateInfo) {
			redirect(U('Template/index'), 3, '非法编辑站点');
		}

		$this->assign('template', $templateInfo);
		$this->assign('order', $orderInfo);
		$this->display();
	}
	/**
	 * 返回用户模板路径
	 * @param int $site_id 站点ID
	 * @return 站点路径
	 */
	private function _getUserTemplatePath($site_id) {
		$user_site = D('UserSite');
		$siteInfo = $user_site->getSiteInfo($site_id);
		if ($siteInfo) {
			$path = get_user_dir($siteInfo['sitePath'], $siteInfo['userId'], $siteInfo['siteTempType']);
			//echo "模板路径:", $path;
			return $path;
		}
		return false;
	}

//无用
	public function copyTplToDatabase() {
		$p = I("page", 1);

		$db = M("userSite");
		$count = $count = $db->where("userProjectId>0")->count();
		print_r($count);
		$re = $db->where("userProjectId>0")->field("userProjectId,id,sitePath,userId")->page($p . ",50")->select();
		//$re = $db -> where("userProjectId>0") -> field("userProjectId,id,sitePath,userId")-> select();
		foreach ($re as $key => $value) {
			//print_r($key."ASD");

			$path = $this->_getUserTemplatePath($value["id"]);

			$url = $path . "/";
			//$url = "./wxsite/user_" . $value['userId'] . "/" . $value['sitePath'] . "/";
			$config_url = $url . "config";
			$content = file_get($config_url);
			if (!empty($content)) {
				session("pid", $value["userProjectId"]);
				echo 'start - pid - ' . session('pid') . "<br/>";
				$data = array("config" => $content);
				$id = $value['id'];
				$res = $db->where("id='$id'")->save($data);
				print_r($content);
				$pageArr = (json_decode($content));

				//print_r($pageArr->pageManage);
				foreach ($pageArr->pageManage as $k => $v) {
					$pageId = $v->page;
					$pageContent = file_get($url . $pageId);
					dump($pageContent);
					if (!empty($pageContent)) {
						$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
					}
				}
				foreach ($pageArr->pageMgr as $k1 => $v1) {
					$pageId = $v1->page;
					$pageContent = file_get($url . $pageId);
					if (!empty($pageContent)) {
						$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
					}
				}
				foreach ($pageArr->pageMenu as $k2 => $v2) {
					$obj = (array) $v2->subMenu;

					if (!empty($obj)) {
						foreach ($v2->subMenu as $m => $n) {
							$pageId = $m;
							$pageContent = file_get($url . $pageId);
							if (!empty($pageContent)) {
								$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
							}
						}
					} else {
						$pageId = $k2;
						$pageContent = file_get($url . $pageId);
						if (!empty($pageContent)) {
							$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
						}
					}

				}

			}
		}
	}

	public function copyTplToDatabaseFordiy() {
		$p = I("page", 1);
		$db = M("userSite");
		$count = $count = $db->where("userProjectId>0")->count();
		print_r($count);
		$re = $db->where("userProjectId>0")->field("userProjectId,id,sitePath,userId")->page($p . ",50")->select();
		//$re = $db -> where("userProjectId>0") -> field("userProjectId,id,sitePath,userId")-> select();
		foreach ($re as $key => $value) {
			//print_r($key."ASD");

			$path = $this->_getUserTemplatePath($value["id"]);

			$url = $path . "/";
			//$url = "./wxsite/user_" . $value['userId'] . "/" . $value['sitePath'] . "/";

			$config_url = $url . "qyConfig";
			$qycontent = file_get($config_url);

			if (!empty($qycontent)) {
				session("pid", $value["userProjectId"]);
				//echo 'start - pid - ' . session('pid') . "<br/>";
				// $data = array("config" => $content );
				// $id = $value['id'];
				// $res = $db -> where("id='$id'") -> save($data);
				//print_r($qycontent);
				$pageArr = (json_decode($qycontent));

				//print_r($pageArr->pageManage);
				foreach ($pageArr as $k3 => $v3) {
					$obj = (array) $v3->subMenu;

					if (!empty($obj)) {
						foreach ($v3->subMenu as $m => $n) {
							$pageId = $m;
							$pageContent = file_get($url . $pageId);
							if (!empty($pageContent)) {

								$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
							}
						}
					} else {
						$pageId = $k3;
						$pageContent = file_get($url . $pageId);
						if (!empty($pageContent)) {
							$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
						}
					}
				}

			}

			$config_url = $url . "config";
			$content = file_get($config_url);
			if (!empty($content)) {
				$pageArr = (json_decode($content));

				session("pid", $value["userProjectId"]);
				//echo 'start - pid - '. session('pid')."<br/>";

				//print_r($content);

				//print_r($pageArr->pageManage);
				foreach ($pageArr->pageManage as $k => $v) {
					$pageId = $v->page;
					$pageContent = file_get($url . $pageId);
					//dump($pageContent);
					if (!empty($pageContent)) {
						$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
					}
				}
				foreach ($pageArr->pageMgr as $k1 => $v1) {
					$pageId = $v1->page;
					$pageContent = file_get($url . $pageId);
					if (!empty($pageContent)) {
						$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
					}
				}
				foreach ($pageArr->pageMenu as $k2 => $v2) {
					$obj = (array) $v2->subMenu;

					if (!empty($obj)) {
						foreach ($v2->subMenu as $m => $n) {
							$pageId = $m;
							$pageContent = file_get($url . $pageId);
							if (!empty($pageContent)) {

								$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
							}
						}
					} else {
						$pageId = $k2;
						$pageContent = file_get($url . $pageId);
						if (!empty($pageContent)) {
							$good = D("Project")->savePageTpl($pageId, $pageContent, $id, 2);
						}
					}

				}
				$qyconfigarr = (array) (json_decode($qycontent));
				if (!empty($qyconfigarr)) {

					$pageArr->pageMenu = json_decode($qycontent);
				}
				$savecontent = $pageArr;
				$savecontent = json_encode($savecontent);
				if (!empty($qycontent) && !empty($content)) {
					print_r($qycontent . "  AAAAAA<br/>");
					print_r($content . "  BBBBBBB <br/>");
					print_r($savecontent . "  CCCCCC <br/><br/>");
				}
				$data = array("config" => $savecontent);
				$id = $value['id'];
				$res = $db->where("id='$id'")->save($data);

			}

		}
	}

}
