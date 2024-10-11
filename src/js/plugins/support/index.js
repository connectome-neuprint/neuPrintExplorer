export { default as TablePaginationActions } from './TablePaginationActions';
export { default as SunburstLoader } from './SunburstLoader';
export { default as SunburstFormatter } from './SunburstFormatter';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as SkeletonFormatter } from './SkeletonFormatter';
export { default as RoiInfoTip } from './RoiInfoTip';

export function metaInfoError(error) {
  return {
    type: 'META_INFO_ERROR',
    error
  };
}

export function sortRois(a, b) {
  const aStartsWithLetter = a.charAt(0).match(/[a-z]/i);
  const bStartsWithLetter = b.charAt(0).match(/[a-z]/i);
  if (aStartsWithLetter && !bStartsWithLetter) return -1;
  if (bStartsWithLetter && !aStartsWithLetter) return 1;
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  // Get YIQ ratio
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return (yiq >= 128) ? darkColor : lightColor;
}
