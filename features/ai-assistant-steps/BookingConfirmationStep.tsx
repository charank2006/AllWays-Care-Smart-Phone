import React from 'react';
import type { BookedAppointment } from '../../types';

const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface BookingConfirmationStepProps {
    appointment: BookedAppointment;
    onNext: () => void;
    onDownload: () => void;
}

export const BookingConfirmationStep: React.FC<BookingConfirmationStepProps> = ({ appointment, onNext, onDownload }) => (
    <div className="text-center p-4 bg-white rounded-xl shadow-md border">
        <CheckCircleIcon />
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Appointment Confirmed!</h2>
        <p className="text-slate-600">An appointment has been booked for <span className="font-bold">{appointment.forMemberName}</span>.</p>
        <div className="mt-4 text-left bg-slate-50 p-4 rounded-lg space-y-2 border text-slate-800">
             <p><strong className="text-slate-600 w-24 inline-block">Location:</strong> {appointment.resource.name}</p>
             <p><strong className="text-slate-600 w-24 inline-block">Doctor:</strong> {appointment.doctor.name} ({appointment.specialty})</p>
             <p><strong className="text-slate-600 w-24 inline-block">Time:</strong> {appointment.time}, {appointment.date}</p>
        </div>
         <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={onDownload} className="flex-1 w-full bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700">
                Download Confirmation
            </button>
            <button onClick={onNext} className="flex-1 w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700">
                Prepare For My Appointment &rarr;
            </button>
        </div>
    </div>
);