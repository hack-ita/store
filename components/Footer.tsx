'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 dark:border-primary/30 bg-light dark:bg-dark transition-colors" role="contentinfo">
      <div className="container mx-auto px-5 py-12">
        
        {/* Main Footer Content */}
        <div className="flex flex-col items-center justify-center space-y-8">
          
          {/* Logo */}
          <Link href="/" aria-label="HackITa Store homepage">
            <div className="flex items-center justify-center">
              <Image
                src="/images/logo.webp"
                alt="HackITa Logo"
                width={120}
                height={100}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Social Links */}
          <ul className="flex flex-wrap gap-6 items-center justify-center" aria-label="Follow HackITa on social media">
            {/* Facebook */}
            <li>
              <a 
                href="https://facebook.com/hackita" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="block p-2 text-dark dark:text-light hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
                  <path fill="currentColor" d="M240 363.3L240 576L356 576L356 363.3L442.5 363.3L460.5 265.5L356 265.5L356 230.9C356 179.2 376.3 159.4 428.7 159.4C445 159.4 458.1 159.8 465.7 160.6L465.7 71.9C451.4 68 416.4 64 396.2 64C289.3 64 240 114.5 240 223.4L240 265.5L174 265.5L174 363.3L240 363.3z"/>
                </svg>
              </a>
            </li>
            
            {/* Instagram */}
            <li>
              <a 
                href="https://instagram.com/hackita" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="block p-2 text-dark dark:text-light hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
                  <path fill="currentColor" d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/>
                </svg>
              </a>
            </li>
            
            {/* Twitter/X */}
            <li>
              <a 
                href="https://twitter.com/hackita" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="block p-2 text-dark dark:text-light hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
                  <path fill="currentColor" d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z"/>
                </svg>
              </a>
            </li>
            
            {/* LinkedIn */}
            <li>
              <a 
                href="https://linkedin.com/company/hackita" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="block p-2 text-dark dark:text-light hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
                  <path fill="currentColor" d="M196.3 512L103.4 512L103.4 212.9L196.3 212.9L196.3 512zM149.8 172.1C120.1 172.1 96 147.5 96 117.8C96 103.5 101.7 89.9 111.8 79.8C121.9 69.7 135.6 64 149.8 64C164 64 177.7 69.7 187.8 79.8C197.9 89.9 203.6 103.6 203.6 117.8C203.6 147.5 179.5 172.1 149.8 172.1zM543.9 512L451.2 512L451.2 366.4C451.2 331.7 450.5 287.2 402.9 287.2C354.6 287.2 347.2 324.9 347.2 363.9L347.2 512L254.4 512L254.4 212.9L343.5 212.9L343.5 253.7L344.8 253.7C357.2 230.2 387.5 205.4 432.7 205.4C526.7 205.4 544 267.3 544 347.7L544 512L543.9 512z"/>
                </svg>
              </a>
            </li>
          </ul>

          {/* Link to Main Articles Website */}
          <div>
            <a 
              href="https://hackita.it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-medium"
            >
              <span>📝</span>
              Visita il nostro Blog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary/30 dark:via-primary/40 to-transparent my-8"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-dark/60 dark:text-light/60">
            <span className="text-primary font-semibold">HackITa</span> © {new Date().getFullYear()}. Tutti i diritti riservati.
          </p>
        </div>

      </div>
    </footer>
  );
}