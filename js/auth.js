(function(){
    const secret = String.fromCharCode(119,97,118,101,50,50);

    function showMessage(msg){
        const el = document.getElementById('msg');
        if(el) el.textContent = msg;
    }

    function tryUnlock(){
        const input = document.getElementById('pwd');
        if(!input) return;
        const val = input.value || '';
        if(val === secret){
            try {
                sessionStorage.setItem('authenticated','1');
            } catch (e) {}
            // Redirect to homepage
            location.href = 'index.html';
        } else {
            showMessage('Incorrect password');
            input.value = '';
            input.focus();
        }
    }

    // Hook up UI
    document.addEventListener('DOMContentLoaded', function(){
        const btn = document.getElementById('submit');
        const input = document.getElementById('pwd');
        if(btn) btn.addEventListener('click', tryUnlock);
        if(input) input.addEventListener('keypress', function(e){ if(e.key === 'Enter') tryUnlock(); });
    });

    // Optional global logout helper (not used by default)
    window.__logout = function(){ try{ sessionStorage.removeItem('authenticated'); }catch(e){} location.href='login.html'; };
})();
