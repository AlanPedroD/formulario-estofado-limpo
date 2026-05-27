(function(){
  const form = document.getElementById('form');
  const steps = document.querySelectorAll('.step');
  const indicators = document.querySelectorAll('.step-indicator');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  let current = 0;

  function updateIndicators(){
    indicators.forEach((ind,i)=>{
      ind.classList.remove('active','done');
      if(i < current) ind.classList.add('done');
      if(i === current) ind.classList.add('active');
    });
  }

  function goTo(index){
    steps[current].classList.remove('active');
    current = index;
    steps[current].classList.add('active');
    updateIndicators();
    const titulo = document.getElementById('titulo');
    if(titulo) titulo.style.display = current === 0 ? 'block' : 'none';
    const first = steps[current].querySelector('input,textarea');
    if(first) setTimeout(()=>first.focus(), 400);
  }

  function triggerError(el){
    el.classList.remove('input-error');
    void el.offsetWidth;
    el.classList.add('input-error');
    el.addEventListener('input',()=>el.classList.remove('input-error'),{once:true});
  }

  function showErr(msgEl, txt, inputEl){
    msgEl.textContent = txt;
    if(inputEl) { triggerError(inputEl); inputEl.focus(); }
  }

  function validateStep(i){
    if(i===0){
      const nome = document.getElementById('nome');
      const err = document.getElementById('nomeErro');
      if(!nome.value.trim()){showErr(err,'Por favor, informe o nome do cliente.',nome);return false;}
      err.textContent='';
    }
    if(i===1){
      const checks = document.querySelectorAll('#servicosOptions input[type="checkbox"]:checked');
      const err = document.getElementById('servicoErro');
      if(checks.length===0){
        err.textContent='Selecione ao menos um serviço.';
        const opts = document.getElementById('servicosOptions');
        opts.classList.add('options-error');
        setTimeout(()=>opts.classList.remove('options-error'),600);
        return false;
      }
      err.textContent='';
    }
    if(i===2){
      const rua = document.getElementById('rua');
      const bairro = document.getElementById('bairro');
      const cidade = document.getElementById('cidade');
      const err = document.getElementById('enderecoErro');
      if(!rua.value.trim()){showErr(err,'Informe a rua/avenida.',rua);return false;}
      if(!cidade.value.trim()){showErr(err,'Informe a cidade.',cidade);return false;}
      err.textContent='';
    }
    if(i===3){
      const data = document.getElementById('data');
      const hora = document.getElementById('hora');
      const err = document.getElementById('agendaErro');
      if(!data.value){showErr(err,'Selecione a data do serviço.',data);return false;}
      if(!hora.value){showErr(err,'Selecione o horário do serviço.',hora);return false;}
      err.textContent='';
    }
    if(i===4){
      const tel = document.getElementById('telefone');
      const err = document.getElementById('telefoneErro');
      const regex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
      if(!regex.test(tel.value.trim())){showErr(err,'Informe um número de WhatsApp válido.',tel);return false;}
      err.textContent='';
    }
    if(i===5){
      const val = document.getElementById('valor');
      const err = document.getElementById('valorErro');
      if(!val.value.trim()){showErr(err,'Informe o valor do serviço.',val);return false;}
      err.textContent='';
    }
    return true;
  }

  document.getElementById('telefone').addEventListener('input',function(){
    let v = this.value.replace(/\D/g,'').slice(0,11);
    if(v.length>0) v='('+v;
    if(v.length>3) v=v.slice(0,3)+') '+v.slice(3);
    if(v.length>10) v=v.slice(0,10)+'-'+v.slice(10);
    this.value=v;
    document.getElementById('telefoneErro').textContent='';
  });

  document.querySelectorAll('#servicosOptions label').forEach(label=>{
    label.addEventListener('click',()=>{
      setTimeout(()=>{
        label.classList.toggle('selected', label.querySelector('input').checked);
        document.getElementById('servicoErro').textContent='';
      },0);
    });
  });

  document.querySelectorAll('.next').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(!validateStep(current)) return;
      if(current < steps.length-1) goTo(current+1);
    });
  });

  document.querySelectorAll('.prev').forEach(btn=>{
    btn.addEventListener('click',()=>{if(current>0) goTo(current-1);});
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const nextBtn = steps[current].querySelector('.next');
      const enviarBtn = document.getElementById('enviarBtn');
      if(nextBtn) nextBtn.click();
      else if(current===5) enviarBtn.click();
    }
    if(e.key==='Escape'&&modal.classList.contains('show')) hideModal();
  });

  function formatDate(d){
    if(!d) return '';
    const [y,m,dia] = d.split('-');
    return `${dia}/${m}/${y}`;
  }

  function buildMessage(){
    const nome    = document.getElementById('nome').value.trim();
    const checks  = [...document.querySelectorAll('#servicosOptions input[type="checkbox"]:checked')].map(c=>c.value);
    const rua     = document.getElementById('rua').value.trim();
    const bairro  = document.getElementById('bairro').value.trim();
    const cidade  = document.getElementById('cidade').value.trim();
    const data    = document.getElementById('data').value;
    const hora    = document.getElementById('hora').value;
    const tel     = document.getElementById('telefone').value.trim();
    const valor   = document.getElementById('valor').value.trim();
    const obs     = document.getElementById('obs').value.trim();

    const enderecoCompleto = [rua, bairro, cidade].filter(Boolean).join(', ');
    const servicosStr = checks.join(', ');

    let msg = `🧽 *ESTOFADO LIMPO — NOVO PEDIDO*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `👤 *Cliente:* ${nome}\n`;
    msg += `📞 *Contato:* ${tel}\n\n`;
    msg += `🛠️ *Serviço(s):*\n`;
    checks.forEach(s => { msg += `   • ${s}\n`; });
    msg += `\n📍 *Endereço:* ${enderecoCompleto}\n\n`;
    msg += `📅 *Data:* ${formatDate(data)}\n`;
    msg += `⏰ *Horário:* ${hora}h\n\n`;
    msg += `💰 *Valor:* R$ ${valor}\n`;
    if(obs){
      msg += `\n📝 *Observações:*\n${obs}\n`;
    }
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━`;

    return msg;
  }

  document.getElementById('enviarBtn').addEventListener('click',()=>{
    if(!validateStep(5)) return;
    const numero = '5582996429077'; // ← substitua pelo número do WhatsApp desejado
    const msg = buildMessage();
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank');
    showModal();
  });

  function showModal(){
    modal.classList.add('show');
    document.body.style.overflow='hidden';
  }

  function hideModal(){
    modal.classList.remove('show');
    document.body.style.overflow='';
    steps[current].classList.remove('active');
    current=0;
    steps[0].classList.add('active');
    updateIndicators();
    form.reset();
    document.querySelectorAll('#servicosOptions label').forEach(l=>l.classList.remove('selected'));
    const titulo = document.getElementById('titulo');
    if(titulo) titulo.style.display='block';
  }

  closeModal.addEventListener('click',hideModal);
  modal.addEventListener('click',e=>{ if(e.target===modal) hideModal(); });

  updateIndicators();
})();
