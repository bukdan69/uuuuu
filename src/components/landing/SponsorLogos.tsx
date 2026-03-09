'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const sponsors = [
  {
    name: 'Bank Indonesia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/BI_Logo.png',
    category: 'Lembaga Negara',
    website: 'https://www.bi.go.id',
  },
  {
    name: 'Otoritas Jasa Keuangan',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png',
    category: 'Lembaga Negara',
    website: 'https://www.ojk.go.id',
  },
  {
    name: 'Danantara Indonesia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Danantara_Indonesia_%28no_SW%29.svg',
    category: 'Holding BUMN',
    website: 'https://danantara.id',
  },
  {
    name: 'BUMN Untuk Indonesia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Logo_BUMN_Untuk_Indonesia_2020.svg/200px-Logo_BUMN_Untuk_Indonesia_2020.svg.png',
    category: 'BUMN',
    website: 'https://bumn.go.id',
  },
  {
    name: 'Kementerian UMKM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Logo_Kementerian_Usaha_Mikro%2C_Kecil%2C_dan_Menengah_Republik_Indonesia_%282025%29.svg',
    category: 'Kementerian',
    website: 'https://kemenkopukm.go.id',
  },
  {
    name: 'Pertamina',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pertamina_Logo.svg',
    category: 'BUMN Energi',
    website: 'https://www.pertamina.com',
  },
  {
    name: 'Bank Negara Indonesia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg',
    category: 'Bank BUMN',
    website: 'https://www.bni.co.id',
  },
  {
    name: 'PLN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png',
    category: 'BUMN Energi',
    website: 'https://www.pln.co.id',
  },
  {
    name: 'Kereta Api Indonesia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Logo_PT_Kereta_Api_Indonesia_%28Persero%29_2020.svg',
    category: 'BUMN Transportasi',
    website: 'https://www.kai.id',
  },
];

export function SponsorLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval: NodeJS.Timeout;
    
    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          // Scroll to right
          scrollContainer.scrollLeft += 1;
          
          // Reset to start when reaching end
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft = 0;
          }
        }
      }, 20); // Smooth scroll speed
    };

    startScrolling();

    // Pause on hover
    const handleMouseEnter = () => clearInterval(scrollInterval);
    const handleMouseLeave = () => startScrolling();

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(scrollInterval);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Duplicate sponsors for infinite scroll effect
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <section className="py-8 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Didukung Oleh
          </h3>
          <p className="text-sm text-muted-foreground">
            Partner BUMN dan Perusahaan Terpercaya
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-hidden scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {duplicatedSponsors.map((sponsor, index) => (
            <Link
              key={`${sponsor.name}-${index}`}
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-32 h-16 flex items-center justify-center bg-background rounded-lg border hover:shadow-lg hover:scale-105 transition-all duration-300 p-3"
            >
              <div className="relative w-full h-full">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Marketplace UMKM Indonesia - Platform Terpercaya untuk UMKM
          </p>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
