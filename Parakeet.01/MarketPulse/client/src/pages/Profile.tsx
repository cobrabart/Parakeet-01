import { useContext, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getTelegramUser } from "@/lib/telegram";
import { 
  Wallet,
  Plus,
  ArrowUpRight, 
  CreditCard, 
  Banknote, 
  History, 
  QrCode,
  Coins
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";

const Profile = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [, navigate] = useLocation();
  const t = translations[language];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const telegramUser = getTelegramUser();

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(5000); // Mock balance in cents (e.g., $50.00)
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [showCashOutDialog, setShowCashOutDialog] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [amountToCashOut, setAmountToCashOut] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("visa");
  const [cashOutMethod, setCashOutMethod] = useState("bank");
  
  // Local form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    onSuccess: (userData) => {
      // Initialize form fields with user data
      if (userData) {
        setEmail(userData.email || "");
        setFullName(userData.fullName || "");
      }
    }
  });

  // Handle viewing user dashboard
  const handleViewDashboard = () => {
    navigate("/user-dashboard");
  };

  // Handle viewing admin dashboard
  const handleViewAdminDashboard = () => {
    navigate("/admin-dashboard");
  };

  // Update user profile mutation
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', '/api/user', data);
    },
    onSuccess: () => {
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Show success toast
      toast({
        title: t.profileUpdated,
        description: t.profileUpdateSuccess,
        duration: 3000,
      });
      
      // Exit edit mode
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: t.updateFailed,
        description: error.toString(),
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  // Save profile changes
  const handleSaveProfile = () => {
    updateProfile({
      email,
      fullName,
      language
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset form fields to original values
    if (user) {
      setEmail(user.email || "");
      setFullName(user.fullName || "");
    }
    setIsEditing(false);
  };
  
  // Handle add funds to wallet
  const handleAddFunds = () => {
    // Validate amount
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t.invalidAmount,
        description: t.enterValidAmount,
        variant: "destructive",
      });
      return;
    }
    
    // Convert to cents for storage
    const amountInCents = Math.round(amount * 100);
    
    // Add to wallet
    setWalletBalance(prevBalance => prevBalance + amountInCents);
    
    // Show success message
    toast({
      title: t.fundsAdded,
      description: t.fundsAddedSuccess.replace('{amount}', formatPrice(amountInCents)),
    });
    
    // Reset and close dialog
    setAmountToAdd("");
    setShowAddFundsDialog(false);
  };
  
  // Handle cash out from wallet
  const handleCashOut = () => {
    // Validate amount
    const amount = parseFloat(amountToCashOut);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t.invalidAmount,
        description: t.enterValidAmount,
        variant: "destructive",
      });
      return;
    }
    
    // Convert to cents for comparison
    const amountInCents = Math.round(amount * 100);
    
    // Check if enough balance
    if (amountInCents > walletBalance) {
      toast({
        title: t.insufficientFunds,
        description: t.notEnoughFunds,
        variant: "destructive",
      });
      return;
    }
    
    // Subtract from wallet
    setWalletBalance(prevBalance => prevBalance - amountInCents);
    
    // Show success message
    toast({
      title: t.cashoutSuccess,
      description: t.cashoutProcessed.replace('{amount}', formatPrice(amountInCents)),
    });
    
    // Reset and close dialog
    setAmountToCashOut("");
    setShowCashOutDialog(false);
  };

  return (
    <>
      <Header showBack title={t.profile} />
      
      <main className="flex-1 overflow-y-auto pb-16 px-4">
        {isLoading ? (
          // Loading skeleton
          <div className="py-6 space-y-4">
            <div className="flex items-center animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="ml-4 space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            {/* User Profile Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {telegramUser?.photo_url ? (
                    <img src={telegramUser.photo_url} alt={telegramUser.first_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <i className="ri-user-3-line text-2xl"></i>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">
                    {user?.fullName || telegramUser?.first_name || user?.username || "User"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user?.email || "No email set"}
                  </p>
                </div>
              </div>
              
              {/* Dashboard buttons */}
              <div className="mt-4 flex gap-2">
                <button 
                  className="flex-1 py-2 bg-primary text-white rounded-lg shadow-sm text-sm"
                  onClick={handleViewDashboard}
                >
                  {t.myDashboard}
                </button>
                
                {user?.isAdmin && (
                  <button 
                    className="flex-1 py-2 bg-secondary text-white rounded-lg shadow-sm text-sm"
                    onClick={handleViewAdminDashboard}
                  >
                    {t.adminDashboard}
                  </button>
                )}
              </div>
            </div>
            
            {/* Profile Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium mb-4">
                {isEditing ? t.editProfile : t.profileInfo}
              </h3>
              
              <div className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {user?.fullName || "-"}
                    </div>
                  )}
                </div>
                
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {user?.email || "-"}
                    </div>
                  )}
                </div>
                
                {/* Language Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.language}</label>
                  {isEditing ? (
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                      <option value="uz">O'zbek</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {language === "en" ? "English" : language === "ru" ? "Русский" : "O'zbek"}
                    </div>
                  )}
                </div>
                
                {/* Edit/Save Buttons */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button 
                        className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm text-sm"
                        onClick={handleCancelEdit}
                        disabled={isPending}
                      >
                        {t.cancel}
                      </button>
                      <button 
                        className="flex-1 py-2 bg-primary text-white rounded-lg shadow-sm text-sm"
                        onClick={handleSaveProfile}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <span className="flex items-center justify-center">
                            <i className="ri-loader-2-line animate-spin mr-2"></i>
                            {t.saving}
                          </span>
                        ) : t.saveChanges}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="flex-1 py-2 bg-primary text-white rounded-lg shadow-sm text-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      {t.editProfile}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Wallet Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{t.wallet}</h3>
                <Wallet className="text-primary h-5 w-5" />
              </div>
              
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t.walletBalance}</p>
                    <h2 className="text-2xl font-bold text-primary">{formatPrice(walletBalance)}</h2>
                  </div>
                  <Coins className="text-primary h-8 w-8 opacity-70" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-primary text-white rounded-lg text-sm"
                  onClick={() => setShowAddFundsDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t.addFunds}
                </button>
                <button 
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  onClick={() => setShowCashOutDialog(true)}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {t.cashOut}
                </button>
              </div>
              
              {walletBalance > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <h4 className="text-xs text-gray-500 mb-2">{t.recentTransactions}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{t.deposit}</p>
                          <p className="text-xs text-gray-500">Mar 22, 2025</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">+$25.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{t.purchase}</p>
                          <p className="text-xs text-gray-500">Mar 20, 2025</p>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">-$15.99</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Other Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium mb-4">{t.settings}</h3>
              
              <div className="space-y-4">
                {/* Notifications Setting */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{t.notifications}</h4>
                    <p className="text-xs text-gray-500">{t.notificationsDescription}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                {/* Version Info */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500">
                    Parakeet by ApexBart v1.0.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
      
      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addFunds}</DialogTitle>
            <DialogDescription>
              {t.addFundsDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.amount}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.paymentMethod}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${selectedPaymentMethod === 'visa' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setSelectedPaymentMethod('visa')}
                >
                  <i className="ri-visa-line text-blue-500 text-lg"></i>
                  <span>Visa</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${selectedPaymentMethod === 'mastercard' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setSelectedPaymentMethod('mastercard')}
                >
                  <i className="ri-mastercard-line text-red-500 text-lg"></i>
                  <span>MasterCard</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${selectedPaymentMethod === 'humo' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setSelectedPaymentMethod('humo')}
                >
                  <span className="text-blue-600 font-bold">Humo</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${selectedPaymentMethod === 'uzcard' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setSelectedPaymentMethod('uzcard')}
                >
                  <span className="text-blue-800 font-bold">UzCard</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${selectedPaymentMethod === 'usdt' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setSelectedPaymentMethod('usdt')}
                >
                  <span className="text-green-600 font-bold">USDT</span>
                </button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center gap-2">
            <DialogClose asChild>
              <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-md">
                {t.cancel}
              </button>
            </DialogClose>
            <button 
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md"
              onClick={handleAddFunds}
            >
              {t.confirmPayment}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cash Out Dialog */}
      <Dialog open={showCashOutDialog} onOpenChange={setShowCashOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.cashOut}</DialogTitle>
            <DialogDescription>
              {t.cashOutDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.amount}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amountToCashOut}
                  onChange={(e) => setAmountToCashOut(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                />
              </div>
              {walletBalance > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.availableBalance}: {formatPrice(walletBalance)}
                </p>
              )}
            </div>
            
            {/* Cashout Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.cashOutMethod}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${cashOutMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setCashOutMethod('bank')}
                >
                  <i className="ri-bank-line text-blue-600 text-lg"></i>
                  <span>{t.bankTransfer}</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${cashOutMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setCashOutMethod('paypal')}
                >
                  <i className="ri-paypal-line text-blue-700 text-lg"></i>
                  <span>PayPal</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${cashOutMethod === 'humo' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setCashOutMethod('humo')}
                >
                  <span className="text-blue-600 font-bold">Humo</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md ${cashOutMethod === 'usdt' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setCashOutMethod('usdt')}
                >
                  <span className="text-green-600 font-bold">USDT</span>
                </button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center gap-2">
            <DialogClose asChild>
              <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-md">
                {t.cancel}
              </button>
            </DialogClose>
            <button 
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md"
              onClick={handleCashOut}
            >
              {t.confirmCashOut}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
