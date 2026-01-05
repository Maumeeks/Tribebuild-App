
import React from 'react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phoneNumber = "5561982199922" 
}) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 group"
      aria-label="Fale conosco no WhatsApp"
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 group-hover:animate-none"></span>
      
      <div className="relative bg-[#25D366] w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-110 transition-all duration-300">
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M34.06 5.94C30.14 2.02 24.86 0 19.29 0C8.75 0 0.21 8.54 0.21 19.08C0.21 22.46 1.06 25.77 2.68 28.7L0 38.95L10.49 36.33C13.3 37.81 16.46 38.6 19.29 38.6C29.83 38.6 38.37 30.06 38.37 19.52C38.37 13.95 36.35 8.67 34.06 5.94ZM19.29 35.35C16.46 35.35 13.74 34.57 11.36 33.14L10.79 32.8L4.67 34.34L6.24 28.41L5.86 27.83C4.29 25.4 3.46 22.46 3.46 19.52C3.46 10.38 10.53 3.25 19.29 3.25C23.96 3.25 28.29 4.96 31.52 8.2C34.76 11.43 36.47 15.76 36.47 20.43C36.47 29.57 28.05 35.35 19.29 35.35ZM28.05 23.05C27.55 22.82 25.17 21.67 24.71 21.51C24.25 21.35 23.91 21.27 23.57 21.77C23.22 22.27 22.31 23.34 21.96 23.68C21.62 24.03 21.28 24.07 20.78 23.83C20.28 23.6 18.71 23.05 16.86 21.39C15.39 20.12 14.4 18.56 14.06 18.06C13.71 17.56 14.06 17.25 14.36 16.95C14.63 16.68 14.97 16.26 15.28 15.92C15.58 15.57 15.66 15.34 15.82 14.99C15.98 14.65 15.9 14.3 15.78 14.07C15.66 13.83 14.67 11.45 14.24 10.45C13.82 9.5 13.4 9.61 13.05 9.61C12.71 9.61 12.36 9.58 12.02 9.58C11.68 9.58 11.14 9.69 10.68 10.19C10.22 10.69 8.99 11.84 8.99 14.22C8.99 16.6 10.72 18.89 10.98 19.24C11.29 19.58 14.4 24.27 19.04 26.32C20.15 26.82 21.03 27.13 21.71 27.33C22.86 27.72 23.91 27.64 24.75 27.52C25.68 27.4 27.63 26.36 28.05 25.21C28.47 24.07 28.47 23.07 28.32 22.87C28.16 22.67 27.81 22.54 27.31 22.32L28.05 23.05Z"
            fill="white"
          />
        </svg>
      </div>
      
      {/* Tooltip */}
      <span className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
        Dúvidas? Fale conosco!
      </span>
    </a>
  );
};

export default WhatsAppButton;
