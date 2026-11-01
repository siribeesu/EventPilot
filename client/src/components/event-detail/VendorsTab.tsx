import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EventFullDetail } from '../../types';

interface VendorsTabProps {
  event: EventFullDetail;
  currency: string;
  onOpenAddVendorModal: () => void;
  onDeleteVendor: (vendorId: string) => void;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({
  event,
  currency,
  onOpenAddVendorModal,
  onDeleteVendor,
}) => {
  return (
    <div
      role="tabpanel"
      id="panel-vendors"
      aria-labelledby="tab-vendors"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Vendor Management & Quotation Compare</h2>
          <p className="text-xs text-slate-500">
            Track contractor contacts, compare quotes, and monitor booking confirmations.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddVendorModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {event.vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {vendor.category}
                </span>
                {vendor.is_ai_estimate ? (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    AI Estimate
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Manual Quote
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base">{vendor.name}</h3>

              <div className="text-xs text-slate-500 space-y-1">
                {vendor.contact_name && <div>Contact: {vendor.contact_name}</div>}
                {vendor.contact_phone && <div>Phone: {vendor.contact_phone}</div>}
                {vendor.notes && <div className="italic text-slate-400 mt-1">{vendor.notes}</div>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Quote / Budget</span>
                <span className="text-sm font-bold text-indigo-700">
                  {currency}{' '}
                  {Number(vendor.quoted_amount > 0 ? vendor.quoted_amount : vendor.estimated_budget).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                  {vendor.booking_status}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteVendor(vendor.id)}
                  aria-label={`Delete vendor ${vendor.name}`}
                  className="text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 p-1 rounded transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
