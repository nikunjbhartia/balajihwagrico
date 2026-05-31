export function navigate(hash) {
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}

export default navigate;
