// === Музыка и mute ===
const audio = document.getElementById('bgMusic');
const muteBtn = document.getElementById('muteBtn');

// Стартуем muted чтобы пройти autoplay-блокировки браузера.
audio.muted = true;
muteBtn.classList.add('is-muted');

// При первом взаимодействии запускаем воспроизведение.
let firstPlayDone = false;
function ensurePlaying() {
  if (firstPlayDone) return;
  audio.play().catch(() => { /* пользователь сам нажмёт unmute */ });
  firstPlayDone = true;
}

muteBtn.addEventListener('click', () => {
  ensurePlaying();
  audio.muted = !audio.muted;
  muteBtn.classList.toggle('is-muted', audio.muted);
  if (!audio.muted && audio.paused) audio.play().catch(() => {});
});

// === Открытие обложки ===
const cover = document.getElementById('cover');
const content = document.getElementById('content');
const openBtn = document.getElementById('openBtn');

function openInvitation() {
  ensurePlaying();
  // При открытии включаем звук, если он был заглушен по умолчанию
  if (audio.muted) {
    audio.muted = false;
    muteBtn.classList.remove('is-muted');
    audio.play().catch(() => {});
  }

  cover.classList.add('is-open');
  content.classList.add('is-visible');
  content.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'auto';
  setTimeout(() => { cover.style.display = 'none'; }, 1000);
}

openBtn.addEventListener('click', openInvitation);
document.body.style.overflow = 'hidden';

// === Появление секций при скролле ===
const sections = document.querySelectorAll('.section');
sections.forEach(s => s.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

sections.forEach(s => io.observe(s));

// === RSVP-форма ===
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwUzJTAE8XvJFk7EdrzSGNiomnNaQyR44N3QH9F_AlfrdYdwNmT1vLx5-yuM-lJ1p_T/exec';

const form = document.getElementById('rsvpForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.name || !data.attending) {
    status.textContent = 'Пожалуйста, заполните обязательные поля.';
    status.style.color = '#a64a3f';
    return;
  }

  submitBtn.disabled = true;
  status.textContent = 'Отправляем...';
  status.style.color = '';

  try {
    await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });
    form.reset();
    status.textContent = 'Спасибо! Мы получили ваш ответ.';
  } catch (err) {
    status.textContent = 'Не удалось отправить. Попробуйте ещё раз или напишите нам напрямую.';
    status.style.color = '#a64a3f';
  } finally {
    submitBtn.disabled = false;
  }
});
