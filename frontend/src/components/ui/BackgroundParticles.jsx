'use client';
import React, { useEffect, useRef } from 'react';
const BackgroundParticles = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let animationFrameId;
        let particles = [];
        const particleCount = 150;
        const sphereRadius = 250;
        let mouse = { x: 0, y: 0 };
        class Particle {
            x = 0;
            y = 0;
            z = 0;
            radius = 1.5;
            baseX = 0;
            baseY = 0;
            baseZ = 0;
            phi = 0;
            theta = 0;
            constructor() {
                this.phi = Math.random() * Math.PI * 2;
                this.theta = Math.random() * Math.PI;
                this.baseX = sphereRadius * Math.sin(this.theta) * Math.cos(this.phi);
                this.baseY = sphereRadius * Math.sin(this.theta) * Math.sin(this.phi);
                this.baseZ = sphereRadius * Math.cos(this.theta);
            }
            update(time) {
                // Rotate around Y axis
                const speed = 0.0005;
                const angle = time * speed;
                const rotatedX = this.baseX * Math.cos(angle) - this.baseZ * Math.sin(angle);
                const rotatedZ = this.baseX * Math.sin(angle) + this.baseZ * Math.cos(angle);
                // Perspective projection
                const focalLength = 400;
                const scale = focalLength / (focalLength + rotatedZ);
                this.x = (rotatedX * scale) + canvas.width / 2;
                this.y = (this.baseY * scale) + canvas.height / 2;
                this.z = rotatedZ;
            }
            draw() {
                if (!ctx)
                    return;
                const opacity = (this.z + sphereRadius) / (sphereRadius * 2);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * ((this.z + sphereRadius) / sphereRadius), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${opacity * 0.5 + 0.1})`;
                ctx.fill();
                // Draw lines to nearby particles
                particles.forEach(p => {
                    const dx = this.x - p.x;
                    const dy = this.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 50) {
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(p.x, p.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 50)})`;
                        ctx.stroke();
                    }
                });
            }
        }
        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        const handleResize = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
            init();
        };
        const animate = (time) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update(time);
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        animate(0);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"/>;
};
export default BackgroundParticles;
