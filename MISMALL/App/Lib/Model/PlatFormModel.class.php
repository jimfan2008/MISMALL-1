<?php

/**
 * 自定义项目模型，封装对项目的数据操作
 * @author 胡志强
 * time : 201410
 */

class PlatFormModel extends Model {
	/**
	 * 构造函数
	 */
	public function __construct() {
		parent::__construct();
		$this->_initialize();
	}

	/**
	 * 回调方法 初始化模型
	 */
	protected function _initialize() {}

	/**
	 * 获取当前定义系统变量
	 * @return	array
	 */
	public function getSysParamType() {

		$paras_lists = $this->table(C('DB_PREFIX') . 'form_sysvariable')->field('variableName, variableDesc, variableType')->order('ID')->select();

		return $paras_lists;
	}

	/**
	 * 获取系统变量的实际值
	 * @param	string	$sysvariable 系统变量类型
	 * @return	string
	 */
	public function getSysParamValue($sysvariable, $type = 0) {
		$user_id = I('session.uid', 0);
		$value = '';

		switch ($sysvariable) {
			case 'ID':	// 當前數據ID
				break;
			case 'Form_ID':	// 當前表單ID
				break;
			case 'Staff_ID':
			case 'STAFFID':
				$value = I('session.wechat_openid', '') ? I('session.wechat_openid', '') : I('session.uid', 0); 	// 當前用戶工號
				break;
			case 'SysDBDateTime':	// 系統當前時間
				$value = date('Y-m-d H:i:s', time());
				break;
			case 'User_Name':// 当前用户名字
			case 'USERNAME':	// 当前用户名字
				$value = I('session.wechat_uname', '') ? I('session.wechat_uname', '') : I('session.uname', '');
				$wechart_name = I('session.wechat_uname', '');
				if ($type) {
					$value = I('session.wechat_openid', '') ? I('session.wechat_openid', '') : I('session.uname', '');
				}
				break;
		}

		return $value; // 返回需要替换的值
	}

	/**
	 * 获取用户当前开发项目信息
	 * @param	int		$user_id 当前用户
	 * @param	int		$site_id 绑定网站ID
	 * @return 	array
	 */
	public function getAllProjectsInfo($user_id, $site_id = 0) {
		if (!$user_id) {
			return 0;
		}

		$pro_info = $this->table(C('DB_PREFIX') . 'user_projects UP')->join(C('DB_PREFIX') . 'projects P ON UP.projectID=P.ID')
		                 ->where("UP.userID=" . $user_id . " AND UP.siteID =" . $site_id)
		                 ->field('P.ID, projectName')->order('P.ID DESC')->select();

		return $pro_info;
	}

	/**
	 * 获取单个项目详细信息
	 * @param	int		$project_id 当前用户选中项目ID
	 * @return	array	选中项目的数据信息，一维数组
	 */
	public function getAProjectDetails($project_id) {
		if (!$project_id) {
			return 0;
		}

		$pro_info = $this->table(C('DB_PREFIX') . 'projects')->where("ID=$project_id")->field('ID, createUser, projectName, projectDbLink')->find();

		return $pro_info;
	}

	/**
	 * 建立一个用户开发项目并添加到用户下
	 * @param	int		$user_id 当前用户ID
	 * @param	string 	$project_name 项目名称
	 * @param	int		$site_id 网站ID
	 * @param	string  $project_type  项目类型
	 * @param	int     $flow_type 流程项目类型 0为新建流程项目 1为公共接口
	 * @return	int		返回新建项目ID
	 */
	public function addAProjectInfo($user_id, $project_name, $site_id = 0, $project_type = '', $flow_type = 0) {
		$data['createUser'] = $user_id;
		$data['projectName'] = $project_name;
		$data['projectDbLink'] = '';
		$project_id = $this->table(C('DB_PREFIX') . 'projects')->data($data)->add();
		unset($data);

		/*$data['projectDbLink'] = 'mysql://webuser:webuser@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $project_id;
		$this->table(C('DB_PREFIX') . 'projects')->where("ID=" . $project_id)->data($data)->save();
		unset($data);*/

		$data['userID'] = $user_id;
		$data['projectID'] = $project_id;
		$data['userType'] = 1;
		$data['isActivated'] = 1;
		$data['siteID'] = $site_id;
		$data['projectType'] = $project_type;
		$user_pro_id = $this->table(C('DB_PREFIX') . 'user_projects')->data($data)->add();
		unset($data);

		//更新与网站关联
		if ($site_id && $project_id && $user_pro_id) {
			D('UserSite')->editSite($site_id, array('userProjectId' => $user_pro_id));
		}

		return $project_id ? $project_id : 0;
	}

	/**
	 * 组装数据库连接
	 *@author cjli
	 * @param  integer $project_id  项目ID
	 * @return string
	 */
	public function projectDbLink($project_id) {
		return 'mysql://webuser:webuser@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $project_id;

	}

	//切换数据库
	public function changeDB($project_id) {
		$this->db('p' . $project_id, $this->projectDbLink($project_id));
	}

	/**
	 * 创建应用数据库结构
	 * @param	int		$to_project_id 要建立的项目的ID
	 * @param	int		$from_project_id 源项目ID
	 * @param	string	$create_type 建立类型  create -- 初始化项目   release -- 发布项目  try -- 试用  deplay -- 部署
	 * @return boolean
	 */
	public function createProjectDB($to_project_id, $from_project_id = 0, $create_type = 'create') {
		if (!$to_project_id) {
			return 0;
		}

		switch ($create_type) {

		}

		$sql = <<<sql
		DROP DATABASE IF EXISTS `ccproject_$to_project_id`;
		CREATE DATABASE `ccproject_$to_project_id` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
		GRANT ALL PRIVILEGES ON ccproject_$to_project_id.* TO webuser@`%` IDENTIFIED BY 'webuser';
sql;
		$mysqli = new mysqli(C('DB_HOST'), C('DB_USER'), C('DB_PWD'), '', C('DB_PORT'));
		$mysqli->multi_query($sql);
		$mysqli->close();
		unset($sql, $mysqli);

		$this->db('p' . $from_project_id, 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $from_project_id);
		$tables = $this->query("SHOW TABLES"); // 获取应用对应发布数据库中所有数据表
		$colname = 'Tables_in_ccproject_' . $from_project_id;

		$this->db('p' . $to_project_id, 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $to_project_id); // 更改连接到应用数据库
		foreach ($tables as $value) {
			$t_name = $value[$colname];
			$sql = "CREATE TABLE $t_name LIKE ccproject_$from_project_id.$t_name "; // 复制数据表结构
			$this->execute($sql);
			unset($sql);
			$sql = "INSERT INTO $t_name SELECT * FROM ccproject_$from_project_id.$t_name "; // 复制表数据
			$this->execute($sql);
			unset($sql);
		}
		unset($value, $tables);

		return 1;
	}

	/**
	 * 删除当前项目
	 * @param	int		$project_id 项目ID
	 * @return	boolean
	 */
	public function delAProject($project_id) {
		if (!$project_id) {
			return 0;
		}

		$project_info = $this->getAProjectDetails($project_id);
		if ($project_info['createUser'] != session('uid')) {
			return 0;
		}

		$res = $this->execute("DROP DATABASE IF EXISTS `ccproject_" . $project_id . "`"); // 删除项目数据库结构
		$res1 = $this->table(C('DB_PREFIX') . 'projects')->where("ID=" . $project_id)->delete();
		$res2 = $this->table(C('DB_PREFIX') . 'user_projects')->where("projectID=" . $project_id)->delete();

		return $res && $res1 && $res2 ? 1 : 0;
	}

	/**
	 * 修改项目名称
	 * @param	int		$project_id 项目ID
	 * @param	string	$new_name 项目新名称
	 * @return	boolean
	 */
	public function updateAProjectName($project_id, $new_name) {
		if (!$project_id || $new_name == '') {
			return 0;
		}

		$data['projectName'] = $new_name;
		$res = $this->table(C('DB_PREFIX') . 'projects')->where("ID=" . $project_id)->data($data)->save();

		return $res ? 1 : 0;
	}

	/**
	 * 获取项目类别
	 * @param	string	$keyword 关键字
	 * @return	array
	 */
	public function getProjectCate($keyword = '') {
		if ($keyword == '') {
			$condition = "1";
		} else {
			$condition = "cateName like '%" . $keyword . "%'";
		}
		$cate_list = $this->table(C('DB_PREFIX') . 'project_category')->where($condition)->field('ID, cateName')->order('ID')->limit('0, 10')->select();

		return $cate_list;
	}

	/**
	 * 判断项目类别
	 * @param	string	$cate_name 类别名称
	 * @return	int
	 */
	public function getProjectCateID($cate_name) {
		if ($cate_name == '') {
			return 0;
		}

		$cate_id = $this->table(C('DB_PREFIX') . 'project_category')->where("cateName='" . $cate_name . "'")->getField('ID');

		return $cate_id ? $cate_id : $this->addAProjectCate($cate_name);
	}

	/**
	 * 保存新的项目类别
	 * @param	string	$cate_name 类别名称
	 * @return	int		返回新的类别ID
	 */
	public function addAProjectCate($cate_name) {
		if ($cate_name == '') {
			return 0;
		}

		$data['cateName'] = $cate_name;
		$cate_id = $this->table(C('DB_PREFIX') . 'project_category')->data($data)->add();

		return $cate_id ? $cate_id : 0;
	}

	/**
	 * 获取发布项目上传的预览图
	 * @return	array
	 */
	public function getProjectPreview() {
		$img_list = $this->table(C('DB_PREFIX') . 'project_images')->where("proID=" . I('session.pid', 0))->field('ID, imgCate, imgPath, imgName, imgType')->order('ID')->select();

		return $img_list;
	}

	/**
	 * 添加项目发布信息
	 * @param	array	$pro_info 待发布项目的信息
	 * @return	int
	 */
	public function addAReleaseProjectInfo($pro_info) {
		if (!$pro_info['projectid']) {
			return 0;
		}

		$data['projectID'] = $pro_info['projectid'];
		$data['projectName'] = $pro_info['name'];
		$data['projectType'] = $this->getProjectCateID($pro_info['cate']);
		$data['projectPrice'] = $pro_info['price'];
		$data['projectImage'] = $pro_info['logo'];
		$data['customerPhoto'] = $pro_info['customer'];
		$data['projectDesc'] = $pro_info['desc'];
		$data['releaseUser'] = session('uid');
		$data['releaseTime'] = time();
		$data['saleNum'] = 0;
		$data['commentNum'] = 0;
		$data['version'] = $pro_info['version'];

		$release_id = $this->table(C('DB_PREFIX') . 'project_release')->data($data)->add();
		unset($data);

		return $release_id ? $release_id : 0;
	}

	/**
	 * 修改项目发布信息
	 * @param	array	$pro_info 待发布项目的信息
	 * @return	int
	 */
	public function updAReleaseProjectInfo($pro_info) {
		if (!$pro_info['ID']) {
			return 0;
		}

		$data['ID'] = $pro_info['ID'];
		$data['projectName'] = $pro_info['name'];
		$data['projectType'] = $this->getProjectCateID($pro_info['cate']);
		$data['projectPrice'] = $pro_info['price'];
		$data['projectImage'] = $pro_info['logo'];
		$data['customerPhoto'] = $pro_info['customer'];
		$data['projectDesc'] = $pro_info['desc'];
		$data['version'] = $pro_info['version'];

		$res = $this->table(C('DB_PREFIX') . 'project_release')->data($data)->save();
		unset($data);

		return $res ? $pro_info['ID'] : 0;
	}

	/**
	 * 项目图像文件保存，将图像信息存储数据库
	 * @param	int		$release_id 发布项目ID
	 * @param	int		$img_index 上传图像类别 0-项目logo  1-客服logo  >=2-项目截图
	 * @param	string	$img_src 上传的图像地址
	 * @return	int		返回图像保存登记ID
	 */
	public function addAReleaseProjectImage($release_id, $img_index = 0, $img_src = '') {
		if (!$release_id || $img_src == '') {
			return 0;
		}

		preg_match('/^(data:\s*image\/(\w+);base64,)/', $img_src, $result);
		$img_name = 'img' . $release_id . $img_index;
		$new_file = "./uploads/ezForm/Release/Images/" . $img_name . "." . $result[2];
		$save_result = file_put_contents($new_file, base64_decode(str_replace($result[1], '', $img_src)));

		$img_cate = $img_index > 2 ? 2 : $img_index;

		if ($save_result) {
			$data['releaseID'] = 0;
			$data['imgCate'] = $img_cate;
			$data['imgPath'] = $new_file;
			$data['imgName'] = $img_name;
			$data['imgType'] = $result[2];
			$data['imgSize'] = filesize($new_file);

			$img_id = $this->table(C('DB_PREFIX') . 'project_images')->where("imgName='$img_name'")->getField('ID');
			if ($img_id) {
				$this->table(C('DB_PREFIX') . 'project_images')->where("ID=" . $img_id)->data($data)->save();
			} else {
				$img_id = $this->table(C('DB_PREFIX') . 'project_images')->data($data)->add();
			}
			unset($data);

			return $img_id ? $img_id : 0;
		} else {
			return 0;
		}
	}

	/**
	 * 建立发布项目数据库结构及数据
	 *
	 */
	public function createReleaseProjectDB($release_id, $project_id) {
		if (!$release_id || !$project_id) {
			return 0;
		}

		//建立发布数据库并分配权限
		$sql = <<<sql
		DROP DATABASE IF EXISTS `ccpublisher_$release_id`;
		CREATE DATABASE `ccpublisher_$release_id` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
		GRANT ALL PRIVILEGES ON ccpublisher_$release_id.* TO webuser@`%` IDENTIFIED BY 'webuser';
sql;
		$mysqli = new mysqli(C('DB_HOST'), C('DB_USER'), C('DB_PWD'), '', C('DB_PORT'));
		$mysqli->multi_query($sql);
		$mysqli->close();
		unset($sql, $mysqli);

		$this->db('p' . $project_id, 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $project_id);
		$tables = $this->query("SHOW TABLES"); // 获取应用对应发布数据库中所有数据表
		$colname = 'Tables_in_ccproject_' . $project_id;

		$this->db('r' . $release_id, 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccpublisher_' . $release_id); // 更改连接到应用数据库
		foreach ($tables as $value) {
			$t_name = $value[$colname];
			$sql = "CREATE TABLE $t_name LIKE ccproject_.$project_id.$t_name "; // 复制数据表结构
			$this->execute($sql);
			unset($sql);
			$sql = "INSERT INTO $t_name SELECT * FROM ccproject_.$project_id.$t_name "; // 复制数据表数据
			$this->execute($sql);
			unset($sql);
		}
		unset($value, $tables);

		return 1;
	}

	/**
	 * 项目发布，接收参数登记发布信息，上传图像，建立发布区
	 * @param	array	$pub_info 待发布项目的信息
	 * @return	boolean
	 */
	public function releaseAProject($pub_info) {
		// 登记发布信息
		if ($pub_info['ID']) {
			$release_id = $this->updAReleaseProjectInfo($pub_info); // 修改项目发布信息，带回发布ID
			$rea_pro_info = $this->getAReleaseProjectDetailInfo($pub_info['ID']);
			$project_id = $rea_pro_info['projectID'];
			unset($rea_pro_info);
		} else {
			$release_id = $this->addAReleaseProjectInfo($user_id, $pub_info); // 登记项目发布信息，获取发布登记ID
			$project_id = $pub_info['projectID'];
		}

		if ($release_id) {
			// 登记成功
			// 更新图像对应到发布登记
			$data['releaseID'] = $release_id;
			$this->table(C('DB_PREFIX') . 'project_images')->where("releaseID=0 and imgName like 'img" . $project_id . "_'")->data($data)->save();
			unset($data);

			return $this->createReleaseProjectDB($release_id, $project_id);
		} else {
			return 0;
		}
	}

	/**
	 * 获取发布项目的详细登记信息
	 * @param	int		$release_id 项目的发布ID
	 * @return	array
	 */
	public function getAReleaseProjectInfo($release_id) {
		if (!$release_id) {
			return 0;
		}

		$release_info = $this->table(C('DB_PREFIX') . 'project_release')->where("ID=" . $release_id)->field('ID, projectID, projectName, projectType, projectPrice, projectImage, customerPhoto, projectDesc, version')->find();

		return $release_info;
	}

	/**
	 * 获取流程下的所有的表单及表格数据表信息
	 * @param	int		$flow_id 当前流程ID
	 * @return	array
	 */
	public function getAllFlowTable($flow_id) {
		if (!$flow_id) {
			return 0;
		}

		$table_list = $this->table(C('DB_PREFIX') . 'table_directory')->where("flowID=" . $flow_id)->field('ID, tableName, tableTitle')->order('ID')->select();

		return $table_list;
	}

	/**
	 * 绑定应用到企业号
	 * @param	string	$corpid
	 * @param	int		$agentid
	 * @param	int		$siteid
	 * @return	boolean
	 */
	public function saveAppToWechat($corpid, $agentid, $siteid) {
		if ($corpid == '' || !$siteid || !$agentid) {
			return 0;
		}

		$wid = $this->table(C('DB_PREFIX') . 'wechat')->where("app_id='$corpid'")->getField('id');
		$site_name = D('UserSite')->getSiteInfo($siteid, 'siteName');

		$data = array(
			'WeId' => $wid,
			'agentId' => $agentid,
			'appId' => $siteid,
			'name' => $site_name,
			'status' => 1,
			'addTime' => time(),
		);

		$app_id = $this->table(C('DB_PREFIX') . 'wechat_qy_applist')->where("appId=" . $siteid)->getField('id');
		if ($app_id) {
			$res = $this->table(C('DB_PREFIX') . 'wechat_qy_applist')->where("id=" . $app_id)->data($data)->save();
		} else {
			$res = $this->table(C('DB_PREFIX') . 'wechat_qy_applist')->data($data)->add();
		}
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 获取应用已绑定微信信息
	 * @param	int		$site_id
	 * @return	array
	 */
	public function getAppWechatInfo($site_id) {
		if (!$site_id) {
			return 0;
		}

		$wechat_info = $this->table(C('DB_PREFIX') . 'wechat_qy_applist AS A')->join(C('DB_PREFIX') . 'wechat AS W ON W.id=A.WeId')
		                    ->join(C('DB_PREFIX') . 'wechat_qy_member_group AS G ON G.WeId=A.WeId')->where("A.AppId=" . $site_id)
		                    ->field('W.app_id, G.secret, A.agentId')->find();

		return $wechat_info ? $wechat_info : 0;
	}

	/**
	 * 试用项目部署
	 * @param	int		$release_id 待试用项目发布ID
	 * @return	boolean
	 */
	public function tryAProject($release_id) {
		if (!$release_id) {
			return 0;
		}

		$try_link = $this->table(C('DB_PREFIX') . 'project_release')->where("ID=" . $pub_id)->getField('tryDBLink');

		if ($try_link) {
			session('pid', $pub_id);
			session('front_view', 'try_project');

			return 1;
		} else {

			$data['tryDbLink'] = '';

			if ($tid) {
				$res = $this->addAProjectData($tid, $pub_id, 'try_project');
				session('pid', $pub_id);
				session('front_view', 'try_project');

				return $res ? 1 : 0;
			} else {
				return 0;
			}
		}
	}

	/**
	 * 正式部署一个项目应用
	 * @param	int		$user_id  部署用户
	 * @param	string		$order_no 订单编号
	 * @return	boolean
	 */
	public function deplayAApp($user_id, $order_no) {
		if ($order_no == 0 || $order_no == '') {
			return 0;
		}

		$trade_info = M('trade_info')->where("orderNo='$order_no'")->field('proID, userID, userNum, dayNum, orderStatus')->find();

		if ($trade_info['userID'] != $user_id || $trade_info['orderStatus'] == 0) {
			return 0;
		}

		$pub_info = M('project_release')->where("ID=" . $trade_info['proID'])->field('projectID, projectName, projectImage, appVersion')->find();
		$ico_path = M('project_images')->where("ID=" . $pub_info['projectImage'])->getField('imgPath');

		$data['createUser'] = $trade_info['userID'];
		$data['appName'] = $pub_info['projectName'];
		$data['appSource'] = $pub_info['projectID'];
		$data['appDeployTime'] = time();
		$data['buyDays'] = $trade_info['dayNum'];
		$data['buyUsers'] = $trade_info['userNum'];
		$data['appVersion'] = $pub_info['appVersion'];
		$data['fromProject'] = $trade_info['proID'];
		$data['icoPath'] = $_SERVER["DOCUMENT_ROOT"] . C("UPLOAD_URL") . "/" . $ico_path;
		$app_id = M('apps')->data($data)->add();
		unset($data);

		if ($app_id) {
			$data['appUrl'] = 'app' . $app_id;
			M('apps')->where("ID=" . $app_id)->data($data)->save();
			unset($data);

			$data['userID'] = $user_id;
			$data['appID'] = $app_id;
			$data['isActivated'] = 1;
			M('user_app')->data($data)->add();
			unset($data);

			$res = $this->addAProjectData($app_id, $trade_info['proID'], 'deploy');

			$data['userID'] = $user_id;
			$data['appID'] = $app_id;
			$data['isActive'] = 1;
			$data['isAdmin'] = 1;
			M('app_users')->data($data)->add();
			unset($data);

			return $res ? $app_id : 0;
		} else {
			return 0;
		}
	}

	/**
	 * 更新二维码
	 */
	public function updQRImg($app_id, $img_src) {
		if ($app_id == 0 || $img_src == '') {
			return 0;
		}

		$data['imgUrl'] = $img_src;
		$res = M('apps')->where("ID=" . $app_id)->data($data)->save();
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 删除指定已发布项目
	 * @param	int		$pub_id 已发布项目ID
	 * @return boolean
	 */
	public function delAReleaseProject($pub_id) {
		if ($pub_id == 0) {
			return 0;
		}

		$mdl_list = M('modules')->where("proID=$pub_id and proType=1")->field('moduleID')->order('ID')->select();
		foreach ($mdl_list as $value) {
			$this->delAProjectStructure('module', $value['moduleID']);
		}
		unset($value, $mdl_list);

		// 删除图像文件
		$image_lists = M('project_images')->where("proID=$pub_id")->field('imgPath')->order('ID')->select();
		foreach ($image_lists as $value) {
			unlink(__UPLOAD_URL__ . $value['imgPath']);
		}
		unset($value, $image_lists);
		// 删除发布项目的图像信息
		M('project_images')->where("proID=$pub_id")->delete();
		// 删除应用登记信息
		M('project_release')->where("ID=$pub_id")->delete();

		return 1;
	}

}
?>