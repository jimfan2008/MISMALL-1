<?php
/**
 * 公司信息类
 * 获取公司相关信息
 * @author cjli
 *
 */
class Company {

	/**
	 * 获取二域名
	 * return String
	 */
	static public function getSubDomain() {
		//如果是IP直接跳过
		if (HTTP_HOST_IS_IP) {
			return false;
		}
		//点在域名中出现的次数来判断是否有二级域名
		$count = substr_count(HTTP_HOST, '.');
		if ($count >= 2) {
			$sub_domain = strtolower(substr(HTTP_HOST, 0, strpos(HTTP_HOST, '.')));

			//预留的二级域名
			$reserved_domain = C('APP_SUB_DOMAIN_DENY') && is_array(C('APP_SUB_DOMAIN_DENY')) ? C('APP_SUB_DOMAIN_DENY') : array();
			//二级不为www时才能为正常的二级域名
			if ($sub_domain != 'www' || !in_array($sub_domain, $reserved_domain)) {
				return $sub_domain;
			}
		}
		return false;
	}

	/**
	 * 设置统一COOKIE域名
	 */
	static public function getCookieDomain() {
		//如果是IP直接跳过
		if (HTTP_HOST_IS_IP || HTTP_HOST == 'localhost') {
			return HTTP_HOST;
		}

		$count = substr_count(HTTP_HOST, '.');
		//带www或者二级域名
		if ($count >= 2) {
			$domainArr = explode('.', HTTP_HOST);
			$cookie_domain = '.' . $domainArr[1] . '.' . $domainArr[2];
		} else {
			$cookie_domain = '.' . HTTP_HOST;
		}
		return $cookie_domain;
	}

	/**
	 * 根据二级域名获取公司详细信息
	 * @param String $sub_domain 二级域名
	 * @return Array
	 */
	static public function getInfoBySubDomain($sub_domain) {
		$compObj = M('company');
		$company = $compObj -> where(array('domain' => $sub_domain)) -> find();
		unset($compObj);
		return $company;
	}

	/**
	 * 根据部署者ID(所有者)获取公司详细信息
	 * @param String $user_id 应用部署者ID
	 * @return Array
	 */
	static public function getInfoByUserId($user_id) {
		$compObj = M('company');
		$company = $compObj -> where(array('userId' => $user_id)) -> find();
		unset($compObj);

		return $company;
	}

	/**
	 * 根据邀请用户ID获取公司详细信息
	 * @param String $user_id 邀请用户ID
	 * @return Array
	 */
	static public function getInfoByAppUserId($user_id) {
		//邀请用户的ID->项目ID->部署者ID
		$mObj = new Model();
		$mObj -> table("cc_user_app U");
		$mObj -> join("cc_apps A on U.appID=A.ID");
		$mObj -> where("U.userID=" . $user_id . " and U.isActivated=1");
		$appUser = $mObj -> field('A.createUser') -> group('A.createUser') -> find();
		unset($mObj);

		if ($appUser && $appUser['createUser']) {
			return self::getInfoByUserId($appUser['createUser']);
		}
		return false;
	}

	/**
	 * 根据二级域名查找到可以使用的所有用户包含创建者
	 * 用来判断用户使用二级域名登录时判断那些用户可以使用二级域名
	 * @param　Ｓtring $sub_domain　二级域名
	 * @return Array
	 */
	static public function getUsersBysubDomain($sub_domain) {
		$companyInfo = self::getInfoBySubDomain($sub_domain);
		//公司二级域名不存在
		if (!$companyInfo) {
			return false;
		}

		//根据创建者ID获取部署应用关联的所有用户
		$userIds = array();
		$mObj = new Model();
		$mObj -> table("cc_user_app U");
		$mObj -> join("cc_apps A on U.appID=A.ID");
		$mObj -> where("A.createUser=" . $companyInfo['userId'] . " and U.isActivated=1");
		$appUsers = $mObj -> field('U.userID') -> group('U.userID') -> select();
		unset($mObj);

		if ($appUsers) {
			foreach ($appUsers as $user) {
				$userIds[] = $user['userID'];
			}
		}

		return $userIds;
	}

	/**
	 * 获取应用的子域名
	 * @param int $app_id 应用ID
	 * @return string
	 */
	static public function getSubDomainByApp($app_id) {
		$mObj = new Model();
		$mObj -> table("cc_company C");
		$mObj -> join('cc_apps AS A ON C.userID = A.createUser');
		$mObj -> where(array('A.id' => $app_id));
		$domain = $mObj -> field('C.domain') -> find();

		return $domain ? $domain['domain'] : false;
	}

	/**
	 * 公司信息入库
	 * @param Array $post 公司信息
	 * @param int $compay_id 公司ID
	 * @return mixed
	 */
	static public function updateCompanyInfo($post, $company_id = 0) {
		$compObj = D('company');
		$set = array();

		if (empty($post))
			return false;

		//验证域名是否重复
		if ($post['domain']) {
			$company = self::getInfoBySubDomain($post['domain']);
			if ($company && $company_id != $company['id']) {
				return false;
			}
		}

		isset($post['name']) ? $set['name'] = trim($post['name']) : null;
		isset($post['domain']) ? $set['domain'] = trim($post['domain']) : null;
		isset($post['logo']) ? $set['logo'] = trim($post['logo']) : null;

		if (!intval($company_id)) {
			$set['userId'] = $_SESSION['uid'];
			$set['add_time'] = time();
			$company_id = $compObj -> add($set);
		} else {
			$compObj -> where(array('id' => $company_id)) -> save($set);
		}

		//更新用户session
		import('ORG.Users.InitUser');
		$userObj = new InitUser();
		$sessionInfo = $userObj -> getSessionInfo();
		$sess_data = array('uid' => $sessionInfo['uid'], 'uname' => $sessionInfo['uname'], 'uemail' => $sessionInfo['uemail'], 'company' => self::getInfoByUserId($sessionInfo['uid']), );

		$userObj -> setSession($sess_data);

		unset($compObj);

		return $company_id;
	}

}
