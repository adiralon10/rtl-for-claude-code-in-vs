export const PATCH_MARKER = '/* RTL-for-Claude-Code */';

export const JS_PATCH = `
${PATCH_MARKER}
;(function rtlSupport(){
  var heRe=/[\\u0590-\\u05FF\\u0600-\\u06FF\\u0700-\\u074F]/;
  function hasRTL(el){return heRe.test(el.textContent||'');}
  function applyDir(el){
    if(!el.textContent||!el.textContent.trim())return;
    if(hasRTL(el)){
      el.setAttribute('dir','rtl');
      el.style.setProperty('direction','rtl','important');
      el.style.setProperty('text-align','right','important');
      el.style.setProperty('unicode-bidi','isolate','important');
    } else {
      el.setAttribute('dir','ltr');
      el.style.setProperty('direction','ltr','important');
      el.style.setProperty('text-align','left','important');
      el.style.setProperty('unicode-bidi','isolate','important');
    }
  }
  function applyRTL(){
    // Input fields - detect direction from content
    document.querySelectorAll('[contenteditable], [class*="mentionMirror"]').forEach(function(el){
      var txt=el.textContent||'';
      if(!txt.trim()){
        el.setAttribute('dir','auto');
        el.style.setProperty('direction','rtl','important');
        el.style.setProperty('text-align','right','important');
      } else if(heRe.test(txt)){
        el.setAttribute('dir','rtl');
        el.style.setProperty('direction','rtl','important');
        el.style.setProperty('text-align','right','important');
      } else {
        el.setAttribute('dir','ltr');
        el.style.setProperty('direction','ltr','important');
        el.style.setProperty('text-align','left','important');
      }
    });
    // User message bubbles - smart direction
    document.querySelectorAll('[class*="userMessage_"]').forEach(function(el){
      if(el.className.indexOf('Container')>-1||el.className.indexOf('Attachments')>-1)return;
      if(hasRTL(el)){
        el.setAttribute('dir','rtl');
      } else {
        el.setAttribute('dir','ltr');
      }
    });
    // User message containers - position based on content
    document.querySelectorAll('[class*="userMessageContainer_"]').forEach(function(el){
      if(hasRTL(el)){
        el.style.setProperty('text-align','right','important');
        el.style.setProperty('margin-left','auto','important');
        el.style.setProperty('margin-right','0','important');
      } else {
        el.style.setProperty('text-align','left','important');
        el.style.setProperty('margin-left','0','important');
        el.style.setProperty('margin-right','auto','important');
      }
    });
    // Response elements - detect per element
    var sel='[class*="root_"] p,[class*="root_"] li,[class*="root_"] h1,[class*="root_"] h2,[class*="root_"] h3,[class*="root_"] h4,[class*="root_"] h5,[class*="root_"] h6,[class*="root_"] blockquote,[class*="root_"] td,[class*="root_"] th,[class*="toolSummary_"],[class*="toolBodyPlainText_"],[class*="toolBodyRowContent_"],[class*="timelineMessage_"],[class*="thinkingContent_"],[class*="thinkingSummary_"],[class*="permissionRequestHeader_"]';
    document.querySelectorAll(sel).forEach(applyDir);
    // Lists and tables - check if any RTL content inside
    document.querySelectorAll('[class*="root_"] ol,[class*="root_"] ul,[class*="root_"] table').forEach(function(el){
      if(hasRTL(el)){
        el.setAttribute('dir','rtl');
        el.style.setProperty('direction','rtl','important');
        if(el.tagName==='TABLE'){el.style.setProperty('margin-left','auto','important');el.style.setProperty('margin-right','0','important');}
      } else {
        el.setAttribute('dir','ltr');
        el.style.setProperty('direction','ltr','important');
        if(el.tagName==='TABLE'){el.style.setProperty('margin-left','0','important');el.style.setProperty('margin-right','auto','important');}
      }
    });
  }
  new MutationObserver(function(){applyRTL()}).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(applyRTL,500);
  setTimeout(applyRTL,2000);
  setTimeout(applyRTL,5000);
})();
`;

export const CSS_PATCH = `
${PATCH_MARKER}
pre, code, pre *, code *, [class*="codeBlockWrapper_"], [class*="codeBlockWrapper_"] pre, [class*="bashCommand_"], .monaco-editor, .monaco-editor * { direction: ltr !important; unicode-bidi: normal !important; text-align: left !important; }
`;
