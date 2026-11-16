import {shouldDismiss} from './smart.js';
export function installSheets(){
 const root=document.documentElement;let keyboardOpen=false;
 const sync=()=>{const open=!!document.querySelector('dialog[open]');root.classList.toggle('modal-open',open);if(!open)document.body.classList.remove('keyboard-open');};
 const viewport=()=>{const vv=window.visualViewport;const height=vv?.height||window.innerHeight;const bottom=vv?Math.max(0,window.innerHeight-height-vv.offsetTop):0;root.style.setProperty('--vv-height',height+'px');root.style.setProperty('--keyboard-bottom',bottom+'px');keyboardOpen=bottom>120;const focused=!!document.activeElement?.matches('input:not([readonly]):not([type=date]):not([type=checkbox]),textarea')&&!!document.querySelector('dialog[open]');document.body.classList.toggle('keyboard-open',keyboardOpen||focused);};
 window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);window.addEventListener('resize',viewport);viewport();
 for(const dialog of document.querySelectorAll('dialog')){
  const observer=new MutationObserver(sync);observer.observe(dialog,{attributes:true,attributeFilter:['open']});dialog.addEventListener('close',()=>{dialog.style.transform='';sync();document.activeElement?.blur?.();});
  let downOutside=false;dialog.addEventListener('pointerdown',e=>{const r=dialog.getBoundingClientRect();downOutside=e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;});dialog.addEventListener('click',e=>{if(downOutside&&e.target===dialog)dialog.close();downOutside=false;});
  const handle=dialog.querySelector('.sheet-grab');if(!handle)continue;let drag=null;
  handle.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;drag={x:e.clientX,y:e.clientY,start:performance.now(),id:e.pointerId};handle.setPointerCapture(e.pointerId);dialog.classList.add('dragging');});
  handle.addEventListener('pointermove',e=>{if(!drag)return;const dy=Math.max(0,e.clientY-drag.y);dialog.style.transform=`translateY(${dy}px)`;});
  const finish=e=>{if(!drag)return;const close=shouldDismiss({dx:e.clientX-drag.x,dy:e.clientY-drag.y,duration:performance.now()-drag.start});drag=null;dialog.classList.remove('dragging');dialog.style.transform='';if(close)dialog.close();};
  handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',()=>{drag=null;dialog.style.transform='';dialog.classList.remove('dragging');});
 }
 document.addEventListener('focusin',e=>{if(e.target.matches('input:not([readonly]):not([type=date]):not([type=checkbox]),textarea')){if(document.querySelector('dialog[open]'))document.body.classList.add('keyboard-open');setTimeout(()=>e.target.scrollIntoView({block:'nearest'}),180);}});
 document.addEventListener('focusout',()=>setTimeout(()=>{const input=document.activeElement?.matches('input:not([readonly]):not([type=date]):not([type=checkbox]),textarea');if(!input&&!keyboardOpen)document.body.classList.remove('keyboard-open');},80));
 return {show(dialog){dialog.style.transform='';dialog.showModal();dialog.querySelector('.sheet-scroll')?.scrollTo(0,0);sync();viewport();}};
}
