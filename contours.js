(function(){
  var svg=document.getElementById('contours');
  var W=160,H=90,A=W/H,ns='http://www.w3.org/2000/svg';

  // Seeded random so the map is identical on every visit.
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rand=rng(20190919);
  function randn(){var u=1-rand(),v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  function el(name,attrs){var e=document.createElementNS(ns,name),k;for(k in attrs){e.setAttribute(k,attrs[k]);}return e;}

  // 1. A point dataset, clustered like records on a map (x, y, spread, count), weighted to the right.
  var clusters=[[.74,.34,.17,26],[.90,.80,.20,16],[.52,.14,.13,9],[.30,.76,.18,12],[.10,.30,.10,5]];
  var pts=[];
  clusters.forEach(function(c){
    for(var i=0;i<c[3];i++){
      pts.push([Math.min(.98,Math.max(.02,c[0]+randn()*c[2]/A)),Math.min(.97,Math.max(.03,c[1]+randn()*c[2]))]);
    }
  });

  // 2. Kernel density surface of those points. Isolines of density are how GIS hotspot maps are drawn.
  var S2=2*.075*.075,f=[],max=0,pk=[0,0],gx,gy,i,x,y,v,dx,dy;
  for(gy=0;gy<=H;gy++){
    f[gy]=[];
    for(gx=0;gx<=W;gx++){
      x=gx/W;y=gy/H;v=0;
      for(i=0;i<pts.length;i++){dx=(x-pts[i][0])*A;dy=y-pts[i][1];v+=Math.exp(-(dx*dx+dy*dy)/S2);}
      f[gy][gx]=v;
      if(v>max){max=v;pk=[gx,gy];}
    }
  }
  for(gy=0;gy<=H;gy++){for(gx=0;gx<=W;gx++){f[gy][gx]/=max;}}

  // 3. Isolines by marching squares.
  var SEG=[[],[[3,2]],[[2,1]],[[3,1]],[[0,1]],[[3,0],[2,1]],[[0,2]],[[3,0]],[[3,0]],[[0,2]],[[3,2],[0,1]],[[0,1]],[[3,1]],[[2,1]],[[3,2]],[]];
  function pt(e,x,y,tl,tr,br,bl,L){
    var t;
    if(e===0){t=(L-tl)/(tr-tl);return (x+t).toFixed(2)+' '+y;}
    if(e===1){t=(L-tr)/(br-tr);return (x+1)+' '+(y+t).toFixed(2);}
    if(e===2){t=(L-bl)/(br-bl);return (x+t).toFixed(2)+' '+(y+1);}
    t=(L-tl)/(bl-tl);return x+' '+(y+t).toFixed(2);
  }
  var n=0,L,d,c,k,s,tl,tr,br,bl,p;
  for(L=0.06;L<0.99;L+=0.0625){
    d='';
    for(gy=0;gy<H;gy++){
      for(gx=0;gx<W;gx++){
        tl=f[gy][gx];tr=f[gy][gx+1];br=f[gy+1][gx+1];bl=f[gy+1][gx];
        c=(tl>L?8:0)+(tr>L?4:0)+(br>L?2:0)+(bl>L?1:0);
        s=SEG[c];
        for(k=0;k<s.length;k++){d+='M'+pt(s[k][0],gx,gy,tl,tr,br,bl,L)+'L'+pt(s[k][1],gx,gy,tl,tr,br,bl,L);}
      }
    }
    if(!d){continue;}
    p=el('path',{d:d});
    if(n%5===4){p.setAttribute('class','idx');}
    p.style.setProperty('--i',n);
    svg.appendChild(p);
    n++;
  }

  // 4. Data flow: right-angle steps through the empty right side of the page, ending at the densest spot.
  var peak=[pk[0],pk[1]];
  var hubs=[[96,68],[133,44],peak];
  var dd='M96 68H133V20H'+peak[0]+'V'+peak[1];
  svg.appendChild(el('path',{d:dd,'class':'flow',pathLength:1}));

  // 5. The points themselves, with the flow's stops and the peak marked in copper.
  var g=el('g',{'class':'nodes'}),j=0,m;
  pts.forEach(function(q){
    m=el('circle',{cx:(q[0]*W).toFixed(2),cy:(q[1]*H).toFixed(2),r:.3});
    m.style.setProperty('--j',j++);g.appendChild(m);
  });
  hubs.forEach(function(q,idx){
    var last=idx===hubs.length-1;
    m=el('circle',{cx:q[0].toFixed(2),cy:q[1].toFixed(2),r:last?.55:.5,'class':last?'hub core':'hub'});
    m.style.setProperty('--j',j++);g.appendChild(m);
    if(last){
      m=el('circle',{cx:q[0].toFixed(2),cy:q[1].toFixed(2),r:1.5,'class':'peak'});
      m.style.setProperty('--j',j++);g.appendChild(m);
    }
  });
  svg.appendChild(g);

  requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('is-ready');});});
})();
