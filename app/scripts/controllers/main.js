'use strict';

angular.module('githubViewApp')
    .factory('angularRepo', ['$http', '$q', function($http, $q) {
        var REPO_ROOT = 'https://api.github.com/repos/angular/angular.js/contents/';

        // create an Item object fromt he api response
        // extend the api response and add a function to get
        // child content objects.
        var createItemFromResponse = function(itemResponse) {
            return angular.extend({
                contents: function() {
                    if (this.type === 'dir')
                        return load(this.url);
                    else
                        return $q.when([]);
                }
            }, itemResponse);
        };

        // Transform http response of items into an array of
        // item objects.
        var createItemsFromResponse = function(response) {
            var result = [];
            angular.forEach(response.data, function(itemResponse) {
                result.push(createItemFromResponse(itemResponse));
            });
            return result;
        };

        // Helper function to load a url
        // and pipe output through createItems
        var load = function(url) {
            return $http.get(url)
                .then(createItemsFromResponse);
        };

        // angularRepo object
        return {
            REPO_ROOT: REPO_ROOT,
            createItem: createItemFromResponse,
            rootItem: function() {
                return  {
                    contents: function() {
                        return load(REPO_ROOT);
                    },
                    hasContents: true,
                    name: '/'
                };
            }
        };
    }])
    .controller('AngularRepoCtrl', ['$scope', 'angularRepo', 
        function ($scope, angularRepo) {

        $scope.viewContent = function(item) {
            console.log('viewContent', item);
            $scope.repoContent = item.contents();
        };

        $scope.repoContent = angularRepo.rootItem().contents();
    }])
    .directive('githubRepoView', function() {
        var html =
              '<table class="table table-bordered table-condensed">'
            + '    <tr>'
            + '        <th>Name</th>'
            + '        <th>Type</th>'
            + '    </tr>'
            + '    <tr ng-repeat="item in content">'
            + '        <td ng-switch="item.type">'
            + '            <a href="" ng-switch-when="dir" ng-click="action(item)">{{item.name}}</a>'
            + '            <div ng-switch-default>{{item.name}}</div>'
            + '         </td>'
            + '         <td>{{item.type}}</td>'
            + '     </tr>'
            + '</table>';

        return {
            restrict: 'E',
            scope: {
                action: '=',
                content: '='
            },
            template: html
        };
    });

