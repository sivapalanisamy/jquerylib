(function($) {
    var defaults = {
        appId: 'appid',
        skipShow: 0,
        recordsPerPage: 0,
        url: 'https://api.mongolab.com/api/1/databases/',
        dpName: 'dpName',
        collections: 'cName',
        sortByServer: false,
        sortByTable: false,
        sortName: '_id'
    };

    $.fn.zipcodes = function (options) {
        // create a namespace to be used throughout the plugin
        var lists = {},
            sl = this; // set a reference to our elements
        // merge user-supplied options with the defaults
        lists.setting = $.extend({}, defaults, options);

        //Creating database url for different options
        var prepareUrl = function() {
            var urlString = '';
            if (lists.setting.recordsPerPage > 0 && lists.setting.sortByServer == false) {
                urlString = lists.setting.url + lists.setting.dpName + '/collections/' + lists.setting.collections + '?sk=' + lists.setting.skipShow + '&l=' + lists.setting.recordsPerPage + '&apiKey=' + lists.setting.appId;
            } else if (lists.setting.recordsPerPage < 0 && lists.setting.sortByServer == true) {
                urlString = lists.setting.url + lists.setting.dpName + '/collections/' + lists.setting.collections + '?&s={"' + lists.setting.sortName + '":1}&apiKey=' + lists.setting.appId;
            } else if (lists.setting.recordsPerPage > 0 && lists.setting.sortByServer == true) {
                urlString = lists.setting.url + lists.setting.dpName + '/collections/' + lists.setting.collections + '?&s={"' + lists.setting.sortName + '":1}&sk=' + lists.setting.skipShow + '&l=' + lists.setting.recordsPerPage + '&apiKey=' + lists.setting.appId;
            } else {
                urlString = lists.setting.url + lists.setting.dpName + '/collections/' + lists.setting.collections + '?apiKey=' + lists.setting.appId;
            }

            return urlString;
        };
        //Display json Data into Table format		
        var stateList = function() {
            var censusRequestURL = prepareUrl();
            $.ajax({
                url: censusRequestURL,
                type: "Get",
                cache: true,
                contentType: "application/json",
                success: function(data) {
                    $.each(data, function(key, Object) {
                        // Create Html for table row
                        var cenusList = '<tr>' +
						'<td title="NO">' + Object._id + '</td>' +
						'<td  title="City">' + Object.city + '</td>' +
						'<td title="State">' + Object.state + '</td>' +
						'<td title="Population">' + Object.pop + '</td>' +
						'<td title="Location">' + Object.loc + '</td>' +
						'</tr>';
                        sl.append(cenusList); //Append Html
                    });
                }
            });


        };

        // initialize the controls object
        lists.pagination = {};

        var controlsBind = function() {
            totalCounts();
            countAppendHtml(1, lists.setting.recordsPerPage);
            lists.pagination.first = $('.first');
            lists.pagination.next = $('.next');
            lists.pagination.prev = $('.prev');
            lists.pagination.last = $('.last');
            // bind click actions to the controls
            lists.pagination.first.on('click', clickFirstBind);
            lists.pagination.next.on('click', clickNextBind);
            lists.pagination.prev.on('click', clickPrevBind);
            lists.pagination.last.on('click', clickLastBind);
        };

        //Display the records per page
        var countAppendHtml = function(num1, num2) {
            $(".count b").html(num1 + " - " + num2);
        };

        //Display the total count of records
        var totalCounts = function() {
            $.getJSON(lists.setting.url + lists.setting.dpName + '/collections/' + lists.setting.collections + '?c=true&apiKey=' + lists.setting.appId, function(data) {
                var totalcount;
                totalcount = data;
                $(".count span").html(totalcount);
            });
        };
        //Go to first record
        var clickFirstBind = function(e) {
            e.preventDefault();
            sl.find('tr').remove();
            lists.setting.skipShow = (lists.setting.skipShow - lists.setting.skipShow);
            //Append the count of current records
            countAppendHtml((lists.setting.skipShow + 1), (lists.setting.recordsPerPage + lists.setting.skipShow));
            stateList();
        };
        //Click next binding
        var clickNextBind = function(e) {
            e.preventDefault();
            sl.find('tr').remove();
            lists.setting.skipShow = (lists.setting.skipShow + lists.setting.recordsPerPage);
            //Append the count of current records
            countAppendHtml((lists.setting.skipShow + 1), (lists.setting.recordsPerPage + lists.setting.skipShow));
            stateList();
        };
        //Click Previous binding
        var clickPrevBind = function(e) {
            e.preventDefault();
            //if previous data is available, populate it
            if (lists.setting.skipShow > 1) {
                sl.find('tr').remove();
                lists.setting.skipShow = (lists.setting.skipShow - lists.setting.recordsPerPage);
                //Append the count of current records
                countAppendHtml((lists.setting.skipShow + 1), (lists.setting.recordsPerPage + lists.setting.skipShow));
                stateList();
            }
        };
        //Go to first record
        var clickLastBind = function(e) {
            e.preventDefault();
            sl.find('tr').remove();
            var lastVal = $(".count span").text();
            lastVal = parseInt(lastVal);
            lists.setting.skipShow = lastVal - lists.setting.recordsPerPage;
            //Append the count of current records
            countAppendHtml((lists.setting.skipShow + 1), (lists.setting.recordsPerPage + lists.setting.skipShow));
            stateList();
        };


        // initialize the Sorting by Server
        lists.sorting = {};
        //Binding 
        var sortBind = function() {
            lists.sorting.sortOrder = 1; //the sorting order
            $(".visible-sort").addClass("sort-by");
            // bind click actions to the sorting
            lists.sorting.drop = $('.sort-by');
            lists.sorting.drop.on('click', clickDropBind);
            lists.sorting.tab = $('th, .sort-by li');
            lists.sorting.tab.on('click', clickSortBind);
        };
        //sorting for mobile with toggle
        var clickDropBind = function() {
            $("ul").slideToggle();
        };
        //Click Sort binding
        var clickSortBind = function() {
            if (lists.setting.sortByServer == true) {
                //if sort by server is true
                var sortTitle = $(this).attr('title');
                lists.setting.sortName = sortTitle;
                stateList();
                $("tbody tr").remove();
            } else if (lists.setting.sortByTable == true) {
                //if sort by table is true
                lists.sorting.sortOrder *= -1;
                var n = $(this).prevAll().length;
                sortTable(lists.sorting.sortOrder, n);
            }

        };

        if (lists.setting.sortByTable == true || lists.setting.sortByServer == true) {
            //if sort by server or sort by table is true,activate sort options
            sortBind();
			$("th").addClass("sort");
        }

        //  ad : 1 ascending order, -1 descending order
        //  n : n-th child(<td>) of <tr>
        var sortTable = function(ad, n) {
            var rows = $('tbody  tr').get();

            rows.sort(function(a, b) {

                // get the text of n-th <td> of <tr> 
                var x = $(a).children('td').eq(n).text().toUpperCase();
                var y = $(b).children('td').eq(n).text().toUpperCase();

                if (x < y) {
                    return -1 * ad;
                }
                if (x > y) {
                    return 1 * ad;
                }
                return 0;
            });

            $.each(rows, function(index, row) {
                $('table').children('tbody').append(row);
            });

        };
		var startLoader = function(){
			$("#loader").show();
		};
		var endLoader = function(){
			$("#loader").hide();
		};
		var enableLoader = function(){
			$(document).ajaxStart(function () {
				startLoader();
			}).ajaxStop(function () {
				endLoader();
			});
		};
		
		enableLoader();
        controlsBind();
        stateList();

        // returns the current jQuery object
        return this;
    };

}(jQuery));

$(document).ready(function() {
    $(".census-table tbody").zipcodes({
        appId: 'iHfP_4Yuj7hNclUjIiUQUVKl_0jpKGPB',
        dpName: 'brillersys',
        collections: 'zip_codes',
        recordsPerPage: 20,
        sortByTable: true
    });
});