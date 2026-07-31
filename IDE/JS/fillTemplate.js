function fillTemplate(btn){
    const codes=document.getElementById('code-input');
    codes.value='#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    return 0;\n}'
    codes.dispatchEvent(new Event('input'));
}