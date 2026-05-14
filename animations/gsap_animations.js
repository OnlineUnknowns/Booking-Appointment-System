gsap.from(".glass-card", { duration: 0.6, opacity: 0, y: 30, stagger: 0.1, ease: "power2.out" });
gsap.to(".neon-border", { boxShadow: "0 0 15px #3B82F6", repeat: -1, yoyo: true, duration: 1.2 });