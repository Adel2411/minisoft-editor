export function useNotifications(theme: "dark" | "light") {
  
  const showNotification = (message: string, isError = false) => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300 flex items-center gap-2 ${
      isError
        ? theme === "dark"
          ? "bg-red-900 text-red-100 border border-red-800"
          : "bg-red-100 text-red-800 border border-red-200"
        : theme === "dark"
          ? "bg-[#312c28] text-gray-200 border border-[#3e3632]"
          : "bg-white text-gray-800 border border-[#efe0d9]"
    }`;

    // Add icon
    const icon = document.createElement("span");
    if (isError) {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    }

    const textNode = document.createElement("span");
    textNode.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(textNode);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return { showNotification };
}
