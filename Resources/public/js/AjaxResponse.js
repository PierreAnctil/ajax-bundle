/**
 * Ajax requests management
 *
 * @class AjaxResponse
 */
var AjaxResponse = (function () {
    function AjaxResponse(usePromise) {
        if (usePromise === void 0) { usePromise = false; }
        this.usePromise = usePromise;
        this.defaultAjaxOptions = {
            method: 'POST',
            withLock: false
        };
        this.isLocked = false;
    }
    /**
     * Execute an ajax request
     *
     * @template T
     * @param {any} route
     * @param {any} data
     * @param {(AjaxOptions|Function)} [callbackOrOptions]
     * @param {(Method|AjaxOptions)} [methodOrOptions]
     * @returns {(JQueryPromise<T> | JQueryXHR)}
     *
     * @memberOf AjaxResponse
     */
    AjaxResponse.prototype.request = function (route, data, callbackOrOptions, methodOrOptions) {
        var _this = this;
        var callback;
        var options;
        var deferred;
        var method = 'POST';
        var withLock = false;
        if (typeof callbackOrOptions === 'function') {
            // callback mode
            callback = callbackOrOptions;
        }
        else if (callbackOrOptions) {
            // promise mode
            var allOptions = $.extend(options, this.defaultAjaxOptions);
            options = callbackOrOptions;
            method = options.method || method;
            withLock = options.withLock === true;
        }
        if (typeof (methodOrOptions) === 'string') {
            method = methodOrOptions || method;
        }
        if (this.usePromise) {
            deferred = $.Deferred();
        }
        else if (methodOrOptions) {
            // promise mode
            var allOptions = $.extend(options, this.defaultAjaxOptions);
            options = methodOrOptions;
            method = options.method || method;
            withLock = options.withLock === true;
        }
        if (this.isLocked) {
            this.ajaxError();
            if (this.usePromise) {
                deferred.reject();
            }
        }
        this.isLocked = withLock;
        var xhr = $.ajax({
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
                    if (_this.usePromise) {
                        if (!deferred) {
                            throw "no deferred object available. Try not to mix usePromise options values in parallel requests";
                        }
                        deferred.resolve(response);
                    }
                }
                $(document).trigger('axiolabajax.success');
            },
            error: function (xhr) {
                _this.ajaxError(xhr);
                if (_this.usePromise) {
                    deferred.reject(xhr);
                }
            },
            complete: function (xhr) {
                $(document).trigger('axiolabajax.complete');
                if (withLock) {
                    _this.isLocked = false;
                }
            }
        });
        return this.usePromise ? deferred.promise() : xhr;
    };
    /**
     * Submit a form via ajax
     *
     * @template T
     * @param {JQuery} $form
     * @param {(Function|any)} [callbackOrValues]
     * @param {*} [additionalValues]
     * @returns {(JQueryPromise<T> | JQueryXHR)}
     *
     * @memberOf AjaxResponse
     */
    AjaxResponse.prototype.submitForm = function ($form, callbackOrValues, additionalValues) {
        var route = $form.attr('action');
        var type = $form.attr('method');
        var callback;
        if (typeof callbackOrValues === 'function') {
            callback = callbackOrValues;
        }
        else {
            additionalValues = callbackOrValues;
        }
        var values = this.serialize($form);
        if (additionalValues) {
            additionalValues.forEach(function (value, index) {
                values[index] = value;
            });
        }
        if (this.usePromise) {
            return this.request(route, values, { method: type });
        }
        else {
            return this.request(route, values, callback, { method: type });
        }
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
    /**
     * delete action via ajax
     *
     * @template T
     * @param {string} route
     * @param {*} data
     * @param {Function} [callback]
     * @returns {(JQueryPromise<T> | JQueryXHR)}
     *
     * @memberOf AjaxResponse
     */
    AjaxResponse.prototype.delete = function (route, data, callback) {
        if (this.usePromise) {
            return this.request(route, data, { method: 'DELETE' });
        }
        else {
            return this.request(route, data, callback, { method: 'DELETE' });
        }
    };
    AjaxResponse.prototype.ajaxError = function (xhr) {
        if (!xhr) {
            // request locked
            $(document).trigger('axiolabajax.request_locked');
        }
        else if (xhr.status == 403 /* forbidden */) {
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
//# sourceMappingURL=AjaxResponse.js.map