/// <reference path="AjaxResponse.ts" />


let urlTest = 'https://httpbin.org/';

AxiolabAjax.usePromise = true;


AxiolabAjax
    .request<any>(urlTest + 'get', {}, response => {
        console.log(`OK callback GET ${response.url}`);
        AxiolabAjax.request<any>(urlTest + 'post', {}, response => {
            console.log(`OK callback POST ${response.url}`);
            },
            'POST'
            );
        },
        'GET'
    );

AxiolabAjax
    .request<any>(urlTest + 'get', {}, {method: 'GET'})
    .then(response => {
        console.log(`OK promise GET ${response.url}`)
        return AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});
    })
    .then(response => 
        console.log(`OK promise POST ${response.url}`)
    );
    


async function run(){
    let response = await AxiolabAjax.request<any>(urlTest + 'get', {}, {method: 'GET'});
    console.log(`OK async GET ${response.url}`);
    response = await AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});
    console.log(`OK async POST ${response.url}`);
}

run();

