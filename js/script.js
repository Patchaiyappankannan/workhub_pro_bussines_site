// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
    // First, remove active class from ALL nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    let current = '';
    const scrollPosition = window.scrollY;
    
    // If we're at the top of the page, make home active
    if (scrollPosition < 100) {
        current = 'home';
    } else {
        // Find the section that is most visible in the viewport
        let bestSection = '';
        let maxVisibility = 0;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionBottom = sectionTop + sectionHeight;
            
            // Calculate how much of the section is visible
            const visibleTop = Math.max(scrollPosition, sectionTop);
            const visibleBottom = Math.min(scrollPosition + window.innerHeight, sectionBottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibilityRatio = visibleHeight / Math.min(sectionHeight, window.innerHeight);
            
            // Only consider sections that are at least 30% visible
            if (visibilityRatio > 0.3 && visibilityRatio > maxVisibility) {
                maxVisibility = visibilityRatio;
                bestSection = section.getAttribute('id');
            }
        });
        
        current = bestSection;
    }

    // Add active class to only the current section's nav link
    if (current) {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
}

// Throttled scroll event for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateActiveNavLink, 10);
});

// Initial call to set active state on page load
updateActiveNavLink();

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
    try {
        // Open default mail client with prefilled fields
        const to = 'info@workhubpro.in';
        const mailSubject = `[Contact] ${subject.trim()} — ${name.trim()}`;
        const mailBody = `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\n\nMessage:\n${message.trim()}`;
        const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

        const wasVisible = document.visibilityState === 'visible';
        window.location.href = mailtoUrl;

        // If no mail handler is configured, provide a Gmail fallback
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
        setTimeout(() => {
            if (document.visibilityState === 'visible' && wasVisible) {
                window.open(gmailUrl, '_blank', 'noopener');
                showNotification('If your email app did not open, we opened Gmail compose in a new tab.', 'info');
            }
        }, 1200);
        
        showNotification('Opening your email client…', 'success');
        this.reset();
    } catch (error) {
        console.error('Contact form mailto error:', error);
        showNotification('Unable to open your email client. Please email info@workhubpro.in.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .product-card, .about-text, .contact-info').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h4');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + (counter.textContent.includes('%') ? '%' : '+');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = counter.textContent;
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Product Card Interactions
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
        this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (this.classList.contains('featured')) {
            this.style.transform = 'scale(1.05)';
        } else {
            this.style.transform = 'translateY(0) scale(1)';
        }
        this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    });
    
    // Click to show product details
    card.addEventListener('click', function() {
        const product = this.getAttribute('data-product');
        showProductModal(product);
    });
});

// Testimonials Slider
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.testimonial-prev');
const nextBtn = document.querySelector('.testimonial-next');

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
}

if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);
if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentTestimonial = index;
        showTestimonial(currentTestimonial);
    });
});

// Auto-rotate testimonials
setInterval(nextTestimonial, 5000);

// FAQ Accordion
document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', function() {
        const faqItem = this.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Product Modal
function showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2>${getProductTitle(product)}</h2>
                <p>${getProductDescription(product)}</p>
                <div class="modal-features">
                    ${getProductFeatures(product).map(feature => `<span>${feature}</span>`).join('')}
                </div>
                <div class="modal-price">
                    <span class="price">${getProductPrice(product)}</span>
                    <span class="period">/month</span>
                </div>
                <button class="btn btn-primary">Get Started</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });
}

function getProductTitle(product) {
    const titles = {
        'workhub-manager': 'WorkHub Manager',
        'analytics-pro': 'Analytics Pro',
        'team-connect': 'Team Connect'
    };
    return titles[product] || 'Product';
}

function getProductDescription(product) {
    const descriptions = {
        'workhub-manager': 'Complete project management solution with team collaboration features. Streamline your workflow and boost productivity.',
        'analytics-pro': 'Advanced business intelligence and reporting dashboard. Get insights that drive growth.',
        'team-connect': 'Communication platform for seamless team collaboration. Connect your team like never before.'
    };
    return descriptions[product] || 'Product description';
}

function getProductFeatures(product) {
    const features = {
        'workhub-manager': ['Task Management', 'Team Chat', 'File Sharing', 'Project Tracking', 'Time Management'],
        'analytics-pro': ['Real-time Reports', 'Custom Dashboards', 'Data Export', 'Predictive Analytics', 'KPI Tracking'],
        'team-connect': ['Video Calls', 'Screen Sharing', 'Documentation', 'Team Channels', 'Mobile App']
    };
    return features[product] || [];
}

function getProductPrice(product) {
    const prices = {
        'workhub-manager': '$29',
        'analytics-pro': '$49',
        'team-connect': '$19'
    };
    return prices[product] || '$0';
}

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .product-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .modal-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        max-width: 500px;
        width: 100%;
        position: relative;
        animation: slideInUp 0.3s ease;
    }
    
    .modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        font-size: 30px;
        cursor: pointer;
        color: #999;
        transition: color 0.3s ease;
    }
    
    .modal-close:hover {
        color: #333;
    }
    
    .modal-content h2 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 20px;
    }
    
    .modal-content p {
        color: var(--text-light);
        margin-bottom: 30px;
        line-height: 1.6;
    }
    
    .modal-features {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 30px;
    }
    
    .modal-features span {
        background: var(--light-bg);
        color: var(--primary-blue);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid var(--border-light);
    }
    
    .modal-price {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 5px;
        margin-bottom: 30px;
    }
    
    .modal-price .price {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-blue);
    }
    
    .modal-price .period {
        font-size: 1rem;
        color: var(--text-light);
        font-weight: 500;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(modalStyles);

// Enhanced Service Card Interactions
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.05)';
        this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
        
        // Animate icon
        const icon = this.querySelector('.service-icon');
        icon.style.transform = 'rotate(10deg) scale(1.1)';
        icon.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.3)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        
        // Reset icon
        const icon = this.querySelector('.service-icon');
        icon.style.transform = 'rotate(0deg) scale(1)';
        icon.style.boxShadow = 'none';
    });
});

// Interactive Chatbot
class SiteKnowledge {
    constructor() {
        this.entries = [];
        this.buildFromPage();
    }
    buildFromPage() {
        const add = (title, text, link) => {
            const content = (text || '').replace(/\s+/g, ' ').trim();
            if (!content) return;
            this.entries.push({ title, content, link, tokens: this.tokenize(`${title} ${content}`) });
        };
        const about = document.querySelector('#about .about-text');
        if (about) add('About', about.textContent, '#about');
        document.querySelectorAll('#services .service-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent || 'Service';
            const text = card.querySelector('p')?.textContent || '';
            add(`Service - ${title}`, text, '#services');
        });
        document.querySelectorAll('#products .product-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent || 'Product';
            const text = card.querySelector('p')?.textContent || '';
            add(`Product - ${title}`, text, '#products');
        });
        document.querySelectorAll('#faq .faq-item').forEach(item => {
            const q = item.querySelector('.faq-header h3')?.textContent || 'Question';
            const a = item.querySelector('.faq-body p')?.textContent || '';
            add(`FAQ - ${q}`, a, '#faq');
        });
        // Contact info
        const contact = document.querySelector('#contact');
        if (contact) add('Contact', contact.textContent, '#contact');
        // Privacy summary
        const privacy = document.querySelector('#privacy-policy');
        if (privacy) add('Privacy Policy', privacy.textContent, '#privacy-policy');
    }
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t && t.length > 2 && !this.stopwords.has(t));
    }
    score(queryTokens, entry) {
        let overlap = 0;
        const set = new Set(entry.tokens);
        queryTokens.forEach(t => { if (set.has(t)) overlap++; });
        // favor longer, informative entries slightly
        const lengthBoost = Math.min(1.0, entry.tokens.length / 80);
        return overlap + lengthBoost;
    }
    findBest(query) {
        const queryTokens = this.tokenize(query);
        if (queryTokens.length === 0 || this.entries.length === 0) return null;
        let best = null;
        let bestScore = 0;
        for (const entry of this.entries) {
            const s = this.score(queryTokens, entry);
            if (s > bestScore) { best = entry; bestScore = s; }
        }
        if (bestScore < 2) return null; // threshold to avoid weak matches
        return best;
    }
}
SiteKnowledge.prototype.stopwords = new Set([
    'the','and','for','you','your','with','that','this','our','are','from','have','has','was','were','will','can','how','what','why','when','who','about','into','over','under','all','any','but','not','out','say','says','use','used','using','get','got','gotten','more','most','other','some','such','than','then','them','they','their','there','here','also','just','like'
]);

class Chatbot {
    constructor() {
        this.toggle = document.getElementById('chatbotToggle');
        this.window = document.getElementById('chatbotWindow');
        this.close = document.getElementById('chatbotClose');
        this.messages = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.send = document.getElementById('chatbotSend');
        this.isOpen = false;
        this.isTyping = false;
        this.conversation = []; // short-term memory of the last messages
        this.maxMemory = 10;
        this.knowledge = new SiteKnowledge();
        
        this.init();
    }
    
    init() {
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.close.addEventListener('click', () => this.closeChat());
        this.send.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Auto-open after 3 seconds
        setTimeout(() => {
            if (!this.isOpen) {
                this.toggleChat();
            }
        }, 3000);
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('active', this.isOpen);
        this.toggle.classList.toggle('hidden', this.isOpen);
        
        if (this.isOpen) {
            this.input.focus();
            this.hideBadge();
        }
    }
    
    closeChat() {
        this.isOpen = false;
        this.window.classList.remove('active');
        this.toggle.classList.remove('hidden');
    }
    
    hideBadge() {
        const badge = document.querySelector('.chatbot-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }
    
    sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;
        
        this.addMessage(message, 'user');
        this.remember('user', message);
        this.input.value = '';
        
        // Simulate bot response with human-like delays
        const plannedResponse = this.generateResponse(message);
        const initialDelay = 300 + Math.random() * 400;
        setTimeout(() => {
            this.showTyping();
            const typingDelay = this.computeTypingDelay(plannedResponse);
            setTimeout(() => {
                this.hideTyping();
                this.addMessage(plannedResponse, 'bot');
                this.remember('bot', plannedResponse);
            }, typingDelay);
        }, initialDelay);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p>${text}</p>
            <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        `;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.messages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    showTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTyping() {
        const typingMessage = this.messages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
        this.isTyping = false;
    }
    
    computeTypingDelay(text) {
        const base = 500; // base think time
        const charsPerSecond = 12 + Math.random() * 8; // 12-20 cps
        const duration = base + (text.length / charsPerSecond) * 1000;
        return Math.min(3500, Math.max(700, duration));
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        const lastUser = [...this.conversation].reverse().find(m => m.role === 'user');
        const askedFollowUp = lastUser && lastUser.text && (lowerMessage === 'yes' || lowerMessage === 'yeah' || lowerMessage === 'sure' || lowerMessage === 'ok');
        
        if (askedFollowUp && this.conversation.length > 1) {
            // context-aware follow-up
            const previousInfo = this.conversation.slice(-3).map(m => m.text).join(' ');
            return `Great! To tailor things better, could you share a bit more about your needs regarding "${previousInfo.substring(0, 60)}"?`;
        }
        
        // Explicit intent: contacting the team
        const contactIntent = /(reach|reach out|get in touch|talk|speak|connect|contact|call|email|phone).*\b(team|you|support|company)\b|\b(team|support)\b.*(reach|contact|call|email|phone)/i;
        if (contactIntent.test(message)) {
            return this.pick([
                "You can reach our team at +91 63804 47105 or +91 909204 2692, or email info@workhubpro.in. We’re available 24/7.",
                "Happy to connect — call +91 63804 47105 or +91 909204 2692, or email info@workhubpro.in anytime.",
                "Fastest way: +91 63804 47105 / +91 909204 2692 or info@workhubpro.in. Prefer another channel?"
            ]);
        }
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return this.pick([
                "Hey! Thanks for stopping by. How can I help today?",
                "Hi there — I'm here to help with anything WorkHub Pro. What are you looking for?",
                "Hello! Happy to assist. Are you exploring services, pricing, or something else?"
            ]);
        } else if (lowerMessage.includes('service') || lowerMessage.includes('services')) {
            return this.pick([
                "We cover web and mobile development, cloud, security, analytics, and 24/7 support. Which area should we focus on?",
                "From websites and apps to cloud and cybersecurity — we've got you. What do you need right now?",
                "End-to-end solutions: web, mobile, cloud, analytics, and support. What are your goals?"
            ]);
        } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return this.pick([
                "Pricing depends on scope. Starter plans begin at $19/month. Want me to arrange a custom quote?",
                "We tailor pricing to fit your goals. Plans start at $19/month — shall I connect you with our team?",
                "Happy to help with costs. Give me a bit about your project and I'll estimate."
            ]);
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
            return this.pick([
                "You can reach us at +91 63804 47105 or +91 909204 2692, or email info@workhubpro.in — we're here 24/7.",
                "Absolutely. Call +91 63804 47105 or +91 909204 2692, or email info@workhubpro.in and we’ll help right away.",
                "Sure — +91 63804 47105 / +91 909204 2692 or info@workhubpro.in. What time works for you?"
            ]);
        } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
            return this.pick([
                "I’ve got you. Tell me what you’re trying to do and I’ll guide you.",
                "Happy to help — services, pricing, timelines… what should we start with?",
                "Sure thing. What are you working on right now?"
            ]);
        } else {
            // Dynamic site-aware answer
            const best = this.knowledge.findBest(message);
            if (best) {
                const snippet = best.content.length > 220 ? best.content.slice(0, 220) + '…' : best.content;
                return `${snippet} ${best.link ? `(See ${best.title} → ${best.link})` : ''}`.trim();
            }
            const softeners = ['Got it.', 'Sounds good.', 'Thanks for the context.', 'Understood.'];
            const prompt = this.pick([
                'Could you share a bit more detail?',
                'What outcome are you aiming for?',
                'What’s the budget or timeline you have in mind?',
                'Which part is most important to you?'
            ]);
            return `${this.pick(softeners)} ${prompt}`;
        }
    }
    
    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    remember(role, text) {
        this.conversation.push({ role, text, time: Date.now() });
        if (this.conversation.length > this.maxMemory) {
            this.conversation.shift();
        }
    }
    
    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }
}

// Floating Action Button
class FloatingActionButton {
    constructor() {
        this.fabMain = document.getElementById('fabMain');
        this.fabMenu = document.querySelector('.fab-menu');
        this.fabItems = document.querySelectorAll('.fab-item');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.fabMain.addEventListener('click', () => this.toggleMenu());
        
        this.fabItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleAction(action);
                this.closeMenu();
            });
        });
    }
    
    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.fabMain.classList.toggle('active', this.isOpen);
        this.fabMenu.classList.toggle('active', this.isOpen);
    }
    
    closeMenu() {
        this.isOpen = false;
        this.fabMain.classList.remove('active');
        this.fabMenu.classList.remove('active');
    }
    
    handleAction(action) {
        switch(action) {
            case 'contact':
                document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'email':
                window.location.href = 'mailto:info@workhubpro.in';
                break;
            case 'chat':
                const chatbot = new Chatbot();
                chatbot.toggleChat();
                break;
        }
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particlesContainer');
        this.particles = [];
        this.particleCount = 50;
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const delay = Math.random() * 6;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.animationDelay = delay + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }
    
    animate() {
        // Particles are animated via CSS
        // This method can be used for additional JavaScript animations
    }
}

// Scroll Animation Observer
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, this.observerOptions);
        
        this.init();
    }
    
    init() {
        // Add animation classes to elements
        const elementsToAnimate = document.querySelectorAll('.service-card, .product-card, .about-text, .contact-info, .testimonial-card, .faq-item');
        
        elementsToAnimate.forEach(el => {
            el.classList.add('animate-on-scroll');
            this.observer.observe(el);
        });
    }
}

// Enhanced Text Animations
class TextAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.animateHeroText();
        this.animateCounters();
    }
    
    animateHeroText() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            setTimeout(typeWriter, 1000);
        }
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('.stat h4');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current) + (counter.textContent.includes('%') ? '%' : '+');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = counter.textContent;
                }
            };
            
            // Trigger when counter is visible
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        counterObserver.unobserve(entry.target);
                    }
                });
            });
            
            counterObserver.observe(counter);
        });
    }
}

// Global function to open chatbot (floating chatbot)
function openChatbot() {
    const chatbot = document.querySelector('.chatbot-window');
    if (chatbot) {
        chatbot.classList.add('active');
        const input = document.getElementById('chatbotInput');
        if (input) input.focus();
    }
}

// Footer Interactive Features
class FooterInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.initBackToTop();
        this.initNewsletter();
        this.initStatsAnimation();
        this.initFooterLinks();
    }
    
    initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.visibility = 'visible';
                } else {
                    backToTopBtn.style.opacity = '0';
                    backToTopBtn.style.visibility = 'hidden';
                }
            });
            
            // Smooth scroll to top
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
    
    initNewsletter() {
        const newsletterForm = document.querySelector('.newsletter');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = newsletterForm.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                const submitBtn = newsletterForm.querySelector('button[type="submit"]');
                
                if (!email) {
                    this.showNotification('Please enter your email address', 'error');
                    return;
                }
                
                if (!isValidEmail(email)) {
                    this.showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                // Show loading state
                const originalContent = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;
                
                try {
                    // Choose API base based on environment to avoid localhost calls in production
                    const apiBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                        ? 'http://localhost:'
                        : 'https://workhubpro.in';
                    const response = await fetch(`${apiBase}/api/newsletter/subscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            source: 'website'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.showNotification(data.message, 'success');
                        newsletterForm.reset();
                    } else {
                        this.showNotification(data.message || 'Failed to subscribe. Please try again.', 'error');
                    }
                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                    // Fallback message that works across devices and HTTPS
                    this.showNotification('Network error. Please try again later or email info@workhubpro.in.', 'error');
                } finally {
                    // Reset button state
                    submitBtn.innerHTML = originalContent;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    
    initStatsAnimation() {
        const stats = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    }
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    initFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer-link');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // External link
                    window.open(href, '_blank');
                }
            });
        });
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Privacy Policy Accordion
class PrivacyAccordion {
    constructor() {
        this.accordionItems = document.querySelectorAll('.privacy-item');
        this.expandAllBtn = document.getElementById('expandAll');
        this.init();
    }
    
    init() {
        // Add click listeners to headers
        this.accordionItems.forEach(item => {
            const header = item.querySelector('.privacy-header');
            header.addEventListener('click', () => this.toggleItem(item));
        });
        
        // Expand All button
        if (this.expandAllBtn) {
            this.expandAllBtn.addEventListener('click', () => this.toggleAll());
        }
        
        // Initialize with first item open
        if (this.accordionItems.length > 0) {
            this.accordionItems[0].classList.add('active');
        }
    }
    
    toggleItem(item) {
        const isActive = item.classList.contains('active');
        
        // Close all items
        this.accordionItems.forEach(accordionItem => {
            accordionItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    }
    
    toggleAll() {
        const allActive = Array.from(this.accordionItems).every(item => 
            item.classList.contains('active')
        );
        
        this.accordionItems.forEach(item => {
            if (allActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
        
        // Update button text
        if (this.expandAllBtn) {
            this.expandAllBtn.textContent = allActive ? 'Expand All' : 'Collapse All';
        }
    }
}

// Custom Cursor System
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorFollower = document.querySelector('.cursor-follower');
        this.cursorText = document.querySelector('.cursor-text');
        this.mouse = { x: 0, y: 0 };
        this.follower = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        if (!this.cursor || !this.cursorFollower) return;
        
        this.bindEvents();
        this.animate();
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Hover effects
        document.querySelectorAll('a, button, .hover-lift, .tilt-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.cursorFollower.classList.add('hover');
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.cursorFollower.classList.remove('hover');
            });
        });
        
        // Click effects
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
        
        // Text cursor for specific elements
        document.querySelectorAll('.interactive-text').forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursorText.textContent = el.textContent;
                this.cursorText.classList.add('show');
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursorText.classList.remove('show');
            });
        });
    }
    
    animate() {
        this.follower.x += (this.mouse.x - this.follower.x) * 0.1;
        this.follower.y += (this.mouse.y - this.follower.y) * 0.1;
        
        this.cursor.style.left = this.mouse.x + 'px';
        this.cursor.style.top = this.mouse.y + 'px';
        
        this.cursorFollower.style.left = this.follower.x + 'px';
        this.cursorFollower.style.top = this.follower.y + 'px';
        
        this.cursorText.style.left = this.mouse.x + 'px';
        this.cursorText.style.top = this.mouse.y + 'px';
        
        requestAnimationFrame(() => this.animate());
    }
}

// 3D Tilt Effect
class TiltEffect {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }
}

// Magnetic Effect
class MagneticEffect {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.magnetic').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = 100;
                
                if (distance < maxDistance) {
                    const strength = (maxDistance - distance) / maxDistance;
                    const moveX = x * strength * 0.15;
                    const moveY = y * strength * 0.15;
                    
                    element.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0px, 0px)';
            });
        });
    }
}

// Mouse Parallax Effect
class MouseParallax {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.parallax-element').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.1;
                const moveY = y * 0.1;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0px, 0px)';
            });
        });
    }
}

// Ripple Effect
class RippleEffect {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.ripple').forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');
                
                element.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Floating Elements Animation
class FloatingElements {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.floating-icon').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'none';
                icon.style.transform = 'scale(1.2) rotate(360deg)';
                icon.style.transition = 'transform 0.5s ease';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.animation = 'float 6s ease-in-out infinite';
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }
}

// Interactive Text Effects
class InteractiveText {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.interactive-text').forEach(text => {
            text.addEventListener('mouseenter', () => {
                text.style.transform = 'scale(1.05)';
                text.style.color = 'var(--primary-blue)';
            });
            
            text.addEventListener('mouseleave', () => {
                text.style.transform = 'scale(1)';
                text.style.color = '';
            });
        });
    }
}

// Enhanced Button Interactions
class ButtonInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.05)';
                button.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = '';
            });
            
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(0) scale(0.95)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'translateY(-2px) scale(1.05)';
            });
        });
    }
}

// Initialize all interactive features
window.addEventListener('load', () => {
    // Initialize chatbot
    new Chatbot();
    
    // Initialize floating action button
    new FloatingActionButton();
    
    // Initialize particle system
    new ParticleSystem();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize text animations
    new TextAnimations();
    
    // Initialize footer interactions
    new FooterInteractions();
    
    // Initialize privacy accordion
    new PrivacyAccordion();
    
    // Initialize mouse interactive features
    new CustomCursor();
    new TiltEffect();
    new MagneticEffect();
    new MouseParallax();
    new RippleEffect();
    new FloatingElements();
    new InteractiveText();
    new ButtonInteractions();
    
    document.body.classList.add('loaded');
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading state
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadingStyles);
