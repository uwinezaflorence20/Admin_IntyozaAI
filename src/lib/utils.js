import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString, lang = 'en') {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    
    const monthNamesEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const monthNamesRw = [
      "Mutarama", "Gashyantare", "Werurwe", "Mata", "Gicurasi", "Kamena",
      "Nyakanga", "Kanama", "Nzeri", "Ukwakira", "Ugushyingo", "Ukuboza"
    ];
    
    const month = lang === 'rw' ? monthNamesRw[date.getMonth()] : monthNamesEn[date.getMonth()];
    
    return `${day} ${month} ${year}`;
  } catch {
    return dateString.split('T')[0];
  }
}

export const getText = (val, lang = 'en') => {
  if (!val) return '';
  let parsed = val;
  if (typeof val === 'string') {
    try {
      parsed = JSON.parse(val);
    } catch {
      return val;
    }
  }
  if (typeof parsed === 'string') return parsed;
  return parsed[lang] || parsed.en || '';
};

/** "5 min ago", "3 h ago", "2 days ago", then a short date. */
export function timeAgo(dateString) {
  if (!dateString) return '—';
  const minutes = Math.round((Date.now() - new Date(dateString).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
