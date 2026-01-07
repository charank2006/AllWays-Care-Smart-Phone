
import { useState, useEffect, useCallback } from 'react';
import type { CartItem, MedicineInfo, FamilyMember } from '../types';

const CART_KEY = 'allwayscare-cart';

export const useCart = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(CART_KEY);
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveCart = useCallback((newCart: CartItem[]) => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(newCart));
            setCart(newCart);
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, []);

    const addToCart = useCallback((medicine: MedicineInfo, quantity: number, member: { id: string, name: string }) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.medicine.name === medicine.name && item.forMemberId === member.id);
            let newCart;
            if (existingItemIndex > -1) {
                newCart = prevCart.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newCart = [...prevCart, { medicine, quantity, forMemberId: member.id, forMemberName: member.name }];
            }
            localStorage.setItem(CART_KEY, JSON.stringify(newCart));
            return newCart;
        });
    }, []);

    const removeFromCart = useCallback((medicineName: string, memberId: string) => {
        setCart(prevCart => {
            const newCart = prevCart.filter(item => !(item.medicine.name === medicineName && item.forMemberId === memberId));
            localStorage.setItem(CART_KEY, JSON.stringify(newCart));
            return newCart;
        });
    }, []);

    const updateQuantity = useCallback((medicineName: string, memberId: string, newQuantity: number) => {
        setCart(prevCart => {
            let newCart;
            if (newQuantity <= 0) {
                newCart = prevCart.filter(item => !(item.medicine.name === medicineName && item.forMemberId === memberId));
            } else {
                newCart = prevCart.map(item =>
                    (item.medicine.name === medicineName && item.forMemberId === memberId) ? { ...item, quantity: newQuantity } : item
                );
            }
            localStorage.setItem(CART_KEY, JSON.stringify(newCart));
            return newCart;
        });
    }, []);

    const clearCart = useCallback(() => {
        saveCart([]);
    }, [saveCart]);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const totalPrice = cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);

    return { cart, addToCart, removeFromCart, updateQuantity, clearCart, isLoaded, cartCount, totalPrice };
};
