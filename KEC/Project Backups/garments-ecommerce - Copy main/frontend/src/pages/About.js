import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="logo-circle">
              <img src="/logo.png" alt="G FRESH Logo" className="hero-logo" />
            </div>
            <h1 className="hero-title">G FRESH</h1>
            <p className="hero-subtitle">Premium Quality • Sustainable Fashion • Modern Style</p>
            <Link to="/products" className="cta-button">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Us</h2>
              <p>
                G FRESH is a premium garments e-commerce platform dedicated to bringing you 
                the finest collection of clothing that combines style, comfort, and sustainability. 
                We believe fashion should be accessible, ethical, and environmentally conscious.
              </p>
              <p>
                Our curated selection features high-quality garments from trusted manufacturers, 
                ensuring every piece meets our strict standards for craftsmanship and design.
              </p>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&crop=center" alt="G FRESH Team" className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Sustainable</h3>
              <p>Eco-friendly materials and ethical manufacturing processes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Premium Quality</h3>
              <p>Carefully selected garments with superior craftsmanship</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💯</div>
              <h3>Satisfaction Guarantee</h3>
              <p>30-day return policy and excellent customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="selveraj" className="member-photo" />
              <h3>selveraj</h3>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="govindasamy" className="member-photo" />
              <h3>govindasamy</h3>
              <p>Head of Operations</p>
            </div>
            <div className="team-member">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" alt="sivaraj" className="member-photo" />
              <h3>sivaraj</h3>
              <p>Design Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company History Section */}
      <section className="history-section">
        <div className="container">
          <h2>Our Journey</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div className="timeline-content">
                <h3>The Beginning</h3>
                G FRESH was founded with a vision to revolutionize the garment industry through sustainable practices and premium quality.
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2021</div>
              <div className="timeline-content">
                <h3>First Collection Launch</h3>
                <p>Launched our debut collection featuring eco-friendly materials and innovative designs that caught industry attention.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2022</div>
              <div className="timeline-content">
                <h3>Global Expansion</h3>
                <p>Expanded operations to serve customers across 15 countries with same-day delivery in major cities.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2023</div>
              <div className="timeline-content">
                <h3>Sustainability Award</h3>
                <p>Received the Green Fashion Excellence Award for our commitment to environmental responsibility.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <h3>Innovation Leadership</h3>
                <p>Leading the industry with AI-powered design tools and smart fabric technology integration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Environmental Responsibility</h3>
              <p>We're committed to reducing our carbon footprint through sustainable manufacturing processes, renewable energy usage, and eco-friendly packaging solutions.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Ethical Manufacturing</h3>
              <p>Fair wages, safe working conditions, and ethical labor practices are non-negotiable aspects of our supply chain partnerships worldwide.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💎</div>
              <h3>Premium Quality</h3>
              <p>Every garment undergoes rigorous quality testing to ensure durability, comfort, and style that exceeds customer expectations consistently.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation Excellence</h3>
              <p>Continuously investing in research and development to bring cutting-edge fashion technology and design innovations to our customers.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Customer First</h3>
              <p>Building lasting relationships through exceptional service, personalized experiences, and genuine care for our customers' satisfaction and style needs.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌟</div>
              <h3>Transparency</h3>
              <p>Open communication about our processes, materials, and business practices to build trust and accountability with our community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"G FRESH has completely transformed my wardrobe. The quality is exceptional and I love knowing my purchases support sustainable practices. Every piece I've bought has become a staple in my closet."</p>
              <div className="testimonial-author">
                <h4>Sarah Johnson</h4>
                <span>Fashion Blogger</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"As someone who values both style and ethics, G FRESH is my go-to brand. Their customer service is outstanding, and the fit and quality of their garments are consistently impressive."</p>
              <div className="testimonial-author">
                <h4>Michael Chen</h4>
                <span>Sustainable Fashion Advocate</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"I've been shopping with G FRESH for two years now. The attention to detail, premium materials, and timeless designs make every purchase worth it. Highly recommend to anyone seeking quality fashion."</p>
              <div className="testimonial-author">
                <h4>Emma Rodriguez</h4>
                <span>Style Consultant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Process Section */}
      <section className="manufacturing-section">
        <div className="container">
          <h2>Our Manufacturing Excellence</h2>
          <div className="process-content">
            <div className="process-row">
              <div className="process-text">
                <h3>Sustainable Production Methods</h3>
                <p>Our state-of-the-art manufacturing facilities utilize renewable energy sources and advanced water recycling systems to minimize environmental impact while maintaining the highest quality standards.</p>
                
                <div className="process-features">
                  <div className="process-feature">
                    <div className="feature-icon">🔬</div>
                    <div className="feature-text">
                      <h4>Quality Control</h4>
                      <p>Multi-stage quality testing ensures every garment meets our premium standards</p>
                    </div>
                  </div>
                  <div className="process-feature">
                    <div className="feature-icon">♻️</div>
                    <div className="feature-text">
                      <h4>Zero Waste</h4>
                      <p>100% of fabric waste is recycled or repurposed in our production process</p>
                    </div>
                  </div>
                  <div className="process-feature">
                    <div className="feature-icon">🌱</div>
                    <div className="feature-text">
                      <h4>Organic Materials</h4>
                      <p>Sourcing certified organic and sustainable materials from trusted suppliers</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="process-images">
                <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=350&fit=crop&crop=center" alt="Manufacturing Facility" className="process-img" />
                <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=350&fit=crop&crop=center" alt="Fabric Quality" className="process-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="awards-section">
        <div className="container">
          <h2>Recognition & Awards</h2>
          <div className="awards-grid">
            <div className="award-card">
              <div className="award-icon">🏆</div>
              <h3>Sustainable Fashion Excellence Award 2024</h3>
              <p>Recognized by the Global Fashion Council for outstanding commitment to environmental responsibility and sustainable manufacturing practices.</p>
            </div>
            <div className="award-card">
              <div className="award-icon">🥇</div>
              <h3>Best E-commerce Experience 2023</h3>
              <p>Awarded by Digital Commerce Association for exceptional online shopping experience and customer satisfaction ratings.</p>
            </div>
            <div className="award-card">
              <div className="award-icon">⭐</div>
              <h3>Innovation in Fashion Technology 2023</h3>
              <p>Honored for pioneering AI-powered design tools and smart fabric integration in the fashion industry.</p>
            </div>
            <div className="award-card">
              <div className="award-icon">🌟</div>
              <h3>Customer Choice Award 2022</h3>
              <p>Voted as the top choice by customers for quality, service, and overall brand experience in fashion retail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What makes G FRESH different from other brands?</h3>
              <p>We combine premium quality with sustainable practices, offering timeless designs that are both stylish and environmentally responsible. Our commitment to ethical manufacturing and customer satisfaction sets us apart.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer international shipping?</h3>
              <p>Yes! We ship to over 25 countries worldwide with fast and reliable delivery services. Most international orders arrive within 5-7 business days.</p>
            </div>
            <div className="faq-item">
              <h3>What is your return and exchange policy?</h3>
              <p>We offer a 30-day return policy for all items in their original condition. Exchanges are free, and we provide prepaid return labels for your convenience.</p>
            </div>
            <div className="faq-item">
              <h3>Are your materials truly sustainable?</h3>
              <p>Absolutely! We use certified organic cotton, recycled polyester, and innovative eco-friendly materials. All our suppliers are audited for environmental and ethical compliance.</p>
            </div>
            <div className="faq-item">
              <h3>How do I find the right size?</h3>
              <p>We provide detailed size guides for each product, and our customer service team is available to help with sizing questions. We also offer free exchanges if the fit isn't perfect.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer customization services?</h3>
              <p>Yes, we offer personalization options for select items including monogramming and custom fits. Contact our customer service team for more details about available customization options.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Premium Fashion?</h2>
            <p>Join thousands of satisfied customers who trust G FRESH for their style needs</p>
            <div className="cta-buttons">
              <Link to="/products" className="cta-button primary">Shop Collection</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 