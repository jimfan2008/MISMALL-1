<?php
/**
 * 调用基础项目数据库，初始化一个项目
 * @author 胡志强
 *
 * */
final class InitProject {
	private $proDb;	// 项目数据库
	private $userId;	// 用户ID
	private $proDbId;	// 项目ID
	private $proDbLink;	// 项目数据库连接

	/**
	 * 	初始化项目，登记项目信息及项目与用户对应
	 * 	@param	int		$uid  用户ID
	 *  @param	string	$pname	项目名称
	 * 	@return		int
	 */
	public function addProject($uid, $pname) {
		$this -> userId = $uid;

		$data['createUser'] = $uid;
		$data['proName'] = $pname;
		$proObj = M("projects");
		$proId = $proObj -> add($data);
		unset($data);

		$pro_db = 'ccproject_' . $proId;
		$this -> proDb = $pro_db;
		$dblink = "mysql://user" . $uid . ":user" . $uid . "@" . C('DB_HOST') . ':' . C('DB_PORT') . "/" . $pro_db;

		$data['proDbName'] = $pro_db;
		$data['proDbLink'] = $dblink;
		$proObj -> where("ID=$proId") -> save($data);
		unset($data, $proObj);

		$data['userID'] = $uid;
		$data['proID'] = $proId;
		$data['isActivated'] = 1;
		$upObj = M("user_project");
		$upObj -> add($data);

		unset($data, $upObj);

		$this -> proDbId = 'p' . $proId;
		$this -> proDbLink = $dblink;

		return $proId ? $proId : 0;
	}

	/**
	 *  建立项目数据库结构
	 *  @return bool
	 */
	public function initProjectDb() {
		$sql = <<<sql
		DROP DATABASE IF EXISTS `$this->proDb`;
		CREATE DATABASE `$this->proDb` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
		GRANT ALL PRIVILEGES ON $this->proDb.* TO user$this->userId@`%` IDENTIFIED BY 'user$this->userId';
sql;
		$mysqli = new mysqli(C('DB_HOST'), C('DB_USER'), C('DB_PWD'), '', C('DB_PORT'));
		$mysqli -> multi_query($sql);
		$mysqli -> close();
		unset($sql, $mysqli);

		$mObj = new Model();
		$mObj -> db('m0', 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject');
		$tables = $mObj -> query("SHOW TABLES");	//获取项目模版数据库中所有数据表
		$colname = 'Tables_in_ccproject';
		$mObj -> db($this -> proDbId, 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/' . $this -> proDb);	//更改连接到项目数据库

		//循环复制数据表结构
		foreach ($tables as $value) {
			$t_name = $value[$colname];
			$sql = "CREATE TABLE $t_name LIKE ccproject.$t_name ";	//复制数据表
			$mObj -> execute($sql);
		}
		unset($tables, $mObj);

		return true;
	}

	/**
	 *  初始化应用数据库数据
	 *  @return bool
	 */
	public function addProjectData() {
		//添加模块信息
		$data['moduleID'] = 'M' . date('ymdHis', time()) . rand(100000, 999999);
		$data['moduleName'] = '基础数据模块';
		$data['moduleType'] = 'menu';
		$data['moduleStatus'] = 1;
		$data['moduleSort'] = 50;
		$data['moduleLevel'] = 0;
		$data['hitTimes'] = 0;

		$mdlObj = M("module");
		$mdlObj -> db($this -> proDbId, $this -> proDbLink);
		$mdlObj -> add($data);
		$mdl_id = $data['moduleID'];
		unset($data, $mdlObj);

		//添加流程信息
		$data['flowID'] = 'flow' . date('YmdHis', time()) . rand(1000, 9999);
		$data['flowName'] = '基础数据流程';
		$data['createTime'] = time();
		$data['createUser'] = $this -> userId;
		$data['xmlData'] = '<flows><ObjectStream><Object ID="1" Name="FlowStack" key="1"><Property Name="Role" Value=""/><Property Name="Level" Value="false,false"/></Object><Object ID="2" Name="FlowNode" key="3"><Property Name="Role" Value=""/><Property Name="Level" Value=""/><Property Name="ObjectID" Value=""/><Property Name="AppointPerson" Value=""/><Property Name="PersonForm" Value=""/><Property Name="Condition" Value="" RuleResult=""/><Property Name="SplitFlow" Value=""/></Object><Object ID="3" Name="FlowLink" key="1"/><Object ID="4" Name="FlowLink" key="2"/></ObjectStream><stacks><stack key="1" value="0" y="0" height="130" name="申请者" background="#ccc"/></stacks><nodes><node key="1" nodeid="2" x="4" y="50" stack="1"><type value="Start"/><text value="开始"/></node><node key="2" nodeid="5" x="1238" y="62" stack="1"><type value="End"/><text value="结束"/></node><node key="3" nodeid="8" x="156" y="54" stack="1"><type value="InFormNode"/><text value="表单"/></node></nodes><paths><path key="1" from="1" to="3" line="M52 74.63157894736842L156 77.36842105263158" pathid="11"><text value=""/></path><path key="2" from="3" to="2" line="M204 78.17744916820702L1238 85.82255083179298" pathid="13"><text value=""/></path></paths></flows>';
		$data['isActivated'] = 0;
		$data['moduleID'] = $mdl_id;

		$flowObj = M('workflow');
		$flowObj -> db($this -> proDbId, $this -> proDbLink);
		$flowObj -> add($data);
		$flow_id = $data['flowID'];
		unset($data, $flowObj);

		//添加表单信息
		$data['formID'] = 'Frm' . date('YmdHis', time()) . rand(1000, 9999);
		$data['formTitle'] = '基础数据表单';
		$data['formSort'] = 1;
		$data['formStatus'] = 1;
		$data['formType'] = '基础表单';
		$data['createUser'] = $this -> userId;
		$data['createTime'] = time();
		$data['isLocked'] = 0;
		$data['isOnUsed'] = 1;
		$data['hitTimes'] = 0;
		$data['tableName'] = 'cc_tbfm' . date('YmdHis', time()) . rand(1000, 9999);
		$sid = $data['formID'];	//随机号
		$data['xmlData'] = '<Controls number="3"><control id="1" type="CCForm" name="' . $sid . '"><property name="Title" value="表单" type="string"/><property name="FormType" value="1" type="number"/></control><control id="2" type="CCTabs" name="Tab1"><property name="Title" value="选项卡1" type="string"/><property name="Width" value="" type="number"/><property name="Height" value="" type="number"/><property name="CCTabElements" value="3" type="object"/><property name="CCTabNumbers" type="list"/></control><control id="3" type="CCTabElements"/></Controls>';
		$data['flowID'] = $flow_id;

		$formObj = M("form_info");
		$formObj -> db($this -> proDbId, $this -> proDbLink);
		$form_id = $formObj -> add($data);
		$table_name = $data['tableName'];
		unset($data, $formObj);

		//添加表单字典信息
		$data['tableID'] = 't' . date('YmdHis', time()) . rand(1000, 9999);
		$data['tableTitleName'] = '基础数据 ';
		$data['tableName'] = $table_name;
		$data['flowID'] = $flow_id;
		$data['isBaseData'] = 1;
		$tdObj = D('table_directory');
		$tdObj -> db($this -> proDbId, $this -> proDbLink);
		$tdObj -> add($data);
		unset($data, $tdObj);

		//建立表单数据表
		$sql = "CREATE TABLE IF NOT EXISTS `" . $table_name . "` (
					`ID` int(12) NOT NULL auto_increment,
					`hitTimes` int(10) NOT NULL default '0',
					`enterUser` int(12) NOT NULL default '0',
					`enterTime` int(10) NOT NULL,
					`shStatus` int(6) NOT NULL default '0',
					PRIMARY KEY  (`ID`)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;";

		$mObj = new Model();
		$mObj -> db($this -> proDbId, $this -> proDbLink);
		$mObj -> execute($sql);

		unset($sql, $mObj);

		return true;
	}

}
?>