var CriteriaTable = function(){
    var self = this;

    self.container = null;
    self.table = null;
    self.filters_form = null;
    self.reload_route = null;
    self.isReloading = null;
    /**
     * Initialize an editable datagrid
     * @param  string table_container_id The id of the datagrid parent div (e.g. '#parentDiv')
     * @param  string form_filters_id    The id of the datagrid filters form (e.g. '#filtersForm')
     * @param  url    reload_route       The url for the reload action (generated with FosJSRouter)
     */
    self.initialize = function (table_container_id, form_filters_id, reload_route, loader_id) {
        if (self.table !== null) {
            return true;
        }

        self.container    = $(table_container_id);
        self.table        = self.container.find('.edit-table');
        self.loader       = $(loader_id);
        self.filters_form = $(form_filters_id);
        self.reload_route = typeof reload_route != 'undefined' && reload_route.length ? reload_route : self.filters_form.attr('action');
        self.filters_form.on('submit', function(){
            return false;
        });

        // build the sort items
        self.sortFilters();
        //load the filters events
        self.filteredRequest();
        //load the pagination events
        self.paginationEvents();
        //load the sort events
        self.sortEvents();

        self.container.trigger('initialized');
        return self;
    };

    self.changeRoute = function(route) {
        self.reload_route = route;
    };

    self.reinitialize = function () {
        self.table = self.container.find('.edit-table');
        self.sortFilters();
        self.paginationEvents();
        self.sortEvents();
        self.container.trigger('reinitialized');
    };

    self.ajaxRequest = function (data, callback) {
        return $.ajax({
            type: "POST",
            url: self.reload_route,
            data: data,
            cache:false,
            success: function(response)
            {
                if (typeof(callback) == "function"){
                    callback(response);
                }
            }
        });
    };

    //create sort filters in a list
    self.sortFilters = function() {
        self.addPointers();

        var sortValue = self.filters_form.find('.sort-value').val();

        if (sortValue === '') {
            self.filters_form.find('.sort-value').val(self.table.data('default-sort'));
        }

        var sortDefault = '<span class="fa-stack fa-sm pointer sort-icons-wrapper"><i class="fa fa-sort fa-stack-1x" style="color: #fff"></i></span>';
        $sortDesc       = $(sortDefault).append('<i class="fa fa-sort-down fa-stack-1x" style="color: #ea6a2a"></i>');
        $sortAsc        = $(sortDefault).append('<i class="fa fa-sort-up fa-stack-1x" style="color: #ea6a2a"></i>');
        var sorted_by   = self.filters_form.find('.sort-value').val().split(',');

        self.table.find(".sort-column").each(function(){
            $(this).append(sortDefault);
            $iconWrapper = $(this).find('.sort-icons-wrapper');

            if(sorted_by[0] == $(this).data('column')) {
                if (sorted_by[1] == "desc") {
                    $iconWrapper.replaceWith($sortDesc);
                    $(this).find('.sort-icons-wrapper').addClass('sort-desc');
                } else {
                    $iconWrapper.replaceWith($sortAsc);
                    $(this).find('.sort-icons-wrapper').addClass('sort-asc');
                }
            } else {
                $iconWrapper.replaceWith($(sortDefault));
            }
        });
    };

    /**
     * Get filters from a form and reformat the given array for better treatment
     * @param  string form_id The id of the form
     * @return array          The filters values
     */
    self.getFilters = function (targetPage) {
        var values = {};

        if (self.filters_form !== null) {
            $.each( self.filters_form.serializeArray(), function(i, field) {
                if (typeof values[field.name] == 'undefined' || values[field.name].length === 0) {
                    values[field.name] = field.value;
                } else if ($.isArray(values[field.name])) {
                    values[field.name].push(field.value);
                } else {
                    values[field.name] = new Array(values[field.name], field.value);
                }
            });
        }

        var page =  typeof targetPage == 'undefined' ? self.container.find(".current-page").val() : targetPage;
        values.page = page;

        return values;
    };

    self.filteredRequest = function () {
        if (self.filters_form.data('initialized') != 'true') {
            var filters_form_id = '#'+self.filters_form.attr('id');

            $(document).on("change", filters_form_id, function(){
                $(".current-page").val(1);
                self.reloadTable();
            });

            self.filters_form.on("click", ".searchButton", function(e){
                e.preventDefault();
                $(".current-page").val(1);
                self.reloadTable();
            });

            self.filters_form.data('initialized', 'true');
        }
    };

    self.reloadTable = function (targetPage, triggerEvents) {
        self.page = targetPage || 1;

        if (typeof triggerEvents == 'undefined') {
            triggerEvents = true;
        }

        if (self.isReloading !== null) {
            self.isReloading.abort();
            self.isReloading = null;
            self.loader.html('');
        }

        if (self.page !== null) {
            targetPage = self.page;
        }

        var data = self.getFilters(self.page);
        if (triggerEvents) {
            self.container.trigger('beforeReload');
        }
        self.loader.append(Ajax.loader); // Specific to SHF

        self.isReloading = self.ajaxRequest(
            data,
            function(response) {
                if (response.valid){
                    //var tableId = self.table.attr('id');
                    /*var html = $(response.template).filter("#" + tableId);
                    if (html.length < 1) {
                        html = $(response.template).find("#" + tableId);
                    }
                    self.table.replaceWith(html);*/
                    self.container.html(response.template);
                    self.reinitialize();
                    if (triggerEvents) {
                        self.container.trigger('afterReload');
                    }
                } else {
                    var formId = '#' +self.filters_form.attr('id');
                    self.filters_form.replaceWith($(response.template).find(formId));
                }
                self.isReloading = null;
                self.loader.html('');
            }
        );
    };

    self.paginationEvents = function () {
        $("#" + self.container.attr('id') + " .pagination li:not(.active):not(.disabled)").on("click", function(){
            var targetPage = $(this).data('page');
            self.reloadTable(targetPage);
            self.container.find(".current-page").val(targetPage);
            self.container.trigger("changed.page");
        });
    };

    self.sortEvents = function () {
        $("#" + self.container.attr('id') + " .sort-column .pointer").on("click", function(){
            var $td = $(this).parent();

            var newSort = 'asc';
            if ($td.find('.sort-asc').length > 0) {
                newSort = 'desc';
            }

            var sort_value = $td.data("column")+","+newSort;
            self.filters_form.find('.sort-value').val(sort_value);


            self.reloadTable();
            self.container.trigger("changed.sort");
        });
    };

    self.addPointers = function() {
        $('.sort-column' , self.table).each(function(idx) {
            $(this).html('<span class="pointer">'+$(this).html()+'</span>');
        });
    };
};