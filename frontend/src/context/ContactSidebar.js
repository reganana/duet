export function toggleContactSidebar() {
  var sidebar = document.getElementById('contact-sidebar');
  if (sidebar.style.display === 'none' || sidebar.style.display === '') {
    sidebar.style.display = 'block';
  } else {
    sidebar.style.display = 'none';
  }
}