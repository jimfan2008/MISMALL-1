<?php
    /**
     * 开发者相关数据类 
     */
    class DeveloperModel extends Model {
    	
		function _initialize(){
			
		}
		
		/**
		 * 保存名片信息 tlj
		 */
		function saveBusinessCard($data){
			$data['create_user'] = session('uid');
			$data['create_time'] = time();
			$model = M('business_card');
			$uid = $model->where("create_user = ".session('uid'))->getField("create_user");
			if($uid){
				return $model->data($data)->save();
			}else{
				
			 	return $model->data($data)->add();
			}
			
		    //$this->table('cc_business_card')->data($data)->add();
		}
    }
    
?>