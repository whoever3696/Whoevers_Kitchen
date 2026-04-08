export interface ParsedReceiptItem {
  itemName: string;
  quantity: number;
  unit: string;
  price: number | null;
  confidence: 'high' | 'medium' | 'low';
  rawLine: string;
}

export interface ParsedReceipt {
  items: ParsedReceiptItem[];
  storeName: string | null;
  purchaseDate: string | null;
  totalAmount: number | null;
}

const SKIP_KEYWORDS = [
  'subtotal',
  'total',
  'tax',
  'hst',
  'gst',
  'pst',
  'balance',
  'change',
  'cash',
  'credit',
  'debit',
  'visa',
  'mastercard',
  'amex',
  'payment',
  'tender',
  'receipt',
  'thank you',
  'thanks',
  'store',
  'address',
  'phone',
  'tel:',
  'www.',
  'http',
  'cashier',
  'clerk',
  'transaction',
  'card',
  'approved',
  'invoice',
];

const COMMON_UNITS = ['lb', 'lbs', 'oz', 'kg', 'g', 'ml', 'l', 'ct', 'count', 'ea', 'each', 'pc', 'pcs'];

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const items: ParsedReceiptItem[] = [];
  let storeName: string | null = null;
  let purchaseDate: string | null = null;
  let totalAmount: number | null = null;

  storeName = extractStoreName(lines);
  purchaseDate = extractDate(lines);
  totalAmount = extractTotal(lines);

  for (const line of lines) {
    if (shouldSkipLine(line)) {
      continue;
    }

    const item = parseLineItem(line);
    if (item) {
      items.push(item);
    }
  }

  return {
    items,
    storeName,
    purchaseDate,
    totalAmount,
  };
}

function extractStoreName(lines: string[]): string | null {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 50 && !line.match(/\d{3,}/)) {
      return line;
    }
  }
  return null;
}

function extractDate(lines: string[]): string | null {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (\d{1,2}),? (\d{4})/i,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  return null;
}

function extractTotal(lines: string[]): number | null {
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const line = lines[i].toLowerCase();
    if (line.includes('total') && !line.includes('subtotal')) {
      const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (priceMatch) {
        return parseFloat(priceMatch[1]);
      }
    }
  }
  return null;
}

function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();

  for (const keyword of SKIP_KEYWORDS) {
    if (lowerLine.includes(keyword)) {
      return true;
    }
  }

  if (line.length < 3) {
    return true;
  }

  if (line.match(/^[\d\s\-\.\*]+$/)) {
    return true;
  }

  return false;
}

function parseLineItem(line: string): ParsedReceiptItem | null {
  const priceMatch = line.match(/\$?\s*(\d+\.\d{2})\s*$/);
  if (!priceMatch) {
    return null;
  }

  const price = parseFloat(priceMatch[1]);
  const itemText = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();

  if (itemText.length < 2) {
    return null;
  }

  const { itemName, quantity, unit } = extractQuantityAndUnit(itemText);

  const confidence = determineConfidence(itemName, price);

  return {
    itemName,
    quantity,
    unit,
    price,
    confidence,
    rawLine: line,
  };
}

function extractQuantityAndUnit(text: string): { itemName: string; quantity: number; unit: string } {
  const quantityPatterns = [
    /(\d+\.?\d*)\s*(lb|lbs|oz|kg|g|ml|l|ct|count)\b/i,
    /(\d+)\s*x\b/i,
    /^(\d+\.?\d*)\s+/,
  ];

  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const quantity = parseFloat(match[1]);
      const unit = match[2] ? match[2].toLowerCase() : 'ea';
      const itemName = text.replace(match[0], '').trim();

      if (itemName.length > 1) {
        return { itemName, quantity, unit };
      }
    }
  }

  return { itemName: text, quantity: 1, unit: 'ea' };
}

function determineConfidence(itemName: string, price: number | null): 'high' | 'medium' | 'low' {
  let score = 0;

  if (itemName.length >= 3) score++;
  if (itemName.match(/^[a-zA-Z]/)) score++;
  if (price !== null && price > 0 && price < 1000) score++;
  if (!itemName.match(/[^a-zA-Z0-9\s\-\.]/)) score++;

  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}
