<?php
/**
 * 后台模板管理
 *
 * @author cjli
 *
 */
class TemplateAction extends AdminAction {
	/**
	 * 首页
	 */
	public function index() {
		$this->templateList();
	}

	/**
	 * 模板列表
	 */
	public function templateList() {
		$site_type = isset($_REQUEST['type']) ? intval($_REQUEST['type']) : 1;
		$template_cate = isset($_REQUEST['cate']) ? intval($_REQUEST['cate']) : 0;
		$color = isset($_REQUEST['color']) ? intval($_REQUEST['color']) : 0;
		$title = isset($_REQUEST['title']) ? $_REQUEST['title'] : '';
		$time_start = isset($_REQUEST['time-start']) ? $_REQUEST['time-start'] : '';
		$time_end = isset($_REQUEST['time-end']) ? $_REQUEST['time-end'] : '';
		$designer = isset($_REQUEST['designer']) ? $_REQUEST['designer'] : '';
		$temp_type = isset($_REQUEST['temp_type']) ? intval($_REQUEST['temp_type']) : 0;

		//网站类型列表
		$site_type_list = C('SITE_TYPE_LIST');
		//模板颜色列表
		$template_color_list = C('TEMPLATE_COLOR');
		//模板分类
		$category_list = D('UserSite')->getUserSiteCategoryTree(0, 'id,parentId,nameCN', false);
		$template_category_list = $templateCategoryArray = array();
		if ($category_list) {
			//分类树形
			$template_category_list = list_to_tree($category_list, $pk = 'id', $pid = 'parentId', $child = 'child');
			//分类键值对
			foreach ($category_list as $cat) {
				$templateCategoryArray[$cat['id']] = $cat['nameCN'];
			}
		}

		//获取列表数据
		$map['status'] = array('gt', -1);
		$map['isShare'] = array('gt', -1);

		if ($template_cate) {
			$map['siteCategoryId'] = $template_cate;
		}
		if ($site_type) {
			$map['siteTypeId'] = $site_type;
		}
		$map['siteTempType'] = $temp_type;

		//名称或者编号
		if ($title) {
			$where = array(
				'sitePath' => array('like', '%' . $title . '%'),
				'siteDisplayName' => array('like', '%' . $title . '%'),
				'_logic' => 'OR',
			);
			$map['complex'] = $where;
		}
		//时间
		if ($time_end && $time_start) {
			$map['addTime'] = array(array('egt', strtotime($time_start)), array('elt', strtotime($time_end . ' 23:59:59')), 'and');
		} elseif ($time_start) {
			$map['addTime'] = array('egt', strtotime($time_start));
		} elseif ($time_end) {
			$map['addTime'] = array('elt', strtotime($time_end . ' 23:59:59'));
		}

		if ($designer) {
			$map['user_name'] = $designer;
		}

		$templateList = $this->lists('UserSite', $map);
		/*array(8) {
		["id"] => string(2) "21"
		["templateTypeId"] => string(1) "1"
		["siteTypeId"] => string(1) "0"
		["thumbPath"] => string(25) "/Tpl_Image/hotels-5-a.jpg"
		["templatePath"] => string(0) ""
		["templateName"] => string(6) "text10"
		["status"] => string(1) "1"
		["addTime"] => string(10) "1234567891"
		}*/

		int_to_string($templateList);

		$this->assign('templateList', $templateList);
		$this->meta_title = '模板列表';

		$this->assign('site_type', $site_type);
		$this->assign('template_cate', $template_cate);
		$this->assign('color', $color);
		$this->assign('title', $title);
		$this->assign('time_start', $time_start);
		$this->assign('time_end', $time_end);
		$this->assign('designer', $designer);

		$this->assign('site_type_list', $site_type_list);
		$this->assign('template_category_list', $template_category_list);
		$this->assign('templateCategoryArray', $templateCategoryArray);
		$this->assign('template_color_list', $template_color_list);
		$this->assign('site_type', $site_type);
		$this->display('template_list');
	}

	/**
	 * 添加模板
	 */
	public function templateAdd() {
		$model = D('UserSite');

		$info = array();

		if (IS_POST) {
			$result = $model->templateUpdate();
			if (!$result) {
				$this->error($model->getError());
			} else {
				$this->success('添加模板成功', U('Template/templateList'));
			}

		} else {
			$info['status'] = 1;
			$template_category_list = D('UserSite')->getUserSiteCategoryTree(0, 'id,parentId,nameCN', true);
			$this->assign('template_category_list', $template_category_list);
			$this->assign('info', $info);
			$this->display('template_edit');
		}
	}

	/**
	 * 编辑模板
	 * @param int $id 编号
	 */
	public function templateEdit($id = 0) {
		$model = D('UserSite');

		$info = array();
		if ($id) {
			$info = $model->getSiteInfo($id);
			if (!$info) {
				$this->error('编辑模板不存在');
			}
			/*if($info['file_id']) {
		$info['file'] = M('File')->find($info['file_id']);
		}*/
		}

		if (IS_POST) {
			$result = $model->templateUpdate();
			if (!$result) {
				$this->error($model->getError());
			} else {
				$this->success('编辑模板成功', U('Template/templateList'));
			}

		} else {
			$template_category_list = D('UserSite')->getUserSiteCategoryTree(0, 'id,parentId,nameCN', true);
			$this->assign('template_category_list', $template_category_list);
			$this->assign('info', $info);
			$this->display('template_edit');
		}
	}

	/**
	 * 删除模板
	 */
	public function templateRemove() {
		$id = I('get.id', '');

		if (!$id) {
			$this->error('无效模板ＩＤ');
		}

		$model = D('UserSite');
		$info = $model->getSiteInfo($id);
		if (!$info) {
			$this->error('删除模板不存在');
		}

		$model->deleteSite($id);

		$this->success('模板删除成功');
	}

	/**
	 * 模板类型列表
	 */
	public function templateTypeList() {
		$tree = D('UserSite')->getUserSiteCategoryTree(0, 'id,nameCN,nameEN,nameTW,sort,parentId,status');
		$this->assign('tree', $tree);

		C('_SYS_GET_CATEGORY_TREE_', true); //标记系统获取分类树模板
		$this->meta_title = '模板分类管理';
		//dump($template_type_list);exit;
		$this->display('template_type_list');
	}

	/* 编辑分类 */
	public function templateTypeEdit($id = null, $pid = 0) {
		$Category = D('UserSite');

		if (IS_POST) {
			//提交表单
			if (false !== $Category->userSiteCategoryUpdate()) {
				$this->success('编辑成功！', U('Ｔemplate/templateTypeList'));
			} else {
				$error = $Category->getError();
				$this->error(empty($error) ? '未知错误！' : $error);
			}
		} else {
			$cate = '';
			if ($pid) {
				/* 获取上级分类信息 */
				$cate = $Category->getUserSiteCategoryInfo($pid, 'id,nameCN,status');
				if (!($cate && 1 == $cate['status'])) {
					$this->error('指定的上级分类不存在或被禁用！');
				}
			}

			/* 获取分类信息 */
			$info = $id ? $Category->getUserSiteCategoryInfo($id) : '';

			$this->assign('info', $info);
			$this->assign('category', $cate);
			$this->meta_title = '编辑分类';
			$this->display('template_type_edit');
		}
	}

	/* 新增分类 */
	public function templateTypeAdd($pid = 0) {
		$Category = D('UserSite');

		if (IS_POST) {
			//提交表单
			if (false !== $Category->userSiteCategoryUpdate()) {
				$this->success('新增成功！', U('Ｔemplate/templateTypeList'));
			} else {
				$error = $Category->getError();
				$this->error(empty($error) ? '未知错误！' : $error);
			}
		} else {
			$cate = array();
			if ($pid) {
				/* 获取上级分类信息 */
				$cate = $Category->getUserSiteCategoryInfo($pid, 'id,nameCN,status');
				if (!($cate && 1 == $cate['status'])) {
					$this->error('指定的上级分类不存在或被禁用！');
				}
			}

			$info['status'] = 1;
			/* 获取分类信息 */
			$this->assign('info', $info);
			$this->assign('category', $cate);
			$this->meta_title = '新增模板分类';
			$this->display('template_type_edit');
		}
	}

	/**
	 * 模板分类操作
	 * @param $type
	 */
	public function templateTypeOperate($type = 'move') {
		//检查操作参数
		if (strcmp($type, 'move') == 0) {
			$operate = '移动';
		} elseif (strcmp($type, 'merge') == 0) {
			$operate = '合并';
		} else {
			$this->error('参数错误！');
		}
		$from = intval(I('get.from'));
		empty($from) && $this->error('参数错误！');

		//获取分类
		$map = array('status' => 1, 'id' => array('neq', $from));
		$list = M('UserSiteCategory')->where($map)->field('id,nameCN')->select();

		$this->assign('type', $type);
		$this->assign('operate', $operate);
		$this->assign('from', $from);
		$this->assign('list', $list);
		$this->meta_title = $operate . '模板分类';
		$this->display('template_type_operate');
	}

	/**
	 * 模板分类操作－数据库
	 * @param strign $type
	 */
	public function templateTypeOperateSave($type = 'move') {
		$to = I('post.to');
		$from = I('post.from');
		$Model = M('UserSiteCategory');

		switch ($type) {
			case 'move':
				$to = I('post.to');
				$from = I('post.from');
				$res = $Model->where(array('id' => $from))->setField('parentId', $to);
				if ($res !== false) {
					$this->success('分类移动成功！', U('templateTypeList'));
				} else {
					$this->error('分类移动失败！');
				}
				break;
			case 'mreg':
				//合并文档
				$res = M('UserSite')->where(array('siteCategoryId' => $from))->setField('siteCategoryId', $to);

				if ($res) {
					//删除被合并的分类
					$Model->delete($from);
					$this->success('合并分类成功！', U('templateTypeList'));
				} else {
					$this->error('合并分类失败！');
				}
				break;
			case 'remove':
				$cate_id = I('id');
				if (empty($cate_id)) {
					$this->error('参数错误!');
				}

				//判断该分类下有没有子分类，有则不允许删除
				$child = $Model->where(array('parentId' => $cate_id))->field('id')->select();
				if (!empty($child)) {
					$this->error('请先删除该分类下的子分类');
				}

				//判断该分类下有没有内容
				$template_list = M('UserSite')->where(array('siteCategoryId' => $cate_id))->field('id')->select();
				if (!empty($template_list)) {
					$this->error('请先删除该分类下的模板');
				}

				//删除该分类信息
				$res = $Model->delete($cate_id);
				if ($res !== false) {
					//记录行为
					action_log('update_tempalte_type', 'TemplateType', $cate_id, UID);
					$this->success('删除分类成功！');
				} else {
					$this->error('删除分类失败！');
				}
				break;
			default:
				$this->error('未知操作');
		}
	}

	/**
	 * 网站类型列表
	 */
	public function siteTypeList() {
		$this->display('site_type_list');
	}

	/**
	 * 网站类型添加
	 */
	public function siteTypeAdd() {
		$this->display('site_type_edit');
	}

	/**
	 * 网站类型编辑
	 */
	public function siteTypeEdit() {
		$site_type_id = 0;
		$this->display('site_type_edit');
	}

	/**
	 * 系统图片管理
	 */
	public function systemImageManager() {
		$imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');
		$imageList = array();

		if (is_array($imageTypeList)) {
			foreach ($imageTypeList as $type_key => $type_value) {
				$map = array(
					'imgTypeId' => $type_key,
				);
				$image = M('SystemImage')->where($map)->find();
				$imageCount = D('SystemImage')->getSystemImageCount($map);
				$imageList[] = array(
					'imgTypeId' => $type_key,
					'imgTypeName' => $type_value,
					'info' => $image ? $image : array(),
					'count' => $imageCount,
				);
			}
		}

		$this->assign('imageList', $imageList);
		$this->display('system_image_manager');
	}

	public function systemImageList() {
		$imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');

		$imgTypeId = isset($_GET['catid']) ? intval($_GET['catid']) : 1;
		$title = isset($_REQUEST['title']) ? $_REQUEST['title'] : '';

		$map = array(
			'imgTypeId' => $imgTypeId,
		);

		if ($title) {
			$mag['imgName'] = array('like', '%' . $title . '%');
		}

		$imageList = $this->lists('SystemImage', $map);

		int_to_string($imageList);

		$this->assign('imageList', $imageList);
		$this->assign('imageTypeList', $imageTypeList);
		$this->assign('imgTypeId', $imgTypeId);

		$this->display('system_image_list');
	}

	public function systemImageAdd() {
		$imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');

		$imgTypeId = isset($_GET['catid']) ? intval($_GET['catid']) : 1;
		$this->assign('imageTypeList', $imageTypeList);
		$this->assign('imgTypeId', $imgTypeId);

		$this->display('system_image_add');
	}

	/**
	 * 移动图片
	 */
	public function system_image_move() {
		$id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
		$imgTypeId = isset($_GET['catid']) ? intval($_GET['catid']) : 1;
		$imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');

		$result = array(
			'error' => 1,
			'info' => '',
		);

		if (!$id) {
			$result['info'] = '非法操作';
		} else if (!$imageTypeList[$imgTypeId]) {
			$result['info'] = '分类不存在';
		} else {
			$imgInfo = M('SystemImage')->where(array('id' => $id))->find();
			if (!$imgInfo) {
				$result['info'] = '图片不存在';
			} else {
				M('SystemImage')->where(array('id' => $id))->save(array('imgTypeId' => $imgTypeId));
				$result['info'] = '移动成功';
				$result['error'] = 0;
			}
		}
		echo json_encode($result);
	}

	/**
	 * 系统图片重命名
	 */
	public function system_image_rename($id) {
		$id = intval($id);
		$name = trim($_REQUEST['name']);

		$result['ret'] = 0;

		$imgInfo = M('SystemImage')->where(array('id' => $id))->find();
		if ($imgInfo) {
			$status = M('SystemImage')->where(array('id' => $id))->save(array('imgName' => $name));
			if ($status) {
				$result = array(
					'ret' => 1,
					'html' => $name,
				);
			}
		}
		echo json_encode($result);
	}

	/**
	 * 删除系统图片
	 */
	public function system_image_confirm_delete() {
		$id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
		if (!$id) {
			$this->error('非法操作');
		}

		$imgInfo = M('SystemImage')->where(array('id' => $id))->find();
		if (!$imgInfo) {
			$this->error('图片不存在');
		}

		$affect = M('SystemImage')->delete($id);
		if ($affect) {
			//删除图片
			$imgPath = getImagePath($imgInfo['imgUrl']);
			@unlink($imgPath);
			$this->success('删除图片成功');
		} else {
			$this->error('删除失败');
		}
	}

	/**
	 * 批量删除图片
	 */
	public function system_image_batch_delete() {
		$ids = $_POST['sel_id'];
		$del_ids = array();

		$result = array(
			'error' => 1,
			'info' => '',
		);

		if (is_array($ids)) {
			foreach ($ids as $id => $val) {
				if (1 == $val) {
					$del_ids[] = $id;
				}
			}
			if ($del_ids) {
				M('SystemImage')->delete(join(',', $del_ids));
				$result['error'] = 0;
				$result['info'] = '删除成功';
			} else {
				$result['info'] = '请选择要删除的图片';
			}
		} else {
			$result['info'] = '请选择要删除的图片';
		}
		echo json_encode($result);
	}

	/**
	 * 批量移动图片
	 */
	public function system_image_batch_move() {
		$ids = $_POST['sel_id'];
		$del_ids = array();

		$imgTypeId = isset($_POST['catid']) ? intval($_POST['catid']) : 1;
		$imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');

		$result = array(
			'error' => 1,
			'info' => '',
		);

		if (!is_array($ids)) {
			$result['info'] = '请选择要移动的图片';
		} else if (!$imageTypeList[$imgTypeId]) {
			$result['info'] = '分类不存在';
		} else {
			foreach ($ids as $id => $val) {
				if (1 == $val) {
					$del_ids[] = $id;
				}
			}
			if (!$del_ids) {
				$result['info'] = '请选择要移动的图片';
			} else {
				M('SystemImage')->where(array('id' => array('in', join(',', $del_ids))))->save(array('imgTypeId' => $imgTypeId));
				$result['info'] = '移动成功';
				$result['error'] = 0;
			}
		}

		echo json_encode($result);
	}

	/**
	 * 上传系统图片
	 */
	public function system_image_upload() {
		$imgTypeId = isset($_REQUEST['catid']) ? intval($_REQUEST['catid']) : 1;

		$return = array(
			'jsonrpc' => '2.0',
			'id' => 'id',
			'result' => null,
		);

		$uploads = $this->_upload(C('SYSTEM_IMAGE_UPLOAD'));
		//上传错误
		if ($uploads['error']) {
			$return['error'] = array(
				'code' => 100,
				'message' => $uploads['info'],
			);
		} else {
			//保存图片
			foreach ($uploads['info'] as $info) {
				$set = array(
					'imgUrl' => $info['savename'],
					'imgName' => $info['name'],
					'imgTypeId' => $imgTypeId,
					'userId' => session('admin_user_auth.uid'),
					'hits' => 0,
					'status' => 0,
					'createTime' => time(),
				);
				$img_id = M('SystemImage')->add($set);
			}
		}
		echo json_encode($return);
	}
}