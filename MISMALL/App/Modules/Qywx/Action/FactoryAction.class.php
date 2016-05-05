<?php

/**
 * 应用工厂模块控制器
 * 接收应用工厂中操作方法数据
 */
class FactoryAction extends Action {
    
    /**
	 * 构造方法
	 */
	public function __construct() {
		parent :: __construct();
		$this -> _initialize();	
	}
	
	/**
	 * 回调方法 初始化模型
	 */
    protected function _initialize() {
		if (!I('session.uid', 0)) {
			redirect(__APP__ . '/Index');		// 检查认证识别号，判断用户登录
		}
    }

	/**
	 * 初始化应用工厂，添加默认项目
	 * @return	bool
	 */
    public function initFactory() {
    	//判断进入应用工厂的来路
    	$site_id = I('post.siteId', 0, 'intval');
    	session('ez_site_id', $site_id);
    	session('pid', 0);
    	session('front_view', 'view_project');

		$user_id = I('session.uid');
		$project_info = D('PlatForm') -> getAllProjectsInfo($user_id, $site_id);
		
		if ( !count($project_info)) {
			$project_name = $site_id ? '网站后台管理' : '初始项目';
			$project_id = D('PlatForm') -> addAProjectInfo($user_id, $project_name, $site_id);
			if ($project_id) {
				return D('PlatForm') -> createProjectDB($project_id, 0);
			} else {
				return 0;
			}		
		} else {
			return 0;
		}	
	}
	
	/**
	 * 获取流程下的数据回写信息
	 * @param 	int 	$flow_id 选中流程ID
	 * @return 	int
	 */
	public function getDataCubeNumByFlow() {
		$flow_id = I('post.flowId', 0, 'intval');
		
		echo count( D('DataProcess') -> getFlowDataRewriteByStatus($flow_id));
	}
	
	/**
	 * 获取流程下的数据接口信息
	 * @param 	int 	$flow_id 选中流程ID
	 * @return 	int
	 */
	public function getInterfaceNumByFlow() {
		$flow_id = I('post.flowId', 0, 'intval');

		echo count( D('Query') -> getInterfaceListByFlow($flow_id, 0));
	}

	/**
	 * 在应用工厂添加一个开发项目
	 * @param	int		$user_id 当前用户ID
	 * @param	string	$project_name 新建项目名称
	 * @return  int
	 */
	public function addAproject() {
		$user_id = session('uid');
		$site_id = session('ez_site_id');
		$project_name = I('post.pro_name', '', 'trim');

		$project_id = D('PlatForm') -> addAProjectInfo($user_id, $project_name, $site_id);
		if ($project_id) {
			D('PlatForm') -> createProjectDB($project_id);
		}

		echo $project_id ? $project_id : 0;
	}

	/**
	 * 在项目中添加一个模块
	 * @param  	string	$mdl_name 新建模块名称
	 * @return	json
	 */
	public function addAModule() {
		$mdl_name = I('post.mdl_name', '', 'trim');
			
		$mdl_info = D('Project') -> addAModuleForProject($mdl_name);
		
		echo  $mdl_info ? json_encode_cn($mdl_info) : 0;
	}

	/**
	 * 在模块中添加一个流程
	 * @param	int 	$mdl_id 添加流程的模块ID
	 * @param	string	$flow_name 新建流程名称，从ajax传递获取
	 * @return	json
	 */
	public function addAFlow() {
		$mdl_id = I('post.mdl_id', 0, 'intval');
		$flow_name = I('post.flow_name', '', 'trim');
		
		$flow_info = D('Project') -> addAflowForModule($mdl_id, $flow_name);

		echo $flow_info ? json_encode_cn($flow_info) : 0;
	}
	
	/**
	 * 验证表单标题名称
	 * @param	int		$flow_id 表单所处流程ID
	 * @param	string		$form_name 表单名称
	 * @return	boolean
	 */
	public function chkFormTitle() {
		$flow_id = I('post.flow_id', 0, 'intval');
		$form_title = I('post.form_title', '', 'trim');

		echo D('Project') -> chkFormTitle($flow_id, $form_title);
	}

	/**
	 * 修改一个项目名称
	 * @param	int		$project_id 要修改项目的ID
	 * @param	string	$new_name 新的模块名称
	 * @return 	boolean
	 */
	public function updAProject() {
		$project_id = I('post.pro_id', 0, 'intval');
		$new_name = I('post.new_name', '', 'trim');

		echo D('PlatForm') -> updateAProjectName($project_id, $new_name);
	}

	/**
	 * 修改一个模块名称
	 * @param	int		$mdl_id 要修改模块的ID
	 * @param	string	$new_name 新的模块名称
	 * @return 	boolean
	 */
	public function updAModule() {
		$mdl_id = I('post.mdl_id', 0, 'intval');
		$new_name = I('post.new_name', '', 'trim');

		echo D('Project') -> updAModuleName($mdl_id, $new_name);
	}

	/**
	 * 修改一个流程名称
	 * @param	int		$flow_id 要修改流程的ID
	 * @param	string	$new_name 新的流程名称
	 * @return 	boolean
	 */
	public function updAFlow() {
		$flow_id = I('post.flow_id', 0, 'intval');
		$new_name = I('post.new_name', '', 'trim');

		echo D('Project') -> updAFlowName($flow_id, $new_name);
	}

	/**
	 * 删除一个项目
	 * @param	int		$project_id 要删除项目的ID
	 * @return boolean
	 */
	public function delAProject() {
		$project_id = I('post.pro_id', '', 'intval');

		echo D('PlatForm') -> delAProject($project_id);
	}

	/**
	 * 删除一个模块
	 * @param	int		$mdl_id 要删除模块的ID
	 * @return 	boolean
	 */
	public function delAModule() {
		$mdl_id = I('post.mdl_id', '', 'trim');

		echo D('Project') -> delAProjectStructure('module', $mdl_id);
	}

	/**
	 * 删除一个流程
	 * @param	string	$flow_id 要删除流程的ID
	 * @return 	boolean
	 */
	public function delAFlow() {
		$flow_id = I('post.flow_id', 0, 'intval');

		echo D('Project') -> delAProjectStructure('workflow', $flow_id);
	}
	
	/**
	 * 删除一个表单
	 * @param	int		$id 表单ID
	 * @return	boolean
	 */
	public function delAForm() {
		$form_id = I('post.form_id', 0, 'intval');
		
		echo D('Project') -> delAForm($form_id);
	}

}
?>