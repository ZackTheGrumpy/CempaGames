import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  isInCart: boolean;
  onBuy: (game: Game) => void;
  isDarkMode: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isInCart, onBuy, isDarkMode }) => {
  const [imgSrc, setImgSrc] = useState(game.imageUrl);

  useEffect(() => {
    setImgSrc(game.imageUrl);
  }, [game.imageUrl]);

  const handleImageError = () => {
    const steamUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.id}/library_600x900.jpg`;
    const backupUrl = `https://barryhamsy.github.io/gamelist/${game.id}.jpg`;
    const defaultUrl = "https://barryhamsy.github.io/gamelist/1285190.jpg";

    if (imgSrc === steamUrl) {
      setImgSrc(backupUrl);
    } else if (imgSrc === backupUrl) {
      setImgSrc(defaultUrl);
    }
  };

  return (
    <div className={`
        rounded-xl p-2 sm:p-[10px] text-center transition-all duration-200 
        flex flex-col h-full group relative shadow-lg hover:scale-[1.02] sm:hover:scale-105
        ${isDarkMode 
            ? 'bg-[#2a475e] hover:bg-[#325675] shadow-black/40' 
            : 'bg-white hover:bg-gray-50 shadow-gray-200 border border-gray-100'}
    `}>
      
      {/* Image Wrapper with Floating Price */}
      <div className="relative mb-2 sm:mb-[10px]">
        <img 
          src={imgSrc} 
          alt={game.title} 
          className="w-full h-[150px] sm:h-[220px] object-cover rounded-lg shadow-sm"
          loading="lazy"
          onError={handleImageError}
        />
        {/* Floating Price Tag */}
        <div className={`
            absolute top-2 right-2 backdrop-blur-md font-bold px-2.5 py-1 rounded-lg text-sm shadow-lg z-10 border
            ${isDarkMode 
                ? 'bg-black/60 border-emerald-500/30 text-emerald-400 shadow-black/50' 
                : 'bg-white/90 border-emerald-200 text-emerald-600 shadow-gray-300'}
        `}>
           RM {game.price}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        {/* Title Section */}
        <div className="mb-1.5 sm:mb-2 text-left">
             <div className={`title text-[15px] sm:text-[18px] font-bold leading-tight w-full ${isDarkMode ? 'text-[#c7d5e0]' : 'text-gray-800'}`}>
               {game.title}
             </div>
        </div>

        {/* Metadata Section */}
        <div className={`
            text-left text-[13px] font-medium p-2.5 rounded mb-3 h-[85px] overflow-hidden flex flex-col justify-center
            ${isDarkMode ? 'bg-[#151515] text-[#8f98a0]' : 'bg-gray-100 text-gray-600'}
        `}>
             <pre className="whitespace-pre-wrap font-sans leading-snug">
                 {game.description || "Loading details..."}
             </pre>
        </div>

        <div className="mt-auto">
            {isInCart ? (
                 <button 
                    disabled
                    className={`w-full py-1.5 sm:py-2 font-bold rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 cursor-default border 
                        ${isDarkMode 
                            ? 'bg-[#3d4450] text-gray-400 border-[#444]' 
                            : 'bg-gray-200 text-gray-500 border-gray-300'}`}
                 >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Added to Cart
                 </button>
            ) : (
                <button 
                    onClick={() => onBuy(game)}
                    className={`w-full py-1.5 sm:py-2 font-bold rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors
                        ${isDarkMode
                            ? 'bg-[#66c0f4] hover:bg-[#419bcb] text-[#171a21]'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add to Cart
                </button>
            )}
        </div>
      </div>
    </div>
  );
};