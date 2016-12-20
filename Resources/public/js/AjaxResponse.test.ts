/// <reference path="AjaxResponse.ts" />


let urlTest = 'https://httpbin.org/';



$(document).on('axiolabajax.request_locked', () => {
    console.log('cb - OK : failed because of multiple requests');
});

$(document).on('axiolabajax.error', () => {
    console.log('request error');
});


AxiolabAjax
    .request<any> (urlTest + 'get', {}, response => {
        console.log(`cb - OK callback GET ${response.url}`);
        AxiolabAjax.request<any>(urlTest + 'post', {}, response => {
                console.log(`cb - OK callback POST ${response.url}`);
                withLockTest();
            },
            'POST'
        );
    },
    'GET'
);

let finishedCbs = 0;

function withLockTest(){
    AxiolabAjax.request<any> (urlTest + 'post', {}, response => {
            console.log(`cb - OK promise locked POST ${response.url}`);
            AxiolabAjax.request<any>(urlTest + 'post', {}, response => {
                console.log(`cb - OK promise after locked POST ${response.url}`);
                testPromise();
            });
        },
        {
            method: 'POST',
            withLock: true
        }
    );

    // relancer
    AxiolabAjax.request<any>(urlTest + 'post', {}, response => {
        // should not happen
        console.log(`cb - OK callback POST ${response.url}`);
    });
}



function testPromise(){

    AxiolabAjax.usePromise = true;

    return AxiolabAjax
        .request<any>(urlTest + 'get', {}, {method: 'GET'})
        .then(response => {
            console.log(`prom - OK promise GET ${response.url}`);
            return AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});
        })
        .then(response => {
            console.log(`prom - OK promise POST ${response.url}`);
            let prom = AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST', withLock: true});
            AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'}).fail(() => 
                console.log('prom - OK : failed because of multiple requests')
            );
            return prom;
        })
        .then(response => {
            console.log(`prom - OK promise locked POST ${response.url}`);
            return AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});        
        })
        .then(response => {
            console.log(`prom - OK promise after locked POST ${response.url}`);
        })
        .then(() => testPromiseAsync())
}






async function testPromiseAsync(){
    let response = await AxiolabAjax.request<any>(urlTest + 'get', {}, {method: 'GET'});
    console.log(`async - OK async GET ${response.url}`);
    response = await AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});
    console.log(`async - OK async POST ${response.url}`);
    response = await runWithLock();
    console.log(`async - OK promise locked POST ${response.url}`);    
    response = await AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});
    console.log(`async - OK promise after locked POST ${response.url}`);  
}

async function runWithLock(){
    let prom = AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST', withLock: true});
    try{
        await AxiolabAjax.request<any>(urlTest + 'post', {}, {method: 'POST'});
        let a = 1;
    }catch(ex){
        console.log('async - OK : failed because of multiple requests')
    }
    return prom;
}

