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
    const text=code ? code.textContent : pre.textContent;
    navigator.clipboard.writeText(text.trim()).then(()=>{
        const originalText=btn.textContent;
        btn.textContent='Copied!';
        btn.style.borderColor='#ccbebb';
        setTimeout(()=>{
            btn.textContent=originalText;
            btn.style.borderColor='#30363d';
        }, 1500);
    }).catch(()=>{
        alert('复制失败，请手动复制');
    });
}