import { useState, useMemo } from 'react';

export const useSearch = <T extends Record<string, any>>(
  items: T[], 
  searchFields: (keyof T)[]
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return items.filter(item => {
      // Busca en los campos que le indiquemos (ej: ['clientName', 'date'])
      return searchFields.some(field => {
        const value = item[field];
        return String(value).toLowerCase().includes(lowercasedTerm);
      });
    });
  }, [items, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching: searchTerm.length > 0
  };
};