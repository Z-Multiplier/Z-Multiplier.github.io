const PI=3.14159265359;
let wanderTimeout=null;
let currentAngle=0;
let isSpinning=false;
document.addEventListener('mousedown',function(e){
    const ripple=document.createElement('div');
    ripple.className='ripple';
    ripple.style.left=e.clientX+'px';
    ripple.style.top=e.clientY+'px';
    document.body.appendChild(ripple);
    setTimeout(()=>{
        ripple.remove();
    },800);
})
function copyCode(btn){
    const wrapper=btn.closest('.code-wrapper');
    if(!wrapper) return;
    const pre=wrapper.querySelector('pre');
    if(!pre) return;
    const code=pre.querySelector('code');
    const text=code ? code.textContent :pre.textContent;
    navigator.clipboard.writeText(text.trim()).then(()=>{
        const originalText=btn.textContent;
        btn.textContent='Copied!';
        btn.style.borderColor='#ccbebb';
        setTimeout(()=>{
            btn.textContent=originalText;
            btn.style.borderColor='#30363d';
        },1500);
    }).catch(()=>{
        alert('复制失败，请手动复制');
    });
}
document.addEventListener('DOMContentLoaded',function(){
    const ptr=document.getElementsByClassName('ptr')[0];
    if(!ptr) return;
    let x=window.innerWidth-140;
    let y=window.innerHeight-180;
    let targetX=x,targetY=y;
    function clampPosition(){
        const maxX=window.innerWidth-120;
        const maxY=window.innerHeight-150;
        targetX=Math.min(maxX,Math.max(20,targetX));
        targetY=Math.min(maxY,Math.max(20,targetY));
    }
    function updateTarget(){
        const maxX=window.innerWidth-120;
        const maxY=window.innerHeight-150;
        targetX=Math.random()*maxX;
        targetY=Math.random()*maxY;
        setTimeout(updateTarget,10000+Math.random()*3000);
    }
    function moveptr(){
        const dx=targetX-x;
        const dy=targetY-y;
        x+=dx*0.002;
        y+=dy*0.002;
        ptr.style.left=x+'px';
        ptr.style.top=y+'px';
        if(!isSpinning){
            if(Math.abs(dx)>0.5||Math.abs(dy)>0.5){
                let targetAngle=Math.atan2(dy,dx)+PI/2;
                let diff=targetAngle-currentAngle;
                while(diff>Math.PI) diff-=2*Math.PI;
                while(diff< -Math.PI) diff+=2*Math.PI;
                currentAngle+=diff*0.08;
            }
            ptr.style.transform=`rotate(${currentAngle}rad)`;
        }
        requestAnimationFrame(moveptr);
    }
    wanderTimeout=setTimeout(updateTarget,1000);
    moveptr();
    window.addEventListener('resize',clampPosition);
});
document.addEventListener('DOMContentLoaded',function(){
    const ptr=document.getElementsByClassName('ptr')[0];
    if(!ptr) return;
    ptr.addEventListener('click',function(){
        if(isSpinning) return;
        isSpinning=true;
        const startAngle=currentAngle;
        const totalRotation=2*Math.PI;
        const duration=600;
        const startTime=performance.now();
        function spinAnimation(time){
            const elapsed=time-startTime;
            const progress=Math.min(elapsed/duration,1);
            const eased=1-Math.pow(1-progress,3);
            const currentSpinAngle=startAngle+totalRotation*eased;
            ptr.style.transform=`rotate(${currentSpinAngle}rad)`;
            if(progress< 1){
                requestAnimationFrame(spinAnimation);
            }
            else{
                currentAngle=startAngle;
                isSpinning=false;
            }
        }
        requestAnimationFrame(spinAnimation);
    });
});
document.addEventListener('DOMContentLoaded',function(){
    const searchInput=document.getElementById('searchInput');
    const searchResults=document.getElementById('searchResults');
    if(!searchInput||!searchResults) return;
    let articles=[];
    let defaultArticles=[];
    fetch('./articles/articles.json')
        .then(res=>res.json())
        .then(data=>{
            articles=data;
            defaultArticles=articles.slice(0,5);
            renderResults(defaultArticles);
        })
        .catch(()=>{
            searchResults.innerHTML='<p style="color:#8b949e; font-size:14px;">⚠️ 文章索引加载失败</p>';
        });
    function renderResults(list){
        if(!list||list.length===0){
            searchResults.innerHTML='<p style="color:#8b949e; font-size:14px;">没有找到匹配的文章</p>';
            return;
        }
        searchResults.innerHTML=list.map(article=>`
            <a href="?post=${article.id}" class="search-item">
                ${article.title}
            </a>
        `).join('');
    }
    searchInput.addEventListener('input',function(){
        const query=this.value.trim().toLowerCase();
        if(!query){
            renderResults(defaultArticles);
            return;
        }
        const matched=articles.filter(article=>
            article.title.toLowerCase().includes(query)
        );
        renderResults(matched);
    });
});
function downloadCode(btn,ext){
    const wrapper=btn.closest('.code-wrapper');
    if(!wrapper) return;
    const pre=wrapper.querySelector('pre');
    if(!pre) return;
    const code=pre.querySelector('code');
    if(!code) return;
    const text=code.textContent;
    const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const originalText=btn.textContent;
    btn.textContent='Downloaded';
    setTimeout(() => {
        btn.textContent=originalText;
    },1200);
}