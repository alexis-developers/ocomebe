const API_URL = localStorage.getItem('ocomebe_api_url') || 'https://ocomebe-api.dev-teste.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.header__nav a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .recurso-card, .timeline__item, .stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  initForms();
});

async function initForms() {
  const newsletterForm = document.querySelector('.newsletter__form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const btn = newsletterForm.querySelector('button');
      const email = emailInput.value;

      btn.textContent = 'Enviando...';
      btn.disabled = true;

      try {
        const response = await fetch(`${API_URL}/api/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
          btn.textContent = '✓ Inscrito!';
          emailInput.value = '';
          setTimeout(() => {
            btn.textContent = 'Assinar Agenda';
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        btn.textContent = 'Erro - Tente novamente';
        setTimeout(() => {
          btn.textContent = 'Assinar Agenda';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  const filiacaoBtn = document.querySelector('.cta__actions .btn--gold');
  if (filiacaoBtn) {
    filiacaoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showFiliacaoModal();
    });
  }
}

function showFiliacaoModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <button class="modal__close">&times;</button>
      <h2 class="modal__title">Iniciar Filiação</h2>
      <p class="modal__text">Preencha seus dados para iniciar o processo de filiação à OCOMEBE.</p>
      <form class="modal__form" id="filiacaoForm">
        <div class="modal__field">
          <label>Nome Completo *</label>
          <input type="text" name="nome" required placeholder="Seu nome completo">
        </div>
        <div class="modal__field">
          <label>Email *</label>
          <input type="email" name="email" required placeholder="seu@email.com">
        </div>
        <div class="modal__field">
          <label>Telefone</label>
          <input type="tel" name="telefone" placeholder="(00) 00000-0000">
        </div>
        <div class="modal__field">
          <label>Igreja / Ministério</label>
          <input type="text" name="igreja" placeholder="Nome da igreja">
        </div>
        <div class="modal__field">
          <label>Cidade / Estado</label>
          <input type="text" name="cidade" placeholder="Cidade - UF">
        </div>
        <button type="submit" class="btn btn--gold" style="width:100%">Enviar Solicitação</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    .modal {
      background: white;
      border-radius: 8px;
      padding: 32px;
      max-width: 480px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease;
    }
    .modal__close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #76777E;
    }
    .modal__title {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      color: var(--deep-navy);
      margin-bottom: 8px;
    }
    .modal__text {
      color: var(--text-muted);
      margin-bottom: 24px;
      font-size: 0.9rem;
    }
    .modal__field {
      margin-bottom: 16px;
    }
    .modal__field label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--charcoal);
      margin-bottom: 6px;
    }
    .modal__field input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 4px;
      font-size: 0.9rem;
      font-family: var(--font-sans);
      transition: border-color 0.2s;
    }
    .modal__field input:focus {
      outline: none;
      border-color: var(--gold);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  modal.querySelector('.modal__close').addEventListener('click', () => {
    modal.remove();
    style.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      style.remove();
    }
  });

  document.getElementById('filiacaoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const response = await fetch(`${API_URL}/api/filiacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        modal.querySelector('.modal__form').innerHTML = `
          <div style="text-align:center;padding:20px 0">
            <div style="font-size:48px;margin-bottom:16px">✓</div>
            <h3 style="color:var(--deep-navy);margin-bottom:8px">Solicitação Enviada!</h3>
            <p style="color:var(--text-muted)">Entraremos em contato em breve.</p>
          </div>
        `;
        setTimeout(() => {
          modal.remove();
          style.remove();
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      btn.textContent = 'Erro - Tente novamente';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = 'Enviar Solicitação';
      }, 3000);
    }
  });
}
