
import React, { useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import type { CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

const CartIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const Cart: React.FC = () => {
    const { cart, isLoaded, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const { t } = useLanguage();

    // Group items by member name for better organization in the cart view.
    const groupedCart = useMemo(() => {
        return cart.reduce<Record<string, CartItem[]>>((acc, item) => {
            const memberName = item.forMemberName;
            if (!acc[memberName]) {
                acc[memberName] = [];
            }
            acc[memberName].push(item);
            return acc;
        }, {});
    }, [cart]);

    const handleCheckout = () => {
        alert(t('cart.checkoutAlert', { total: totalPrice.toFixed(2) }));
        clearCart();
    };

    if (!isLoaded) {
        return (
            <div className="text-center py-10">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-3 text-slate-600">{t('cart.loading')}</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t('sidebar.shoppingCart')}</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">{t('cart.tagline')}</p>
            
            <div className="mt-8">
                {cart.length > 0 ? (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                        {/* Fix: Added explicit type casting to Object.entries to ensure 'items' is correctly typed as CartItem[] */}
                        {(Object.entries(groupedCart) as [string, CartItem[]][]).map(([memberName, items]) => (
                            <div key={memberName} className="mb-6 last:mb-0">
                                <h3 className="text-lg font-bold text-cyan-800 pb-2 border-b-2 border-cyan-100">
                                    For: {memberName}
                                </h3>
                                <ul className="divide-y divide-slate-200">
                                    {items.map(item => (
                                        <li key={`${item.forMemberId}-${item.medicine.name}`} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">{item.medicine.name}</p>
                                                <p className="text-sm text-slate-600">${item.medicine.price.toFixed(2)} {t('cart.perUnit')}</p>
                                            </div>
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.medicine.name, item.forMemberId, parseInt(e.target.value, 10) || 1)}
                                                    className="w-20 p-2 border border-slate-300 rounded-md"
                                                    aria-label={t('cart.quantityAriaLabel', {name: item.medicine.name})}
                                                />
                                                <p className="flex-1 sm:flex-none sm:w-24 text-right font-semibold text-slate-800">${(item.medicine.price * item.quantity).toFixed(2)}</p>
                                                <button onClick={() => removeFromCart(item.medicine.name, item.forMemberId)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={t('cart.removeAriaLabel', {name: item.medicine.name})}>
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div className="mt-6 pt-4 border-t flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{t('cart.total')}:</h3>
                            <p className="text-2xl font-bold text-slate-900">${totalPrice.toFixed(2)}</p>
                        </div>
                        <button onClick={handleCheckout} className="mt-6 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700">
                            {t('cart.checkoutButton')}
                        </button>
                    </div>
                ) : (
                    <div className="text-center bg-white p-10 rounded-xl shadow-md border border-slate-200">
                        <CartIcon />
                        <h2 className="mt-4 text-2xl font-bold text-slate-800">{t('cart.emptyTitle')}</h2>
                        <p className="mt-2 text-slate-600">{t('cart.emptyDescription')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
