import re

with open('projects.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Hero and About sections with a simple Sub-hero header
hero_about_pattern = re.compile(r'<!-- ========== HERO ========== -->.*?<!-- ========== PROJECTS ========== -->', re.DOTALL)

sub_hero = '''<!-- ========== SUB HERO ========== -->
  <section class="sub-hero" style="padding-top: 180px; padding-bottom: 40px; text-align: center; background: linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%);">
    <div class="container">
      <div class="hero-tag reveal-up">All Projects</div>
      <h1 class="section-title reveal-up">모든 프로젝트</h1>
      <p class="section-desc reveal-up">지금까지 진행한 모든 과제와 프로젝트를 모아둔 공간입니다.</p>
    </div>
  </section>

  <!-- ========== PROJECTS ========== -->'''

content = hero_about_pattern.sub(sub_hero, content)

# Remove Gallery, Learning, Contact sections
gallery_contact_pattern = re.compile(r'<!-- ========== GALLERY ========== -->.*?<!-- Footer -->', re.DOTALL)

footer = '<!-- Footer -->'

content = gallery_contact_pattern.sub(footer, content)

# Write back to projects.html
with open('projects.html', 'w', encoding='utf-8') as f:
    f.write(content)
