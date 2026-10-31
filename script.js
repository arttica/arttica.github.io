'use strict';
const clients=window.clientProjects||[],games=window.gameProjects||[];
document.querySelectorAll('[data-project]').forEach(link=>link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;const list=link.dataset.collection==='client'?clients:games;const project=list[Number(link.dataset.project)];if(!project||typeof document.querySelector('#project-dialog').showModal!=='function')return;e.preventDefault();openProject(project,link)}));
const dialog=document.querySelector('#project-dialog'),dialogImage=document.querySelector('#dialog-image');let opener,activeTransition=null,transitionBusy=false,oldOverflow='',imageRequest=0;
function prefersStill(){return document.body.classList.contains('motion-paused')||matchMedia('(prefers-reduced-motion: reduce)').matches}
function clearSharedNames(){document.querySelectorAll('[data-project] img,#dialog-image').forEach(el=>el.style.viewTransitionName='')}
function transitionProject(change){
 if(transitionBusy)return;
 if(prefersStill()||!document.startViewTransition){clearSharedNames();change();return}
 transitionBusy=true;
 try{activeTransition=document.startViewTransition(change);activeTransition.finished.catch(()=>{}).finally(()=>{clearSharedNames();transitionBusy=false;activeTransition=null})}catch(error){clearSharedNames();transitionBusy=false;activeTransition=null;change()}
}
function openProject(p,card){
 if(dialog.open||transitionBusy)return;
 opener=card;const request=++imageRequest,thumb=card.querySelector('img');clearSharedNames();if(thumb)thumb.style.viewTransitionName='project-art';
 document.querySelector('#dialog-title').textContent=p.title;dialogImage.src=thumb?.currentSrc||p.image;dialogImage.alt=p.alt||p.title+' artwork';document.querySelector('#dialog-description').textContent=p.description;document.querySelector('#dialog-label').textContent=p.category;document.querySelector('#dialog-status').textContent=p.status||'Selected from the existing Arttica portfolio.';
 const external=document.querySelector('#dialog-project-link');external.hidden=!p.url;if(p.url){external.href=p.url;external.textContent=p.linkLabel||'View project'}else{external.removeAttribute('href');external.textContent=''}
 transitionProject(()=>{clearSharedNames();dialogImage.style.viewTransitionName='project-art';oldOverflow=document.body.style.overflow;dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden'});
 // Morph the already-loaded card image; upgrade only after its transition and full image load.
 const fullImage=new Image();fullImage.onload=()=>{const apply=()=>{if(dialog.open&&request===imageRequest)dialogImage.src=p.image};if(activeTransition)activeTransition.finished.then(apply,()=>{});else apply()};fullImage.src=p.image;
}
function closeProject(){
 if(!dialog.open)return;
 imageRequest++;
 if(transitionBusy){activeTransition?.skipTransition();dialog.close();return}
 clearSharedNames();dialogImage.style.viewTransitionName='project-art';transitionProject(()=>{dialog.close();const thumb=opener?.querySelector('img');if(thumb)thumb.style.viewTransitionName='project-art'});
}
 document.querySelector('.dialog-close').onclick=closeProject;
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject()});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject()}});
 dialog.addEventListener('close',()=>{dialogImage.style.viewTransitionName='';document.body.style.overflow=oldOverflow;opener?.focus({preventScroll:true})});
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),motion=document.querySelector('#motion');let paused=reduce.matches;function syncMotion(){if(reduce.matches)paused=true;if(paused)activeTransition?.skipTransition();document.body.classList.toggle('motion-paused',paused);document.documentElement.classList.toggle('motion-paused',paused);motion.disabled=reduce.matches;motion.setAttribute('aria-pressed',String(paused));motion.textContent=reduce.matches?'Reduced motion':paused?'Enable motion':'Pause motion'}syncMotion();motion.onclick=()=>{paused=!paused;syncMotion();updateParallax()};reduce.addEventListener('change',e=>{paused=e.matches;syncMotion();updateParallax()});
let pending=false;function updateParallax(){pending=false;document.querySelectorAll('[data-parallax]').forEach(el=>{const rect=el.parentElement.getBoundingClientRect();const shift=paused?0:Math.max(-65,Math.min(65,(innerHeight/2-rect.top-rect.height/2)*Number(el.dataset.parallax)));el.style.transform='translate3d(0,'+shift+'px,0)'});const hero=document.querySelector('.hero');if(!paused&&scrollY<hero.offsetHeight){document.querySelector('.hero-art').style.transform='translate3d(0,'+Math.min(scrollY*.15,120)+'px,0)'}else if(paused){document.querySelector('.hero-art').style.transform='none'}}addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updateParallax)}},{passive:true});
const structure=document.querySelector('#structure'),hero=document.querySelector('.hero');structure.onclick=()=>{const on=hero.classList.toggle('structure');structure.setAttribute('aria-pressed',String(on));structure.innerHTML=on?'View surface <span>−</span>':'View structure <span>＋</span>';if(on)drawTerrain()};
const cv=document.querySelector('#terrain');function drawTerrain(){const w=hero.clientWidth,h=hero.clientHeight,dpr=Math.min(devicePixelRatio||1,2);cv.width=w*dpr;cv.height=h*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h);const rows=35,cols=60;const points=[];for(let z=0;z<rows;z++){const line=[];for(let x=0;x<cols;x++){let nx=x/(cols-1),nz=z/(rows-1);const peak=Math.exp(-((nx-.60)**2/.028+(nz-.45)**2/.14))*.66+Math.exp(-((nx-.27)**2/.015+(nz-.55)**2/.11))*.25+Math.exp(-((nx-.84)**2/.013+(nz-.62)**2/.07))*.30;const ridge=Math.sin(nx*47+nz*13)*Math.sin(nz*31)*.018;line.push({x:(nx-.5)*(w*(.65+nz*.7))+w*.5,y:h*(.53+nz*.40-peak*.65+ridge)})}points.push(line)}c.lineWidth=.7;for(let z=0;z<rows;z++){c.strokeStyle='rgba(35,67,47,'+(.15+z/rows*.35)+')';c.beginPath();points[z].forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke()}for(let x=0;x<cols;x++){c.strokeStyle='rgba(35,67,47,.20)';c.beginPath();points.forEach((r,i)=>i?c.lineTo(r[x].x,r[x].y):c.moveTo(r[x].x,r[x].y));c.stroke()}}addEventListener('resize',()=>{if(hero.classList.contains('structure'))drawTerrain()});document.querySelector('#year').textContent=new Date().getFullYear();

// Rotating service headline: decorative, pausable and respectful of reduced motion.
const serviceWords=['Design.','SEO.','Branding.','Development.','Video.'];
let serviceIndex=0,wordSwapTimer=null;
const rotatingWord=document.querySelector('#rotating-word');
function cancelWordTransition(){clearTimeout(wordSwapTimer);rotatingWord.classList.remove('word-out')}
setInterval(()=>{if(paused||reduce.matches||document.hidden)return;rotatingWord.classList.add('word-out');wordSwapTimer=setTimeout(()=>{if(paused||reduce.matches||document.hidden){cancelWordTransition();return}serviceIndex=(serviceIndex+1)%serviceWords.length;rotatingWord.textContent=serviceWords[serviceIndex];rotatingWord.classList.remove('word-out')},220)},3200);
motion.addEventListener('click',cancelWordTransition);reduce.addEventListener('change',cancelWordTransition);document.addEventListener('visibilitychange',cancelWordTransition);

// Clipboard feedback is announced only after the browser confirms success.
const copyButton=document.querySelector('.copy-email'),copyStatus=document.querySelector('.copy-status');let copyTimer;
copyButton.addEventListener('click',async()=>{clearTimeout(copyTimer);copyButton.disabled=true;copyButton.textContent='Copy email';copyStatus.textContent='';try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText('arttica.is@gmail.com');copyStatus.textContent='Email copied.';copyButton.textContent='Copied';}catch(error){copyButton.textContent='Copy email';copyStatus.textContent='Could not copy. Please select the email address or use the email link.';}finally{copyButton.disabled=false;copyTimer=setTimeout(()=>{copyButton.textContent='Copy email';copyStatus.textContent=''},5000)}});
// Match hover feedback with keyboard focus and do not replay on touch navigation.
document.querySelectorAll('.brand,.footer-brand').forEach(brand=>{const play=()=>{if(prefersStill()||brand.classList.contains('logo-glint'))return;brand.classList.add('logo-glint');setTimeout(()=>brand.classList.remove('logo-glint'),850)};brand.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')play()});brand.addEventListener('focus',play)});
