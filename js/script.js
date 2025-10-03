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

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
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
        
        // Simulate form submission
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        this.reset();
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
        
        if (this.isOpen) {
            this.input.focus();
            this.hideBadge();
        }
    }
    
    closeChat() {
        this.isOpen = false;
        this.window.classList.remove('active');
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
        this.input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                this.addBotResponse(message);
            }, 1500);
        }, 500);
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
    
    addBotResponse(userMessage) {
        const responses = this.getBotResponses(userMessage);
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(response, 'bot');
    }
    
    getBotResponses(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return [
                "Hello! Welcome to WorkHub Pro. How can I assist you today?",
                "Hi there! I'm here to help you with any questions about our services.",
                "Hello! Great to meet you. What would you like to know about WorkHub Pro?"
            ];
        } else if (lowerMessage.includes('service') || lowerMessage.includes('services')) {
            return [
                "We offer comprehensive business solutions including web development, mobile apps, cloud solutions, cybersecurity, analytics, and 24/7 support.",
                "Our services include web development, mobile app development, cloud solutions, security, business analytics, and technical support. Which interests you most?",
                "We provide end-to-end business solutions from web development to cloud infrastructure. What specific service are you looking for?"
            ];
        } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return [
                "Our pricing varies based on project scope. We offer flexible packages starting from $19/month for basic services. Would you like a custom quote?",
                "We provide competitive pricing with packages starting at $19/month. I can connect you with our sales team for a detailed quote.",
                "Our pricing is tailored to your needs. We offer everything from basic packages to enterprise solutions. Let me get you in touch with our team."
            ];
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
            return [
                "You can reach us at +1 (555) 123-4567 or email us at info@workhubpro.com. We're available 24/7!",
                "Contact us anytime at +1 (555) 123-4567 or info@workhubpro.com. Our team is ready to help!",
                "We're here for you! Call +1 (555) 123-4567 or email info@workhubpro.com for immediate assistance."
            ];
        } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
            return [
                "I'm here to help! You can ask me about our services, pricing, or contact information. What do you need?",
                "How can I assist you today? I can provide information about our services, help with pricing, or connect you with our team.",
                "I'm your WorkHub Assistant! Feel free to ask about our services, get pricing information, or learn more about what we offer."
            ];
        } else {
            return [
                "That's interesting! Could you tell me more about what you're looking for?",
                "I'd be happy to help with that. Could you provide more details?",
                "Thanks for sharing! Let me know how I can assist you further.",
                "I understand. Is there anything specific about our services you'd like to know?",
                "Great question! Let me help you find the information you need."
            ];
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
                window.location.href = 'mailto:info@workhubpro.com';
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
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                
                if (email) {
                    // Show success message
                    this.showNotification('Thank you for subscribing!', 'success');
                    newsletterForm.reset();
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
    
    // Initialize custom cursor
    customCursor = new CustomCursor();
    
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
