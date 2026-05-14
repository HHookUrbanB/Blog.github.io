/* ============================================
   Henry's Blog - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ---- Navigation 导航栏 ----
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // 滚动时改变导航栏样式
    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleNavScroll);
    
    // 移动端菜单切换
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
    
    // 点击菜单链接后关闭菜单
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    });
    
    // ---- Scroll to Top 返回顶部 ----
    const scrollTopBtn = document.getElementById('scroll-top');
    
    function handleScrollTopVisibility() {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', handleScrollTopVisibility);
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ---- Smooth Scroll 平滑滚动 ----
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ---- External Links 外部链接 ----
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
        if (!link.hostname === window.location.hostname) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    // ---- Reading Progress 阅读进度 ----
    const postContent = document.getElementById('post-content');
    if (postContent) {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--color-primary);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', function() {
            const contentTop = postContent.offsetTop;
            const contentHeight = postContent.offsetHeight;
            const scrolled = window.scrollY - contentTop;
            const progress = Math.min(Math.max(scrolled / contentHeight * 100, 0), 100);
            progressBar.style.width = progress + '%';
        });
    }
    
});
