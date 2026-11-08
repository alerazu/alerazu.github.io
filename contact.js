(function(){
  // The email address is assembled here so it is not sitting in the page source for spam robots.
  var links=document.querySelectorAll('a.mail'),i,a,addr;
  for(i=0;i<links.length;i++){
    a=links[i];addr=a.getAttribute('data-u')+'@'+a.getAttribute('data-d');
    a.setAttribute('href','mailto:'+addr);a.textContent=addr;
  }
})();
