angular.module('adminController',['authServices','adminServices','ngFileUpload'])
.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }])
.controller('adminCtrl',function(Auth,$scope,Admin,Upload,$window,$location){

  var app=this;
  app.editSelection = [];
  app.categories = [];
  app.deleteDir = false;
  $scope.codeEdit = false;
  Admin.getUsers().then(function(data){
    console.log("get Users");
    if (data.data.users){
      app.users = data.data.users;
    }
  })
  Admin.getProduct().then(function(data){
        if (data.data.data){
          console.log(data)
          app.roleList = data.data.data;
        }
  });
  app.isCodeName = function(Data){
      for (index in Data){
        if (Data[index].roleName==$scope.currentCodeName){
           // console.log("find code");
           if (Data[index].roleType=='code')
           {
            // console.log("It's true");
            app.isCode = true;
            return true;
           }
           else
           {
            // console.log("It's false");
            app.isCode = false;
            return false;
           }
        }else if (Data[index].children.length>0){
          app.isCodeName(Data[index].children);
        }
      }
  }
  app.editCodeClick = function(){
    $scope.codeEdit = !$scope.codeEdit
    if ($scope.codeEdit == true){
      $scope.editedCode = $scope.currentCodeName;
    }else{
      console.log(app.editCode,$scope.currentCodeName);
      var data={};
      data.currentCodeName = $scope.currentCodeName;
      data.updatedCodeName = app.editCode;
      Admin.updateCodeName(data).then(function(data){
        app.roleList=data.data.data;
        $scope.currentCodeName = app.editCode;
      });
    }
  }
  $scope.editCodeName = function(){
    app.editCode = $scope.editedCode;
  }
  app.getCategory = function(){
    console.log("getCategory");
    this.setCategories(0);
  }
  app.setCategories = function(index){
    if (app.categories.length==0){
      var tempCategory = [];
      for (index in app.roleList){
        var name = app.roleList[index].roleName;
        if (typeof(name)=='string'){
         tempCategory.push(name);
        }
      }
      app.categories.push(tempCategory);
      console.log(app.categories);
    }else{
      app.startAddCategories = 0;
      app.addCategories(app.roleList);
    }
  }
  app.addCategories=function(data){
    app.startAddCategories++;
    var find=0;
      for (index in data){
        var name = data[index].roleName;
       
        if (name == app.editSelection[app.startAddCategories-1]){
          find=1;
          var children = data[index].children;
          var tempCategory = [];
          for (idx in children){
            var cname = children[idx].roleName;
            console.log(cname);
            if (children[idx].roleType=='parent') tempCategory.push(cname);
          }
          if (tempCategory.length>0) {
            if (app.categories[app.startAddCategories]) {
                console.log("exist");
            }
            else{
                app.categories[app.startAddCategories]=tempCategory;
            } 
            if (app.editSelection.length>app.startAddCategories){
              app.addCategories(data[index].children);
            }else{
              return;
            }
          }
        }
        
      }

  }
  app.setSubCategory = function(index){
    $scope.added = false;
    app.deleteDir = false;
    $scope.deleted = false;
    if (app.selectedItem!='') app.editSelection[index]=app.selectedItem[index];
    var unneeded = app.editSelection.length-index-1;
    for (var i=0;i<unneeded;i++){
      app.editSelection.pop();
    }
    // app.editSelection.clean(null);
    app.categories.splice(app.editSelection.length);
    if (app.editSelection.length>0){
      app.deleteDir = true;
    }
    console.log(app.categories);
    if (app.selectedItem!='') this.setCategories(index);
  }
  // Array.prototype.clean = function(deleteValue) {
  // for (var i = 0; i < this.length; i++) {
  //   if (this[i] == deleteValue) {         
  //     this.splice(i, 1);
  //     i--;
  //   }
  // }
  // return this;
  // };
  app.addNew = function(){
    var data = {};
    data.path = app.editSelection;
    data.data = $scope.newCode;
    Admin.addNew(data).then(function(data){
      if (data.data.success==true){
        app.roleList = data.data.data;
        $scope.added = true;
        app.categories = [];
        app.editSelection = [];
        app.selectedItem = [];
        app.setCategories(0);
      }
    })
  }
  app.deleteDirectory = function(){
    var data = {};
    data.path = app.editSelection;
    Admin.deleteDirectory(data).then(function(data){
      if (data.data.success==true){
        $scope.deleted = true;
        app.roleList = data.data.data;
        app.categories = [];
        app.editSelection = [];
        app.selectedItem = [];
        app.setCategories(0);
      }
    })
  }
  app.editDesClick = function(){
    $scope.desEdit = !$scope.desEdit
    if (!$scope.desEdit){
      var data={};
      data.currentCodeName=$scope.currentCodeName;
      data.description = app.description;
      console.log(data);
      Admin.updateDescription(data).then(function(data){
        if (data.data.success==true){
          app.roleList=data.data.data;
        }
      })
    }
  }
  app.showModal = function(url) {
      app.currentPhotoUrl = url;
      $("#myModal").modal({ backdrop: "static" }); // Open modal
  };
  app.getImages = function(Data){
      for (index in Data){
        if (Data[index].roleName==$scope.currentCodeName){
           app.currentDetails = Data[index].detail;
           app.currentSplashs = Data[index].splash;
           app.currentBanners = Data[index].banner;
           app.description = Data[index].description;
           return;
        }else if (Data[index].children.length>0){
          app.getImages(Data[index].children);
        }
      }
  }
  $scope.$watchCollection('currentCodeName', function() {
      console.log("watch");
      app.isCodeName(app.roleList);
      app.getImages(app.roleList);
  }, true);
  app.uploadedtype = -1;
  app.submit_detail = function(which){ //function to call on form submit
      app.uploadedtype = which;
      if (which == 0){
        if (app.detailFile) { //check if from is valid
            app.upload(app.detailFile); //call upload function
        }
      }else if (which == 1){
        if (app.splashFile) { //check if from is valid
            app.upload(app.splashFile); //call upload function
        }
      }else if (which == 2){
        if (app.bannerFile) { //check if from is valid
            app.upload(app.bannerFile); //call upload function
        }
      }

  }

  app.allow = function(which,index){
    var data={};
    data.which = which;
    data.index = index;
    data.currentCodeName = $scope.currentCodeName;
    Admin.allow(data).then(function(data){
      app.roleList=data.data.data;
    })
  }
  app.reject = function(which,index){
    var data={};
    data.which = which;
    data.index = index;
    data.currentCodeName = $scope.currentCodeName;
    Admin.reject(data).then(function(data){
      app.roleList=data.data.data;
    })
  }

  //url: 'http://54.190.195.16:3000/api/detail_upload'
  app.upload = function (file) {
      Upload.upload({
          url: 'http://localhost:3000/api/detail_upload', //webAPI exposed to upload the file
          data:{file:file} //pass file as data, should be user ng-model
      }).then(function (resp) { //upload function returns a promise
          if(resp.data.success === true){ //validate success
              // app.showStripeModal();
              app.setcurrentImageUrl(resp.data.filename);
              app.detailFile="";
              app.splashFile="";
              app.bannerFile="";
              app.insertFileURL(app.roleList);
          } else {
              $window.alert('an error occured');
          }
      }, function (resp) { //catch error
          $window.alert('Error status: ' + resp.status);
      }, function (evt) { 
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          app.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
      });
  };
  app.setcurrentImageUrl=function(url){
    app.currentImageUrl = url;

  }
  app.logout = function(){
    Auth.logout();
    $location.path('/');
  }
  app.viewSample = function(which){
    if (which==0){
      app.sampleUrl = "assets/img/detail.jpg";
    }else if (which ==1) {
      app.sampleUrl = "assets/img/detail.jpg";
    }else if (which ==2){
      app.sampleUrl = "assets/img/banner.png";
    }
    $("#sampleModal").modal({ backdrop: "static"});
  }
  app.insertFileURL = function(Data){
    for (index in Data){
      if (Data[index].roleName==$scope.currentCodeName){
        if (Data[index].children.length==0)
        {
          console.log("insertFileUrl");
          var temp;
          var siteUrl;
          if (app.uploadedtype == 0){
            temp = Data[index].detail;
            siteUrl=app.currentDetailSiteUrl;
          }else if(app.uploadedtype == 1){
            temp = Data[index].splash;
            siteUrl=app.currentSplashSiteUrl;
          }else if(app.uploadedtype == 2){
            temp = Data[index].banner;
            siteUrl=app.currentBannerSiteUrl;
          }
          if (typeof(temp) == 'undefined'){
            temp=[];
          }
          var tempObj = {};
          tempObj.imageUrl = app.currentImageUrl;
          tempObj.siteUrl = siteUrl;
          tempObj.active = true;
          temp.push(tempObj);
          console.log(app.uploadedtype);
          if (app.uploadedtype == 0){
            Data[index].detail=temp;
            app.currentDetails=temp;
            
          }else if (app.uploadedtype == 1){
            Data[index].splash=temp;
            app.currentSplashs = temp;
            
          }else if (app.uploadedtype == 2){
            Data[index].banner=temp;
            app.currentBanners = temp;
          }
          tempObj.cname = $scope.currentCodeName;
          Admin.savecode(tempObj,app.uploadedtype).then(function(data){
             console.log(data);
          });
          app.uploadedtype = -1;
          app.currentImageUrl = '';
          app.currentDetailSiteUrl = '';
          app.currentSplashSiteUrl = '';
          app.currentBannerSiteUrl = '';
        }
        return;
      }else if (Data[index].children.length>0){
        app.insertFileURL(Data[index].children);
      }
    }
  };
})
