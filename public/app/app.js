angular.module('userApp', ['appRoutes','mainController','angularTreeview','treeServices','userControllers','userServices','authServices','adminController','adminServices'])

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');
});
