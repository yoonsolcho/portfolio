/* =============================================
   app.js — 조윤솔 포트폴리오
   Animations: Particles · Scramble · Typewriter · Cursor · Scroll
   ============================================= */

// =============================================
// 1. Custom Cursor
// =============================================
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
  const speed = 0.1;
  cursorX += (mouseX - cursorX) * speed;
  cursorY += (mouseY - cursorY) * speed;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

const interactables = document.querySelectorAll('a, button, .project-card, .gallery-item, .about-card, .learning-card, .contact-link, .stellar-object');
interactables.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('active'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

// =============================================
// 2. Canvas Particle Constellation System
// =============================================
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const PARTICLE_COUNT = 90;
  const MAX_DIST = 140;
  const mouse = { x: -999, y: -999 };

  // Track mouse position relative to canvas
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticleList();
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(random = false) {
      this.x = random ? Math.random() * W : (Math.random() > 0.5 ? 0 : W);
      this.y = random ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.baseVx = this.vx;
      this.baseVy = this.vy;
      this.radius = Math.random() * 1.8 + 0.4;
      this.opacity = Math.random() * 0.6 + 0.15;
      // Alternate colors: violet, blue, pink, teal
      const palette = [
        '167, 139, 250',  // violet
        '96,  165, 250',  // blue
        '244, 114, 182',  // pink
        '52,  211, 153',  // teal
      ];
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(t) {
      // Mouse attraction / repulsion
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ATTRACT_RADIUS = 160;

      if (dist < ATTRACT_RADIUS && dist > 0) {
        const force = ((ATTRACT_RADIUS - dist) / ATTRACT_RADIUS) * 0.025;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Drift back to base velocity
      this.vx += (this.baseVx - this.vx) * 0.02;
      this.vy += (this.baseVy - this.vy) * 0.02;

      // Speed cap
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 2) {
        this.vx = (this.vx / speed) * 2;
        this.vy = (this.vy / speed) * 2;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;

      // Pulsing opacity
      this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(t * 0.001 + this.pulseOffset));
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.currentOpacity})`;
      ctx.fill();
    }
  }

  function initParticleList() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          // Gradient line between the two particle colors
          const grad = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          grad.addColorStop(0, `rgba(${particles[i].color}, ${alpha})`);
          grad.addColorStop(1, `rgba(${particles[j].color}, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  // Mouse "web" — connections from mouse to nearby particles
  function drawMouseWeb() {
    const WEB_RADIUS = 180;
    particles.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < WEB_RADIUS) {
        const alpha = (1 - dist / WEB_RADIUS) * 0.55;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  }

  let animT = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    animT++;

    drawConnections();
    drawMouseWeb();
    particles.forEach(p => {
      p.update(animT);
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  animate();
})();

// =============================================
// 3. Typewriter Effect
// =============================================
function typewriter(el, lines, speed = 55) {
  return new Promise(resolve => {
    const fullText = lines;
    let i = 0;
    el.textContent = '';

    function type() {
      if (i < fullText.length) {
        el.textContent += fullText[i];
        i++;
        setTimeout(type, speed + Math.random() * 30);
      } else {
        resolve();
      }
    }

    type();
  });
}

// =============================================
// 4. Hero Entrance Sequence
// =============================================
async function heroEntrance() {
  await new Promise(r => setTimeout(r, 400)); // initial delay

  // Typewriter the description
  const twEl = document.getElementById('typewriterText');
  if (twEl) {
    await typewriter(twEl, '숫자와 언어, 기술과 예술 사이\n두 세계를 잇는 사람', 60);
  }
}

window.addEventListener('load', heroEntrance);

// =============================================
// 6. Navigation
// =============================================
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

const navMenu = document.getElementById('navMenu');
const mobileNav = document.getElementById('mobileNav');

navMenu.addEventListener('click', () => mobileNav.classList.toggle('open'));
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => mobileNav.classList.remove('open'));
});

// =============================================
// 7. Smooth Scroll
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// =============================================
// 8. Scroll Reveal Animations
// =============================================
const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children].filter(
        el => el.classList.contains('reveal-up') || el.classList.contains('reveal-left') || el.classList.contains('reveal-right')
      );
      const delay = siblings.indexOf(entry.target) * 90;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

reveals.forEach(el => revealObserver.observe(el));

// =============================================
// 9. Parallax — blobs move on scroll
// =============================================
const blobs = document.querySelectorAll('.blob');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  blobs.forEach((blob, i) => {
    const speed = (i % 2 === 0) ? 0.18 : -0.12;
    blob.style.transform = `translateY(${scrollY * speed}px)`;
  });
}, { passive: true });

// =============================================
// 10. 3D Card Tilt
// =============================================
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    this.style.transform = `translateY(-6px) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
    this.style.transition = 'transform 0.08s ease';
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
  });
});

// =============================================
// 11. About cards color on hover
// =============================================
document.querySelectorAll('.about-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    const h3 = this.querySelector('h3');
    if (h3) h3.style.color = 'var(--accent-1)';
  });
  card.addEventListener('mouseleave', function() {
    const h3 = this.querySelector('h3');
    if (h3) h3.style.color = '';
  });
});

// =============================================
// 12. Active nav highlight on scroll
// =============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.style.color = isActive ? 'var(--accent-1)' : '';
      });
    }
  });
}, { threshold: 0.45 }).observe;

sections.forEach(s => {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--accent-1)' : '';
        });
      }
    });
  }, { threshold: 0.45 }).observe(s);
});

// =============================================
// 13. Video Modal Interactivity
// =============================================
const videoModal = document.getElementById('videoModal');
const videoIframe = document.getElementById('videoIframe');
const videoModalClose = document.getElementById('videoModalClose');
const videoFallbackLink = document.getElementById('videoFallbackLink');
const videoTriggers = document.querySelectorAll('.video-trigger');

if (videoModal && videoIframe && videoModalClose) {
  videoTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const videoSrc = trigger.getAttribute('data-video-src');
      if (videoSrc) {
        videoIframe.src = videoSrc;
        if (videoFallbackLink) {
          if (videoSrc.includes('youtube.com')) {
            videoFallbackLink.href = videoSrc.replace('embed/', 'watch?v=');
            videoFallbackLink.textContent = '유튜브에서 직접 보기 ↗';
          } else {
            videoFallbackLink.href = videoSrc.replace('/preview', '/view?usp=sharing');
            videoFallbackLink.textContent = '구글 드라이브에서 직접 보기 ↗';
          }
        }
        videoModal.classList.add('open');
      }
    });
  });

  const closeModal = () => {
    videoModal.classList.remove('open');
    videoIframe.src = '';
  };

  videoModalClose.addEventListener('click', closeModal);

  // Close when clicking overlay background
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeModal();
    }
  });

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('open')) {
      closeModal();
    }
  });
}

// =============================================
// 14. PPT Viewer Modal Interactivity
// =============================================
const pptModal = document.getElementById('pptModal');
const pptIframe = document.getElementById('pptIframe');
const pptModalClose = document.getElementById('pptModalClose');
const pptTriggers = document.querySelectorAll('.ppt-trigger');

function getGoogleDriveId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
}

if (pptModal && pptIframe && pptModalClose) {
  pptTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const pptSrc = trigger.getAttribute('data-ppt-src');
      if (pptSrc && pptSrc !== "") {
        if (pptSrc.includes('drive.google.com')) {
          const fileId = getGoogleDriveId(pptSrc);
          pptIframe.src = `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
        } else {
          pptIframe.src = pptSrc;
        }
        pptModal.classList.add('open');
      } else {
        alert('PPT 발표자료 구글 공유 링크를 전달해 주시면 즉시 연결해 드리겠습니다! 이 대화방에 링크를 남겨주세요.');
      }
    });
  });

  const closePptModal = () => {
    pptModal.classList.remove('open');
    pptIframe.src = '';
  };

  pptModalClose.addEventListener('click', closePptModal);

  pptModal.addEventListener('click', (e) => {
    if (e.target === pptModal) {
      closePptModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pptModal.classList.contains('open')) {
      closePptModal();
    }
  });
}

// =============================================
// 15. Page load fade-in
// =============================================
document.documentElement.style.opacity = '0';
document.documentElement.style.transition = 'opacity 0.5s ease';
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.documentElement.style.opacity = '1';
  });
});

console.log('%c조윤솔 포트폴리오 ✨', 'color:#a78bfa;font-size:18px;font-weight:bold;');
console.log('%c한림대학교 경영학과 / 디지털인문예술 전공', 'color:#60a5fa;font-size:13px;');
