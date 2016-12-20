declare const enum HttpStatus {
    forbidden = 403,
}
declare const enum RequestStatus {
    success = 1,
    info = 2,
    warning = 3,
    error = 4,
}
declare type Method = 'POST' | 'GET' | 'DELETE' | 'PUT';
interface AjaxOptions {
    method?: Method;
    withLock?: boolean;
}
/**
 * Ajax requests management
 *
 * @class AjaxResponse
 */
declare class AjaxResponse {
    usePromise: boolean;
    private defaultAjaxOptions;
    isLocked: boolean;
    constructor(usePromise?: boolean);
    request<T>(route: any, data: any, options: AjaxOptions): JQueryPromise<T>;
    request<T>(route: any, data: any, callback?: Function, methodOrOptions?: Method | AjaxOptions): JQueryXHR;
    submitForm<T>($form: JQuery, additionalValues?: any[] | any, options?: AjaxOptions): JQueryPromise<T>;
    submitForm<T>($form: JQuery, callback?: Function, additionalValues?: any[] | any, options?: AjaxOptions): JQueryXHR;
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
    delete<T>(route: string, data: any): JQueryPromise<T>;
    delete<T>(route: string, data: any, callback?: Function): JQueryXHR;
    ajaxError(xhr?: XMLHttpRequest): void;
}
declare let AxiolabAjax: AjaxResponse;
