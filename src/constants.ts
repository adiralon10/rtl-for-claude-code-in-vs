export const PATCH_MARKER = '/* RTL-for-Claude-Code */';

export const JS_PATCH = `
${PATCH_MARKER}
;(function rtlSupport(){
  function applyRTL(){
    document.querySelectorAll('[contenteditable], [class*="mentionMirror"]').forEach(function(el){
      el.setAttribute('dir','rtl');
      el.style.setProperty('direction','rtl','important');
      el.style.setProperty('text-align','right','important');
    });
    document.querySelectorAll('[class*="userMessage_"]').forEach(function(el){
      if(el.className.indexOf('Container')>-1||el.className.indexOf('Attachments')>-1)return;
      el.setAttribute('dir','auto');
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
[class*="userMessage_"], [class*="root_"] p, [class*="root_"] li, [class*="root_"] h1, [class*="root_"] h2, [class*="root_"] h3, [class*="root_"] h4, [class*="root_"] h5, [class*="root_"] h6, [class*="root_"] td, [class*="root_"] th, [class*="root_"] blockquote, [class*="root_"] ol, [class*="root_"] ul, [class*="toolSummary_"], [class*="toolBodyPlainText_"], [class*="toolBodyRowContent_"], [class*="timelineMessage_"], [class*="thinkingContent_"], [class*="thinkingSummary_"], [class*="permissionRequestHeader_"] { unicode-bidi: plaintext !important; }
[class*="message_"][class*="userMessageContainer_"] { text-align: right !important; margin-left: auto !important; margin-right: 0 !important; }
[class*="root_"] ol, [class*="root_"] ul { direction: rtl !important; }
[class*="root_"] table { direction: rtl !important; margin-left: auto !important; margin-right: 0 !important; }
[class*="root_"] p, [class*="root_"] p strong, [class*="root_"] p em, [class*="root_"] p span, [class*="root_"] li, [class*="root_"] li p, [class*="root_"] li span, [class*="root_"] li strong, [class*="root_"] li em, [class*="root_"] h1, [class*="root_"] h2, [class*="root_"] h3, [class*="root_"] h4, [class*="root_"] h5, [class*="root_"] h6, [class*="root_"] blockquote { direction: rtl !important; unicode-bidi: isolate !important; text-align: right !important; }
pre, code, pre *, code *, [class*="codeBlockWrapper_"], [class*="codeBlockWrapper_"] pre, [class*="bashCommand_"], .monaco-editor, .monaco-editor * { direction: ltr !important; unicode-bidi: normal !important; text-align: left !important; }
`;
