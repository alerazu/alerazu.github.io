(function(){
  // If another site embeds this page in a frame, hide it and try to break out.
  if(window.top!==window.self){
    document.documentElement.className+=' framed';
    try{window.top.location=window.location;}catch(e){}
  }
})();
