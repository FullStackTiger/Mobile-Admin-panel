angular.module('treeServices',[])

.factory('Tree' , function($http){
	var treeFactory = {};

	//Save treeview data
	treeFactory.save = function(treeData){
		return $http.post('/api/save', treeData);
	};
	//Save treeview update code information
	treeFactory.savecode = function(code,which){
		var codeData={};
		codeData.code = code;
		codeData.which = which;
		codeData.active = false;
		return $http.post('/api/save_code', codeData);
	};
	//get treeview data
	treeFactory.getProduct = function(){
		return $http.get('/api/get_product');
	};
	//pay for uploading
	treeFactory.pay = function(info){
		console.log(info);
		return $http.post('/api/pay',info);
	};

	return treeFactory;
})