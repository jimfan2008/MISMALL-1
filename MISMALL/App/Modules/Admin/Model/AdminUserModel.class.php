<?php
/**
 * 后台－用户管理员－模型
 * 
 * @author cjli
 *
 */
class AdminUserModel extends Model
{
    /* 用户模型自动验证 */
	protected $_validate = array(
		/* 验证用户名 */
		array('username', '1,30', -1, self::EXISTS_VALIDATE, 'length'), //用户名长度不合法
//		array('username', 'checkDenyMember', -2, self::EXISTS_VALIDATE, 'callback'), //用户名禁止注册
		array('username', '', -3, self::EXISTS_VALIDATE, 'unique'), //用户名被占用

		/* 验证密码 */
		array('password', '6,30', -4, self::EXISTS_VALIDATE, 'length'), //密码长度不合法

		/* 验证邮箱 */
		array('email', 'email', -5, self::EXISTS_VALIDATE), //邮箱格式不正确
		array('email', '1,32', -6, self::EXISTS_VALIDATE, 'length'), //邮箱长度不合法
//		array('email', 'checkDenyEmail', -7, self::EXISTS_VALIDATE, 'callback'), //邮箱禁止注册
		array('email', '', -8, self::EXISTS_VALIDATE, 'unique'), //邮箱被占用

		/* 验证手机号码 */
		array('mobile', '//', -9, self::EXISTS_VALIDATE), //手机格式不正确 TODO:
//		array('mobile', 'checkDenyMobile', -10, self::EXISTS_VALIDATE, 'callback'), //手机禁止注册
		array('mobile', '', -11, self::EXISTS_VALIDATE, 'unique'), //手机号被占用
	);
	
	/* 用户模型自动完成 */
	protected $_auto = array(
		array('password', 'password', self::MODEL_BOTH, 'callback'),
		array('regTime', 'time', self::MODEL_INSERT, 'function'),
		array('regIP', 'get_client_ip', self::MODEL_INSERT, 'function'),
		array('login', 0, self::MODEL_INSERT),
		array('status', 1, self::MODEL_INSERT),
	);

	/**
	 * 获取用户信息
	 * @param array $post 查询条件 
	 * @example $psot('uid' => '','username' => '', 'email'=>'')
	 * @return array
	 */
	public function getUserInfo ($post)
	{
		//查询条件
		$where = array(
			'uid' => isset($post['uid']) && $post['uid'] ? intval($post['uid']) : '',
			'username' => isset($post['username']) && $post['username'] ? trim($post['username']) : '',
			'email' => isset($post['email']) && $post['email']  ? trim($post['email']) : '',
		);
		//过滤空项
		foreach($where as $key => $val){
			if(empty($val) || is_null($val)){
				unset($where[$key]);
			}
		}
		//查数据库
        $userInfo = $this->where($where)->find();
        if($userInfo){
        	unset($userInfo['password']);
        }
        return $userInfo ? $userInfo : array();
    }
    
    /**
     * 用户注册
     * @param string $username　用户名
     * @param string $password　用户密码
     * @param string $email　用户邮箱
     * @return mixed
     */
    public function register($username, $password, $email, $nickname = '', $mobile = '')
    {
    	$set = array(
    		'username'	=> trim($username),
    		'email' 	=> trim($email),
    		'password' 	=> trim($password),
    		'nickname'	=> $nickname ? trim($nickname) : trim($username),
    		'mobile'	=> trim($mobile),
    	);
    	
    	//验证手机
		if(empty($data['mobile'])) unset($data['mobile']);

		/* 添加用户 */
		if($this->create($set)){
			$uid = $this->add();
			return $uid ? $uid : 0; //0-未知错误，大于0-注册成功
		} else {
			return $this->getError(); //错误详情见自动验证注释
		}
    }
    
    /**
     * 用户登录
     * @param $username 用户名或者邮箱
     * @param $password
     * @return array/boolean	成功返回用户信息
     */
    public function login($username, $password)
    {
    	$map = array(
    		'username' => trim($username),
    		'email' => trim($username),
    		'_logic' => 'OR'
    	);
    	$where['status'] = 1;
    	$where['_complex'] = $map;
    	
    	$info = $this->field('uid, username, password,nickname')->where($where)->find();

    	//判断密码是否相等
    	if($info && isset($info['password']) && $info['password'] == $this->password($password)) {
    		
    		//更新登录信息
    		$set = array(
    			'login'			=> array('exp','login+1'),
    			'lastLoginTime'	=> time(),
    			'lastLoginIP'	=>	get_client_ip,
    		);
    		$this->where(array('uid' => $info['uid']))->save($set);
    		return $info;
    	}else{
    		return false;
    	}
    }
    
    /**
     * 编辑用户信息
     * @param int $uid　用户uid
     * @param array $post　编辑信息
     * ＠return boolean
     */
    public function edit($uid, $post)
    {
    	$set = array();
    	$affect = false;
		
		isset($post['username']) && $post['username'] ? $set['username'] = trim($post['username']) : '';
		isset($post['email']) && $post['email'] ? $set['email'] = trim($post['email']) : '';
		isset($post['nickname']) && $post['nickname'] ? $set['nickname'] = trim($post['nickname']) : '';
		isset($post['mobile']) && $post['mobile'] ? $set['mobile'] = trim($post['mobile']) : '';
		
		if($set){
			if($this->create($set)) {
				$affect = $this->where(array('uid' => $uid))->save($set);
				return $affect;
			} else {
				return $this->getError();
			}
		} else {
			return false;
		}
    }
    
    /**
     * 修改密码
     * @param int $uid　用户uid
     * @param string $old_password 旧密码
     * @param string $new_password 新密码
     * @return boolean
     */
    public function editPassword($uid, $old_password, $new_password)
    {
    	if($old_password == $new_password){
    		return true;
    	}
    	
    	//用户密码
    	$user_pwd = $this->where(array('uid' => $uid))->getField('password');
    	
    	if($user_pwd && $user_pwd == $this->password($old_password)) {
    		$data = array(
    			'password' => $this->password($new_password),
    		);
    		$this->where(array('uid' => $uid))->save($data);
    		return true;
    	}else{
    		return false;
    	}
    }
    
    /**
     * 删除用户信息
     */
    public function deleteUser($map)
    {
    	return $this->delete($map);
    }
    
    /**
     * 验证用户名是否存在
     * @param string $username 用户名
     * @return boolean
     */
    public function checkUserName($username)
    {
    	 return (boolean)$this->where(array('username' => $username))->count();
    }
    
    /**
     * 验证用户邮箱是否存在
     * @param string $email 用户邮箱
     * @return boolean
     */
    public function checkUserEmail($email)
    {
    	return (boolean)$this->where(array('email' => $email))->count();
    }
   
    /**
     * 加密 md5
     * @param $password
     * @return md5
     */
    public function password($password)
    {
    	return md5(trim($password));
    }
    
}