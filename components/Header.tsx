'use client';

import Link from "next/link";
import Image from "next/image";
import {useState, useEffect} from "react";
import { useCartStore } from '@/lib/cartStore';
import { useWishlistStore } from "@/lib/wishlistStore";

export default function Header() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const cartItemsCount = useCartStore((state) => state.getTotalItems());
    const wishlistCount = useWishlistStore((state) => state.getTotalItems());

    const applyTheme = (newTheme: 'light' | 'dark') => {
        const html = document.documentElement;
        
        if (newTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        sessionStorage.setItem('theme', newTheme);
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = sessionStorage.getItem('theme') as 'light' | 'dark' || 'dark';
            setTheme(storedTheme);
            applyTheme(storedTheme);
        }
    }, []);

    useEffect(() => {
        const header = document.querySelector('.header');
        const headerBar = document.querySelector('.headerBar');

        if (!header || !headerBar) return;

        const handleScroll = () => {
            header.classList.toggle('header-glass', window.scrollY > 0);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
    <header className="w-screen fixed top-0 left-0 right-0 z-50 header transition-all">
      <div className="max-w-full lg:max-w-475 mx-auto py-3 px-5 transition-all headerBar">
        <div className="flex items-center justify-between gap-3">
          <div className="grow">
            <Link href="/" aria-label="HackITa Store">
              <div className="h-25 flex items-center">
                <Image
                    src="/images/logo-wobg.png"
                    alt="HackITa Logo"
                    width={120}
                    height={100}
                    className="h-25 w-auto object-contain header-logo transition-all"
                    priority={true}
                />
              </div>
            </Link>
          </div>

          <div className="lg:order-3 relative inline-block mr-3 lg:mr-0">
            <label htmlFor="theme-selector" className="sr-only">Theme</label>
            <select
              id="theme-selector"
              className="appearance-none p-3 rounded-md border border-dark/20 bg-light text-dark dark:bg-dark dark:text-light dark:border-light/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
            >
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
            </select>
          </div>
          
          <div className="relative mr-3">
            <Link href="/cart" className="relative p-2 hover:opacity-80 transition-opacity">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-dark dark:text-light" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-light text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
          
          <div className="relative mr-3">
            <Link href="/wishlist" className="relative p-2 hover:opacity-80 transition-opacity">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-dark dark:text-light" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-light text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
          
        </div>
      </div>
    </header>
    );
}