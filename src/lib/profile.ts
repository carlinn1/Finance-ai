export const PROFILE_PHOTO_KEY = "financeai_profile_photo";
export const PROFILE_PHOTO_EVENT = "financeai:profile-photo-changed";

export function getProfilePhoto() {
  return localStorage.getItem(PROFILE_PHOTO_KEY);
}

export function saveProfilePhoto(photo: string | null) {
  if (photo) localStorage.setItem(PROFILE_PHOTO_KEY, photo);
  else localStorage.removeItem(PROFILE_PHOTO_KEY);
  window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_EVENT, { detail: photo }));
}
