const enum HttpStatus{
    forbidden = 403
}

const enum RequestStatus{
    success = 1,
    info, 
    warning,
    error
} 

type Method = 'POST' | 'GET' | 'DELETE' | 'PUT';

interface AjaxOptions{
    method?: Method;
    withLock?: boolean;
}

/**
 * Ajax requests management
 * 
 * @class AjaxResponse
 */
class AjaxResponse{

    private defaultAjaxOptions: AjaxOptions = {
        method: 'POST',
        withLock: false
    }

    public isLocked = false;

    constructor(
        public usePromise = false,
    ) {
    }

    
    request<T>(route, data, options: AjaxOptions): JQueryPromise<T>;
    request<T>(route, data, callback?: Function, methodOrOptions?: Method|AjaxOptions): JQueryXHR;
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
    request<T>(route, data, callbackOrOptions?: AjaxOptions|Function, methodOrOptions?: Method|AjaxOptions): JQueryPromise<T> | JQueryXHR {
        let callback: Function;
        let options: AjaxOptions;
        let deferred : JQueryDeferred<T>;
        let method : Method = 'POST';
        let withLock = false;

        if(typeof callbackOrOptions === 'function'){
            // callback mode
            callback = callbackOrOptions;
        } else if(callbackOrOptions){
            // promise mode

            let allOptions = $.extend(options, this.defaultAjaxOptions);

            options = <AjaxOptions>callbackOrOptions;
            method = options.method || method;
            withLock = options.withLock === true;
        }

        if(typeof(methodOrOptions) === 'string'){
            method = methodOrOptions || method;
        }

        if(this.usePromise){
            deferred = $.Deferred<T>();
        } else if(methodOrOptions){
            // promise mode

            let allOptions = $.extend(options, this.defaultAjaxOptions);

            options = <AjaxOptions>methodOrOptions;
            method = options.method || method;
            withLock = options.withLock === true;
        }

        

        if(this.isLocked){
            this.ajaxError();
            if(this.usePromise){
                deferred.reject();
            }
        }

        this.isLocked = withLock;

        var xhr = $.ajax({
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
                    if(this.usePromise){
                        if(!deferred){
                            throw `no deferred object available. Try not to mix usePromise options values in parallel requests`;
                        }
                        deferred.resolve(<T>response);
                    }
                }
                $(document).trigger('axiolabajax.success');
            },
            error: (xhr: XMLHttpRequest) => {
                this.ajaxError(xhr);
                if(this.usePromise){
                    deferred.reject(xhr);
                }
            }, 
            complete: (xhr: XMLHttpRequest) => {
                $(document).trigger('axiolabajax.complete');
                if(withLock){
                    this.isLocked = false;
                }
            }
        });

        return this.usePromise ? deferred.promise() : xhr;
    }



    
    submitForm<T>($form: JQuery, additionalValues?: any[]|any): JQueryPromise<T>;
    submitForm<T>($form: JQuery, callback?: Function, additionalValues?: any[]|any): JQueryXHR;

    
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
    submitForm<T>($form: JQuery, callbackOrValues?: Function|any, additionalValues?: any): JQueryPromise<T> | JQueryXHR {
        let route = $form.attr('action');
        let type = <Method>$form.attr('method');
        let callback: Function;

        if(typeof callbackOrValues === 'function'){
            callback = callbackOrValues;
        } else {
            additionalValues = callbackOrValues;
        }

        let values = this.serialize($form);
        if (additionalValues){
            additionalValues.forEach((value, index) => {
                values[index] = value;
            });
        }

        if(this.usePromise){
            return this.request<T>(route, values, {method: type});
        } else {
            return this.request<T>(route, values, callback, {method: type});
        }
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

    
    delete<T>(route: string, data: any): JQueryPromise<T>;
    delete<T>(route: string, data: any, callback?: Function): JQueryXHR;
    
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
    delete<T>(route: string, data: any, callback?: Function): JQueryPromise<T> | JQueryXHR {
        if(this.usePromise){
            return this.request<T>(route, data, {method: 'DELETE'});            
        } else {
            return this.request<T>(route, data, callback, {method: 'DELETE'});
        }
    }
    
    ajaxError(xhr?: XMLHttpRequest) {
        if(!xhr){
            // request locked
            $(document).trigger('axiolabajax.request_locked');
        } else if (xhr.status == HttpStatus.forbidden) {
            $(document).trigger('axiolabajax.access_denied');
        } else if (xhr.status != 0) {
            this.notify(RequestStatus.error, 'AjaxResponse : an error occured ');
            $(document).trigger('axiolabajax.error');
        } 
    }
    
}

let AxiolabAjax = new AjaxResponse();
