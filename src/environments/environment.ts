// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: `http://127.0.0.1:8000/`,
  // apiUrl: `https://knowledgebasegptapi-dzhnaacxc8cqa4bm.westus-01.azurewebsites.net/`,
  dev: false,
  local: true,  
  baseUrlClient : 'http://localhost:4200/',
  baseUrlApi : 'http://localhost:5000/gateway/',
  scope:'api://e8a606dd-b9d3-41e7-b865-50c6914c2a4b/AdminScope',
  msalInit: true,
  authority: 'https://login.microsoftonline.com/',
  clientId: 'e8a606dd-b9d3-41e7-b865-50c6914c2a4b',
  tenant: 'common',
};
  


// export const environment = {
//   production: false,
//   // apiUrl: `http://127.0.0.1:8000/`,
//   apiUrl: `https://knowledgebasegptapi-dzhnaacxc8cqa4bm.westus-01.azurewebsites.net/`,
//   dev: false,
//   local: true,  
//   baseUrlClient : 'https://knowledgebasegptui-hyandqgqd4gmfjbq.westus-01.azurewebsites.net/',
//   baseUrlApi : 'http://localhost:5000/gateway/',
//   scope:'api://7aebcd6b-3d4f-411a-9014-f56d40c3ab49/Adminscope',
//   msalInit: true,
//   authority: 'https://login.microsoftonline.com/',
//   clientId: '7aebcd6b-3d4f-411a-9014-f56d40c3ab49',
//   tenant: 'common',
// };
 



/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
