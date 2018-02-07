angular.module('adminServices',[])

.factory('Admin' , function($http){
	var adminFactory = {};
	//Save treeview update code information
	adminFactory.savecode = function(code,which){
		var codeData={};
		codeData.code = code;
		codeData.which = which;
		codeData.active = true;
		return $http.post('/api/save_code', codeData);
	};
	adminFactory.getUsers = function(){
		return $http.get('/api/get_users');
	}
	//get treeview data
	adminFactory.getProduct = function(){
		return $http.get('/api/get_product');
	};
	//add new directory and code
	adminFactory.addNew = function(data){
		return $http.post('/api/addNew',data);
	}
	//delete existing directory
	adminFactory.deleteDirectory = function(data){
		return $http.post('/api/deleteDirectory',data);
	}
	//update code name
	adminFactory.updateCodeName = function(data){
		return $http.post('/api/updateCodeName',data);
	}
	//update description
	adminFactory.updateDescription = function(data){
		return $http.post('/api/updateDescription',data);
	}
	//allow code detail,splash,banner
	adminFactory.allow = function(data){
		return $http.post('/api/allow',data);
	}
	//reject code detail,splash,banner
	adminFactory.reject = function(data){
		return $http.post('/api/reject',data);
	}
	return adminFactory;
	
})