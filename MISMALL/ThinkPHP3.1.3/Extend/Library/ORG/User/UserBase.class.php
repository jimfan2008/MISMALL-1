<?php
/**
 * 用户基本信息类
 * 操作cycc库users表
 *
 * @author cjli
 *
 */
final class UserBase {
	private $_error = '';		//错误信息
	private $_user_model = null;	//用户模型
	protected $dbName = '';	//user表所在数据库
	protected $tablePrefix = '';	//表前缀

	/**
	 * 初始化user_model
	 */
	public function __construct() {
		$this -> dbName = C('DB_NAME');
		$this -> tablePrefix = C('DB_PREFIX');
		$this -> _user_model = M($this -> dbName . '.users', $this -> tablePrefix);
	}

	/**
	 * 获取用户信息
	 * @param array $post 查询条件
	 * @example $post('user_id' => '','username' => '', 'email'=>'')
	 * @return array
	 */
	public function getUserInfo($post) {
		//查询条件
		$where = array('ID' => isset($post['user_id']) && $post['user_id'] ? intval($post['user_id']) : '', 'userName' => isset($post['username']) && $post['username'] ? trim($post['username']) : '', 'userEmail' => isset($post['email']) && $post['email'] ? trim($post['email']) : '', );
		//过滤空项
		foreach ($where as $key => $val) {
			if (empty($val) || is_null($val)) {
				unset($where[$key]);
			}
		}
		
		//查数据库
		$userInfo = $this -> _user_model -> where($where) -> find();
		if ($userInfo) {
			unset($userInfo['userPwd']);
		}
		return $userInfo ? $userInfo : array();
	}

	/**
	 * 用户注册
	 * @param string $password　用户密码
	 * @param string $email　用户邮箱
	 * @return mixed
	 */
	public function register($email, $password,$username ='',$parentId) {
		if ($this -> checkUserEmail($email)) {
			$this -> _error = L('_EMAIL_EXISTS');
			return false;
		}
		
		$user_data = explode('@', $email);
		if($username){
			$username=$username;
			
		}else{
			$username=$user_data[0];
		}
		
		$set = array(
			'userEmail' => trim($email), 
			'userPwd' => $this -> password($password), 
			'userName' => trim($username), 
			'regTime' => time(), 
			'isActivated' => 1, 
			'userPhoto' => 'Images/Avatar/00.gif',
			"parent" =>$parentId
		);

		$user_id = $this -> _user_model -> data($set) -> add();
		
		
		//注册成功
		if ($user_id) {
			
			//更新到forum_member
			$data = array(
				'uid' 		=> $user_id,
				'nickname'	=> $set['userName'],
				'sex'		=> 0,
				'login'		=> 0,
				'reg_ip'	=> get_client_ip(),
				'reg_time'	=> $set['regTime'],
				'last_login_ip'=> get_client_ip(),
				'last_login_time'=> $set['regTime'],
				'status'	=> $set['isActivated'],
				'signature'	=> '',
			);
			M('ForumMember')->data($data)->add();
			
			//登录信息
			$this -> addLoginInfo($user_id);
		}else{
			$this->_error=$this -> _user_model->getLastSql();
		}
		return $user_id;
	}

	/**
	 * 用户登录
	 * @param $username 用户名或者邮箱
	 * @param $password
	 * @return array/boolean	成功返回用户信息
	 */
	public function login($username, $password) {
		$where = array(
		//'userName' => trim($username),
		'userEmail' => trim($username),
		//'_logic' => 'OR'
		);
		$info = $this -> _user_model -> field('ID, userName, userPwd, isActivated,qyWechatId, wechatId') -> where($where) -> find();

		//判断密码是否相等
		if ($info) {
			if ($info['isActivated']) {
				if (isset($info['userPwd']) && $info['userPwd'] == $this -> password($password)) {
					//登录信息
					$this -> addLoginInfo($info['ID']);
					return $info;
				} else {
					$this -> _error = L('_PASSWORD_ERROR');
				}
			} else {
				$this -> _error = L('_AUTH_NOT_ACTIVATED');
			}
		} else {
			$this -> _error = L('_AUTH_FAILED');
		}

		return false;
	}
	
	
	/**
	 * 编辑用户信息
	 * @param int $user_id　用户ID
	 * @param array $post　编辑信息
	 * ＠return boolean
	 */
	public function edit($user_id, $post) {
		$set = array();
		$affect = false;
		
		isset($post['userName']) && $post['userName'] ? $set['userName'] = trim($post['userName']) : '';
		isset($post['userEmail']) && $post['userEmail'] ? $set['userEmail'] = trim($post['userEmail']) : '';
		isset($post['userPhoto']) && $post['userPhoto'] ? $set['userPhoto'] = trim($post['userPhoto']) : '';
		isset($post['isActivated']) && $post['isActivated'] ? $set['isActivated'] = intval($post['isActivated']) : '';
		isset($post['shareCode']) && $post['shareCode'] ? $set['shareCode'] = intval($post['shareCode']) : '';
		if ($set) {
			$affect = $this -> _user_model -> where(array('ID' => $user_id)) -> save($set);
		}
		
		print_r($this -> _user_model->getLastSql());
		if($affect){
			//更新到forum_member
			if($set['isActivated']){
				$data['status'] = $set['isActivated'];
			}
			if($set['userName']){
				$data['nickname'] = $set['userName'];
			}
			if($data){
				M('ForumMember')->where('uid='.$user_id)->data($data)->save();
			}
		}

		return (boolean)$affect;
	}

	/**
	 * 修改密码
	 * @param int $user_id　用户ID
	 * @param string $old_password 旧密码
	 * @param string $new_password 新密码
	 * @return boolean
	 */
	public function editPassword($user_id, $old_password, $new_password) {
		if ($old_password == $new_password) {
			return true;
		}
		//用户密码
		$user_pwd = $this -> _user_model -> where(array('ID' => $user_id)) -> getField('userPwd');
		if ($user_pwd && $user_pwd == $this -> password($old_password)) {
			$data = array('userPwd' => $this -> password($new_password), );
			$this -> _user_model -> where(array('ID' => $user_id)) -> save($data);
			return true;
		} else {
			$this -> _error = L('_OLD_PASSWORD_ERROR');
			return false;
		}
	}

	/**
	 * TODO删除用户信息
	 */
	public function deleteAUser() {
	}

	/**
	 * 验证用户名是否存在
	 * @param string $username 用户名
	 * @return boolean
	 */
	public function checkUserName($username) {
		return (boolean)$this -> _user_model -> where(array('userName' => $username)) -> count();
	}

	/**
	 * 验证用户邮箱是否存在
	 * @param string $email 用户邮箱
	 * @return boolean
	 */
	public function checkUserEmail($email) {
		return (boolean)$this -> _user_model -> where(array('userEmail' => $email)) -> count();
	}

	/**
	 * 加密 md5
	 * @param $password
	 * @return md5
	 */
	public function password($password) {
		return md5(trim($password));
	}

	/**
	 * 返回错误信息
	 */
	public function getError() {
		return $this -> _error;
	}

	/**
	 * 记录用户登录信息
	 * @param int $user_id 用户ID
	 * ＠return int
	 */
	public function addLoginInfo($user_id) {
		$data['userID'] = $user_id;
		$data['loginTime'] = time();
		$data['loginIP'] = get_client_ip();
		//当前登录用户IP

		$log_id = M('LoginInfo') -> add($data);
		
		//更新到forum_member
		$forum_data = array(
			'login'		=> array('exp','login+1'),
			'last_login_ip'=> $data['loginTime'],
			'last_login_time'=> $data['loginTime'],
		);
		M('ForumMember')->where('uid='.$data['loginTime'])->data($forum_data)->save();
		//行为日志
		action_log('user_login','ForumMember', $user_id, $user_id);
		unset($data, $logininfoObj);

		return $log_id;
	}
	
	

}
