var app = angular.module('appRoutes', ['ngRoute'])

// Configure Routes; 'authenticated = true' means the user must be logged in to access the route
.config(function($routeProvider, $locationProvider) {

    // AngularJS Route Handler
    $routeProvider

    // Route: Home             
    .when('/', {
        templateUrl: 'app/views/pages/home.html',
        controller: 'mainCtrl',
        controllerAs: 'main',
        authenticated: false,
    })

    .when('/register', {
        templateUrl: 'app/views/pages/register.html',
        controller: 'regCtrl',
        controllerAs: 'register',
        authenticated: false,
    })

    .when('/treeview', {
        templateUrl: 'app/views/pages/treeview.html',
        controller: 'treeCtrl',
        controllerAs: 'tree',
        authenticated: true,
    })

    .when('/create', {
        templateUrl: 'app/views/pages/createtreeview.html',
        controller: 'createTreeCtrl',
        controllerAs: 'createTree',
        authenticated: true,
    })

    .when('/admin',{
        templateUrl: 'app/views/pages/admin.html',
        controller: 'adminCtrl',
        controllerAs: 'admin',
        authenticated: true,
        permission:'admin'
    })

    // Route: About Us (for testing purposes)
    .when('/about', {
        templateUrl: 'app/views/pages/about.html'
    })

    .otherwise({ redirectTo: '/' }); // If user tries to access any other route, redirect to home page

    $locationProvider.html5Mode({ enabled: true, requireBase: false }); // Required to remove AngularJS hash from URL (no base is required in index file)
});

// Run a check on each route to see if user is logged in or not (depending on if it is specified in the individual route)
app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User) {

    // Check each time route changes    
    $rootScope.$on('$routeChangeStart', function(event, next, current) {

        // Only perform if user visited a route listed above
        if (next.$$route !== undefined) {
            // Check if authentication is required on route
            if (next.$$route.authenticated === true) {
                console.log("authentication is true");
                // Check if authentication is required, then if permission is required
                if (!Auth.isLoggedIn()) {
                    event.preventDefault(); // If not logged in, prevent accessing route
                    $location.path('/'); // Redirect to home instead
                } else if (next.$$route.permission) {

                    // Function: Get current user's permission to see if authorized on route
                    User.getPermission().then(function(data) {
                        // Check if user's permission matches at least one in the array
                        console.log(next.$$route.permission,data.data.permission);
                        if (next.$$route.permission !== data.data.permission) {
                            Auth.logout();
                            event.preventDefault(); // If at least one role does not match, prevent accessing route
                            $location.path('/'); // Redirect to home instead
                        }
                    });
                }
            } else if (next.$$route.authenticated === false) {
                console.log("authentication is false");
                // If authentication is not required, make sure is not logged in
                if (Auth.isLoggedIn()) {
                    console.log("logged in");
                    event.preventDefault(); // If user is logged in, prevent accessing route
                    $location.path('/treeview'); // Redirect to profile instead
                }
            }
        }
    });
}]);
