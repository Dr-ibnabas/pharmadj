export const formatFDJ = (montant: number | string): string => {
  const num = typeof montant === 'string' ? parseFloat(montant) : montant;
  return new Intl.NumberFormat('fr-DJ', {
    style: 'currency',
    currency: 'DJF',
    minimumFractionDigits: 0,
  }).format(num);
};

export const formatNumber = (n: number | string): string => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDateRelative = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const heures = Math.floor(diff / 3600000);
  const jours = Math.floor(diff / 86400000);

  if (minutes < 1) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (heures < 24) return `il y a ${heures}h`;
  if (jours < 7) return `il y a ${jours} j`;
  return formatDate(d);
};

export const joursAvantPeremption = (date: Date | string): number => {
  const d = new Date(date);
  const now = new Date();
  return Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const statutPeremption = (date: Date | string): 'perime' | 'urgent' | 'attention' | 'ok' => {
  const j = joursAvantPeremption(date);
  if (j < 0) return 'perime';
  if (j < 30) return 'urgent';
  if (j < 90) return 'attention';
  return 'ok';
};
