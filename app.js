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
// 14. PPT Viewer Modal Interactivity & Details Injection
// =============================================
const projectDetails = {
  '403-bypass': {
    title: '403 BYPASS',
    problem: '장애인, 고령자 등 문화 소외 계층이 오프라인 공연 관람을 기획하고 예매하는 과정에서 휠체어석 정보 부족, 접근성 편의시설 미비 등으로 인해 겪는 물리적·정보적 진입 장벽을 해결하고자 했습니다.',
    role: '• 문제 발굴(1~3) 관련 자료 조사\n• S-map 및 또타지하철 연계 협업 아이디어 제시\n• "360º 뷰어" 단독 구현\n• 앱 아이콘 및 좌석표 디자인\n• 발표 PPT 검토 및 피드백',
    process: '1) 문헌 조사 및 공연장 휠체어석 실태조사\n2) 타겟층 설문조사 진행, 360º 뷰어 및 앱/웹사이트 제작\n3) 앱 및 웹사이트 UI/UX 개선, 홍보 전략 구상 및 광고 영상 제작',
    result: '흩어져 있는 정보를 한 곳에서 확인할 수 있는 플랫폼 프로토타입 완성\n26-1학기 디지털인문예술 전공 전시회 최우수상 수상',
    learn: '이번 프로젝트를 통해 배리어프리나 유니버설 디자인 같은 관련 용어들을 새로 배울 수 있었습니다. 또한 "360º 뷰어"를 실제로 구현해 보며 제작 방법을 익혔고, 좋은 팀 프로젝트를 만들기 위해 소통이 얼마나 중요한지 몸소 깨닫게 되었습니다. 특히 좋은 아이디어가 있을 때 팀원들과 아낌없이 공유하고, 구현할 거리라면 주저하지 않고 직접 실행으로 옮기는 적극적인 시도가 얼마나 좋은 결과로 이어지는지 체감할 수 있었습니다.'
  },
  'gentle-monster': {
    title: '결의 시선 (젠틀몬스터 콜라보)',
    problem: '실생활에서 쉽게 접하기 어려웠던 한국 전통 금속 공예(입사 기법 등)의 정교한 미학을 글로벌 아이웨어 브랜드 젠틀몬스터의 현대적이고 강렬한 정체성과 융합하여, MZ세대에게 잊혀가는 전통 공예의 가치를 새롭고 매력적인 상업 제품으로 재조명하고자 했습니다.',
    role: '• 발표 관련 자료 조사\n• 브랜드 콜라보레이션 컨셉 기획 및 가상 프로모션 홈페이지 단독 제작\n• 프로모션 웹사이트 내 콜라보 제품 이미지 전체 제작 (웹 업로드용 이미지 가공)',
    process: '1) 한국 전통 공예의 대중화 방안 및 콜라보레이션 형태 구상\n2) 기초 자료 조사 및 젠틀몬스터 브랜드 분석, 홍보 포스터 제작\n3) 가상 프로모션 홈페이지 및 관련 콘텐츠 이미지 제작',
    result: '구체적인 가상 콜라보 제품 라인을 기획하고, 이를 효과적으로 선보이는 프로모션 웹사이트 구현',
    learn: '전통적인 요소를 현대적인 콘텐츠로 브랜딩하는 기획력을 배웠습니다. 팀플을 할 때 소통을 위해 먼저 적극적으로 나서는 자세가 중요하다는 것을 느꼈고, 발표를 할 때에도 청중과 활발히 상호작용하며 설명하는 소통 방식이 필요하다는 점을 알게 되었습니다.'
  },
  'place-marketing': {
    title: '춘천 관광 마케팅 제안서',
    problem: '춘천이 보유한 풍부한 관광 자원에도 불구하고, \'닭갈비\'라는 대표 키워드 외에는 도시 브랜딩 및 뚜렷한 관광 이미지가 부족했습니다. 이로 인해 반려동물 동반 여행객이나 1인 여행객(혼행족)과 같이 변화하는 개별 관광 트렌드에 맞춘 마케팅에는 한계가 있었습니다.',
    role: '• 1인 여행객(혼행족) 대상 여행 트렌드 및 환경 분석 자료 조사\n• 펫프렌들리(반려동물 동반) 관련 콘텐츠 실태 및 니즈 자료 조사\n• 춘천시 로고 및 브랜드 슬로건의 마케팅적 의미 확장 아이디어 제시',
    process: '1) 춘천의 관광 환경 및 대내외 상황 분석\n2) 춘천의 과거·현재 실태 및 미래 수립 계획 기반의 타겟 고객(반려동물 동반 여행객, 1인 여행객) 선정\n3) 타겟의 니즈를 충족하는 춘천만의 차별화된 매력(USP) 및 맞춤형 테마 코스 기획, 이상적인 정책 방향 제안',
    result: '반려동물 동반 여행객과 1인 여행객을 타겟으로 한 춘천시 맞춤형 종합 관광 마케팅 전략 제안서 완성',
    learn: '• <b>도시 브랜딩과 상생 기획의 이해</b>\n장소 마케팅을 할 때 정말 많은 요인들이 장소 이미지에 영향을 미친다는 것을 크게 느꼈습니다. 춘천시 용역수립계획서를 열심히 읽어보며 지자체의 노력들을 공부했고, 지역 상권과 상생하는 기획을 고민해보며 공익적 브랜딩 방식을 이해하게 되었습니다.\n\n• <b>방대한 데이터의 수집 및 압축</b>\n어떤 주장을 제안하기 위해서는 과거·현재·미래를 아우르는 방대한 자료 조사가 꼭 뒷받침되어야 한다는 점을 배웠습니다. 수집한 많은 내용 중 PPT에 필요한 핵심만 골라 알맞게 압축하는 편집법도 함께 학습했습니다.\n\n• <b>이상적인 리더십과 협업의 가치</b>\n정말 운이 좋게 열정적인 조장을 만나 오프라인 회의를 자주 가졌습니다. 팀원 모두가 큰 흐름 속에서 필요한 조사를 척척 맡을 수 있게 설명하며 이끌어주는 리더십을 보며, 이상적인 조장의 역할을 자연스럽게 배울 수 있었습니다.'
  },
  'tourism-ind': {
    title: 'S&T (시니어 세미패키지 여행)',
    problem: '초고령 사회 진입에 따라 활동적인 액티브 시니어(Active Senior)가 증가하고 있으나, 기존 패키지 여행은 쇼핑 강요와 빡빡한 일정으로 피로감이 컸고 자유 여행은 정보 탐색 및 예약의 진입 장벽이 높아 불편을 겪었습니다.',
    role: '• 사업 개요 자료 조사 (시장 현황, 개발 동기, 경쟁자 분석 등)\n• 사업 지속가능성 분석 (전담) : 향후 5개년 예상 매출액, 영업이익, 당기순이익 등의 재무 추정치 설계\n• 추정 재무제표 바탕의 손익분기점(BEP) 분석 그래프 제작\n• 잠재 리스크 대응 방안, 초기 투자금 운영 계획 및 자금 조달 계획 수립',
    process: '1) 사업 아이템 논의 및 국내외 액티브 시니어 대상 세미 패키지 상품 컨셉 구상\n2) 시장 현황 분석을 위한 자료 조사 및 팀원 역할 분담\n3) 1차 PPT 제작 후 교수님 피드백 수렴 (타겟을 국내 액티브 시니어로 좁혀서 재설정)\n4) 타겟 변경에 따른 자료 재조사 및 2차 PPT 보완 제작\n5) 최종 사업계획서 발표',
    result: '건강 케어와 소규모 자유 일정이 융합된 시니어 전문 여행 서비스 브랜드 \'S&T\' 창업 사업계획서 도출',
    learn: '• <b>사업계획서 작성법과 디자인 습득</b>\n실제 비즈니스에 사용되는 이상적인 사업계획서의 핵심 요건과 구성 방법을 배울 수 있었습니다. 사업 계획을 논리적이고 깔끔하게 담아내는 시각적 디자인 스킬도 함께 기르게 되었습니다.\n\n• <b>추정 재무제표 설계 및 데이터 시각화 성공</b>\n사업의 지속가능성을 평가하기 위한 재무 추정 자료를 직접 제작해보았습니다. 이 과정에서 GPT를 도구로 적극 활용하여, 제가 원하는 정확한 수치의 손익분기점(BEP) 분석 그래프를 성공적으로 시뮬레이션하고 도출해내는 데이터 활용 능력을 키웠습니다.'
  },
  'marketing-basic': {
    title: '라면왕 김통깨 시장 실패 원인분석',
    problem: '신제품 \'라면왕 김통깨\'가 출시 초기의 높은 관심과 차별화된 제품 컨셉(김+통깨 스프)에도 불구하고, 지속적인 재구매율을 이끌어내지 못하고 시장에서 점유율이 하락한 마케팅 실패 원인을 분석하였습니다.',
    role: '• 개인 프로젝트로 자료 조사, 마케팅 케이스 분석, PPT 작성 및 발표 준비 등 전체 과정 단독 전담',
    process: '1) 판매 배경 및 제품 기본 분석\n2) 경쟁사 제품과의 비교 분석\n3) 라면왕 김통깨의 마케팅 전략 분석\n4) 주요 실패 요인 도출 및 개선 방향에 대한 제언',
    result: '라면왕 김통깨의 복합적인 실패 요인과 그에 따른 대책을 15장 분량의 분석 보고서(PPT)로 완성',
    learn: '• <b>시장 분석과 마케팅 실패 요인 탐색</b>\n라면왕 김통깨의 출시 데이터와 소비자 피드백을 살펴보며, 초기의 인기가 지속적인 재구매율로 연결되지 못하고 점유율이 하락한 복합적인 원인들을 짐작해볼 수 있었습니다.\n\n• <b>실패 방지 대책 및 실무 마케팅 연습</b>\n제품이 시장에서 실패하지 않고 살아남기 위한 전략과 방안들을 다각도로 직접 고민해보며, 설득력 있는 좋은 마케팅 제안을 기획하고 아이디어를 떠올리는 유익한 연습을 해볼 수 있었습니다.'
  },
  'ai-basic': {
    title: '취뽀메이트 (AI 면접 코칭)',
    problem: '취업 시장 경쟁 격화로 면접 대비 비용과 피드백의 진입 장벽이 높아진 취업 준비생들을 위해, 시간과 비용의 제약 없이 언제 어디서나 객관적이고 과학적인 모의 면접 진단과 피드백을 받을 수 있는 솔루션의 부재였습니다.',
    role: 'AI 기술 아키텍처 매핑 및 사용자 시나리오(User Scenario) 설계\n발표 자료(PDF) 시각화 및 프로젝트 발표 진행',
    process: '1) 기존 AI 면접 툴의 피드백 한계점(정형화된 답변 위주) 분석\n2) 생성형 AI(GPT API) 및 음성 인식(STT), 감정 분석 기술 연계 워크플로우 기획\n3) 답변의 논리성, 태도(시선 처리, 목소리 톤) 개별 진단 모듈 설계\n4) 프로토타입 UI 스토리보드 작성',
    result: '개인 맞춤형 피드백 레포트와 모의 면접 시뮬레이션을 제공하는 AI 면접 도우미 서비스 \'취뽀메이트\' 기획안 완성',
    learn: '생성형 AI 기술의 경영·교육적 적용 모델에 대한 공학적 이해를 확장하였고, 기술적 가능성을 실질적인 사용자 가치로 제품화하는 제품 기획 역량을 다졌습니다.'
  }
};

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
      const projectId = trigger.getAttribute('data-project-id');

      // Update details panel if exists
      if (projectId && projectDetails[projectId]) {
        const details = projectDetails[projectId];
        document.getElementById('pptModalTitle').textContent = details.title || '프로젝트 분석';
        document.getElementById('detailProblem').innerHTML = String(details.problem || '상세 기획 및 문제 분석 단계입니다.').replace(/\n/g, '<br>');
        document.getElementById('detailRole').innerHTML = String(details.role || '협업 및 기획 주도').replace(/\n/g, '<br>');
        document.getElementById('detailProcess').innerHTML = String(details.process || '자료 조사 및 웹 화면 프로토타이핑').replace(/\n/g, '<br>');
        document.getElementById('detailResult').innerHTML = String(details.result || '최종 보고서 작성 및 기획안 발표').replace(/\n/g, '<br>');
        document.getElementById('detailLearn').innerHTML = String(details.learn || '실무 기획 프로세스 습득 및 협업 커뮤니케이션 향상').replace(/\n/g, '<br>');
      } else {
        // Fallback for custom / undocumented triggers
        document.getElementById('pptModalTitle').textContent = '프로젝트 분석';
        document.getElementById('detailProblem').textContent = '상세 내용이 아직 등록되지 않았습니다. 추후 업데이트될 예정입니다.';
        document.getElementById('detailRole').textContent = '기획 및 제작 진행';
        document.getElementById('detailProcess').textContent = '프로젝트 조사 및 분석';
        document.getElementById('detailResult').textContent = '결과물 제출';
        document.getElementById('detailLearn').textContent = '프로젝트 수행을 통한 전공 지식 심화';
      }

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

const fadeIn = () => {
  requestAnimationFrame(() => {
    document.documentElement.style.opacity = '1';
  });
};

if (document.readyState === 'complete') {
  fadeIn();
} else {
  window.addEventListener('load', fadeIn);
}

// =============================================
// 16. Email Link Clipboard Copy Fallback
// =============================================
const emailLinks = document.querySelectorAll('#emailLink');
emailLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default mailto navigation (which opens default mail client / Chrome window)

    const emailText = 'h20243035@glab.hallym.ac.kr';

    // Copy function with legacy fallback for file:/// protocol (non-secure context)
    function copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback for file:/// and other non-secure contexts
        return new Promise((resolve, reject) => {
          try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            // Prevent scrolling and keep it hidden
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
              resolve();
            } else {
              reject(new Error('Fallback copy command was unsuccessful'));
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    }

    copyToClipboard(emailText)
      .then(() => {
        // Create custom toast alert dynamically if it doesn't exist
        let toast = document.getElementById('emailToast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'emailToast';
          toast.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(167, 139, 250, 0.95);
            color: #fff;
            padding: 14px 28px;
            border-radius: 100px;
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
            box-shadow: 0 10px 30px rgba(167, 139, 250, 0.3);
            pointer-events: none;
            text-align: center;
            white-space: nowrap;
          `;
          document.body.appendChild(toast);
        }
        toast.textContent = '이메일 주소가 복사되었습니다! (' + emailText + ')';
        
        // Show toast
        setTimeout(() => {
          toast.style.transform = 'translateX(-50%) translateY(0)';
          toast.style.opacity = '1';
        }, 50);

        // Hide toast after 3 seconds
        setTimeout(() => {
          toast.style.transform = 'translateX(-50%) translateY(100px)';
          toast.style.opacity = '0';
        }, 3000);
      })
      .catch(err => {
        console.error('Clipboard copy failed: ', err);
        // Direct alert fallback if copy fails completely
        alert('이메일 복사 실패. 직접 복사해주세요: ' + emailText);
      });
  });
});

console.log('%c조윤솔 포트폴리오 ✨', 'color:#a78bfa;font-size:18px;font-weight:bold;');
console.log('%c한림대학교 경영학과 / 디지털인문예술 전공', 'color:#60a5fa;font-size:13px;');

