// Vietnam Provinces API Helper
const API_BASE = 'https://provinces.open-api.vn/api';

export const getProvinces = async () => {
  try {
    const response = await fetch(`${API_BASE}/p/`);
    const data = await response.json();
    return data.map(p => ({ code: p.code, name: p.name }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

export const getDistricts = async (provinceCode) => {
  try {
    const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
    const data = await response.json();
    return data.districts.map(d => ({ code: d.code, name: d.name }));
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

export const getWards = async (districtCode) => {
  try {
    const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
    const data = await response.json();
    return data.wards.map(w => ({ code: w.code, name: w.name }));
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
};
