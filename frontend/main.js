// Enhanced Background Video System
document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.getElementById('hero-video');
    const videoContainer = document.getElementById('hero-video-container');
    const videoOverlay = document.getElementById('video-overlay');
    const videoFallback = document.getElementById('video-fallback');
    const heroContent = document.getElementById('hero-content');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const overlayBtns = document.querySelectorAll('.overlay-btn');
    
    let isVideoLoaded = false;
    let isMobile = window.innerWidth <= 768;
    let connectionSpeed = 'high';
    
    // 1. PERFORMANCE IMPROVEMENTS
    // Detect connection speed
    function detectConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                connectionSpeed = 'low';
            } else if (connection.effectiveType === '3g') {
                connectionSpeed = 'medium';
            } else {
                connectionSpeed = 'high';
            }
        }
        
        // Also check based on device/screen size
        if (isMobile || window.devicePixelRatio < 2) {
            connectionSpeed = 'medium';
        }
    }
    
    // Lazy loading implementation
    function initVideoLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isVideoLoaded) {
                    loadVideo();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(videoContainer);
    }
    
    // Load appropriate video quality based on connection
    function loadVideo() {
        if (connectionSpeed === 'low' || isMobile) {
            // Show static image instead of video on slow connections/mobile
            showFallbackImage();
            return;
        }
        
        // Preload video based on quality
        const sources = heroVideo.querySelectorAll('source');
        let selectedSource = sources[0]; // Default to high quality\n        \n        if (connectionSpeed === 'medium') {\n            const lowQualitySource = Array.from(sources).find(s => s.dataset.quality === 'low');\n            if (lowQualitySource) {\n                selectedSource = lowQualitySource;\n            }\n        }\n        \n        heroVideo.src = selectedSource.src;\n        heroVideo.load();\n        \n        // Add loading event listeners\n        heroVideo.addEventListener('loadeddata', handleVideoLoaded);\n        heroVideo.addEventListener('error', handleVideoError);\n        \n        isVideoLoaded = true;\n    }\n    \n    function handleVideoLoaded() {\n        heroVideo.classList.add('loaded');\n        if (connectionSpeed === 'high') {\n            heroVideo.classList.add('high-quality');\n        }\n        \n        // Start parallax effect\n        if (!isMobile) {\n            initParallaxEffect();\n        }\n    }\n    \n    function handleVideoError() {\n        console.warn('Video failed to load, showing fallback image');\n        showFallbackImage();\n    }\n    \n    function showFallbackImage() {\n        heroVideo.style.display = 'none';\n        videoFallback.style.display = 'block';\n    }\n    \n    // 2. PARALLAX SCROLLING EFFECT\n    function initParallaxEffect() {\n        let ticking = false;\n        \n        function updateParallax() {\n            const scrolled = window.pageYOffset;\n            const rate = scrolled * -0.3; // Negative for upward movement\n            \n            videoContainer.style.setProperty('--parallax-y', `${rate}px`);\n            videoContainer.classList.add('parallax');\n            \n            ticking = false;\n        }\n        \n        function requestParallaxUpdate() {\n            if (!ticking && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {\n                requestAnimationFrame(updateParallax);\n                ticking = true;\n            }\n        }\n        \n        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });\n    }\n    \n    // 3. MOBILE OPTIMIZATION\n    function initMobileOptimization() {\n        if (isMobile) {\n            // Pause video on mobile to save battery\n            if (heroVideo && !heroVideo.paused) {\n                heroVideo.pause();\n            }\n            \n            // Reduce video quality on mobile\n            videoOverlay.className = 'video-overlay dark'; // Add dark overlay for better text readability\n            \n            // Hide video controls on mobile\n            const videoControls = document.getElementById('video-controls');\n            if (videoControls) {\n                videoControls.style.display = 'none';\n            }\n            \n            // Add touch-friendly interactions\n            let touchStartY = 0;\n            heroContent.addEventListener('touchstart', function(e) {\n                touchStartY = e.touches[0].clientY;\n            }, { passive: true });\n            \n            heroContent.addEventListener('touchend', function(e) {\n                const touchEndY = e.changedTouches[0].clientY;\n                const diff = touchStartY - touchEndY;\n                \n                // Swipe up to scroll to content\n                if (diff > 50) {\n                    document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' });\n                }\n            }, { passive: true });\n        }\n    }\n    \n    // 4. INTERACTIVE ELEMENTS\n    function initVideoControls() {\n        if (isMobile) return; // Skip on mobile\n        \n        // Play/Pause functionality\n        if (playPauseBtn && heroVideo) {\n            playPauseBtn.addEventListener('click', function() {\n                if (heroVideo.paused) {\n                    heroVideo.play();\n                    this.innerHTML = '<i class=\"fas fa-pause\"></i>';\n                } else {\n                    heroVideo.pause();\n                    this.innerHTML = '<i class=\"fas fa-play\"></i>';\n                }\n            });\n        }\n        \n        // Mute/Unmute functionality  \n        if (muteBtn && heroVideo) {\n            muteBtn.addEventListener('click', function() {\n                if (heroVideo.muted) {\n                    heroVideo.muted = false;\n                    this.innerHTML = '<i class=\"fas fa-volume-up\"></i>';\n                } else {\n                    heroVideo.muted = true;\n                    this.innerHTML = '<i class=\"fas fa-volume-mute\"></i>';\n                }\n            });\n        }\n        \n        // Overlay selector functionality\n        overlayBtns.forEach(btn => {\n            btn.addEventListener('click', function() {\n                // Remove active class from all buttons\n                overlayBtns.forEach(b => b.classList.remove('active'));\n                \n                // Add active class to clicked button\n                this.classList.add('active');\n                \n                // Apply overlay\n                const overlayType = this.dataset.overlay;\n                videoOverlay.className = `video-overlay ${overlayType}`;\n                \n                // Store preference\n                localStorage.setItem('videoOverlay', overlayType);\n            });\n        });\n        \n        // Load saved overlay preference\n        const savedOverlay = localStorage.getItem('videoOverlay');\n        if (savedOverlay) {\n            const savedBtn = document.querySelector(`[data-overlay=\"${savedOverlay}\"]`);\n            if (savedBtn) {\n                savedBtn.click();\n            }\n        }\n    }\n    \n    // 5. BATTERY SAVING FEATURES\n    function initBatterySaving() {\n        // Pause video when tab is not visible\n        document.addEventListener('visibilitychange', function() {\n            if (heroVideo) {\n                if (document.hidden) {\n                    if (!heroVideo.paused) {\n                        heroVideo.pause();\n                        heroVideo.dataset.wasPlaying = 'true';\n                    }\n                } else {\n                    if (heroVideo.dataset.wasPlaying === 'true' && !isMobile) {\n                        heroVideo.play();\n                        delete heroVideo.dataset.wasPlaying;\n                    }\n                }\n            }\n        });\n        \n        // Reduce video playback on low battery (if supported)\n        if ('getBattery' in navigator) {\n            navigator.getBattery().then(function(battery) {\n                function updateVideoBasedOnBattery() {\n                    if (battery.level < 0.2 && !battery.charging) {\n                        // Low battery and not charging - pause video\n                        if (heroVideo && !heroVideo.paused) {\n                            heroVideo.pause();\n                            console.log('Video paused due to low battery');\n                        }\n                    }\n                }\n                \n                battery.addEventListener('levelchange', updateVideoBasedOnBattery);\n                battery.addEventListener('chargingchange', updateVideoBasedOnBattery);\n                updateVideoBasedOnBattery(); // Initial check\n            }).catch(() => {\n                // Battery API not supported, continue normally\n            });\n        }\n    }\n    \n    // 6. SMOOTH VIDEO TRANSITIONS\n    function initVideoTransitions() {\n        // Add smooth transition when video loads\n        if (heroVideo) {\n            heroVideo.addEventListener('loadstart', function() {\n                this.style.transition = 'opacity 0.5s ease, filter 0.5s ease';\n            });\n            \n            heroVideo.addEventListener('canplaythrough', function() {\n                this.style.opacity = '0.3';\n                this.style.filter = 'blur(1px) grayscale(10%)';\n            });\n        }\n        \n        // Add entrance animation for hero content\n        setTimeout(() => {\n            if (heroContent) {\n                heroContent.classList.add('animate-in');\n            }\n        }, 800);\n    }\n    \n    // 7. RESPONSIVE BEHAVIOR\n    function handleResize() {\n        const wasIsMobile = isMobile;\n        isMobile = window.innerWidth <= 768;\n        \n        if (wasIsMobile !== isMobile) {\n            // Mobile state changed, reinitialize relevant features\n            if (isMobile) {\n                initMobileOptimization();\n            } else {\n                // Switching from mobile to desktop\n                if (heroVideo && heroVideo.paused && isVideoLoaded) {\n                    heroVideo.play();\n                }\n            }\n        }\n    }\n    \n    window.addEventListener('resize', handleResize, { passive: true });\n    \n    // INITIALIZATION SEQUENCE\n    function init() {\n        detectConnectionSpeed();\n        initVideoLazyLoading();\n        initMobileOptimization();\n        initVideoControls();\n        initBatterySaving();\n        initVideoTransitions();\n        \n        console.log('Enhanced video system initialized', {\n            isMobile,\n            connectionSpeed,\n            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches\n        });\n    }\n    \n    // Start the system\n    init();\n});
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const userComments = document.getElementById('user-comments');

if (commentForm && commentInput && userComments) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = commentInput.value.trim();
        if (!comment) return;
        // Send comment to backend (to be implemented)
        // For now, just add to UI
        const div = document.createElement('div');
        div.textContent = comment;
        userComments.appendChild(div);
        commentInput.value = '';
    });
}

// TODO: Fetch comments from backend and display

// Upload media files
const uploadForm = document.getElementById('upload-form');
const mediaFileInput = document.getElementById('media-file');

if (uploadForm && mediaFileInput) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const files = mediaFileInput.files;
        if (!files.length) return;
        const formData = new FormData();
        for (let file of files) {
            formData.append('media', file);
        }
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('Upload successful!');
                mediaFileInput.value = '';
                // TODO: Refresh media display
            } else {
                alert('Upload failed.');
            }
        } catch (err) {
            alert('Error uploading file.');
        }
    });
}

// Media switch system
const showPhotosBtn = document.getElementById('show-photos');
const showVideosBtn = document.getElementById('show-videos');
const photosDiv = document.getElementById('photos');
const videosDiv = document.getElementById('videos');

showPhotosBtn.addEventListener('click', () => {
    showPhotosBtn.classList.add('active');
    showVideosBtn.classList.remove('active');
    photosDiv.style.display = '';
    videosDiv.style.display = 'none';
});
showVideosBtn.addEventListener('click', () => {
    showVideosBtn.classList.add('active');
    showPhotosBtn.classList.remove('active');
    videosDiv.style.display = '';
    photosDiv.style.display = 'none';
});

// Fetch and display uploaded media
async function loadMedia() {
    try {
        const res = await fetch('/api/media');
        const media = await res.json();
        const photosDiv = document.getElementById('photos');
        const videosDiv = document.getElementById('videos');
        photosDiv.innerHTML = '';
        videosDiv.innerHTML = '';
        let hasImage = false, hasVideo = false;
        media.forEach(file => {
            if (file.type === 'image') {
                hasImage = true;
                const img = document.createElement('img');
                img.src = file.url;
                img.alt = file.filename;
                img.style.maxWidth = '320px';
                img.style.maxHeight = '220px';
                img.style.width = '100%';
                img.style.borderRadius = '8px';
                img.style.boxShadow = '0 2px 8px rgba(30,42,56,0.10)';
                img.style.display = 'block';
                img.style.margin = '0 auto 1rem auto';
                photosDiv.appendChild(img);
            } else if (file.type === 'video') {
                hasVideo = true;
                const video = document.createElement('video');
                video.src = file.url;
                video.controls = true;
                video.style.maxWidth = '320px';
                video.style.maxHeight = '220px';
                video.style.width = '100%';
                video.style.borderRadius = '8px';
                video.style.boxShadow = '0 2px 8px rgba(30,42,56,0.10)';
                video.style.display = 'block';
                video.style.margin = '0 auto 1rem auto';
                videosDiv.appendChild(video);
            }
        });
        if (!hasImage) {
            photosDiv.innerHTML = '<p style="text-align:center;color:#888;">No photos uploaded yet.</p>';
        }
        if (!hasVideo) {
            videosDiv.innerHTML = '<p style="text-align:center;color:#888;">No videos uploaded yet.</p>';
        }
    } catch (err) {
        document.getElementById('photos').innerHTML = '<p style="color:red;">Error loading media.</p>';
        document.getElementById('videos').innerHTML = '<p style="color:red;">Error loading media.</p>';
    }
}
// Load media on page load
window.addEventListener('DOMContentLoaded', loadMedia);

// Testimonials Animation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Initialize testimonial cards with fade-in animation
    testimonialCards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        // Observe for scroll animation
        observer.observe(card);
        
        // Add click interaction
        card.addEventListener('click', function() {
            // Add a subtle bounce effect on click
            this.style.transform = 'translateY(-5px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
        
        // Randomize dot animation delays for more dynamic feel
        const statusDot = card.querySelector('.status-dot');
        if (statusDot) {
            statusDot.style.animationDelay = `${Math.random() * 2}s`;
        }
    });
    
    // Add floating animation to profile images
    const profiles = document.querySelectorAll('.testimonial-profile');
    profiles.forEach((profile, index) => {
        profile.style.animation = `float ${3 + (index % 3)}s ease-in-out infinite`;
        profile.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Add CSS for floating animation dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
});

// Contact form (Formspree handles submission, no JS needed)

// Enhanced Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.contact-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Success
                    contactStatus.className = 'success';
                    contactStatus.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully. I\'ll get back to you soon!';
                    contactForm.reset();
                    
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => {
                        contactStatus.style.display = 'none';
                    }, 5000);
                    
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                // Error
                contactStatus.className = 'error';
                contactStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Sorry, there was an error sending your message. Please try again or email me directly.';
            }
            
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
        
        // Add real-time validation feedback
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        function validateField(field) {
            const isValid = field.checkValidity();
            
            if (isValid) {
                field.style.borderColor = '#10b981';
                field.classList.remove('error');
            } else {
                field.style.borderColor = '#ef4444';
                field.classList.add('error');
            }
        }
    }
});

// Media switch system and other existing functionality continues below...
