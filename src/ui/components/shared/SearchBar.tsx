import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Buscar..." }: SearchBarProps) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-txt-muted group-focus-within:text-gold transition-colors" />
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-sm" 
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-muted hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};