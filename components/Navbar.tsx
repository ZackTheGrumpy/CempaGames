import React from 'react';
import { ViewState } from '../types';
import { ShoppingBag, ShoppingCart, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  cartCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, cartCount, isDarkMode, onToggleTheme }) => {
  return (
    <header className={`${isDarkMode ? 'bg-[#171a21] text-[#c7d5e0]' : 'bg-white text-gray-800'} p-5 text-center shadow-md sticky top-0 z-50 transition-colors duration-300`}>
      <div className="flex flex-col md:flex-row items-center justify-between max-w-[1400px] mx-auto">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity mb-4 md:mb-0"
          onClick={() => onChangeView(ViewState.STORE)}
        >
          <img 
            src="https://raw.githubusercontent.com/ZackTheGrumpy/CempaGames/refs/heads/main/CempaGamez.ico" 
            alt="CempaGamez Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10" 
          />
          <div className="text-[24px] sm:text-[28px] font-bold tracking-tight">
            CempaGamez Store
          </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
                onClick={onToggleTheme}
                className={`p-2 rounded-full transition-colors ${
                    isDarkMode 
                    ? 'bg-[#2a475e] text-yellow-400 hover:bg-[#355975]' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
                onClick={() => onChangeView(ViewState.STORE)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                currentView === ViewState.STORE 
                    ? (isDarkMode ? 'bg-[#2a475e] text-white' : 'bg-blue-600 text-white')
                    : (isDarkMode ? 'text-[#8f98a0] hover:text-white' : 'text-gray-500 hover:text-black')
                }`}
            >
                <ShoppingBag size={20} />
                <span>Store</span>
            </button>
            
            <button
                onClick={() => onChangeView(ViewState.CART)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors relative ${
                currentView === ViewState.CART 
                    ? (isDarkMode ? 'bg-[#2a475e] text-white' : 'bg-blue-600 text-white') 
                    : (isDarkMode ? 'text-[#8f98a0] hover:text-white' : 'text-gray-500 hover:text-black')
                }`}
            >
                <ShoppingCart size={20} />
                <span>Cart</span>
                {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {cartCount}
                </span>
                )}
            </button>
        </div>
      </div>
    </header>
  );
};