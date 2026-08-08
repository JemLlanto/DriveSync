export const sanitizeNumberInput = (input: string): string => {
  let value = input.replace(/,/g, "");

  // Keep only digits and one decimal point
  value = value.replace(/[^0-9.]/g, "");

  // Allow only one decimal point
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places to 2
  if (parts[1]) {
    value = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
};

export const formatNumber = (
  value: string | number | null | undefined,
): string => {
  if (!value) return "";

  const raw = String(value).replace(/,/g, "");

  if (isNaN(Number(raw))) return "";

  const [whole, decimal] = raw.split(".");

  const formattedWhole = Number(whole).toLocaleString("en-US");

  return decimal !== undefined
    ? `${formattedWhole}.${decimal}`
    : formattedWhole;
};

export const formatRelativeDate = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "";

  const now = new Date();
  const target = new Date(date);

  const diff = now.getTime() - target.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(diff / year);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export const roundUp2 = (num: number) => Math.ceil(num * 100) / 100;
