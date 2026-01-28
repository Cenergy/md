"use strict";
function registerMdPlugins(){
    var e=window.mdpress,r=window.prettier,i=window.prettierPlugins;
    if(r && i) {
        r.prettierPlugins=i;
        e.registerPrettier(r);
    }
    if(window.Swiper) e.registerSwiper(window.Swiper);
    if(window.QRCode) e.registerQRCode(window.QRCode);
    if(window.mermaid) e.registerMermaid(window.mermaid);
    if(window.XLSX) e.registerXLSX(window.XLSX);
    if(window.x_spreadsheet) e.registerX_spreadsheet(window.x_spreadsheet);
    if(window.flowchart) e.registerFlowChart(window.flowchart);
}
window.registerMdPlugins = registerMdPlugins;
export default registerMdPlugins;
