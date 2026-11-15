import { getLocalDate } from '@utils';

export function blankInvoice() {
    return {
        issueDate: getLocalDate,
        expirationDate: "",
        documentNo: "",

        // Customer Information
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        customerFax: "",
        customerTrn: "",

        // Contact Information
        contactName: "",
        contactPhone: "",
        contactMobile: "",
        contactEmail: "",

        // Shipping Details
        freightType: "",
        shipDate: "",
        deliveryDate: "",
        estimatedWeight: "",
        packages: "",

        // Terms
        validity: "",
        paymentTerms: "",
        deliveryTerms: "",

        // Financial Information
        currency: "AED",
        vatApplicable: true,
        vatRate: "5",

        insurance: "",
        legal: "",
        inspection: "",
        other: "",

        // Bank Account 1
        bank1Beneficiary: "",
        bank1Name: "",
        bank1Account: "",
        bank1Iban: "",
        bank1Swift: "",

        // Bank Account 2
        bank2Beneficiary: "",
        bank2Name: "",
        bank2Account: "",
        bank2Iban: "",
        bank2Swift: "",

        // Notes
        notes:
            "Thank you for the opportunity to submit our quotation. " +
            "We look forward to your confirmation and the issuance of your PO " +
            "to proceed accordingly.",
    };
}
