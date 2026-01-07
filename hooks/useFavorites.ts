
import { useState, useEffect, useCallback } from 'react';
import type { MedicalResource } from '../types';

const FAVORITES_KEY = 'allwayscare-favorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<MedicalResource[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveFavorites = (newFavorites: MedicalResource[]) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    };

    const addFavorite = useCallback((resource: MedicalResource) => {
        saveFavorites([...favorites, resource]);
    }, [favorites]);

    const removeFavorite = useCallback((resourceId: string) => {
        const newFavorites = favorites.filter(fav => fav.id !== resourceId);
        saveFavorites(newFavorites);
    }, [favorites]);

    const isFavorite = useCallback((resourceId: string) => {
        return favorites.some(fav => fav.id === resourceId);
    }, [favorites]);

    return { favorites, addFavorite, removeFavorite, isFavorite, isLoaded };
};
