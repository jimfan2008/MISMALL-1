<?php
    /**
     * 
     */
    class ApiManageModel extends Model {
        
    	/**
		 * 切换数据库
		*/
		public function changeDB($project_id) {
			$this -> db('p' . $project_id, D('PlatForm') -> projectDbLink($project_id));
		}
		
		/**
		 * 保存api配置信息
		 */
        public function apiSave($data)
        {
        	$uid = session('uid');
			//修改
			if($data['id']){
				$data['modify_user'] = $uid;
			    $data['modify_time'] = time();
				$where = array('id' => $data['id'], 'create_user' => $uid);
			    return $this -> data($data) -> where($where) -> save();
			}
			else { //新增
			    $data['create_user'] = $uid;
			    $data['create_time'] = time();
				return $this -> data($data) -> add();
			}
        }
		
		/**
		 * 删除API
		 */
		public function deleteApiById($id)
		{
			//return "id==".$id;
			return $this->where('id='.$id)->delete();
		}
		
		/**
		 * 提交审核
		 */
		public function ciAuditApiById($id){
			$data = array("status" => 1);
			$where = array("id" => $id, "status" => 0);
			return $this -> data($data) -> where($where) ->save();
		}
		
		/**
		 * 获取所有的Api信息
		 */
		public function getApisInfo($where = array(), $order = array(), $field)
		{
			//return $this->table(C('DB_PREFIX').'apimanage')->find();
			//find() 查询一行  select() 查询所有
			 return $this -> field($field) -> where($where) -> order($order) -> select();
		}
		
		public function getApiById($apiId){
			$where['id'] = $apiId;
			return $this->where($where)->find();
		}
    }
    
?>