import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { GeminiChat } from './components/GeminiChat';
import { Game, ViewState } from './types';
import { GAMES as DEFAULT_GAMES } from './constants';
import { Loader2, Search, Ghost, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, X, ExternalLink } from 'lucide-react';

const API_URL = 'https://gameboxbybear.pythonanywhere.com/api/onennabe';

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, totalAmount, cartGames, isDarkMode }: { isOpen: boolean; onClose: () => void; totalAmount: number; cartGames: Game[], isDarkMode: boolean }) => {
  if (!isOpen) return null;

  const itemList = cartGames.map(g => `> ${g.title} (RM${g.price.toFixed(2)})`).join('\n');
  const whatsappMessage = `Here is the receipt of my game purchased (Total: RM ${totalAmount.toFixed(2)})\n${itemList}`;
  const whatsappUrl = `https://wa.me/601162829775?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-md border shadow-2xl overflow-hidden relative`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-black/10 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="p-6 flex flex-col items-center text-center">
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payment Required</h2>
          <p className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Total: RM {totalAmount.toFixed(2)}</p>
          <p className="text-gray-400 text-sm mb-6">Scan to pay securely</p>
          
          <div className="bg-white p-2 rounded-xl mb-6 w-full aspect-square max-w-[300px] flex items-center justify-center overflow-hidden border border-gray-200">
            {/* Updated to GitHub raw link */}
            <img 
              src="https://raw.githubusercontent.com/ZackTheGrumpy/CempaGames/refs/heads/main/QR_Payment_Square.png" 
              alt="Payment QR Code" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className={`p-4 rounded-lg w-full mb-6 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
             <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Instruction:</p>
             <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Send receipt of RM {totalAmount.toFixed(2)} after payment in whatsapp</p>
          </div>

          <a 
            href="https://payment.tngdigital.com.my/sc/bDLnzfGnwF"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#005BAA] hover:bg-[#004a8c] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3 shadow-md hover:shadow-lg"
          >
            <span>Pay via TNG</span>
            <ExternalLink size={18} />
          </a>

          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            <span>Open Whatsapp</span>
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.STORE);
  const [cart, setCart] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentItems, setPaymentItems] = useState<Game[]>([]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        // Map API data to our Game interface
        const mappedGames: Game[] = Array.isArray(data) ? data.map((item: any, index: number) => {
          const id = item.appid?.toString() || `game-${index}`;
          const title = item.name || item.title || 'Untitled Game';
          const isNew = item.new === true || item.new === 'true';
          const price = isNew ? 10 : 8;
          
          const description = `
AppID: ${id}
Size: ${item.size_gb || 'Unknown'}
Downloads: ${item.downloads || 0}
          `.trim();

          return {
            id: id,
            title: title,
            description: description,
            price: price,
            imageUrl: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`,
            category: item.primary_genre || 'General',
            rating: 4.5,
            releaseDate: item.added_on || '2024'
          };
        }) : DEFAULT_GAMES;

        setGames(mappedGames);
        setFilteredGames(mappedGames);
      } catch (error) {
        console.error("Failed to fetch games, using fallback", error);
        setGames(DEFAULT_GAMES);
        setFilteredGames(DEFAULT_GAMES);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
      if (searchTerm.trim() === '') {
          setFilteredGames(games);
      } else {
          const lowerTerm = searchTerm.toLowerCase();
          setFilteredGames(games.filter(g => g.title.toLowerCase().includes(lowerTerm)));
      }
      setCurrentPage(1); // Reset to page 1 on search
  }, [searchTerm, games]);

  const handleBuy = (game: Game) => {
    if (!cart.includes(game.id)) {
      setCart(prev => [...prev, game.id]);
      // User stays on store page, button updates to "Added to Cart"
    }
  };

  const handlePayIndividual = (game: Game) => {
    setPaymentItems([game]);
    setIsPaymentModalOpen(true);
  };

  const handleCheckoutAll = () => {
    setPaymentItems(games.filter(game => cart.includes(game.id)));
    setIsPaymentModalOpen(true);
  };

  // Pagination Logic
  const indexOfLastGame = currentPage * itemsPerPage;
  const indexOfFirstGame = indexOfLastGame - itemsPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisibleButtons = 5; 
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 py-6 sm:py-10">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-[#222] text-gray-300 hover:bg-[#333]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-[#222] text-gray-300 hover:bg-[#333]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-xs sm:text-base transition-colors ${
              currentPage === number
                ? (isDarkMode ? 'bg-[#66c0f4] text-[#171a21] shadow-lg shadow-blue-600/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-400/30')
                : (isDarkMode ? 'bg-[#222] text-gray-400 hover:bg-[#333] hover:text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-black')
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-[#222] text-gray-300 hover:bg-[#333]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-[#222] text-gray-300 hover:bg-[#333]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className={`ml-2 sm:ml-4 text-xs sm:text-sm w-full text-center sm:w-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  };

  const cartGames = games.filter(game => cart.includes(game.id));
  const cartTotal = cartGames.reduce((acc, game) => acc + game.price, 0);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#1b2838] text-[#c7d5e0]' : 'bg-[#f0f2f5] text-gray-900'}`}>
      <Navbar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        cartCount={cart.length}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-[1600px] mx-auto">
        {currentView === ViewState.STORE && (
          <>
            <div className="relative w-[95%] sm:w-[90%] mx-auto mt-[15px] mb-[15px]">
                <input 
                    id="searchBox"
                    type="text" 
                    placeholder="Search game..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full p-[10px] sm:p-[12px] pl-10 sm:pl-12 rounded-[10px] border-none text-[16px] sm:text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all 
                        ${isDarkMode 
                            ? 'bg-[#2a475e] text-white placeholder-gray-400' 
                            : 'bg-white text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-gray-200'}`}
                />
                <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
              </div>
            ) : (
              <>
                {/* Responsive Grid: 2 Columns on Mobile, Auto-fill on Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-3 sm:gap-[20px] sm:p-[20px]">
                  {currentGames.map(game => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      isInCart={cart.includes(game.id)}
                      onBuy={handleBuy}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                  {filteredGames.length === 0 && (
                      <div className="col-span-full text-center py-10 text-gray-500">
                          No games found matching "{searchTerm}"
                      </div>
                  )}
                </div>
                {renderPagination()}
              </>
            )}
          </>
        )}

        {currentView === ViewState.CART && (
          <div className="p-[20px] max-w-5xl mx-auto relative pb-24">
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <button 
                      onClick={() => setCurrentView(ViewState.STORE)}
                      className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-[#222] hover:bg-[#333]' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                      <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold">My Cart</h1>
                </div>
            </div>

            {cartGames.length === 0 ? (
              <div className={`text-center py-20 rounded-2xl border border-dashed ${isDarkMode ? 'bg-[#1b1b1b] border-[#333]' : 'bg-white border-gray-300 shadow-sm'}`}>
                <Ghost className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your cart is empty</h3>
                <button 
                  onClick={() => setCurrentView(ViewState.STORE)}
                  className="text-blue-500 hover:text-blue-400 font-bold mt-4"
                >
                  Go to Store
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {cartGames.map(game => (
                    <div key={game.id} className={`rounded-lg p-4 flex flex-col sm:flex-row gap-5 border transition-colors relative ${isDarkMode ? 'bg-[#1e1e1e] border-[#333] hover:border-[#444]' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}>
                        <div className={`w-full sm:w-[180px] h-[140px] sm:h-[120px] rounded-lg overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-[#111]' : 'bg-gray-100'}`}>
                            <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className={`text-xl font-bold pr-20 sm:pr-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{game.title}</h3>
                              <span className={`font-bold text-lg hidden sm:block ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>RM {game.price.toFixed(2)}</span>
                            </div>
                            {/* Mobile Price (visible only on small screens) */}
                            <div className={`font-bold text-lg mb-2 sm:hidden ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>RM {game.price.toFixed(2)}</div>

                            <div className={`text-sm mb-4 p-2 rounded font-mono whitespace-pre-wrap max-h-[80px] overflow-y-auto custom-scrollbar ${isDarkMode ? 'text-gray-400 bg-[#151515]' : 'text-gray-600 bg-gray-50'}`}>
                              {game.description}
                            </div>
                            <button 
                              onClick={() => handlePayIndividual(game)}
                              className="bg-green-700 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm"
                            >
                              <CreditCard size={16} />
                              Pay Now
                            </button>
                        </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 p-4 sm:p-6 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-4 shadow-xl z-10 backdrop-blur-xl bg-opacity-95 ${isDarkMode ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200'}`}>
                  <div className="text-center sm:text-left">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Grand Total</div>
                    <div className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>RM {cartTotal.toFixed(2)}</div>
                    <div className="text-gray-500 text-xs">{cartGames.length} Items in Cart</div>
                  </div>
                  <button 
                    onClick={handleCheckoutAll}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 text-lg transition-all shadow-lg hover:shadow-blue-500/20"
                  >
                    Checkout All
                    <ChevronsRight size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        totalAmount={paymentItems.reduce((acc, item) => acc + item.price, 0)}
        cartGames={paymentItems}
        isDarkMode={isDarkMode}
      />
      
      <GeminiChat games={games} isDarkMode={isDarkMode} />
    </div>
  );
};

export default App;