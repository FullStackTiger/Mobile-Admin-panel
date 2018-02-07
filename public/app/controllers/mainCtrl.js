angular.module('mainController', ['treeServices', 'ngFileUpload', 'authServices', 'userServices'])
  .directive('fileModel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function () {
          scope.$apply(function () {
            modelSetter(scope, element[0].files[0]);
          });
        });
      }
    };
  }])
  .controller('treeCtrl', function (Auth, Tree, $scope, Upload, $window, $location, $interval) {
    var app = this;
    app.reload = function () {
      Tree.getProduct().then(function (data) {

        if (data.data.data) {
          app.roleList = data.data.data;
        } else {

          app.roleList = [
            {
              "roleName": "Orthotics",
              "roleType": "parent",
              "children": [
                {
                  "roleName": "Cranial",
                  "roleType": "parent",
                  "children": [
                    {
                      "roleName": "Protective",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "OTS Soft Shell",
                          "roleType": "parent",
                          "children": [
                            {
                              "roleName": "A8000333333333",
                              "roleType": "code",
                              "count": 123,
                              "description": "Helmet, protective, soft, prefabricated, includes all components and accessories",
                              "children": [
                              ]
                            }
                          ]
                        },
                        {
                          "roleName": "OTS HardShell",
                          "roleType": "parent",
                          "children": [
                            {
                              "roleName": "A8001",
                              "roleType": "code",
                              "count": 123,
                              "description": "Helmet, protective, hard, prefabricated, includes all components and accessories",
                              "children": [
                              ]
                            }
                          ]
                        },
                        {
                          "roleName": "Custom Fab Soft Shell",
                          "roleType": "parent",
                          "children": [
                            {
                              "roleName": "A8002",
                              "roleType": "code", "count": 123,
                              "description": "Helmet, protective, soft, custom fabricated, includes all components and accessories",
                              "children": [
                              ]
                            }
                          ]
                        },
                        {
                          "roleName": "Custom Fab hard Shell",
                          "roleType": "parent",
                          "children": [
                            {
                              "roleName": "A8003",
                              "roleType": "code", "count": 123,
                              "description": "Helmet, protective, hard, custom fabricated, includes all components and accessories",
                              "children": [
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "roleName": "Cranial Remolding",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "S1040",
                          "roleType": "code", "count": 123,
                          "description": "Cranial remolding orthosis, pediatric, rigid, with soft interface material, custom fabricated, includes fitting and adjustment(s)",
                          "children": [
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "roleName": "Burn",
                  "roleType": "parent",
                  "children": [
                    {
                      "roleName": "Bodysuit",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6501",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, bodysuit (head to foot), custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Chin Strap",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6502",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, chin strap, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Facial Hood",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6503",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, facial hood, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Glove to wrist",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6504",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, glove to wrist, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Glove to elbow",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6505",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, glove to elbow, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Glove to axilla",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6506",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, glove to axilla, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "foot to knee length",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6507",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, foot to knee length, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Foot to thigh length",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6508",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, foot to thigh length, custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Vest",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6509",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, upper trunk to waist including arm openings (vest), custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Panty",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6511",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn garment, lower trunk including leg openings (panty), custom fabricated",
                          "children": []
                        }
                      ]
                    },
                    {
                      "roleName": "Burn Mask",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "A6513",
                          "roleType": "code", "count": 123,
                          "description": "Compression burn mask, face and/or neck, plastic or equal, custom fabricated",
                          "children": []
                        }
                      ]
                    }
                  ]
                },
                {
                  "roleName": "Torticollis",
                  "roleType": "parent",
                  "children": [
                    {
                      "roleName": "Prefab, OTS Cranial & Cervical",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "L0113",
                          "roleType": "code", "count": 123,
                          "description": "Cranial cervical orthosis, torticollis type, with or without joint, with or without soft interface material, prefabricated, includes fitting and adjustment",
                          "children": [
                          ]
                        }
                      ]
                    },
                    {
                      "roleName": "Custom Fab, Cervical collar",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "L0170",
                          "roleType": "code", "count": 123,
                          "description": "Cervical, collar, molded to patient model",
                          "children": [
                          ]
                        }
                      ]
                    },
                    {
                      "roleName": "Custom Fab, Cranial & Cervical",
                      "roleType": "parent",
                      "children": [
                        {
                          "roleName": "L0112",
                          "roleType": "code", "count": 123,
                          "description": "Cranial cervical orthosis, congenital torticollis type, with or without soft interface material, adjustable range of motion joint, custom fabricated",
                          "children": [
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ];

          Tree.save(app.roleList).then(function (data) {
            if (data.success == true) {
              console.log("It saved");
            }
          });
        }
      });
    };
    app.reload();
    $interval(app.reload, 5000);

    app.uploadedtype = -1;
    app.logout = function () {
      Auth.logout();
      $location.path('/');
    }
    app.submit_detail = function (which) { //function to call on form submit
      app.amount = '$100';
      app.uploadedtype = which;
      if (which == 0) {
        if (app.detailFile) { //check if from is valid
          app.upload(app.detailFile); //call upload function
        }
      } else if (which == 1) {
        if (app.splashFile) { //check if from is valid
          app.upload(app.splashFile); //call upload function
        }
      } else if (which == 2) {
        if (app.bannerFile) { //check if from is valid
          app.upload(app.bannerFile); //call upload function
        }
      }

    }
    //url: 'http://54.201.6.118:3000/api/detail_upload'
    app.upload = function (file) {
      Upload.upload({
        url: 'http://54.201.6.118:3000/api/detail_upload', //webAPI exposed to upload the file
        data: { file: file } //pass file as data, should be user ng-model
      }).then(function (resp) { //upload function returns a promise
        if (resp.data.success === true) { //validate success
          app.showStripeModal();
          app.setcurrentImageUrl(resp.data.filename);
          app.detailFile = "";
          app.splashFile = "";
          app.bannerFile = "";
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
    app.setcurrentImageUrl = function (url) {
      app.currentImageUrl = url;

    }
    app.insertFileURL = function (Data) {
      for (index in Data) {
        if (Data[index].roleName == $scope.currentCodeName) {
          if (Data[index].children.length == 0) {
            var temp;
            var siteUrl;
            if (app.uploadedtype == 0) {
              temp = Data[index].detail;
              siteUrl = app.currentDetailSiteUrl;
            } else if (app.uploadedtype == 1) {
              temp = Data[index].splash;
              siteUrl = app.currentSplashSiteUrl;
            } else if (app.uploadedtype == 2) {
              temp = Data[index].banner;
              siteUrl = app.currentBannerSiteUrl;
            }
            if (typeof (temp) == 'undefined') {
              temp = [];
            }
            var tempObj = {};
            tempObj.imageUrl = app.currentImageUrl;
            tempObj.siteUrl = siteUrl;
            tempObj.active = false;
            temp.push(tempObj);
            console.log(app.uploadedtype);
            if (app.uploadedtype == 0) {
              Data[index].detail = temp;
              app.currentDetails = temp;
            } else if (app.uploadedtype == 1) {
              Data[index].splash = temp;
              app.currentSplashs = temp;

            } else if (app.uploadedtype == 2) {
              Data[index].banner = temp;
              app.currentBanners = temp;
            }
            // Tree.save(app.roleList).then(function(data){
            //   if (data.success==true){
            //     console.log("It saved");
            //   }
            // });
            tempObj.cname = $scope.currentCodeName;
            Tree.savecode(tempObj, app.uploadedtype).then(function (data) {
              console.log(data);
            });
            app.uploadedtype = -1;
            app.currentImageUrl = '';
            app.currentDetailSiteUrl = '';
            app.currentSplashSiteUrl = '';
            app.currentBannerSiteUrl = '';
          }
          return;
        } else if (Data[index].children.length > 0) {
          app.insertFileURL(Data[index].children);
        }
      }
    };
    app.getImages = function (Data) {
      for (index in Data) {
        if (Data[index].roleName == $scope.currentCodeName) {
          app.currentDetails = Data[index].detail;
          app.currentSplashs = Data[index].splash;
          app.currentBanners = Data[index].banner;
          app.description = Data[index].description;
          return;
        } else if (Data[index].children.length > 0) {
          app.getImages(Data[index].children);
        }
      }
    }
    $scope.$watchCollection('currentCodeName', function () {
      console.log("watch");
      app.isCodeName(app.roleList);
      app.getImages(app.roleList);
    }, true);

    app.isCodeName = function (Data) {
      for (index in Data) {
        if (Data[index].roleName == $scope.currentCodeName) {
          // console.log("find code");
          if (Data[index].roleType == 'code') {
            // console.log("It's true");
            app.isCode = true;
            return true;
          }
          else {
            // console.log("It's false");
            app.isCode = false;
            return false;
          }
        } else if (Data[index].children.length > 0) {
          app.isCodeName(Data[index].children);
        }
      }
    }
    app.showModal = function (url) {
      app.currentPhotoUrl = url;
      $("#myModal").modal({ backdrop: "static" }); // Open modal
    };

    app.showStripeModal = function () {
      app.loading = false;
      $("#stripeModal").modal({ backdrop: "static" });
    }

    app.pay = function () {
      app.loading = true;
      Tree.pay(app.stripe).then(function (data) {
        if (data.data.success == true) {
          app.insertFileURL(app.roleList);
          app.stripe = {};
          app.amount = "payment success";
          $("#stripeModal").modal('hide');
        }
      })
    }

    app.viewSample = function (which) {
      if (which == 0) {
        app.sampleUrl = "assets/img/detail.jpg";
      } else if (which == 1) {
        app.sampleUrl = "assets/img/detail.jpg";
      } else if (which == 2) {
        app.sampleUrl = "assets/img/banner.png";
      }
      $("#sampleModal").modal({ backdrop: "static" });
    }

  })

  .controller('createTreeCtrl', function ($scope, Tree) {
    var app = this;
    Tree.getProduct().then(function (data) {
      app.roleList = data.data.data;
    });
    app.roleData;
    app.currentRoleLevel = 'parent';
    app.retrieval_del = function (Data) {
      for (index in Data) {
        if (Data[index].roleName == $scope.parentName) {
          Data.splice(index, 1);
          return;
        } else if (Data[index].children.length > 0) {
          app.retrieval_del(Data[index].children);
        }
      }
    };
    app.retrieval = function (Data) {
      for (index in Data) {
        if (Data[index].roleName == $scope.parentName) {
          var tempData = {};
          tempData.roleName = app.roleData.roleName;
          tempData.children = [];
          tempData.roleType = 'parent';
          if (app.currentRoleLevel == 'code') {
            tempData.description = app.roleData.description;
            tempData.roleType = 'code';
          }
          Data[index].children.push(tempData);
          return;
        } else if (Data[index].children.length > 0) {
          app.retrieval(Data[index].children);
        }
      }
    };
    app.getDescription = function (Data) {
      for (index in Data) {
        if (Data[index].roleName == $scope.parentName) {
          app.currentDescription = Data[index].description;
          return;
        } else if (Data[index].children.length > 0) {
          app.getDescription(Data[index].children);
        }
      }
    }
    app.setroleLevel = function (rolelevel) {
      if (rolelevel == false) {
        app.currentRoleLevel = 'parent';
      } else {
        app.currentRoleLevel = 'code';
      }

      app.roleLevel = rolelevel;
    };
    app.insertData = function (roleData) {
      app.retrieval(app.roleList);
    };
    app.deleteData = function () {
      app.retrieval_del(app.roleList);
    }
    $scope.$watchCollection('parentName', function () {
      app.getDescription(app.roleList);
    }, true);

    app.save = function () {
      Tree.save(app.roleList).then(function (data) {
        console.log(data);
        if (data.data.success == ture) {
          alert("saved");
        }
      });
    }
    app.get_product = function () {
      Tree.getProduct().then(function (data) {
      });
    }

  })

  .controller('mainCtrl', function (Auth, $timeout, $location, $rootScope, $window, $interval, User, AuthToken) {
    var app = this;
    app.loadme = false; // Hide main HTML until data is obtained in AngularJS

    // Function to run an interval that checks if the user's token has expired
    app.checkSession = function () {
      // Only run check if user is logged in
      if (Auth.isLoggedIn()) {
        app.checkingSession = true; // Use variable to keep track if the interval is already running
        // Run interval ever 30000 milliseconds (30 seconds) 
        var interval = $interval(function () {
          var token = $window.localStorage.getItem('token'); // Retrieve the user's token from the client local storage
          // Ensure token is not null (will normally not occur if interval and token expiration is setup properly)
          if (token === null) {
            $interval.cancel(interval); // Cancel interval if token is null
          } else {
            // Parse JSON Web Token using AngularJS for timestamp conversion
            self.parseJwt = function (token) {
              var base64Url = token.split('.')[1];
              var base64 = base64Url.replace('-', '+').replace('_', '/');
              return JSON.parse($window.atob(base64));
            };
            var expireTime = self.parseJwt(token); // Save parsed token into variable
            var timeStamp = Math.floor(Date.now() / 1000); // Get current datetime timestamp
            var timeCheck = expireTime.exp - timeStamp; // Subtract to get remaining time of token
            // Check if token has less than 30 minutes till expiration
            if (timeCheck <= 1800) {
              showModal(1); // Open bootstrap modal and let user decide what to do
              $interval.cancel(interval); // Stop interval
            }
          }
        }, 30000);
      }
    };

    app.checkSession(); // Ensure check is ran check, even if user refreshes

    // Function to open bootstrap modal     
    var showModal = function (option) {
      app.choiceMade = false; // Clear choiceMade on startup
      app.modalHeader = undefined; // Clear modalHeader on startup
      app.modalBody = undefined; // Clear modalBody on startup
      app.hideButton = false; // Clear hideButton on startup

      // Check which modal option to activate (option 1: session expired or about to expire; option 2: log the user out)      
      if (option === 1) {
        app.modalHeader = 'Timeout Warning'; // Set header
        app.modalBody = 'Your session will expired in 30 minutes. Would you like to renew your session?'; // Set body
        $("#myModal").modal({ backdrop: "static" }); // Open modal
        // Give user 10 seconds to make a decision 'yes'/'no'
        $timeout(function () {
          if (!app.choiceMade) app.endSession(); // If no choice is made after 10 seconds, select 'no' for them
        }, 10000);
      } else if (option === 2) {
        app.hideButton = true; // Hide 'yes'/'no' buttons
        app.modalHeader = 'Logging Out'; // Set header
        $("#myModal").modal({ backdrop: "static" }); // Open modal
        // After 1000 milliseconds (2 seconds), hide modal and log user out
        $timeout(function () {
          Auth.logout(); // Logout user
          $location.path('/logout'); // Change route to clear user object
          hideModal(); // Close modal
        }, 2000);
      }
    };

    // Function that allows user to renew their token to stay logged in (activated when user presses 'yes')
    app.renewSession = function () {
      app.choiceMade = true; // Set to true to stop 10-second check in option 1
      // Function to retrieve a new token for the user
      User.renewSession(app.username).then(function (data) {
        // Check if token was obtained
        if (data.data.success) {
          AuthToken.setToken(data.data.token); // Re-set token
          app.checkSession(); // Re-initiate session checking
        } else {
          app.modalBody = data.data.message; // Set error message
        }
      });
      hideModal(); // Close modal
    };

    // Function to expire session and logout (activated when user presses 'no)
    app.endSession = function () {
      app.choiceMade = true; // Set to true to stop 10-second check in option 1
      hideModal(); // Hide modal
      // After 1 second, activate modal option 2 (log out)
      $timeout(function () {
        showModal(2); // logout user
      }, 1000);
    };

    // Function to hide the modal
    var hideModal = function () {
      $("#myModal").modal('hide'); // Hide modal once criteria met
    };

    // Will run code every time a route changes
    $rootScope.$on('$routeChangeStart', function () {
      if (!app.checkingSession) app.checkSession();

      // Check if user is logged in
      if (Auth.isLoggedIn()) {
        app.isLoggedIn = true; // Variable to activate ng-show on index

        // Custom function to retrieve user data
        Auth.getUser().then(function (data) {
          app.username = data.data.username; // Get the user name for use in index
          app.useremail = data.data.email; // Get the user e-mail for us ein index

          User.getPermission().then(function (data) {
            if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
              app.authorized = true; // Set user's current permission to allow management
              app.loadme = true; // Show main HTML now that data is obtained in AngularJS
            } else {
              app.loadme = true; // Show main HTML now that data is obtained in AngularJS
            }
          });
        });
      } else {
        app.isLoggedIn = false; // User is not logged in, set variable to falses
        app.username = ''; // Clear username
        app.loadme = true; // Show main HTML now that data is obtained in AngularJS
      }
      if ($location.hash() == '_=_') $location.hash(null); // Check if facebook hash is added to URL
      app.disabled = false; // Re-enable any forms
      app.errorMsg = false; // Clear any error messages

    });

    // Function that performs login
    this.doLogin = function (loginData) {
      app.loading = true; // Start bootstrap loading icon
      app.errorMsg = false; // Clear errorMsg whenever user attempts a login
      app.expired = false; // Clear expired whenever user attempts a login 
      app.disabled = true; // Disable form on submission
      console.log("<<<<<<<<<<loged in>>>>>>>>>>>>");
      // Function that performs login
      Auth.login(app.loginData).then(function (data) {
        // Check if login was successful 
        console.log(data);
        if (data.data.success) {
          console.log("successMsg");
          app.loading = false; // Stop bootstrap loading icon
          app.successMsg = data.data.message + '...Redirecting'; // Create Success Message then redirect
          // Redirect to home page after two milliseconds (2 seconds)
          $timeout(function () {
            $location.path('/treeview'); // Redirect to home
            app.loginData = ''; // Clear login form
            app.successMsg = false; // CLear success message
            app.disabled = false; // Enable form on submission
            app.checkSession(); // Activate checking of session
          }, 1000);
        } else {
          console.log("false");
          // Check if the user's account is expired
          if (data.data.expired) {
            app.expired = true; // If expired, set variable to enable "Resend Link" on login page
            app.loading = false; // Stop bootstrap loading icon
            app.errorMsg = data.data.message; // Return error message to login page
          } else {
            app.loading = false; // Stop bootstrap loading icon
            app.disabled = false; // Enable form
            app.errorMsg = data.data.message; // Return error message to login page
          }
        }
      });
    };

    // Function to logout the user
    app.logout = function () {
      showModal(2); // Activate modal that logs out user
    };
  });
