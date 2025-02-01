document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.certificates-track');
    const cards = document.querySelectorAll('.certificate-card');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    let currentIndex = 0;
    let cardWidth = cards[0].offsetWidth;
    let maxIndex = cards.length - 1;

    // Update card width on resize
    window.addEventListener('resize', () => {
        cardWidth = cards[0].offsetWidth;
        updateCarousel();
    });

    function getVisibleCards() {
        if (window.innerWidth <= 425) {
            return 2; // Show 2 cards on small screens
        } else if (window.innerWidth <= 768) {
            return 2; // Show 2 cards on medium screens
        }
        return 3; // Show 3 cards on large screens
    }

    function updateCarousel() {
        const visibleCards = getVisibleCards();
        const gap = window.innerWidth <= 425 ? 8 : 16; // Smaller gap on mobile
        const cardWidth = track.querySelector('.certificate-card').offsetWidth;
        const offset = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        // Update button states
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevButton.disabled = currentIndex === 0;
        
        const maxIndex = cards.length - visibleCards;
        nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        nextButton.disabled = currentIndex >= maxIndex;
    }

    // Touch handling for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // minimum swipe distance
            if (diff > 0 && currentIndex < maxIndex) {
                currentIndex++;
            } else if (diff < 0 && currentIndex > 0) {
                currentIndex--;
            }
            updateCarousel();
        }
    }, { passive: true });

    // Auto-scroll every 3 seconds
    let autoScroll = setInterval(() => {
        if (currentIndex >= maxIndex) {
            currentIndex = -1;
        }
        updateCarousel();
    }, 3000);

    // Pause auto-scroll when hovering over carousel
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(autoScroll);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        autoScroll = setInterval(() => {
            if (currentIndex >= maxIndex) {
                currentIndex = -1;
            }
            updateCarousel();
        }, 3000);
    });

    // Initial button state
    updateButtons();

    // Get all project links
    const projectLinks = document.querySelectorAll('.project-link');
    const popup = document.getElementById('projectPopup');
    const closePopup = document.querySelector('.close-popup');

    // Add click event to all project links
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            popup.classList.add('active');
        });
    });

    // Close popup when clicking the close button
    closePopup.addEventListener('click', function() {
        popup.classList.remove('active');
    });

    // Close popup when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.classList.remove('active');
        }
    });

    // Update the profile modal functionality
    const profileIcon = document.querySelector('.custom-icon');
    const profileModal = document.getElementById('profileModal');
    const closeProfileBtn = document.querySelector('.close-profile');

    if (profileIcon) {
        profileIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Stop event bubbling
            profileModal.classList.add('active');
        });
    }

    // Close modal when clicking X button
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            profileModal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    // Prevent modal from closing when clicking inside
    profileModal.querySelector('.profile-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Add touch swipe to close for mobile
    let touchStart = 0;
    let touchEnd = 0;
    
    profileModal.addEventListener('touchstart', function(e) {
        touchStart = e.changedTouches[0].screenY;
    }, { passive: true });
    
    profileModal.addEventListener('touchend', function(e) {
        touchEnd = e.changedTouches[0].screenY;
        if (touchEnd - touchStart > 50) {
            profileModal.classList.remove('active');
        }
    }, { passive: true });

    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Disable particle animations on mobile
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.style.display = 'none';
        
        // Optimize scroll handlers
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(function() {
                updateScrollProgress();
            });
        }, { passive: true });
        
        // Add touch feedback
        document.addEventListener('touchstart', function(e) {
            const target = e.target;
            if (target.classList.contains('project-card') || 
                target.classList.contains('service-card') ||
                target.classList.contains('testimonial-card')) {
                target.style.opacity = '0.8';
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            const target = e.target;
            if (target.classList.contains('project-card') || 
                target.classList.contains('service-card') ||
                target.classList.contains('testimonial-card')) {
                target.style.opacity = '1';
            }
        }, { passive: true });
    }
});

function submitForm(e) {
    e.preventDefault();
    
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // Send to EmailJS
    const templateParams = {
        from_name: form.name.value,
        from_email: form.email.value,
        message: form.message.value,
        to_name: 'Aditya Kumar Sinha',
        reply_to: form.email.value
    };

    emailjs.send('service_2vzcvgj', 'template_jwevu0w', templateParams)
        .then(function(response) {
            // Show success message and TrustPilot popup
            toast.show('Thank you! Would you like to share your experience on TrustPilot?', 'success');
            showTrustPilotPopup();
            form.reset();
        })
        .catch(function(error) {
            toast.show('Failed to send message. Please try again.', 'error');
            console.error('FAILED...', error);
        })
        .finally(function() {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        });

    return false;
}

// Add TrustPilot popup function
function showTrustPilotPopup() {
    const popup = document.createElement('div');
    popup.className = 'trustpilot-popup';
    popup.innerHTML = `
        <div class="trustpilot-content">
            <h3>Share Your Experience</h3>
            <p>Thank you for your feedback! Would you like to share your experience on TrustPilot?</p>
            <div class="trustpilot-buttons">
                <button onclick="window.open('YOUR_TRUSTPILOT_REVIEW_URL', '_blank')" class="tp-yes">Yes, Leave a Review</button>
                <button onclick="closeTrustPilotPopup()" class="tp-no">Maybe Later</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Show popup with animation
    setTimeout(() => popup.classList.add('active'), 100);
}

// Add close function for TrustPilot popup
function closeTrustPilotPopup() {
    const popup = document.querySelector('.trustpilot-popup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    }
}

// Function to send data to Google Sheets
function sendToGoogleSheets(data) {
    // Replace with your Google Apps Script Web App URL
    const scriptURL = 'YOUR_GOOGLE_SCRIPT_URL';
    
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => console.log('Success:', response))
    .catch(error => console.error('Error:', error));
}

// Add this to your script.js
class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        // Style the canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.3';
        
        // Insert canvas as first element in body
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });

        // Create initial particles
        this.createParticles();
        
        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        const numberOfParticles = Math.floor(window.innerWidth * window.innerHeight / 10000);
        
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1,
                originalRadius: Math.random() * 2 + 1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Move particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // React to mouse
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;
            
            if (distance < maxDistance) {
                const scale = (maxDistance - distance) / maxDistance;
                particle.radius = particle.originalRadius * (1 + scale);
            } else {
                particle.radius = particle.originalRadius;
            }
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fill();
            
            // Draw connections
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle background
document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground();
});

// Add Typing Animation
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if(this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        let typeSpeed = 100;
        if(this.isDeleting) {
            typeSpeed /= 2;
        }

        if(!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if(this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize Typing Animation
document.addEventListener('DOMContentLoaded', () => {
    const txtElement = document.querySelector('.typing-text');
    const words = ['Full Stack Developer', 'UI/UX Designer', 'Problem Solver', 'Tech Enthusiast'];
    new TypeWriter(txtElement, words);
});

// Add scroll progress functionality
function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / scrollable) * 100;
    scrollProgress.style.width = `${progress}%`;
}

window.addEventListener('scroll', updateScrollProgress);

// Add smooth section reveal
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.startup, .certificates, .skills, .projects, .contact').forEach((section) => {
    section.classList.add('reveal-section');
    observer.observe(section);
});

// Simple cursor implementation
function initCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// Initialize cursor
document.addEventListener('DOMContentLoaded', initCursor);

// Add smooth parallax scrolling
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

document.addEventListener('DOMContentLoaded', initParallax);

// Animate skill progress bars when in view
function initSkillAnimation() {
    const skills = document.querySelectorAll('.skill-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress');
                const targetWidth = progressBar.dataset.progress || '0';
                progressBar.style.width = `${targetWidth}%`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skills.forEach(skill => observer.observe(skill));
}

document.addEventListener('DOMContentLoaded', initSkillAnimation);

// Toast notification system
class ToastNotification {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
}

const toast = new ToastNotification();

// Add 3D tilt effect to project cards
function init3DCards() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.05, 1.05, 1.05)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', init3DCards);

// Loading screen control
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
    });
}

// Initialize advanced features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize existing features
    initCursor();
    initParallax();
    initSkillAnimation();
    init3DCards();
    initLoadingScreen();
    initScrollTop();

    // Initialize new features
    new Lightbox();
    const audioFeedback = new AudioFeedback();
    const dynamicLoader = new DynamicLoader();

    // Initialize new advanced features
    new PageTransition();
    new MagneticButton('.magnetic-button');
    new TextEffects();

    // Show welcome toast after loading
    setTimeout(() => {
        toast.show('Welcome to my portfolio!', 'success');
    }, 2000);

    // Add hover sound effects
    document.querySelectorAll('a, button, .project-card').forEach(element => {
        element.addEventListener('mouseenter', () => audioFeedback.play('hover'));
        element.addEventListener('click', () => audioFeedback.play('click'));
    });

    // Add form success sound
    document.getElementById('contactForm').addEventListener('submit', () => {
        audioFeedback.play('success');
    });

    // Add enhanced hover effects
    document.querySelectorAll('.project-card, .skill-item').forEach(element => {
        element.classList.add('enhanced-hover');
    });

    // Initialize rating system
    initRatingSystem();
});

// Scroll to top functionality
function initScrollTop() {
    const scrollBtn = document.querySelector('.scroll-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.addEventListener('DOMContentLoaded', initScrollTop);

// Image Gallery Lightbox
class Lightbox {
    constructor() {
        this.createLightbox();
        this.initializeLightbox();
    }

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="" alt="Enlarged Image">
                <div class="lightbox-caption"></div>
                <button class="lightbox-prev">&lt;</button>
                <button class="lightbox-next">&gt;</button>
            </div>
        `;
        document.body.appendChild(lightbox);
        this.lightbox = lightbox;
    }

    initializeLightbox() {
        const images = document.querySelectorAll('.certificate-card img, .project-image img');
        let currentIndex = 0;
        const imageArray = Array.from(images);

        images.forEach((img, index) => {
            img.addEventListener('click', () => {
                currentIndex = index;
                this.showImage(img, imageArray);
            });
        });

        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            this.lightbox.classList.remove('active');
        });

        this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % imageArray.length;
            this.showImage(imageArray[currentIndex], imageArray);
        });

        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
            this.showImage(imageArray[currentIndex], imageArray);
        });
    }

    showImage(img, imageArray) {
        const lightboxImg = this.lightbox.querySelector('img');
        const caption = this.lightbox.querySelector('.lightbox-caption');
        lightboxImg.src = img.src;
        caption.textContent = img.alt;
        this.lightbox.classList.add('active');
    }
}

// Audio Feedback System
class AudioFeedback {
    constructor() {
        this.sounds = {
            hover: new Audio('path/to/hover.mp3'),
            click: new Audio('path/to/click.mp3'),
            success: new Audio('path/to/success.mp3')
        };
        
        this.initializeSounds();
    }

    initializeSounds() {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.2;
        });
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }
}

// Dynamic Content Loading
class DynamicLoader {
    constructor() {
        this.loadingBar = document.createElement('div');
        this.loadingBar.className = 'loading-bar';
        document.body.appendChild(this.loadingBar);
    }

    async loadContent(url) {
        this.loadingBar.style.display = 'block';
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.loadingBar.style.display = 'none';
            return data;
        } catch (error) {
            console.error('Loading error:', error);
            this.loadingBar.style.display = 'none';
            toast.show('Failed to load content', 'error');
        }
    }
}

// Page Transition System
class PageTransition {
    constructor() {
        this.overlay = this.createOverlay();
        this.initializeTransitions();
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    initializeTransitions() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                this.transitionTo(target);
            });
        });
    }

    async transitionTo(target) {
        this.overlay.classList.add('active');
        await this.wait(500);
        target.scrollIntoView({ behavior: 'smooth' });
        await this.wait(300);
        this.overlay.classList.remove('active');
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Magnetic Button Effect
class MagneticButton {
    constructor(elements) {
        this.elements = document.querySelectorAll(elements);
        this.initializeMagnetic();
    }

    initializeMagnetic() {
        this.elements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width/2;
                const y = e.clientY - rect.top - rect.height/2;
                
                element.style.transform = `
                    perspective(800px)
                    rotateX(${y/-10}deg)
                    rotateY(${x/10}deg)
                    translateX(${x/4}px)
                    translateY(${y/4}px)
                `;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
            });
        });
    }
}

// Dynamic Text Effects
class TextEffects {
    constructor() {
        this.initializeEffects();
    }

    initializeEffects() {
        // Scramble Text Effect
        document.querySelectorAll('.scramble-text').forEach(element => {
            this.createScrambleEffect(element);
        });

        // Wave Text Effect
        document.querySelectorAll('.wave-text').forEach(element => {
            this.createWaveEffect(element);
        });
    }

    createScrambleEffect(element) {
        const originalText = element.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        
        element.addEventListener('mouseover', () => {
            let iterations = 0;
            const interval = setInterval(() => {
                element.textContent = element.textContent.split('')
                    .map((char, index) => {
                        if(index < iterations) return originalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');
                
                iterations += 1/3;
                if(iterations >= originalText.length) clearInterval(interval);
            }, 30);
        });
    }

    createWaveEffect(element) {
        const text = element.textContent;
        element.innerHTML = text.split('').map(char => 
            `<span class="wave-char">${char}</span>`
        ).join('');
        
        const chars = element.querySelectorAll('.wave-char');
        chars.forEach((char, i) => {
            char.style.animationDelay = `${i * 0.1}s`;
        });
    }
}

// Star Rating System
function initRatingSystem() {
    const stars = document.querySelectorAll('.stars i');
    const ratingInput = document.getElementById('rating-value');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = e.target.dataset.rating;
            ratingInput.value = rating;
            currentRating = rating;

            // Update stars display
            stars.forEach(s => {
                const starRating = s.dataset.rating;
                s.classList.remove('fas', 'far', 'active', 'selected');
                if (starRating <= rating) {
                    s.classList.add('fas', 'active', 'selected');
                } else {
                    s.classList.add('far');
                }
            });

            // Play sound if available
            if (audioFeedback) {
                audioFeedback.play('click');
            }

            // Show toast
            toast.show(`Thank you! You rated ${rating} stars`, 'success');
        });

        // Hover effects
        star.addEventListener('mouseenter', (e) => {
            const rating = e.target.dataset.rating;
            if (rating > currentRating) {
                stars.forEach(s => {
                    const starRating = s.dataset.rating;
                    if (starRating <= rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    }
                });
            }
        });

        star.addEventListener('mouseleave', (e) => {
            stars.forEach(s => {
                const starRating = s.dataset.rating;
                s.classList.remove('fas');
                if (starRating <= currentRating) {
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.add('far');
                }
            });
        });
    });
}

// Improve modal behavior on mobile
function initMobileModal() {
    const modal = document.getElementById('profileModal');
    let touchStart = 0;
    let touchEnd = 0;
    
    modal.addEventListener('touchstart', function(e) {
        touchStart = e.changedTouches[0].screenY;
    }, { passive: true });
    
    modal.addEventListener('touchend', function(e) {
        touchEnd = e.changedTouches[0].screenY;
        if (touchEnd - touchStart > 50) {
            modal.classList.remove('active');
        }
    }, { passive: true });
}

// Initialize mobile optimizations
document.addEventListener('DOMContentLoaded', initMobileModal);

// Initialize carousel after DOM load
document.addEventListener('DOMContentLoaded', initCertificateCarousel);

function initCertificateCarousel() {
    const track = document.querySelector('.certificates-track');
    const cards = document.querySelectorAll('.certificate-card');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    let currentIndex = 0;

    function getVisibleCards() {
        if (window.innerWidth <= 425) {
            return 2; // Show 2 cards on small screens
        } else if (window.innerWidth <= 768) {
            return 2; // Show 2 cards on medium screens
        }
        return 3; // Show 3 cards on large screens
    }

    function updateCarousel() {
        const visibleCards = getVisibleCards();
        const gap = window.innerWidth <= 425 ? 8 : 16; // Smaller gap on mobile
        const cardWidth = track.querySelector('.certificate-card').offsetWidth;
        const offset = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        // Update button states
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevButton.disabled = currentIndex === 0;
        
        const maxIndex = cards.length - visibleCards;
        nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        nextButton.disabled = currentIndex >= maxIndex;
    }

    // Handle window resize
    window.addEventListener('resize', updateCarousel);

    // Navigation buttons
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        const visibleCards = getVisibleCards();
        const maxIndex = cards.length - visibleCards;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Initial setup
    updateCarousel();
} 