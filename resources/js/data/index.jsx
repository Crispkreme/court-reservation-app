import { FileSpreadsheet, Truck, ClipboardList, FileText, ReceiptText } from 'lucide-react';

export const departments = [
    'Administration',
    'Engineering',
    'Procurement',
    'Operations',
    'Finance',
    'Human Resources',
    'Business Development',
    'IT',
];

export const inputClass = `
    w-full rounded-xl border border-[#DCE7DA]
    bg-[#FAFCF9] px-4 py-3 text-sm text-[#173D2A]
    outline-none transition
    focus:border-[#20854C] focus:ring-4 focus:ring-[#DFF1DE]
`;

export const STORAGE_KEY = 'albusat_portal_settings';

export const defaultSettings = {
    // General Settings
    applicationName: 'Al Busat Company Portal',
    timezone: 'Asia/Dubai',
    dateFormat: 'DD/MM/YYYY',

    // Quotation Settings
    currency: 'PHP',
    validityDays: '30',
    vatApplicable: true,
    vatRate: '5',

    // Notification Settings
    emailNotifications: true,
    quotationAlerts: true,
    systemNotifications: true,
    portalHeader: 'Al Busat Company Portal',
    portalSubHeader: 'Internal management and operations portal',
    portalLogo: '',
};

export const defaultCompany = {
    name: '',
    landmark: '',
    address: '',
    phone: '',
    fax: '',
    website: '',
    trn: '',
};

export const normalizeCompany = (company = {}) => ({
    name: company?.name ?? '',
    landmark: company?.landmark ?? '',
    address: company?.address ?? '',
    phone: company?.phone ?? '',
    fax: company?.fax ?? '',
    website: company?.website ?? '',
    trn: company?.trn ?? '',
});

export const currencyOptions = [
    { label: 'PHP', value: 'PHP' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
];

export const timezoneOptions = [
    { label: 'UAE (Asia/Dubai)', value: 'Asia/Dubai' },
    { label: 'UTC', value: 'UTC' },
];

export const dateFormatOptions = [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
];

export const quotationDocuments = [
    {
        id: 'commercial-invoice',
        title: 'Commercial Invoice',
        description: 'Manage commercial invoices for sales and transactions.',
        icon: FileSpreadsheet,
        path: '/admin/quotation/commercial-invoice',
    },
    {
        id: 'delivery-note',
        title: 'Delivery Note',
        description: 'Manage delivery records and document goods received.',
        icon: Truck,
        path: '/admin/quotations/delivery-note',
    },
    {
        id: 'proforma',
        title: 'Proforma Invoice',
        description: 'Prepare preliminary invoices before confirming an order.',
        icon: ClipboardList,
        path: '/admin/quotations/proforma',
    },
    {
        id: 'quotation',
        title: 'Quotation',
        description: 'Prepare and manage customer quotations and proposals.',
        icon: FileText,
        path: '/admin/quotations/quotation',
    },
    {
        id: 'tax-invoice',
        title: 'Tax Invoice',
        description: 'Prepare and manage official tax invoices.',
        icon: ReceiptText,
        path: '/admin/quotations/tax-invoice',
    },
];