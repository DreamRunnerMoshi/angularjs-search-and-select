
angular.module('angular-search-and-select', []).directive('searchandselect', function ($rootScope) {
    return {
        replace: false,
        restrict: 'E',
        scope: {
            values: "=",
            selectedmodel: "=",
            displaykey: "=?",
            valuekey: "@?",
            onscroll: "&",
            totalrecords: "=",
            onselect: "&",
            isdisabled: "=",
            isoptional: "@?",
            onfilter: "&",
            tofiltervalue: "=?",
            minwidth:"=?"
        },
        templateUrl: '/Scripts/searchandselect.html',
        link: function (scope, elm, attr) {
            scope.isoptional = !scope.isoptional || scope.isoptional == 'true';
            scope.showList = false;
            scope.totalrecords = _.cloneDeep(scope.totalrecords);

            function getModelToPass() {
                var modelToPass = {};
                if (!angular.isObject(scope.selectedmodel)) {
                    modelToPass[scope.valuekey] = scope.selecteditem[scope.valuekey];
                } else {
                    modelToPass = scope.selectedmodel;
                }
                return modelToPass;
            };

            scope.selectItem = function (item) {
                scope.selectedmodel = scope.valuekey ? item[scope.valuekey] : _.cloneDeep(item);
                scope.selecteditem = item;
                scope.showList = false;
                setTimeout(function () {
                    if (scope.onselect) scope.onselect();
                });
            };

            //scope.customFilter = function () {
            //if (scope.filtermethod) return scope.onfilter(scope.tofiltervalue);
            //    return function (item) { return true; }
            //};

            scope.$watch('selectedmodel', function () {
                formatDisplay();
            });

            scope.$watch('values', function (oldValue, newValue) {
                if (_.isEmpty(scope.selecteditem)) return;
                var modelToPass = getModelToPass();
                var item = _.find(scope.values, modelToPass);
                if (!item) {
                    //formatDisplay();
                    scope.selectedmodel = {};
                    scope.selectedItemValue = '';
                };

            });

            scope.isActive = function (item) {
                if (_.isEmpty(item)) return false;
                if (scope.valuekey && item[scope.valuekey] === scope.selectedmodel) {
                    scope.selecteditem = item;
                    formatDisplay();
                    return true;
                };

                if (item == scope.selectedmodel) {
                    scope.selecteditem = item;
                    formatDisplay();
                    return true
                };

                return false;
            };

            scope.removeSelected = function () {
                scope.selectedmodel = null;
                scope.selecteditem = {};
                scope.selectedItemValue = '';
            };

            var formatDisplay = function () {
                var selectedItemValue = '';
                var values = [];
                if ((!_.isEmpty(scope.selectedmodel)) && scope.selecteditem) {
                    if (!scope.displaykey) {
                        values.push(scope.selecteditem);
                    }
                    else {
                        for (i = 0; i < scope.displaykey.length; i++) {
                            var displayKey = scope.displaykey[i];
                            if (!_.isEmpty(scope.selecteditem[displayKey])) values.push(scope.selecteditem[displayKey]);
                        };
                    }
                };

                scope.selectedItemValue = values.join(' --- ');
            };

            scope.textChanged = function (searchKey) {
                if (searchKey.length === 0 || searchKey.length > 2) {
                    scope.onscroll({
                        searchKey: searchKey,
                        pagenumber: 1
                    });

                };
            };

            scope.show = function () {
                scope.showList = !scope.showList;
            };

            $rootScope.$on("documentClicked", function (inner, target) {
                var isSearchBox = ($(target[0]).is(".searchandselect")) || ($(target[0]).parents(".searchandselect").length > 0);
                if (!isSearchBox) {
                    scope.$apply(function () {
                        scope.showList = false;
                    });
                }
            });

            elm.find(".dropdown").bind('scroll', function () {
                var currentItem = $(this);
                if (currentItem.scrollTop() + currentItem.innerHeight() >= currentItem[0].scrollHeight) {

                    if (!scope.pagenumber) scope.pagenumber = 2;
                    else
                        scope.pagenumber = scope.pagenumber + 1;

                    scope.onscroll({
                        searchKey: scope.searchKey,
                        pagenumber: scope.pagenumber
                    });
                }
            });

        }
    };
});


//Documentation

//<searchandselect selectedmodel="assist"
//    values="doctors"
//    displaykey="['Name','Designation']"
//    valuekey="Id"
//    totalrecords = "assists.length"
//    onselect="methodToCalback()" -- onselect cannot pass variable
//></searchandselect >
//
//doctors = [{Name:'John Doe',Designation:'MBBS' }]
