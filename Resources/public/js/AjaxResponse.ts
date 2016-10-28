const enum HttpStatus{
    forbidden = 403
}

const enum RequestStatus{
    success = 1,
    info, 
    warning,
    error
} 

/**
 * Ajax requests management
 * 
 * @class AjaxResponse
 */
class AjaxResponse{

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
    request<T>(route, data, callback?: Function, method = 'POST'): JQueryPromise<T> {

        let deferred = $.Deferred<T>();

        $.ajax({
            type: method,
            url: route,
            data: data,
            cache: false,
            success: (response: T | string) => {
                if (typeof response == 'string' && (<string>response).indexOf('_sign_|_in_') > -1) {
                    // user not logged
                    $(document).trigger('axiolabajax.login_required');
                } else {
                    if(typeof response === 'string'){
                        // parse the response if needed
                        response = <T>JSON.parse(<string>response)
                    }
                    
                    this.manageResponse(response, callback);
                    deferred.resolve(<T>response);
                }
                $(document).trigger('axiolabajax.success');
            },
            error: (xhr: XMLHttpRequest) => {
                this.ajaxError(xhr);
                deferred.reject(xhr);
            }, 
            complete: (xhr: XMLHttpRequest) => {
                $(document).trigger('axiolabajax.complete');
            }
        });

        return deferred.promise();
    }


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
    submitForm<T>($form: JQuery, callback: Function, additionalValues: any[]): JQueryPromise<T> {
        let route = $form.attr('action');
        let type = $form.attr('method');

        let values = this.serialize($form);
        if (additionalValues){
            additionalValues.forEach((value, index) => {
                values[index] = value;
            });
        }

        return this.request<T>(route, values, callback, type);
    }

    

    /**
     * extract the form's content and make an object out of it
     * 
     * @private
     * @param {JQuery} $form
     * @returns {*}
     * 
     * @memberOf AjaxResponse
     */
    serialize($form: JQuery): any{
        var o = {};
        var a = $form.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }

    manageResponse(response, callback: Function) {
        if (typeof callback === 'function') {
            callback(response);
        }

        if (response.notify) {
            this.notify(response.status, response.messages);
        }

        if (response.redirect) {
            this.redirect(response.redirect);
        }
    }

    notify(status: RequestStatus, messages: string[] | string) {
        var method: ToastrDisplayMethod = null;
        switch(status) {
            case RequestStatus.success:
                method = toastr.success;
                break;
            case RequestStatus.info:
                method = toastr.info;
                break;
            case RequestStatus.warning:
                method = toastr.warning;
                break;
            case RequestStatus.error:
                method = toastr.error;
                break;
            default:
                console.error('AjaxResponse.notify : invalid status given');
                break;
        }

        if(typeof messages === 'string'){
            messages = [messages];
        }

        (messages as string[]).forEach(message => 
            method(message)
        );
        
    }

    redirect(url: string) {
        window.location.href = url;
    }

    delete<T>(route: string, data: any, callback?: Function): JQueryPromise<T> {
        return this.request<T>(route, data, callback, "DELETE");
    }
    
    ajaxError(xhr) {
        if (xhr.status == HttpStatus.forbidden) {
            $(document).trigger('axiolabajax.access_denied');
        } else if (xhr.status != 0) {
            this.notify(RequestStatus.error, 'AjaxResponse : an error occured ');
            $(document).trigger('axiolabajax.error');
        }
    }
    
}

var AxiolabAjax = new AjaxResponse();

