
import React, { useState, useMemo } from 'react';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;

interface DatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
    const [month, setMonth] = useState(new Date());

    const days = useMemo(() => {
        const d = new Date(month.getFullYear(), month.getMonth(), 1);
        const list = [];
        while (d.getMonth() === month.getMonth()) {
            list.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return list;
    }, [month]);
    
    return (
        <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="flex justify-between items-center mb-2 px-2">
                <button onClick={() => setMonth(m => new Date(m.setMonth(m.getMonth() - 1)))}>
                    <ChevronLeftIcon/>
                </button>
                <span>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setMonth(m => new Date(m.setMonth(m.getMonth() + 1)))}>
                    <ChevronRightIcon/>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-500">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
                {Array(new Date(month.getFullYear(), month.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={i}></div>)}
                {days.map(day => (
                    <button 
                        key={day.toISOString()} 
                        onClick={() => onDateChange(day)} 
                        className={`p-1.5 rounded-full text-sm ${selectedDate.toDateString() === day.toDateString() ? 'bg-cyan-600 text-white font-bold' : 'text-slate-700 hover:bg-cyan-100'}`}
                    >
                        {day.getDate()}
                    </button>
                ))}
            </div>
        </div>
    );
};
