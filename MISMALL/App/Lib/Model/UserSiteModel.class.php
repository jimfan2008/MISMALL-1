<?php
/**
 * 用户站点模型
 *
 * @author cjli
 *
 */
class UserSiteModel extends Model {
	protected $_validate = array(
		array('siteDisplayName', 'require', '模板名称不能为空', self::EXISTS_VALIDATE, 'regex', self::MODEL_BOTH),
		array('siteDisplayName', '', '模板名称已经存在', self::VALUE_VALIDATE, 'unique', self::MODEL_BOTH),
		array('sitePath', '', '模板编号已经存在', self::VALUE_VALIDATE, 'unique', self::MODEL_BOTH),
		array('price', 'currency', '价格格式不对', self::EXISTS_VALIDATE, 'regex', self::MODEL_BOTH),
	);

	protected $_auto = array(
		array('addTime', 'time', self::MODEL_INSERT, 'function'),
		array('clickCount', '0', self::MODEL_INSERT),
		array('siteCount', '0', self::MODEL_INSERT),
		array('userId', '0', self::MODEL_INSERT),
	);

	/**
	 * 用户模型
	 * @var model
	 */
	private $_model;

	/**
	 * 初始化
	 */
	public function _initialize() {
		$this->_model = M('user_site');
	}
	/**
	 * 获取用户站点列表
	 *
	 * @param array $post 查模板条件
	 * @param int||null $page 从第几页开始, 默认查全部
	 * @param int $pageRows 每页的个数
	 * @param string $field 查询字段
	 * @param	int	$limit 限制查询记录数
	 * @return array
	 */
	public function getUserSiteList($post = array(), $page = NULL, $pageRows = 20, $field = '', $limit = 0) {
		$siteList = array();

		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'userId' => isset($post['userId']) ? intval($post['userId']) : NULL,
			'siteName' => isset($post['siteName']) && $post['siteName'] ? array('like', '%' . $post['siteName'] . '%') : NULL,
			'status' => isset($post['status']) ? $post['status'] : 1,
			'colorId' => isset($post['colorId']) ? intval($post['colorId']) : NULL,
			'isShare' => isset($post['isShare']) ? $post['isShare'] : array('egt', -1),
			//'orderNo' => isset($post['orderNo']) ? $post['orderNo'] : NULL,
			'parentSiteId' => isset($post['parentSiteId']) ? $post['parentSiteId'] : NULL,
			'siteTempType' => isset($post['siteTempType']) ? $post['siteTempType'] : 0,
		);

		foreach ($where as $key => $val) {
			if (is_numeric($val)) {
				continue;
			}
			if (is_null($val)) {
				unset($where[$key]);
			}
		}

		//分类ＩＤ
		if (isset($post['siteCategoryId']) && intval($post['siteCategoryId'])) {
			$typeIds = $this->getUserSiteCategorySubIds($post['siteCategoryId']);
			$where['siteCategoryId'] = array('in', $typeIds);
		}

		if ($field) {
			$this->field($field);
		} else {
			$this->field('id,siteName,siteUrlPath,thumbPath,isShare,user_name,userId,price,clickCount,siteCount,status,addTime,siteTempType,wechatId,userProjectId');
		}

		$this->where($where);

		//排序
		if (isset($post['order'])) {
			$this->order($post['order']);
		} else {
			$this->order('id DESC');
		}
		//分页
		if ($page) {
			$this->page($page, $pageRows);
		}
		if ($limit) {
			$this->limit($limit);
		}
		$siteList = $this->select();
		//echo $this->getLastSql();exit;
		if ($siteList) {
			foreach ($siteList as &$site) {
				$site['source_image'] = $site['thumbPath'];
				$site['oldThumbPath'] = $site['thumbPath'];
				$site['thumbPath'] = $site['thumbPath'];
				$site['priceFormat'] = currency($site['price']);
				$site['preView'] = U('/' . $site['siteUrlPath'], '', false, false, true);
			}
			unset($site);
		}
		//dump($siteList);exit;
		return $siteList ? $siteList : array();
	}

    /**
	 * 根据模板类型获取信息 tlj
	 */
    public function getUserSiteListByTplType($where){
     	return $this->where($where)->select();
    }
	
	/**
	 * 获取用户购买的应用
	 */
	public function getUserSiteByBuy($page,$pageCount,$where){
		
	   return $this->alias('c')->join(C('DB_PREFIX').'trade_info t on c.orderNo = t.orderNo')->where($where)
	       ->page($page,$pageCount)->field("c.id,siteName,thumbPath,wechatId,from_unixtime(orderTime) as orderTime")->select();
	}
	
	/**
	 * 获取我的购买应用总数
	 */
	public function getUserSiteCountByBuy($where){
		 return $this -> alias('c') -> join(C('DB_PREFIX'). 'trade_info t on c.orderNo = t.orderNo') -> where( $where )
	       ->count();
	}

    /**
	 * 获取开发者开发的应用 tlj
	 */
    public function getDeveloperSites($where, $order, $page, $pageCount){
		return $this -> where( $where ) -> order( $order ) -> page( $page, $pageCount ) -> select();
    }
	
	/**
	 * 根据条件获取应用数量 tlj
	*/
	public function getSiteCount($where){
		return $this -> where($where) -> count();
	}
	

	/**
	 * 获取用户站点列表
	 *
	 * @param array $post 查模板条件
	 * @param int||null $page 从第几页开始, 默认查全部
	 * @param int $pageRows 每页的个数
	 * @param string $field 查询字段
	 * @param	int	$limit 限制查询记录数
	 * @return array
	 */
	public function getUserSalingSiteList($post = array(), $page = NULL, $pageRows = 20, $field = '', $limit = 0) {
		$siteList = array();

		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'userId' => isset($post['userId']) ? intval($post['userId']) : NULL,
			'siteName' => isset($post['siteName']) && $post['siteName'] ? array('like', '%' . $post['siteName'] . '%') : NULL,
			'status' => isset($post['status']) ? $post['status'] : 1,
			'colorId' => isset($post['colorId']) ? intval($post['colorId']) : NULL,
			'isShare' => isset($post['isShare']) ? $post['isShare'] : array('eq', 3),
			//'orderNo' => isset($post['orderNo']) ? $post['orderNo'] : NULL,
			'parentSiteId' => isset($post['parentSiteId']) ? $post['parentSiteId'] : NULL,
			'siteTempType' => isset($post['siteTempType']) ? $post['siteTempType'] : 0,
		);

		foreach ($where as $key => $val) {
			if (is_numeric($val)) {
				continue;
			}
			if (is_null($val)) {
				unset($where[$key]);
			}
		}

		//分类ＩＤ
		if (isset($post['siteCategoryId']) && intval($post['siteCategoryId'])) {
			$typeIds = $this->getUserSiteCategorySubIds($post['siteCategoryId']);
			$where['siteCategoryId'] = array('in', $typeIds);
		}

		if ($field) {
			$this->field($field);
		} else {
			$this->field('id,siteName,siteUrlPath,thumbPath,isShare,user_name,userId,price,clickCount,siteCount,status,addTime,siteTempType,wechatId,userProjectId');
		}

		$this->where($where);

		//排序
		if (isset($post['order'])) {
			$this->order($post['order']);
		} else {
			$this->order('id DESC');
		}
		//分页
		if ($page) {
			$this->page($page, $pageRows);
		}
		if ($limit) {
			$this->limit($limit);
		}
		$siteList = $this->select();
		//echo $this->getLastSql();exit;
		if ($siteList) {
			foreach ($siteList as &$site) {
				$site['source_image'] = $site['thumbPath'];
				$site['oldThumbPath'] = $site['thumbPath'];
				$site['thumbPath'] = $site['thumbPath'];
				$site['priceFormat'] = currency($site['price']);
				$site['preView'] = U('/' . $site['siteUrlPath'], '', false, false, true);
			}
			unset($site);
		}
		//dump($siteList);exit;
		return $siteList ? $siteList : array();
	}
	
	/**
	 * 获取模板总数
	 *
	 * @param array $post 查模板条件
	 * @return int
	 */
	public function getUserSiteCount($post) {

		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'userId' => isset($post['userId']) ? intval($post['userId']) : NULL,
			'siteDisplayName' => isset($post['siteDisplayName']) && $post['siteDisplayName'] ? array('like', '%' . $post['siteDisplayName'] . '%') : NULL,
			'status' => isset($post['status']) ? $post['status'] : 1,
			'colorId' => isset($post['colorId']) ? intval($post['colorId']) : NULL,
			'isShare' => isset($post['isShare']) ? $post['isShare'] : array('gt', -1),
			'orderNo' => isset($post['orderNo']) ? $post['orderNo'] : NULL,
			'parentSiteId' => isset($post['parentSiteId']) ? $post['parentSiteId'] : NULL,
			'siteTempType' => isset($post['siteTempType']) ? $post['siteTempType'] : 0,
		);

		foreach ($where as $key => $val) {
			if (is_numeric($val)) {
				continue;
			}
			if (is_null($val)) {
				unset($where[$key]);
			}
		}
		//分类ＩＤ
		if (isset($post['siteCategoryId']) && intval($post['siteCategoryId'])) {
			$typeIds = $this->getUserSiteCategorySubIds($post['siteCategoryId']);
			$where['siteCategoryId'] = array('in', $typeIds);
		}

		$this->where($where);
		$count = $this->count();
		return $count;
	}

	/**
	 * 获取站点目录
	 * @param int $site_id 站点ID
	 * @return string
	 */
	public function getSitePath($site_id) {
		return self::getSiteInfo($site_id, 'sitePath');
	}

	/**
	 * 获取站点信息
	 *
	 * @param int $id 站点ID
	 * @param  string  $field 要获取的字段名
	 * @param boolen $status 是否要判断状态
	 * @return array|string
	 */
	public function getSiteInfo($id, $field = null, $status = false) {
		static $list;

		/* 非法分类ID */
		if (!$id || !is_numeric($id)) {
			return '';
		}


		/* 读取缓存数据 */
		//if( S('user_site_list') ){
		//    $list = S('user_site_list');
		//}

		/* 获取站点信息 */
		//if (!isset($list[$id])) {
		$info = $this->_model->find($id);
		if ($status && (!$info && 1 != $info['status'])) {
			//不存在或被禁用
			return '';
		}
		
		if ($info) {
			$info['source_image'] = $info['thumbPath'];
			$info['oldThumbPath'] = getImageUrl($info['thumbPath']);
			$info['thumbPath'] = getImageUrl($info['thumbPath'], 210, 170, true);
			$info['priceFormat'] = currency($info['price']);
			$info['preView'] = U('/' . $info['siteUrlPath'], '', false, false, true);
		}
		
		//	$list[$id] = $info;
		//	S('user_site_list', $list); //更新缓存
		//}
		//return is_null($field) ? $list[$id] : $list[$id][$field];
		return is_null($field) ? $info : $info[$field];
	}

	/**
	 * 根据path获取站类型
	 * @param	string	$site_path
	 * @return	int
	 */
	public function getSiteTypeByPath($site_path) {
		if ($site_path === '') {
			return 0;
		}

		$site_type = $this->_model->where("sitePath='$site_path'")->getField('siteTempType');

		return $site_type;
	}

	/**
	 * 用户站点名称
	 * @param	string		$site_name 站点名称
	 * @param	int			$user_id 用户
	 * @return	boolean
	 */
	public function getUserSiteName($site_name, $user_id) {
		if (!$site_name || !$user_id) {
			return 0;
		}
		$nameNum = $this->_model->where("siteName='$site_name' AND userId=" . $user_id)->getField('count(ID) as Num');
		return $nameNum ? 0 : 1;
	}

	/**
	 * 修改应用图片
	 * @param	int	$site_id
	 * @param	string	$img_data
	 * @return	boolean
	 */
	public function updateASiteImg($site_id, $img_data) {
		if (!$site_id || $img_data == '') {
			return 0;
		}

		$data['thumbPath'] = $img_data;

		$result = $this->_model->where("id=" . $site_id)->data($data)->save();
		unset($data);

		return $result ? 1 : 0;
	}

	/**
	 * 添加用户站点
	 * @param 	int 	$tpl_id 模板ID
	 * @param	string	$site_name 站点名称
	 * @param	string	$img_src 站点截图
	 * @return int 返回用户站点ID
	 */
	public function copyUserSite($tpl_id, $site_name = '', $img_src = '') {
		if (!intval($tpl_id)) {
			return false;
		}

		//复制的网站信息
		$siteInfo = $this->getSiteInfo($tpl_id);
		if (!$siteInfo) {
			return false;
		}

		if (!session('uid')) {
			return false;
		}

		//模板目录
		$tempalte_path = get_user_dir($siteInfo['sitePath'], $siteInfo['userId'], $siteInfo['siteTempType']);
		//D("Project")->getPageContent();
		$pid = session("pid");
		if ($siteInfo["userProjectId"] != 0) {
			session("pid", $siteInfo["userProjectId"]);
			
			
			$get_tpl_records = D('Project')->getSiteTpl();

		}
		//模板目录不存在

		if (!$tempalte_path) {
			//return false;
		}

		//随机生成站点目录
		//$sitePath = $userSession['userName'].rand(0, 999);
		$sitePath = unquire_rand();

		//用户站点目录
		$site_dir = get_user_dir($sitePath, session('uid'), $siteInfo['siteTempType']);

		//拷贝模板到用户模板目录
		if (!file_dir_copy($tempalte_path, $site_dir)) {
			//return false;
		}

		//
		//添加站点记录
		$set = array(
			'sitePath' => $sitePath,
			'siteUrlPath' => $sitePath,
			'userId' => session('uid'),
			'parentSiteId' => $tpl_id,
			'status' => 1,
			'addTime' => time(),
			'siteName' => $site_name != '' ? $site_name : $siteInfo['siteName'],
			'isShare' => -1, //不分享
			'siteCategoryId' => $siteInfo['siteCategoryId'],
			'thumbPath' => $img_src ? get_cover($img_src, 'url') : $siteInfo['source_image'],
			'siteTypeId' => $siteInfo['siteTypeId'],
			'colorId' => $siteInfo['colorId'],
			'siteCount' => 0,
			'siteTempType' => $siteInfo['siteTempType'],
			'config' => $siteInfo['config'],
		);
		$site_id = $this->_model->add($set);
		if ($siteInfo["userProjectId"]) {

			session("pid", $site_id);
			$save_tpl_records = D("Project")->saveSiteTpl($get_tpl_records);
		}
		//模板建站数量加1
		$this->updateSiteClick($tpl_id, 'siteCount');

		//TODO复制网站后台项目
		//if ($siteInfo['userProjectId']) {
		$site_project_model = D('SiteProject');
		//获取后台信息
		$project_info = D('PlatForm')->getAProjectDetails($siteInfo['userProjectId']);
		if ($project_info) {
			//站长购买模板
			if ($siteInfo['isShare'] == 3 && $siteInfo['userId'] != session('uid')) {
				$status = $site_project_model->copyAppToApp($tpl_id, $site_id);
				if ($status < 1) {
					return false;
				}
			} else {
				//开发者使用现有模板开发
				$status = $site_project_model->copyAppToProject($tpl_id, $site_id);
				if ($status < 1) {
					return false;
				}
			}
		} else {
			if ($siteInfo['siteTempType']) {
				// 微信默认建立后台
				$user_id = session('uid');
				$project_id = D('PlatForm')->addAProjectInfo($user_id, $site_name, $site_id);
				if ($project_id) {
					$res = D('PlatForm')->createProjectDB($project_id);
					$res1 = $this->editSite($site_id, array('userProjectId' => $project_id));
					if (!$res) {
						return false;
					}
				} else {
					return false;
				}
			}
		}
		//}

		return $site_id;
	}

	/**
	 * 删除站点
	 * @param int $site_id　站点ID
	 * @return boolean
	 */
	public function deleteSite($site_id) {

		$site_id = intval($site_id);
		if (!(session('uid') || $site_id)) {
			return false;
		}
		//获取站点目录
		$siteInfo = $this->getSiteInfo($site_id);
		if (!$siteInfo) {
			return false;
		}

		$result = $this->_model->where(array('id' => $site_id))->delete();
		if ($result) {
			//用户站点目录
			//$site_dir = get_user_dir($siteInfo['sitePath'], $siteInfo['userId'], $siteInfo['siteTempType']);

			//删除用户的站点
			//file_dir_del($site_dir);

			//TODO删除项目与应用APP
			//删除项目
			if ($siteInfo['userProjectId']) {
				$project_info = D('PlatForm')->getAProjectDetails($siteInfo['userProjectId']);
				D('PlatForm')->delAProject($project_info['ID']);
			}

			F('user_site_list', NULL);

			return true;
		} else {
			return false;
		}
	}

	/**
	 * 修改站点信息
	 *
	 * @param int $site_id　站点ID
	 * @param $post 修改数组
	 * @param boolean
	 */
	public function editSite($site_id, $post) {
		$status = M('UserSite')->where(array('id' => $site_id))->save($post);
		if ($status) {
			F('user_site_list', NULL);
		}

		return $status;
	}

	/**
	 * 更新模板信息(后台使用)
	 *
	 * @param array $post
	 */
	public function templateUpdate($post) {
		$data = $this->create();
		if (!$data) {
			//数据对象创建错误
			return false;
		}

		$data['parentSiteId'] = 0;

		//模板目录过滤
		if ($data['sitePath'] && (!preg_match('/^[\w]+$/', $data['sitePath']))) {
			$this->error = '模板编号只能为数字、字母、中划线和下划线';
			return false;
		}

		if (empty($data['siteUrlPath'])) {
			$data['siteUrlPath'] = $data['sitePath'];
		}

		/* 添加或更新数据 */
		if (empty($data['id'])) {
			$res = $this->add();
		} else {
			//$siteinfo = $this->getSiteInfo($data['id']);
			$res = $this->save();
			F('user_site_list', NULL); //更新缓存
		}

		//记录行为
		action_log('update_tempalte', 'Template', $data['id'] ? $data['id'] : $res, UID);

		return $res;
	}

	/**
	 * 获取分类树，指定分类则返回指定分类极其子分类，不指定则返回所有分类树
	 * @param  integer $id    分类ID
	 * @param  boolean $field 查询字段
	 * @return array          分类树
	 */
	public function getUserSiteCategoryTree($id = 0, $field = true, $tree = true) {
		$model = M('UserSiteCategory');
		/* 获取当前分类信息 */
		if ($id) {
			$info = $this->getUserSiteCategoryInfo($id);
			$id = $info['id'];
		}

		/* 获取所有分类 */
		$map = array('status' => array('gt', -1));
		$list = $model->field($field)->where($map)->order('sort')->select();

		if ($tree) {
			$list = list_to_tree($list, $pk = 'id', $pid = 'parentId', $child = 'child', $root = $id);
		}

		/* 获取返回数据 */
		if (isset($info)) {
			//指定分类则返回当前分类极其子分类
			$info['child'] = $list;
		} else {
			//否则返回所有分类
			$info = $list;
		}

		return $info;
	}

	/**
	 * 获取模板分类键值对形式
	 * @param integer $id    分类ID
	 * @return array	键值对
	 */
	public function getUserSiteCategoryListKeyValue($id = 0) {
		$typeList = array();
		$list = $this->getUserSiteCategoryTree($id, 'nameCN', false);
		if ($list) {
			$list = isset($list['child']) ? $list['child'] : $list;
			foreach ($list as $type) {
				$typeList[$type['id']] = $type['nameCN'];
			}
		}
		return $typeList;
	}

	/**
	 * 更新模板分类信息
	 * @return boolean 更新状态
	 */
	public function userSiteCategoryUpdate() {
		$model = M('UserSiteCategory');
		$data = $model->create();
		if (!$data) {
			//数据对象创建错误
			return false;
		}

		/* 添加或更新数据 */
		if (empty($data['id'])) {
			$res = $model->add();
		} else {
			$res = $model->save();
		}
		//更新分类缓存
		//F('sys_template_type_list', null);

		//记录行为
		action_log('update_tempalte_type', 'TemplateType', $data['id'] ? $data['id'] : $res, UID);

		return $res;
	}

	/**
	 * 获取分类详细信息
	 * @param  milit   $id 分类ID或标识
	 * @param  boolean $field 查询字段
	 * @return array     分类信息
	 */
	public function getUserSiteCategoryInfo($id) {
		$model = M('UserSiteCategory');
		$map['status'] = 1;
		/* 获取分类信息 */
		$map = array();
		if (is_numeric($id)) {
			//通过ID查询
			$map['id'] = $id;
		} else {
			//通过标识查询
			$map['name'] = $id;
		}
		return $model->field($field)->where($map)->find();
	}

	/**
	 * 根据类型ID获取所有子类ID
	 * @param int $type_id
	 * @return array
	 */
	public function getUserSiteCategorySubIds($type_id) {
		$ids = array();
		$model = M('UserSiteCategory');
		$idList = $model->field('id')->where(array('parentId' => $type_id))->select();
		if ($idList) {
			foreach ($idList as $key => $val) {
				$ids[] = $val;
			}
		}
		$ids[] = $type_id;
		return $ids;
	}

	/**
	 * 更新模板访问量
	 * @param intval $id 模板ID
	 * @param string $filed
	 * @return boolean
	 */
	public function updateSiteClick($id, $filed) {
		return $this->where(array('id' => $id))->setInc($filed);
	}

	/**
	 * 生成模板目录
	 * @param int $id 模板ＩＤ
	 */
	public function marketSitePath($id) {
		//return 'tpl'.str_pad($id, 5, '0', STR_PAD_LEFT);
		return unquire_rand();
	}

	/*
	 * 获取微观的分享信息
	 *
	 * **/
	public function getViewGetApp() {
		return $this->where("(isShare = 1 or isShare = 3)  AND userSiteType = 3")->select();
	}

	/**
	 * 获取微信分享记录
	 */
	public function getWechatShareInfo($id, $field = '') {
		if (is_numeric($id)) {
			$where['id'] = $id;
		} else {
			$where['code'] = $id;
		}
		$model = M('WechatShare');
		$info = $model->where($where)->find();

		return $info ? ($field ? $info[$field] : $info) : '';
	}

	/**
	 * 微信分享状态记录
	 */
	public function addWechatShare($site_id, $page_id, $pid, $weId, $code, $openid, $userName, $layId = '', $location = array()) {
		$model = M('WechatShare');
		//$location = session('wechat_location');
		$data = array(
			'siteId' => intval($site_id),
			'pageId' => $page_id,
			'pid' => intval($pid),
			'code' => $code,
			'openid' => $openid,
			'userName' => $userName,
			'WeId' => $weId,
			'shareTime' => time(),
			'layId' => $layId,
			'Latitude' => is_null($location['latitude']) ? '' : $location['latitude'],
			'Longitude' => is_null($location['longitude']) ? '' : $location['longitude'],
			'Precision' => is_null($location['accuracy']) ? '' : $location['accuracy'],
		);
		if ($data['siteId'] == 0) {
			return false;
		}
		//根据经纬度获取地址
		if ($data['Latitude'] && $data['Longitude']) {
			$political = geocode($data['Latitude'], $data['Longitude']);
			if ($political) {
				$data['Province'] = $political['province'];
				$data['City'] = $political['city'];
				$data['District'] = $political['district'];
				$data['Address'] = $political['address'];
			}
		}

		$affect = $model->add($data);
		if (APP_DEBUG) {
			Log::write("微信分享状态记录\n" . var_export($data, TRUE) . "\n", Log::DEBUG);
		}
		return $affect;
	}

	/*
	 * 保存首页设置的数据   后台管理那边的
	 *
	 * */
	public function saveIndexSeting($title, $imgsrc, $info_content, $url, $siteId) {
		$issuper = 0;
		if (C('SUPPER_WECHAT_ID') == session("wechatId")) {
			$issuper = 1;
		}

		$siteId = session("ez_site_id");
		$data = array(
			"siteId" => $siteId,
			"title" => $title,
			"img" => $imgsrc,
			"info" => $info_content,
			"url" => $url,
			"issuper" => $issuper,
		);
		$db = M('index_set');
		$count = $db->where("siteId ='$siteId'")->select();
		if ($count) {
			$re = $db->where("siteId ='$siteId'")->data($data)->save();
		} else {
			$re = $db->add($data);
		}
		//unset($data, $db, $count);
		if ($re) {
			return 1;
		} else {
			return 0;
		}
		//return $re?1:0;
	}

	/*
	 * 存储页面菜单的json数据
	 *
	 * */

	public function saveMenuConfig($page, $content, $site_id) {
		$data = array("config" => $content);
		return $this->where("id='$site_id'")->save($data);
	}

	/*
	 * 获取菜单数据
	 *
	 * */
	public function getMenuConfig($siteId) {
		return $this->where("id='$siteId'")->getField("config");
	}
	/**
	 * 获取用户市场设置的图片
	 * @param $siteId
	 */
	 public function getASitethumb($siteId){
	 	 return $this->where("id='$siteId'")->getField("thumbPath");
	 }
	 
	 /**
	 * 获取所有待销售的应用
	 * $page     页数,默认显示1*12
	 * $apptype  app类型
	 * $return   待销售应用
	 */
	 function getSaleApps($page,$apptype){
	 	
	 	$pageCount = 12; //每页显示12条
	 	
		if(!empty($apptype)){
			//如果$apptype=0则显示所有类型
			$where['siteTempType'] = $apptype;
		}
		$where["isShare"] = 3;
	    return $this->page($page,$pageCount)->where($where)->order('id')->select();
	 }
	 
	 /**
	  * 获取待销售应用总个数
	  * $apptype 应用类型
	  */
	 function getSaleAppsCount($apptype){
	 	
	 	if(!empty($apptype)){
	 		$where['siteTempType'] = $apptype;
	 	}
		$where["isShare"] = 3;
		$re = $this->where($where)->select();
	 	return $this->where($where)->count();
	 }
		
}
