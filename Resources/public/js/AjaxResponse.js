/**
 * Ajax requests management
 *
 * @class AjaxResponse
 */
var AjaxResponse = (function () {
    function AjaxResponse() {
    }
    /**
     * Execute an ajax request
     *
     * @template T - the return type of the ajax request
     * @param {any} route
     * @param {any} data
     * @param {Function} [callback]
     * @param {string} [method='POST']
     * @returns {JQueryPromise<T>}
     *
     * @memberOf AjaxResponse
     */
    AjaxResponse.prototype.request = function (route, data, callback, method) {
        var _this = this;
        if (method === void 0) { method = 'POST'; }
        var deferred = $.Deferred();
        $.ajax({
            type: method,
            url: route,
            data: data,
            cache: false,
            success: function (response) {
                if (typeof response == 'string' && response.indexOf('_sign_|_in_') > -1) {
                    // user not logged
                    $(document).trigger('axiolabajax.login_required');
                }
                else {
                    if (typeof response === 'string') {
                        // parse the response if needed
                        response = JSON.parse(response);
                    }
                    _this.manageResponse(response, callback);
                    deferred.resolve(response);
                }
                $(document).trigger('axiolabajax.success');
            },
            error: function (xhr) {
                _this.ajaxError(xhr);
                deferred.reject(xhr);
            },
            complete: function (xhr) {
                $(document).trigger('axiolabajax.complete');
            }
        });
        return deferred.promise();
    };
    /**
     * Submit a form via ajax
     *
     * @template T - the return type of the ajax request
     * @param {JQuery} $form
     * @param {Function} callback
     * @param {any[]} additionalValues
     * @returns {JQueryPromise<T>}
     *
     * @memberOf AjaxResponse
     */
    AjaxResponse.prototype.submitForm = function ($form, callback, additionalValues) {
        var route = $form.attr('action');
        var type = $form.attr('method');
        var values = this.serialize($form);
        if (additionalValues) {
            additionalValues.forEach(function (value, index) {
                values[index] = value;
            });
        }
        return this.request(route, values, callback, type);
    };
    /**
     * extract the form's content and make an object out of it
     *
     * @private
     * @param {JQuery} $form
     * @returns {*}
     *
     * @memberOf AjaxResponse
     */
    AjaxResponse.prototype.serialize = function ($form) {
        var o = {};
        var a = $form.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            }
            else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    AjaxResponse.prototype.manageResponse = function (response, callback) {
        if (typeof callback === 'function') {
            callback(response);
        }
        if (response.notify) {
            this.notify(response.status, response.messages);
        }
        if (response.redirect) {
            this.redirect(response.redirect);
        }
    };
    AjaxResponse.prototype.notify = function (status, messages) {
        var method = null;
        switch (status) {
            case 1 /* success */:
                method = toastr.success;
                break;
            case 2 /* info */:
                method = toastr.info;
                break;
            case 3 /* warning */:
                method = toastr.warning;
                break;
            case 4 /* error */:
                method = toastr.error;
                break;
            default:
                console.error('AjaxResponse.notify : invalid status given');
                break;
        }
        if (typeof messages === 'string') {
            messages = [messages];
        }
        messages.forEach(function (message) {
            return method(message);
        });
    };
    AjaxResponse.prototype.redirect = function (url) {
        window.location.href = url;
    };
    AjaxResponse.prototype.delete = function (route, data, callback) {
        return this.request(route, data, callback, "DELETE");
    };
    AjaxResponse.prototype.ajaxError = function (xhr) {
        if (xhr.status == 403) {
            $(document).trigger('axiolabajax.access_denied');
        }
        else if (xhr.status != 0) {
            this.notify(4 /* error */, 'AjaxResponse : an error occured ');
            $(document).trigger('axiolabajax.error');
        }
    };
    return AjaxResponse;
}());
var AxiolabAjax = new AjaxResponse();
