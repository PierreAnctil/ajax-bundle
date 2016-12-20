/// <reference path="AjaxResponse.d.ts" />
declare let urlTest: string;
declare let finishedCbs: number;
declare function withLockTest(): void;
declare function testPromise(): JQueryPromise<void>;
declare function testPromiseAsync(): Promise<void>;
declare function runWithLock(): Promise<any>;
