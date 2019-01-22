export function saveStorage(key, value) {
    try {
      return window.localStorage.setItem(key , value);
    } catch (error) {
      
    }
}

export function getStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    
  }
}

export function clearStorage(key = false) {
  try {
    if (key === false) {
      return window.localStorage.clear();
    }
    return window.localStorage.removeItem(key);
  } catch (error) {
    
  }
}