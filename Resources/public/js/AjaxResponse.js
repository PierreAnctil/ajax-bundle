var AjaxResponse = function(){
    var self = this;

    self.request = function(route, data, callback, type) {
        var requestType = type || 'POST';

        return $.ajax({
            type: requestType,
            url: route,
            data: data,
            cache:false,
            async: true,
            success: function(response)
            {
                if (typeof response == 'string' && response.indexOf('_sign_|_in_') > -1) {
                    $(document).trigger('axiolabajax.login');
                } else {
                    response = JSON.parse(response);
                    self.manageResponse(response, callback);   
                }
            },
            error: function(response) {
                self.notify(4, 'AjaxResponse : an error occured ');
            },
            complete: function(xhr, textStatus) {
                if (xhr == 403) {
                    $(document).trigger('axiolabajax.access_denied');
                }
            } 
        });
    };

    self.manageResponse = function(response, callback) {
        if (typeof callback === 'function') {
            callback(response);
        }

        if (response.notify) {
            self.notify(response.status, response.messages);
        }

        if (response.redirect) {
            self.redirect(response.redirect);
        }
    };

    self.notify = function(status, messages) {
        var method = null;
        switch(status) {
            case 1:
                method = "success";
                break;
            case 2:
                method = "info";
                break;
            case 3:
                method = "warning";
                break;
            case 4:
                method = "error";
                break;
            default:
                console.error('AjaxResponse.notify : invalid status given');
                break;
        }

        messages.forEach(function(message) {
            toastr[method](message);
        });
    };

    self.redirect = function(url) {
        window.location.href = url;
    };

    self.delete = function(route, datas, callback) {
        self.request(route, datas, callback, "DELETE");
    };

    self.submitForm = function($form, callback, additionalValues) {
        var values = {};
        if (additionalValues){
            additionalValues.forEach(function(i, field){
                values[i] = field;
            });
        }

        $form.ajaxSubmit({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: values,
            success:    function(response) {
                if (typeof response == 'string' && response.indexOf('_sign_|_in_') > -1) {
                    $(document).trigger('axiolabajax.login');
                } else {
                    response = JSON.parse(response);
                    self.manageResponse(response, callback);   
                }
            },
            error: function(response) {
                self.notify(4, 'AjaxResponse : an error occured ');
            },
            complete: function(xhr, textStatus) {
                if (xhr == 403) {
                    $(document).trigger('axiolabajax.access_denied');
                }
            }
        });
    };
};

var AxiolabAjax = new AjaxResponse();
