declare const enum HttpStatus {
    forbidden = 403,
}
declare const enum RequestStatus {
    success = 1,
    info = 2,
    warning = 3,
    error = 4,
}
/**
 * Ajax requests management
 *
 * @class AjaxResponse
 */
declare class AjaxResponse {
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
    request<T>(route: any, data: any, callback?: Function, method?: string): JQueryPromise<T>;
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
    submitForm<T>($form: JQuery, callback: Function, additionalValues: any[]): JQueryPromise<T>;
    /**
     * extract the form's content and make an object out of it
     *
     * @private
     * @param {JQuery} $form
     * @returns {*}
     *
     * @memberOf AjaxResponse
     */
    serialize($form: JQuery): any;
    manageResponse(response: any, callback: Function): void;
    notify(status: RequestStatus, messages: string[] | string): void;
    redirect(url: string): void;
    delete<T>(route: string, data: any, callback?: Function): JQueryPromise<T>;
    ajaxError(xhr: any): void;
}
declare var AxiolabAjax: AjaxResponse;
