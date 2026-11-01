import React, { useState } from 'react';
import type { VendorBookingStatus } from '../../types';

interface AddVendorModalProps {
  isOpen: boolean;
  currency: string;
  onClose: () => void;
  onSubmit: (vendor: {
    category: string;
    name: string;
    contact_name?: string;
    contact_phone?: string;
    quoted_amount: number;
    booking_status: VendorBookingStatus;
  }) => Promise<void>;
}

export const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  currency,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState('Venue');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [quote, setQuote] = useState<number>(0);
  const [status, setStatus] = useState<VendorBookingStatus>('researching');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        category,
        name,
        contact_name: contactName || undefined,
        contact_phone: contactPhone || undefined,
        quoted_amount: quote,
        booking_status: status,
      });
      setName('');
      setContactName('');
      setContactPhone('');
      setQuote(0);
      setStatus('researching');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-vendor-title"
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 id="modal-add-vendor-title" className="font-bold text-slate-900 text-lg">
          Add Vendor Quotation
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="vendor-category-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="vendor-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="Venue">Venue</option>
              <option value="Catering">Catering</option>
              <option value="Decoration">Decoration</option>
              <option value="Photography">Photography</option>
              <option value="Music">Music / DJ</option>
              <option value="Transport">Transport</option>
              <option value="Cake">Cake & Bakery</option>
              <option value="Other">Other Services</option>
            </select>
          </div>

          <div>
            <label htmlFor="vendor-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor / Business Name
            </label>
            <input
              id="vendor-name-input"
              type="text"
              required
              placeholder="e.g. Royal Blooms Floral Design"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="vendor-contact-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                id="vendor-contact-input"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="vendor-phone-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone
              </label>
              <input
                id="vendor-phone-input"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="vendor-quote-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Quotation Amount ({currency})
              </label>
              <input
                id="vendor-quote-input"
                type="number"
                min="0"
                value={quote}
                onChange={(e) => setQuote(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="vendor-status-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                id="vendor-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorBookingStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quote_received">Quote Received</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
