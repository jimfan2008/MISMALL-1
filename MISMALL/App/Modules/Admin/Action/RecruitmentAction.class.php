<?php
	class RecruitmentAction extends  AdminAction {
		public function index() {
			$resume = M("Resume");
			$list =	$resume ->select();
			$num = count($list);
			for($i =0; $i < $num; $i++){
				$list[$i]['id']=$i+1;
			}
			$this -> assign("list",$list);
	        $this->display("index");
		}
		
		
		public function deleteResume(){
			$resume = M("Resume");
			$resumeId=$this -> _get("resumeId");
			$resumeURL=$this -> _get("resumeURL");
            $resume ->where("resume_id=".$resumeId)->delete();
            $file_name = C('UPLOAD_PATH').$list[0]['saveName'];
            if( file_exist($file_name) ) {
            	file_delete($file_name);
            }
             $list=$resume ->where("resume_id=".$resumeId)-> select();
			$this->index();
		}
	}
?>