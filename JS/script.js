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
    const ptrs=document.getElementsByClassName('ptr');
    for(const ptr of ptrs){
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
    }
});
document.addEventListener('DOMContentLoaded',function(){
    const ptrs=document.getElementsByClassName('ptr');
    for(const ptr of ptrs){
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
    }
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
    setTimeout(()=>{
        btn.textContent=originalText;
    },1200);
}
function getRandomInt(min,max){
    min=Math.ceil(min);
    max=Math.floor(max);
    return Math.floor(Math.random()*(max-min+1))+min;
}
let random=0;
let hue=0;
function RainbowStep(){
    hue=(hue+1)%360;
    document.body.style.background=`linear-gradient(hsl(${hue},100%,50%),hsl(${hue+60},100%,50%))`;
    requestAnimationFrame(RainbowStep);
}
function createActivatedPtr(){
    const ptr=document.createElement('div');
    ptr.className='ptr';
    document.body.appendChild(ptr);
    let x=window.innerWidth-140+Math.random()*200-100;
    let y=window.innerHeight-180+Math.random()*200-100;
    let targetX=x,targetY=y;
    let currentAngle=0;
    let isSpinning=false;
    let wanderTimeout=null;
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
        wanderTimeout=setTimeout(updateTarget,10000+Math.random()*3000);
    }
    function movePtr(){
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
                while (diff>Math.PI) diff-=2*Math.PI;
                while (diff< -Math.PI) diff+=2*Math.PI;
                currentAngle+=diff*0.08;
            }
            ptr.style.transform=`rotate(${currentAngle}rad)`;
        }
        requestAnimationFrame(movePtr);
    }
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
            if(progress<1){
                requestAnimationFrame(spinAnimation);
            }
            else{
                currentAngle=startAngle;
                isSpinning=false;
            }
        }
        requestAnimationFrame(spinAnimation);
    });
    wanderTimeout=setTimeout(updateTarget,1000);
    movePtr();
    window.addEventListener('resize',clampPosition);
    return ptr;
}
function randomThing(btn){
    random=getRandomInt(0,7);
    const rect=btn.getBoundingClientRect();
    switch(random){
        case 0:{
            window.location.href="https://www.bilibili.com/video/BV1GJ411x7h7";
            //Never gonna give you up
            break;
        }
        case 1:{
            const originText=btn.textContent;
            btn.textContent="好像什么都没有发生，再试试？";
            setTimeout(()=>{
                btn.textContent=originText;
            },1200);
            break;
        }
        case 2:{
            const explodeWave=document.createElement('div');
            explodeWave.className='explode-wave';
            explodeWave.style.left=(rect.left-rect.width/2)+'px';
            explodeWave.style.top=(rect.top-rect.height/2)+'px';
            document.body.appendChild(explodeWave);
            setTimeout(()=>{
                explodeWave.remove();
            },1000);
            const explode=document.createElement('div');
            explode.className='explode';
            explode.style.left=(rect.left-rect.width/2-2)+'px';
            explode.style.top=(rect.top-rect.height/2-2)+'px';
            document.body.appendChild(explode);
            for(let i=0;i<50;i++){
                const smoke=document.createElement('div');
                smoke.className='explode-smoke';
                const size=30+Math.random()*20;
                smoke.style.width=size+'px';
                smoke.style.height=size+'px';
                smoke.style.left=((rect.left-rect.width/2)+Math.random()*200-80)+'px';
                smoke.style.top=((rect.top-rect.height/2)+Math.random()*200-80)+'px';
                let spin=Math.random()*PI*2;
                smoke.style.transform=`rotate(${spin}rad)`;
                document.body.appendChild(smoke);
                setTimeout(()=>{
                    smoke.remove();
                },10000);
            }
            break;
        }
        case 3:{
            alert('光敏性癫痫警告，若有不适请立刻退出');
            RainbowStep();
            break;
        }
        case 4:{
            for(let i=0;i<5;i++){
                createActivatedPtr();
            }
            break;
        }
        case 5:{
            for(let i=100;i>=0;i--){
                alert(`还剩${i}次关闭，加油`);
            }
            break;
        }
        case 6:{
            const home=document.getElementById('home');
            if(!home) return;
            const elements=home.querySelectorAll('*');
            elements.forEach(el=>{
                const tx=(Math.random()-0.5)*200;
                const ty=(Math.random()-0.5)*200;
                const rot=(Math.random()-0.5)*360;
                const scale=0.5+Math.random()*1.5;
                el.style.transform=`translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
            });
            break;
        }
        case 7:{
            document.body.style.background='#ffffff';
            document.body.innerHTML='<div style=\"display:flex; width:100%; height:100%; justify-content:center;\"><h1 style=\"text-align:center; color:#000000\">404 Not Found :P</h1></div>'
            break;
        }
    }
}